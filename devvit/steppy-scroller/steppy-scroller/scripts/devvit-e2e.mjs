import { chromium, devices } from 'playwright';
import path from 'node:path';
import fs from 'node:fs/promises';
import { authFile, resolvePostUrl } from './devvit-config.mjs';

const postUrl = resolvePostUrl();
const outDir = path.resolve('test-results', 'devvit');
const headless = process.env.HEADLESS === '1';
const openDevtools = process.env.DEVTOOLS === '1';
const useMobile = process.env.PW_MOBILE !== '0';
const deviceName = process.env.PW_DEVICE ?? 'iPhone 13';

if (!postUrl) {
  console.error(
    'Set DEVVIT_POST_URL (or REDDIT_POST_URL) to the Reddit post URL with the Devvit app.'
  );
  process.exit(1);
}

try {
  await fs.access(authFile);
} catch (err) {
  console.error(
    'Missing auth file. Run `npm run pw:login` first to create playwright/.auth/reddit.json.'
  );
  process.exit(1);
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless,
  devtools: openDevtools,
  args: ['--disable-blink-features=AutomationControlled'],
});

const device = devices[deviceName];
if (useMobile && !device) {
  console.error(`Unknown Playwright device: ${deviceName}`);
  process.exit(1);
}

const context = await browser.newContext({
  storageState: authFile,
  ...(useMobile && device
    ? device
    : {
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      }),
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
});

await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
});

const page = await context.newPage();
await page.goto(postUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

const getPostRect = async () => {
  return page.evaluate(() => {
    const el = document.querySelector('shreddit-post');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
};

const getPostClip = async () => {
  const rect = await getPostRect();
  if (!rect) return null;
  const viewport = page.viewportSize();
  if (!viewport) return null;
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const width = Math.max(0, Math.min(rect.w, viewport.width - x));
  const height = Math.max(0, Math.min(rect.h, viewport.height - y));
  if (!width || !height) return null;
  return { x, y, width, height };
};

const screenshot = async (label) => {
  const outPath = path.join(outDir, `steppy-${label}-${Date.now()}.png`);
  const clip = await getPostClip();
  if (clip) {
    await page.screenshot({ path: outPath, clip });
  } else {
    await page.screenshot({ path: outPath, fullPage: false });
  }
  console.log('screenshot', outPath);
};

const countShadowIframes = async () => {
  return page.evaluate(() => {
    const collect = (root) => {
      const results = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let node = walker.nextNode();
      while (node) {
        const el = node;
        if (el.tagName === 'IFRAME') {
          results.push({ src: el.getAttribute('src') || '' });
        }
        if (el.shadowRoot) {
          results.push(...collect(el.shadowRoot));
        }
        node = walker.nextNode();
      }
      return results;
    };
    return collect(document);
  });
};

const waitForAppFrame = async (timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const frames = await countShadowIframes();
    if (frames.length > 0) {
      return frames;
    }
    await page.waitForTimeout(500);
  }
  return [];
};

const waitForFrameByUrl = async (urlPart, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const framesList = page.frames();
    const target = framesList.find((frame) => frame.url().includes(urlPart));
    if (target) {
      return target;
    }
    await page.waitForTimeout(500);
  }
  return null;
};

const clickCandidates = (rect) => [
  { name: 'center', x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.52 },
  { name: 'lower-center', x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.62 },
  { name: 'lower-left', x: rect.x + rect.w * 0.4, y: rect.y + rect.h * 0.62 },
  { name: 'lower-right', x: rect.x + rect.w * 0.6, y: rect.y + rect.h * 0.62 },
  { name: 'upper-center', x: rect.x + rect.w * 0.5, y: rect.y + rect.h * 0.45 },
];

await screenshot('before');

const rect = await getPostRect();
if (!rect) {
  console.error('Could not find shredder-post bounding box.');
  await screenshot('no-post');
  await context.close();
  await browser.close();
  process.exit(1);
}

let frames = [];
for (const point of clickCandidates(rect)) {
  console.log('click', point.name, point.x, point.y);
  await page.mouse.click(point.x, point.y);
  frames = await waitForAppFrame(4000);
  await screenshot(`after-${point.name}`);
  if (frames.length > 0) {
    break;
  }
}

console.log('frames', frames);

const playInFrame = async () => {
  const framesList = page.frames();
  const splashFrame = framesList.find((frame) => frame.url().includes('/splash.html'));
  if (!splashFrame) {
    console.log('splash frame not found in page.frames()');
    return;
  }
  await splashFrame.waitForLoadState('domcontentloaded');
  const start = splashFrame.getByRole('button', { name: /^start$/i });
  if (await start.count()) {
    await start.first().click();
    await page.waitForTimeout(5000);
    await screenshot('after-start');
  } else {
    console.log('start button not found inside splash frame');
  }
};

const clickArrowButtons = async () => {
  const gameFrame = await waitForFrameByUrl('/game.html', 10000);
  if (!gameFrame) {
    console.log('game frame not found after start');
    return;
  }
  await gameFrame.waitForLoadState('domcontentloaded');
  const buttons = gameFrame.locator('#controls button');
  await buttons.first().waitFor({ timeout: 15000 });
  const count = await buttons.count();
  const limit = Math.min(count, 3);

  for (let i = 0; i < limit; i += 1) {
    const button = buttons.nth(i);
    const label = (await button.textContent())?.trim() || `button-${i}`;
    const isDisabled = await button.isDisabled();
    console.log('button', label, isDisabled ? 'disabled' : 'enabled');
    if (!isDisabled) {
      await button.click({ force: true });
      await page.waitForTimeout(800);
      await screenshot(`after-${encodeURIComponent(label)}`);
    }
  }
};

if (frames.length > 0) {
  await playInFrame();
  await clickArrowButtons();
}

if (headless) {
  await context.close();
  await browser.close();
} else {
  console.log('Leave the browser open for manual inspection; close it to finish.');
  await new Promise(() => {});
}
