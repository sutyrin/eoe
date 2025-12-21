import { test } from 'playwright/test';
import path from 'path';

test('capture screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('canvas'); // Wait for game canvas
  // Wait a bit for assets to render (simple delay as canvas content is hard to detect via DOM)
  await page.waitForTimeout(2000); 
  
  const screenshotPath = path.resolve('screenshots', `game-screenshot-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);
});
