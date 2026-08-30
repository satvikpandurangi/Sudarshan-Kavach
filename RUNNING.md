# Running the prototype (Phase 1)

End-to-end skeleton: paste a message, get a structured, evidence-backed analysis.

## Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

- `POST /api/v1/analyze` — analyze pasted text (see `files (1)/api-spec.md`)
- `GET  /api/v1/health` — service health

## Frontend (React + Vite)

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend
on port 8000, so start the backend first.

## What Phase 1 covers

Full path: submission → normalize → deterministic signal layer → reasoning layer
→ scoring & arbitration → structured response with quoted evidence and a
recommended action.

The layers are modular (`backend/app/pipeline/`) so Phase 2's WHOIS lookup,
curated brand allowlist, and the model-backed reasoner drop in behind the
existing interfaces without changing the arbitration or the API contract.

## Tests (Phase 2)

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe -m pytest -q
```

Tests run fully offline — the WHOIS domain-age provider is replaced with a
deterministic fake, so there is no network dependency. The Phase 2 checkpoint
(`tests/test_checkpoint_10.py`) verifies the signal layer alone classifies 10
known messages correctly with no model involved.

## What Phase 2 adds

- Curated allowlist of ~55 official Indian domains (`pipeline/signals/brands.py`)
- WHOIS domain-age lookup with graceful failure (`pipeline/domain_age.py`):
  `<30 days` → high `new_domain`, `<180 days` → medium `recent_domain`, missing
  data → no signal (never assumed safe). Provider is injectable, so the layer
  stays offline-testable and degrades cleanly.
- Complete URL inspection: domain age, risky TLD, IP literals, shorteners,
  HTTP vs HTTPS, excessive subdomains, punycode / mixed-script
- Brand lookalike: token containment + edit-distance typosquat
- Full pattern families incl. delivery/customs and UPI collect-request
- Contact-channel checker (institution claim + free-email mismatch)
- Four-tier arbitration verified against the docs, including conflict →
  Cannot Determine, and the model-can-escalate-but-never-de-escalate rule

With domain age wired, the SBI phishing example now reaches **Dangerous**
(`lookalike_domain` + `new_domain`), and the legitimate HDFC case stays **Safe**.

## What Phase 3 adds

- **Model reasoning layer** (`pipeline/anthropic_reasoner.py`) behind the
  existing `Reasoner` protocol. One call receives ONLY the normalized content,
  the deterministic signals, and the requested language. It returns strict JSON
  (proposed risk level, per-signal explanations, summary).
- **Grounding enforced in code**, not just the prompt: explanation text is
  attached to signals but evidence spans always come from the deterministic
  signal (never the model); fabricated signal ids, ungrounded domain-age claims,
  and invented URLs in the summary are rejected and fall back safely.
- **Escalate-but-never-de-escalate** is enforced twice: the reasoner discards a
  below-floor proposal, and arbitration is the authoritative second guard.
- **Safe fallback everywhere**: network error, missing key, malformed JSON, or
  ungrounded output all fall back to the deterministic reasoner. The endpoint
  never breaks and never emits fabricated evidence.
- **Localization** (`pipeline/localization.py`): recommended-action, reporting
  (1930 / cybercrime.gov.in), and Cannot Determine checklists are pre-written in
  EN/KN/HI — never machine-translated, since these are the safety-critical
  sentences the user acts on. The model generates the explanations in-language.

To enable the model, set `ANTHROPIC_API_KEY` in the backend environment. Without
it, the app runs the deterministic reasoner. The test suite requires no key.

## Evaluation (Phase 4)

```powershell
cd backend
.\.venv\Scripts\python.exe -m eval.run_eval                 # deterministic (no key)
.\.venv\Scripts\python.exe -m eval.run_eval --mode anthropic  # model mode (needs key)
```

- Dataset: `eval/dataset.csv` — 100 sanitized messages, 50 scam / 50 legit, with
  the category distribution from `evaluation.md`. All personal details are
  placeholders.
- Reproducible: domain ages come from a fixed map (`eval/domain_ages.py`), so
  there is no network dependency and re-runs are identical. The run reports its
  mode (deterministic vs anthropic) so results are never ambiguous about source.
- Writes `eval/results.csv` and prints per-metric target comparison plus a
  per-category flag-rate breakdown.

Latest deterministic run (signals-only, n=100): detection 100%, false positives
0%, Dangerous-tier precision 100%, groundedness 100%, Cannot Determine 0%.

Caveats (stated honestly, per `evaluation.md`): 100 messages is a small,
hand-collected sample skewed toward common, recognisable scams, so these figures
are indicative, not a benchmark. The Cannot Determine rate is 0% in deterministic
mode because the richer CD triggers (unknown-brand ambiguity, low model
confidence) live in the reasoning layer; the CD tier itself is verified reachable
via the too-short and trust-conflict paths.

## What Phase 5 adds (interface)

Production-quality mobile-first React frontend around the existing API. Flow:
**Paste → Analyze → Understand → Act**.

- Landing/analyzer screen: product identity, one-line explanation, large input,
  paste-text / upload-screenshot tabs, EN/KN/HI selector, sample-scam shortcut,
  and the privacy statement ("We store nothing. Your submission is processed and
  discarded.")
- Evidence-forward result view: prominent risk banner for all four tiers,
  risk score, confidence dots, warning-sign cards where the **exact quoted
  evidence is visually dominant** (highlighted, monospace, labelled "From your
  message"), plain-language explanation, recommended action + steps, and the
  1930 / cybercrime.gov.in reporting handoff as tap-to-call / visit buttons.
- Cannot Determine is presented as a useful "how to check for yourself"
  checklist, not an error.
- Degraded mode shows a clear "offline check" note without looking broken.
- Polished loading state with a moving bar and cycling status lines.
- Screenshot path: drag/drop or tap upload, client-side type/size validation,
  the OCR'd text shown back to the user for confirmation above the verdict.
- Every documented API error maps to a friendly, actionable message.

The screenshot path needs an OCR engine (`pytesseract` + Pillow + the Tesseract
binary). Without it, `/analyze/image` degrades gracefully to `ocr_failed` with a
helpful message. The text path and all four tiers work with no extra install.

## What Phase 6 adds (localization & polish)

- **Full UI localization** (`frontend/src/strings.js`): every interface string —
  tagline, intro, tabs, buttons, loading steps, dropzone, error messages, risk
  labels/leads, severity words, footer — is hand-written in EN / KN / HI, not
  machine-translated. The result renders in the language it was analysed in,
  even if the dropdown changes afterwards.
- Safety-critical copy (recommended actions, reporting, Cannot Determine
  checklists) still comes pre-localized from the backend (`localization.py`).
- Typography: Noto Sans Kannada/Devanagari font stack and increased line-height
  for Indic scripts; the quoted-evidence block was strengthened (left accent +
  bolder label) to keep it the most prominent element on each card.
- **Tesseract OCR wired for real.** `ocr.py` locates the Tesseract binary via
  `TESSERACT_CMD`, PATH, or the standard Windows install path. Verified
  end-to-end: a scam screenshot is read at ~95% confidence and analysed to
  Dangerous with exact evidence. Graceful `ocr_failed` still applies when no
  text is found or the engine is absent.

To enable OCR: install Tesseract (Windows: `winget install UB-Mannheim.TesseractOCR`)
and `pip install pytesseract Pillow`. `/health` reports `ocr: "ok"` once present.

### Known boundaries (by design, from the docs)

- Reasoning runs on the deterministic fallback reasoner (`degraded: true`), not
  the language model yet — no API key required to demo. The Anthropic-backed
  reasoner slots in behind the `Reasoner` protocol in `pipeline/reasoning.py`
  (Phase 3).
- WHOIS coverage is uneven, especially for `.in` domains. Missing age data is
  treated as absent, not as safe — the signal simply does not fire. In offline
  or degraded mode the layer runs on structural + content signals alone.
- Screenshot/OCR (`/analyze/image`) is a later phase and intentionally absent.
