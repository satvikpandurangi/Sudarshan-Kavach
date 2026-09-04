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
Explanations are generated natively in the requested language (English, Hindi, Kannada, Telugu).
Crucially, all safety-critical copy (recommended actions, Cannot Determine checklists, and national
reporting handoffs for 1930 / cybercrime.gov.in) are pre-written and immutable in `localization.py`
rather than machine-translated, guaranteeing 100% accuracy in the instructions the user executes.

---

## Production Stack

| Layer | Technology | Operational Role & Rationale |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | Server-rendered & static edge delivery, fast mobile-first UI, on-device fallback engine |
| **Backend** | FastAPI (Python 3.11+) + Uvicorn | High-throughput asynchronous pipeline orchestrator, signal regex/parsing engine |
| **Frontend Hosting** | **Vercel** | Global CDN edge network, automated SSL, zero-config Next.js SSR and server action execution |
| **Backend Hosting** | **Railway** | Production Docker container runtime, automated health checks, dynamic port binding, zero-maintenance |
| **Reasoning Engine** | **Groq AI (Qwen 3.8 27B)** | Ultra-fast (<800ms) structured JSON inference with deterministic rule fallback |
| **OCR Engine** | Tesseract 5.0+ (with Indic models) | Offline screenshot text extraction with character confidence thresholding |
| **Domain Intelligence** | python-whois + Curated Brand Allowlist | Live registration age calculation combined with a verified allowlist of ~55 Indian institutions |

---

## Production Hosting Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT                                    │
│       Mobile / Desktop Browser (English, Hindi, Kannada, Telugu)       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         VERCEL EDGE NETWORK                            │
│  - Next.js 14 Frontend Application (sudarshan-kavach.vercel.app)        │
│  - Static Asset CDN & App Router SSR                                   │
│  - API Route Proxy (`/api/analyze`) with BACKEND_URL routing           │
│  - Automatic Fallback to On-Device Heuristic Engine if Backend Fails   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ Internal HTTPS API Call
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RAILWAY CONTAINER RUNTIME                       │
│  - Containerized FastAPI Application (digital-safety.railway.app)       │
│  - Dynamic PORT allocation (${PORT:-8000}) & CORS configuration        │
│  - Health Check endpoint: `/api/v1/health`                             │
│  - Linux Container with system `tesseract-ocr` & Indic language packs  │
└──────────────────┬──────────────────────────────────┬──────────────────┘
                   │                                  │
                   ▼ (Primary)                        ▼ (Fallback)
        ┌──────────────────────┐          ┌──────────────────────┐
        │       GROQ API       │          │    DETERMINISTIC     │
        │   Qwen 3.8 27B LLM   │          │  Rule Engine (Local) │
        └──────────────────────┘          └──────────────────────┘
```

---

## What We Do Not Store (Privacy Invariant)

No submissions, no results, and no user identifiers are persisted. Content is processed entirely in memory
and discarded immediately after the HTTP response is dispatched. Because users submit sensitive banking
alerts and personal messages, holding zero data is the strongest security guarantee possible.

