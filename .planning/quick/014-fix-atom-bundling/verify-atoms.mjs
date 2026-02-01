import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTION_URL = 'https://llm.sutyrin.pro';

const atoms = [
  { slug: '2026-01-30-my-first-sketch', hasCanvas: true, hasGUI: false, isAudio: false },
  { slug: '2026-01-30-test-verify', hasCanvas: true, hasGUI: false, isAudio: false },
  { slug: '2026-01-29-workflow-test', hasCanvas: true, hasGUI: false, isAudio: false },
  { slug: '2026-01-30-au1', hasCanvas: false, hasGUI: true, isAudio: true },
  { slug: '2026-01-30-av1', hasCanvas: true, hasGUI: true, isAudio: true },
  { slug: '2026-01-30-av-sync-debug', hasCanvas: true, hasGUI: false, isAudio: false }
];

async function verifyAtom(browser, atom) {
  const page = await browser.newPage();
  const url = `${PRODUCTION_URL}/atom/${atom.slug}`;
  const results = {
    slug: atom.slug,
    url,
    success: false,
    hasCanvas: false,
    hasGUI: false,
    hasTransportControls: false,
    moduleErrors: [],
    consoleErrors: []
  };

  console.log(`\n🔍 Testing: ${atom.slug}`);
  console.log(`   URL: ${url}`);

  // Capture page errors (module resolution failures)
  page.on('pageerror', (error) => {
    results.moduleErrors.push(error.message);
    console.log(`   ❌ Page error: ${error.message}`);
  });

  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(msg.text());
    }
  });

  try {
    // Navigate to atom page
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });

    // Wait for iframe to load
    await page.waitForSelector('iframe', { timeout: 5000 });
    const iframe = page.frameLocator('iframe');

    // Give extra time for large bundles to load and execute
    await page.waitForTimeout(3000);

    // Check for canvas (p5 atoms)
    if (atom.hasCanvas) {
      try {
        await iframe.locator('canvas').waitFor({ timeout: 3000 });
        results.hasCanvas = true;
        console.log('   ✓ Canvas element found');
      } catch (e) {
        console.log('   ❌ Canvas NOT found (expected)');
      }
    }

    // Check for lil-gui panel
    if (atom.hasGUI) {
      try {
        await iframe.locator('.lil-gui').first().waitFor({ timeout: 5000 });
        results.hasGUI = true;
        console.log('   ✓ GUI panel found');
      } catch (e) {
        console.log('   ❌ GUI panel NOT found (expected)');
      }
    }

    // Check for transport controls (Play/Stop buttons)
    if (atom.isAudio) {
      try {
        await iframe.locator('#playBtn').waitFor({ timeout: 2000 });
        await iframe.locator('#stopBtn').waitFor({ timeout: 2000 });
        results.hasTransportControls = true;
        console.log('   ✓ Transport controls found');
      } catch (e) {
        console.log('   ⚠️  Transport controls not found');
      }
    }

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'screenshots', `${atom.slug}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   📸 Screenshot saved`);

    // Determine success
    const canvasCheck = !atom.hasCanvas || results.hasCanvas;
    const guiCheck = !atom.hasGUI || results.hasGUI;
    const noModuleErrors = results.moduleErrors.length === 0;

    results.success = canvasCheck && guiCheck && noModuleErrors;

    if (results.success) {
      console.log(`   ✅ PASS`);
    } else {
      console.log(`   ❌ FAIL`);
      if (!canvasCheck) console.log(`      - Expected canvas but not found`);
      if (!guiCheck) console.log(`      - Expected GUI but not found`);
      if (!noModuleErrors) console.log(`      - Module errors: ${results.moduleErrors.length}`);
    }

  } catch (error) {
    console.log(`   ❌ Error during verification: ${error.message}`);
    results.success = false;
  } finally {
    await page.close();
  }

  return results;
}

async function main() {
  console.log('🚀 Starting atom verification on production...\n');
  console.log(`Production URL: ${PRODUCTION_URL}`);

  const browser = await chromium.launch();
  const allResults = [];

  for (const atom of atoms) {
    const result = await verifyAtom(browser, atom);
    allResults.push(result);
  }

  await browser.close();

  // Write results to JSON
  const resultsPath = path.join(__dirname, 'verification-results.json');
  await writeFile(resultsPath, JSON.stringify(allResults, null, 2));

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const passed = allResults.filter(r => r.success).length;
  const failed = allResults.filter(r => !r.success).length;
  const totalModuleErrors = allResults.reduce((sum, r) => sum + r.moduleErrors.length, 0);

  console.log(`\nTotal atoms tested: ${allResults.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\nModule errors found: ${totalModuleErrors}`);

  if (failed > 0) {
    console.log('\nFailed atoms:');
    allResults.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.slug}`);
      if (r.moduleErrors.length > 0) {
        r.moduleErrors.forEach(err => console.log(`    • ${err.substring(0, 100)}...`));
      }
    });
  }

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log(`Screenshots saved to: ${path.join(__dirname, 'screenshots')}/`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
