"""Contact-channel checker tests."""

from __future__ import annotations

from app.pipeline.normalizer import normalize
from app.pipeline.signals import contact_channel


def _sigs(text):
    return contact_channel.detect(normalize(text))


def test_bank_from_free_email_flagged():
    sigs = _sigs("This is from HDFC Bank KYC team. Reply to hdfc.support@gmail.com")
    assert any(s.id == "channel_mismatch" and s.severity.value == "medium" for s in sigs)
    assert sigs[0].evidence == "hdfc.support@gmail.com"


def test_recruiter_from_free_email_flagged():
    sigs = _sigs("Our HR department is hiring. Send your resume to jobs.acme@yahoo.com")
    assert any(s.id == "channel_mismatch" for s in sigs)


def test_personal_email_without_institution_claim_not_flagged():
    # A plain personal message with a gmail address and no authority claim.
    assert _sigs("Hey, mail me the photos at rahul.personal@gmail.com") == []


def test_institution_from_corporate_email_not_flagged():
    assert _sigs("This is from HDFC Bank. Contact support@hdfcbank.com") == []
