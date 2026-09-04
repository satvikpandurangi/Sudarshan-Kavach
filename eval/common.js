'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const CATEGORIES = ['bank_phishing', 'fake_job', 'investment', 'delivery', 'prize',
  'upi_fraud', 'impersonation', 'legit_bank', 'legit_otp', 'legit_delivery',
  'legit_recruiter', 'legit_promo', 'legit_govt'];
const LEVELS = ['safe', 'suspicious', 'dangerous', 'cannot_determine'];
const DATA_COLUMNS = ['id', 'content', 'true_label', 'category', 'source', 'notes'];
// Category is retained in each result so reports never join against a changed dataset.
const RESULT_COLUMNS = ['id', 'true_label', 'predicted_level', 'risk_score',
  'signals_fired', 'model_proposed_level', 'final_level', 'latency_ms',
  'groundedness_ok', 'category', 'degraded', 'error'];

// Strict CSV reader: quoted commas, escaped quotes, multiline fields, CRLF and BOM.
function parseCsv(input) {
  const text = input.replace(/^\uFEFF/, '');
  const records = [];
  let row = [], field = '', state = 'start';
  const endField = () => { row.push(field); field = ''; state = 'start'; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (state === 'quoted') {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else state = 'closed';
      } else field += c;
    } else if (c === ',') endField();
    else if (c === '\r' || c === '\n') {
      endField(); records.push(row); row = [];
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else if (c === '"' && state === 'start') state = 'quoted';
    else {
      if (state === 'closed' || c === '"') throw new Error('Malformed CSV quoting');
      state = 'plain'; field += c;
    }
  }
  if (state === 'quoted') throw new Error('Unterminated CSV quote');
  if (state !== 'start' || field || row.length) { endField(); records.push(row); }
  if (!records.length) throw new Error('Empty CSV');
  const header = records.shift();
  if (header.some(h => !h) || new Set(header).size !== header.length) {
    throw new Error('CSV has empty or duplicate column names');
  }
  return { header, rows: records.map((values, i) => {
    if (values.length !== header.length) throw new Error(`CSV record ${i + 2}: wrong column count`);
    return Object.fromEntries(header.map((h, j) => [h, values[j]]));
  }) };
}

function csvLine(columns, row) {
  return columns.map(key => {
    const value = row[key] == null ? '' : String(row[key]);
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(',') + '\n';
}

function requireColumns(header, columns) {
  for (const column of columns) {
    if (!header.includes(column)) throw new Error(`Missing CSV column: ${column}`);
  }
}

function validateIdentity(rows) {
  const ids = new Set();
  for (const row of rows) {
    if (!row.id.trim() || ids.has(row.id)) throw new Error(`Empty or duplicate id: ${row.id}`);
    ids.add(row.id);
    if (!['safe', 'scam'].includes(row.true_label)) throw new Error(`${row.id}: invalid true_label`);
    if (!CATEGORIES.includes(row.category)) throw new Error(`${row.id}: invalid category`);
  }
}

function loadDataset(file, { category, limit } = {}) {
  const { header, rows } = parseCsv(fs.readFileSync(file, 'utf8'));
  requireColumns(header, DATA_COLUMNS);
  validateIdentity(rows);
  let selected = category ? rows.filter(row => row.category === category) : rows;
  if (limit != null) selected = selected.slice(0, limit);
  if (!selected.length) throw new Error('No dataset rows selected');
  for (const row of selected) {
    if (DATA_COLUMNS.some(key => /REPLACE ME/i.test(row[key])) || /^placeholder-/i.test(row.id)) {
      throw new Error(`${row.id}: REPLACE ME placeholder must be replaced before evaluation`);
    }
    if (!row.content.trim() || [...row.content].length > 5000) {
      throw new Error(`${row.id}: content must contain 1–5000 characters, matching the backend API`);
    }
  }
  return selected;
}

function cohortHash(rows, language) {
  // Preserve order: live domain-age cache and timing can depend on it.
  return crypto.createHash('sha256').update(JSON.stringify({ language,
    rows: rows.map(row => DATA_COLUMNS.map(key => row[key])) })).digest('hex');
}

function groundingFailures(content, signals, stage) {
  if (!Array.isArray(signals)) return [{ stage, error: 'Missing signals array', signals }];
  return signals.flatMap((signal, index) => {
    const evidence = signal?.evidence;
    return typeof evidence === 'string' && evidence.length > 0 && content.includes(evidence)
      ? [] : [{ stage, index, signal, error: 'Evidence must be a nonempty literal substring of submitted content' }];
  });
}

const flagged = level => level === 'suspicious' || level === 'dangerous';
const ratio = (numerator, denominator) => denominator ? numerator / denominator : null;
function percentile(values, p) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(p * sorted.length) - 1]; // nearest-rank percentile
}

