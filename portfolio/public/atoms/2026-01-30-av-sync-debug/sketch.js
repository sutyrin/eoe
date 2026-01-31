import { initAudio, startAudio, stopAudio, getAudioData, getIsPlaying, cleanupAudio } from './audio.js';
import config from './config.json';

let audioData = null;
let lastBeatTime = 0;
let beatFlashIntensity = 0;

/**
 * p5.js setup - runs once at start
 */
export function setup(p) {
  p.createCanvas(800, 800);
  p.frameRate(60);

  // Initialize audio system
  initAudio(config);
}

/**
 * p5.js draw - runs every frame
 */
export function draw(p) {
  // Get audio data
  audioData = getAudioData();

  // Detect beat and trigger flash
  if (audioData.beat > 0) {
    beatFlashIntensity = 1.0;
    lastBeatTime = p.millis();
  }

  // Decay flash intensity
  beatFlashIntensity *= 0.85;

  // Background: black when no beat, white when beat detected
  const bgColor = p.lerp(0, 255, beatFlashIntensity);
  p.background(bgColor);

  // Center circle that scales with beat
  p.push();
  p.translate(p.width / 2, p.height / 2);

  // Circle size based on beat flash
  const baseSize = 200;
  const circleSize = baseSize + (beatFlashIntensity * 400);

  // Circle color: white when beat, black otherwise
  const circleColor = p.lerp(255, 0, beatFlashIntensity);
  p.fill(circleColor);
  p.noStroke();
  p.circle(0, 0, circleSize);

  p.pop();

  // Debug info
  p.fill(audioData.beat > 0 ? 0 : 255);
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(16);
  p.text(`Beat: ${audioData.beat.toFixed(3)}`, 10, 10);
  p.text(`Energy: ${audioData.energy.toFixed(3)}`, 10, 30);
  p.text(`Time: ${(p.millis() / 1000).toFixed(1)}s`, 10, 50);
  p.text(`Playing: ${getIsPlaying()}`, 10, 70);
}

/**
 * Start button click handler
 */
export async function onPlayClick(p) {
  await startAudio(config.transport.bpm);
}

/**
 * Stop button click handler
 */
export function onStopClick(p) {
  stopAudio();
  beatFlashIntensity = 0;
}

/**
 * Cleanup when atom is disposed
 */
export async function dispose() {
  await cleanupAudio();
}
