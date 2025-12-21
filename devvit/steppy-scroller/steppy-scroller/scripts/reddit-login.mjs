import { chromium } from 'playwright';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'node:fs/promises';

const authDir = path.resolve('playwright', '.auth');
const authFile = path.join(authDir, 'reddit.json');
const loginUrl = process.env.REDDIT_LOGIN_URL ?? 'https://www.reddit.com/login/';

await fs.mkdir(authDir, { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

const rl = readline.createInterface({ input, output });
await rl.question('Log in to Reddit in the browser window, then press Enter here to save the session...');
rl.close();

await context.storageState({ path: authFile });
await context.close();
await browser.close();
