"""Reasoning layer.

architecture.md: one language-model call takes normalized content + the full
signal list and returns per-signal explanations, a summary, and a proposed risk
level. The model can escalate but never de-escalate (that rule lives in
arbitration.py, not here).

Phase 1 ships a deterministic fallback reasoner so the pipeline is genuinely
end-to-end today with no API key and no network. It is also the documented
degraded-mode path from api-spec.md: when the real model is unreachable, the
system still returns signal-derived titles and a null summary.

The real Anthropic-backed reasoner drops in behind the Reasoner protocol in a
later phase without touching callers or arbitration.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Protocol

from app.pipeline.normalizer import NormalizedInput
from app.schemas import Confidence, RiskLevel, Severity, Signal


@dataclass
class ReasoningResult:
    """What the reasoning layer proposes. Arbitration makes the final call."""

    signals: List[Signal]  # signals with `explanation` populated
    summary: Optional[str]
    proposed_level: Optional[RiskLevel]
    proposed_confidence: Optional[Confidence]
    degraded: bool = False
    degradation_reason: Optional[str] = None


def model_error_reason(exc: Exception) -> str:
    """Describe failures without logging exception bodies, prompts or credentials."""
    import httpx
    import re

    if isinstance(exc, httpx.TimeoutException):
        return f"model_timeout:{type(exc).__name__}"
    if isinstance(exc, httpx.HTTPStatusError):
        reason = f"model_http_error:{exc.response.status_code}"
        try:
            code = exc.response.json().get("error", {}).get("code")
            if isinstance(code, str) and re.fullmatch(r"[a-z_]{1,64}", code):
                reason += f":{code}"
        except (ValueError, AttributeError):
            pass
        return reason
    return f"model_error:{type(exc).__name__}"


class Reasoner(Protocol):
    def reason(
        self, normalized: NormalizedInput, signals: List[Signal], language: str
    ) -> ReasoningResult: ...


class DeterministicReasoner:
    """No-model fallback.

    Produces grounded explanations by reusing each signal's own `detail` (which
    is authored against the evidence span) and a summary assembled only from the
    signals that actually fired. It never asserts anything not backed by a
    signal, so it satisfies the citation constraint by construction.

    It proposes no risk level of its own — arbitration derives the level from the
    signals. This keeps the fallback strictly non-escalating, which is the safe
    default when no model is present.
    """

    def __init__(self, degradation_reason: str = "deterministic_mode") -> None:
        self.degradation_reason = degradation_reason

    def reason(
        self, normalized: NormalizedInput, signals: List[Signal], language: str
    ) -> ReasoningResult:
        enriched: List[Signal] = []
        for sig in signals:
            enriched.append(
                sig.model_copy(update={"explanation": sig.explanation or sig.detail})
            )

        summary = self._summarize(enriched)

        return ReasoningResult(
            signals=enriched,
            summary=summary,
            proposed_level=None,  # let signals speak; fallback never escalates
            proposed_confidence=None,
            degraded=True,
            degradation_reason=self.degradation_reason,
        )

    @staticmethod
    def _summarize(signals: List[Signal]) -> Optional[str]:
        if not signals:
            return None

        high = [s for s in signals if s.severity == Severity.high]
        med = [s for s in signals if s.severity == Severity.medium]

        if high:
            lead = (
                "This message shows strong signs of a scam."
                if len(high) >= 2
                else "This message shows a serious warning sign."
            )
        elif med:
            lead = "This message has some warning signs worth checking."
        else:
            lead = "This message has minor warning signs."

        # Cite the concrete findings without inventing anything, strongest first.
        ordered = high + med + [
            s for s in signals if s.severity == Severity.low
        ]
        titles = [s.title for s in ordered if s.title][:3]
        if titles:
            detail = " Specifically: " + "; ".join(t.lower() for t in titles) + "."
        else:
            detail = ""

        return lead + detail


# The deterministic fallback. Always available, no network, no key. This is both
# the Phase 1 default and the permanent degraded-mode path.
default_reasoner: Reasoner = DeterministicReasoner()


def build_default_reasoner() -> Reasoner:
    """Select the reasoner for the running app.

    If GROQ_API_KEY or ANTHROPIC_API_KEY is set (and the corresponding client is
    usable), use the model-backed reasoner, which itself falls back to the
    deterministic path on any failure. Otherwise return the deterministic
    reasoner directly. Either way the endpoint works — the model is an
    enhancement, never a hard dependency.
    """
    import os

    initialization_failure = None
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            from app.pipeline.groq_reasoner import GroqReasoner, _RealGroqClient

            client = _RealGroqClient(api_key=groq_key)
            return GroqReasoner(client=client, fallback=DeterministicReasoner())
        except Exception as exc:
            initialization_failure = f"groq_initialization_failed:{model_error_reason(exc)}"
            import logging
            logging.getLogger(__name__).warning("%s", initialization_failure)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return DeterministicReasoner(initialization_failure or "no_model_credentials")

    try:
        from app.pipeline.anthropic_reasoner import (
            AnthropicReasoner,
            _RealAnthropicClient,
        )

        client = _RealAnthropicClient(api_key=api_key)
        return AnthropicReasoner(client=client, fallback=DeterministicReasoner())
    except Exception as exc:
        # SDK missing or client init failed — degrade to deterministic.
        return DeterministicReasoner(f"anthropic_initialization_failed:{model_error_reason(exc)}")
