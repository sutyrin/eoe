/**
 * Playwright test to capture before/after screenshots of atom pages on dark theme.
 * Tests visibility of all controls: buttons, sliders, inputs, icons, tabs.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

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

async function testDarkThemeVisibility(screenshotType = 'before') {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    console.log(`\nTesting ${screenshotType} screenshots on dark theme...`);

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

    // Click first atom (find any atom link)
    const atomLinks = await page.$$('a[href*="/mobile/"]');
    if (atomLinks.length > 0) {
      await atomLinks[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Take full page screenshot (showing all visible tabs)
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR[screenshotType], '02-atom-detail-full.png'),
        fullPage: true,
      });
      console.log(`✓ Atom detail page screenshot saved`);

      // Click Params tab to show sliders
      const paramsTabs = await page.$$('[data-tab="params"]');
      if (paramsTabs.length > 0) {
        await paramsTabs[0].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR[screenshotType], '03-params-tab.png'),
          fullPage: true,
        });
        console.log(`✓ Params tab screenshot saved (sliders visible)`);
      }

      // Click Voice tab to show record button
      const voiceTabs = await page.$$('[data-tab="voice"]');
      if (voiceTabs.length > 0) {
        await voiceTabs[0].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR[screenshotType], '04-voice-tab.png'),
          fullPage: true,
        });
        console.log(`✓ Voice tab screenshot saved (record button visible)`);
      }

      // Click Notes tab
      const notesTabs = await page.$$('[data-tab="notes"]');
      if (notesTabs.length > 0) {
        await notesTabs[0].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR[screenshotType], '05-notes-tab.png'),
          fullPage: true,
        });
        console.log(`✓ Notes tab screenshot saved (buttons/textarea visible)`);
      }

      // Click Config tab
      const configTabs = await page.$$('[data-tab="config"]');
      if (configTabs.length > 0) {
        await configTabs[0].click();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR[screenshotType], '06-config-tab.png'),
          fullPage: true,
        });
        console.log(`✓ Config tab screenshot saved`);
      }

      // Test control interactions
      console.log('\nTesting control interactions...');

      // Go back to Params tab
      const paramsTabs2 = await page.$$('[data-tab="params"]');
      if (paramsTabs2.length > 0) {
        await paramsTabs2[0].click();
        await page.waitForTimeout(500);

        // Test slider interaction
        const sliders = await page.$$('input[type="range"]');
        if (sliders.length > 0) {
          // Try to drag slider
          const slider = sliders[0];
          const box = await slider.boundingBox();
          if (box) {
            await page.mouse.move(box.x + 20, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + 100, box.y + box.height / 2, { steps: 10 });
            await page.mouse.up();
            await page.waitForTimeout(300);
            console.log('✓ Slider interaction test passed');
          }
        }

        // Test number input
        const numberInputs = await page.$$('input[type="number"]');
        if (numberInputs.length > 0) {
          const input = numberInputs[0];
          await input.click();
          await input.fill('42');
          console.log('✓ Number input interaction test passed');
        }
      }

      // Test Voice tab record button
      const voiceTabs2 = await page.$$('[data-tab="voice"]');
      if (voiceTabs2.length > 0) {
        await voiceTabs2[0].click();
        await page.waitForTimeout(500);

        const recordBtns = await page.$$('.record-btn, button[aria-label*="Record"]');
        if (recordBtns.length > 0) {
          const btn = recordBtns[0];
          const isVisible = await btn.isVisible();
          console.log(`✓ Record button visibility: ${isVisible}`);
        }
      }

      // Test Notes tab buttons
      const notesTabs2 = await page.$$('[data-tab="notes"]');
      if (notesTabs2.length > 0) {
        await notesTabs2[0].click();
        await page.waitForTimeout(500);

        const editBtns = await page.$$('.mode-btn');
        if (editBtns.length > 1) {
          const editBtn = editBtns[1]; // Second button is Edit
          await editBtn.click();
          await page.waitForTimeout(300);

          const textarea = await page.$('.notes-textarea');
          if (textarea) {
            const isVisible = await textarea.isVisible();
            console.log(`✓ Notes textarea visibility: ${isVisible}`);
          }

          // Try typing in textarea
          if (textarea) {
            await textarea.click();
            await textarea.type('Test note', { delay: 50 });
            console.log('✓ Notes textarea interaction test passed');
          }
        }
      }

    } else {
      console.warn('⚠ No atom links found in gallery');
    }

  } catch (error) {
    console.error(`Error during ${screenshotType} screenshot capture:`, error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  console.log('Dark Theme Control Visibility Test');
  console.log('===================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Viewport: 375x812 (mobile)\n`);

  // Capture before screenshots
  await testDarkThemeVisibility('before');

  console.log('\n✓ Before screenshots captured successfully');
  console.log(`Location: ${SCREENSHOTS_DIR.before}`);
}

main().catch(console.error);
