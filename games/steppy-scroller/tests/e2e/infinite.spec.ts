import { expect, test } from 'playwright/test';

test('Game supports infinite vertical scrolling with evaluation', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#controls .action');

  // Helper to get state
  const getState = () => page.evaluate(() => window.__MCP__?.getState());

  // Check initial state has evaluation
  const initialState: any = await getState();
  expect(initialState.evaluation).toBeDefined();
  expect(initialState.evaluation.resources.stamina).toBe(12);
  expect(initialState.evaluation.target).toBeDefined();

  // Climb 10 steps (consuming stamina)
  for (let i = 0; i < 10; i++) {
    let climbed = false;
    let attempts = 0;
    
    while (!climbed && attempts < 10) {
        const state: any = await getState();
        const actions = state.actions;
        
        // Use the Optimal Choice from Evaluation if available!
        const optimal = state.evaluation?.optimalChoice;
        
        // Fallback or use optimal
        const up = actions.find((a: any) => a.id === 'step-up');
        const right = actions.find((a: any) => a.id === 'step-right');
        const left = actions.find((a: any) => a.id === 'step-left');
        
        let actionId = '';
        if (optimal && actions.find((a: any) => a.id === optimal && a.enabled)) {
             actionId = optimal;
        } else if (up && up.enabled) {
             actionId = 'step-up';
        } else if (right && right.enabled) {
             actionId = 'step-right';
        } else if (left && left.enabled) {
             actionId = 'step-left';
        }

        if (actionId) {
             await page.evaluate((id) => window.__MCP__?.act(id), actionId);
             // Any move increases Y now!
             climbed = true;
        } else {
             // Stuck
        }
        attempts++;
        await page.waitForTimeout(50);
    }
  }

  const finalState: any = await getState();
  console.log('Final Y:', finalState.player.y);
  console.log('Final Stamina:', finalState.stamina);
  
  expect(finalState.player.y).toBeGreaterThan(5);
  expect(finalState.map[finalState.player.y]).toBeDefined();
  
  // Verify stamina was consumed
  expect(finalState.stamina).toBeLessThan(12);
});
