import { test } from 'playwright/test';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

test('record gameplay gif', async ({ page }, testInfo) => {
  // Setup output paths
  const screenshotsDir = path.resolve('screenshots');
  const projectSlug = testInfo.project.name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
  const framesDir = path.resolve(
    screenshotsDir,
    `temp_frames_${projectSlug}_${testInfo.workerIndex}`
  );
  const timestamp = Date.now();
  const gifPath = (() => {
    let filenameSuffix = '';
    const baseUrl = process.env.E2E_BASE_URL || '';
    if (baseUrl.includes('vercel.app')) {
      filenameSuffix = '-prod';
    } else if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      filenameSuffix = '-localhost';
    }
    return path.resolve(
      screenshotsDir,
      `gameplay-${projectSlug}-${timestamp}${filenameSuffix}.gif`
    );
  })();

  if (fs.existsSync(framesDir)) {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(framesDir, { recursive: true });

  await page.goto('/');
  await page.waitForSelector('#controls .action', { timeout: 60000 });
  
  // Inject CSS for active button state simulation
  await page.addStyleTag({
    content: `
      .action.simulated-active {
        background-color: #4a8c5f !important;
        transform: translateY(6px) !important;
        box-shadow: 0 6px 0 #203b26 !important;
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
        const state: any = await getState();
        const actions = state.actions;
        const optimal = state.evaluation?.optimalChoice;

        // Strategy: Use Optimal Choice if available, else Fallback
        
        if (optimal && actions.find((a: any) => a.id === optimal && a.enabled)) {
            actionToClick = optimal;
        } else {
             // Fallback: Up > Right > Left
            const up = actions.find((a: any) => a.id === 'step-up');
            const right = actions.find((a: any) => a.id === 'step-right');
            const left = actions.find((a: any) => a.id === 'step-left');

            if (up && up.enabled) {
                actionToClick = 'step-up';
            } else if (right && right.enabled) {
                actionToClick = 'step-right';
            } else if (left && left.enabled) {
                actionToClick = 'step-left';
            }
        }

        if (actionToClick) {
            // Find the button element
            // We use label text to find it usually, but let's map id to label or just search
            const labelMap: Record<string, string> = {
                'step-up': '↑',
                'step-left': '↖',
                'step-right': '↗'
            };
            const label = labelMap[actionToClick];
            const button = page.getByRole('button', { name: label });

            // 1. Highlight Button
            await button.evaluate((el) => el.classList.add('simulated-active'));
            
            // 2. Take Screenshot (Pressed State)
            await takeScreenshot();

            // 3. Perform Action
            await button.click(); 
            
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
  try {
    // Generate palette for better quality
    const palettePath = path.join(framesDir, 'palette.png');
    execSync(`ffmpeg -y -i "${path.join(framesDir, 'frame-%03d.png')}" -vf "fps=8,scale=600:-1:flags=lanczos,palettegen" "${palettePath}"`, { stdio: 'inherit' });
    
    // Generate final GIF
    execSync(`ffmpeg -y -framerate 8 -i "${path.join(framesDir, 'frame-%03d.png')}" -i "${palettePath}" -lavfi "fps=8,scale=600:-1:flags=lanczos [x]; [x][1:v] paletteuse" "${gifPath}"`, { stdio: 'inherit' });
    
    console.log(`GIF saved to: ${gifPath}`);
  } catch (error) {
    console.error('Failed to generate GIF with ffmpeg', error);
  } finally {
    // Clean up frames
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
});
