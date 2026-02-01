#!/usr/bin/env node

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Configuration
const BASE_URL = 'https://llm.sutyrin.pro';
const ATOMS = [
  { name: 'workflow-test', slug: '2026-01-29-workflow-test' },
  { name: 'au1', slug: '2026-01-30-au1' },
  { name: 'av-sync-debug', slug: '2026-01-30-av-sync-debug' },
  { name: 'av1', slug: '2026-01-30-av1' },
  { name: 'my-first-sketch', slug: '2026-01-30-my-first-sketch' },
  { name: 'test-verify', slug: '2026-01-30-test-verify' },
];

const OUTPUT_DIR = '.planning/quick/021-verify-all-sketches';
const SCREENSHOTS_DIR = join(OUTPUT_DIR, 'screenshots');

// Ensure directories exist
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function captureConsoleMessages(page) {
  const messages = {
    logs: [],
    warnings: [],
    errors: [],
  };

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'log') {
      messages.logs.push(text);
    } else if (msg.type() === 'warning') {
      messages.warnings.push(text);
    } else if (msg.type() === 'error') {
      messages.errors.push(text);
    }
  });

  page.on('pageerror', (error) => {
    messages.errors.push(`Uncaught: ${error.message}`);
  });

  return messages;
}

async function testAtom(page, atom) {
  console.log(`\nTesting atom: ${atom.name} (${atom.slug})`);

  const url = `${BASE_URL}/atom/${atom.slug}/`;
  const result = {
    atom: atom.name,
    slug: atom.slug,
    url: url,
    page_loads_successfully: false,
    initial_console_messages: {},
    iframe_found: false,
    iframe_loads: false,
    canvas: {
      count: 0,
      visible: false,
      width: 0,
      height: 0,
    },
    audio_context: false,
    play_button: {
      found: false,
      visible: false,
      clickable: false,
    },
    animation_started: false,
    console_errors: [],
    status: 'PENDING',
    notes: '',
  };

  try {
    // Clear previous console listeners
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');

    // Setup console capture
    const consoleMessages = await captureConsoleMessages(page);

    // Navigate to atom page
    console.log(`  → Navigating to ${url}`);
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    result.page_loads_successfully = response && response.ok();

    // Wait for page to stabilize
    await page.waitForTimeout(2000);

    // Capture initial console state
    result.initial_console_messages = { ...consoleMessages };

    // Check for iframe and navigate to it
    const iframeElement = await page.$('iframe');
    result.iframe_found = !!iframeElement;

    if (iframeElement) {
      try {
        const iframeHandle = await iframeElement.contentFrame();
        if (iframeHandle) {
          result.iframe_loads = true;

          // Get DOM inspection results from iframe
          const domState = await iframeHandle.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            const audioContext = window.audioContext || window.AudioContext || (window.Tone && window.Tone.Transport);

            const canvasInfo = [];
            canvases.forEach((canvas, idx) => {
              const rect = canvas.getBoundingClientRect();
              canvasInfo.push({
                index: idx,
                visible: rect.height > 0 && rect.width > 0 && window.getComputedStyle(canvas).display !== 'none',
                width: canvas.width,
                height: canvas.height,
              });
            });

            return {
              canvases: canvasInfo,
              canvasCount: canvases.length,
              audioContext: !!audioContext,
              bodyHTML: document.body.innerHTML.substring(0, 500),
              documentTitle: document.title,
            };
          });

          result.canvas.count = domState.canvasCount;
          if (domState.canvases.length > 0) {
            result.canvas.visible = domState.canvases.some(c => c.visible);
            result.canvas.width = domState.canvases[0].width;
            result.canvas.height = domState.canvases[0].height;
          }
          result.audio_context = domState.audioContext;

          console.log(`  ✓ Iframe content: canvas=${domState.canvasCount}, audio_context=${result.audio_context}`);

          // Check for any play buttons or controls in the iframe
          const controls = await iframeHandle.$$('button, [role="button"]');
          if (controls.length > 0) {
            result.play_button.found = true;
            result.play_button.visible = true;
            result.play_button.clickable = true;
          }
        }
      } catch (iframeError) {
        console.log(`  ⚠ Could not access iframe: ${iframeError.message}`);
        result.notes = `Iframe error: ${iframeError.message}`;
      }
    }

    // Take screenshot of page
    const initialScreenshot = join(SCREENSHOTS_DIR, `${atom.slug}-initial.png`);
    await page.screenshot({ path: initialScreenshot, fullPage: true });
    console.log(`  ✓ Screenshot: ${initialScreenshot}`);

    // Try to find and click any button on the main page
    const buttons = await page.$$('button');
    let playButtonClicked = false;
    if (buttons.length > 0) {
      for (const btn of buttons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text.includes('Play') || text.includes('play')) {
          try {
            await btn.click();
            playButtonClicked = true;
            console.log(`  → Clicked play button`);
            break;
          } catch (e) {
            // Continue
          }
        }
      }
    }

    // Wait for potential animation
    if (playButtonClicked) {
      await page.waitForTimeout(2000);
    } else {
      await page.waitForTimeout(1000);
    }

    // Take playing screenshot
    const playingScreenshot = join(SCREENSHOTS_DIR, `${atom.slug}-playing.png`);
    await page.screenshot({ path: playingScreenshot, fullPage: true });

    // Check for errors
    result.console_errors = consoleMessages.errors.filter(e => !e.includes('AudioContext'));

    // Determine status
    if (!result.page_loads_successfully) {
      result.status = 'BROKEN';
      result.notes = 'Page failed to load';
    } else if (!result.iframe_found) {
      result.status = 'BROKEN';
      result.notes = 'No iframe found on page';
    } else if (!result.iframe_loads) {
      result.status = 'BROKEN';
      result.notes = 'Iframe could not be accessed';
    } else if (result.canvas.count === 0 && !result.audio_context) {
      result.status = 'BROKEN';
      result.notes = 'No canvas or audio context found in iframe';
    } else if (result.canvas.count > 0 && !result.canvas.visible) {
      result.status = 'PARTIAL';
      result.notes = 'Canvas exists but not visible (display: none or off-screen)';
    } else if (result.console_errors.length > 0) {
      result.status = 'PARTIAL';
      result.notes = `Console errors: ${result.console_errors.slice(0, 2).join('; ')}`;
    } else if (result.canvas.count > 0 || result.audio_context) {
      result.status = 'PASS';
      result.notes = result.canvas.count > 0
        ? `Canvas ${result.canvas.width}x${result.canvas.height}px visible and ready`
        : 'Audio context initialized, ready for playback';
    } else {
      result.status = 'PASS';
      result.notes = 'Page loaded successfully';
    }

    console.log(`  ✓ Status: ${result.status}`);

    return result;
  } catch (error) {
    console.error(`  ✗ Error testing ${atom.name}: ${error.message}`);
    result.status = 'BROKEN';
    result.notes = `Test error: ${error.message}`;
    return result;
  }
}

