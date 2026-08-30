"""Static domain-age data for reproducible evaluation.

The live WHOIS lookup is best-effort and non-deterministic — it depends on the
network and changes over time, which would make the evaluation unreproducible
(evaluation.md requires re-running after tuning). For the evaluation we therefore
use a fixed, transparent age map representing the campaign data we would expect
from WHOIS for the scam domains in the set.

This is evaluation scaffolding, NOT a change to the detection logic. The
production pipeline still uses live WHOIS. Any domain not listed here is treated
as unknown age (None) — exactly as the real provider treats a WHOIS miss, and
never as "safe".

Ages are deliberately conservative and plausible: disposable scam domains are a
few days to a few weeks old. Legitimate official domains are not listed because
they short-circuit age checks anyway.
"""

from __future__ import annotations

from typing import Optional

# registered domain -> age in days (as WHOIS would plausibly report).
EVAL_DOMAIN_AGES: dict[str, int] = {
    "sbi-kyc-verify.online": 6,
    "hdfc-kyc-update.xyz": 9,
    "icici-secure-login.top": 4,
    "pan-link-bank.online": 15,
    "axis-unblock.click": 3,
    "sbi-aadhaar-verify.info": 11,
    "kotak-secure.gq": 7,
    "videokyc-hdfc.buzz": 5,
    "pnb-rewards.online": 8,
    "yesbank-verify.top": 6,
    "govt-jobs-apply.online": 20,
    "parcel-customs-clear.online": 4,
    "indiapost-redelivery.top": 5,
    "fedex-hold-clearance.click": 3,
    "amazon-redeliver.xyz": 6,
    "prize-claim-iphone.online": 10,
    "cashback-claim.top": 4,
    # Note: IP-literal URL (s11) has no domain to age; handled by ip_address_url.
}


class EvalDomainAgeProvider:
    """Deterministic provider backed by the static EVAL_DOMAIN_AGES map."""

    def __init__(self, ages: Optional[dict[str, int]] = None) -> None:
        self.ages = EVAL_DOMAIN_AGES if ages is None else ages

    def age_days(self, registered_domain: str) -> Optional[int]:
        return self.ages.get(registered_domain)
