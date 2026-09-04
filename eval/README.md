# Sudarshan Kavach evaluation

Measurement only. Replace the six `REPLACE ME` rows in `dataset.csv` with your
own real messages. The runner refuses selected placeholders; there is no sample
accuracy claim and no generated evaluation corpus. The existing legacy Python
dataset under `backend/eval/` is not read or modified by this harness.

Run commands from the repository root (the directory containing this `eval/`).
Node 20+ is required; no additional npm dependencies are needed. The current
Next.js route forwards to **Python**, so Node invokes the real
`backend/app/pipeline/analyzer.py` through a persistent Python adapter. A backend
server does not need to be running. The adapter uses the existing Groq client and
reasoner, leaving detection, normalization, grounding filters and arbitration
unchanged. This measures backend pipeline latency, not HTTP/frontend latency.

Use the backend's installed Python dependencies (`backend/requirements.txt`).
The runner automatically uses `backend/.venv` when present; otherwise it uses
`python` on Windows or `python3` elsewhere. Set `EVAL_PYTHON` to an executable
path to override it. `GROQ_API_KEY` and optional `GROQ_MODEL` come from the shell
environment or `backend/.env`, with shell values taking priority.

```sh
npm run eval:test
npm run eval -- --delay-ms 3000
npm run eval -- --limit 20 --category bank_phishing
npm run eval:report -- eval/results/<timestamp>.csv
npm run eval:baseline -- --delay-ms 3000
npm run eval:regression -- --delay-ms 3000
```

Other flags: `--dataset path`, `--results-dir path`, `--language en|hi|kn`,
`--timeout-ms 120000`, `--baseline path`. The default delay is 2000 ms; override
with `--delay-ms` or `EVAL_DELAY_MS`. Requests run strictly sequentially, with
the delay after each completed request except the last. There are no harness
retries. A timeout terminates the worker and fails the incomplete run. Increase
the delay if Groq limits are reached; degraded responses are retained for
diagnosis but make the run fail rather than silently measuring fallback quality.

## Dataset

UTF-8 CSV columns: `id,content,true_label,category,source,notes`. IDs must be
unique. Labels are exactly `safe` or `scam`. Content is preserved byte-for-byte
after CSV decoding, including case, whitespace, newlines and Unicode. The
backend's 5000-character content limit is checked before any API calls.
Quote fields containing commas, quotes or newlines; double any quotes inside a
quoted field. Filters apply by category first, then `--limit` in file order.

Allowed categories: `bank_phishing`, `fake_job`, `investment`, `delivery`,
`prize`, `upi_fraud`, `impersonation`, `legit_bank`, `legit_otp`, `legit_delivery`,
`legit_recruiter`, `legit_promo`, `legit_govt`.

## Results and groundedness

Each run produces a timestamped CSV with the nine requested columns plus
`category`, `degraded`, and `error`. Risk levels use backend spellings:
`safe`, `suspicious`, `dangerous`, `cannot_determine`.

- `predicted_level` and `final_level` both mean the authoritative final backend
  decision. `risk_score` is the backend value, blank for null (no invented score).
- `signals_fired` is a JSON array of deterministic signal IDs before reasoning.
- `model_proposed_level` is the raw model proposal **before** the production
  reasoner may discard a downgrade. Blank means no parsable proposal was
  returned. A raw invalid proposal is retained as-is for diagnosis.
- `latency_ms` times the actual pipeline call, including model/URL work, excluding
  process startup and configured delay. Failed calls use elapsed wall time.
- `groundedness_ok` requires every public, deterministic, and returned reasoning
  signal to have nonempty string evidence that is a literal, case-sensitive
  substring of the original submitted content. No normalization or fuzzy
  matching is allowed. Internal signals are also checked because the current
  backend hides public signals on Cannot Determine responses.

Every grounding violation is a hard failure (exit code 1). The runner finishes
remaining reachable rows so all violations are collected, prints the failing
cases in full, and writes `.failures.json` with the entire dataset row, response,
raw model output, signal snapshots, and stage/index of every violation. Counts
are given for failing rows and stage-specific signal observations (one signal
may fail in more than one stage). `.audit.jsonl` retains full traces for all
rows. `.meta.json` records run status, cohort hash, model, settings, metrics,
and completeness. Keep these files together when sharing reports; they contain
the submitted messages. Generated results are gitignored.

The check validates literal evidence, not whether an explanation logically
follows from that evidence. Rejected raw model output remains in the audit;
the harness does not bypass the backend's existing output validation.

## Metrics and baseline

Detection = flagged scams / all completed scams; false positives = flagged safe
rows / all completed safe rows. They are always displayed together, overall and
per category. Flagged means Suspicious or Dangerous. Cannot Determine stays in
the denominators and is not flagged. Dangerous precision = scams classified
Dangerous / all Dangerous decisions. Cannot Determine rate = those decisions /
all completed decisions. Empty denominators display `N/A`, never zero.
Latency p50/p95 use nearest rank: sorted latency at `ceil(p * n)`.

Errors are never relabelled Cannot Determine. Failed/incomplete runs print
diagnostic metrics over completed rows with error/degraded counts and cannot
become baselines. Both labels must be present to establish/check a baseline.

`baseline.json` initially contains **no measurements**. `npm run eval:baseline`
stores the headline metrics from that successful run. Normal evaluations store
metrics in their result metadata without moving the reference. Regression runs
compare to the saved baseline and fail when detection falls by **more than 5
percentage points** or false positives rise by **more than 5 percentage points**;
exactly 5 is allowed. They also fail on grounding, degradation, or incompleteness.
Regression checks never overwrite the baseline. Refresh it explicitly after
accepting a new reference, preventing gradual regressions from moving the target.

The selected dataset records, their order, and language must match the baseline's
SHA-256 cohort hash. A mismatch fails before model calls. This prevents accidental
comparison of a subset or edited dataset with an unrelated baseline. Model name
is recorded but may change so model changes can be evaluated. Live WHOIS/domain
data is used as production does; network conditions and changing external data
can affect measurements, and no fake domain ages are installed by the runner.

## Direct arbitration tests

`tests/arbitration_test.py` calls production `arbitrate()` directly with constructed
signals and `ReasoningResult`, bypassing the pipeline and reasoner guard. It
checks several independent pairs of high signals against a Safe proposal,
other lower proposals, single-high/medium floors, and allowed escalation.
No Groq calls or evaluation messages are needed for `npm run eval:test`.

Existing behavior to be aware of: arbitration has a deterministic override to
Cannot Determine for official-link/high-content conflicts, even after computing
the risk maximum. The direct downgrade tests isolate the model rule without that
conflict. This harness does not change or claim to remove the existing override.
