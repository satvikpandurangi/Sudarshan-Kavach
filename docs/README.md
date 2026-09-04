# 📚 Digital Safety Co-pilot — Engineering Documentation

This directory contains the comprehensive architectural, algorithmic, safety, and evaluation specifications for the **Digital Safety Co-pilot (Sudarshan Kavach AI)**.

> *Before you Click, Pay, Share, or Trust — Check with your Digital Safety Co-pilot.*

**Team Hayagreeva** · YUKTIMANTHAN 2.0 Hackathon  
Aditi · K Vardhan · Prateek Deshpande · Satvik Pandurangi

---

## 🎯 The Core Thesis

Existing scam checkers return an opaque binary verdict — "safe" or "unsafe" — and stop there. That may suffice for a security professional, but it fails a vulnerable smartphone user who has just received an urgent SMS claiming their electricity connection or bank account will be terminated today.

Our output is structured as **actionable evidence, not an opaque verdict**:

`
Risk Level → Detected Warning Signs (Verbatim Evidence) → Plain Explanation → Recommended Action
`

The explanation is the product. If users understand *why* sbi-kyc-verify.online is fraudulent, they develop the mental model to spot the next phishing attempt without assistance.

---

## 📑 Documentation Index

| Document | Purpose & Summary | Status |
|---|---|---|
| [docs/architecture.md](architecture.md) | Full system design, components, data flow, dual LLM integration, and production hosting topology on Vercel & Railway | Complete |
| [docs/api-spec.md](api-spec.md) | OpenAPI request/response schema, field reference, error envelopes, and endpoint specifications | Complete |
| [docs/detection-approach.md](detection-approach.md) | Deterministic signal layers, Groq/Anthropic reasoning, and arbitration guardrails | Complete |
| [docs/false-positives.md](false-positives.md) | The four-tier risk model, math behind the Cannot Determine uncertainty tier, and conflict resolution | Complete |
| [docs/evaluation.md](evaluation.md) | Evaluation methodology, benchmark dataset taxonomy, and groundedness invariant enforcement | Complete |
| [docs/scope.md](scope.md) | Production feature boundaries, deliberate exclusions, and post-hackathon roadmap | Complete |
| [docs/problem-statement.md](problem-statement.md) | Formal problem statement, target audience personas, and societal impact analysis | Complete |
| [docs/build-plan.md](build-plan.md) | Implementation milestones, phase checkoffs, and production deployment checklist | Complete |
| [docs/demo-script.md](demo-script.md) | 5-minute hackathon judging walkthrough and live demonstration runbook | Complete |

---

## 🚀 Quick Links

- [Root README](../README.md): Project overview, features, and quickstart.
- [Operations & Deployment Manual](../RUNNING.md): Turnkey guide for hosting on **Vercel** (Frontend) and **Railway** (Backend).
- [Frontend Documentation](../frontend/README.md): Next.js 14 App Router, UI components, and fallback engine.
- [Evaluation Harness](../eval/README.md): Benchmark metrics, regression testing, and groundedness validation.
