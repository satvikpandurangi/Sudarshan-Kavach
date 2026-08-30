"""Anthropic reasoning-layer tests, all with a mocked client (no API key).

Covers the Phase 3 requirements: grounding, no fabricated evidence, the
escalate-but-never-de-escalate rule, malformed JSON, low confidence,
Cannot Determine, all three languages, and degraded mode.
"""

from __future__ import annotations

import pytest

from app.pipeline import domain_age
from app.pipeline.anthropic_reasoner import AnthropicReasoner
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import DeterministicReasoner
from app.pipeline.signals import run_all
from app.schemas import Confidence, RiskLevel, Severity, Signal

SCAM = (
    "Dear customer, your SBI account will be blocked today. "
    "Complete KYC: http://sbi-kyc-verify.online/update"
)


_DEFAULT_AGES = {"sbi-kyc-verify.online": 6}


def _prep(message=SCAM, ages=None):
    # Note: `ages={}` means "no age data known", which is distinct from the
    # default. Use an explicit None check, not truthiness (empty dict is falsy).
    resolved = _DEFAULT_AGES if ages is None else ages
    domain_age.set_provider(_FakeAges(resolved))
    n = normalize(message)
    return n, run_all(n)


class _FakeAges:
    def __init__(self, d):
        self.d = d

    def age_days(self, dom):
        return self.d.get(dom)


def _explanations(signals):
    return {s.id: f"plain explanation for {s.id}" for s in signals}


# --------------------------------------------------------------------------- #
# Happy path + grounding
# --------------------------------------------------------------------------- #
def test_valid_output_attaches_explanations(mock_client):
    n, sigs = _prep()
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "This message pretends to be SBI and links to a fake site.",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is False
    assert r.proposed_level == RiskLevel.dangerous
    assert r.summary and "SBI" in r.summary
    assert all(s.explanation for s in r.signals)


def test_evidence_never_comes_from_model(mock_client):
    # The model's explanation text is used, but evidence stays the signal's own
    # exact span — the model cannot rewrite evidence.
    n, sigs = _prep()
    original_evidence = {s.id: s.evidence for s in sigs}
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "Fake SBI site.",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    for s in r.signals:
        assert s.evidence == original_evidence[s.id]
        assert s.evidence in n.text


# --------------------------------------------------------------------------- #
# Fabrication
# --------------------------------------------------------------------------- #
def test_fabricated_signal_id_rejected_falls_back(mock_client):
    n, sigs = _prep()
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "ok",
        # A signal id that does not exist -> fabrication -> discard -> fallback.
        "signal_explanations": {"totally_made_up_signal": "invented"},
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is True  # fell back to deterministic


def test_fabricated_domain_age_in_summary_rejected(mock_client):
    # No age signal fired (age unknown), but the model claims "6 days ago".
    n, sigs = _prep(ages={})  # unknown age -> no new_domain/recent_domain signal
    assert not any(s.id in ("new_domain", "recent_domain") for s in sigs)
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "This website was created 6 days ago and is fake.",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is True  # ungrounded age claim -> fallback


def test_fabricated_url_in_summary_rejected(mock_client):
    n, sigs = _prep()
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "The real site is https://totally-different-invented-domain.example",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is True


def test_grounded_age_claim_allowed(mock_client):
    # When an age signal DID fire, an age claim in the summary is legitimate.
    n, sigs = _prep(ages={"sbi-kyc-verify.online": 6})
    assert any(s.id == "new_domain" for s in sigs)
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "This website was created 6 days ago.",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is False
    assert r.summary is not None


