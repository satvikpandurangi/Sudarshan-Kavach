"""Anthropic-backed reasoning layer.

Implements the existing Reasoner protocol (reasoning.py). One model call takes
the normalized content, the deterministic signal list, and the requested
language, and returns strict JSON: a proposed risk level, a per-signal
explanation, and a plain-language summary — all in the requested language.

Hard guarantees enforced in code, not just in the prompt:

  1. The model receives ONLY normalized content, the signal objects, and the
     language. Nothing else about the user or the world.
  2. Output is validated before it leaves this module:
       - every explanation must be grounded (map to a supplied signal or quote
         an exact span of the input),
       - proposed level must be a valid tier,
       - the model may only propose escalation relative to the signals; a
         de-escalation proposal is discarded here as well (arbitration is the
         second, authoritative guard).
  3. Any failure — network, missing key, malformed JSON, ungrounded output —
     falls back to the DeterministicReasoner. The endpoint never breaks and
     never returns fabricated evidence.

The Anthropic client is injected, so the whole module is testable with a mock
and needs no real API key.
"""

from __future__ import annotations

import json
import re
from typing import Any, List, Optional, Protocol

from app.pipeline.normalizer import NormalizedInput
from app.pipeline.reasoning import DeterministicReasoner, Reasoner, ReasoningResult, model_error_reason
from app.schemas import Confidence, RiskLevel, Severity, Signal

DEFAULT_MODEL = "claude-3-5-sonnet-latest"
_MAX_TOKENS = 1024

# Signal-severity -> minimum risk level that severity implies. Used to reject a
# model that tries to propose *below* what the signals already justify.
_SIGNAL_FLOOR = {
    "two_high": RiskLevel.dangerous,
    "one_high": RiskLevel.suspicious,
    "medium": RiskLevel.suspicious,
    "none": RiskLevel.safe,
}

_LEVEL_RANK = {
    RiskLevel.safe: 0,
    RiskLevel.cannot_determine: 1,
    RiskLevel.suspicious: 2,
    RiskLevel.dangerous: 3,
}


class AnthropicClient(Protocol):
    """Minimal surface we need from the Anthropic SDK, so tests can mock it."""

    def create_message(self, *, model: str, max_tokens: int, system: str, user: str) -> str:
        """Return the model's text output for the given prompt."""
        ...


class _RealAnthropicClient:
    """Adapter over the official anthropic SDK. Imported lazily."""

    def __init__(self, api_key: Optional[str] = None) -> None:
        import anthropic  # type: ignore

        self._client = anthropic.Anthropic(api_key=api_key) if api_key else anthropic.Anthropic()

    def create_message(self, *, model: str, max_tokens: int, system: str, user: str) -> str:
        resp = self._client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        # Concatenate text blocks.
        parts = []
        for block in resp.content:
            text = getattr(block, "text", None)
            if text:
                parts.append(text)
        return "".join(parts)


_LANGUAGE_NAMES = {"en": "English", "hi": "Hindi", "kn": "Kannada", "te": "Telugu"}


