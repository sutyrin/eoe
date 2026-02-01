#!/usr/bin/env node
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'https://llm.sutyrin.pro';
const SCREENSHOT_DIR = '.planning/quick/012-deploy-test-phase6/screenshots';

const pages = [
  {
    name: 'Homepage',
    url: '/',
    checks: [
      { type: 'title', description: 'Page has title' },
      { type: 'selector', selector: 'body', description: 'Body element exists' }
    ]
  },
  {
    name: 'Mobile Gallery',
    url: '/mobile/gallery',
    checks: [
      { type: 'selector', selector: 'body', description: 'Gallery page loaded' },
      { type: 'text', text: /gallery|atom/i, description: 'Gallery content exists' }
    ]
  },
  {
    name: 'Composition Canvas',
    url: '/mobile/compose',
    checks: [
      { type: 'selector', selector: 'body', description: 'Compose page loaded' },
      { type: 'text', text: /composition|canvas|react-flow/i, description: 'Composition UI present' }
    ]
  },
  {
    name: 'Compositions List',
    url: '/mobile/compositions',
    checks: [
      { type: 'selector', selector: 'body', description: 'Compositions page loaded' },
      { type: 'text', text: /composition|snapshot|empty/i, description: 'Compositions content present' }
    ]
  },
  {
    name: 'Backup Management',
    url: '/mobile/backup',
    checks: [
      { type: 'selector', selector: 'body', description: 'Backup page loaded' },
      { type: 'text', text: /backup|sync|status/i, description: 'Backup UI present' }
    ]
  },
  {
    name: 'Shareable URL',
    url: '/c/?id=test',
    checks: [
      { type: 'selector', selector: 'body', description: 'Shareable page loaded' },
      { type: 'pageLoad', description: 'Page loads without crash (graceful handling)' }
    ]
  }
];

async function runTests() {
  console.log('🚀 Starting Playwright tests for Phase 6 features\n');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Mobile viewport: 390x844 (iPhone 14)\n`);

  const results = [];
  const consoleErrors = [];

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ page: '', message: msg.text() });
    }
  });

  page.on('pageerror', error => {
    consoleErrors.push({ page: '', message: error.toString() });
  });

  for (const testPage of pages) {
    console.log(`\n📄 Testing: ${testPage.name} (${testPage.url})`);

    const result = {
      name: testPage.name,
      url: testPage.url,
      status: 'PASS',
      checks: [],
      errors: [],
      screenshot: `${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`
    };

    // Update console error context
    consoleErrors.forEach(e => { if (e.page === '') e.page = testPage.name; });

    try {
      // Navigate with timeout
      const response = await page.goto(`${BASE_URL}${testPage.url}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      console.log(`   ✓ Navigation complete (${response.status()})`);

      if (!response.ok()) {
        result.status = 'FAIL';
        result.errors.push(`HTTP ${response.status()}`);
      }

      // Wait a bit for JS to execute
      await page.waitForTimeout(2000);

      // Run checks
      for (const check of testPage.checks) {
        try {
          if (check.type === 'title') {
            const title = await page.title();
            if (title && title.length > 0) {
              console.log(`   ✓ ${check.description}: "${title}"`);
              result.checks.push({ description: check.description, status: 'PASS', detail: title });
            } else {
              console.log(`   ✗ ${check.description}: empty`);
              result.checks.push({ description: check.description, status: 'FAIL', detail: 'empty' });
              result.status = 'FAIL';
            }
          } else if (check.type === 'selector') {
            const element = await page.$(check.selector);
            if (element) {
              console.log(`   ✓ ${check.description}`);
              result.checks.push({ description: check.description, status: 'PASS' });
            } else {
              console.log(`   ✗ ${check.description}: not found`);
              result.checks.push({ description: check.description, status: 'FAIL' });
              result.status = 'FAIL';
            }
          } else if (check.type === 'text') {
            const bodyText = await page.textContent('body');
            if (check.text.test(bodyText)) {
              console.log(`   ✓ ${check.description}`);
              result.checks.push({ description: check.description, status: 'PASS' });
            } else {
              console.log(`   ✗ ${check.description}: not found in body text`);
              result.checks.push({ description: check.description, status: 'FAIL' });
              result.status = 'FAIL';
            }
          } else if (check.type === 'pageLoad') {
            // Already validated by successful navigation
            console.log(`   ✓ ${check.description}`);
            result.checks.push({ description: check.description, status: 'PASS' });
          }
        } catch (checkError) {
          console.log(`   ✗ ${check.description}: ${checkError.message}`);
          result.checks.push({ description: check.description, status: 'FAIL', error: checkError.message });
          result.status = 'FAIL';
        }
      }

      // Take screenshot
      await page.screenshot({
        path: `${SCREENSHOT_DIR}/${result.screenshot}`,
        fullPage: true
      });
      console.log(`   📸 Screenshot saved: ${result.screenshot}`);

    } catch (error) {
      console.log(`   ✗ Error: ${error.message}`);
      result.status = 'FAIL';
      result.errors.push(error.message);

      // Try to take screenshot anyway
      try {
        await page.screenshot({
          path: `${SCREENSHOT_DIR}/${result.screenshot}`,
          fullPage: true
        });
        console.log(`   📸 Error screenshot saved: ${result.screenshot}`);
      } catch (screenshotError) {
        console.log(`   ✗ Screenshot failed: ${screenshotError.message}`);
      }
    }

    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`Total pages tested: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (consoleErrors.length > 0) {
    console.log(`\n⚠️  Console errors detected: ${consoleErrors.length}`);
  }

  console.log('\nPer-page results:');
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    console.log(`  ${icon} ${r.name}: ${r.status}`);
  });

  // Write detailed results to JSON
  const detailedResults = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport: { width: 390, height: 844 },
    summary: { total: results.length, passed, failed },
    consoleErrors: consoleErrors.filter((e, i, arr) =>
      arr.findIndex(e2 => e2.message === e.message && e2.page === e.page) === i
    ),
    results
  };

  writeFileSync(
    `${SCREENSHOT_DIR}/test-results.json`,
    JSON.stringify(detailedResults, null, 2)
  );

  console.log(`\n📄 Detailed results: ${SCREENSHOT_DIR}/test-results.json`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
