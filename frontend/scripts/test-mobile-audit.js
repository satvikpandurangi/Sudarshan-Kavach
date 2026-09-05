const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACTS_DIR = "C:\\Users\\SATVIK\\.gemini\\antigravity-ide\\brain\\73782f4d-7908-4803-89dd-cd7ee3d3d891";

const VIEWPORTS = [
  { name: '320x568 (iPhone SE 1st gen)', width: 320, height: 568, mobile: true },
  { name: '360x800 (Galaxy S20)', width: 360, height: 800, mobile: true },
  { name: '375x667 (iPhone 8/SE)', width: 375, height: 667, mobile: true },
  { name: '390x844 (iPhone 12/13/14)', width: 390, height: 844, mobile: true },
  { name: '412x915 (Pixel 7)', width: 412, height: 915, mobile: true },
  { name: '430x932 (iPhone 14/15 Pro Max)', width: 430, height: 932, mobile: true },
  { name: '768x1024 (iPad Portrait)', width: 768, height: 1024, mobile: true },
  { name: '1024x768 (iPad Landscape)', width: 1024, height: 768, mobile: false },
  { name: '1280x720 (Desktop HD)', width: 1280, height: 720, mobile: false },
  { name: '1440x900 (Desktop Large)', width: 1440, height: 900, mobile: false },
];

const ROUTES = [
  { path: '/', name: 'HOME' },
  { path: '/dashboard', name: 'DASHBOARD' },
  { path: '/history', name: 'HISTORY' },
  { path: '/safety', name: 'SAFETY' },
  { path: '/profile', name: 'PROFILE' },
  { path: '/login', name: 'LOGIN' },
];

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function run() {
  console.log("Launching headless Chrome for Multi-Viewport Audit...");
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--user-data-dir=' + path.join(ARTIFACTS_DIR, 'scratch', 'chrome-audit-profile'),
    'about:blank',
  ]);

  let killed = false;
  const cleanup = () => {
    if (!killed) {
      killed = true;
      try { chrome.kill(); } catch (e) {}
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  await sleep(1500);

  let wsUrl = '';
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9229/json');
      const data = await res.json();
      const target = data.find(t => t.type === 'page') || data[0];
      if (target && target.webSocketDebuggerUrl) {
        wsUrl = target.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      await sleep(500);
    }
  }

  if (!wsUrl) {
    console.error("Failed to connect to Chrome debugging target.");
    cleanup();
    process.exit(1);
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res) => ws.onopen = res);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');

  console.log("\n=======================================================");
  console.log("STARTING MULTI-VIEWPORT HORIZONTAL OVERFLOW AUDIT");
  console.log("=======================================================\n");

  const results = [];
  let totalFailures = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.mobile,
    });

    for (const route of ROUTES) {
      const targetUrl = `http://localhost:3005${route.path}`;
      await send('Page.navigate', { url: targetUrl });
      await sleep(500); // Allow hydration & animations

      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const doc = document.documentElement;
            const scrollW = doc.scrollWidth;
            const innerW = window.innerWidth;
            const clientW = doc.clientWidth;
            const hasHScroll = scrollW > innerW + 1;

            const offenders = [];
            if (hasHScroll) {
              const all = document.querySelectorAll('*');
              all.forEach(el => {
                const r = el.getBoundingClientRect();
                if (r.right > innerW + 2) {
                  offenders.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id,
                    className: typeof el.className === 'string' ? el.className.slice(0, 30) : '',
                    right: Math.round(r.right),
                    width: Math.round(r.width)
                  });
                }
              });
            }

            return {
              scrollW,
              innerW,
              clientW,
              hasHScroll,
              offenders: offenders.slice(0, 3)
            };
          })()
        `,
        returnByValue: true,
      });

      const res = evalRes.result.value;
      const pass = !res.hasHScroll;
      if (!pass) totalFailures++;

      results.push({
        viewport: vp.name,
        width: vp.width,
        route: route.name,
        scrollW: res.scrollW,
        innerW: res.innerW,
        pass,
        offenders: res.offenders
      });

      const statusStr = pass ? "✓ PASS" : "✗ FAIL (OVERFLOW)";
      console.log(`  [${statusStr}] ${route.name.padEnd(10)}: scrollWidth=${res.scrollW}px, innerWidth=${res.innerW}px`);
      if (!pass && res.offenders.length > 0) {
        console.log(`    Offenders:`, JSON.stringify(res.offenders));
      }

      // Capture screenshot for 390px (standard iPhone)
      if (vp.width === 390) {
        const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
        const imgPath = path.join(ARTIFACTS_DIR, `mobile_390_${route.name.toLowerCase()}.png`);
        fs.writeFileSync(imgPath, Buffer.from(screenshotRes.data, 'base64'));
      }
    }
  }

  console.log("\n=======================================================");
  console.log("AUDIT SUMMARY");
  console.log(`Total checks: ${results.length}`);
  console.log(`Passed: ${results.length - totalFailures}`);
  console.log(`Failed: ${totalFailures}`);
  console.log("=======================================================\n");

  cleanup();
  process.exit(totalFailures > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Audit runner error:", err);
  process.exit(1);
});
