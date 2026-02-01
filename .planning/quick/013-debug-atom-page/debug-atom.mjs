import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ATOM_PAGE_URL = 'https://llm.sutyrin.pro/atom/2026-01-30-av1/';
const ATOM_IFRAME_URL = 'https://llm.sutyrin.pro/atoms/2026-01-30-av1/index.html';

async function debugAtomPage() {
  const results = {
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    networkFailures: [],
    domState: {},
    afterClickPlay: {},
    directUrlErrors: [],
    directUrlNetwork: [],
    directUrlDom: {}
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Collect console messages
  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      source: 'main-page',
      timestamp: new Date().toISOString()
    };
    if (msg.type() === 'error' || msg.type() === 'warning') {
      results.consoleErrors.push(entry);
    }
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect page errors (uncaught exceptions)
  page.on('pageerror', err => {
    const entry = {
      type: 'pageerror',
      text: err.message,
      stack: err.stack,
      source: 'main-page',
      timestamp: new Date().toISOString()
    };
    results.consoleErrors.push(entry);
    console.log(`[PAGE ERROR] ${err.message}`);
  });

  // Monitor network failures
  page.on('response', async response => {
    if (response.status() >= 400) {
      const failure = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };
      results.networkFailures.push(failure);
      console.log(`[NETWORK FAIL] ${failure.status} ${failure.url}`);
    }
  });

  console.log(`\n=== Testing main atom page: ${ATOM_PAGE_URL} ===\n`);

  // Navigate to main atom page
  try {
    await page.goto(ATOM_PAGE_URL, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (err) {
    console.log(`Navigation error: ${err.message}`);
  }

  // Wait for potential JS execution
  await page.waitForTimeout(3000);

  // Take screenshot of main page
  await page.screenshot({
    path: join(__dirname, 'screenshots', 'atom-page-main.png'),
    fullPage: true
  });
  console.log('Screenshot saved: atom-page-main.png');

  // Try to access iframe
  let iframeAccessible = false;
  let iframeBodySnippet = '';
  let hasCanvas = false;
  let hasPlayBtn = false;
  let hasStopBtn = false;
  let hasGUI = false;

  try {
    const iframeElement = page.frameLocator('iframe[title="2026-01-30-av1"]');
    const iframeFrame = page.frames().find(f => f.url().includes('2026-01-30-av1'));

    if (iframeFrame) {
      iframeAccessible = true;
      console.log(`Iframe found: ${iframeFrame.url()}`);

      // Listen to iframe console
      iframeFrame.on('console', msg => {
        const entry = {
          type: msg.type(),
          text: msg.text(),
          source: 'iframe',
          timestamp: new Date().toISOString()
        };
        if (msg.type() === 'error' || msg.type() === 'warning') {
          results.consoleErrors.push(entry);
        }
        console.log(`[IFRAME ${msg.type()}] ${msg.text()}`);
      });

      // Check DOM elements in iframe
      hasCanvas = await iframeFrame.locator('canvas').count() > 0;
      hasPlayBtn = await iframeFrame.locator('#playBtn').count() > 0;
      hasStopBtn = await iframeFrame.locator('#stopBtn').count() > 0;
      hasGUI = await iframeFrame.locator('.lil-gui').count() > 0;

      // Get body snippet
      const bodyHTML = await iframeFrame.evaluate(() => document.body.innerHTML);
      iframeBodySnippet = bodyHTML.substring(0, 2000);

      console.log(`\nIframe DOM state:`);
      console.log(`  Canvas: ${hasCanvas}`);
      console.log(`  Play button: ${hasPlayBtn}`);
      console.log(`  Stop button: ${hasStopBtn}`);
      console.log(`  GUI: ${hasGUI}`);

      // Try clicking play if button exists
      if (hasPlayBtn) {
        console.log('\nAttempting to click Play button...');
        const errorsBefore = results.consoleErrors.length;
        try {
          await iframeFrame.locator('#playBtn').click();
          await page.waitForTimeout(2000);
          const errorsAfter = results.consoleErrors.length;
          results.afterClickPlay = {
            clicked: true,
            newErrors: errorsAfter - errorsBefore,
            anyChange: errorsAfter !== errorsBefore
          };
          console.log(`New errors after click: ${results.afterClickPlay.newErrors}`);
        } catch (err) {
          results.afterClickPlay = {
            clicked: false,
            error: err.message
          };
          console.log(`Click failed: ${err.message}`);
        }
      }

      // Screenshot iframe
      await iframeFrame.locator('body').screenshot({
        path: join(__dirname, 'screenshots', 'atom-iframe-content.png')
      });
      console.log('Screenshot saved: atom-iframe-content.png');
    } else {
      console.log('Iframe not accessible');
    }
  } catch (err) {
    console.log(`Iframe access error: ${err.message}`);
  }

  results.domState = {
    hasCanvas,
    hasPlayBtn,
    hasStopBtn,
    hasGUI,
    iframeAccessible,
    bodySnippet: iframeBodySnippet
  };

  console.log(`\n=== Testing direct iframe URL: ${ATOM_IFRAME_URL} ===\n`);

  // Now test the direct iframe URL
  const page2 = await context.newPage();

  page2.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    if (msg.type() === 'error' || msg.type() === 'warning') {
      results.directUrlErrors.push(entry);
    }
    console.log(`[DIRECT ${msg.type()}] ${msg.text()}`);
  });

  page2.on('pageerror', err => {
    const entry = {
      type: 'pageerror',
      text: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    };
    results.directUrlErrors.push(entry);
    console.log(`[DIRECT PAGE ERROR] ${err.message}`);
  });

  page2.on('response', async response => {
    if (response.status() >= 400) {
      const failure = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };
      results.directUrlNetwork.push(failure);
      console.log(`[DIRECT NETWORK FAIL] ${failure.status} ${failure.url}`);
    }
  });

  try {
    await page2.goto(ATOM_IFRAME_URL, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (err) {
    console.log(`Direct URL navigation error: ${err.message}`);
  }

  await page2.waitForTimeout(3000);

  // Check DOM on direct URL
  const directHasCanvas = await page2.locator('canvas').count() > 0;
  const directHasPlayBtn = await page2.locator('#playBtn').count() > 0;
  const directHasStopBtn = await page2.locator('#stopBtn').count() > 0;
  const directHasGUI = await page2.locator('.lil-gui').count() > 0;
  const directBodyHTML = await page2.evaluate(() => document.body.innerHTML);

  results.directUrlDom = {
    hasCanvas: directHasCanvas,
    hasPlayBtn: directHasPlayBtn,
    hasStopBtn: directHasStopBtn,
    hasGUI: directHasGUI,
    bodySnippet: directBodyHTML.substring(0, 2000)
  };

  console.log(`\nDirect URL DOM state:`);
  console.log(`  Canvas: ${directHasCanvas}`);
  console.log(`  Play button: ${directHasPlayBtn}`);
  console.log(`  Stop button: ${directHasStopBtn}`);
  console.log(`  GUI: ${directHasGUI}`);

  await page2.screenshot({
    path: join(__dirname, 'screenshots', 'atom-direct-url.png'),
    fullPage: true
  });
  console.log('Screenshot saved: atom-direct-url.png');

  await browser.close();

  // Save results
  const resultsPath = join(__dirname, 'debug-results.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  // Print summary
  console.log(`\n=== SUMMARY ===`);
  console.log(`Console errors: ${results.consoleErrors.length}`);
  console.log(`Network failures: ${results.networkFailures.length}`);
  console.log(`Direct URL errors: ${results.directUrlErrors.length}`);
  console.log(`Direct URL network failures: ${results.directUrlNetwork.length}`);
  console.log(`Canvas present: ${hasCanvas || directHasCanvas}`);
  console.log(`Play button present: ${hasPlayBtn || directHasPlayBtn}`);

  return results;
}

debugAtomPage().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
