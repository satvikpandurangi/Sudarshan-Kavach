"""End-to-end pipeline tests with the model layer mocked.

Verifies the Phase 3 checkpoint through analyze(): all four tiers reachable, the
model cannot de-escalate a signal-derived verdict, localization applies, and the
system still works when the reasoning API is unavailable.
"""

from __future__ import annotations

import json

import pytest

from app.pipeline import domain_age
from app.pipeline.analyzer import analyze
from app.pipeline.anthropic_reasoner import AnthropicReasoner
from app.pipeline.reasoning import DeterministicReasoner
from app.schemas import RiskLevel

from .conftest import MockAnthropicClient


class _FakeAges:
    def __init__(self, d):
        self.d = d

    def age_days(self, dom):
        return self.d.get(dom)


def _reasoner(payload=None, *, raw=None, raises=None):
    if raises is not None:
        client = MockAnthropicClient(raises=raises)
    elif raw is not None:
        client = MockAnthropicClient(response=raw)
    else:
        client = MockAnthropicClient(response=json.dumps(payload, ensure_ascii=False))
    return AnthropicReasoner(client, fallback=DeterministicReasoner())


def test_dangerous_tier_end_to_end():
    domain_age.set_provider(_FakeAges({"sbi-kyc-verify.online": 6}))
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    reasoner = _reasoner(
        {
            "risk_level": "dangerous",
            "confidence": "high",
            "summary": "This message pretends to be SBI and links to a fake site.",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.risk_level == RiskLevel.dangerous
    assert r.degraded is None  # model succeeded
    assert r.recommended_action.reporting.helpline == "1930"


def test_suspicious_tier_end_to_end():
    domain_age.set_provider(_FakeAges({}))
    msg = "Congratulations, you won a lucky draw. Pay a registration fee to claim."
    reasoner = _reasoner(
        {
            "risk_level": "suspicious",
            "confidence": "medium",
            "summary": "This looks like an advance-fee prize scam.",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.risk_level == RiskLevel.suspicious


def test_safe_tier_end_to_end():
    domain_age.set_provider(_FakeAges({}))
    msg = "Your Amazon order has shipped. Track it at https://amazon.in/orders"
    reasoner = _reasoner(
        {
            "risk_level": "safe",
            "confidence": "medium",
            "summary": "This appears to be a genuine delivery update.",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.risk_level == RiskLevel.safe


def test_cannot_determine_tier_end_to_end():
    domain_age.set_provider(_FakeAges({}))
    msg = "Hi, this is Acme Solutions about your enquiry. Please call us back."
    reasoner = _reasoner(
        {
            "risk_level": "cannot_determine",
            "confidence": "low",
            "summary": "We could not confirm this company.",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.risk_level == RiskLevel.cannot_determine
    assert r.risk_score is None
    # Cannot Determine must not be a dead end.
    assert r.recommended_action.steps


def test_model_cannot_deescalate_through_pipeline():
    domain_age.set_provider(_FakeAges({"sbi-kyc-verify.online": 6}))
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    # Model tries to call a two-high-signal scam "safe".
    reasoner = _reasoner(
        {
            "risk_level": "safe",
            "confidence": "high",
            "summary": "Nothing to worry about.",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, "en", reasoner=reasoner)
    # Signals floor it at dangerous; the model's "safe" is ignored.
    assert r.risk_level == RiskLevel.dangerous


def test_degraded_mode_when_api_unavailable():
    domain_age.set_provider(_FakeAges({"sbi-kyc-verify.online": 6}))
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    reasoner = _reasoner(raises=RuntimeError("no network"))
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.degraded is True
    assert r.risk_level == RiskLevel.dangerous  # signal layer still classifies
    assert all(s.explanation for s in r.signals)  # deterministic explanations


@pytest.mark.parametrize("language,marker", [("hi", "शिकायत"), ("kn", "ವರದಿ")])
def test_localized_reporting_end_to_end(language, marker):
    domain_age.set_provider(_FakeAges({"sbi-kyc-verify.online": 6}))
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    reasoner = _reasoner(
        {
            "risk_level": "dangerous",
            "confidence": "high",
            "summary": "fake SBI site",
            "signal_explanations": {},
        }
    )
    r = analyze(msg, language, reasoner=reasoner)
    assert marker in r.recommended_action.reporting.text


def test_malformed_json_end_to_end_still_returns():
    domain_age.set_provider(_FakeAges({"sbi-kyc-verify.online": 6}))
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    reasoner = _reasoner(raw="garbage not json")
    r = analyze(msg, "en", reasoner=reasoner)
    assert r.degraded is True
    assert r.risk_level == RiskLevel.dangerous
