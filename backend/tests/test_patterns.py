"""Pattern matcher tests: each family fires, urgency gating, evidence spans."""

from __future__ import annotations

from app.pipeline.normalizer import normalize
from app.pipeline.signals import patterns


def _ids(text):
    return {s.id for s in patterns.detect(normalize(text))}


def test_credential_request():
    assert "credential_request" in _ids("Please share your OTP and CVV to continue")


def test_advance_fee():
    assert "advance_fee" in _ids("Pay a registration fee to claim your job offer")


def test_guaranteed_returns():
    assert "guaranteed_returns" in _ids("Invest now for guaranteed returns of 20% daily")


def test_unsolicited_prize():
    assert "unsolicited_prize" in _ids("Congratulations! You have won a lucky draw")


def test_authority_impersonation_with_threat():
    # Authority name + a threat/demand -> flagged.
    assert "authority_impersonation" in _ids(
        "This is the income tax department. Pay a penalty now to avoid arrest."
    )
    assert "authority_impersonation" in _ids(
        "TRAI notice: your number will be disconnected due to illegal activity."
    )


def test_authority_name_alone_not_flagged():
    # Naming an authority without any threat/demand is NOT impersonation — this
    # is the legitimate "PAN-Aadhaar linking successful" case that a bare
    # authority-name match used to flag (found by the Phase 4 evaluation).
    assert "authority_impersonation" not in _ids(
        "Your PAN-Aadhaar linking is successful. No further action is needed. -Income Tax Department"
    )


def test_delivery_fee():
    assert "delivery_fee" in _ids("Your parcel is on hold. Pay customs clearance fee to release it")


def test_upi_collect_request():
    assert "upi_collect_request" in _ids(
        "To receive cashback, approve the collect request and enter your UPI PIN"
    )


def test_off_channel_redirect():
    assert "off_channel_redirect" in _ids("For KYC, contact us on WhatsApp at 9876543210")


def test_generic_salutation():
    assert "generic_salutation" in _ids("Dear Customer, your account needs attention")


def test_urgency_requires_companion_signal():
    # Urgency alone (no link/payment/credential) must NOT fire.
    assert "urgency_pressure" not in _ids("Please respond immediately, thank you")


def test_credential_request_negation_suppressed():
    # "Do not share your OTP" is safety advice, not a request (Phase 4 finding).
    assert "credential_request" not in _ids(
        "Your OTP is 550192. Do not share your OTP with anyone."
    )
    assert "credential_request" not in _ids(
        "We will never ask you to share your OTP or PIN."
    )


def test_urgency_with_official_link_not_flagged():
    # A promo whose only link is an official brand domain is legitimate urgency
    # and must NOT trigger the urgency signal (Phase 4 finding).
    assert "urgency_pressure" not in _ids(
        "Last day! 50% off ends today. Shop now at https://www.myntra.com"
    )


def test_urgency_with_unofficial_link_flagged():
    assert "urgency_pressure" in _ids(
        "Act immediately or lose access: http://random-unknown-site.top/verify"
    )


def test_urgency_fires_with_link():
    ids = _ids("Act immediately: http://foo.com/verify")
    assert "urgency_pressure" in ids


def test_urgency_fires_with_credential():
    ids = _ids("Share your OTP immediately or your account will be blocked")
    assert "urgency_pressure" in ids


def test_evidence_is_exact_substring():
    text = "Please share your OTP now"
    n = normalize(text)
    for s in patterns.detect(n):
        assert s.evidence in n.text, (s.id, s.evidence)
