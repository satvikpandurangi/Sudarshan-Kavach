"""Groq reasoning-layer tests with mocked client and error handling."""

from __future__ import annotations

import json
import pytest

from app.pipeline.groq_reasoner import GroqReasoner, _RealGroqClient
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import DeterministicReasoner
from app.pipeline.signals import run_all
from app.schemas import RiskLevel, Signal
from eval.harness import make_reasoner


class _MockClient:
    def __init__(self, response: str | dict | Exception):
        self._response = response
        self.calls = []

    def create_message(self, *, model: str, max_tokens: int, system: str, user: str) -> str:
        self.calls.append({"model": model, "max_tokens": max_tokens, "system": system, "user": user})
        if isinstance(self._response, Exception):
            raise self._response
        if isinstance(self._response, dict):
            return json.dumps(self._response)
        return str(self._response)


def test_groq_reasoner_success():
    msg = "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update"
    n = normalize(msg)
    sigs = run_all(n)

    payload = {
        "risk_level": "dangerous",
        "confidence": "high",
        "summary": "This message is a fake SBI notification attempting to steal account details.",
        "signal_explanations": {s.id: f"Explanation for {s.id}" for s in sigs},
    }

    mock = _MockClient(payload)
    reasoner = GroqReasoner(client=mock, model="qwen/qwen3.8-27b")
    res = reasoner.reason(n, sigs, "en")

    assert res.degraded is False
    assert res.proposed_level == RiskLevel.dangerous
    assert len(mock.calls) == 1
    assert mock.calls[0]["model"] == "qwen/qwen3.8-27b"
    assert "fake SBI notification" in (res.summary or "")


def test_groq_reasoner_fallback_on_network_error():
    msg = "Urgent: call now 1800-000-0000"
    n = normalize(msg)
    sigs = run_all(n)

    mock = _MockClient(RuntimeError("Network timeout"))
    reasoner = GroqReasoner(client=mock)
    res = reasoner.reason(n, sigs, "en")

    assert res.degraded is True
    assert res.proposed_level is None


def test_groq_eval_harness_mode_selection(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    reasoner, mode = make_reasoner("groq")
    assert isinstance(reasoner, DeterministicReasoner)
    assert "no GROQ_API_KEY" in mode

    monkeypatch.setenv("GROQ_API_KEY", "dummy-key")
    reasoner, mode = make_reasoner("groq")
    assert isinstance(reasoner, GroqReasoner)
    assert mode == "groq"
