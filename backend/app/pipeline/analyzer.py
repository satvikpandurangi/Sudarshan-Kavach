"""Pipeline orchestrator.

Ties the layers together in the order architecture.md specifies:

    normalize -> signal layer -> reasoning layer -> scoring & arbitration

and assembles the public AnalyzeResponse. Localization (EN/KN/HI rendering) is a
later phase; the seam is here — the response is built once and can be localized
before return.
"""

from __future__ import annotations

import time
from typing import Optional

from app.pipeline import arbitration, signals as signal_layer
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import (
    Reasoner,
    ReasoningResult,
    build_default_reasoner,
)
from app.schemas import (
    AnalyzeResponse,
    Confidence,
    RiskLevel,
    SignalOut,
)

# Reasoner is selected once at import (reads ANTHROPIC_API_KEY). Falls back to
# the deterministic reasoner when no key/SDK is present. Callers can still pass
# an explicit reasoner (used by tests).
_active_reasoner: Optional[Reasoner] = None


def _get_reasoner() -> Reasoner:
    global _active_reasoner
    if _active_reasoner is None:
        _active_reasoner = build_default_reasoner()
    return _active_reasoner


def analyze(
    content: str,
    language: str = "en",
    reasoner: Optional[Reasoner] = None,
) -> AnalyzeResponse:
    started = time.perf_counter()
    reasoner = reasoner or _get_reasoner()

    # 1. Normalize
    normalized = normalize(content)

    # 2. Signal layer (deterministic)
    raw_signals = signal_layer.run_all(normalized)

    # 3. Reasoning layer (explanations + optional escalation)
    try:
        reasoning: ReasoningResult = reasoner.reason(normalized, raw_signals, language)
    except Exception:
        # Reasoning unreachable -> degraded mode (api-spec.md): signal-layer
        # results only, no generated summary.
        reasoning = ReasoningResult(
            signals=raw_signals,
            summary=None,
            proposed_level=None,
            proposed_confidence=None,
            degraded=True,
        )

    enriched_signals = reasoning.signals or raw_signals

    # 4. Scoring & arbitration
    level, score, confidence = arbitration.arbitrate(
        normalized, enriched_signals, reasoning
    )

    recommended_action = arbitration.build_recommended_action(
        level, enriched_signals, language
    )

    # Cannot Determine may carry no signals; summary falls back to a standard
    # honest line when the reasoner produced none.
    summary = reasoning.summary
    if summary is None and not reasoning.degraded:
        summary = _default_summary(level)

    processing_ms = int((time.perf_counter() - started) * 1000)

    public_signals = [s.to_public() for s in enriched_signals]

    return AnalyzeResponse(
        risk_level=level,
        risk_score=score,
        confidence=confidence,
        signals=public_signals,
        summary=summary,
        recommended_action=recommended_action,
        extracted_urls=normalized.urls,
        processing_ms=processing_ms,
        degraded=True if reasoning.degraded else None,
    )


def _default_summary(level: RiskLevel) -> Optional[str]:
    if level == RiskLevel.cannot_determine:
        return (
            "We could not find clear warning signs, but we also could not confirm "
            "this message is genuine."
        )
    if level == RiskLevel.safe:
        return "We did not find warning signs in this message."
    return None