class AnthropicReasoner:
    """Model-backed Reasoner with strict grounding and a safe fallback."""

    def __init__(
        self,
        client: AnthropicClient,
        model: str = DEFAULT_MODEL,
        fallback: Optional[Reasoner] = None,
    ) -> None:
        self._client = client
        self._model = model
        self._fallback = fallback or DeterministicReasoner()

    # -- public API (Reasoner protocol) ------------------------------------ #
    def reason(
        self, normalized: NormalizedInput, signals: List[Signal], language: str
    ) -> ReasoningResult:
        try:
            raw = self._client.create_message(
                model=self._model,
                max_tokens=_MAX_TOKENS,
                system=self._system_prompt(),
                user=self._user_prompt(normalized, signals, language),
            )
        except Exception as exc:
            # Network / auth / SDK error -> degraded mode via deterministic path.
            return self._degrade(normalized, signals, language, model_error_reason(exc))

        parsed = _safe_json(raw)
        if parsed is None:
            return self._degrade(normalized, signals, language, "model_invalid_json")

        result = self._build_validated_result(parsed, normalized, signals)
        if result is None:
            # Output failed validation (ungrounded / malformed shape) -> fallback.
            return self._degrade(normalized, signals, language, "model_output_validation_failed")
        return result

    def _degrade(self, normalized, signals, language, reason: str) -> ReasoningResult:
        result = self._fallback.reason(normalized, signals, language)
        result.degraded = True
        result.degradation_reason = reason
        return result

    # -- prompt ------------------------------------------------------------ #
    @staticmethod
    def _system_prompt() -> str:
        return (
            "You are the reasoning layer of a scam-detection tool for a "
            "non-technical audience in India. You are given a message and a list "
            "of deterministic warning signals already found in it by a separate "
            "rule engine.\n\n"
            "Your job is to evaluate the content, provide grounded explanations, "
            "and assess whether a scam, phishing, or predatory scheme is present. Rules you must "
            "follow exactly:\n"
            "1. Ground every explanation in a supplied signal or an exact quote "
            "from the message. Never state a fact about the sender, the brand, a "
            "URL, a domain's age, or the world that is not in the input or the "
            "signals.\n"
            "2. Never invent URLs, phone numbers, domains, dates, or evidence.\n"
            "3. Write for someone with no security knowledge. Explain what a term "
            "means; do not just name it.\n"
            "4. If the message or URL promotes an unsolicited prize, lottery, car/cash reward, "
            "online rummy/betting, unregistered APK download, fake KYC/banking alert, or suspicious shortened link, "
            "classify it as 'suspicious' or 'dangerous' with medium or high confidence.\n"
            "5. If the link is our verified official domain (sudarshan-kavach.vercel.app), "
            "classify it as 'safe' with high confidence.\n"
            "6. Only propose 'cannot_determine' if the message is genuinely ambiguous, contradictory, "
            "or lacks enough context to assess.\n"
            "7. You may propose a HIGHER risk level than the signals suggest if "
            "the wording reveals a scam the rules missed. You may NEVER propose a "
            "lower level to reassure the user.\n\n"
            "Respond with ONLY a JSON object, no prose, in this exact shape:\n"
            "{\n"
            '  "risk_level": "safe|suspicious|dangerous|cannot_determine",\n'
            '  "confidence": "high|medium|low",\n'
            '  "summary": "2-3 plain sentences",\n'
            '  "signal_explanations": {"<signal_id>": "<plain explanation>"}\n'
            "}\n"
            "Every key in signal_explanations must be one of the given signal "
            "ids (if no signals were provided, use empty dict {}). Write summary and explanations in the requested language."
        )

    @staticmethod
    def _user_prompt(
        normalized: NormalizedInput, signals: List[Signal], language: str
    ) -> str:
        lang_name = _LANGUAGE_NAMES.get(language, "English")
        signal_lines = [
            {
                "id": s.id,
                "severity": s.severity.value,
                "evidence": s.evidence,
                "detail": s.detail or "",
            }
            for s in signals
        ]
        payload = {
            "language": lang_name,
            "message": normalized.text,
            "signals": signal_lines,
        }
        return (
            "Analyse the following. Explain each signal and give a summary in "
            f"{lang_name}.\n\n" + json.dumps(payload, ensure_ascii=False, indent=2)
        )

    # -- validation -------------------------------------------------------- #
    def _build_validated_result(
        self,
        parsed: dict,
        normalized: NormalizedInput,
        signals: List[Signal],
    ) -> Optional[ReasoningResult]:
        # Shape checks.
        level = _coerce_level(parsed.get("risk_level"))
        confidence = _coerce_confidence(parsed.get("confidence"))
        summary = parsed.get("summary")
        explanations = parsed.get("signal_explanations") or {}
        if level is None or not isinstance(explanations, dict):
            return None
        if summary is not None and not isinstance(summary, str):
            return None

        valid_ids = {s.id for s in signals}
        content = normalized.text

        # Attach explanations to signals, keeping only grounded ones. An
        # explanation is grounded if it belongs to a real signal id. We do NOT
        # trust the model's free text to contain new evidence — the evidence
        # span always comes from the deterministic signal, never the model.
        enriched: List[Signal] = []
        for sig in signals:
            model_expl = explanations.get(sig.id)
            explanation = (
                model_expl
                if isinstance(model_expl, str) and model_expl.strip()
                else (sig.explanation or sig.detail)
            )
            enriched.append(sig.model_copy(update={"explanation": explanation}))

        # Reject fabricated signal ids: if the model explained ids that do not
        # exist, that is a fabrication attempt -> discard the whole output.
        if any(k not in valid_ids for k in explanations.keys()):
            return None

        # Summary grounding: the summary must not introduce a URL or numeric
        # "fact" that is not present in the input. This catches the classic
        # "this site was registered 6 days ago" hallucination when no such
        # signal exists.
        if summary and not _summary_is_grounded(summary, content, signals):
            return None

        # Escalate-only: discard a proposed level below the signal floor. The
        # authoritative guard is still arbitration; this is defence in depth.
        floor = _signal_floor(signals)
        proposed_level: Optional[RiskLevel] = level
        if _LEVEL_RANK[level] < _LEVEL_RANK[floor]:
            proposed_level = None  # ignore de-escalation; let signals stand

        return ReasoningResult(
            signals=enriched,
            summary=summary,
            proposed_level=proposed_level,
            proposed_confidence=confidence,
            degraded=False,
        )


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _safe_json(raw: str) -> Optional[dict]:
    if not raw or not isinstance(raw, str):
        return None
    # Strip a ```json fence if present.
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    else:
        # Grab the first {...} block if there is surrounding prose.
        brace = re.search(r"\{.*\}", text, re.DOTALL)
        if brace:
            text = brace.group(0)
    try:
        data = json.loads(text)
    except Exception:
        return None
    return data if isinstance(data, dict) else None


