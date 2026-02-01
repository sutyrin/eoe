#!/usr/bin/env node

import { chromium } from 'playwright';
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const results = {
  timestamp: new Date().toISOString(),
  pageState: {
    pageTitle: '',
    pageHeading: '',
    pageText: '',
    pageShowsGallery: false,
  },
  iframe: {
    iframeUrl: '',
    iframeAccessible: false,
    iframeHasCanvas: false,
    iframeHasPlayBtn: false,
    iframeHasGallery: false,
    iframeInnerHTML: '',
  },
  console: {
    errors: [],
    warnings: [],
    logs: [],
  },
  network: {
    requests: [],
  },
  filesystem: {
    hasIndexHtml: false,
    hasBundledFiles: false,
    files: [],
    comparisonToAu1: '',
  },
};

async function checkFilesystem() {
  const atomDir = '/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-av-sync-debug';
  const au1Dir = '/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-au1';

  try {
    const avFiles = await fs.readdir(atomDir);
    const au1Files = await fs.readdir(au1Dir);

    results.filesystem.files = avFiles.sort();
    results.filesystem.hasIndexHtml = avFiles.includes('index.html');
    results.filesystem.hasBundledFiles = avFiles.some(f => f.endsWith('.bundle.js'));

    results.filesystem.comparisonToAu1 = `
av-sync-debug: ${avFiles.sort().join(', ')}
au1: ${au1Files.sort().join(', ')}

Difference: av-sync-debug is missing index.html and .bundle.js files that au1 has.
`.trim();
  } catch (err) {
    results.filesystem.files = [`ERROR: ${err.message}`];
  }
}

