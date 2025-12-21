import { test } from 'playwright/test';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

test('record gameplay gif', async ({ page }) => {
  // Setup output paths
  const screenshotsDir = path.resolve('screenshots');
  const framesDir = path.resolve(screenshotsDir, 'temp_frames');
  const timestamp = Date.now();
  const gifPath = path.resolve(screenshotsDir, `gameplay-${timestamp}.gif`);

  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  await page.goto('/');
  await page.waitForSelector('#controls .action');
  
  // Inject CSS for active button state simulation
  await page.addStyleTag({
    content: `
      .action.simulated-active {
        background-color: #4a8c5f !important;
        transform: translateY(2px);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        color: white;
      }
    `
  });

  // Helper to take a screenshot
  let frameCount = 0;
  const takeScreenshot = async () => {
    const framePath = path.join(framesDir, `frame-${String(frameCount).padStart(3, '0')}.png`);
    await page.screenshot({ path: framePath });
    frameCount++;
  };

  // Helper to get state
  const getState = () => page.evaluate(() => window.__MCP__?.getState());

  // Initial state screenshot
  await takeScreenshot();

  // Simple climber bot logic
  for (let i = 0; i < 20; i++) { // Record 20 steps
    let climbed = false;
    let attempts = 0;
    
    // Determine move
    let actionToClick = '';
    
    while (!climbed && attempts < 5) {
        const state = await getState();
        const actions = state.actions;
        
        // Strategy: Up > Right > Left > Down
        const up = actions.find((a: any) => a.id === 'step-up');
        const right = actions.find((a: any) => a.id === 'step-right');
        const left = actions.find((a: any) => a.id === 'step-left');
        const down = actions.find((a: any) => a.id === 'step-down');

        if (up && up.enabled) {
            actionToClick = 'step-up';
        } else if (right && right.enabled) {
            actionToClick = 'step-right';
        } else if (left && left.enabled) {
            actionToClick = 'step-left';
        } else if (down && down.enabled) {
            actionToClick = 'step-down';
        }

        if (actionToClick) {
            // Find the button element
            // We use label text to find it usually, but let's map id to label or just search
            const labelMap: Record<string, string> = {
                'step-up': '↑',
                'step-left': '←',
                'step-right': '→',
                'step-down': '↓'
            };
            const label = labelMap[actionToClick];
            const button = page.getByRole('button', { name: label });

            // 1. Highlight Button
            await button.evaluate((el) => el.classList.add('simulated-active'));
            
            // 2. Take Screenshot (Pressed State)
            await takeScreenshot();

            // 3. Perform Action
            await button.click(); // This might trigger re-render, removing class if UI refreshes fully. 
            // In our case, UI is re-rendered by `renderUi`. So the class will be lost, which is perfect.
            
            // 4. Wait a tiny bit for animation/update
            await page.waitForTimeout(100); 

            // 5. Take Screenshot (Result State)
            await takeScreenshot();
            
            climbed = true;
        } else {
             // No moves? Wait and retry (shouldn't happen often)
             await page.waitForTimeout(100);
        }
        attempts++;
    }
  }

  console.log(`Captured ${frameCount} frames. Generating GIF...`);

  // Generate GIF using ffmpeg
  // -framerate 3: 3 frames per second
  // -i ...: input pattern
  // -vf ...: scale if needed, or palette gen for better quality
  // loop -1 or 0? 0 is infinite.
  
  try {
    // Generate palette for better quality
    const palettePath = path.join(framesDir, 'palette.png');
    execSync(`ffmpeg -y -i "${path.join(framesDir, 'frame-%03d.png')}" -vf "fps=5,scale=600:-1:flags=lanczos,palettegen" "${palettePath}"`, { stdio: 'inherit' });
    
    // Generate final GIF
    execSync(`ffmpeg -y -framerate 5 -i "${path.join(framesDir, 'frame-%03d.png')}" -i "${palettePath}" -lavfi "fps=5,scale=600:-1:flags=lanczos [x]; [x][1:v] paletteuse" "${gifPath}"`, { stdio: 'inherit' });
    
    console.log(`GIF saved to: ${gifPath}`);
  } catch (error) {
    console.error('Failed to generate GIF with ffmpeg', error);
  } finally {
    // Clean up frames
    // fs.rmSync(framesDir, { recursive: true, force: true });
    // Keep frames for debug if needed, or comment out above line to keep.
    // For now, let's clean up.
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
});
