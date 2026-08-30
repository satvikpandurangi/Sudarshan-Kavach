"""Scoring & Arbitration.

Combines deterministic signal severities with the reasoning layer's proposed
level and produces the final risk level, score, and confidence.

The safety property (detection-approach.md / architecture.md): the model can
escalate but can NEVER de-escalate a signal-derived level. A hallucinated
"actually this is fine" is the most dangerous failure mode, so it is structurally
impossible here.

Arbitration table (detection-approach.md):
  >= 2 high signals                -> Dangerous
  1 high signal                    -> Suspicious (minimum)
  medium signals only, model agrees-> Suspicious
  signals conflict / brand unknown & ambiguous -> Cannot Determine
  no signals, model finds nothing  -> Safe
  model proposes higher            -> take model's level
  model proposes lower             -> ignore, keep signal level
"""

from __future__ import annotations

from typing import List, Optional

from app.pipeline import localization
from app.pipeline.normalizer import NormalizedInput
from app.pipeline.reasoning import ReasoningResult
from app.pipeline.signals import brands
from app.pipeline.signals.urlutil import parse_url
from app.schemas import (
    Confidence,
    RecommendedAction,
    Reporting,
    RiskLevel,
    Severity,
    Signal,
)

# Content-derived signal ids — those that come from the message text rather than
# from URL structure. Used to detect the "trusted link, scammy words" conflict.
_CONTENT_SIGNAL_IDS = {
    "credential_request",
    "advance_fee",
    "guaranteed_returns",
    "unsolicited_prize",
    "authority_impersonation",
    "delivery_fee",
    "upi_collect_request",
    "off_channel_redirect",
    "urgency_pressure",
    "generic_salutation",
    "channel_mismatch",
}

# Ordering so we can compare "higher" / "lower" levels numerically.
_LEVEL_RANK = {
    RiskLevel.safe: 0,
    RiskLevel.cannot_determine: 1,
    RiskLevel.suspicious: 2,
    RiskLevel.dangerous: 3,
}

# Representative score per level (risk_score is a display aid; risk_level is
# authoritative per api-spec.md). cannot_determine has a null score.
_LEVEL_SCORE = {
    RiskLevel.safe: 8,
    RiskLevel.suspicious: 55,
    RiskLevel.dangerous: 88,
}


def _signal_level(signals: List[Signal]) -> RiskLevel:
    """Risk level implied by the deterministic signals alone."""
    highs = sum(1 for s in signals if s.severity == Severity.high)
    meds = sum(1 for s in signals if s.severity == Severity.medium)

    if highs >= 2:
        return RiskLevel.dangerous
    if highs == 1:
        return RiskLevel.suspicious
    if meds >= 1:
        return RiskLevel.suspicious
    # Only low-severity or no signals.
    return RiskLevel.safe


def _too_thin_to_judge(normalized: NormalizedInput, signals: List[Signal]) -> bool:
    """Message-too-short Cannot Determine trigger (false-positives.md)."""
    stripped = normalized.text.strip()
    if len(stripped) < 12 and not normalized.urls:
        return True
    return False


def _has_official_url(normalized: NormalizedInput) -> bool:
    for raw in normalized.urls:
        parsed = parse_url(raw)
        if not parsed.is_ip_literal and parsed.registered_domain in brands.OFFICIAL_DOMAINS:
            return True
    return False


def _signals_conflict(normalized: NormalizedInput, signals: List[Signal]) -> bool:
    """Detect the documented conflict case (false-positives.md).

    The clearest deterministic conflict: the message links to a *known-good
    official* domain, yet its text carries high-severity scam patterns
    (credential request, advance fee, ...). The link says "trusted", the words
    say "fraud". That is genuinely undecidable from content alone, so we punt to
    Cannot Determine rather than guess.
    """
    if not _has_official_url(normalized):
        return False
    high_content = any(
        s.severity == Severity.high and s.id in _CONTENT_SIGNAL_IDS for s in signals
    )
    return high_content


