"""Phase 2 checkpoint (build-plan.md):

    "signals alone produce a correct risk level on 10 known scams, with no model
     involved. This is also your degraded-mode path, so it needs to work
     standalone."

We run the full pipeline with the deterministic (no-model) reasoner — which is
the default and never escalates — so the risk level is entirely signal-derived.
Domain ages for the URL-bearing cases are supplied via the fake provider so the
test is offline and deterministic.

The set is 10 messages: 5 scams that must be flagged (suspicious/dangerous),
and 5 legitimate/undecidable cases that must NOT be flagged as scams — the half
of the problem that matters most (false-positives.md).
"""

from __future__ import annotations

import pytest

from app.pipeline.analyzer import analyze
from app.schemas import RiskLevel

# domain -> age in days, for the URLs that appear below.
AGES = {
    "sbi-kyc-verify.online": 6,
    "hdfc-secure.xyz": 12,
    "amazon-prize.top": 3,
    # legitimate official domains are old / irrelevant; left unset == unknown,
    # which is fine because official domains short-circuit age anyway.
}

FLAGGED = {RiskLevel.suspicious, RiskLevel.dangerous}
NOT_SCAM = {RiskLevel.safe, RiskLevel.cannot_determine}

CASES = [
    # ---- Scams: must be flagged ----
    (
        "sbi_phishing",
        "Dear customer, your SBI account will be blocked today. Complete KYC immediately: http://sbi-kyc-verify.online/update",
        RiskLevel.dangerous,
    ),
    (
        "hdfc_lookalike_new_domain",
        "Your HDFC account is suspended. Verify now at http://hdfc-secure.xyz/login",
        RiskLevel.dangerous,
    ),
    (
        "advance_fee_job",
        "Congratulations, you are selected. Pay a refundable registration fee to confirm your job.",
        FLAGGED,
    ),
    (
        "upi_collect_fraud",
        "To receive your Rs 5000 cashback, approve the collect request and enter your UPI PIN.",
        FLAGGED,
    ),
    (
        "prize_lottery",
        "You have won a lottery of Rs 10,00,000. Pay processing fee to claim your prize now.",
        FLAGGED,
    ),
    # ---- Legitimate / undecidable: must NOT be flagged as a scam ----
    (
        "legit_hdfc_link",
        "Dear Rahul, your account statement is ready. Login at https://netbanking.hdfcbank.com",
        RiskLevel.safe,
    ),
    (
        "genuine_otp",
        "123456 is your OTP for your transaction. Do not share it with anyone.",
        NOT_SCAM,
    ),
    (
        "legit_delivery",
        "Your Amazon order has shipped. Track it at https://amazon.in/orders",
        RiskLevel.safe,
    ),
    (
        "legit_promo_urgency",
        "Last day! Flat 40% off on Myntra. Shop now at https://myntra.com",
        NOT_SCAM,
    ),
    (
        "unknown_company",
        "Hi, this is Acme Solutions regarding your enquiry. Please call us back.",
        NOT_SCAM,
    ),
]


@pytest.mark.parametrize("name,message,expected", CASES, ids=[c[0] for c in CASES])
def test_checkpoint_signal_layer_only(set_domain_ages, name, message, expected):
    set_domain_ages(AGES)
    # Default reasoner is the deterministic no-model fallback -> level is
    # entirely signal-derived.
    result = analyze(message)
    if isinstance(expected, set):
        assert result.risk_level in expected, (
            f"{name}: got {result.risk_level.value}, expected one of "
            f"{sorted(e.value for e in expected)}"
        )
    else:
        assert result.risk_level == expected, (
            f"{name}: got {result.risk_level.value}, expected {expected.value}"
        )
