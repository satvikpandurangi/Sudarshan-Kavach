const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\SATVIK\\.gemini\\antigravity-ide\\brain\\73782f4d-7908-4803-89dd-cd7ee3d3d891';

async function testLanguages() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9236',
    '--disable-gpu',
    '--user-data-dir=' + path.join(ARTIFACTS_DIR, 'scratch', 'chrome-lang-profile'),
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9236/json');
  const d = await res.json();
  const target = d.find(t => t.type === 'page') || d[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const i = id++;
    const onm = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id === i) { ws.removeEventListener('message', onm); resolve(m.result); }
    };
    ws.addEventListener('message', onm);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  await send('Page.navigate', { url: 'http://localhost:3005/' });
  await new Promise(r => setTimeout(r, 1000));

  // Switch to Kannada
  await send('Runtime.evaluate', { expression: 'localStorage.setItem("sk-lang", "kn");' });
  await send('Page.navigate', { url: 'http://localhost:3005/' });
  await new Promise(r => setTimeout(r, 1000));

  const knMetrics = await send('Runtime.evaluate', {
    expression: '({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, pass: document.documentElement.scrollWidth <= window.innerWidth })',
    returnByValue: true
  });
  console.log('KANNADA HOME METRICS:', JSON.stringify(knMetrics.result.value));
  const ssKn = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'mobile_390_home_kn.png'), Buffer.from(ssKn.data, 'base64'));

  // Switch to Hindi
  await send('Runtime.evaluate', { expression: 'localStorage.setItem("sk-lang", "hi");' });
  await send('Page.navigate', { url: 'http://localhost:3005/' });
  await new Promise(r => setTimeout(r, 1000));

  const hiMetrics = await send('Runtime.evaluate', {
    expression: '({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, pass: document.documentElement.scrollWidth <= window.innerWidth })',
    returnByValue: true
  });
  console.log('HINDI HOME METRICS:', JSON.stringify(hiMetrics.result.value));
  const ssHi = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'mobile_390_home_hi.png'), Buffer.from(ssHi.data, 'base64'));

  chrome.kill();
  process.exit(0);
}

testLanguages().catch(console.error);
