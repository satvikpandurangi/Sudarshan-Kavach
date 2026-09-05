"""Brand lookalike matcher — the highest-value detector.

A domain is flagged when it either:
  - contains a known brand token but is not that brand's official domain, or
  - is within a small edit distance of an official domain (typosquat).

detection-approach.md is explicit that this needs curation over cleverness; the
data lives in brands.py and expands in Phase 2. Coverage is honest: brands
outside the list get no signal either way, which is a Cannot Determine case, not
a silent pass.
"""

from __future__ import annotations

from typing import List

from app.pipeline.normalizer import NormalizedInput
from app.schemas import Severity, Signal

from . import brands
from .urlutil import parse_url


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cost = 0 if ca == cb else 1
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost))
        prev = cur
    return prev[-1]


def detect(normalized: NormalizedInput) -> List[Signal]:
    signals: List[Signal] = []

    for raw_url in normalized.urls:
        parsed = parse_url(raw_url)
        if parsed.is_ip_literal or not parsed.host:
            continue

        registered = parsed.registered_domain

        # Exact official match — nothing to flag.
        if registered in brands.OFFICIAL_DOMAINS or parsed.host in brands.OFFICIAL_DOMAINS:
            continue

        host = parsed.host
        flagged = False

        # 1) Brand-token containment: host contains a brand token but the
        #    registered domain or host is not that brand's official domain.
        for token, official in brands.BRAND_OFFICIAL_DOMAINS.items():
            if token in host and registered not in official and host not in official:
                example = sorted(official)[0]
                signals.append(
                    Signal(
                        id="lookalike_domain",
                        severity=Severity.high,
                        evidence=raw_url,
                        title=f"Link is not an official {token.upper()} address",
                        detail=(
                            f"This web address contains '{token}' but it is not "
                            f"owned by {token.upper()}. The real address is "
                            f"{example}. Scammers register addresses containing "
                            "a brand's name so the link looks official at a glance."
                        ),
                    )
                )
                flagged = True
                break

        if flagged:
            continue

        # 2) Typosquat: the registered domain's main label is a tiny edit away
        #    from a brand token or an official domain's main label
        #    (e.g. gooogle -> google, paytrn -> paytm, flpkart -> flipkart).
        #    Comparing labels rather than full domains catches the common case
        #    where only the brand word is misspelled and the TLD differs.
        candidate_label = _main_label(registered)
        if not candidate_label:
            continue

        target = _closest_typosquat_target(candidate_label)
        if target is not None:
            signals.append(
                Signal(
                    id="typosquat_domain",
                    severity=Severity.high,
                    evidence=raw_url,
                    title="Link imitates a real website's spelling",
                    detail=(
                        f"This address is a near-copy of '{target}' with a small "
                        "spelling change. It is a common trick to make a fake "
                        "site look like the real one."
                    ),
                )
            )

    return signals


def _main_label(registered_domain: str) -> str:
    """The most significant label of a registered domain (e.g. eTLD+1 -> 'sbi').

    For `paytrn.in` -> `paytrn`; for `sbi.co.in` -> `sbi`.
    """
    if not registered_domain:
        return ""
    parts = registered_domain.split(".")
    return parts[0] if parts else ""


# Targets to compare against: every brand token plus the main label of every
# official domain. Deduplicated. Short tokens are excluded from fuzzy matching
# because a 1-2 edit distance on a 3-letter word is too noisy.
# A few well-known brand words whose canonical form differs from their official
# domain's main label (e.g. Google's consumer domain label is "pay"), so we name
# them explicitly as typosquat targets.
_EXTRA_BRAND_WORDS = {"google", "paytm", "flipkart", "amazon", "netflix"}


def _typosquat_targets() -> set[str]:
    targets: set[str] = set(brands.BRAND_OFFICIAL_DOMAINS.keys())
    for official in brands.OFFICIAL_DOMAINS:
        label = _main_label(official)
        if label:
            targets.add(label)
    targets |= _EXTRA_BRAND_WORDS
    return {t for t in targets if len(t) >= 5}


_TYPOSQUAT_TARGETS = _typosquat_targets()


def _closest_typosquat_target(label: str) -> str | None:
    if len(label) < 5:
        return None
    # An exact label match is not a typosquat (it is either official or a
    # containment case already handled above).
    if label in _TYPOSQUAT_TARGETS:
        return None
    for target in _TYPOSQUAT_TARGETS:
        # Skip if the label simply contains the target — that is containment,
        # handled by rule 1, not a misspelling.
        if target in label:
            continue
        distance = _levenshtein(label, target)
        if 0 < distance <= 2 and abs(len(label) - len(target)) <= 2:
            return target
    return None
