"""The core product invariant: every signal's evidence is an exact substring
of the normalized submitted content. If this ever fails, the tool is fabricating
evidence — a serious bug, not a rounding error (evaluation.md)."""

from __future__ import annotations

import pytest

from app.pipeline.normalizer import normalize
from app.pipeline.signals import run_all

MESSAGES = [
    "Dear customer, your SBI account will be blocked today. Complete KYC: http://sbi-kyc-verify.online/update",
    "Congratulations! You won a lucky draw. Pay a registration fee to claim. WhatsApp us on 9876543210",
    "Your parcel is on hold. Pay customs clearance fee to release it.",
    "To receive cashback, approve the collect request and enter your UPI PIN.",
    "This is from HDFC Bank KYC team. Reply to hdfc.support@gmail.com",
    "Invest now for guaranteed returns of 20% daily, 100% safe.",
    "Login at http://192.168.0.5/verify immediately or account suspended.",
    "Verify your details at https://gooogle.com",
]


@pytest.mark.parametrize("message", MESSAGES)
def test_every_signal_evidence_is_exact_substring(set_domain_ages, message):
    set_domain_ages({})  # offline; content signals still fire
    normalized = normalize(message)
    signals = run_all(normalized)
    assert signals, f"expected at least one signal for: {message!r}"
    for s in signals:
        assert s.evidence, f"signal {s.id} has empty evidence"
        assert s.evidence in normalized.text, (
            f"signal {s.id} evidence {s.evidence!r} not a substring of input"
        )
