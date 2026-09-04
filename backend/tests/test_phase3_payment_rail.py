"""Tests for Phase 3: India-specific payment rail detection and arbitration."""

from __future__ import annotations

import pytest

from app.pipeline.analyzer import analyze
from app.pipeline.arbitration import arbitrate, build_recommended_action
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import ReasoningResult
from app.pipeline.signals import patterns, brand_lookalike, url_inspector
from app.schemas import Confidence, RiskLevel, Severity, Signal


def _detect_patterns(text: str) -> dict[str, Signal]:
    n = normalize(text)
    return {s.id: s for s in patterns.detect(n)}


# --------------------------------------------------------------------------- #
# 1. collect_request_to_receive
# --------------------------------------------------------------------------- #
def test_collect_request_to_receive_explanation_and_evidence():
    text = "Please approve the collect request to receive your Rs 2000 cashback"
    sigs = _detect_patterns(text)
    assert "collect_request_to_receive" in sigs
    sig = sigs["collect_request_to_receive"]
    assert sig.severity == Severity.high
    # Mandatory mechanic explanation
    assert (
        "Your UPI PIN is only ever needed to SEND money. Nothing that pays "
        "you into your account will ask for it. If a request needs your PIN, "
        "it is taking money, not giving it." in sig.detail
    )
    # Evidence is a literal substring
    assert sig.evidence in text


def test_collect_request_scan_qr_to_receive():
    text = "Scan this QR code to receive Rs 1500 reward in your bank account"
    sigs = _detect_patterns(text)
    assert "collect_request_to_receive" in sigs
    sig = sigs["collect_request_to_receive"]
    assert sig.severity == Severity.high
    assert sig.evidence in text


# --------------------------------------------------------------------------- #
# 2. upi_pin_requested
# --------------------------------------------------------------------------- #
def test_upi_pin_requested_any_credential():
    t1 = "Please enter your UPI PIN to verify your account"
    s1 = _detect_patterns(t1)
    assert "upi_pin_requested" in s1
    assert s1["upi_pin_requested"].severity == Severity.high
    assert s1["upi_pin_requested"].evidence in t1

    t2 = "Share your OTP and netbanking password immediately"
    s2 = _detect_patterns(t2)
    assert "upi_pin_requested" in s2
    assert s2["upi_pin_requested"].evidence in t2


# --------------------------------------------------------------------------- #
# 3. refund_reversal_bait
# --------------------------------------------------------------------------- #
def test_refund_reversal_bait():
    text = "I sent Rs 10,000 by mistake to your UPI. Please return the excess amount."
    sigs = _detect_patterns(text)
    assert "refund_reversal_bait" in sigs
    sig = sigs["refund_reversal_bait"]
    assert sig.severity == Severity.high
    assert sig.evidence in text


# --------------------------------------------------------------------------- #
# 4. unknown_vpa_payment
# --------------------------------------------------------------------------- #
def test_unknown_vpa_payment():
    text = "Please pay your electricity bill of Rs 850 to electric.desk@okaxis"
    sigs = _detect_patterns(text)
    assert "unknown_vpa_payment" in sigs
    sig = sigs["unknown_vpa_payment"]
    assert sig.severity == Severity.medium
    # Must quote the exact VPA as evidence
    assert sig.evidence == "electric.desk@okaxis"


# --------------------------------------------------------------------------- #
# 5. lookalike_domain
# --------------------------------------------------------------------------- #
def test_lookalike_domain_includes_real_domain():
    n = normalize("Verify your account at http://sbi-banking-secure.online/kyc")
    sigs = {s.id: s for s in brand_lookalike.detect(n)}
    assert "lookalike_domain" in sigs
    sig = sigs["lookalike_domain"]
    assert sig.severity == Severity.high
    # Real official domain must be named
    assert "onlinesbi" in sig.detail.lower() or "sbi.co.in" in sig.detail.lower()


