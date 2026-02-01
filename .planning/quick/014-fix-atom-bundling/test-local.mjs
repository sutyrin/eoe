import { chromium } from 'playwright';

async function testLocal() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log(`CONSOLE: ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => console.log(`ERROR: ${err.message}`));

  console.log('Loading local atom...');
  await page.goto('http://localhost:4321/atoms/2026-01-30-av1/index.html');
  await page.waitForTimeout(3000);

  const hasCanvas = await page.locator('canvas').count();
  const hasGUI = await page.locator('.lil-gui').count();

  console.log(`Canvas: ${hasCanvas}`);
  console.log(`GUI: ${hasGUI}`);

  await page.screenshot({ path: '/home/pavel/dev/play/eoe/.planning/quick/014-fix-atom-bundling/local-test.png' });
  await browser.close();

  process.exit(hasCanvas > 0 && hasGUI > 0 ? 0 : 1);
}

testLocal().catch(console.error);
