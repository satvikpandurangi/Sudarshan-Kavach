# Digital Safety Co-pilot

An AI assistant that tells people **why** a message might be a scam — not just whether it is one.

Paste a suspicious SMS, WhatsApp message, email, or screenshot. Get back a risk level, the specific
warning signs found **in the content**, a plain-language explanation, and what to do next — in
English, Kannada, or Hindi.

> Before you Click, Pay, Share, or Trust — check with your Digital Safety Co-pilot.

**Team Hayagreeva** · YUKTIMANTHAN 2.0 Hackathon · Satvik Pandurangi · Prateek Deshpande

---

## Why it's different

Existing scam checkers return a verdict — "safe" or "unsafe" — and stop. Our output is structured as
**evidence, not a verdict**:

```
Risk level → Warning signs (with exact quoted evidence) → Plain explanation → Recommended action
```

The explanation is the product. If a user learns *why* `hdfc-kyc-verify.online` is not HDFC Bank,
they can spot the next one without us.

Three things set it apart:

- **Evidence over verdict.** Every warning quotes the exact triggering text/domain from the message.
- **An honest uncertainty tier.** A four-tier model (Safe / Suspicious / Dangerous / **Cannot
  Determine**) that admits when it can't be sure and gives a manual verification checklist instead of
  guessing.
- **Regional language output.** Explanations and safety-critical instructions in Kannada and Hindi
  alongside English.

## Architecture

Deterministic checks first, language model second:

```
input → normalize → signal layer (deterministic) → reasoning layer (LLM) → arbitration → localization
```

- The **signal layer** produces verifiable facts (lookalike domains, WHOIS domain age, risky TLDs,
  scam-pattern phrases, contact-channel mismatches), each carrying an exact evidence span.
- The **reasoning layer** (Anthropic) explains those signals for a non-technical reader. It can
  escalate a verdict but **never de-escalate** one — a hallucinated "this is fine" is the failure
  mode we most need to prevent.
- Everything degrades gracefully: with no API key or network, the signal layer alone still produces a
  usable, evidence-backed result.

## Stack

- **Backend:** FastAPI (Python), pytest. Deterministic signal detectors + Anthropic reasoning.
- **Frontend:** React + Vite, mobile-first.
- **OCR:** Tesseract (optional) for the screenshot path.

## Repository layout

| Path | What's in it |
|---|---|
| `backend/` | FastAPI app, analysis pipeline, evaluation harness, tests |
| `frontend/` | React + Vite interface |
| `docs/` | Problem statement, architecture, detection approach, evaluation, API spec, build plan |
| `RUNNING.md` | How to run the backend, frontend, tests, and evaluation |

## Quick start

See [`RUNNING.md`](RUNNING.md) for full setup. In short:

```bash
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## Status

Working prototype. Text + screenshot input, all four risk tiers, EN/KN/HI output, evidence-backed
explanations, and a graceful offline/degraded path. Evaluation harness included (`backend/eval/`).

## Privacy

No accounts. No history. Content is processed in memory and discarded — we store nothing.
