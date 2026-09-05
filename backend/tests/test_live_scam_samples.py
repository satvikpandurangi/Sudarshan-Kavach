"""Tests for real-world scam inputs: betting/rummy lures, shortened gambling URLs, and official platform checks."""

from __future__ import annotations

from app.pipeline.analyzer import analyze
from app.schemas import Confidence, RiskLevel


def test_rummy_shortener_url_detected_as_dangerous():
    res = analyze("https://rummyc.co/PTR241")
    assert res.risk_level == RiskLevel.dangerous
    assert res.risk_score is not None and res.risk_score >= 80
    assert res.confidence == Confidence.high
    sig_ids = {s.id for s in res.signals}
    assert "url_shortener" in sig_ids
    assert "unregulated_gambling_domain" in sig_ids
    assert "lookalike_domain" in sig_ids


def test_rummy_tournament_suv_prize_message_detected_as_dangerous():
    msg = (
        "Play Rummy, Win 1st Prize: SUV Car\n"
        "Join 'Prime Time Rummy Tournament' on RummyCircle\n"
        "Total Prize: Rs. 25 LAKH\n"
        "Register Now - https://rummyc.co/PTR241"
    )
    res = analyze(msg)
    assert res.risk_level == RiskLevel.dangerous
    assert res.risk_score is not None and res.risk_score >= 80
    assert res.confidence == Confidence.high
    sig_ids = {s.id for s in res.signals}
    assert "unsolicited_prize" in sig_ids
    assert "gambling_betting_lure" in sig_ids
    assert "url_shortener" in sig_ids


def test_official_sudarshan_kavach_recognized_as_safe():
    res = analyze("https://sudarshan-kavach.vercel.app")
    assert res.risk_level == RiskLevel.safe
    assert res.risk_score == 0
    assert res.confidence == Confidence.high
    assert len(res.signals) == 0
    assert "Sudarshan Kavach" in (res.summary or "")
