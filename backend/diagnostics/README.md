# Groq diagnosis — 2026-09-04

No real evaluation baseline has been established. The 50 scam and 50 legitimate
messages must come from the user. `eval/dataset.csv` and `eval/baseline.json`
were not changed, and the legacy results were not rerun or used as a baseline.

## Findings

- `GROQ_API_KEY` is absent from the shell but present in `backend/.env`.
  Loading that file, as the existing eval bridge does, produced HTTP 200 from
  Groq's models endpoint. The configured `qwen/qwen3.8-27b` model is available.
- The actual Groq client timeout is 15 seconds, not eight. A completion before
  code changes succeeded in 714 ms. No timeout was reproduced.
- The old Python runner defaults to deterministic mode. That mode intentionally
  returns degraded results without making model requests. The old CSV records
  neither execution mode nor failure reasons, so its historical cause cannot be
  established from `degraded` alone.
- There were no HTTP retries. The inherited reasoner silently discarded request,
  JSON parsing, and output validation failures.
- The first five live smoke requests produced four accepted model responses and
  one HTTP 429 (`rate_limit_exceeded`). This is a reproduced current failure,
  not proof of why the historical run degraded.

## Changes

Production responses now explicitly return `degraded: false` on success. Each
fallback includes `degradation_reason` and emits a server warning. Codes
distinguish intentional deterministic mode, missing credentials, initialization
failure, timeout type, HTTP status/provider code, malformed JSON, rejected
output, and unexpected reasoner errors. Logs omit raw exception bodies, prompts,
and credentials. Existing provider selection priority is preserved.

Groq retries HTTP 429 and 5xx failures at most twice, with exponential delays of
one and two seconds, extended by a numeric Retry-After header up to 30 seconds.
Longer quota waits fall back immediately. Authentication errors are not retried.
The existing 15-second per-request timeout is unchanged; the retry sequence is
not an eight-second total deadline.

## Verification

The smoke inputs are unlabelled excerpts from the user's instructions. They are
connectivity/output-validation probes, not real scam/legitimate evaluation
messages. English, Hindi, and Kannada response languages were exercised.

| Smoke run | Accepted Groq output | Degraded | Pipeline latency |
|---|---:|---:|---:|
| Before retries | 4/5 | 1/5 (429) | 170–4993 ms |
| After retries | 5/5 | 0/5 | 524–703 ms |

The second live run did not require retries, so this small comparison cannot
prove a causal reliability improvement. Mock HTTP tests verify recovery from
429 and 5xx, Retry-After handling, the two-retry limit, and no retry on 401.
Both runs retain their actual raw Groq output in `groq-smoke.json` and
`groq-smoke-after.json`.

- Focused backend checks: 44 passed.
- Full backend suite: 158 passed, one dependency deprecation warning. An initial
  sandbox run had three temporary-directory permission errors; the approved
  rerun passed all tests.
- `npm run eval:test`: 16 Node tests and six Python tests passed.

Detection, false positives, Dangerous precision, Cannot Determine rate, and
per-category metrics for the real dataset remain unavailable. No smoke result
should be interpreted as detection accuracy or a real baseline.

## Next step after the user supplies the messages

Populate the existing CSV schema without generating messages or changing the
category definitions. Run the real eval and examine every degraded response.
With the current harness, `npm run eval` writes timestamped results but does not
populate the baseline. Use `npm run eval -- --update-baseline` (equivalently,
`npm run eval:baseline`) to run and save an eligible baseline. Eligibility
currently requires zero degraded responses; that guard has not been weakened.
Report all requested metrics together, and flag detection above 95% or near-zero
false positives as reasons to scrutinize the dataset.
