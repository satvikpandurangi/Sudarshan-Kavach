"""Pipeline orchestrator.

Ties the layers together in the order architecture.md specifies:

    normalize -> signal layer -> reasoning layer -> scoring & arbitration

and assembles the public AnalyzeResponse. Localization (EN/KN/HI rendering) is a
later phase; the seam is here — the response is built once and can be localized
before return.
"""

from __future__ import annotations

import logging
import time
from typing import Optional

from app.pipeline import arbitration, signals as signal_layer
from app.pipeline.normalizer import normalize
from app.pipeline.reasoning import (
    Reasoner,
    ReasoningResult,
    build_default_reasoner,
    model_error_reason,
)
from app.schemas import (
    AnalyzeResponse,
    Confidence,
    RiskLevel,
    SignalOut,
)

# Reasoner is selected lazily from the configured provider credentials.
logger = logging.getLogger(__name__)
_active_reasoner: Optional[Reasoner] = None


def _get_reasoner() -> Reasoner:
    global _active_reasoner
    if _active_reasoner is None:
        _active_reasoner = build_default_reasoner()
    return _active_reasoner


def set_reasoner(reasoner: Optional[Reasoner]) -> None:
    global _active_reasoner
    _active_reasoner = reasoner


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
    except Exception as exc:
        # Reasoning unreachable -> degraded mode (api-spec.md): signal-layer
        # results only, no generated summary.
        reasoning = ReasoningResult(
            signals=raw_signals,
            summary=None,
            proposed_level=None,
            proposed_confidence=None,
            degraded=True,
            degradation_reason=model_error_reason(exc),
        )

    if reasoning.degraded:
        reasoning.degradation_reason = reasoning.degradation_reason or "reasoner_reported_degraded"
        logger.warning("Analysis degraded: reasoner=%s reason=%s",
                       type(reasoner).__name__, reasoning.degradation_reason)

    enriched_signals = reasoning.signals or raw_signals

    # Phase 3 requirement: collect_request_to_receive explanation must state the actual mechanic
    for s in enriched_signals:
        if s.id == "collect_request_to_receive":
            s.explanation = (
                "Your UPI PIN is only ever needed to SEND money. Nothing that pays you "
                "into your account will ask for it. If a request needs your PIN, "
                "it is taking money, not giving it."
            )
            s.detail = s.explanation

    # 4. Scoring & arbitration
    level, score, confidence = arbitration.arbitrate(
        normalized, enriched_signals, reasoning
    )

    recommended_action = arbitration.build_recommended_action(
        level, enriched_signals, language, normalized
    )

    # Phase 3 requirement: "When Cannot Determine fires, return a manual
    # verification checklist instead of signals."
    if level == RiskLevel.cannot_determine:
        public_signals = []
    else:
        public_signals = [s.to_public() for s in enriched_signals]

    # Cannot Determine may carry no signals; summary falls back to a standard
    # honest line when the reasoner produced none.
    summary = reasoning.summary
    if summary is None and not reasoning.degraded:
        summary = _default_summary(level)

    processing_ms = int((time.perf_counter() - started) * 1000)

    # public_signals built above

    return AnalyzeResponse(
        risk_level=level,
        risk_score=score,
        confidence=confidence,
        signals=public_signals,
        summary=summary,
        recommended_action=recommended_action,
        extracted_urls=normalized.urls,
        processing_ms=processing_ms,
        degraded=reasoning.degraded,
        degradation_reason=reasoning.degradation_reason if reasoning.degraded else None,
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
