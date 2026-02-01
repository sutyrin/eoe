import { chromium } from 'playwright';

async function debugAtom() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture all console messages from main page and iframe
  page.on('console', msg => console.log(`PAGE: ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

  // Navigate to the main atom page
  await page.goto('https://llm.sutyrin.pro/atom/2026-01-30-av1');

  await page.waitForTimeout(2000);

  // Now navigate directly to the iframe URL
  console.log('\n--- Loading iframe content directly ---\n');
  await page.goto('https://llm.sutyrin.pro/atoms/2026-01-30-av1/index.html');

  // Wait to see if bundle loads
  await page.waitForTimeout(5000);

  // Check what's on the page
  const hasCanvas = await page.locator('canvas').count();
  const hasGUI = await page.locator('.lil-gui').count();
  const hasPlay = await page.locator('#playBtn').count();

  console.log(`\nCanvas elements: ${hasCanvas}`);
  console.log(`GUI elements: ${hasGUI}`);
  console.log(`Play button: ${hasPlay}`);

  // Take screenshot
  await page.screenshot({ path: '/home/pavel/dev/play/eoe/.planning/quick/014-fix-atom-bundling/debug-direct.png' });

  console.log('\nScreenshot saved. Browser will stay open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
}

debugAtom().catch(console.error);
