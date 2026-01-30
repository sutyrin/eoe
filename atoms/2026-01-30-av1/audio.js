import * as Tone from 'tone';
import {
  createSynth,
  createEffectsChain,
  ensureAudioContext,
  startTransport,
  stopTransport,
  createSequence,
  disposeAll,
  AudioDataProvider
} from '../../lib/audio/index.js';

let synth = null;
let effectsChain = null;
let sequence = null;
let audioDataProvider = null;
let isPlaying = false;

/**
 * Initialize audio with given config.
 * @param {object} config - Audio configuration
 */
export function initAudio(config) {
  // Create effects chain
  effectsChain = createEffectsChain(config.effects || {});
  effectsChain.output.toDestination();

  // Create synth and connect to effects chain
  synth = createSynth(config.synth || {});
  synth.connect(effectsChain.chain);

  // Create audio data provider (connects analyser to synth output)
  audioDataProvider = new AudioDataProvider(effectsChain.output, {
    fftSize: config.analysis?.fftSize || 1024,
    smoothing: config.analysis?.smoothing || 0.8,
    outputSmoothing: config.analysis?.outputSmoothing || 0.15,
    beatThreshold: config.analysis?.beatThreshold || 0.15
  });

  // Create sequence
  sequence = createSequence(synth, config.sequence || {});
}

/**
 * Start audio playback.
 * @param {number} bpm - Beats per minute
 */
export async function startAudio(bpm = 120) {
  await ensureAudioContext();
  if (!isPlaying) {
    sequence.start(0);
    startTransport(bpm);
    isPlaying = true;
  }
}

/**
 * Stop audio playback.
 */
export function stopAudio() {
  if (isPlaying) {
    sequence.stop();
    stopTransport();
    isPlaying = false;
    if (audioDataProvider) audioDataProvider.reset();
  }
}

/**
 * Get current audio analysis data.
 * Call this every frame in the sketch's draw() function.
 *
 * @returns {object} { bass, lowMid, mid, highMid, treble, energy, beat, envelope, mids, spectrum }
 */
export function getAudioData() {
  if (!audioDataProvider) {
    return { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, energy: 0, beat: 0, envelope: 0, mids: 0, spectrum: [] };
  }
  return audioDataProvider.update();
}

/**
 * Check if audio is currently playing.
 */
export function getIsPlaying() {
  return isPlaying;
}

/**
 * Clean up all audio resources.
 */
export async function cleanupAudio() {
  isPlaying = false;

  if (audioDataProvider) {
    audioDataProvider.dispose();
    audioDataProvider = null;
  }

  await disposeAll({
    sequences: [sequence],
    effects: effectsChain,
    synths: [synth]
  });

  synth = null;
  effectsChain = null;
  sequence = null;
}
