'use strict';

const { parseOptions, help, prepare, runEvaluation } = require('./run');
const { loadBaseline, compareBaseline } = require('./baseline');
const { printMetrics } = require('./report');

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) return help();
  if (options.updateBaseline) throw new Error('Regression checks cannot overwrite the baseline; use npm run eval:baseline explicitly');
  const prepared = prepare(options);
  // Check before spending API calls; never compare different evaluation cohorts.
  const baseline = loadBaseline(options.baseline, prepared.cohort);
  const run = await runEvaluation(options, prepared);
  if (!run.ok) throw new Error('Regression failed: current run is incomplete, degraded, or ungrounded');
  printMetrics('Baseline', baseline.metrics);
  const comparison = compareBaseline(run.metrics, baseline.metrics);
  console.log(`Detection rate change: ${(comparison.detectionDelta * 100).toFixed(2)} pp | False positive rate change: ${(comparison.falsePositiveDelta * 100).toFixed(2)} pp`);
  if (!comparison.ok) throw new Error('Regression failed: detection dropped >5 percentage points or false positives rose >5 percentage points');
  console.log('Regression passed. Baseline retained; refresh explicitly when you accept a new reference run.');
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
