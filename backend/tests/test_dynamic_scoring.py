"""Tests verifying dynamic, non-static risk score calculation across threat tiers."""

from __future__ import annotations

from app.pipeline.analyzer import analyze
from app.schemas import RiskLevel


def test_dynamic_scores_for_suspicious_not_static_55():
    # 1. Shortener URL alone
    res1 = analyze("Please track your courier shipment here: https://bit.ly/shipment-tracker-901")
    assert res1.risk_level == RiskLevel.suspicious
    assert res1.risk_score is not None
    assert 32 <= res1.risk_score <= 68

    # 2. UPI QR Code with unknown personal VPA
    qr_payload = "UPI Payment Request Particulars:\nPayee VPA: rajesh.kumar987@ybl\nAmount: Rs 1500"
    res2 = analyze(qr_payload)
    assert res2.risk_level == RiskLevel.suspicious
    assert res2.risk_score is not None
    assert 32 <= res2.risk_score <= 68

    # 3. Parcel delivery fee
    res3 = analyze("India Post: Your parcel is detained at Mumbai hub. Pay delivery charge Rs 48 immediately at https://tinyurl.com/parcel-48")
    assert res3.risk_level == RiskLevel.suspicious
    assert res3.risk_score is not None
    assert 32 <= res3.risk_score <= 68

    # Scores must be distinct and reflect signal weights, never just flat 55!
    scores = {res1.risk_score, res2.risk_score, res3.risk_score}
    assert len(scores) >= 2, f"Expected distinct scores, got {scores}"
    # Ensure they are not hardcoded to 55
    assert not all(s == 55 for s in scores)


def test_dynamic_scores_for_dangerous_not_static_88():
    # Multi-vector critical attack
    res1 = analyze(
        "SBI Urgent: Your debit card is blocked. Submit your UPI PIN and Netbanking password at https://sbi-unblock.top within 2 hours"
    )
    assert res1.risk_level == RiskLevel.dangerous
    assert res1.risk_score is not None
    assert res1.risk_score >= 85

    # Reverse charge deceit
    res2 = analyze(
        "You have won cash prize Rs 50,000! Scan QR code and enter your UPI PIN to receive money in your bank account"
    )
    assert res2.risk_level == RiskLevel.dangerous
    assert res2.risk_score is not None
    assert res2.risk_score >= 80

    scores = {res1.risk_score, res2.risk_score}
    assert not all(s == 88 for s in scores)


def test_dynamic_scores_for_safe_and_official():
    # Official portal
    res_off = analyze("https://sudarshan-kavach.vercel.app")
    assert res_off.risk_level == RiskLevel.safe
    assert res_off.risk_score == 0

    # Clean text
    res_clean = analyze("Hi Priya, could you please send me the meeting notes from yesterday's presentation?")
    assert res_clean.risk_level == RiskLevel.safe
    assert res_clean.risk_score is not None
    assert 2 <= res_clean.risk_score <= 12

    # Low severity (generic greeting)
    res_low = analyze("Dear Customer, our branch working hours will be 10am to 4pm on Saturday.")
    assert res_low.risk_level == RiskLevel.safe
    assert res_low.risk_score is not None
    assert 12 <= res_low.risk_score <= 28


def test_cannot_determine_score_is_none():
    res_cd = analyze("Please call")
    assert res_cd.risk_level == RiskLevel.cannot_determine
    assert res_cd.risk_score is None
