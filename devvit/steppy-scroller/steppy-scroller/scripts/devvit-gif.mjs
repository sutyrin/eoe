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

let splashFrame = null;
for (const point of clickCandidates(rect)) {
  await page.mouse.click(point.x, point.y);
  splashFrame = await waitForFrameByUrl('/splash.html', 6000);
  if (splashFrame) {
    break;
  }
}

const playInFrame = async (target) => {
  const splash = target ?? page.frames().find((frame) => frame.url().includes('/splash.html'));
  if (!splash) {
    console.log('splash frame not found in page.frames()');
    return;
  }
  await splash.waitForLoadState('domcontentloaded');
  const start = splash.getByRole('button', { name: /^start$/i });
  if (await start.count()) {
    await start.first().click();
    await page.waitForTimeout(5000);
  } else {
    console.log('start button not found inside splash frame');
  }
};

if (splashFrame) {
  await playInFrame(splashFrame);
}

const gameFrame = await waitForFrameByUrl('/game.html', 10000);
if (!gameFrame) {
  console.log('game frame not found after start');
  await context.close();
  await browser.close();
  process.exit(1);
}
await gameFrame.waitForLoadState('domcontentloaded');
await gameFrame.waitForTimeout(2000);
await gameFrame.locator('#game-root canvas').waitFor({ timeout: 20000 });
await gameFrame.locator('#controls button').first().waitFor({ timeout: 20000 });
try {
  const debug = await gameFrame.evaluate(() => ({
    title: document.title,
    bodyChildren: document.body?.children?.length ?? 0,
    hasMcp: Boolean((window).__MCP__?.getState),
    hasGame: Boolean((window).__GAME__),
    buttons: Array.from(document.querySelectorAll('button'))
      .map((btn) => btn.textContent?.trim())
      .filter(Boolean),
  }));
  console.log('Game frame debug:', debug);
} catch (error) {
  console.log('Game frame debug failed:', error);
}
try {
  await gameFrame.waitForFunction(
    () => document.querySelectorAll('button').length > 0,
    { timeout: 20000 }
  );
} catch {
  // Buttons may appear after state init; continue and retry clicks later.
}

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
  const clip = await getPostClip();
  if (clip) {
    await page.screenshot({ path: framePath, clip });
  } else {
    await page.screenshot({ path: framePath, fullPage: false });
  }
  frameCount++;
};

const getState = () => gameFrame.evaluate(() => window.__MCP__?.getState());
const act = (actionId) =>
  gameFrame.evaluate((id) => (window).__MCP__?.act?.(id), actionId);
const getButtonLabels = () =>
  gameFrame.evaluate(() =>
    Array.from(document.querySelectorAll('#controls button'))
      .map((btn) => btn.textContent?.trim())
      .filter(Boolean)
  );

const clickAnyButton = async () => {
  const button = gameFrame.locator('#controls button').first();
  const count = await button.count();
  if (!count) return false;

  try {
    await button.evaluate((el) => el.classList.add('simulated-active'), { timeout: 2000 });
  } catch {
    // ignore highlight failures
  }
  await takeScreenshot();

  try {
    await button.click({ timeout: 5000, force: true });
  } catch {
    return false;
  }
  await page.waitForTimeout(100);

  await takeScreenshot();
  try {
    await button.evaluate((el) => el.classList.remove('simulated-active'), { timeout: 2000 });
  } catch {
    // ignore cleanup failures
  }
  return true;
};

const clickByLabel = async (label) => {
  const button = gameFrame.locator('#controls button', { hasText: label }).first();
  const count = await button.count();
  if (!count) return false;

  try {
    await button.evaluate((el) => el.classList.add('simulated-active'), { timeout: 2000 });
  } catch {
    // ignore highlight failures
  }
  await takeScreenshot();

  try {
    await button.click({ timeout: 5000, force: true });
  } catch {
    return false;
  }
  await page.waitForTimeout(100);

  await takeScreenshot();
  try {
    await button.evaluate((el) => el.classList.remove('simulated-active'), { timeout: 2000 });
  } catch {
    // ignore cleanup failures
  }
  return true;
};

await takeScreenshot();

const initialLabels = await getButtonLabels();
if (initialLabels.length > 0) {
  console.log('Detected button labels:', initialLabels.join(', '));
} else {
  console.log('No button labels detected; will try clicking any button.');
}

for (let i = 0; i < steps; i++) {
  let climbed = false;
  let attempts = 0;
  let actionToClick = '';

  while (!climbed && attempts < 5) {
    const state = await getState();
    const actions = state?.actions ?? [];
    const optimal = state?.evaluation?.optimalChoice;

    if (actions.length > 0) {
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
    }

    if (actionToClick) {
      const label = actions.find((a) => a.id === actionToClick)?.label;
      if (label) {
        climbed = await clickByLabel(label);
      }
    } else {
      const labels = await getButtonLabels();
      const fallbackLabels = labels.length > 0 ? labels : ['↖', '↑', '↗', '←', '→'];
      const label = fallbackLabels[i % fallbackLabels.length];
      climbed = await clickByLabel(label);
    }

    if (!climbed) {
      climbed = await clickAnyButton();
    }
    attempts++;
  }
}

console.log(`Captured ${frameCount} frames. Generating GIF...`);

try {
  const palettePath = path.join(framesDir, 'palette.png');
  if (frameCount < 2) {
    execSync(
      `ffmpeg -y -framerate ${fps} -i "${path.join(
        framesDir,
        'frame-%03d.png'
      )}" "${gifPath}"`,
      { stdio: 'inherit' }
    );
  } else {
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
  }
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
