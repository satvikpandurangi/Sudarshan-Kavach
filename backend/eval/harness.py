"""Evaluation harness (evaluation.md).

Runs every dataset message through the real analyze() pipeline, records the
result, and computes the documented metrics. Pure metric functions are separated
from IO so they can be unit-tested.

Reproducible: same dataset + same reasoner mode -> same numbers. Domain ages come
from a fixed map (eval/domain_ages.py), so there is no network dependency and the
run is repeatable after any detector/prompt change.

Modes:
  - deterministic (default): the DeterministicReasoner. No API key, no network.
  - anthropic: the model-backed reasoner (requires ANTHROPIC_API_KEY). The mode
    is recorded in the output so results are never ambiguous about their source.
"""

from __future__ import annotations

import csv
import dataclasses
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from app.pipeline import domain_age
from app.pipeline.analyzer import analyze
from app.pipeline.reasoning import DeterministicReasoner, Reasoner
from app.schemas import RiskLevel

# Risk levels that count as "flagged" for detection / false-positive purposes
# (evaluation.md: flagged = Suspicious or Dangerous).
FLAGGED = {RiskLevel.suspicious.value, RiskLevel.dangerous.value}

TARGETS = {
    "detection_rate": (">=", 0.85),
    "false_positive_rate": ("<=", 0.10),
    "dangerous_precision": (">=", 0.90),
    "cannot_determine_rate": ("range", (0.10, 0.20)),
    "groundedness": ("==", 1.0),
}


# --------------------------------------------------------------------------- #
# Records
# --------------------------------------------------------------------------- #
@dataclass
class EvalRow:
    id: str
    text: str
    true_label: str  # "scam" | "legit"
    category: str
    source: str


@dataclass
class EvalOutcome:
    id: str
    true_label: str
    category: str
    predicted_level: str
    flagged: bool
    grounded: bool
    signal_count: int
    degraded: bool


@dataclass
class Metrics:
    n: int
    n_scam: int
    n_legit: int
    detection_rate: float
    false_positive_rate: float
    dangerous_precision: float
    cannot_determine_rate: float
    groundedness: float
    groundedness_sample_size: int
    mode: str
    per_category: Dict[str, Dict[str, float]] = field(default_factory=dict)


