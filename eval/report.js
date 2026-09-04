'use strict';

const fs = require('node:fs');
const { computeMetrics, loadResults, validRun } = require('./common');

const pct = value => value == null ? 'N/A (no samples)' : `${(value * 100).toFixed(2)}%`;
const ms = value => value == null ? 'N/A' : `${value.toFixed(2)} ms`;

function printMetrics(name, metrics, log = console.log) {
  log(`${name}: n=${metrics.completed}, scam=${metrics.scam_count}, safe=${metrics.safe_count}`);
  // Keep these together everywhere, including categories and regression deltas.
  log(`  Detection rate: ${pct(metrics.detection_rate)} | False positive rate: ${pct(metrics.false_positive_rate)}`);
  log(`  Dangerous-tier precision: ${pct(metrics.dangerous_precision)} (n=${metrics.dangerous_count}) | Cannot Determine rate: ${pct(metrics.cannot_determine_rate)}`);
  log(`  Latency p50: ${ms(metrics.p50_latency_ms)} | p95: ${ms(metrics.p95_latency_ms)}`);
}

function printReport(rows, log = console.log, complete = true) {
  const metrics = computeMetrics(rows);
  log(`Run status: ${complete && validRun(metrics) ? 'VALID' : 'FAILED — diagnostic metrics only; not baseline eligible'}`);
  log(`Attempted: ${metrics.attempted} | Completed: ${metrics.completed} | Errors: ${metrics.error_rows} | Degraded: ${metrics.degraded_rows} | Groundedness failing rows: ${metrics.groundedness_failed_rows}`);
  printMetrics('Overall', metrics, log);
  for (const category of [...new Set(rows.map(row => row.category))].sort()) {
    printMetrics(category, computeMetrics(rows.filter(row => row.category === category)), log);
  }
  log('Rates use completed rows; Cannot Determine is unflagged and remains in the labelled denominators. N/A means a zero denominator. Latency excludes inter-request delay and uses nearest-rank percentiles.');
  return metrics;
}

function reportFile(file, log = console.log) {
  const rows = loadResults(file);
  const prefix = file.replace(/\.csv$/i, '');
  const metaFile = `${prefix}.meta.json`;
  let complete = true;
  if (fs.existsSync(metaFile)) {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    complete = meta.status === 'valid' && meta.selected_count === rows.length;
    log(`Recorded run status: ${meta.status}; selected rows: ${meta.selected_count}`);
  }
  const metrics = printReport(rows, log, complete);
  const failureFile = `${prefix}.failures.json`;
  if (fs.existsSync(failureFile)) {
    const failures = JSON.parse(fs.readFileSync(failureFile, 'utf8'));
    if (failures.length) log(`Full failing cases:\n${JSON.stringify(failures, null, 2)}`);
  } else if (metrics.groundedness_failed_rows) {
    throw new Error('Groundedness failed; full case dump is missing. Restore the companion .failures.json file.');
  }
  return { metrics, ok: complete && validRun(metrics) };
}

if (require.main === module) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node eval/report.js eval/results/<timestamp>.csv');
    if (!reportFile(process.argv[2]).ok) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { printReport, printMetrics, reportFile };
