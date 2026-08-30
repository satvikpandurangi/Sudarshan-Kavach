"""Normalizer: cleans raw input into a canonical form and extracts structure.

Responsibilities (architecture.md):
  - Strip zero-width characters used to evade keyword filters
  - Normalize Unicode lookalikes to a canonical form (NFKC)
  - Extract every URL and phone number into a structured list

The rest of the system does not know or care whether the input came from pasted
text or OCR — both converge here.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import List

# Zero-width and other invisible formatting characters commonly used to break
# up keywords (e.g. "O\u200bTP") so naive matchers miss them.
_ZERO_WIDTH = "".join(
    [
        "\u200b",  # zero width space
        "\u200c",  # zero width non-joiner
        "\u200d",  # zero width joiner
        "\u2060",  # word joiner
        "\ufeff",  # zero width no-break space / BOM
        "\u00ad",  # soft hyphen
    ]
)
_ZERO_WIDTH_RE = re.compile(f"[{_ZERO_WIDTH}]")

# URL matcher. Handles http(s):// and bare www./domain-like tokens. Kept
# deliberately permissive; the URL inspector decides what is meaningful.
_URL_RE = re.compile(
    r"""(?xi)
    (
        # IP-literal URL — requires an explicit scheme so we don't grab bare
        # numbers or version strings. The URL inspector flags these as high risk.
        https?://\d{1,3}(?:\.\d{1,3}){3}(?::\d{2,5})?(?:/[^\s<>"'()]*)?
      |
        # Named-domain URL (scheme optional).
        \b
        (?:https?://)?          # optional scheme
        (?:www\.)?              # optional www
        (?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+   # domain labels
        [a-z]{2,24}             # TLD
        (?::\d{2,5})?           # optional port
        (?:/[^\s<>"'()]*)?      # optional path/query
    )
    """
)

# Indian phone numbers: +91 / 0 prefixed 10-digit mobiles, and bare 10-digit.
_PHONE_RE = re.compile(
    r"(?<!\d)(?:\+?91[\-\s]?|0)?[6-9]\d{9}(?!\d)"
)


@dataclass
class NormalizedInput:
    raw: str
    text: str  # cleaned, canonical text — what detectors run against
    urls: List[str] = field(default_factory=list)
    phone_numbers: List[str] = field(default_factory=list)


def _strip_zero_width(text: str) -> str:
    return _ZERO_WIDTH_RE.sub("", text)


def _normalize_unicode(text: str) -> str:
    # NFKC folds many visual lookalikes / full-width forms to canonical ASCII.
    return unicodedata.normalize("NFKC", text)


def extract_urls(text: str) -> List[str]:
    seen: List[str] = []
    for match in _URL_RE.finditer(text):
        url = match.group(1).rstrip(".,);:'\"")
        if url and url not in seen:
            seen.append(url)
    return seen


def extract_phone_numbers(text: str) -> List[str]:
    seen: List[str] = []
    for match in _PHONE_RE.finditer(text):
        num = match.group(0)
        if num not in seen:
            seen.append(num)
    return seen


def normalize(raw: str) -> NormalizedInput:
    """Run the full normalization pass over raw input."""
    text = _strip_zero_width(raw)
    text = _normalize_unicode(text)

    return NormalizedInput(
        raw=raw,
        text=text,
        urls=extract_urls(text),
        phone_numbers=extract_phone_numbers(text),
    )
