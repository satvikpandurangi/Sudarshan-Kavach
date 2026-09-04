'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { performance } = require('node:perf_hooks');
const { setTimeout: sleep } = require('node:timers/promises');
const { CATEGORIES, LEVELS, RESULT_COLUMNS, csvLine, loadDataset, cohortHash,
  groundingFailures, computeMetrics, validRun, writeJson } = require('./common');
const { PipelineWorker } = require('./worker');
const { printReport } = require('./report');
const { saveBaseline } = require('./baseline');

function integer(value, name, min) {
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < min) {
    throw new Error(`${name} must be an integer >= ${min}`);
  }
  return Number(value);
}

function parseOptions(args) {
  const { values } = parseArgs({ args, options: {
    dataset: { type: 'string', default: path.join(__dirname, 'dataset.csv') },
    'results-dir': { type: 'string', default: path.join(__dirname, 'results') },
    'delay-ms': { type: 'string', default: process.env.EVAL_DELAY_MS || '2000' },
    'timeout-ms': { type: 'string', default: '120000' },
    limit: { type: 'string' }, category: { type: 'string' },
    language: { type: 'string', default: 'en' },
    baseline: { type: 'string', default: path.join(__dirname, 'baseline.json') },
    'update-baseline': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  } });
  if (values.category && !CATEGORIES.includes(values.category)) throw new Error(`Unknown category: ${values.category}`);
  if (!['en', 'hi', 'kn'].includes(values.language)) throw new Error('Language must be en, hi, or kn');
  return { dataset: path.resolve(values.dataset), resultsDir: path.resolve(values['results-dir']),
    delayMs: integer(values['delay-ms'], '--delay-ms', 0),
    timeoutMs: integer(values['timeout-ms'], '--timeout-ms', 1),
    limit: values.limit == null ? undefined : integer(values.limit, '--limit', 1),
    category: values.category, language: values.language, baseline: path.resolve(values.baseline),
    updateBaseline: values['update-baseline'], help: values.help };
}

function help() {
  console.log('Usage: npm run eval -- [--dataset path] [--limit N] [--category name] [--delay-ms 2000] [--timeout-ms 120000] [--language en|hi|kn] [--results-dir path] [--update-baseline] [--baseline path]\nRequires the backend Python environment and GROQ_API_KEY (environment or backend/.env). EVAL_PYTHON overrides the Python executable. Placeholders cannot be evaluated.');
}

function prepare(options) {
  const rows = loadDataset(options.dataset, options);
  return { rows, cohort: cohortHash(rows, options.language) };
}

function resultFromTrace(row, trace, wallLatency) {
  const response = trace.response;
  const failures = [];
  const result = { id: row.id, true_label: row.true_label, category: row.category,
    predicted_level: '', risk_score: '', signals_fired: '[]', model_proposed_level: '',
    final_level: '', latency_ms: wallLatency.toFixed(3), groundedness_ok: '', degraded: '', error: '' };
  if (trace.error) { result.error = trace.error; return { result, failures }; }
  const groups = { response: response?.signals, deterministic: trace.raw_signals, reasoning: trace.reasoning_signals };
  for (const [stage, signals] of Object.entries(groups)) {
    failures.push(...groundingFailures(row.content, signals, stage));
  }
  result.groundedness_ok = failures.length === 0;
  result.model_proposed_level = trace.model_proposed_level == null ? '' :
    (typeof trace.model_proposed_level === 'string' ? trace.model_proposed_level : JSON.stringify(trace.model_proposed_level));
  if (Array.isArray(trace.raw_signals)) result.signals_fired = JSON.stringify(trace.raw_signals.map(signal => signal.id));
  if (!response || !LEVELS.includes(response.risk_level) ||
      !Number.isFinite(trace.latency_ms) || trace.latency_ms < 0 ||
      !(response.risk_score == null || (Number.isFinite(response.risk_score) && response.risk_score >= 0 && response.risk_score <= 100))) {
    result.error = 'Invalid pipeline response or latency';
    return { result, failures };
  }
  result.predicted_level = result.final_level = response.risk_level;
  result.risk_score = response.risk_score ?? '';
  result.latency_ms = trace.latency_ms.toFixed(3);
  result.degraded = response.degraded === true;
  if (result.degraded) result.error = trace.model_error || 'Groq output unavailable or rejected; pipeline used degraded reasoning';
  if (failures.length) result.error = [result.error, 'Groundedness hard failure'].filter(Boolean).join('; ');
  return { result, failures };
}