# --------------------------------------------------------------------------- #
# 7. advance_fee
# --------------------------------------------------------------------------- #
def test_advance_fee_loan_and_job():
    text1 = "Pay refundable processing fee of Rs 999 before loan sanction"
    s1 = _detect_patterns(text1)
    assert "advance_fee" in s1
    assert s1["advance_fee"].severity == Severity.high
    assert s1["advance_fee"].evidence in text1


# --------------------------------------------------------------------------- #
# 8. urgency_pressure
# --------------------------------------------------------------------------- #
def test_urgency_pressure_alone_does_not_fire():
    text = "Please respond immediately today without fail"
    s = _detect_patterns(text)
    assert "urgency_pressure" not in s


def test_urgency_pressure_fires_with_payment():
    text = "Pay Rs 500 immediately today or your account will be suspended"
    s = _detect_patterns(text)
    assert "urgency_pressure" in s
    assert s["urgency_pressure"].severity == Severity.medium


# --------------------------------------------------------------------------- #
# Arbitration tests
# --------------------------------------------------------------------------- #
def _mock_reasoning(signals, proposed_level=None):
    return ReasoningResult(
        signals=signals,
        summary=None,
        proposed_level=proposed_level,
        proposed_confidence=None,
        degraded=False,
    )


def test_arbitration_two_high_signals_dangerous():
    s1 = Signal(id="advance_fee", severity=Severity.high, evidence="fee")
    s2 = Signal(id="refund_reversal_bait", severity=Severity.high, evidence="mistake")
    n = normalize("Sample text for arbitration")
    level, _, _ = arbitrate(n, [s1, s2], _mock_reasoning([s1, s2]))
    assert level == RiskLevel.dangerous


def test_arbitration_one_high_signal_at_least_suspicious():
    s1 = Signal(id="advance_fee", severity=Severity.high, evidence="fee")
    n = normalize("Sample text for arbitration")
    level, _, _ = arbitrate(n, [s1], _mock_reasoning([s1]))
    assert level == RiskLevel.suspicious


def test_arbitration_explicit_max_never_deescalates():
    # Signals say dangerous (2 high signals)
    s1 = Signal(id="advance_fee", severity=Severity.high, evidence="fee")
    s2 = Signal(id="lookalike_domain", severity=Severity.high, evidence="domain")
    n = normalize("Sample text for arbitration")
    # Model hallucinated safe
    level, _, _ = arbitrate(n, [s1, s2], _mock_reasoning([s1, s2], proposed_level=RiskLevel.safe))
    # Must remain dangerous!
    assert level == RiskLevel.dangerous


def test_arbitration_model_can_escalate():
    # Signals say suspicious (1 medium signal)
    s1 = Signal(id="unknown_vpa_payment", severity=Severity.medium, evidence="vpa")
    n = normalize("Sample text for arbitration")
    # Model escalates to dangerous
    level, _, _ = arbitrate(n, [s1], _mock_reasoning([s1], proposed_level=RiskLevel.dangerous))
    assert level == RiskLevel.dangerous


# --------------------------------------------------------------------------- #
# 4th Risk Tier: Cannot Determine & Tailored Checklists
# --------------------------------------------------------------------------- #
def test_cannot_determine_empty_signals_and_tailored_checklist():
    # Ambiguous/conflicting: official URL + high scam text -> cannot_determine
    text = "Please log in at https://netbanking.hdfcbank.com and share your OTP now"
    res = analyze(text)
    assert res.risk_level == RiskLevel.cannot_determine
    # Prompt rule: return manual verification checklist instead of signals
    assert len(res.signals) == 0
    # Tailored checklist for bank claim
    assert len(res.recommended_action.steps) >= 2
    steps_joined = " ".join(res.recommended_action.steps).lower()
    assert "debit card" in steps_joined or "official app" in steps_joined


def test_cannot_determine_job_checklist():
    text = "Inquiry regarding your resume submission Acme Corp"
    n = normalize(text)
    # Ambiguous without signals
    action = build_recommended_action(RiskLevel.cannot_determine, [], "en", n)
    steps_joined = " ".join(action.steps).lower()
    assert len(action.steps) >= 2