async function runPlaywright() {
  const browser = await chromium.launch();

  // Setup console listener
  const consoleLogs = [];

  const page = await browser.newPage();

  page.on('console', (msg) => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
    });

    if (msg.type() === 'error') {
      results.console.errors.push({
        message: msg.text(),
        source: msg.location(),
      });
    } else if (msg.type() === 'warning') {
      results.console.warnings.push({
        message: msg.text(),
        source: msg.location(),
      });
    } else if (msg.type() === 'log') {
      results.console.logs.push({
        message: msg.text(),
        source: msg.location(),
      });
    }
  });

  // Capture network requests
  page.on('request', (request) => {
    if (!request.url().includes('analytics') && !request.url().includes('tracker')) {
      results.network.requests.push({
        url: request.url(),
        method: request.method(),
      });
    }
  });

  try {
    console.log('Navigating to https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/');
    await page.goto('https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/', {
      waitUntil: 'networkidle',
      timeout: 10000,
    });

    // Wait for JS to execute
    await page.waitForTimeout(3000);

    // Get page title and headings
    results.pageState.pageTitle = await page.title();
    console.log(`Page title: ${results.pageState.pageTitle}`);

    // Try to get h1/h2 text
    const heading = await page.locator('h1, h2').first().textContent().catch(() => '');
    results.pageState.pageHeading = heading || '';
    console.log(`Page heading: ${heading}`);

    // Get page text to determine if it's showing gallery or canvas
    const pageBody = await page.locator('body').textContent().catch(() => '');
    results.pageState.pageText = pageBody ? pageBody.substring(0, 500) : '';

    // Check for gallery indicators
    const hasGalleryContainer = await page.locator('[class*="gallery"]').count().then(c => c > 0).catch(() => false);
    const hasAtomList = await page.locator('[class*="atom-list"]').count().then(c => c > 0).catch(() => false);
    const hasSearchBar = await page.locator('input[type="search"], input[placeholder*="search"]').count().then(c => c > 0).catch(() => false);

    results.pageState.pageShowsGallery = hasGalleryContainer || hasAtomList || hasSearchBar;
    console.log(`Page shows gallery indicators: ${results.pageState.pageShowsGallery}`);

    // Find iframe
    const iframes = await page.locator('iframe').count();
    console.log(`Found ${iframes} iframe(s)`);

    if (iframes > 0) {
      const iframeElement = page.locator('iframe').first();
      results.iframe.iframeUrl = await iframeElement.getAttribute('src').catch(() => 'UNKNOWN');
      console.log(`Iframe src: ${results.iframe.iframeUrl}`);

      // Try to access iframe content
      try {
        const frameHandle = await iframeElement.frameLocator(':scope');
        const frame = page.frameLocator('iframe').first();

        // Try to find canvas in iframe
        const hasCanvas = await frame.locator('canvas').count().then(c => c > 0).catch(() => false);
        results.iframe.iframeHasCanvas = hasCanvas;
        console.log(`Iframe has canvas: ${hasCanvas}`);

        // Try to find play button
        const hasPlayBtn = await frame.locator('button:has-text("play"), button:has-text("Play"), [class*="play"]').count().then(c => c > 0).catch(() => false);
        results.iframe.iframeHasPlayBtn = hasPlayBtn;
        console.log(`Iframe has play button: ${hasPlayBtn}`);

        // Check for gallery indicators in iframe
        const hasGallery = await frame.locator('[class*="gallery"]').count().then(c => c > 0).catch(() => false);
        results.iframe.iframeHasGallery = hasGallery;
        console.log(`Iframe shows gallery: ${hasGallery}`);

        // Get iframe innerHTML (first 1000 chars)
        const iframeInner = await frame.locator('body').innerHTML().catch(() => 'NOT ACCESSIBLE');
        results.iframe.iframeInnerHTML = iframeInner.substring(0, 1000);
        results.iframe.iframeAccessible = iframeInner !== 'NOT ACCESSIBLE';
      } catch (err) {
        results.iframe.iframeAccessible = false;
        results.iframe.iframeInnerHTML = `ERROR accessing iframe: ${err.message}`;
      }
    }

    // Take screenshot of main page
    await page.screenshot({ path: `${__dirname}/screenshots/main-page.png`, fullPage: true });
    console.log('Saved main-page.png');

    // Try to take iframe screenshot if accessible
    try {
      const iframeElement = page.locator('iframe').first();
      const boundingBox = await iframeElement.boundingBox();
      if (boundingBox) {
        await page.screenshot({
          path: `${__dirname}/screenshots/main-page-with-viewport.png`,
          fullPage: false,
        });
        console.log('Saved main-page-with-viewport.png');
      }
    } catch (err) {
      console.log('Could not take iframe screenshot:', err.message);
    }
  } catch (err) {
    console.error('Playwright error:', err.message);
    results.console.errors.push({
      message: `Playwright execution error: ${err.message}`,
      source: 'script',
    });
  }

  await browser.close();
}

async function main() {
  console.log('=== av-sync-debug Page Debug Script ===\n');

  // Check filesystem first
  console.log('Step 1: Checking filesystem...');
  await checkFilesystem();
  console.log(`  av-sync-debug has index.html: ${results.filesystem.hasIndexHtml}`);
  console.log(`  av-sync-debug has bundled files: ${results.filesystem.hasBundledFiles}`);

  // Run Playwright
  console.log('\nStep 2: Running Playwright browser automation...');
  await runPlaywright();

  // Write results
  console.log('\nStep 3: Writing debug results...');
  await fs.writeFile(
    `${__dirname}/debug-results.json`,
    JSON.stringify(results, null, 2)
  );
  console.log(`Saved debug-results.json`);

  console.log('\n=== Debug Complete ===');
  console.log(`\nKey findings:`);
  console.log(`  Page title: ${results.pageState.pageTitle}`);
  console.log(`  Page shows gallery: ${results.pageState.pageShowsGallery}`);
  console.log(`  Iframe URL: ${results.iframe.iframeUrl}`);
  console.log(`  Iframe accessible: ${results.iframe.iframeAccessible}`);
  console.log(`  av-sync-debug has index.html: ${results.filesystem.hasIndexHtml}`);
  console.log(`  av-sync-debug has bundled files: ${results.filesystem.hasBundledFiles}`);
  console.log(`  Console errors: ${results.console.errors.length}`);
}

main().catch(console.error);