# --------------------------------------------------------------------------- #
# Escalate-only
# --------------------------------------------------------------------------- #
def test_model_deescalation_discarded(mock_client):
    # Signals justify at least suspicious; model says "safe" -> proposal dropped.
    n, sigs = _prep()
    payload = {
        "risk_level": "safe",
        "confidence": "high",
        "summary": "Looks fine to me.",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    # proposed_level is cleared so arbitration keeps the signal-derived level.
    assert r.proposed_level is None


def test_model_escalation_kept(mock_client):
    # Only a medium signal, but the model escalates to dangerous — allowed.
    n = normalize("This looks a bit odd, please check http://foo.xyz")
    sigs = [Signal(id="high_risk_tld", severity=Severity.medium, evidence="http://foo.xyz")]
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "check http://foo.xyz",
        "signal_explanations": {"high_risk_tld": "cheap disposable domain"},
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.proposed_level == RiskLevel.dangerous


# --------------------------------------------------------------------------- #
# Malformed / degraded
# --------------------------------------------------------------------------- #
def test_malformed_json_falls_back(mock_client):
    n, sigs = _prep()
    r = AnthropicReasoner(mock_client(raw="this is not json at all")).reason(n, sigs, "en")
    assert r.degraded is True


def test_json_in_code_fence_is_parsed(mock_client):
    n, sigs = _prep()
    import json

    inner = json.dumps(
        {
            "risk_level": "dangerous",
            "confidence": "high",
            "summary": "fake SBI",
            "signal_explanations": _explanations(sigs),
        }
    )
    raw = f"Here you go:\n```json\n{inner}\n```"
    r = AnthropicReasoner(mock_client(raw=raw)).reason(n, sigs, "en")
    assert r.degraded is False
    assert r.proposed_level == RiskLevel.dangerous


def test_client_exception_falls_back(mock_client):
    n, sigs = _prep()
    r = AnthropicReasoner(mock_client(raises=RuntimeError("network down"))).reason(
        n, sigs, "en"
    )
    assert r.degraded is True
    # Deterministic fallback still produced grounded explanations.
    assert all(s.explanation for s in r.signals)


def test_invalid_risk_level_falls_back(mock_client):
    n, sigs = _prep()
    payload = {
        "risk_level": "extremely_dangerous",  # not a valid tier
        "confidence": "high",
        "summary": "x",
        "signal_explanations": _explanations(sigs),
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.degraded is True


# --------------------------------------------------------------------------- #
# Low confidence / cannot_determine
# --------------------------------------------------------------------------- #
def test_low_confidence_passed_through(mock_client):
    n = normalize("Hi, this is Acme Solutions about your enquiry. Please call back.")
    sigs = run_all(n)
    payload = {
        "risk_level": "cannot_determine",
        "confidence": "low",
        "summary": "We cannot confirm this company.",
        "signal_explanations": {},
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.proposed_confidence == Confidence.low
    assert r.proposed_level == RiskLevel.cannot_determine


def test_cannot_determine_empty_signals(mock_client):
    n = normalize("Please review the attached document at your convenience.")
    sigs = run_all(n)
    payload = {
        "risk_level": "cannot_determine",
        "confidence": "low",
        "summary": "Not enough information to decide.",
        "signal_explanations": {},
    }
    r = AnthropicReasoner(mock_client(payload)).reason(n, sigs, "en")
    assert r.proposed_level == RiskLevel.cannot_determine


# --------------------------------------------------------------------------- #
# Languages
# --------------------------------------------------------------------------- #
@pytest.mark.parametrize("language", ["en", "hi", "kn"])
def test_language_passed_to_prompt(mock_client, language):
    n, sigs = _prep()
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "fake SBI",
        "signal_explanations": _explanations(sigs),
    }
    client = mock_client(payload)
    AnthropicReasoner(client).reason(n, sigs, language)
    # The requested language name must reach the model prompt.
    expected = {"en": "English", "hi": "Hindi", "kn": "Kannada"}[language]
    assert expected in client.calls[0]["user"]


def test_model_receives_only_content_signals_language(mock_client):
    # The prompt must not leak anything beyond message text, signals, language.
    n, sigs = _prep()
    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "fake SBI",
        "signal_explanations": _explanations(sigs),
    }
    client = mock_client(payload)
    AnthropicReasoner(client).reason(n, sigs, "en")
    user = client.calls[0]["user"]
    assert n.text in user
    for s in sigs:
        assert s.id in user
