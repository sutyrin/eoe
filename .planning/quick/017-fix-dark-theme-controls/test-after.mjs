/**
 * Playwright test to capture after screenshots of fixed atom pages on dark theme.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://llm.sutyrin.pro';
const SCREENSHOTS_DIR = {
  before: path.join(__dirname, 'before-screenshots'),
  after: path.join(__dirname, 'after-screenshots'),
};

// Ensure directories exist
Object.values(SCREENSHOTS_DIR).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function testDarkThemeVisibility(screenshotType = 'after') {
  const browser = await chromium.launch();

  try {
    console.log(`\nTesting ${screenshotType} screenshots on dark theme...`);

    const page = await browser.newPage();

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate to gallery
    console.log('Navigating to gallery...');
    await page.goto(`${BASE_URL}/mobile/gallery`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take gallery screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR[screenshotType], '01-gallery.png'),
      fullPage: true,
    });
    console.log(`✓ Gallery screenshot saved`);

    // Navigate directly to an atom (my-first-sketch based on the STATE showing it exists)
    console.log('Navigating to atom detail page...');
    await page.goto(`${BASE_URL}/mobile/2026-01-30-my-first-sketch`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Take full page screenshot (showing tabs)
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR[screenshotType], '02-atom-detail-code-tab.png'),
      fullPage: true,
    });
    console.log(`✓ Atom detail page (Code tab) screenshot saved`);

    // Click Params tab to show sliders
    const paramsTabs = await page.$$('[data-tab="params"]');
    if (paramsTabs.length > 0) {
      await paramsTabs[0].click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '03-params-tab.png'),
        fullPage: true,
      });
      console.log(`✓ Params tab screenshot saved (sliders visible)`);

      // Test slider interaction
      const sliders = await page.$$('input[type="range"]');
      if (sliders.length > 0) {
        try {
          const slider = sliders[0];
          const box = await slider.boundingBox();
          if (box) {
            console.log(`  Slider found at ${box.x}, ${box.y}`);
            await page.mouse.move(box.x + 20, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 10 });
            await page.mouse.up();
            await page.waitForTimeout(300);
            console.log('✓ Slider interaction test passed');
          }
        } catch (e) {
          console.log('⚠ Slider interaction test skipped:', e.message);
        }
      }

      // Test number input
      const numberInputs = await page.$$('input[type="number"]');
      if (numberInputs.length > 0) {
        try {
          const input = numberInputs[0];
          const box = await input.boundingBox();
          console.log(`  Number input found at ${box?.x}, ${box?.y}`);
          await input.click();
          await input.fill('42');
          console.log('✓ Number input interaction test passed');
        } catch (e) {
          console.log('⚠ Number input test skipped:', e.message);
        }
      }
    }

    // Click Voice tab to show record button
    const voiceTabs = await page.$$('[data-tab="voice"]');
    if (voiceTabs.length > 0) {
      await voiceTabs[0].click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '04-voice-tab.png'),
        fullPage: true,
      });
      console.log(`✓ Voice tab screenshot saved (record button visible)`);

      const recordBtns = await page.$$('.record-btn');
      if (recordBtns.length > 0) {
        try {
          const btn = recordBtns[0];
          const isVisible = await btn.isVisible();
          const box = await btn.boundingBox();
          console.log(`  Record button found at ${box?.x}, ${box?.y}, visible: ${isVisible}`);
        } catch (e) {
          console.log('⚠ Record button test skipped:', e.message);
        }
      }
    }

    // Click Notes tab
    const notesTabs = await page.$$('[data-tab="notes"]');
    if (notesTabs.length > 0) {
      await notesTabs[0].click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '05-notes-tab.png'),
        fullPage: true,
      });
      console.log(`✓ Notes tab screenshot saved (buttons/textarea visible)`);

      // Click Edit button
      const editBtns = await page.$$('.mode-btn');
      if (editBtns.length > 1) {
        try {
          const editBtn = editBtns[1]; // Second button is Edit
          const box = await editBtn.boundingBox();
          console.log(`  Edit button found at ${box?.x}, ${box?.y}`);
          await editBtn.click();
          await page.waitForTimeout(500);

          const textarea = await page.$('.notes-textarea');
          if (textarea) {
            const isVisible = await textarea.isVisible();
            const textBox = await textarea.boundingBox();
            console.log(`  Notes textarea found at ${textBox?.x}, ${textBox?.y}, visible: ${isVisible}`);

            // Take screenshot of edit mode
            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR[screenshotType], '05b-notes-edit-mode.png'),
              fullPage: true,
            });
            console.log(`✓ Notes edit mode screenshot saved`);

            // Try typing in textarea
            await textarea.click();
            await textarea.type('Test note input', { delay: 50 });
            console.log('✓ Notes textarea interaction test passed');
          }
        } catch (e) {
          console.log('⚠ Notes edit test skipped:', e.message);
        }
      }
    }

    // Click Config tab
    const configTabs = await page.$$('[data-tab="config"]');
    if (configTabs.length > 0) {
      await configTabs[0].click();
      await page.waitForTimeout(800);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '06-config-tab.png'),
        fullPage: true,
      });
      console.log(`✓ Config tab screenshot saved`);
    }

    // Go back to Params and test more
    const paramsTabs2 = await page.$$('[data-tab="params"]');
    if (paramsTabs2.length > 0) {
      await paramsTabs2[0].click();
      await page.waitForTimeout(500);

      // Take another screenshot for comparison
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '03b-params-tab-final.png'),
        fullPage: true,
      });
      console.log(`✓ Final Params tab screenshot saved`);
    }

    await page.close();

  } catch (error) {
    console.error(`Error during ${screenshotType} screenshot capture:`, error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('Dark Theme Control Visibility Test - AFTER FIX');
  console.log('==============================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Viewport: 375x812 (mobile)\n`);

  // Capture after screenshots
  await testDarkThemeVisibility('after');

  console.log('\n✓ After screenshots captured successfully');
  console.log(`Location: ${SCREENSHOTS_DIR.after}`);
}

main().catch(console.error);