# --------------------------------------------------------------------------- #
# Dataset IO
# --------------------------------------------------------------------------- #
def load_dataset(path: str | Path) -> List[EvalRow]:
    rows: List[EvalRow] = []
    with open(path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            rows.append(
                EvalRow(
                    id=r["id"],
                    text=r["text"],
                    true_label=r["true_label"].strip().lower(),
                    category=r["category"].strip(),
                    source=r.get("source", "").strip(),
                )
            )
    return rows


# --------------------------------------------------------------------------- #
# Grounding check (evaluation.md: every quoted evidence is an exact substring)
# --------------------------------------------------------------------------- #
def is_output_grounded(text: str, signals) -> bool:
    """True if every signal's evidence is an exact substring of the input.

    `signals` is a list of SignalOut. Normalization only strips zero-width chars
    and applies NFKC, so evidence should still be a substring of the raw text for
    the plain messages in the evaluation set; we check against the raw text to be
    strict about the user-facing claim.
    """
    for s in signals:
        if not s.evidence:
            return False
        if s.evidence not in text:
            return False
    return True


# --------------------------------------------------------------------------- #
# Running
# --------------------------------------------------------------------------- #
def run_dataset(
    rows: List[EvalRow],
    reasoner: Optional[Reasoner] = None,
    groundedness_sample: int = 20,
) -> List[EvalOutcome]:
    """Run each row through analyze() and collect outcomes.

    Groundedness is checked on the first `groundedness_sample` rows that actually
    produced signals (evaluation.md samples 20 outputs by hand; we check exactly
    that many programmatically).
    """
    outcomes: List[EvalOutcome] = []
    grounded_checked = 0
    for row in rows:
        result = analyze(row.text, "en", reasoner=reasoner)
        level = result.risk_level.value

        # Only spend the groundedness budget on outputs that have signals to
        # quote, up to the sample size.
        grounded = True
        if result.signals and grounded_checked < groundedness_sample:
            grounded = is_output_grounded(row.text, result.signals)
            grounded_checked += 1

        outcomes.append(
            EvalOutcome(
                id=row.id,
                true_label=row.true_label,
                category=row.category,
                predicted_level=level,
                flagged=level in FLAGGED,
                grounded=grounded,
                signal_count=len(result.signals),
                degraded=bool(result.degraded),
            )
        )
    return outcomes


# --------------------------------------------------------------------------- #
# Metrics (pure)
# --------------------------------------------------------------------------- #
def _rate(numerator: int, denominator: int) -> float:
    return numerator / denominator if denominator else 0.0


def compute_metrics(
    outcomes: List[EvalOutcome], mode: str, groundedness_sample: int = 20
) -> Metrics:
    scams = [o for o in outcomes if o.true_label == "scam"]
    legits = [o for o in outcomes if o.true_label == "legit"]

    # Detection rate: fraction of scams flagged (suspicious/dangerous).
    detected = sum(1 for o in scams if o.flagged)
    detection_rate = _rate(detected, len(scams))

    # False positive rate: fraction of legit messages flagged.
    false_positives = sum(1 for o in legits if o.flagged)
    false_positive_rate = _rate(false_positives, len(legits))

    # Dangerous-tier precision: of everything marked dangerous, fraction that
    # were truly scams.
    marked_dangerous = [o for o in outcomes if o.predicted_level == RiskLevel.dangerous.value]
    dangerous_true = sum(1 for o in marked_dangerous if o.true_label == "scam")
    dangerous_precision = _rate(dangerous_true, len(marked_dangerous))

    # Cannot Determine rate: fraction of ALL messages we punted on.
    cd = sum(1 for o in outcomes if o.predicted_level == RiskLevel.cannot_determine.value)
    cannot_determine_rate = _rate(cd, len(outcomes))

    # Groundedness: of the outputs we checked, fraction fully grounded.
    checked = [o for o in outcomes if o.signal_count > 0][:groundedness_sample]
    grounded_count = sum(1 for o in checked if o.grounded)
    groundedness = _rate(grounded_count, len(checked)) if checked else 1.0

    # Per-category flag rate (detection for scams, false-positive for legit).
    per_category: Dict[str, Dict[str, float]] = {}
    cats = sorted({o.category for o in outcomes})
    for cat in cats:
        group = [o for o in outcomes if o.category == cat]
        flagged = sum(1 for o in group if o.flagged)
        per_category[cat] = {
            "n": float(len(group)),
            "flagged": float(flagged),
            "flag_rate": _rate(flagged, len(group)),
            "true_label_is_scam": 1.0 if group[0].true_label == "scam" else 0.0,
        }

    return Metrics(
        n=len(outcomes),
        n_scam=len(scams),
        n_legit=len(legits),
        detection_rate=detection_rate,
        false_positive_rate=false_positive_rate,
        dangerous_precision=dangerous_precision,
        cannot_determine_rate=cannot_determine_rate,
        groundedness=groundedness,
        groundedness_sample_size=len(checked),
        mode=mode,
        per_category=per_category,
    )


def target_report(metrics: Metrics) -> Dict[str, Dict[str, object]]:
    """Compare each metric against its documented target."""
    def check(op, value, target):
        if op == ">=":
            return value >= target
        if op == "<=":
            return value <= target
        if op == "==":
            return abs(value - target) < 1e-9
        if op == "range":
            lo, hi = target
            return lo <= value <= hi
        return False

    values = {
        "detection_rate": metrics.detection_rate,
        "false_positive_rate": metrics.false_positive_rate,
        "dangerous_precision": metrics.dangerous_precision,
        "cannot_determine_rate": metrics.cannot_determine_rate,
        "groundedness": metrics.groundedness,
    }
    report: Dict[str, Dict[str, object]] = {}
    for name, (op, target) in TARGETS.items():
        value = values[name]
        report[name] = {
            "value": value,
            "op": op,
            "target": target,
            "pass": check(op, value, target),
        }
    return report


# --------------------------------------------------------------------------- #
# Results IO
# --------------------------------------------------------------------------- #
def write_results(outcomes: List[EvalOutcome], path: str | Path) -> None:
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(
            ["id", "true_label", "category", "predicted_level", "flagged",
             "grounded", "signal_count", "degraded"]
        )
        for o in outcomes:
            writer.writerow(
                [o.id, o.true_label, o.category, o.predicted_level,
                 int(o.flagged), int(o.grounded), o.signal_count, int(o.degraded)]
            )


# --------------------------------------------------------------------------- #
# Reasoner selection for eval
# --------------------------------------------------------------------------- #
def make_reasoner(mode: str) -> tuple[Optional[Reasoner], str]:
    """Return (reasoner, resolved_mode).

    mode="deterministic" -> DeterministicReasoner (no key, no network).
    mode="anthropic"     -> model reasoner if ANTHROPIC_API_KEY set, else degrade
                            to deterministic and report the resolved mode honestly.
    """
    if mode == "anthropic":
        import os

        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                from app.pipeline.anthropic_reasoner import (
                    AnthropicReasoner,
                    _RealAnthropicClient,
                )

                client = _RealAnthropicClient(api_key=os.environ["ANTHROPIC_API_KEY"])
                return AnthropicReasoner(client=client), "anthropic"
            except Exception:
                return DeterministicReasoner(), "deterministic (anthropic unavailable)"
        return DeterministicReasoner(), "deterministic (no ANTHROPIC_API_KEY)"
    return DeterministicReasoner(), "deterministic"