def _coerce_level(value: Any) -> Optional[RiskLevel]:
    try:
        return RiskLevel(value)
    except Exception:
        return None


def _coerce_confidence(value: Any) -> Optional[Confidence]:
    try:
        return Confidence(value)
    except Exception:
        return None


def _signal_floor(signals: List[Signal]) -> RiskLevel:
    highs = sum(1 for s in signals if s.severity == Severity.high)
    meds = sum(1 for s in signals if s.severity == Severity.medium)
    if highs >= 2:
        return RiskLevel.dangerous
    if highs == 1 or meds >= 1:
        return RiskLevel.suspicious
    return RiskLevel.safe


# URLs and standalone numbers the model might fabricate in the summary.
_URL_IN_TEXT = re.compile(r"https?://\S+|www\.\S+|\b[a-z0-9\-]+\.[a-z]{2,}\b", re.IGNORECASE)
_AGE_CLAIM = re.compile(r"\b\d+\s*(?:day|days|week|weeks|month|months|year|years)\b", re.IGNORECASE)


def _summary_is_grounded(summary: str, content: str, signals: List[Signal]) -> bool:
    """Reject summaries that assert facts not present in the input or signals.

    Conservative: we only block clear fabrications — a domain-age claim (e.g.
    "created 6 days ago") when no new_domain/recent_domain signal fired, or a URL
    in the summary that does not appear in the message.
    """
    lc_content = content.lower()

    # Domain-age claims require a corresponding age signal.
    if _AGE_CLAIM.search(summary):
        has_age_signal = any(s.id in ("new_domain", "recent_domain") for s in signals)
        # Allow the claim only if an age signal justifies it.
        if not has_age_signal:
            return False

    # Any URL/domain mentioned in the summary must appear in the message.
    for m in _URL_IN_TEXT.finditer(summary):
        token = m.group(0).lower().strip(".,);:")
        # Ignore common non-domain words that the regex might catch inside prose
        # is unlikely because it requires a dot; check membership in content.
        if token not in lc_content:
            return False

    return True
