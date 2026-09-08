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
    "collect_request_to_receive",
    "upi_collect_request",
    "upi_pin_requested",
    "credential_request",
    "refund_reversal_bait",
    "unknown_vpa_payment",
    "advance_fee",
    "guaranteed_returns",
    "unsolicited_prize",
    "authority_impersonation",
    "delivery_fee",
    "off_channel_redirect",
    "urgency_pressure",
    "generic_salutation",
    "channel_mismatch",
}

_RANK_TO_LEVEL = {
    0: RiskLevel.safe,
    1: RiskLevel.cannot_determine,
    2: RiskLevel.suspicious,
    3: RiskLevel.dangerous,
}

# Ordering so we can compare "higher" / "lower" levels numerically.
_LEVEL_RANK = {
    RiskLevel.safe: 0,
    RiskLevel.cannot_determine: 1,
    RiskLevel.suspicious: 2,
    RiskLevel.dangerous: 3,
}


def _signal_level(signals: List[Signal]) -> RiskLevel:
    """Risk level implied by the deterministic signals alone."""
    high_groups = set()
    med_groups = set()
    for s in signals:
        if s.severity == Severity.high:
            gid = s.id
            if gid in ("collect_request_to_receive", "upi_collect_request"):
                gid = "collect_request"
            elif gid in ("upi_pin_requested", "credential_request"):
                gid = "credential_request"
            high_groups.add(gid)
        elif s.severity == Severity.medium:
            med_groups.add(s.id)

    highs = len(high_groups)
    meds = len(med_groups)

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
        if not parsed.is_ip_literal and (
            parsed.registered_domain in brands.OFFICIAL_DOMAINS
            or parsed.host in brands.OFFICIAL_DOMAINS
        ):
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


