const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\SATVIK\\.gemini\\antigravity-ide\\brain\\73782f4d-7908-4803-89dd-cd7ee3d3d891';

async function testResult() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9235',
    '--disable-gpu',
    '--user-data-dir=' + path.join(ARTIFACTS_DIR, 'scratch', 'chrome-result-profile-2'),
    'about:blank'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch (e) {}
  };
  process.on('exit', cleanup);

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9235/json');
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

  // First navigate to app to set localStorage
  await send('Page.navigate', { url: 'http://localhost:3005/' });
  await new Promise(r => setTimeout(r, 800));

  const mockDangerous = {
    id: 'demo-scam-1',
    inputType: 'MESSAGE',
    submitted: 'Urgent: Your SBI YONO account will be blocked today! Update PAN card immediately: https://sbi-kyc-update.xyz/login',
    classification: 'Bank Impersonation Phishing',
    riskLevel: 'HIGH',
    riskScore: 94,
    confidence: 0.96,
    explanation: 'Critical threat detected. This message uses urgent panic triggers and impersonates State Bank of India with a fake domain.',
    warningSigns: [
      'lookalike_domain',
      'urgency_pressure',
      'credential_request'
    ],
    evidence: [
      'Lookalike domain registered recently (xyz TLD)',
      'Urgency coercion: Account blocked threat',
      'Fake banking portal asking for netbanking credentials'
    ],
    recommendedActions: [
      'DO NOT click the link or scan QR codes.',
      'Never enter banking credentials or OTPs on unverified links.',
      'Report directly to 1930.'
    ],
    detectedUrls: ['https://sbi-kyc-update.xyz/login'],
    createdAt: new Date().toISOString()
  };

  const mockSafe = {
    id: 'demo-safe-1',
    inputType: 'URL',
    submitted: 'https://onlinesbi.sbi',
    classification: 'Official Banking Portal',
    riskLevel: 'LOW',
    riskScore: 6,
    confidence: 0.99,
    explanation: 'Verified official domain for State Bank of India with valid EV-SSL certificates and trusted reputation.',
    warningSigns: [],
    evidence: [
      'Registered domain matches official SBI registry',
      'Valid high-assurance SSL certificate'
    ],
    recommendedActions: [
      'This destination matches known legitimate banking infrastructure.'
    ],
    detectedUrls: ['https://onlinesbi.sbi'],
    createdAt: new Date().toISOString()
  };

  await send('Runtime.evaluate', {
    expression: `localStorage.setItem("sk-history", JSON.stringify([${JSON.stringify(mockDangerous)}, ${JSON.stringify(mockSafe)}]));`
  });

  // Test Dangerous Result View
  await send('Page.navigate', { url: 'http://localhost:3005/result/demo-scam-1' });
  await new Promise(r => setTimeout(r, 1200));

  const dangMetrics = await send('Runtime.evaluate', {
    expression: `({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      clientW: document.documentElement.clientWidth,
      pass: document.documentElement.scrollWidth <= window.innerWidth
    })`,
    returnByValue: true
  });

  console.log('RESULT VIEW (DANGEROUS) METRICS:', JSON.stringify(dangMetrics.result.value));

  const ssDang = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'mobile_390_result_dangerous.png'), Buffer.from(ssDang.data, 'base64'));

  // Test Safe Result View
  await send('Page.navigate', { url: 'http://localhost:3005/result/demo-safe-1' });
  await new Promise(r => setTimeout(r, 1200));

  const safeMetrics = await send('Runtime.evaluate', {
    expression: `({
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      clientW: document.documentElement.clientWidth,
      pass: document.documentElement.scrollWidth <= window.innerWidth
    })`,
    returnByValue: true
  });

  console.log('RESULT VIEW (SAFE) METRICS:', JSON.stringify(safeMetrics.result.value));

  const ssSafe = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'mobile_390_result_safe.png'), Buffer.from(ssSafe.data, 'base64'));

  cleanup();
  process.exit(0);
}

testResult().catch(err => {
  console.error("Test result error:", err);
  process.exit(1);
});
