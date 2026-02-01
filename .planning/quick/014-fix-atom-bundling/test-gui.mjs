import { chromium } from 'playwright';

async function testGUI() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log(`${msg.type()}: ${msg.text()}`));

  console.log('Loading au1...');
  await page.goto('https://llm.sutyrin.pro/atoms/2026-01-30-au1/index.html');
  await page.waitForTimeout(3000);

  const guiElements = await page.locator('.lil-gui, .dg, [class*="gui"]').all();
  console.log(`\nFound ${guiElements.length} GUI elements`);

  // Check all divs
  const allDivs = await page.locator('div').all();
  console.log(`Total divs: ${allDivs.length}`);

  // Get class names
  for (let i = 0; i < Math.min(10, allDivs.length); i++) {
    const className = await allDivs[i].getAttribute('class');
    console.log(`Div ${i}: class="${className}"`);
  }

  await page.screenshot({ path: '/home/pavel/dev/play/eoe/.planning/quick/014-fix-atom-bundling/au1-gui-test.png', fullPage: true });

  await browser.close();
}

testGUI().catch(console.error);
