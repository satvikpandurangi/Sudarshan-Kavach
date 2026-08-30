"""Small URL parsing helpers shared by the URL inspector and brand matcher."""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from urllib.parse import urlparse

_IP_LITERAL_RE = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")
# Punycode-encoded labels always begin with the ACE prefix "xn--".
_PUNYCODE_RE = re.compile(r"(?:^|\.)xn--", re.IGNORECASE)


@dataclass
class ParsedUrl:
    raw: str
    scheme: str
    host: str  # registrable host, lowercased, no port
    path: str
    is_ip_literal: bool

    @property
    def registered_domain(self) -> str:
        """Best-effort eTLD+1 without a public-suffix dependency.

        Handles common two-level TLDs used in India (.co.in, .gov.in, .org.in,
        .net.in, .ac.in) so `foo.sbi.co.in` reduces to `sbi.co.in`. Phase 2 can
        swap in the `tldextract` library for full accuracy.
        """
        if self.is_ip_literal or not self.host:
            return self.host
        parts = self.host.split(".")
        two_level = {"co", "gov", "org", "net", "ac", "edu", "res", "gen", "firm", "ind"}
        if len(parts) >= 3 and parts[-2] in two_level and parts[-1] == "in":
            return ".".join(parts[-3:])
        if len(parts) >= 2:
            return ".".join(parts[-2:])
        return self.host

    @property
    def tld(self) -> str:
        if self.is_ip_literal:
            return ""
        return self.host.rsplit(".", 1)[-1] if "." in self.host else ""

    @property
    def subdomain_depth(self) -> int:
        rd = self.registered_domain
        if not rd or self.is_ip_literal:
            return 0
        # Number of labels prepended to the registered domain.
        host_labels = self.host.split(".")
        rd_labels = rd.split(".")
        return max(0, len(host_labels) - len(rd_labels))

    @property
    def is_punycode(self) -> bool:
        """True if any label is punycode-encoded (xn--), a spoofing vector."""
        return bool(_PUNYCODE_RE.search(self.host))

    @property
    def is_mixed_script(self) -> bool:
        """True if the host mixes scripts (e.g. Latin + Cyrillic look-alikes).

        Decodes any punycode first so we inspect the characters a user actually
        sees. A domain that mixes, say, Latin and Cyrillic is almost always a
        homograph spoof of a Latin brand.
        """
        display = self.display_host
        scripts: set[str] = set()
        for ch in display:
            if ch in ".-" or ch.isdigit():
                continue
            if not ch.isalpha():
                continue
            script = _char_script(ch)
            if script:
                scripts.add(script)
        return len(scripts) > 1

    @property
    def display_host(self) -> str:
        """The host as a user would see it, decoding punycode where possible."""
        if not self.is_punycode:
            return self.host
        try:
            return self.host.encode("ascii").decode("idna")
        except Exception:
            return self.host


def _char_script(ch: str) -> str:
    """Coarse Unicode script bucket for a single character."""
    try:
        name = unicodedata.name(ch)
    except ValueError:
        return ""
    # unicodedata.name embeds the script family, e.g. "CYRILLIC SMALL LETTER A".
    for family in ("LATIN", "CYRILLIC", "GREEK", "ARMENIAN", "HEBREW", "ARABIC", "DEVANAGARI"):
        if name.startswith(family):
            return family
    return "OTHER"


def parse_url(raw: str) -> ParsedUrl:
    candidate = raw
    if "://" not in candidate:
        candidate = "http://" + candidate
    parsed = urlparse(candidate)
    host = (parsed.hostname or "").lower()
    return ParsedUrl(
        raw=raw,
        scheme=parsed.scheme.lower(),
        host=host,
        path=parsed.path or "",
        is_ip_literal=bool(_IP_LITERAL_RE.match(host)),
    )
