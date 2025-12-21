import { expect, test } from 'playwright/test';

test('MCP state and UI stay in sync', async ({ page }) => {
  await page.goto('/');

  await page.waitForSelector('#controls .action');

  const initial = await page.evaluate(() => window.__MCP__?.getState());
  expect(initial?.tick).toBe(0);
  expect(initial?.player.y).toBe(0);

  await page.getByRole('button', { name: '↑' }).click();

  const afterUi = await page.evaluate(() => window.__MCP__?.getState());
  expect(afterUi?.tick).toBe(1);
  expect(afterUi?.player.y).toBe(1);

  await page.evaluate(() => window.__MCP__?.act('step-right'));

  const afterMcp = await page.evaluate(() => window.__MCP__?.getState());
  expect(afterMcp?.tick).toBe(2);
  expect(afterMcp?.player.x).toBe(3);
});
