const { spawn } = require('child_process');
const http = require('http');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Launching headless Chrome...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu-watchdog',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=412,915', // Mobile viewport: Pixel 7 size
  ], { stdio: 'ignore' });

  // Wait for remote debugging to be ready
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await wait(200);
    try {
      const version = await getJson('http://127.0.0.1:9222/json/version');
      wsUrl = version.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) { }
  }

  if (!wsUrl) {
    console.error('Could not connect to Chrome debugging port');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('Connected to Chrome CDP:', wsUrl);

  const ws = new globalThis.WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  });

  await new Promise((res) => ws.addEventListener('open', res));

  // Create target page
  const { targetId } = await send('Target.createTarget', { url: 'http://localhost:4173/' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  function sendSession(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('DOM.enable');

  console.log('Navigating to http://localhost:4173/ ...');
  await sendSession('Page.navigate', { url: 'http://localhost:4173/' });
  await wait(1500);

  // Inject performance observer & tracking
  await sendSession('Runtime.evaluate', {
    expression: `
      window.__perfData = {
        longTasks: [],
        clickLatencies: [],
        droppedFrames: 0,
        totalFrames: 0,
        startMemory: performance.memory ? performance.memory.usedJSHeapSize : null,
      };

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'longtask') {
              window.__perfData.longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              });
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {}

      // Frame rate tracking
      let lastFrame = performance.now();
      function checkFrame(now) {
        window.__perfData.totalFrames++;
        const delta = now - lastFrame;
        if (delta > 33.3) { // Dropped frame (< 30fps)
          window.__perfData.droppedFrames++;
        }
        lastFrame = now;
        requestAnimationFrame(checkFrame);
      }
      requestAnimationFrame(checkFrame);
    `
  });

  // Start CDP Tracing
  await sendSession('Tracing.start', {
    categories: '-*,blink.user_timing,devtools.timeline,disabled-by-default-devtools.timeline,v8.execute'
  });

  console.log('Beginning rapid interaction simulation (20 seconds)...');

  // Helper to click an element by selector or ID and measure synchronous blocking time + paint latency
  async function clickKey(id) {
    const res = await sendSession('Runtime.evaluate', {
      awaitPromise: true,
      expression: `
        new Promise((resolve) => {
          const t0 = performance.now();
          const el = document.getElementById('${id}');
          if (!el) return resolve({ found: false });
          el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
          el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          const jsDone = performance.now();
          requestAnimationFrame(() => {
            const paintDone = performance.now();
            resolve({
              found: true,
              dispatchMs: jsDone - t0,
              inputToPaintMs: paintDone - t0,
              display: document.querySelector('[aria-label="Calculator Display"] span')?.innerText || ''
            });
          });
        })
      `,
      returnByValue: true
    });
    return res.result.value;
  }

  async function getDroppedDelta() {
    const res = await sendSession('Runtime.evaluate', {
      expression: 'window.__perfData.droppedFrames',
      returnByValue: true
    });
    return res.result.value;
  }

  let lastDropped = 0;
  async function checkScenario(name) {
    const current = await getDroppedDelta();
    const diff = current - lastDropped;
    lastDropped = current;
    console.log(`[SCENARIO] ${name} -> Dropped frames: ${diff}`);
  }

  // 1. Rapid number tapping test: 50 taps with 30ms interval
  console.log('Test 1: Rapid button tapping (50 keypresses at ~33 taps/sec)...');
  const tapJsTimes = [];
  const tapPaintTimes = [];
  const keys = ['btn-7', 'btn-8', 'btn-9', 'btn-add', 'btn-4', 'btn-5', 'btn-6', 'btn-multiply', 'btn-1', 'btn-2', 'btn-3', 'btn-subtract'];
  for (let i = 0; i < 50; i++) {
    const key = keys[i % keys.length];
    const r = await clickKey(key);
    if (r && r.found) {
      tapJsTimes.push(r.dispatchMs);
      tapPaintTimes.push(r.inputToPaintMs);
    }
    await wait(30);
  }
  await checkScenario('1. Rapid 50 number/operator taps');

  // 2. Equals test
  console.log('Test 2: Equals calculation...');
  const eqRes = await clickKey('btn-equals');
  await checkScenario('2. Equals calculation');

  // 3. Switch to Scientific mode
  console.log('Test 3: Switching to Scientific mode...');
  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const tabs = document.querySelectorAll('[role="tab"]');
        for (const t of tabs) {
          if (t.innerText.includes('Scientific')) {
            t.click();
            break;
          }
        }
      })()
    `
  });
  await wait(300);
  await checkScenario('3. Switch to Scientific Mode');

  // 4. Scientific calculations
  console.log('Test 4: Scientific keypresses (sin, 90, etc.)...');
  const sciKeys = ['sci-sin', 'sci-9', 'sci-0', 'sci-paren-close', 'sci-power', 'sci-2', 'sci-add', 'sci-pi'];
  for (const k of sciKeys) {
    const r = await clickKey(k);
    if (r && r.found) {
      tapJsTimes.push(r.dispatchMs);
      tapPaintTimes.push(r.inputToPaintMs);
    }
    await wait(40);
  }
  await clickKey('sci-equals');
  await wait(200);
  await checkScenario('4. Scientific Keypresses & Equals');

  // 5. Rapid backspace test
  console.log('Test 5: Rapid backspace deletion...');
  for (let i = 0; i < 15; i++) {
    const r = await clickKey('sci-backspace');
    if (r && r.found) {
      tapJsTimes.push(r.dispatchMs);
      tapPaintTimes.push(r.inputToPaintMs);
    }
    await wait(30);
  }
  await checkScenario('5. Rapid Backspaces');

  // 6. Test History drawer open/close
  console.log('Test 6: Opening & closing History drawer...');
  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title="Calculation History"]');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('6a. History Drawer Open');
  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title="Close history panel"]');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('6b. History Drawer Close');

  // 7. Test Settings modal open/close & theme switch
  console.log('Test 7: Settings modal & Theme Switch...');
  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[title="Calculator Settings"]');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('7a. Settings Modal Open');

  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('theme-option-light');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('7b. Theme Switch to Light');

  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('theme-option-dark');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('7c. Theme Switch to Dark');

  await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('button[aria-label="Close dialog"]');
        if (btn) btn.click();
      })()
    `
  });
  await wait(300);
  await checkScenario('7d. Settings Modal Close');

  // Gather performance metrics
  const perfData = await sendSession('Runtime.evaluate', {
    expression: `
      (() => {
        const endMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
        return {
          longTasks: window.__perfData.longTasks,
          totalFrames: window.__perfData.totalFrames,
          droppedFrames: window.__perfData.droppedFrames,
          startMemory: window.__perfData.startMemory,
          endMemory,
          memDiffKb: endMemory && window.__perfData.startMemory ? Math.round((endMemory - window.__perfData.startMemory) / 1024) : 0,
        };
      })()
    `,
    returnByValue: true
  });

  const cdpMetrics = await sendSession('Performance.getMetrics');

  console.log('\n================ PROFILING RESULTS ================');
  const avgJs = tapJsTimes.reduce((a, b) => a + b, 0) / tapJsTimes.length;
  const maxJs = Math.max(...tapJsTimes);
  const avgPaint = tapPaintTimes.reduce((a, b) => a + b, 0) / tapPaintTimes.length;
  const maxPaint = Math.max(...tapPaintTimes);
  console.log('Total button clicks simulated:', tapJsTimes.length);
  console.log('Average JS Event Handling Duration:', avgJs.toFixed(3), 'ms');
  console.log('Max JS Event Handling Duration:', maxJs.toFixed(3), 'ms');
  console.log('Average Full Input-to-Paint Duration:', avgPaint.toFixed(3), 'ms');
  console.log('Max Full Input-to-Paint Duration:', maxPaint.toFixed(3), 'ms');
  console.log('Long Tasks (>50ms) count:', perfData.result.value.longTasks.length);
  if (perfData.result.value.longTasks.length > 0) {
    console.log('Long Tasks Details:', perfData.result.value.longTasks);
  }
  console.log('Frame Analysis: Total frames:', perfData.result.value.totalFrames, '| Dropped frames (>33ms):', perfData.result.value.droppedFrames);
  console.log('Memory delta during test:', perfData.result.value.memDiffKb, 'KB');
  console.log('\nCDP Internal Metrics:');
  for (const m of cdpMetrics.metrics) {
    if (['Timestamp', 'AudioHandlers'].includes(m.name)) continue;
    console.log(`  ${m.name}: ${m.value}`);
  }
  console.log('====================================================\n');

  chromeProc.kill();
}

run().catch((err) => {
  console.error('Error running profile script:', err);
  process.exit(1);
});