async function runEvaluation(options, prepared = prepare(options), dependencies = {}) {
  const log = dependencies.log || console.log;
  const worker = dependencies.worker || new PipelineWorker(options.timeoutMs);
  const pause = dependencies.sleep || sleep;
  let provider;
  try { provider = await worker.start(); }
  catch (error) { worker.close(); throw error; }
  const timestamp = new Date().toISOString();
  const name = timestamp.replace(/[:.]/g, '-') + `-${process.pid}`;
  const prefix = path.join(options.resultsDir, name);
  const file = `${prefix}.csv`;
  const meta = { schema_version: 1, status: 'running', timestamp,
    selected_count: prepared.rows.length, cohort_sha256: prepared.cohort,
    dataset: options.dataset, category: options.category ?? null, limit: options.limit ?? null,
    language: options.language, delay_ms: options.delayMs,
    provider: provider.provider, model: provider.model };
  try {
    fs.mkdirSync(options.resultsDir, { recursive: true });
    fs.writeFileSync(file, RESULT_COLUMNS.join(',') + '\n', { flag: 'wx' });
    writeJson(`${prefix}.meta.json`, meta);
  } catch (error) { worker.close(); throw error; }
  const rows = [], failingCases = [];
  let fatalError;
  try {
    for (const [index, row] of prepared.rows.entries()) {
      if (index) await pause(options.delayMs);
      const started = performance.now();
      let trace;
      try { trace = await worker.analyze(row, options.language); }
      catch (error) { fatalError = error.message; trace = { error: fatalError }; }
      const { result, failures } = resultFromTrace(row, trace, performance.now() - started);
      rows.push(result);
      fs.appendFileSync(file, csvLine(RESULT_COLUMNS, result));
      const audit = { dataset_row: row, result, grounding_failures: failures, trace };
      fs.appendFileSync(`${prefix}.audit.jsonl`, JSON.stringify(audit) + '\n');
      if (failures.length || result.error) {
        failingCases.push(audit);
        writeJson(`${prefix}.failures.json`, failingCases);
        log(`HARD FAILURE — full case:\n${JSON.stringify(audit, null, 2)}`);
      }
      log(`[${index + 1}/${prepared.rows.length}] ${row.id}: ${result.final_level || 'ERROR'}; ${result.latency_ms} ms`);
      if (fatalError) break; // Worker is unavailable; never classify skipped rows as Cannot Determine.
    }
  } finally { worker.close(); }
  const metrics = computeMetrics(rows);
  const ok = !fatalError && rows.length === prepared.rows.length && validRun(metrics);
  Object.assign(meta, { status: ok ? 'valid' : 'failed', completed_at: new Date().toISOString(),
    fatal_error: fatalError ?? null, metrics,
    grounding_failure_count: failingCases.reduce((sum, audit) => sum + audit.grounding_failures.length, 0) });
  writeJson(`${prefix}.failures.json`, failingCases);
  writeJson(`${prefix}.meta.json`, meta);
  printReport(rows, log);
  log(`Groundedness failing signal observations: ${meta.grounding_failure_count} (stage-specific; see full case dumps)`);
  if (fatalError) log(`INCOMPLETE RUN: ${fatalError}; selected ${prepared.rows.length}, attempted ${rows.length}`);
  log(`Results: ${file}`);
  return { file, rows, metrics, meta, ok };
}

if (require.main === module) {
  (async () => {
    const options = parseOptions(process.argv.slice(2));
    if (options.help) return help();
    const prepared = prepare(options);
    if (options.updateBaseline && !['safe', 'scam'].every(label => prepared.rows.some(row => row.true_label === label))) {
      throw new Error('Baseline requires both scam and safe rows');
    }
    const run = await runEvaluation(options, prepared);
    if (!run.ok) { process.exitCode = 1; return; }
    if (options.updateBaseline) { saveBaseline(options.baseline, run); console.log(`Baseline saved: ${options.baseline}`); }
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}

module.exports = { parseOptions, help, prepare, resultFromTrace, runEvaluation };
