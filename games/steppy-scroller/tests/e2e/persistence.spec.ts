import { expect, test } from 'playwright/test';

test('Game state persists across reloads', async ({ page }) => {
  await page.goto('/');

  // Ждем загрузки и контролов
  await page.waitForSelector('#controls .action');

  // Получаем начальное состояние
  const initialTick = await page.evaluate(() => window.__MCP__?.getState().tick);
  expect(initialTick).toBe(0);

  // Делаем ход вправо-вверх
  await page.click('button:has-text("↗")');

  // Проверяем, что состояние обновилось
  await expect.poll(async () => {
    return await page.evaluate(() => window.__MCP__?.getState().tick);
  }).toBe(1);

  // Ждем немного, чтобы автосейв (если он есть) или сетевой запрос прошел
  // В нашем коде save вызывается сразу, но асинхронно
  await page.waitForTimeout(500);

  // Перезагружаем страницу
  await page.reload();
  await page.waitForSelector('#controls .action');

  // Проверяем состояние после перезагрузки
  const reloadedTick = await page.evaluate(() => window.__MCP__?.getState().tick);
  const reloadedX = await page.evaluate(() => window.__MCP__?.getState().player.x);

  // Ожидаем, что тик сохранился (или увеличился, если логика игры меняется, но здесь он должен быть 1)
  expect(reloadedTick).toBe(1);
  // Начальный X был 2 (для width=5), после шага вправо стал 3.
  expect(reloadedX).toBe(3);
});
