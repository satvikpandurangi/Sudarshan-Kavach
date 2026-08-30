"""Brand lookalike matcher tests: token containment + typosquat + official pass."""

from __future__ import annotations

from app.pipeline.normalizer import normalize
from app.pipeline.signals import brand_lookalike as bl


def _sigs(text):
    return bl.detect(normalize(text))


def test_token_containment_flags_lookalike():
    sigs = _sigs("http://sbi-kyc-verify.online/update")
    assert any(s.id == "lookalike_domain" and s.severity.value == "high" for s in sigs)


def test_token_containment_amazon():
    assert any(s.id == "lookalike_domain" for s in _sigs("https://amazon-refund.xyz"))


def test_typosquat_flags():
    for host in ("https://gooogle.com", "https://flpkart.com", "https://amazn.in"):
        sigs = _sigs(host)
        assert any(s.id == "typosquat_domain" and s.severity.value == "high" for s in sigs), host


def test_official_domain_not_flagged():
    for host in ("https://onlinesbi.sbi/login", "https://hdfcbank.com", "https://amazon.in"):
        assert _sigs(host) == [], host


def test_unrelated_domain_not_flagged():
    assert _sigs("https://my-personal-blog.com/post") == []


def test_ip_literal_ignored_by_lookalike():
    assert _sigs("http://192.168.0.1/sbi") == []