def arbitrate(
    normalized: NormalizedInput,
    signals: List[Signal],
    reasoning: ReasoningResult,
) -> tuple[RiskLevel, Optional[int], Confidence]:
    signal_level = _signal_level(signals)

    # Start from the signal-derived level — the floor the model cannot lower.
    final = signal_level

    # Model may escalate, never de-escalate.
    proposed = reasoning.proposed_level
    if proposed is not None and _LEVEL_RANK[proposed] > _LEVEL_RANK[signal_level]:
        final = proposed

    # Conflicting signals: a known-good official link alongside high-severity
    # scam wording. Undecidable from content -> Cannot Determine
    # (detection-approach.md / false-positives.md). This is a deterministic
    # arbitration decision, not the model de-escalating.
    if _signals_conflict(normalized, signals):
        final = RiskLevel.cannot_determine

    # Cannot Determine: too little to judge, and nothing already escalated it.
    if final == RiskLevel.safe and _too_thin_to_judge(normalized, signals):
        final = RiskLevel.cannot_determine

    # Safe with zero signals but low model confidence -> Cannot Determine
    # (confidence low always implies cannot_determine, api-spec.md).
    if (
        final == RiskLevel.safe
        and not signals
        and reasoning.proposed_confidence == Confidence.low
    ):
        final = RiskLevel.cannot_determine

    confidence = _derive_confidence(final, signals, reasoning)
    score = _LEVEL_SCORE.get(final)  # None for cannot_determine
    return final, score, confidence


def _derive_confidence(
    level: RiskLevel, signals: List[Signal], reasoning: ReasoningResult
) -> Confidence:
    if level == RiskLevel.cannot_determine:
        return Confidence.low  # low always implies cannot_determine and vice versa
    highs = sum(1 for s in signals if s.severity == Severity.high)
    if level == RiskLevel.dangerous and highs >= 2:
        return Confidence.high
    if level == RiskLevel.dangerous:
        return Confidence.medium
    if level == RiskLevel.suspicious:
        return Confidence.medium if highs >= 1 else Confidence.low if not signals else Confidence.medium
    # safe
    return Confidence.medium


# --------------------------------------------------------------------------- #
# Recommended action
# --------------------------------------------------------------------------- #
# Signal ids that hint at what the message claims to be, for the Cannot Determine
# manual verification checklists (false-positives.md).
_CLAIM_TYPE_HINTS = {
    "bank": {"lookalike_domain", "new_domain", "credential_request", "channel_mismatch"},
    "job": {"advance_fee"},
    "delivery": {"delivery_fee"},
    "payment": {"upi_collect_request"},
}


def _infer_claim_type(signals: List[Signal]) -> Optional[str]:
    """Best-effort guess at the message's claimed nature, for the CD checklist.

    Order matters: payment/delivery/job are more specific than the generic bank
    fallback, so check them first.
    """
    ids = {s.id for s in signals}
    for claim in ("payment", "delivery", "job", "bank"):
        if ids & _CLAIM_TYPE_HINTS[claim]:
            return claim
    return None


def build_recommended_action(
    level: RiskLevel,
    signals: List[Signal],
    language: str = "en",
) -> RecommendedAction:
    """Build the localized recommended action for a risk tier.

    All user-facing action text comes from the reviewed, per-language strings in
    localization.py — never machine-translated (false-positives.md). For Cannot
    Determine, the generic steps are replaced by a claim-type checklist when we
    can infer what the message claims to be.
    """
    reporting = localization.reporting_for(language)
    tier = localization.action_for(language, level)
    primary = tier["primary"]
    steps = list(tier["steps"])

    if level == RiskLevel.cannot_determine:
        claim = _infer_claim_type(signals)
        if claim:
            checklist = localization.checklist_for(language, claim)
            if checklist:
                steps = checklist

    return RecommendedAction(primary=primary, steps=steps, reporting=reporting)
