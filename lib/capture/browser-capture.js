import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs-extra';
import { getMediaRecorderScript } from './media-recorder-inject.js';
import { detectAudioAtom, getPlayButtonSelector } from './audio-capture.js';

/**
 * Capture a running atom to a WebM video file using Playwright + MediaRecorder.
 *
 * Flow:
 * 1. Start Vite dev server for the atom (or use file:// URL)
 * 2. Launch headless Chromium with GPU flags
 * 3. Navigate to atom page
 * 4. If audio atom: click Play button to start audio
 * 5. Inject MediaRecorder script to capture canvas + audio
 * 6. Wait for capture duration
 * 7. Save WebM file to videos/masters/
 *
 * @param {object} options
 * @param {string} options.atomPath - Full path to atom directory
 * @param {string} options.atomName - Atom folder name (e.g., "2026-01-30-my-sketch")
 * @param {number} options.duration - Capture duration in seconds (default: 10)
 * @param {number} options.fps - Frame rate (default: 30)
 * @param {string} options.outputDir - Output directory (default: videos/masters)
 * @returns {Promise<{outputPath: string, fileSize: number, duration: number}>}
 */
export async function captureAtom(options) {
  const {
    atomPath,
    atomName,
    duration = 10,
    fps = 30,
    outputDir = path.resolve('videos', 'masters')
  } = options;

  // Ensure output directory exists
  await fs.ensureDir(outputDir);

  const outputPath = path.join(outputDir, `${atomName}.webm`);
  const hasAudio = await detectAudioAtom(atomPath);
  const playSelector = await getPlayButtonSelector(atomPath);
  const durationMs = duration * 1000;

  // Start a temporary Vite dev server for the atom
  // We use dynamic import to avoid requiring vite as a direct dependency
  const { createServer } = await import('vite');
  const viteServer = await createServer({
    root: path.resolve('.'),
    server: { port: 0 }, // Auto-assign port
    logLevel: 'silent'
  });
  await viteServer.listen();
  const port = viteServer.config.server.port || viteServer.httpServer.address().port;
  const atomUrl = `http://localhost:${port}/atoms/${atomName}/index.html`;

  let browser;
  try {
    // Launch browser with GPU acceleration for canvas rendering
    browser = await chromium.launch({
      headless: true,
      args: [
        '--use-angle=gl',
        '--enable-gpu',
        '--enable-webgl',
        '--autoplay-policy=no-user-gesture-required', // Allow audio autoplay
        '--disable-web-security' // Allow file access if needed
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 800, height: 800 },
      // Grant permissions for audio
      permissions: ['camera', 'microphone']
    });

    const page = await context.newPage();

    // Navigate to atom
    await page.goto(atomUrl, { waitUntil: 'networkidle' });

    // Wait for canvas to render
    await page.waitForSelector('canvas', { timeout: 10000 });

    // Additional wait for initialization (p5.js setup, Tone.js load)
    await page.waitForTimeout(1000);

    // Inject and run MediaRecorder capture
    // Play button will be clicked by the inject script AFTER recording starts
    const captureScript = getMediaRecorderScript();
    const base64Video = await page.evaluate(captureScript, {
      duration: durationMs,
      fps,
      hasAudio,
      playSelector
    });

    // Convert base64 data URL to buffer and save
    const base64Data = base64Video.split(',')[1];
    const videoBuffer = Buffer.from(base64Data, 'base64');
    await fs.writeFile(outputPath, videoBuffer);

    const fileSize = videoBuffer.length;

    return {
      outputPath,
      fileSize,
      duration
    };

  } finally {
    if (browser) await browser.close();
    await viteServer.close();
  }
}
