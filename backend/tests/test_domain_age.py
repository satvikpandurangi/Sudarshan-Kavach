"""Domain-age provider tests: graceful failure, and 'missing is not safe'."""

from __future__ import annotations

import datetime as dt

from app.pipeline import domain_age


def test_null_provider_returns_none():
    assert domain_age.NullDomainAgeProvider().age_days("anything.com") is None


def test_whois_provider_missing_package_returns_none(monkeypatch):
    # Simulate the whois package being absent by breaking the import.
    import builtins

    real_import = builtins.__import__

    def fake_import(name, *args, **kwargs):
        if name == "whois":
            raise ImportError("no whois")
        return real_import(name, *args, **kwargs)

    monkeypatch.setattr(builtins, "__import__", fake_import)
    provider = domain_age.WhoisDomainAgeProvider()
    assert provider.age_days("example.com") is None


def test_whois_provider_handles_lookup_exception(monkeypatch):
    fake_whois = type("M", (), {"whois": staticmethod(lambda d: (_ for _ in ()).throw(RuntimeError("boom")))})
    monkeypatch.setitem(__import__("sys").modules, "whois", fake_whois)
    provider = domain_age.WhoisDomainAgeProvider()
    assert provider.age_days("example.com") is None


def test_whois_provider_computes_age(monkeypatch):
    created = dt.datetime.now() - dt.timedelta(days=10)
    result = type("R", (), {"creation_date": created})()
    fake_whois = type("M", (), {"whois": staticmethod(lambda d: result)})
    monkeypatch.setitem(__import__("sys").modules, "whois", fake_whois)
    provider = domain_age.WhoisDomainAgeProvider()
    assert provider.age_days("example.com") == 10


def test_whois_provider_caches(monkeypatch):
    calls = {"n": 0}

    def whois_fn(d):
        calls["n"] += 1
        return type("R", (), {"creation_date": dt.datetime.now() - dt.timedelta(days=5)})()

    fake_whois = type("M", (), {"whois": staticmethod(whois_fn)})
    monkeypatch.setitem(__import__("sys").modules, "whois", fake_whois)
    provider = domain_age.WhoisDomainAgeProvider()
    provider.age_days("example.com")
    provider.age_days("example.com")
    assert calls["n"] == 1


def test_whois_provider_no_creation_date_returns_none(monkeypatch):
    result = type("R", (), {"creation_date": None})()
    fake_whois = type("M", (), {"whois": staticmethod(lambda d: result)})
    monkeypatch.setitem(__import__("sys").modules, "whois", fake_whois)
    provider = domain_age.WhoisDomainAgeProvider()
    assert provider.age_days("example.com") is None
