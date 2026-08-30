"""Curated brand data for lookalike detection.

detection-approach.md / build-plan.md Phase 2: a curated allowlist of official
Indian domains across banks, telecoms, government, payment apps, and major
e-commerce. This is the highest-value data in the build.

Two structures:
  - BRAND_OFFICIAL_DOMAINS: brand token -> set of that brand's official domains.
    Used by the lookalike matcher (token containment) and to short-circuit
    structural signals on an exact official match.
  - OFFICIAL_DOMAINS: the flat set of every official domain, for exact-match
    checks and edit-distance typosquat comparison.

Coverage is honest and finite. A brand outside this list gets no signal either
way — a Cannot Determine case, not a silent pass (false-positives.md).
"""

from __future__ import annotations

# Brand token -> set of that brand's official registered domains.
# Tokens are the substrings scammers embed to look official (e.g. "sbi").
BRAND_OFFICIAL_DOMAINS: dict[str, set[str]] = {
    # ---- Banks ----
    "sbi": {"onlinesbi.sbi", "sbi.co.in", "onlinesbi.com", "yonosbi.com"},
    "hdfc": {"hdfcbank.com", "hdfc.com"},
    "icici": {"icicibank.com", "icici.com"},
    "axis": {"axisbank.com"},
    "kotak": {"kotak.com"},
    "pnb": {"pnbindia.in", "netpnb.com"},
    "bob": {"bankofbaroda.in", "bankofbaroda.com"},
    "canara": {"canarabank.com"},
    "unionbank": {"unionbankofindia.co.in"},
    "boi": {"bankofindia.co.in"},
    "idfc": {"idfcfirstbank.com"},
    "yesbank": {"yesbank.in"},
    "indusind": {"indusind.com"},
    "federal": {"federalbank.co.in"},
    "rbl": {"rblbank.com"},
    # ---- Payment apps / UPI ----
    "paytm": {"paytm.com", "paytmbank.com"},
    "phonepe": {"phonepe.com"},
    "gpay": {"pay.google.com"},
    "googlepay": {"pay.google.com"},
    "bhim": {"bhimupi.org.in"},
    "upi": {"npci.org.in"},
    "npci": {"npci.org.in"},
    "razorpay": {"razorpay.com"},
    "cred": {"cred.club"},
    "mobikwik": {"mobikwik.com"},
    "freecharge": {"freecharge.in"},
    # ---- Telecoms ----
    "airtel": {"airtel.in", "airtel.com"},
    "jio": {"jio.com", "myjio.com"},
    "vi": {"myvi.in"},
    "vodafone": {"myvi.in"},
    "idea": {"myvi.in"},
    "bsnl": {"bsnl.co.in"},
    # ---- Government services ----
    "aadhaar": {"uidai.gov.in"},
    "uidai": {"uidai.gov.in"},
    "incometax": {"incometax.gov.in"},
    "pan": {"incometax.gov.in", "tin-nsdl.com", "utiitsl.com"},
    "epfo": {"epfindia.gov.in"},
    "gst": {"gst.gov.in"},
    "digilocker": {"digilocker.gov.in"},
    "cowin": {"cowin.gov.in"},
    "mygov": {"mygov.in"},
    "irctc": {"irctc.co.in"},
    "passport": {"passportindia.gov.in"},
    "eci": {"eci.gov.in"},
    "cybercrime": {"cybercrime.gov.in"},
    # ---- E-commerce / delivery ----
    "amazon": {"amazon.in", "amazon.com"},
    "flipkart": {"flipkart.com"},
    "myntra": {"myntra.com"},
    "meesho": {"meesho.com"},
    "snapdeal": {"snapdeal.com"},
    "bluedart": {"bluedart.com"},
    "delhivery": {"delhivery.com"},
    "dtdc": {"dtdc.in"},
    "indiapost": {"indiapost.gov.in"},
    "ekart": {"ekartlogistics.com"},
    "swiggy": {"swiggy.com"},
    "zomato": {"zomato.com"},
    "netflix": {"netflix.com"},
}

# Flat set of all official domains, for exact-match short-circuiting and
# edit-distance comparison.
OFFICIAL_DOMAINS: set[str] = {
    domain for domains in BRAND_OFFICIAL_DOMAINS.values() for domain in domains
}
