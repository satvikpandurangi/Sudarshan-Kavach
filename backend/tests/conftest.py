"""Shared test fixtures.

The domain-age provider is the one piece of the signal layer that would
otherwise reach the network. Every test runs against a deterministic in-memory
provider so the suite is fast, offline, and repeatable — which is also the
degraded-mode path the product relies on.
"""

from __future__ import annotations

from typing import Optional

import pytest

from app.pipeline import domain_age


class FakeDomainAgeProvider:
    """Returns ages from a dict; anything not present is unknown (None)."""

    def __init__(self, ages: Optional[dict[str, int]] = None) -> None:
        self.ages = ages or {}

    def age_days(self, registered_domain: str) -> Optional[int]:
        return self.ages.get(registered_domain)


@pytest.fixture
def set_domain_ages():
    """Install a fake provider with the given {domain: age_days} mapping.

    Restores the previous provider afterwards so tests don't leak state.
    """
    original = domain_age.get_provider()

    def _install(ages: Optional[dict[str, int]] = None):
        provider = FakeDomainAgeProvider(ages or {})
        domain_age.set_provider(provider)
        return provider

    yield _install
    domain_age.set_provider(original)


@pytest.fixture(autouse=True)
def offline_by_default():
    """Default every test to a no-network null provider and deterministic reasoner."""
    from app.pipeline.analyzer import set_reasoner
    from app.pipeline.reasoning import DeterministicReasoner

    original = domain_age.get_provider()
    domain_age.set_provider(domain_age.NullDomainAgeProvider())
    set_reasoner(DeterministicReasoner())
    yield
    domain_age.set_provider(original)
    set_reasoner(None)


class MockAnthropicClient:
    """Stands in for the Anthropic SDK. Returns a preset raw string, or raises.

    No API key, no network — the whole reasoning layer is exercised offline.
    """

    def __init__(self, response: str = "", raises: Exception | None = None) -> None:
        self.response = response
        self.raises = raises
        self.calls: list[dict] = []

    def create_message(self, *, model, max_tokens, system, user):
        self.calls.append({"model": model, "system": system, "user": user})
        if self.raises is not None:
            raise self.raises
        return self.response


@pytest.fixture
def mock_client():
    """Factory: build a MockAnthropicClient from a dict payload or raw string."""
    import json

    def _make(payload=None, *, raw=None, raises=None):
        if raises is not None:
            return MockAnthropicClient(raises=raises)
        if raw is not None:
            return MockAnthropicClient(response=raw)
        return MockAnthropicClient(response=json.dumps(payload, ensure_ascii=False))

    return _make
