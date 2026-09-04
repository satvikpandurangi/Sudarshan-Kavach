"""Fallbacks must be observable without leaking provider requests or secrets."""
import logging

import httpx
import pytest

from app.pipeline.analyzer import analyze
from app.pipeline.groq_reasoner import GroqReasoner, _RealGroqClient
from app.pipeline.reasoning import DeterministicReasoner, build_default_reasoner


class Client:
    def __init__(self, outcome):
        self.outcome = outcome

    def create_message(self, **kwargs):
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome


@pytest.mark.parametrize("outcome,expected", [
    (httpx.ReadTimeout("SECRET prompt"), "model_timeout:ReadTimeout"),
    (httpx.ConnectError("SECRET credential"), "model_error:ConnectError"),
    ("not json", "model_invalid_json"),
    ('{"risk_level":"invented"}', "model_output_validation_failed"),
])
def test_failure_reason_in_response_and_log(outcome, expected, caplog):
    with caplog.at_level(logging.WARNING):
        response = analyze("Message for testing.", reasoner=GroqReasoner(Client(outcome)))
    assert response.degraded is True
    assert response.degradation_reason == expected
    assert expected in caplog.text
    assert "SECRET" not in caplog.text
    assert "Message for testing" not in caplog.text


@pytest.mark.parametrize("status,code", [(401, "invalid_api_key"), (429, "rate_limit_exceeded"), (503, "service_unavailable")])
def test_http_status_and_provider_code_preserved(status, code, caplog):
    request = httpx.Request("POST", "https://example.org/SECRET", headers={"Authorization": "Bearer SECRET"})
    response = httpx.Response(status, request=request, json={"error": {"code": code, "message": "SECRET"}})
    with pytest.raises(httpx.HTTPStatusError) as error:
        response.raise_for_status()
    result = analyze("Message for testing.", reasoner=GroqReasoner(Client(error.value)))
    assert result.degradation_reason == f"model_http_error:{status}:{code}"
    assert result.degradation_reason in caplog.text
    assert "SECRET" not in caplog.text


def test_success_explicitly_not_degraded(caplog):
    result = analyze("Message for testing.", reasoner=GroqReasoner(Client(
        '{"risk_level":"cannot_determine","confidence":"low",'
        '"summary":"There is insufficient context.","signal_explanations":{}}'
    )))
    assert result.degraded is False
    assert result.degradation_reason is None
    assert "Analysis degraded" not in caplog.text


def test_missing_credentials_distinct_from_intentional_deterministic_mode(monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    missing = analyze("Message for testing.", reasoner=build_default_reasoner())
    intentional = analyze("Message for testing.", reasoner=DeterministicReasoner())
    assert missing.degradation_reason == "no_model_credentials"
    assert intentional.degradation_reason == "deterministic_mode"


def test_unexpected_reasoner_exception_is_logged(caplog):
    class BrokenReasoner:
        def reason(self, *args):
            raise RuntimeError("SECRET")
    result = analyze("Message for testing.", reasoner=BrokenReasoner())
    assert result.degradation_reason == "model_error:RuntimeError"
    assert result.degradation_reason in caplog.text
    assert "SECRET" not in caplog.text


@pytest.mark.parametrize("statuses,waits", [
    ([429, 200], [3]),
    ([503, 502, 200], [1, 2]),
    ([429, 429, 429], [3, 3]),
    ([401], []),
])
def test_bounded_http_retries(monkeypatch, statuses, waits):
    calls, delays = [], []
    def handle(request):
        status = statuses[len(calls)]
        calls.append(request)
        return httpx.Response(status, headers={"retry-after": "3"} if status == 429 else {},
                              json={"choices": [{"message": {"content": "{}"}}]})
    real_client = httpx.Client
    monkeypatch.setattr(httpx, "Client", lambda **kwargs: real_client(transport=httpx.MockTransport(handle), **kwargs))
    monkeypatch.setattr("app.pipeline.groq_reasoner.time.sleep", delays.append)
    client = _RealGroqClient(api_key="test-key")
    if statuses[-1] == 200:
        assert client.create_message(model="test", max_tokens=16, system="JSON", user="fixture") == "{}"
    else:
        with pytest.raises(httpx.HTTPStatusError):
            client.create_message(model="test", max_tokens=16, system="JSON", user="fixture")
    assert len(calls) == len(statuses)
    assert delays == waits
