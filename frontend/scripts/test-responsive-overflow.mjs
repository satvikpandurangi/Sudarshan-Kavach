import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;

const VIEWPORTS = [
  { name: "iPhone SE / Small Phone", width: 320, height: 568 },
  { name: "Standard Android", width: 360, height: 800 },
  { name: "iPhone 8 / SE2", width: 375, height: 667 },
  { name: "iPhone 12/13/14", width: 390, height: 844 },
  { name: "Pixel 7 / Galaxy S21", width: 412, height: 915 },
  { name: "iPhone 14/15 Pro Max", width: 430, height: 932 },
  { name: "iPad Mini / Tablet Portrait", width: 768, height: 1024 },
  { name: "iPad Landscape", width: 1024, height: 768 },
  { name: "Laptop Standard", width: 1280, height: 720 },
  { name: "Desktop Wide", width: 1440, height: 900 },
];

const ROUTES = [
  "/",
  "/safety",
  "/history",
  "/profile",
  "/login",
  "/dashboard",
];

async function launchChrome() {
  console.log(`Starting Headless Chrome at ${CHROME_PATH}...`);
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "about:blank",
    ],
    { stdio: "ignore" }
  );

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) {
        const data = await res.json();
        console.log(`Connected to Headless Chrome via CDP: ${data.Browser}`);
        return { process: chromeProcess, webSocketDebuggerUrl: data.webSocketDebuggerUrl };
      }
    } catch {}
    await sleep(250);
  }

  throw new Error("Failed to connect to Chrome debugging port.");
}

async function createTarget() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
  return await res.json();
}

async function main() {
  let chrome;
  let exitCode = 0;

  try {
    chrome = await launchChrome();
    const target = await createTarget();
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let id = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    const send = (method, params = {}) => {
      const curId = id++;
      return new Promise((resolve) => {
        pending.set(curId, resolve);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    };

    await send("Page.enable");
    await send("DOM.enable");

    console.log("\n=======================================================");
    console.log("MOBILE RESPONSIVE OVERFLOW AUDIT: REAL CHROMIUM ENGINE");
    console.log("=======================================================\n");

    const auditResults = [];

    for (const vp of VIEWPORTS) {
      console.log(`\n--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);

      await send("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 2,
        mobile: vp.width <= 768,
      });

      for (const route of ROUTES) {
        const baseUrl = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
        const url = `${baseUrl}${route}`;
        await send("Page.navigate", { url });
        await sleep(750); // Allow render and layout to settle

        const evalRes = await send("Runtime.evaluate", {
          expression: `(() => {
            const scrollWidth = document.documentElement.scrollWidth;
            const innerWidth = window.innerWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const diff = Math.max(scrollWidth - innerWidth, bodyScrollWidth - innerWidth);

            const culprits = [];
            if (diff > 1) {
              const all = document.querySelectorAll('*');
              all.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > innerWidth + 1 || rect.width > innerWidth + 1) {
                  culprits.push({
                    tag: el.tagName.toLowerCase(),
                    className: el.className ? (typeof el.className === 'string' ? el.className.slice(0, 40) : '') : '',
                    id: el.id || '',
                    width: Math.round(rect.width),
                    right: Math.round(rect.right)
                  });
                }
              });
            }

            return {
              scrollWidth,
              innerWidth,
              bodyScrollWidth,
              diff,
              culprits: culprits.slice(0, 5)
            };
          })()`,
          returnByValue: true,
        });

        const rawResult = evalRes?.result?.result?.value ?? evalRes?.result?.value;
        if (!rawResult) {
          console.error("Evaluation failed on", route, JSON.stringify(evalRes));
          continue;
        }
        const result = rawResult;
        const pass = result.diff <= 1;

        if (!pass) {
          exitCode = 1;
        }

        auditResults.push({
          viewport: `${vp.width}x${vp.height}`,
          route,
          pass,
          innerWidth: result.innerWidth,
          scrollWidth: result.scrollWidth,
          diff: result.diff,
          culprits: result.culprits,
        });

        const status = pass ? "✅ PASS" : `❌ FAIL (+${result.diff}px)`;
        console.log(
          `  ${status} Route: ${route.padEnd(12)} | Window: ${result.innerWidth}px | Doc: ${result.scrollWidth}px`
        );

        if (!pass && result.culprits.length > 0) {
          console.log(`     Offenders:`, JSON.stringify(result.culprits));
        }
      }
    }

    console.log("\n=======================================================");
    console.log("FINAL SUMMARY REPORT");
    console.log("=======================================================");
    const passedCount = auditResults.filter((r) => r.pass).length;
    const totalCount = auditResults.length;
    console.log(`Total tests: ${totalCount} | Passed: ${passedCount} | Failed: ${totalCount - passedCount}`);

    if (exitCode === 0) {
      console.log("\n🎉 ALL ROUTES PASSED ACROSS ALL 10 VIEWPORTS WITH ZERO HORIZONTAL OVERFLOW!\n");
    } else {
      console.log("\n⚠️ Some routes still have overflow.\n");
    }

    ws.close();
  } catch (err) {
    console.error("Audit error:", err);
    exitCode = 1;
  } finally {
    if (chrome?.process) {
      chrome.process.kill();
    }
    process.exit(exitCode);
  }
}

main();
