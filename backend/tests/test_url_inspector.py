"""URL inspector tests: age thresholds, TLD, IP, shortener, http, subdomains, punycode."""

from __future__ import annotations

from app.pipeline.normalizer import normalize
from app.pipeline.signals import url_inspector


def _ids(text):
    return {s.id for s in url_inspector.detect(normalize(text))}


def test_new_domain_high_under_30_days(set_domain_ages):
    set_domain_ages({"scam-site.online": 6})
    sigs = url_inspector.detect(normalize("http://scam-site.online/x"))
    new = [s for s in sigs if s.id == "new_domain"]
    assert new and new[0].severity.value == "high"
    assert "6 days" in new[0].title


def test_recent_domain_medium_under_180_days(set_domain_ages):
    set_domain_ages({"scam-site.online": 90})
    sigs = url_inspector.detect(normalize("http://scam-site.online/x"))
    ids = {s.id: s.severity.value for s in sigs}
    assert ids.get("recent_domain") == "medium"
    assert "new_domain" not in ids


def test_old_domain_no_age_signal(set_domain_ages):
    set_domain_ages({"scam-site.online": 2000})
    ids = {s.id for s in url_inspector.detect(normalize("http://scam-site.online/x"))}
    assert "new_domain" not in ids and "recent_domain" not in ids


def test_missing_age_is_not_safe(set_domain_ages):
    # Domain not in the map -> unknown. No age signal, but NOT treated as safe:
    # other signals (TLD, http) still fire.
    set_domain_ages({})
    ids = _ids("http://scam-site.online/x")
    assert "new_domain" not in ids
    assert "high_risk_tld" in ids  # still flagged on other grounds


def test_ip_literal_high():
    assert "ip_address_url" in _ids("http://192.168.10.5/login")


def test_high_risk_tld_medium():
    sigs = url_inspector.detect(normalize("https://foo.xyz"))
    assert any(s.id == "high_risk_tld" and s.severity.value == "medium" for s in sigs)


def test_url_shortener():
    assert "url_shortener" in _ids("https://bit.ly/abc123")


def test_insecure_http_low():
    sigs = url_inspector.detect(normalize("http://foo.com"))
    assert any(s.id == "insecure_http" and s.severity.value == "low" for s in sigs)


def test_excessive_subdomains():
    assert "excessive_subdomains" in _ids("https://sbi.secure.login.attacker.com")


def test_punycode_high():
    sigs = url_inspector.detect(normalize("http://xn--80ak6aa92e.com/verify"))
    assert any(s.id == "punycode_domain" and s.severity.value == "high" for s in sigs)


def test_official_domain_short_circuits_all_soft_signals(set_domain_ages):
    # An official domain short-circuits every soft signal (age/tld/subdomain/http).
    set_domain_ages({"hdfcbank.com": 5})  # even a "new" official domain stays quiet
    ids = _ids("http://netbanking.hdfcbank.com/login")
    assert ids == set()