function computeMetrics(rows) {
  const completed = rows.filter(row => LEVELS.includes(row.final_level));
  const scams = completed.filter(row => row.true_label === 'scam');
  const safe = completed.filter(row => row.true_label === 'safe');
  const dangerous = completed.filter(row => row.final_level === 'dangerous');
  const latencies = completed.map(row => Number(row.latency_ms));
  return {
    attempted: rows.length, completed: completed.length,
    scam_count: scams.length, safe_count: safe.length,
    detection_rate: ratio(scams.filter(row => flagged(row.final_level)).length, scams.length),
    false_positive_rate: ratio(safe.filter(row => flagged(row.final_level)).length, safe.length),
    dangerous_count: dangerous.length,
    dangerous_precision: ratio(dangerous.filter(row => row.true_label === 'scam').length, dangerous.length),
    cannot_determine_rate: ratio(completed.filter(row => row.final_level === 'cannot_determine').length, completed.length),
    p50_latency_ms: percentile(latencies, 0.5), p95_latency_ms: percentile(latencies, 0.95),
    groundedness_failed_rows: rows.filter(row => String(row.groundedness_ok) === 'false').length,
    degraded_rows: rows.filter(row => String(row.degraded) === 'true').length,
    error_rows: rows.filter(row => row.error).length,
  };
}

function loadResults(file) {
  const { header, rows } = parseCsv(fs.readFileSync(file, 'utf8'));
  requireColumns(header, RESULT_COLUMNS);
  if (!rows.length) throw new Error('Results file contains no measurements');
  validateIdentity(rows);
  for (const row of rows) {
    if ((!LEVELS.includes(row.final_level) && !(row.final_level === '' && row.error)) ||
        row.predicted_level !== row.final_level) throw new Error(`${row.id}: invalid final/predicted level`);
    if (!row.latency_ms.trim() || !Number.isFinite(Number(row.latency_ms)) || Number(row.latency_ms) < 0) {
      throw new Error(`${row.id}: invalid latency_ms`);
    }
    if (row.risk_score !== '' && (!Number.isFinite(Number(row.risk_score)) || Number(row.risk_score) < 0 || Number(row.risk_score) > 100)) {
      throw new Error(`${row.id}: invalid risk_score`);
    }
    if (!['true', 'false'].includes(row.groundedness_ok) && !(row.groundedness_ok === '' && row.error)) {
      throw new Error(`${row.id}: invalid groundedness_ok`);
    }
    if (!['true', 'false', ''].includes(row.degraded)) throw new Error(`${row.id}: invalid degraded flag`);
    if (!Array.isArray(JSON.parse(row.signals_fired))) throw new Error(`${row.id}: invalid signals_fired`);
  }
  return rows;
}

function validRun(metrics) {
  return metrics.completed > 0 && metrics.completed === metrics.attempted &&
    !metrics.error_rows && !metrics.degraded_rows && !metrics.groundedness_failed_rows;
}

function pythonExecutable() {
  if (process.env.EVAL_PYTHON) return process.env.EVAL_PYTHON;
  const venv = path.join(ROOT, 'backend', '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
  return fs.existsSync(venv) ? venv : (process.platform === 'win32' ? 'python' : 'python3');
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

module.exports = { ROOT, CATEGORIES, LEVELS, DATA_COLUMNS, RESULT_COLUMNS, parseCsv,
  csvLine, loadDataset, cohortHash, groundingFailures, computeMetrics, loadResults,
  validRun, pythonExecutable, writeJson };