def calculate_dynamic_risk_score(
    final: RiskLevel,
    signals: List[Signal],
    normalized: NormalizedInput,
    reasoning: ReasoningResult,
) -> Optional[int]:
    """Dynamically compute a granular, signal-weighted risk score (0-100).

    Replaces static lookup tables with evidence-grounded scoring:
    - Safe: 0% (official) or 3%-26% (clean or low-severity notices)
    - Suspicious: 32%-68% (scaled by specific medium/high signals, urgency, and attack vectors)
    - Dangerous: 74%-98% (scaled by compounding severe exploits, credential theft, and malware lures)
    - Cannot Determine: None
    """
    if final == RiskLevel.cannot_determine:
        return None

    if _has_official_url(normalized) and not signals:
        return 0

    # Deterministic entropy jitter (-2 to +2) based on content so distinct messages
    # with similar traits don't all show identical numbers.
    jitter = (sum(ord(c) for c in normalized.text[:120]) % 5) - 2

    if final == RiskLevel.safe:
        # Base clean score 4-8%
        if not signals:
            base = 4 + min(4, len(normalized.text) // 50)
            return max(2, min(12, base + jitter))
        # Low severity signals present (e.g. generic_salutation, insecure_http)
        low_score = 12
        for s in signals:
            if s.id == "insecure_http":
                low_score += 8
            elif s.id == "generic_salutation":
                low_score += 4
            else:
                low_score += 5
        return max(12, min(28, low_score + jitter))

    if final == RiskLevel.suspicious:
        # Range: 32% - 68%
        base = 32
        added = 0
        high_signals = [s for s in signals if s.severity == Severity.high]
        med_signals = [s for s in signals if s.severity == Severity.medium]

        med_weights = {
            "unknown_vpa_payment": 14,
            "url_shortener": 12,
            "new_domain": 13,
            "recent_domain": 8,
            "delivery_fee": 15,
            "urgency_pressure": 9,
            "off_channel_redirect": 10,
            "high_risk_tld": 11,
            "excessive_subdomains": 8,
        }

        high_weights = {
            "unsolicited_prize": 22,
            "gambling_betting_lure": 22,
            "unregulated_gambling_domain": 22,
            "advance_fee": 20,
            "guaranteed_returns": 20,
            "authority_impersonation": 18,
            "lookalike_domain": 22,
            "typosquat_domain": 20,
            "credential_request": 24,
            "upi_pin_requested": 24,
            "collect_request_to_receive": 24,
            "upi_collect_request": 24,
            "refund_reversal_bait": 22,
        }

        for s in high_signals:
            added += high_weights.get(s.id, 18)

        for s in med_signals:
            added += med_weights.get(s.id, 8)

        # AI reasoner confidence modifier
        if reasoning.proposed_level == RiskLevel.dangerous:
            added += 6
        elif reasoning.proposed_level == RiskLevel.suspicious and reasoning.proposed_confidence == Confidence.high:
            added += 4

        # Compounding multi-signal bonus
        if len(med_signals) >= 2:
            added += 4

        score = base + added + jitter
        return max(32, min(68, score))

    if final == RiskLevel.dangerous:
        # Range: 74% - 98%
        base = 74
        added = 0
        high_signals = [s for s in signals if s.severity == Severity.high]
        med_signals = [s for s in signals if s.severity == Severity.medium]

        # Deduplicate high signal groups so paired signals (e.g. upi_pin_requested + credential_request)
        # don't double-count to the maximum ceiling immediately.
        seen_high_groups = set()
        critical_weights = {
            "collect_request": 9,
            "credential_request": 9,
            "refund_reversal_bait": 8,
            "advance_fee": 7,
            "gambling_betting_lure": 7,
            "unregulated_gambling_domain": 7,
            "unsolicited_prize": 6,
            "lookalike_domain": 8,
            "typosquat_domain": 7,
            "ip_address_url": 8,
            "punycode_domain": 7,
            "authority_impersonation": 6,
            "guaranteed_returns": 6,
        }

        for s in high_signals:
            gid = s.id
            if gid in ("collect_request_to_receive", "upi_collect_request"):
                gid = "collect_request"
            elif gid in ("upi_pin_requested", "credential_request"):
                gid = "credential_request"
            if gid not in seen_high_groups:
                seen_high_groups.add(gid)
                added += critical_weights.get(gid, critical_weights.get(s.id, 6))

        for s in med_signals:
            if s.id in ("urgency_pressure", "url_shortener", "unknown_vpa_payment"):
                added += 3
            else:
                added += 2

        # Multi-vector compounding attack
        if len(seen_high_groups) >= 2:
            added += 5
        if len(seen_high_groups) >= 3:
            added += 4

        # Model escalation boost
        if reasoning.proposed_level == RiskLevel.dangerous and reasoning.proposed_confidence == Confidence.high:
            added += 3

        score = base + added + jitter
        return max(74, min(98, score))

    return None


def arbitrate(
    normalized: NormalizedInput,
    signals: List[Signal],
    reasoning: ReasoningResult,
) -> tuple[RiskLevel, Optional[int], Confidence]:
    signal_level = _signal_level(signals)

    # CRITICAL RULE: the model may RAISE the risk level above what the signals
    # indicate, but may never LOWER it. Implemented as an explicit max() in
    # the arbitration function per Phase 3 requirements.
    proposed = reasoning.proposed_level
    if proposed is not None:
        signal_rank = _LEVEL_RANK[signal_level]
        proposed_rank = _LEVEL_RANK[proposed]
        final = _RANK_TO_LEVEL[max(signal_rank, proposed_rank)]
    else:
        final = signal_level

    # Conflicting signals: a known-good official link alongside high-severity
    # scam wording. Undecidable from content -> Cannot Determine
    # (detection-approach.md / false-positives.md). This is a deterministic
    # arbitration decision, not the model de-escalating.
    if _signals_conflict(normalized, signals):
        final = RiskLevel.cannot_determine

    # Cannot Determine: too little to judge, and nothing already escalated it.
    if final == RiskLevel.safe and _too_thin_to_judge(normalized, signals):
        final = RiskLevel.cannot_determine

    has_official = _has_official_url(normalized)

    # Verified official domain with no signals: explicitly safe
    if has_official and not signals and (proposed is None or proposed in (RiskLevel.safe, RiskLevel.cannot_determine)):
        return RiskLevel.safe, 0, Confidence.high

    # Safe with zero signals but low model confidence -> Cannot Determine
    # (confidence low always implies cannot_determine, api-spec.md),
    # unless it is an official verified domain.
    if (
        final == RiskLevel.safe
        and not signals
        and reasoning.proposed_confidence == Confidence.low
        and not has_official
    ):
        final = RiskLevel.cannot_determine

    confidence = _derive_confidence(final, signals, reasoning)
    score = calculate_dynamic_risk_score(final, signals, normalized, reasoning)
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
import re as _re

_CLAIM_TYPE_HINTS = {
    "bank": {"lookalike_domain", "new_domain", "credential_request", "upi_pin_requested", "channel_mismatch", "authority_impersonation"},
    "job": {"advance_fee", "guaranteed_returns"},
    "delivery": {"delivery_fee"},
    "payment": {"collect_request_to_receive", "upi_collect_request", "unknown_vpa_payment", "refund_reversal_bait"},
}

_CLAIM_TEXT_PATTERNS = {
    "payment": _re.compile(r"\b(?:upi|vpa|payment|transfer|refund|cashback|bhim|paytm|phonepe|gpay|money)\b", _re.IGNORECASE),
    "delivery": _re.compile(r"\b(?:parcel|package|shipment|courier|delivery|customs|indiapost|blue\s*dart|order)\b", _re.IGNORECASE),
    "job": _re.compile(r"\b(?:job|recruitment|salary|hiring|interview|vacancy|work\s+from\s+home|hr)\b", _re.IGNORECASE),
    "bank": _re.compile(r"\b(?:bank|account|kyc|sbi|hdfc|icici|axis|pnb|debit|credit\s*card|pan|aadhaar)\b", _re.IGNORECASE),
}


def _infer_claim_type(signals: List[Signal], normalized: Optional[NormalizedInput] = None) -> Optional[str]:
    """Best-effort guess at the message's claimed nature, for the CD checklist.

    Order matters: payment/delivery/job are more specific than the generic bank
    fallback, so check them first.
    """
    ids = {s.id for s in signals}
    for claim in ("payment", "delivery", "job", "bank"):
        if ids & _CLAIM_TYPE_HINTS[claim]:
            return claim
    if normalized:
        for claim in ("payment", "delivery", "job", "bank"):
            if _CLAIM_TEXT_PATTERNS[claim].search(normalized.text):
                return claim
    return "bank"


def build_recommended_action(
    level: RiskLevel,
    signals: List[Signal],
    language: str = "en",
    normalized: Optional[NormalizedInput] = None,
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
        claim = _infer_claim_type(signals, normalized)
        if claim:
            checklist = localization.checklist_for(language, claim)
            if checklist:
                steps = checklist

    return RecommendedAction(primary=primary, steps=steps, reporting=reporting)
