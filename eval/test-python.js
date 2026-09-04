'use strict';
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { ROOT, pythonExecutable } = require('./common');
const result = spawnSync(pythonExecutable(), ['-m', 'unittest', 'discover', '-s',
  path.join(__dirname, 'tests'), '-p', '*_test.py', '-v'], {
  cwd: ROOT, stdio: 'inherit', windowsHide: true,
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