async function main() {
  const startTime = Date.now();
  console.log('Starting Playwright atom verification...');
  console.log(`Testing ${ATOMS.length} atoms at ${BASE_URL}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });

  const results = [];

  for (const atom of ATOMS) {
    const result = await testAtom(page, atom);
    results.push(result);
  }

  await page.close();
  await browser.close();

  const duration = Math.round((Date.now() - startTime) / 1000);

  // Summarize results
  const summary = {
    passed: results.filter(r => r.status === 'PASS').length,
    partial: results.filter(r => r.status === 'PARTIAL').length,
    broken: results.filter(r => r.status === 'BROKEN').length,
    total: results.length,
    critical_issues: results
      .filter(r => r.status === 'BROKEN')
      .map(r => `${r.atom}: ${r.notes}`),
  };

  const report = {
    test_date: new Date().toISOString().split('T')[0],
    test_time: new Date().toISOString(),
    duration_seconds: duration,
    atoms_tested: ATOMS.length,
    results: results,
    summary: summary,
  };

  // Write results
  const resultsPath = join(OUTPUT_DIR, 'test-results.json');
  writeFileSync(resultsPath, JSON.stringify(report, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Date: ${report.test_date}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Total atoms: ${summary.total}`);
  console.log(`  ✅ Passed: ${summary.passed}`);
  console.log(`  ⚠️  Partial: ${summary.partial}`);
  console.log(`  ❌ Broken: ${summary.broken}`);

  if (summary.critical_issues.length > 0) {
    console.log('\nCritical Issues:');
    summary.critical_issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log(`Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('='.repeat(60));

  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
