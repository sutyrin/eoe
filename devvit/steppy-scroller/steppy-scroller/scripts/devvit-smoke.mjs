import { chromium, devices } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const authFile = path.resolve('playwright', '.auth', 'reddit.json');
const postUrl = process.env.DEVVIT_POST_URL ?? process.env.REDDIT_POST_URL;
const useMobile = process.env.PW_MOBILE !== '0';
const deviceName = process.env.PW_DEVICE ?? 'iPhone 13';

if (!postUrl) {
  console.error('Set DEVVIT_POST_URL (or REDDIT_POST_URL) to the Reddit post URL with the Devvit app.');
  process.exit(1);
}

if (!fs.existsSync(authFile)) {
  console.error('Missing auth file. Run `npm run pw:login` first to create playwright/.auth/reddit.json.');
  process.exit(1);
}

const browser = await chromium.launch({ headless: false });
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
      }),
});

const page = await context.newPage();
await page.goto(postUrl, { waitUntil: 'domcontentloaded' });
await page.waitForLoadState('networkidle');

console.log('Opened Devvit post:', postUrl);
console.log('If the app is visible, close the browser to finish.');
