'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DATA_COLUMNS, parseCsv, csvLine, loadDataset, cohortHash, groundingFailures,
  computeMetrics, loadResults, writeJson } = require('../common');
const { parseOptions, resultFromTrace, runEvaluation } = require('../run');
const { printReport, reportFile } = require('../report');
const { loadBaseline, compareBaseline, saveBaseline } = require('../baseline');

function temp(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'kavach-eval-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

const datasetRow = (id = 'unit-1', label = 'scam') => ({ id, content: 'unit fixture alpha beta',
  true_label: label, category: label === 'scam' ? 'bank_phishing' : 'legit_bank', source: 'unit fixture', notes: '' });
const result = (label, level, latency = 1) => ({ id: 'unit', true_label: label,
  category: 'bank_phishing', predicted_level: level, final_level: level,
  latency_ms: latency, groundedness_ok: true, degraded: false, error: '' });
const trace = (level = 'dangerous', signals = []) => ({ response: { risk_level: level,
  risk_score: level === 'cannot_determine' ? null : 55, signals, degraded: null },
  raw_signals: signals, reasoning_signals: signals, model_proposed_level: 'safe', latency_ms: 12.5 });

test('CSV round-trips BOM, comma, quotes, newlines, CRLF and Unicode without altering evidence', () => {
  const row = { ...datasetRow(), content: 'ಕನ್ನಡ, "quoted"\r\nहिन्दी\n  literal  ' };
  const csv = '\ufeff' + DATA_COLUMNS.join(',') + '\r\n' + csvLine(DATA_COLUMNS, row);
  assert.deepEqual(parseCsv(csv).rows, [row]);
  assert.throws(() => parseCsv('a,b\nx,"unclosed'), /Unterminated/);
  assert.throws(() => parseCsv('a,b\nx,"closed" extra'), /Malformed/);
  assert.throws(() => parseCsv('a,a\nx,y'), /duplicate/);
});

test('dataset validates labels, unique ids, category, content and selection', t => {
  const file = path.join(temp(t), 'dataset.csv');
  const write = rows => fs.writeFileSync(file, DATA_COLUMNS.join(',') + '\n' + rows.map(row => csvLine(DATA_COLUMNS, row)).join(''));
  write([datasetRow(), datasetRow('unit-2', 'safe')]);
  assert.equal(loadDataset(file, { category: 'legit_bank', limit: 1 })[0].id, 'unit-2');
  assert.throws(() => loadDataset(file, { category: 'prize' }), /No dataset/);
  write([datasetRow(), datasetRow()]);
  assert.throws(() => loadDataset(file), /duplicate/);
  for (const changes of [{ true_label: 'legit' }, { category: 'other' }, { content: '' }, { content: 'x'.repeat(5001) }]) {
    write([{ ...datasetRow(), ...changes }]);
    assert.throws(() => loadDataset(file));
  }
});

test('placeholder rows are blocked without depending on the user-owned dataset', t => {
  const file = path.join(temp(t), 'dataset.csv');
  const placeholder = { ...datasetRow(), id: 'placeholder-1', content: 'REPLACE ME' };
  fs.writeFileSync(file, DATA_COLUMNS.join(',') + '\n' + csvLine(DATA_COLUMNS, placeholder));
  assert.throws(() => loadDataset(file), /REPLACE ME/);
});

test('CLI rejects unknown flags and invalid limits/delays/categories', () => {
  for (const args of [['--limit', '0'], ['--limit', '1.5'], ['--delay-ms', '-1'],
    ['--category', 'other'], ['--typo'], ['--language', 'fr']]) assert.throws(() => parseOptions(args));
  const options = parseOptions(['--limit', '2', '--category', 'legit_otp', '--delay-ms', '0']);
  assert.equal(options.limit, 2);
  assert.equal(options.delayMs, 0);
});

test('metric denominators include abstentions and pair detection with false positives', () => {
  const rows = [result('scam', 'dangerous', 10), result('scam', 'suspicious', 20),
    result('scam', 'safe', 30), result('scam', 'cannot_determine', 40),
    result('safe', 'dangerous', 50), result('safe', 'safe', 60), result('safe', 'cannot_determine', 70)];
  const metrics = computeMetrics(rows);
  assert.equal(metrics.detection_rate, 0.5);
  assert.equal(metrics.false_positive_rate, 1 / 3);
  assert.equal(metrics.dangerous_precision, 0.5);
  assert.equal(metrics.cannot_determine_rate, 2 / 7);
  assert.equal(metrics.p50_latency_ms, 40);
  assert.equal(metrics.p95_latency_ms, 70);
  const output = [];
  printReport(rows, line => output.push(line));
  for (const line of output.filter(line => /Detection rate:|False positive rate:/.test(line))) {
    assert.match(line, /Detection rate:.*False positive rate:/);
  }
});

test('flag-everything detector has 100% detection AND 100% false positives', () => {
  const metrics = computeMetrics([result('scam', 'dangerous'), result('safe', 'dangerous')]);
  assert.equal(metrics.detection_rate, 1);
  assert.equal(metrics.false_positive_rate, 1);
});

test('zero denominators are N/A, not invented zero accuracy', () => {
  const metrics = computeMetrics([result('safe', 'safe')]);
  assert.equal(metrics.detection_rate, null);
  assert.equal(metrics.dangerous_precision, null);
  assert.equal(computeMetrics([]).p95_latency_ms, null);
});

test('grounding rejects fabricated, missing, empty, differently cased and normalized evidence', () => {
  const content = 'unit ALPHA O\u200bTP';
  assert.deepEqual(groundingFailures(content, [{ evidence: 'ALPHA' }], 'response'), []);
  for (const evidence of ['alpha', 'OTP', 'invented', '', null, undefined]) {
    assert.equal(groundingFailures(content, [{ evidence }], 'response').length, 1);
  }
  assert.equal(groundingFailures(content, undefined, 'response').length, 1);
});

test('grounding inspects internal signals even when public Cannot Determine hides them', () => {
  const observed = trace('cannot_determine');
  observed.raw_signals = [{ id: 'unit', evidence: 'fabricated' }];
  const { result: measured, failures } = resultFromTrace(datasetRow(), observed, 99);
  assert.equal(measured.groundedness_ok, false);
  assert.equal(failures[0].stage, 'deterministic');
  assert.equal(measured.risk_score, '');
  assert.equal(measured.model_proposed_level, 'safe');
});

test('missing response data and provider degradation cannot count as successful runs', () => {
  assert.match(resultFromTrace(datasetRow(), {}, 3).result.error, /Invalid/);
  const observed = trace();
  observed.response.degraded = true;
  assert.match(resultFromTrace(datasetRow(), observed, 3).result.error, /degraded/);
});

test('regression boundary is >5 percentage points, not relative percent', () => {
  const metrics = { ...computeMetrics([result('safe', 'safe'), result('scam', 'dangerous')]),
    detection_rate: 0.8, false_positive_rate: 0.1 };
  assert.equal(compareBaseline({ ...metrics, detection_rate: 0.75, false_positive_rate: 0.15 }, metrics).ok, true);
  assert.equal(compareBaseline({ ...metrics, detection_rate: 0.7499 }, metrics).ok, false);
  assert.equal(compareBaseline({ ...metrics, false_positive_rate: 0.1501 }, metrics).ok, false);
  assert.throws(() => compareBaseline({ ...metrics, degraded_rows: 1 }, metrics), /Baseline requires/);
  assert.throws(() => compareBaseline({ ...metrics, false_positive_rate: null }, metrics), /both scam and safe/);
});

test('cohort hash changes for content, labels, category, order and language', () => {
  const rows = [datasetRow(), datasetRow('unit-2', 'safe')];
  const hash = cohortHash(rows, 'en');
  for (const changes of [{ content: 'changed' }, { true_label: 'safe' }, { category: 'fake_job' }]) {
    assert.notEqual(cohortHash([{ ...rows[0], ...changes }, rows[1]], 'en'), hash);
  }
  assert.notEqual(cohortHash([...rows].reverse(), 'en'), hash);
  assert.notEqual(cohortHash(rows, 'hi'), hash);
});

test('baseline is explicit, validates the cohort and cannot save failed runs', t => {
  const file = path.join(temp(t), 'baseline.json');
  const metrics = computeMetrics([result('scam', 'dangerous'), result('safe', 'safe')]);
  writeJson(file, { schema_version: 1, status: 'uninitialized', metrics: null });
  assert.throws(() => loadBaseline(file, 'cohort'), /uninitialized/);
  const run = { ok: true, metrics, file: 'unit.csv', meta: { cohort_sha256: 'cohort' } };
  saveBaseline(file, run);
  assert.equal(loadBaseline(file, 'cohort').metrics.detection_rate, 1);
  assert.throws(() => loadBaseline(file, 'different'), /differ/);
  assert.throws(() => saveBaseline(file, { ...run, ok: false }), /failed/);
});

test('runner is sequential, delays between rows, persists full failures and fails the report CLI', async t => {
  const directory = temp(t);
  const options = parseOptions(['--results-dir', directory, '--delay-ms', '7']);
  const rows = [datasetRow(), datasetRow('unit-2', 'safe'), datasetRow('unit-3', 'safe')];
  let inFlight = 0, calls = 0, closed = false;
  const events = [];
  const worker = {
    start: async () => ({ provider: 'groq', model: 'unit fixture' }),
    analyze: async row => {
      assert.equal(inFlight++, 0); events.push(row.id);
      await Promise.resolve(); inFlight--; calls++;
      return calls === 2 ? trace('dangerous', [{ id: 'bad', evidence: 'fabricated' }]) : trace('safe');
    }, close: () => { closed = true; },
  };
  const logs = [];
  const run = await runEvaluation(options, { rows, cohort: 'unit' }, { worker,
    log: line => logs.push(line), sleep: async ms => events.push(ms) });
  assert.deepEqual(events, ['unit-1', 7, 'unit-2', 7, 'unit-3']);
  assert.equal(closed, true);
  assert.equal(run.ok, false);
  assert.equal(loadResults(run.file).length, 3);
  assert.equal(run.meta.grounding_failure_count, 3);
  const failures = JSON.parse(fs.readFileSync(run.file.replace('.csv', '.failures.json'), 'utf8'));
  assert.equal(failures.length, 1);
  assert.deepEqual(failures[0].dataset_row, rows[1]);
  assert.equal(failures[0].trace.response.signals[0].evidence, 'fabricated');
  assert.ok(logs.some(line => line.includes('HARD FAILURE') && line.includes(rows[1].content)));
  const cli = spawnSync(process.execPath, [path.join(__dirname, '..', 'report.js'), run.file], { encoding: 'utf8' });
  assert.equal(cli.status, 1);
  assert.match(cli.stdout, /Full failing cases/);
  assert.match(cli.stdout, /fabricated/);
});

test('worker failure records attempted error and marks the run incomplete', async t => {
  const options = parseOptions(['--results-dir', temp(t)]);
  let calls = 0;
  const worker = { start: async () => ({ provider: 'groq', model: 'unit fixture' }),
    analyze: async () => { if (++calls === 2) throw new Error('unit worker failure'); return trace('safe'); }, close() {} };
  const rows = [datasetRow(), datasetRow('unit-2'), datasetRow('unit-3')];
  const run = await runEvaluation(options, { rows, cohort: 'unit' }, { worker, sleep: async () => {}, log: () => {} });
  assert.equal(run.ok, false);
  assert.equal(run.rows.length, 2);
  assert.equal(run.rows[1].final_level, '');
  assert.equal(run.meta.selected_count, 3);
  assert.equal(reportFile(run.file, () => {}).ok, false);
});

test('clean run reports successfully and results do not depend on dataset being retained', async t => {
  const options = parseOptions(['--results-dir', temp(t), '--delay-ms', '0']);
  const rows = [datasetRow(), datasetRow('unit-2', 'safe')];
  const worker = { start: async () => ({ provider: 'groq', model: 'unit fixture' }),
    analyze: async row => trace(row.true_label === 'scam' ? 'dangerous' : 'safe'), close() {} };
  const run = await runEvaluation(options, { rows, cohort: 'unit' }, { worker, log: () => {} });
  assert.equal(run.ok, true);
  assert.equal(reportFile(run.file, () => {}).ok, true);
  assert.equal(run.metrics.detection_rate, 1);
  assert.equal(run.metrics.false_positive_rate, 0);
});
