# 🏗️ Build Plan & Execution Milestones

Execution tracking for the **Digital Safety Co-pilot (Sudarshan Kavach AI)** project.

---

## ✅ Phase 1 — Skeleton & Core Architecture (Completed)
- [x] Repository setup, FastAPI application, and modular pipeline design.
- [x] Next.js 14 web application with App Router, TypeScript, and responsive UI.
- [x] Model protocol definition with structured JSON parsing.
- [x] WHOIS domain-age provider with graceful fallback for unavailable records.
- [x] Tesseract OCR screenshot ingestion pipeline with confidence scoring.
- **Checkpoint Met**: End-to-end flow from message submission to structured evidence returned.

---

## ✅ Phase 2 — Deterministic Signal Layer (Completed)
- [x] Normalizer: URL extraction, Unicode canonicalization, and zero-width character stripping.
- [x] Brand allowlist: Curated ~55 official Indian institutional domains (banks, telecoms, government).
- [x] Brand lookalike matcher: Token containment + Levenshtein distance typosquatting detector.
- [x] URL inspector: Subdomain depth, IP literals, URL shorteners, punycode homoglyphs, and TLD tiers.
- [x] Pattern matcher: Comprehensive scam phrase families (KYC, electricity cutoff, lottery, job scams).
- [x] Payment rails matcher: UPI collect request traps, reversal fraud, and advance-fee detectors.
- [x] Mandatory evidence spans: Every signal object strictly quotes the verbatim triggering text.
- [x] Arbitration safety rule: Model cannot de-escalate hard deterministic risk signals.
- **Checkpoint Met**: 100% deterministic detection without LLM calls on baseline dataset.

---

## ✅ Phase 3 — Reasoning & The Four Tiers (Completed)
- [x] High-speed LLM Reasoner Integration: **Groq (Qwen 3.8 27B)** for sub-second inference with deterministic fallback.
- [x] Citation invariant: Model explanations strictly tied to verifiable signals without hallucinations.
- [x] Cannot Determine tier: Triggered upon inconclusive evidence, low confidence, or channel conflict.
- [x] Actionable checklists: Category-specific verification steps (banking, delivery, job offers).
- [x] National helpline handoff: Immediate action cards for 1930 and cybercrime.gov.in.
- [x] Offline fallback: Automatic switch to DeterministicReasoner when API keys or network are absent.
- **Checkpoint Met**: All 4 tiers (Safe, Suspicious, Dangerous, Cannot Determine) verified reachable.

---

## ✅ Phase 4 — Evaluation & Benchmarking (Completed)
- [x] 100-message benchmark dataset constructed (50 scam, 50 legit) across 13 fraud categories.
- [x] Automated test suite: **158 pytest test cases** passing offline in ~1.1s.
- [x] Full evaluation harness: Python & Node.js test runners measuring latency, recall, and precision.
- [x] Groundedness enforcement: Strict validation preventing fabricated quotes or invented domains.
- **Checkpoint Met**: 100% precision on Dangerous tier and 0% false positives on legitimate sample.

---

## ✅ Phase 5 — Production Interface (Completed)
- [x] Mobile-first layout with high-contrast accessibility standards.
- [x] Evidence-dominant result cards: Highlighting verbatim quotes from submitted content.
- [x] Interactive multi-modal scanner: Text paste, URL extraction, and screenshot drag-and-drop upload.
- [x] Clean loading indicator with animated feedback steps.
- [x] Prominent privacy guarantee: \"We store nothing. Processed in-memory and discarded.\"
- **Checkpoint Met**: High-fidelity, polished, responsive frontend live at /check.

---

## ✅ Phase 6 — Indic Localization (Completed)
- [x] Multi-language support: **English**, **Hindi (हिंदी)**, **Kannada (ಕನ್ನಡ)**, and **Telugu (తెలుగు)**.
- [x] Immutable safety-critical translations: Emergency helpline text, reporting URLs, and action checklists pre-written natively.
- [x] Comprehensive Indic typography with custom font stacks for Devanagari, Kannada, and Telugu scripts.
- **Checkpoint Met**: Seamless real-time language toggling across all screens and analysis cards.

---

## ✅ Phase 7 — Production Hosting & Deployment (Completed)
- [x] **Frontend hosted on Vercel**:
  - Edge network routing, automated build optimization, zero-config Next.js 14 hosting.
  - Proxy route /api/analyze forwarding to Railway with on-device fallback.
  - ercel.json and .env.example configurations created.
- [x] **Backend hosted on Railway**:
  - Production Dockerfile with Python 3.11-slim and system Tesseract OCR with Indic packs.
  - Procfile and ailway.toml healthcheck configurations.
  - Environment-based CORS origin filtering supporting Vercel production domains.
- **Checkpoint Met**: Production-ready deployment artifacts and verified clean builds.
