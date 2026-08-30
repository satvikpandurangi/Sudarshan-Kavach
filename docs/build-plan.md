# Build Plan

Two people, a hackathon window. The plan assumes roughly 24–30 working hours; compress the polish
phase first if the window is shorter.

---

## Ordering principle

Build the thing that can fail last, first.

The riskiest components are the ones you can't fake: OCR quality, domain-age lookups, and getting
structured JSON reliably out of the model. Do those in the first third. The UI is the least risky
part of this build and the most tempting to start with — resist it.

---

## Phase 1 — Skeleton and riskiest parts

**Goal: an ugly page that returns a real analysis.**

- [ ] Repo, FastAPI app, one `/analyze` endpoint returning a hardcoded response
- [ ] React page: textarea, submit button, raw JSON dump on screen
- [ ] Deploy both immediately, before there's anything worth deploying — deployment problems
      discovered at hour 22 are fatal, at hour 3 they're an inconvenience
- [ ] Model call returning valid structured JSON, reliably, across 10 test inputs
- [ ] WHOIS domain-age lookup working for `.com` and `.in`, with a graceful path when it fails
- [ ] OCR: one screenshot in, correct text out

**Checkpoint:** paste a scam message, get a real (unstyled) analysis back from the deployed app.

If the model isn't reliably returning parseable JSON by the end of this phase, stop and fix it. Every
later phase depends on it.

---

## Phase 2 — The signal layer

**Goal: deterministic detection that doesn't need the model at all.**

- [ ] Normalizer: URL extraction, Unicode cleanup, zero-width stripping
- [ ] Brand allowlist — curate 40–60 official Indian domains (banks, telecoms, government, payment
      apps, major e-commerce). This is manual data-entry work and it is the highest-value hour in
      the build
- [ ] Lookalike matcher: brand-token containment plus edit distance
- [ ] URL inspector: domain age, TLD tier, IP literals, shorteners, punycode, subdomain depth
- [ ] Pattern matcher: the phrase families from `detection-approach.md`, English first
- [ ] Signal objects carrying mandatory evidence spans
- [ ] Arbitration logic, including the rule that the model cannot de-escalate

**Checkpoint:** signals alone produce a correct risk level on 10 known scams, with no model involved.
This is also your degraded-mode path, so it needs to work standalone.

---

## Phase 3 — Reasoning and the four tiers

- [ ] Prompt that takes content + signals and returns grounded explanations
- [ ] Enforce the citation constraint; verify by hand on 15 outputs that no evidence is fabricated
- [ ] Cannot Determine tier and its trigger conditions
- [ ] Manual verification checklists, written per claim-type (bank, job, delivery, payment)
- [ ] Reporting handoff block — 1930 and cybercrime.gov.in
- [ ] Degraded mode: signals-only response when the model is unreachable

**Checkpoint:** all four tiers reachable with real messages you can name.

---

## Phase 4 — Evaluation set

Do this **before** the UI polish. It will change your tuning, and tuning after the UI is done means
re-testing everything.

- [ ] Collect 50 scam messages (ask your batch on WhatsApp — you'll have them in a day)
- [ ] Collect 50 legitimate messages, including the hard cases: real bank alerts with links, real
      OTPs, real delivery notifications
- [ ] Sanitize all personal details
- [ ] CSV: `id, text, true_label, category, source`
- [ ] Script to run all 100 and write results
- [ ] First measurement. Tune. Re-measure.
- [ ] Hand-check 20 outputs for evidence groundedness

**Checkpoint:** a number you can put on a slide, and no fabricated evidence in the sample.

---

## Phase 5 — Interface

Only now.

- [ ] Mobile-first layout — assume it's viewed on a phone
- [ ] Risk-level display with clear colour coding
- [ ] Warning-sign cards with evidence visibly quoted from the input. The quoting must be visually
      obvious; it's the whole product thesis
- [ ] Recommended-action block, primary action prominent
- [ ] Screenshot upload with extracted-text confirmation shown to the user
- [ ] Language toggle
- [ ] "We store nothing" stated on the interface itself
- [ ] Loading state — a 4-second wait with no feedback feels broken

---

## Phase 6 — Localization and polish

- [ ] Kannada and Hindi output
- [ ] Recommended actions and reporting text hand-written per language, not machine-translated
- [ ] Native reader on the team verifies both
- [ ] Error states for every code in `api-spec.md`
- [ ] Rate limiting

---

## Phase 7 — Demo preparation

- [ ] Final evaluation run, numbers slide updated
- [ ] Demo messages saved in a paste-ready file
- [ ] Full run-through, timed, twice
- [ ] Degraded mode tested with wifi off
- [ ] Hotspot backup confirmed working
- [ ] Q&A answers from `demo-script.md` reviewed by both of you

---

## Split

The clean seam is normalizer-output on one side, signal-objects on the other.

**Satvik — backend and detection**
Normalizer, signal layer, brand allowlist, arbitration, evaluation harness.

**Prateek — reasoning, interface, localization**
Prompt engineering, structured output handling, React app, OCR integration, translations.

**Together, early:** agree the signal-object and response schemas in the first hour and write them
down. Both halves depend on that contract, and renegotiating it at hour 20 costs more than the
feature you'd have built instead.

---

## Cut order under time pressure

If you're behind, cut in this sequence:

1. Hindi (keep Kannada — it's the regional differentiator at this venue)
2. Screenshot upload (text-only still demos the full thesis)
3. Evaluation set down to 60 messages, keeping the 50/50 split
4. Visual polish

**Never cut:** the evidence-quoting in the output, the Cannot Determine tier, or the legitimate-message
demo. Those three are the entire argument for why this project is different.
