import fs from 'fs-extra';
import path from 'path';

/**
 * Detect whether an atom has audio capabilities by examining its files.
 * Audio atoms have: audio.js, composition.js, or config.json with type audio/audio-visual/composition.
 *
 * @param {string} atomPath - Full path to atom directory
 * @returns {Promise<boolean>} True if atom has audio
 */
export async function detectAudioAtom(atomPath) {
  // Check config.json for type
  const configPath = path.join(atomPath, 'config.json');
  if (await fs.pathExists(configPath)) {
    try {
      const config = await fs.readJson(configPath);
      const audioTypes = ['audio', 'audio-visual', 'composition'];
      if (audioTypes.includes(config.type)) {
        return true;
      }
    } catch (e) {
      // Config parse failed, fall through to file detection
    }
  }

  // Check for audio-related files
  const audioFiles = ['audio.js', 'composition.js'];
  for (const file of audioFiles) {
    if (await fs.pathExists(path.join(atomPath, file))) {
      return true;
    }
  }

  return false;
}

/**
 * Determine the method to start audio playback in the browser.
 * Audio/audio-visual/composition atoms have a Play button that needs clicking.
 *
 * @param {string} atomPath - Full path to atom directory
 * @returns {Promise<string|null>} CSS selector for play button, or null if no audio
 */
export async function getPlayButtonSelector(atomPath) {
  const hasAudio = await detectAudioAtom(atomPath);
  if (!hasAudio) return null;

  // All audio templates use #playBtn
  return '#playBtn';
}
