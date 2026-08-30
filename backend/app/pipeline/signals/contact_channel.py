"""Contact-channel checker.

architecture.md / detection-approach.md: flags structural mismatches between a
claimed sender and the actual channel — e.g. a "bank" or government notice that
asks you to reply to a personal Gmail address, or a recruiter using a free email
while claiming a named company.

This is deliberately conservative. It only fires when BOTH an
institutional/authority claim AND a free-email (or personal-channel) contact
appear, so a plain personal email on its own is never flagged. Evidence is the
exact free-email address (or channel phrase) found in the content.
"""

from __future__ import annotations

import re
from typing import List

from app.pipeline.normalizer import NormalizedInput
from app.schemas import Severity, Signal

# Free / personal email providers. An institution contacting you from one of
# these is a mismatch.
FREE_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.in", "outlook.com", "hotmail.com",
    "rediffmail.com", "ymail.com", "proton.me", "protonmail.com", "icloud.com",
    "live.com", "mail.com",
}

_EMAIL_RE = re.compile(r"\b[a-z0-9._%+\-]+@([a-z0-9.\-]+\.[a-z]{2,})\b", re.IGNORECASE)

# Phrases that assert an institutional / employer / authority identity.
_INSTITUTION_CLAIM = re.compile(
    r"\b(?:bank|kyc|account|hr\s+department|human\s+resources|recruit(?:er|ment)|"
    r"company|income\s*tax|government|govt|official|customs|police|"
    r"support\s+team|verification\s+team|hiring)\b",
    re.IGNORECASE,
)


def detect(normalized: NormalizedInput) -> List[Signal]:
    text = normalized.text
    signals: List[Signal] = []

    claims_institution = bool(_INSTITUTION_CLAIM.search(text))
    if not claims_institution:
        return signals

    for m in _EMAIL_RE.finditer(text):
        domain = m.group(1).lower()
        if domain in FREE_EMAIL_DOMAINS:
            signals.append(
                Signal(
                    id="channel_mismatch",
                    severity=Severity.medium,
                    evidence=m.group(0),
                    title="Official-sounding message from a personal email",
                    detail=(
                        "This message claims to be from a company or authority "
                        "but uses a free personal email address. Genuine "
                        "organisations write from their own domain, not from a "
                        "Gmail or Yahoo account."
                    ),
                )
            )
            break  # one mismatch signal is enough

    return signals
