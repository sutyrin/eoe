import { chromium } from 'playwright';

async function testProd() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    const text = `${msg.type()}: ${msg.text()}`;
    console.log(text);
    logs.push(text);
  });
  page.on('pageerror', err => {
    const text = `ERROR: ${err.message}`;
    console.log(text);
    logs.push(text);
  });

  console.log('Loading production iframe directly...');
  await page.goto('https://llm.sutyrin.pro/atoms/2026-01-30-av1/index.html', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForTimeout(5000);

  const hasCanvas = await page.locator('canvas').count();
  const hasGUI = await page.locator('.lil-gui').count();
  const hasPlay = await page.locator('#playBtn').count();

  console.log(`\nResults:`);
  console.log(`Canvas: ${hasCanvas}`);
  console.log(`GUI: ${hasGUI}`);
  console.log(`Play button: ${hasPlay}`);

  await page.screenshot({ path: '/home/pavel/dev/play/eoe/.planning/quick/014-fix-atom-bundling/prod-direct.png' });

  await browser.close();

  // Write logs to file
  const fs = await import('fs/promises');
  await fs.writeFile(
    '/home/pavel/dev/play/eoe/.planning/quick/014-fix-atom-bundling/prod-console.log',
    logs.join('\n')
  );

  process.exit(hasCanvas > 0 && hasGUI > 0 ? 0 : 1);
}

testProd().catch(console.error);
