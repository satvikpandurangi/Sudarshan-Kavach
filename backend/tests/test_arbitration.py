"""Arbitration tests: the four-tier table and the model-cannot-de-escalate rule."""

from __future__ import annotations

from app.pipeline import arbitration
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import ReasoningResult
from app.schemas import Confidence, RiskLevel, Severity, Signal


def _sig(sev, sid="x", ev="evidence"):
    return Signal(id=sid, severity=sev, evidence=ev)


def _reasoning(signals, level=None, confidence=None):
    return ReasoningResult(
        signals=signals,
        summary=None,
        proposed_level=level,
        proposed_confidence=confidence,
        degraded=False,
    )


def _arb(text, signals, level=None, confidence=None):
    n = normalize(text)
    return arbitration.arbitrate(n, signals, _reasoning(signals, level, confidence))


# --- signal-derived table -------------------------------------------------- #
def test_two_high_signals_dangerous():
    sigs = [_sig(Severity.high, "a"), _sig(Severity.high, "b")]
    level, _, _ = _arb("some message body here", sigs)
    assert level == RiskLevel.dangerous


def test_one_high_signal_min_suspicious():
    sigs = [_sig(Severity.high, "a")]
    level, _, _ = _arb("some message body here", sigs)
    assert level == RiskLevel.suspicious


def test_medium_only_suspicious():
    sigs = [_sig(Severity.medium, "a")]
    level, _, _ = _arb("some message body here", sigs)
    assert level == RiskLevel.suspicious


def test_no_signals_safe():
    level, _, _ = _arb("a perfectly ordinary long enough message", [])
    assert level == RiskLevel.safe


def test_low_only_safe():
    sigs = [_sig(Severity.low, "a")]
    level, _, _ = _arb("a perfectly ordinary long enough message", sigs)
    assert level == RiskLevel.safe


# --- the safety property --------------------------------------------------- #
def test_model_can_escalate():
    sigs = [_sig(Severity.medium, "a")]  # signals say suspicious
    level, _, _ = _arb("some message body here", sigs, level=RiskLevel.dangerous)
    assert level == RiskLevel.dangerous  # model raised it


def test_model_cannot_deescalate_dangerous():
    sigs = [_sig(Severity.high, "a"), _sig(Severity.high, "b")]  # signals say dangerous
    level, _, _ = _arb("some message body here", sigs, level=RiskLevel.safe)
    assert level == RiskLevel.dangerous  # model's "safe" is ignored


def test_model_cannot_deescalate_suspicious():
    sigs = [_sig(Severity.high, "a")]
    level, _, _ = _arb("some message body here", sigs, level=RiskLevel.safe)
    assert level == RiskLevel.suspicious


# --- cannot_determine ------------------------------------------------------ #
def test_too_short_cannot_determine():
    level, score, conf = _arb("Click here", [])
    assert level == RiskLevel.cannot_determine
    assert score is None
    assert conf == Confidence.low


def test_conflict_official_link_plus_high_content_cannot_determine():
    text = "Verify at https://onlinesbi.sbi and share your OTP now"
    sigs = [_sig(Severity.high, "credential_request", "share your OTP")]
    level, _, _ = _arb(text, sigs)
    assert level == RiskLevel.cannot_determine


def test_low_model_confidence_no_signals_cannot_determine():
    level, _, _ = _arb(
        "an ordinary message of sufficient length", [], confidence=Confidence.low
    )
    assert level == RiskLevel.cannot_determine
