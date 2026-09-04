'use strict';

const fs = require('node:fs');
const { validRun, writeJson } = require('./common');

function assertBaselineEligible(metrics) {
  if (!validRun(metrics) || metrics.detection_rate == null || metrics.false_positive_rate == null) {
    throw new Error('Baseline requires a complete, grounded, nondegraded run containing both scam and safe rows');
  }
}

function loadBaseline(file, cohort) {
  const baseline = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (baseline.schema_version !== 1 || baseline.status !== 'valid' || !baseline.metrics) {
    throw new Error('Baseline is uninitialized. Replace the placeholders, then run npm run eval:baseline.');
  }
  assertBaselineEligible(baseline.metrics);
  for (const key of ['detection_rate', 'false_positive_rate']) {
    if (!Number.isFinite(baseline.metrics[key]) || baseline.metrics[key] < 0 || baseline.metrics[key] > 1) {
      throw new Error(`Invalid baseline metric: ${key}`);
    }
  }
  if (baseline.cohort_sha256 !== cohort) throw new Error('Dataset, order, filters, or language differ from baseline; establish a matching baseline explicitly');
  return baseline;
}

function compareBaseline(current, baseline) {
  assertBaselineEligible(current);
  const detectionDelta = current.detection_rate - baseline.detection_rate;
  const falsePositiveDelta = current.false_positive_rate - baseline.false_positive_rate;
  // Exactly five percentage points is allowed. Tolerance only covers float noise.
  return { detectionDelta, falsePositiveDelta,
    ok: detectionDelta >= -0.05 - 1e-12 && falsePositiveDelta <= 0.05 + 1e-12 };
}

function saveBaseline(file, run) {
  if (!run.ok) throw new Error('Cannot baseline a failed or incomplete run');
  assertBaselineEligible(run.metrics);
  const temporary = `${file}.${process.pid}.tmp`;
  writeJson(temporary, { schema_version: 1, status: 'valid', timestamp: run.meta.timestamp,
    results_file: run.file, cohort_sha256: run.meta.cohort_sha256,
    provider: run.meta.provider, model: run.meta.model, language: run.meta.language,
    metrics: run.metrics });
  fs.renameSync(temporary, file);
}

module.exports = { assertBaselineEligible, loadBaseline, compareBaseline, saveBaseline };
