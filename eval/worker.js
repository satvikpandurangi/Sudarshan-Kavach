'use strict';

const { spawn } = require('node:child_process');
const readline = require('node:readline');
const path = require('node:path');
const { ROOT, pythonExecutable } = require('./common');

class PipelineWorker {
  constructor(timeoutMs) {
    this.timeoutMs = timeoutMs;
    this.queue = [];
    this.pending = null;
    this.failure = null;
    this.child = spawn(pythonExecutable(), ['-u', path.join(__dirname, 'bridge.py')], {
      cwd: path.join(ROOT, 'backend'),
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      stdio: ['pipe', 'pipe', 'inherit'], windowsHide: true,
    });
    this.lines = readline.createInterface({ input: this.child.stdout });
    this.lines.on('line', line => {
      try {
        const value = JSON.parse(line);
        if (this.pending) { const pending = this.pending; this.pending = null; pending.resolve(value); }
        else this.queue.push(value);
      } catch { this.fail(new Error('Invalid JSON from pipeline adapter')); }
    });
    this.child.on('error', error => this.fail(error));
    this.child.stdin.on('error', error => this.fail(error));
    this.child.on('exit', code => this.fail(new Error(`Pipeline adapter exited (${code}); inspect stderr above`)));
  }

  fail(error) {
    this.failure = error;
    if (this.pending) { this.pending.reject(error); this.pending = null; }
  }

  next() {
    if (this.queue.length) return Promise.resolve(this.queue.shift());
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.fail(new Error(`Pipeline adapter timed out after ${this.timeoutMs} ms`));
        this.child.kill();
      }, this.timeoutMs);
      this.pending = {
        resolve: value => { clearTimeout(timer); resolve(value); },
        reject: error => { clearTimeout(timer); reject(error); },
      };
    });
  }

  async start() {
    const ready = await this.next();
    if (ready.ready !== true || ready.provider !== 'groq') throw new Error('Expected Groq adapter startup');
    return ready;
  }

  async analyze(row, language) {
    if (this.failure) throw this.failure;
    this.child.stdin.write(JSON.stringify({ id: row.id, content: row.content, language }) + '\n');
    const result = await this.next();
    if (result.id !== row.id) throw new Error('Pipeline adapter response id mismatch');
    return result;
  }

  close() {
    this.lines.close();
    this.child.stdin.end();
    this.child.kill();
  }
}

module.exports = { PipelineWorker };
