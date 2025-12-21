import { expect, test } from 'playwright/test';

test('smoke: UI renders and MCP actions match controls', async ({ page }) => {
  await page.goto('/');

  await page.waitForFunction(() => window.__MCP__?.getState);
  await page.waitForSelector('#controls .action');
  await page.waitForSelector('#game-root canvas');

  const state = await page.evaluate(() => window.__MCP__?.getState());
  expect(state).toBeTruthy();
  expect(Array.isArray(state?.actions)).toBeTruthy();
  expect(state?.actions?.length).toBeGreaterThan(0);

  const actionLabels = state?.actions?.map((action) => action.label) ?? [];
  const uiLabels = await page.$$eval('#controls .action', (nodes) =>
    nodes.map((node) => (node.textContent ?? '').trim())
  );

  expect(uiLabels).toEqual(actionLabels);
});
