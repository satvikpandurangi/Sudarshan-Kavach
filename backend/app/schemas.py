"""Pydantic models for the public API and internal signal contract.

These schemas are the fixed contract that both the deterministic signal layer and
the reasoning layer depend on (see build-plan.md: "agree the signal-object and
response schemas in the first hour and write them down"). Field shapes mirror
api-spec.md exactly.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #
class RiskLevel(str, Enum):
    safe = "safe"
    suspicious = "suspicious"
    dangerous = "dangerous"
    cannot_determine = "cannot_determine"


class Confidence(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Language(str, Enum):
    en = "en"
    kn = "kn"
    hi = "hi"


# --------------------------------------------------------------------------- #
# Request
# --------------------------------------------------------------------------- #
class AnalyzeRequest(BaseModel):
    # Validation intentionally permissive here; api-spec error codes
    # (content_empty / content_too_long) are enforced in the route so we can
    # return the documented error envelope rather than FastAPI's default 422.
    content: str
    language: Language = Language.en


# --------------------------------------------------------------------------- #
# Internal signal object (architecture.md / detection-approach.md)
# --------------------------------------------------------------------------- #
class Signal(BaseModel):
    """A deterministic signal-layer finding.

    `evidence` is mandatory and must be an exact substring of the submitted
    content. A signal that cannot point at the text that triggered it does not
    get to exist.
    """

    id: str
    severity: Severity
    evidence: str
    title: Optional[str] = None
    # `detail` is the raw machine-facing note produced by the detector.
    # The reasoning layer turns this into the user-facing `explanation`.
    detail: Optional[str] = None
    explanation: Optional[str] = None

    def to_public(self) -> "SignalOut":
        return SignalOut(
            id=self.id,
            severity=self.severity,
            evidence=self.evidence,
            title=self.title,
            explanation=self.explanation or self.detail or "",
        )


# --------------------------------------------------------------------------- #
# Response
# --------------------------------------------------------------------------- #
class SignalOut(BaseModel):
    id: str
    severity: Severity
    evidence: str
    title: Optional[str] = None
    explanation: str


class Reporting(BaseModel):
    helpline: str = "1930"
    url: str = "https://cybercrime.gov.in"
    text: Optional[str] = None


class RecommendedAction(BaseModel):
    primary: str
    steps: List[str] = Field(default_factory=list)
    reporting: Reporting = Field(default_factory=Reporting)


class AnalyzeResponse(BaseModel):
    risk_level: RiskLevel
    risk_score: Optional[int] = None
    confidence: Confidence
    signals: List[SignalOut] = Field(default_factory=list)
    summary: Optional[str] = None
    recommended_action: RecommendedAction
    extracted_urls: List[str] = Field(default_factory=list)
    processing_ms: int
    degraded: bool = False
    # Diagnostic code only; never raw provider errors, credentials or message text.
    degradation_reason: Optional[str] = None
    # Present only on the /analyze/image path (api-spec.md).
    extracted_text: Optional[str] = None
    ocr_confidence: Optional[float] = None


# --------------------------------------------------------------------------- #
# Error envelope (api-spec.md)
# --------------------------------------------------------------------------- #
class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody


class HealthResponse(BaseModel):
    status: str = "ok"
    reasoning_layer: str = "ok"
    ocr: str = "ok"
