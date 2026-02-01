import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORTS = {
  standard: { width: 390, height: 844, name: '390x844' },
  fullhd: { width: 1080, height: 1920, name: '1080x1920' }
};

const PAGES = [
  { name: 'gallery', url: 'https://llm.sutyrin.pro/mobile/gallery' },
  { name: 'au1', url: 'https://llm.sutyrin.pro/mobile/au1' },
  { name: 'compose', url: 'https://llm.sutyrin.pro/mobile/compose' },
  { name: 'backup', url: 'https://llm.sutyrin.pro/mobile/backup' }
];

const OUTPUT_DIR = '.planning/quick/022-debug-mobile-fullhd';
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

// Create output directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function extractMediaQueries(page) {
  return await page.evaluate(() => {
    const queries = new Set();

    // Extract from <style> tags
    document.querySelectorAll('style').forEach(style => {
      const text = style.textContent;
      const mediaMatches = text.match(/@media[^{]*\{[^}]*\}/g) || [];
      mediaMatches.forEach(m => {
        const cleanMatch = m.substring(0, 100) + (m.length > 100 ? '...' : '');
        queries.add(cleanMatch);
      });
    });

    // Extract from <link> tags (note: can't read external stylesheets due to CORS)
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href) {
        queries.add(`External: ${link.href}`);
      }
    });

    return Array.from(queries);
  });
}

async function inspectButtons(page) {
  return await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    const result = [];

    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const computed = window.getComputedStyle(btn);
      const parent = btn.parentElement;
      const parentComputed = parent ? window.getComputedStyle(parent) : null;

      result.push({
        text: btn.textContent.trim().substring(0, 50),
        visible: computed.display !== 'none' && computed.visibility !== 'hidden',
        position: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        css: {
          display: computed.display,
          position: computed.position,
          visibility: computed.visibility,
          width: computed.width,
          height: computed.height,
          overflow: computed.overflow
        },
        parent_css: parentComputed ? {
          display: parentComputed.display,
          overflow: parentComputed.overflow,
          width: parentComputed.width,
          maxWidth: parentComputed.maxWidth
        } : null,
        offscreen: rect.x < 0 || rect.y < 0 || rect.x > window.innerWidth || rect.y > window.innerHeight
      });
    });

    return result;
  });
}

async function inspectContainers(page) {
  return await page.evaluate(() => {
    const selectors = ['body', 'main', '[role="main"]', '.container', '.gallery', '.compose-panel', '.content'];
    const result = [];

    selectors.forEach(selector => {
      const elem = document.querySelector(selector);
      if (!elem) return;

      const computed = window.getComputedStyle(elem);
      const rect = elem.getBoundingClientRect();

      result.push({
        selector,
        found: true,
        dimensions: {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          offsetWidth: elem.offsetWidth,
          offsetHeight: elem.offsetHeight
        },
        css: {
          display: computed.display,
          width: computed.width,
          maxWidth: computed.maxWidth,
          overflow: computed.overflow,
          padding: computed.padding,
          margin: computed.margin
        }
      });
    });

    return result;
  });
}

async function testPageViewport(page, pageName, pageUrl, viewport) {
  console.log(`  Viewport: ${viewport.name}`);

  await page.setViewportSize(viewport);
  await page.goto(pageUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for JS to render

  const screenshotName = `${pageName}-${viewport.name}.png`;
  const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName);

  // Take full-page screenshot
  await page.screenshot({
    path: screenshotPath,
    fullPage: true
  });
  console.log(`    Screenshot saved: ${screenshotName}`);

  // Inspect DOM
  const buttons = await inspectButtons(page);
  const containers = await inspectContainers(page);
  const mediaQueries = await extractMediaQueries(page);

  // Identify issues
  const issues = [];
  const visibleButtonCount = buttons.filter(b => b.visible && !b.offscreen).length;
  const offscreenButtons = buttons.filter(b => b.offscreen).length;
  const hiddenButtons = buttons.filter(b => !b.visible).length;

  if (offscreenButtons > 0) {
    issues.push(`${offscreenButtons} button(s) positioned off-screen`);
  }
  if (hiddenButtons > 0) {
    issues.push(`${hiddenButtons} button(s) hidden (display:none or visibility:hidden)`);
  }

  // Check for fixed dimensions on containers
  containers.forEach(cont => {
    if (cont.css.width && cont.css.width.endsWith('px')) {
      const widthValue = parseInt(cont.css.width);
      if (widthValue < viewport.width * 0.8) {
        issues.push(`${cont.selector} has fixed width ${cont.css.width} (viewport is ${viewport.width}px)`);
      }
    }
  });

  return {
    viewport,
    buttons,
    containers,
    mediaQueries,
    visibleButtonCount,
    offscreenButtons,
    hiddenButtons,
    issues
  };
}

async function testPage(browser, pageName, pageUrl) {
  console.log(`\nTesting page: ${pageName} (${pageUrl})`);

  const pageData = {
    name: pageName,
    url: pageUrl,
    viewports: {}
  };

  const page = await browser.newPage();

  try {
    for (const [viewportKey, viewport] of Object.entries(VIEWPORTS)) {
      const result = await testPageViewport(page, pageName, pageUrl, viewport);
      pageData.viewports[viewportKey] = result;
    }
  } finally {
    await page.close();
  }

  return pageData;
}

async function main() {
  const browser = await chromium.launch();
  const allResults = [];

  console.log('Starting mobile layout debug...');

  for (const page of PAGES) {
    try {
      const result = await testPage(browser, page.name, page.url);
      allResults.push(result);
    } catch (error) {
      console.error(`Error testing ${page.name}:`, error.message);
    }
  }

  // Save comprehensive CSS analysis
  const analysisPath = path.join(OUTPUT_DIR, 'css-analysis.json');
  fs.writeFileSync(analysisPath, JSON.stringify(allResults, null, 2));
  console.log(`\nCSS analysis saved to: ${analysisPath}`);

  // Print summary
  console.log('\n=== SUMMARY ===\n');

  allResults.forEach(pageData => {
    console.log(`Page: ${pageData.name}`);
    console.log(`URL: ${pageData.url}`);

    const standard = pageData.viewports.standard;
    const fullhd = pageData.viewports.fullhd;

    if (standard) {
      console.log(`  Standard (390x844):`);
      console.log(`    Visible buttons: ${standard.visibleButtonCount}`);
      console.log(`    Off-screen: ${standard.offscreenButtons}, Hidden: ${standard.hiddenButtons}`);
      if (standard.issues.length > 0) {
        standard.issues.forEach(issue => console.log(`    Issue: ${issue}`));
      }
    }

    if (fullhd) {
      console.log(`  FullHD (1080x1920):`);
      console.log(`    Visible buttons: ${fullhd.visibleButtonCount}`);
      console.log(`    Off-screen: ${fullhd.offscreenButtons}, Hidden: ${fullhd.hiddenButtons}`);
      if (fullhd.issues.length > 0) {
        fullhd.issues.forEach(issue => console.log(`    Issue: ${issue}`));
      }
    }

    console.log('');
  });

  await browser.close();
  console.log('Debug complete!');
}

main().catch(console.error);
