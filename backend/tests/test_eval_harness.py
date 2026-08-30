"""Tests for the evaluation harness itself — metric math, grounding check,
CSV IO, and mode reporting. These do not depend on detector behaviour."""

from __future__ import annotations

from pathlib import Path

import pytest

from app.schemas import SignalOut, Severity
from eval.harness import (
    EvalOutcome,
    compute_metrics,
    is_output_grounded,
    load_dataset,
    make_reasoner,
    target_report,
    write_results,
)


def _outcome(id, label, cat, level, grounded=True, signals=1):
    from eval.harness import FLAGGED

    return EvalOutcome(
        id=id,
        true_label=label,
        category=cat,
        predicted_level=level,
        flagged=level in FLAGGED,
        grounded=grounded,
        signal_count=signals,
        degraded=True,
    )


# --------------------------------------------------------------------------- #
# Metric math
# --------------------------------------------------------------------------- #
def test_detection_and_fp_rates():
    outcomes = [
        _outcome("s1", "scam", "a", "dangerous"),
        _outcome("s2", "scam", "a", "suspicious"),
        _outcome("s3", "scam", "a", "safe"),          # missed
        _outcome("s4", "scam", "a", "cannot_determine"),  # missed
        _outcome("l1", "legit", "b", "safe"),
        _outcome("l2", "legit", "b", "suspicious"),   # false positive
        _outcome("l3", "legit", "b", "safe"),
        _outcome("l4", "legit", "b", "safe"),
    ]
    m = compute_metrics(outcomes, "deterministic")
    assert m.n_scam == 4 and m.n_legit == 4
    assert m.detection_rate == 0.5          # 2 of 4 scams flagged
    assert m.false_positive_rate == 0.25    # 1 of 4 legit flagged


def test_dangerous_precision():
    outcomes = [
        _outcome("s1", "scam", "a", "dangerous"),
        _outcome("s2", "scam", "a", "dangerous"),
        _outcome("l1", "legit", "b", "dangerous"),  # a legit wrongly dangerous
    ]
    m = compute_metrics(outcomes, "deterministic")
    assert m.dangerous_precision == pytest.approx(2 / 3)


def test_cannot_determine_rate():
    outcomes = [
        _outcome("a", "scam", "a", "cannot_determine"),
        _outcome("b", "legit", "b", "safe"),
        _outcome("c", "legit", "b", "safe"),
        _outcome("d", "legit", "b", "safe"),
    ]
    m = compute_metrics(outcomes, "deterministic")
    assert m.cannot_determine_rate == 0.25


def test_groundedness_only_counts_signalled_outputs():
    outcomes = [
        _outcome("a", "scam", "a", "dangerous", grounded=True, signals=2),
        _outcome("b", "scam", "a", "suspicious", grounded=False, signals=1),
        _outcome("c", "legit", "b", "safe", grounded=True, signals=0),  # excluded
    ]
    m = compute_metrics(outcomes, "deterministic")
    # Two outputs had signals; one grounded -> 0.5. The zero-signal row is skipped.
    assert m.groundedness == 0.5
    assert m.groundedness_sample_size == 2


def test_empty_dangerous_precision_is_zero_not_crash():
    outcomes = [_outcome("a", "scam", "a", "suspicious")]
    m = compute_metrics(outcomes, "deterministic")
    assert m.dangerous_precision == 0.0


# --------------------------------------------------------------------------- #
# Target report
# --------------------------------------------------------------------------- #
def test_target_report_pass_fail():
    outcomes = (
        [_outcome(f"s{i}", "scam", "a", "dangerous") for i in range(9)]
        + [_outcome("s9", "scam", "a", "safe")]  # 90% detection
        + [_outcome(f"l{i}", "legit", "b", "safe") for i in range(10)]
    )
    m = compute_metrics(outcomes, "deterministic")
    rep = target_report(m)
    assert rep["detection_rate"]["pass"] is True       # 90% >= 85%
    assert rep["false_positive_rate"]["pass"] is True   # 0% <= 10%
    assert rep["groundedness"]["pass"] is True


def test_target_report_flags_range_metric():
    outcomes = [_outcome("a", "scam", "a", "cannot_determine")] + [
        _outcome(f"l{i}", "legit", "b", "safe") for i in range(9)
    ]
    m = compute_metrics(outcomes, "deterministic")
    rep = target_report(m)
    # CD rate = 1/10 = 10% -> within 10-20% target.
    assert rep["cannot_determine_rate"]["pass"] is True


# --------------------------------------------------------------------------- #
# Grounding check
# --------------------------------------------------------------------------- #
def test_is_output_grounded_true():
    text = "Please share your OTP now at http://x.co"
    signals = [SignalOut(id="a", severity=Severity.high, evidence="share your OTP", explanation="x")]
    assert is_output_grounded(text, signals) is True


def test_is_output_grounded_false_on_fabricated_evidence():
    text = "Hello there"
    signals = [SignalOut(id="a", severity=Severity.high, evidence="not in the text", explanation="x")]
    assert is_output_grounded(text, signals) is False


def test_is_output_grounded_false_on_empty_evidence():
    text = "Hello"
    signals = [SignalOut(id="a", severity=Severity.high, evidence="", explanation="x")]
    assert is_output_grounded(text, signals) is False


# --------------------------------------------------------------------------- #
# CSV IO
# --------------------------------------------------------------------------- #
def test_load_dataset_roundtrip(tmp_path):
    p = tmp_path / "d.csv"
    p.write_text(
        "id,text,true_label,category,source\n"
        'x1,"hello world",scam,cat_a,src\n'
        'x2,"another one",legit,cat_b,src\n',
        encoding="utf-8",
    )
    rows = load_dataset(p)
    assert len(rows) == 2
    assert rows[0].id == "x1" and rows[0].true_label == "scam"
    assert rows[1].category == "cat_b"


def test_write_results(tmp_path):
    outcomes = [_outcome("a", "scam", "cat", "dangerous")]
    p = tmp_path / "r.csv"
    write_results(outcomes, p)
    content = p.read_text(encoding="utf-8")
    assert "id,true_label,category,predicted_level" in content
    assert "a,scam,cat,dangerous,1" in content


# --------------------------------------------------------------------------- #
# Mode reporting
# --------------------------------------------------------------------------- #
def test_make_reasoner_deterministic_default():
    reasoner, mode = make_reasoner("deterministic")
    assert mode == "deterministic"
    assert reasoner is not None


def test_make_reasoner_anthropic_without_key_degrades(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    reasoner, mode = make_reasoner("anthropic")
    assert "deterministic" in mode  # honestly reports the resolved mode
    assert "no ANTHROPIC_API_KEY" in mode


def test_real_dataset_loads_and_is_balanced():
    root = Path(__file__).resolve().parent.parent
    rows = load_dataset(root / "eval" / "dataset.csv")
    assert len(rows) == 100
    assert sum(1 for r in rows if r.true_label == "scam") == 50
    assert sum(1 for r in rows if r.true_label == "legit") == 50
