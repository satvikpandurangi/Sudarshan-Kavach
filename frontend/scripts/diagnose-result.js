const { spawn } = require('child_process');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnose() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9233',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9233/json');
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

  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.exceptionThrown') {
      console.error('EXCEPTION THROWN:', JSON.stringify(m.params.exceptionDetails, null, 2));
    }
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');

  await send('Page.navigate', { url: 'http://localhost:3005/' });
  await new Promise(r => setTimeout(r, 800));

  await send('Page.navigate', { url: 'http://localhost:3005/result/demo-scam-1' });
  await new Promise(r => setTimeout(r, 2000));

  chrome.kill();
  process.exit(0);
}

diagnose().catch(console.error);
