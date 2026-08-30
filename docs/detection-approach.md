# Detection Approach

## Why not just ask the model?

The obvious build is: send the message to a language model, ask "is this a scam, and why?", render
the answer. It works surprisingly well in a demo and fails in three ways that matter.

1. **It cannot check facts about the world.** The model has no idea when `sbi-rewards.in` was
   registered or whether it resolves to a residential IP. Those are the strongest signals available
   and they require a lookup.
2. **It is inconsistent.** The same message can get different verdicts on different runs. For a tool
   people are meant to trust, this is disqualifying.
3. **It invents evidence.** Asked to justify a verdict, a model will produce plausible-sounding
   reasons that aren't grounded in the input. Our entire value proposition is that the reasoning is
   checkable, so fabricated evidence isn't a rough edge — it's the product failing.

So: signals produce facts, the model produces explanation.

---

## Layer 1 — Deterministic signals

Each detector is a pure function from normalized input to a list of signal objects. Every signal
carries the exact evidence span that triggered it.

### URL inspection

| Signal | Severity | Notes |
|---|---|---|
| Domain registered < 30 days ago | High | Strongest single signal available. Scam domains are disposable |
| Domain registered < 180 days ago | Medium | |
| IP address instead of domain name | High | Almost never legitimate in a consumer message |
| High-risk TLD (`.tk`, `.xyz`, `.online`, `.top`, `.click`, ...) | Medium | Cheap TLDs correlate with disposable use. Medium only — legitimate sites use them |
| URL shortener | Medium | Hides the destination. Resolve where possible, then re-inspect |
| Punycode / mixed-script domain | High | Direct visual spoofing |
| HTTP where HTTPS expected | Low | Weak on its own now, meaningful in combination |
| Excessive subdomain nesting | Medium | `sbi.secure.login.attacker.com` reads as SBI to a scanning eye |

### Brand lookalike matching

The highest-value detector, and the one that needs curation rather than cleverness.

We maintain a static list of official domains for Indian banks, telecoms, government services, major
e-commerce, and payment apps. A domain in message text is flagged when it:

- contains a known brand token (`sbi`, `hdfc`, `icici`, `paytm`, `upi`, `aadhaar`, ...) **and** does
  not match that brand's official domain, or
- is within a small edit distance of an official domain (`gooogle.com`, `paytrn.in`)

This is where the "trusted-source verification" in the proposal becomes concrete. It's a curated
allowlist, not a vague claim — and it's honest about coverage: brands outside the list get no signal
either way, which is a case for the Cannot Determine tier rather than a silent pass.

### Pattern matching

| Pattern | Severity | Example trigger |
|---|---|---|
| Urgency + consequence | Medium | "within 24 hours or your account will be blocked" |
| Credential request | High | asks for PIN, OTP, CVV, password, full card number |
| Advance fee | High | registration / processing / security deposit before a job or prize |
| Unsolicited prize | Medium | lottery, lucky draw, cashback you didn't enter |
| Authority impersonation | Medium | claims to be bank, police, income tax, courier customs |
| Generic salutation from a "known" sender | Low | "Dear Customer" from an entity that has your name |
| Guaranteed returns | High | investment messaging promising fixed or guaranteed profit |
| Off-channel redirect | Medium | "contact us on WhatsApp at..." from a supposed institution |

Patterns are phrase families, not single keywords, and are maintained in Kannada and Hindi as well as
English — scam messages in this region are frequently mixed-script.

### Contact channel checks
Flags structural mismatches: a bank message from a personal email domain, a government notice from a
10-digit mobile number, a recruiter using a free email address while claiming a named company.

---

## Layer 2 — Model reasoning

One call. Input: normalized content plus the full signal list. Output: strict JSON.

The prompt enforces three constraints:

1. **Ground every claim.** Each explanation must reference a supplied signal or quote a span of the
   input. No outside assertions about the sender, the brand, or the world.
2. **Write for a non-technical reader.** No security jargon. Explain what a lookalike domain *is*,
   not just that one was found.
3. **Report uncertainty rather than resolving it.** If signals conflict, say so. Do not pick a side
   to seem decisive.

The model also catches what the rules miss: novel scam framings, emotional manipulation, social
engineering structure that no regex encodes. That's its genuine contribution — the rules handle the
known, the model handles the shape.

---

## Layer 3 — Arbitration

| Condition | Result |
|---|---|
| ≥ 2 high-severity signals | Dangerous |
| 1 high-severity signal | Suspicious (minimum) |
| Medium signals only, model concurs | Suspicious |
| Signals conflict, or brand not in allowlist and content ambiguous | Cannot Determine |
| No signals, model finds nothing | Safe |
| Model proposes higher than signals suggest | Take the model's level |
| Model proposes lower than signals suggest | **Ignore** — keep the signal-derived level |

That last row is the safety property. The model can raise an alarm on something the rules missed. It
can never talk the system out of an alarm the rules raised. A false "this is fine" is the failure
that gets someone's money taken.

---

## What this approach cannot do

Worth saying out loud, including to judges:

- A scam with clean grammar, an aged domain, and no urgency cues will likely read as Safe or Cannot
  Determine. Sophisticated targeted fraud is out of reach.
- WHOIS coverage is uneven, particularly for `.in` domains. Missing age data is treated as absent,
  not as safe.
- The brand allowlist is finite and manually maintained. Coverage outside it is weak.
- We assess content only. We cannot verify whether the user actually holds an account with the bank
  in question, which is often the fastest disambiguator.

The Cannot Determine tier exists because of this list, not in spite of it.
