# Digital Safety Co-pilot

An AI assistant that tells people **why** a message might be a scam — not just whether it is one.

Paste a suspicious SMS, WhatsApp message, email, or screenshot. Get back a risk level, the specific
warning signs found in the content, a plain-language explanation, and what to do next.

> Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.

**Team Hayagreeva** · YUKTIMANTHAN 2.0 Hackathon
Aditi · K Vardhan · Prateek Deshpande · Satvik Pandurangi

---

## The gap we're filling

Existing scam checkers return a verdict — "safe" or "unsafe" — and stop there. That works for a
security engineer. It doesn't work for a first-time smartphone user who just got a message saying
their KYC will expire in 24 hours.

Our output is structured as evidence, not a verdict:

```
Risk Score  →  Detected Warning Signs  →  Explanation  →  Recommended Action
```

The explanation is the product. If a user learns *why* "hdfc-kyc-verify.online" is not HDFC Bank,
they can spot the next one without us.

---

## What ships in the hackathon window

| In scope | Deferred |
|---|---|
| Pasted text (SMS / WhatsApp / email body) | QR code decoding |
| Screenshot upload → OCR → analysis | PDF / document uploads |
| URL extraction and inspection | Browser extension |
| English + Kannada + Hindi output | Voice input |
| "Uncertain" tier with manual verification steps | Live threat-feed integration |
| Report handoff to 1930 / cybercrime.gov.in | User accounts, history |

Rationale for cutting the rest is in [`docs/scope.md`](docs/scope.md). Short version: eight input
types built shallowly demo worse than two built properly.

---

## Documentation

| Document | What's in it |
|---|---|
| [`docs/problem-statement.md`](docs/problem-statement.md) | Refined proposal — the version to submit |
| [`docs/scope.md`](docs/scope.md) | MVP boundary, cut list, post-hackathon roadmap |
| [`docs/architecture.md`](docs/architecture.md) | System design, components, data flow, stack |
| [`docs/detection-approach.md`](docs/detection-approach.md) | Signal layer, LLM layer, how the two combine |
| [`docs/false-positives.md`](docs/false-positives.md) | The uncertainty tier and why it matters most |
| [`docs/evaluation.md`](docs/evaluation.md) | Test set construction, metrics, target numbers |
| [`docs/api-spec.md`](docs/api-spec.md) | Endpoint contracts and response schema |
| [`docs/demo-script.md`](docs/demo-script.md) | The 5-minute judging run, minute by minute |
| [`docs/build-plan.md`](docs/build-plan.md) | Task breakdown and ownership split |

## Quick start

Not yet implemented — see [`docs/build-plan.md`](docs/build-plan.md) for the setup order.

## Status

Pre-build. Proposal submitted, scope locked, architecture drafted.
