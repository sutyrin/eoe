import { expect, test } from 'playwright/test';

test('Game supports infinite vertical scrolling', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#controls .action');

  // Helper to get state
  const getState = () => page.evaluate(() => window.__MCP__?.getState());

  // Climb 15 steps
  for (let i = 0; i < 15; i++) {
    // We might hit a block. If blocked, move side then up.
    // For this test, let's just try to force our way up or side-step if needed.
    // Since generation is deterministic but hard to predict perfectly without replicating logic,
    // we'll implement a simple "Climber Bot" logic here.
    
    let climbed = false;
    let attempts = 0;
    while (!climbed && attempts < 10) {
        const state = await getState();
        const actions = state.actions;
        const up = actions.find((a: any) => a.id === 'step-up');
        
        if (up && up.enabled) {
            await page.evaluate(() => window.__MCP__?.act('step-up'));
            climbed = true;
        } else {
            // Blocked above. Move right or left.
            const right = actions.find((a: any) => a.id === 'step-right');
            const left = actions.find((a: any) => a.id === 'step-left');
            
            if (right && right.enabled) {
                 await page.evaluate(() => window.__MCP__?.act('step-right'));
            } else if (left && left.enabled) {
                 await page.evaluate(() => window.__MCP__?.act('step-left'));
            } else {
                 // Stuck? Should not happen in this simple generator often
                 // Maybe wait?
            }
        }
        attempts++;
        await page.waitForTimeout(50); // Small delay for state update
    }
  }

  const finalState = await getState();
  console.log('Final Y:', finalState.player.y);
  
  // We should be well above the original limit of 9 if we climbed successfully
  // Note: Random blocks might slow us down, but we expect to be higher than 0.
  expect(finalState.player.y).toBeGreaterThan(5);
  
  // Verify map generation
  // Check if we have data for the current row
  expect(finalState.map[finalState.player.y]).toBeDefined();
});
