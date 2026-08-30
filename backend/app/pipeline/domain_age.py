"""Domain-age lookup (WHOIS), with graceful failure.

detection-approach.md: domain registration age is the strongest single signal
available. But WHOIS is a live network dependency with uneven coverage,
especially for .in domains, and the docs are explicit: treat it as best-effort,
and *missing age data is treated as absent, not as safe*.

Design:
  - A DomainAgeProvider protocol returns the registration age in days, or None
    when it cannot be determined (lookup failed, no data, timeout, error).
  - The signal layer only ever emits a new-domain signal on a concrete age. A
    None result produces no signal — it never lowers risk.
  - The provider is injectable so the signal layer stays deterministic and
    offline-testable. The default is WHOIS-backed with a short timeout and a
    small in-process cache; tests use a fake provider.

This module has no hard dependency on the whois package. If it is not installed
(or the network is down), lookups return None and the system degrades to the
Phase 1 behaviour rather than crashing.
"""

from __future__ import annotations

import datetime as _dt
from typing import Optional, Protocol


class DomainAgeProvider(Protocol):
    def age_days(self, registered_domain: str) -> Optional[int]:
        """Age of the domain in days, or None if it cannot be determined."""
        ...


class NullDomainAgeProvider:
    """Always returns None. The safe offline default and the degraded path.

    Using this provider makes the domain-age signal simply not fire, which is
    exactly the "missing data is not safe data" behaviour we want when WHOIS is
    unavailable.
    """

    def age_days(self, registered_domain: str) -> Optional[int]:
        return None


class WhoisDomainAgeProvider:
    """WHOIS-backed lookup. Best-effort; any failure yields None.

    Kept dependency-soft: `python-whois` is imported lazily so the package is
    optional. A per-process cache avoids repeat lookups within a session (we
    store nothing across requests).
    """

    def __init__(self, timeout_seconds: float = 4.0) -> None:
        self._timeout = timeout_seconds
        self._cache: dict[str, Optional[int]] = {}

    def age_days(self, registered_domain: str) -> Optional[int]:
        if not registered_domain:
            return None
        if registered_domain in self._cache:
            return self._cache[registered_domain]

        age = self._lookup(registered_domain)
        self._cache[registered_domain] = age
        return age

    def _lookup(self, domain: str) -> Optional[int]:
        try:
            import whois  # type: ignore
        except Exception:
            # Package not installed — degrade silently.
            return None

        try:
            data = whois.whois(domain)
        except Exception:
            # Network error, no WHOIS server, parse failure — all mean "unknown".
            return None

        created = getattr(data, "creation_date", None)
        if isinstance(created, list):
            created = created[0] if created else None
        if not isinstance(created, _dt.datetime):
            return None

        now = _dt.datetime.now(tz=created.tzinfo) if created.tzinfo else _dt.datetime.now()
        try:
            delta = now - created
        except Exception:
            return None
        days = delta.days
        return days if days >= 0 else None


# The provider used by the pipeline. Defaults to WHOIS-backed; can be swapped in
# tests or forced to null for a fully offline run.
_provider: DomainAgeProvider = WhoisDomainAgeProvider()


def get_provider() -> DomainAgeProvider:
    return _provider


def set_provider(provider: DomainAgeProvider) -> None:
    """Swap the active provider (used by tests and the offline/degraded path)."""
    global _provider
    _provider = provider
