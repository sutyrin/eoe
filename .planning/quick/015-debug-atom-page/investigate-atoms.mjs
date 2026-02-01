#!/usr/bin/env node
/**
 * Quick Task 015: Investigate Atom Page Display Issues
 *
 * This script tests three key scenarios:
 * 1. Desktop atom canvas view (/atom/2026-01-30-au1)
 * 2. Mobile detail view (/mobile/au1) - reported issue URL
 * 3. Mobile gallery view (/mobile/gallery)
 *
 * Captures: DOM state, console errors, screenshots, element presence
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const SCREENSHOT_DIR = '/home/pavel/dev/play/eoe/.planning/quick/015-debug-atom-page/screenshots';
const OUTPUT_FILE = '/home/pavel/dev/play/eoe/.planning/quick/015-debug-atom-page/investigate-results.json';
const BASE_URL = 'https://llm.sutyrin.pro';

// Create screenshot directory
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const scenarios = [
  {
    name: 'Desktop Atom Canvas View',
    url: `${BASE_URL}/atom/2026-01-30-au1`,
    viewport: { width: 1280, height: 800 },
    description: 'Desktop view of au1 atom (should show canvas + GUI)',
    checks: [
      { selector: 'canvas', expected: true, description: 'Canvas element should exist' },
      { selector: 'button:has-text("play")', expected: true, description: 'Play button should exist (case-insensitive)' },
      { selector: 'a[href*="/mobile"]', expected: false, description: 'Mobile gallery link should NOT be visible' },
      { selector: 'li.atom-item', expected: false, description: 'Gallery items should NOT appear' },
    ]
  },
  {
    name: 'Mobile Detail View (Reported Issue)',
    url: `${BASE_URL}/mobile/au1`,
    viewport: { width: 390, height: 844 },
    description: 'Mobile detail view of au1 atom (user reported issue)',
    checks: [
      { selector: 'header', expected: true, description: 'Header should exist' },
      { selector: 'button[aria-label*="back"]', expected: true, description: 'Back button should exist' },
      { selector: '[role="tablist"]', expected: true, description: 'Tab navigation should exist' },
      { selector: 'canvas', expected: false, description: 'Canvas should NOT appear in detail view' },
      { selector: 'li.atom-item', expected: false, description: 'Gallery list should NOT appear' },
      { selector: '.gallery-container', expected: false, description: 'Gallery container should NOT appear' },
    ]
  },
  {
    name: 'Mobile Gallery View',
    url: `${BASE_URL}/mobile/gallery`,
    viewport: { width: 390, height: 844 },
    description: 'Mobile gallery list (reference view)',
    checks: [
      { selector: 'input[type="search"]', expected: true, description: 'Search input should exist' },
      { selector: 'li.atom-item', expected: true, description: 'Gallery items should appear' },
      { selector: '[role="tablist"]', expected: false, description: 'Tab navigation should NOT appear (this is list view)' },
    ]
  }
];

async function investigateScenario(browser, scenario) {
  console.log(`\n📋 Testing: ${scenario.name}`);
  console.log(`   URL: ${scenario.url}`);
  console.log(`   Viewport: ${scenario.viewport.width}x${scenario.viewport.height}`);

  const context = await browser.newContext({
    viewport: scenario.viewport,
    extraHTTPHeaders: {
      'User-Agent': 'Mozilla/5.0 (Mobile; Chrome)'
    }
  });

  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];
  let responseErrors = false;

  // Capture console messages and errors
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      args: msg.args().length
    });
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  // Capture page errors (uncaught exceptions, module errors)
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
    if (error.stack) errors.push(`Stack: ${error.stack}`);
  });

  // Capture failed responses
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
      responseErrors = true;
    }
  });

  try {
    // Navigate and wait for page load
    console.log('   ⏳ Navigating...');
    const response = await page.goto(scenario.url, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log(`   ✓ Loaded (${response?.status() || 'unknown'} status)`);

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(2000);

    // Run checks
    const results = {
      scenario: scenario.name,
      url: scenario.url,
      viewport: scenario.viewport,
      pageTitle: await page.title(),
      pageUrl: page.url(),
      errors,
      consoleMessages,
      responseErrors,
      checks: []
    };

    console.log('   🔍 Checking elements...');
    for (const check of scenario.checks) {
      try {
        const element = await page.$(check.selector);
        const found = element !== null;
        const passed = found === check.expected;

        results.checks.push({
          selector: check.selector,
          description: check.description,
          expected: check.expected,
          found,
          passed
        });

        console.log(`     ${passed ? '✓' : '✗'} ${check.description}`);
        if (!passed) {
          console.log(`        Expected: ${check.expected}, Found: ${found}`);
        }
      } catch (e) {
        console.log(`     ⚠ Failed to check: ${check.selector}`);
        results.checks.push({
          selector: check.selector,
          description: check.description,
          error: e.message
        });
      }
    }

    // Take screenshot
    const screenshotFile = `${SCREENSHOT_DIR}/${scenario.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await page.screenshot({ path: screenshotFile, fullPage: true });
    results.screenshot = screenshotFile;
    console.log(`   📸 Screenshot: ${screenshotFile}`);

    // Capture full DOM structure (head + first 100 lines of body)
    const bodyHtml = await page.evaluate(() => {
      const head = document.head.outerHTML;
      const bodyChild = document.body.outerHTML;
      return {
        title: document.title,
        url: window.location.href,
        head: head.substring(0, 2000) + '...',
        bodyPreview: bodyChild.substring(0, 3000) + '...',
        bodyLength: bodyChild.length
      };
    });
    results.dom = bodyHtml;

    // Check for specific interactive elements
    const interactives = await page.evaluate(() => ({
      canvasCount: document.querySelectorAll('canvas').length,
      buttonCount: document.querySelectorAll('button').length,
      tabCount: document.querySelectorAll('[role="tab"]').length,
      formInputs: document.querySelectorAll('input').length,
      videoElements: document.querySelectorAll('video').length,
      audioElements: document.querySelectorAll('audio').length,
      iframes: document.querySelectorAll('iframe').length,
    }));
    results.interactiveElements = interactives;
    console.log(`   📊 Element counts: ${JSON.stringify(interactives)}`);

    await context.close();
    return results;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    errors.push(`Navigation Error: ${error.message}`);

    const results = {
      scenario: scenario.name,
      url: scenario.url,
      viewport: scenario.viewport,
      error: error.message,
      errors,
      consoleMessages,
      responseErrors
    };

    await context.close();
    return results;
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('Quick Task 015: Investigate Atom Page Display Issues');
  console.log('='.repeat(70));
  console.log(`\nStarted: ${new Date().toISOString()}`);
  console.log(`Base URL: ${BASE_URL}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const results = [];

  // Test each scenario
  for (const scenario of scenarios) {
    const result = await investigateScenario(browser, scenario);
    results.push(result);
  }

  await browser.close();

  // Write results to file
  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n✅ Investigation complete. Results: ${OUTPUT_FILE}`);
  console.log(`📸 Screenshots in: ${SCREENSHOT_DIR}\n`);

  // Print summary
  console.log('='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));

  for (const result of results) {
    console.log(`\n${result.scenario}:`);
    console.log(`  Title: ${result.pageTitle || result.dom?.title || '(unknown)'}`);
    console.log(`  URL: ${result.pageUrl || result.url}`);

    if (result.error) {
      console.log(`  ❌ Navigation Error: ${result.error}`);
    } else {
      const passedChecks = result.checks.filter(c => c.passed).length;
      const totalChecks = result.checks.length;
      console.log(`  ✓ Checks: ${passedChecks}/${totalChecks} passed`);

      if (result.errors?.length > 0) {
        console.log(`  ❌ Errors encountered:`);
        result.errors.slice(0, 3).forEach(e => console.log(`     - ${e}`));
        if (result.errors.length > 3) console.log(`     ... and ${result.errors.length - 3} more`);
      }

      console.log(`  📊 Elements: ${result.interactiveElements?.canvasCount || 0} canvas, ${result.interactiveElements?.buttonCount || 0} buttons, ${result.interactiveElements?.tabCount || 0} tabs`);
    }
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
