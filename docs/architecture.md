# Architecture

## Design principle

Deterministic checks first, language model second.

A rule that says "this domain was registered 4 days ago" is verifiable, fast, cheap, and identical
on every run. A language model asked "is this a scam?" is none of those things. So the signal layer
runs first and produces hard facts; the model's job is to reason over those facts and explain them
in human language — not to be the detector of first resort.

This ordering also makes the system debuggable. When a verdict is wrong, we can see whether a signal
misfired or the model misread the signals.

---

## Data flow

```
                  ┌──────────────┐
   pasted text ──▶│              │
                  │  Normalizer  │──▶ clean text + extracted URLs
   screenshot ───▶│   (+ OCR)    │
                  └──────────────┘
                          │
                          ▼
                  ┌──────────────────────────────┐
                  │       Signal Layer           │
                  │  (deterministic, parallel)   │
                  │                              │
                  │  · URL inspector             │
                  │  · Brand lookalike matcher   │
                  │  · Pattern matcher           │
                  │  · Contact channel checker   │
                  └──────────────────────────────┘
                          │
                          ▼  signal objects (name, severity, evidence span)
                  ┌──────────────────────────────┐
                  │       Reasoning Layer        │
                  │      (language model)        │
                  │                              │
                  │  input: content + signals    │
                  │  output: structured JSON     │
                  └──────────────────────────────┘
                          │
                          ▼
                  ┌──────────────────────────────┐
                  │      Scoring & Arbitration   │
                  │  combines signals + model    │
                  │  decides Cannot Determine    │
                  └──────────────────────────────┘
                          │
                          ▼
                  ┌──────────────────────────────┐
                  │      Localization            │
                  │   EN / KN / HI rendering     │
                  └──────────────────────────────┘
                          │
                          ▼
                     result payload
```

---

## Components

### Normalizer
Cleans input into a canonical form. Strips zero-width characters (used to evade keyword filters),
normalizes Unicode lookalikes, unwraps common URL shorteners where resolvable, and extracts every
URL and phone number into a structured list.

For screenshots: OCR runs first, then the text takes the identical path. The rest of the system
does not know or care which input type it came from.

### Signal Layer
Independent detectors, each returning zero or more signal objects. A signal object carries:

```json
{
  "id": "lookalike_domain",
  "severity": "high",
  "evidence": "sbi-kyc-verify.online",
  "detail": "Contains 'sbi' but is not an official SBI domain"
}
```

The `evidence` field is mandatory. A signal that cannot point at the specific text that triggered it
does not get to exist — this is what makes the final explanation citable rather than hand-wavy.

Detectors:

| Detector | Checks |
|---|---|
| URL inspector | Domain age, TLD risk tier, IP literals, shortener use, HTTP vs HTTPS, excessive subdomains, punycode |
| Brand lookalike matcher | Compares domains against a curated list of Indian bank / telecom / government / e-commerce domains using string distance and substring-containment rules |
| Pattern matcher | Urgency phrasing, credential requests, advance-fee patterns, prize/lottery claims, threat-of-account-closure, generic salutation, unusual payment rails |
| Contact channel checker | Flags mismatch between claimed sender and actual channel — e.g. a "bank" message from a personal Gmail address or a 10-digit mobile number |

### Reasoning Layer
A single language model call. Receives the normalized content and the full signal list, and returns
structured JSON: a proposed risk level, per-sign explanations written for a non-technical reader,
and a recommended action.

The prompt constrains the model to explain signals it was given rather than inventing new evidence.
Any claim in the output must map to a signal or a directly quoted span of the input.

### Scoring & Arbitration
Combines the deterministic signal severities with the model's proposed level. Rules:

- Any high-severity signal floors the result at **Suspicious**
- Two or more high-severity signals → **Dangerous**
- Signals present but conflicting, or model confidence low → **Cannot Determine**
- No signals and model agrees → **Safe**

The model cannot override a hard signal downward. It can escalate but not de-escalate. This asymmetry
is deliberate: a hallucinated "actually this is fine" is the most dangerous failure mode we have.

Full logic in [`false-positives.md`](false-positives.md).

### Localization
Explanations are generated in English, then translated. Recommended actions and reporting details
are pre-written per language rather than machine-translated, since accuracy matters most in exactly
the sentence the user will act on.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Tailwind | Fast to build, mobile-first by default |
| Backend | FastAPI (Python) | Signal detectors are string/regex work; Python is fastest to iterate in |
| OCR | Tesseract, or a hosted vision API | Tesseract works offline — important if venue wifi is unreliable |
| Reasoning | Anthropic API | Structured JSON output, strong instruction-following for the citation constraint |
| Domain data | WHOIS lookup + static curated brand list | The static list is the reliable part; treat WHOIS as best-effort |
| Hosting | Vercel (frontend) + Render/Railway (API) | Free tier, fast deploy |

**Offline fallback:** if the venue network fails, the signal layer alone still produces a usable
result — warning signs with evidence, minus the natural-language explanation. Build this path; live
demos lose wifi.

---

## What we do not store

No submissions, no results, no identifiers. Content is processed in memory and discarded. Users
paste bank messages and personal details into this tool; the safest thing to hold is nothing.

Stated on the interface, not just in the docs — the trust claim only works if the user sees it.
