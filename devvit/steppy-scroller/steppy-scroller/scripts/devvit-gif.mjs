import { chromium, devices } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { authFile, resolvePostUrl } from './devvit-config.mjs';

const postUrl = resolvePostUrl();
const headless = process.env.HEADLESS === '1';
const openDevtools = process.env.DEVTOOLS === '1';
const useMobile = process.env.PW_MOBILE !== '0';
const deviceName = process.env.PW_DEVICE ?? 'iPhone 13';
const steps = Number(process.env.GIF_STEPS ?? '20');
const fps = Number(process.env.GIF_FPS ?? '8');
const width = Number(process.env.GIF_WIDTH ?? '600');
const outDir = path.resolve('test-results', 'devvit', 'gif');

if (!postUrl) {
  console.error(
    'Set DEVVIT_POST_URL (or REDDIT_POST_URL) to the Reddit post URL with the Devvit app.'
  );
  process.exit(1);
}

if (!fs.existsSync(authFile)) {
  console.error(
    'Missing auth file. Run `npm run pw:login` first to create playwright/.auth/reddit.json.'
  );
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

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

const rect = await getPostRect();
if (!rect) {
  console.error('Could not find shredder-post bounding box.');
  await context.close();
  await browser.close();
  process.exit(1);
}

let frames = [];
for (const point of clickCandidates(rect)) {
  await page.mouse.click(point.x, point.y);
  frames = await waitForAppFrame(4000);
  if (frames.length > 0) {
    break;
  }
}

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
  } else {
    console.log('start button not found inside splash frame');
  }
};

if (frames.length > 0) {
  await playInFrame();
}

const gameFrame = await waitForFrameByUrl('/game.html', 10000);
if (!gameFrame) {
  console.log('game frame not found after start');
  await context.close();
  await browser.close();
  process.exit(1);
}
await gameFrame.waitForLoadState('domcontentloaded');
const controls = gameFrame.locator('#controls');
await controls.waitFor({ timeout: 10000 });

await gameFrame.addStyleTag({
  content: `
    .action.simulated-active {
      background-color: #4a8c5f !important;
      transform: translateY(6px) !important;
      box-shadow: 0 6px 0 #203b26 !important;
      color: white;
    }
  `,
});

const timestamp = Date.now();
const postId = (() => {
  try {
    const parts = new URL(postUrl).pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('comments');
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : 'post';
  } catch {
    return 'post';
  }
})();
const framesDir = path.resolve(outDir, `frames-${postId}-${timestamp}`);
const gifPath = path.resolve(outDir, `gameplay-${postId}-${timestamp}.gif`);

if (fs.existsSync(framesDir)) {
  fs.rmSync(framesDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

let frameCount = 0;
const takeScreenshot = async () => {
  const framePath = path.join(framesDir, `frame-${String(frameCount).padStart(3, '0')}.png`);
  const target = gameFrame.locator('#game-root');
  await target.waitFor({ timeout: 10000 });
  await target.screenshot({ path: framePath });
  frameCount++;
};

const getState = () => gameFrame.evaluate(() => window.__MCP__?.getState());

await takeScreenshot();

for (let i = 0; i < steps; i++) {
  let climbed = false;
  let attempts = 0;
  let actionToClick = '';

  while (!climbed && attempts < 5) {
    const state = await getState();
    const actions = state?.actions ?? [];
    const optimal = state?.evaluation?.optimalChoice;

    if (optimal && actions.find((a) => a.id === optimal && a.enabled)) {
      actionToClick = optimal;
    } else {
      const up = actions.find((a) => a.id === 'step-up');
      const right = actions.find((a) => a.id === 'step-right');
      const left = actions.find((a) => a.id === 'step-left');

      if (up?.enabled) {
        actionToClick = 'step-up';
      } else if (right?.enabled) {
        actionToClick = 'step-right';
      } else if (left?.enabled) {
        actionToClick = 'step-left';
      }
    }

    if (actionToClick) {
      const labelMap = {
        'step-up': '↑',
        'step-left': '←',
        'step-right': '→',
      };
      const label = labelMap[actionToClick];
      const button = gameFrame.getByRole('button', { name: label });
      const count = await button.count();
      if (!count) {
        await page.waitForTimeout(100);
        attempts++;
        continue;
      }

      await button.evaluate((el) => el.classList.add('simulated-active'));
      await takeScreenshot();

      await button.click();
      await page.waitForTimeout(100);

      await takeScreenshot();
      await button.evaluate((el) => el.classList.remove('simulated-active'));

      climbed = true;
    } else {
      await page.waitForTimeout(100);
    }
    attempts++;
  }
}

console.log(`Captured ${frameCount} frames. Generating GIF...`);

try {
  const palettePath = path.join(framesDir, 'palette.png');
  execSync(
    `ffmpeg -y -i "${path.join(
      framesDir,
      'frame-%03d.png'
    )}" -vf "fps=${fps},scale=${width}:-1:flags=lanczos,palettegen" "${palettePath}"`,
    { stdio: 'inherit' }
  );
  execSync(
    `ffmpeg -y -framerate ${fps} -i "${path.join(
      framesDir,
      'frame-%03d.png'
    )}" -i "${palettePath}" -lavfi "fps=${fps},scale=${width}:-1:flags=lanczos [x]; [x][1:v] paletteuse" "${gifPath}"`,
    { stdio: 'inherit' }
  );
  console.log(`GIF saved to: ${gifPath}`);
} catch (error) {
  console.error('Failed to generate GIF with ffmpeg', error);
} finally {
  fs.rmSync(framesDir, { recursive: true, force: true });
}

if (headless) {
  await context.close();
  await browser.close();
} else {
  console.log('Leave the browser open for manual inspection; close it to finish.');
  await new Promise(() => {});
}
