import playwright from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function debugPage(browser, url, label) {
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      message: msg.text(),
      location: msg.location()
    });
  });

  // Capture any uncaught exceptions
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  });

  // Navigate to page
  console.log(`\n[${label}] Navigating to ${url}`);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error(`[${label}] Navigation error:`, e.message);
  }

  // Wait for any dynamic content to load
  await page.waitForTimeout(3000);

  // Inspect canvas elements
  const canvasInfo = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    const results = [];

    for (const canvas of canvases) {
      const rect = canvas.getBoundingClientRect();
      const computed = window.getComputedStyle(canvas);
      const parent = canvas.parentElement;

      results.push({
        width: canvas.width,
        height: canvas.height,
        id: canvas.id || 'no-id',
        class: canvas.className,
        display: computed.display,
        visibility: computed.visibility,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        offsetParent: canvas.offsetParent !== null,
        rectVisible: rect.width > 0 && rect.height > 0,
        rectWidth: rect.width,
        rectHeight: rect.height,
        parentTag: parent ? parent.tagName : 'none',
        parentClass: parent ? parent.className : 'none'
      });
    }

    return results;
  });

  // Look for p5 related elements/globals
  const p5Status = await page.evaluate(() => {
    return {
      hasWindow_p5: typeof window.p5 !== 'undefined',
      hasWindow_p5Instance: typeof window.p5Instance !== 'undefined',
      hasP5Container: document.querySelector('.p5Container') !== null,
      hasP5Canvas: document.querySelector('.p5Canvas') !== null,
      bodyInnerHTML_length: document.body.innerHTML.length,
      allElementCount: document.querySelectorAll('*').length
    };
  });

  // Check for button elements
  const buttonInfo = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, [role="button"]');
    return {
      count: buttons.length,
      ids: Array.from(buttons).map(b => b.id || b.textContent.slice(0, 20))
    };
  });

  // Get page title and meta tags
  const pageInfo = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      scripts: document.querySelectorAll('script').length,
      styleSheets: document.querySelectorAll('link[rel="stylesheet"], style').length
    };
  });

  // Take screenshot
  const screenshotPath = path.join(__dirname, 'screenshots', `${label}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`[${label}] Screenshot saved to ${screenshotPath}`);

  // Get all script sources to check what's loaded
  const scripts = await page.evaluate(() => {
    const scriptElements = document.querySelectorAll('script');
    return Array.from(scriptElements).map(s => ({
      src: s.src,
      type: s.type,
      text_length: s.textContent.length
    })).filter(s => s.src || s.text_length > 0);
  });

  await page.close();

  return {
    url,
    label,
    pageInfo,
    consoleMessages,
    pageErrors,
    canvasElements: canvasInfo,
    canvasCount: canvasInfo.length,
    canvasVisible: canvasInfo.length > 0 && canvasInfo.some(c => c.offsetParent),
    p5Status,
    buttonInfo,
    scripts,
    screenshotPath
  };
}

async function main() {
  const browser = await playwright.chromium.launch();

  console.log('\n=== av-sync-debug Debug Session ===');

  // Debug av-sync-debug
  const avSyncDebugResult = await debugPage(
    browser,
    'https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/',
    'av-sync-debug'
  );

  // Debug av1 (working baseline)
  const av1Result = await debugPage(
    browser,
    'https://llm.sutyrin.pro/atom/2026-01-30-av1/',
    'av1-baseline'
  );

  // Comparison
  const comparison = {
    avSyncDebug: {
      canvasFound: avSyncDebugResult.canvasCount > 0,
      canvasVisible: avSyncDebugResult.canvasVisible,
      consoleErrors: avSyncDebugResult.consoleMessages.filter(m => m.type === 'error'),
      consoleWarnings: avSyncDebugResult.consoleMessages.filter(m => m.type === 'warning'),
      p5Loaded: avSyncDebugResult.p5Status.hasWindow_p5 || avSyncDebugResult.p5Status.hasWindow_p5Instance,
      buttonCount: avSyncDebugResult.buttonInfo.count
    },
    av1Baseline: {
      canvasFound: av1Result.canvasCount > 0,
      canvasVisible: av1Result.canvasVisible,
      consoleErrors: av1Result.consoleMessages.filter(m => m.type === 'error'),
      consoleWarnings: av1Result.consoleMessages.filter(m => m.type === 'warning'),
      p5Loaded: av1Result.p5Status.hasWindow_p5 || av1Result.p5Status.hasWindow_p5Instance,
      buttonCount: av1Result.buttonInfo.count
    },
    difference: {
      canvasCount: av1Result.canvasCount - avSyncDebugResult.canvasCount,
      consoleErrorDifference: av1Result.consoleMessages.filter(m => m.type === 'error').length -
                              avSyncDebugResult.consoleMessages.filter(m => m.type === 'error').length,
      canvasVisibilityDifference: av1Result.canvasVisible !== avSyncDebugResult.canvasVisible
    }
  };

  // Save results
  const results = {
    executedAt: new Date().toISOString(),
    avSyncDebug: avSyncDebugResult,
    av1Baseline: av1Result,
    comparison,
    rootCauseAnalysis: {
      firstErrorInAvSyncDebug: avSyncDebugResult.consoleMessages.find(m => m.type === 'error'),
      canvasElementsInAvSyncDebug: avSyncDebugResult.canvasElements,
      canvasElementsInAv1: av1Result.canvasElements,
      p5StatusAvSyncDebug: avSyncDebugResult.p5Status,
      p5StatusAv1: av1Result.p5Status
    }
  };

  const outputPath = path.join(__dirname, 'debug-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDebug results saved to ${outputPath}`);

  // Print summary
  console.log('\n=== SUMMARY ===');
  console.log(`av-sync-debug canvas: ${avSyncDebugResult.canvasCount} found, visible: ${avSyncDebugResult.canvasVisible}`);
  console.log(`av1 canvas: ${av1Result.canvasCount} found, visible: ${av1Result.canvasVisible}`);
  console.log(`av-sync-debug console errors: ${comparison.avSyncDebug.consoleErrors.length}`);
  console.log(`av1 console errors: ${comparison.av1Baseline.consoleErrors.length}`);

  if (comparison.avSyncDebug.consoleErrors.length > 0) {
    console.log('\n=== FIRST ERROR IN av-sync-debug ===');
    console.log(comparison.avSyncDebug.consoleErrors[0].message);
  }

  await browser.close();
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
