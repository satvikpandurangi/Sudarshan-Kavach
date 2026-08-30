"""URL inspector detector.

Structural checks on extracted URLs (detection-approach.md, "URL inspection"):
domain age, risky TLD, IP literals, URL shorteners, HTTP vs HTTPS, excessive
subdomains, and punycode / mixed-script domains.

Domain age is looked up via an injectable DomainAgeProvider (domain_age.py).
Missing age data yields no signal — it is never treated as safe. With the null
provider (offline / degraded mode), age simply does not fire and the rest of the
inspector still runs.

Severity policy (false-positives.md):
  - A high-risk TLD alone is only medium and never reaches Dangerous on its own.
  - Known-good official domains short-circuit TLD/subdomain/shortener/age signals.
"""

from __future__ import annotations

from typing import List

from app.pipeline import domain_age
from app.pipeline.normalizer import NormalizedInput
from app.schemas import Severity, Signal

from . import brands
from .urlutil import parse_url

# Domain-age thresholds (detection-approach.md).
NEW_DOMAIN_HIGH_DAYS = 30
NEW_DOMAIN_MEDIUM_DAYS = 180

# Cheap TLDs that correlate with disposable/fraud use. Medium only.
HIGH_RISK_TLDS = {
    "tk", "xyz", "online", "top", "click", "gq", "ml", "cf", "ga",
    "buzz", "monster", "work", "rest", "fit", "loan", "country",
}

# Common URL shorteners — hide the true destination.
SHORTENER_HOSTS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "cutt.ly", "rebrand.ly", "rb.gy", "shorturl.at", "t.ly", "wa.me",
}


def detect(normalized: NormalizedInput) -> List[Signal]:
    signals: List[Signal] = []

    for raw_url in normalized.urls:
        parsed = parse_url(raw_url)
        registered = parsed.registered_domain

        # Known-good short-circuit: an exact official-domain match suppresses
        # the softer structural signals for this URL.
        is_official = registered in brands.OFFICIAL_DOMAINS

        # IP literal instead of a domain name — almost never legitimate.
        if parsed.is_ip_literal:
            signals.append(
                Signal(
                    id="ip_address_url",
                    severity=Severity.high,
                    evidence=raw_url,
                    title="Link uses a raw IP address",
                    detail=(
                        "The link points to a numeric IP address rather than a "
                        "named website. Legitimate consumer services almost "
                        "never do this."
                    ),
                )
            )
            # No further structural checks are meaningful on an IP literal.
            continue

        # Punycode / mixed-script — direct visual spoofing, high severity.
        # Runs before the official short-circuit, though official domains are
        # plain ASCII and never trigger it.
        if parsed.is_punycode or parsed.is_mixed_script:
            signals.append(
                Signal(
                    id="punycode_domain",
                    severity=Severity.high,
                    evidence=raw_url,
                    title="Link uses disguised characters",
                    detail=(
                        "This web address uses special or foreign-script "
                        "characters that look like ordinary letters. It is a "
                        "technique to make a fake address look identical to a "
                        "real one."
                    ),
                )
            )

        if is_official:
            continue

        # Domain age (WHOIS). Missing data -> no signal, never assume safe.
        age = domain_age.get_provider().age_days(registered)
        if age is not None:
            if age < NEW_DOMAIN_HIGH_DAYS:
                signals.append(
                    Signal(
                        id="new_domain",
                        severity=Severity.high,
                        evidence=raw_url,
                        title=f"This website was created {age} days ago",
                        detail=(
                            "Real bank and company websites have existed for "
                            "years. Sites created days ago are usually built for "
                            "a single fraud campaign and taken down soon after."
                        ),
                    )
                )
            elif age < NEW_DOMAIN_MEDIUM_DAYS:
                signals.append(
                    Signal(
                        id="recent_domain",
                        severity=Severity.medium,
                        evidence=raw_url,
                        title="This website was created recently",
                        detail=(
                            "This web address was registered within the last few "
                            "months. Long-established organisations have older "
                            "websites; a recent one is worth extra caution."
                        ),
                    )
                )

        # High-risk TLD.
        if parsed.tld in HIGH_RISK_TLDS:
            signals.append(
                Signal(
                    id="high_risk_tld",
                    severity=Severity.medium,
                    evidence=raw_url,
                    title=f"Uncommon web address ending (.{parsed.tld})",
                    detail=(
                        f"The link ends in .{parsed.tld}, a cheap domain type "
                        "often used for short-lived scam sites. Some legitimate "
                        "sites use it too, so this is a caution, not proof."
                    ),
                )
            )

        # URL shortener — destination is hidden.
        if parsed.host in SHORTENER_HOSTS or registered in SHORTENER_HOSTS:
            signals.append(
                Signal(
                    id="url_shortener",
                    severity=Severity.medium,
                    evidence=raw_url,
                    title="Link hides its real destination",
                    detail=(
                        "This is a shortened link. You cannot see where it "
                        "actually leads until you open it, which is exactly why "
                        "scammers use them."
                    ),
                )
            )

        # Excessive subdomain nesting — reads as a brand to a scanning eye.
        if parsed.subdomain_depth >= 3:
            signals.append(
                Signal(
                    id="excessive_subdomains",
                    severity=Severity.medium,
                    evidence=raw_url,
                    title="Link has an unusually layered address",
                    detail=(
                        "The address stacks several parts before the real "
                        "website name, a trick used to make a scam link look "
                        "like it belongs to a trusted brand."
                    ),
                )
            )

        # HTTP where HTTPS is expected — weak alone.
        if parsed.scheme == "http":
            signals.append(
                Signal(
                    id="insecure_http",
                    severity=Severity.low,
                    evidence=raw_url,
                    title="Link is not secure (http)",
                    detail=(
                        "The link uses an unencrypted connection. On its own "
                        "this is minor, but it adds to other warning signs."
                    ),
                )
            )

    return signals
