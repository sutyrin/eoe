import { createAnalyser } from './analyser.js';
import { extractBands, getSimpleBands } from './bands.js';
import { BeatDetector } from './beat-detect.js';
import { EnvelopeFollower } from './envelope.js';
import { createBatchSmoother } from './smoothing.js';

/**
 * AudioDataProvider aggregates all audio analysis into a single per-frame data object.
 * Connect it to an audio source, then call update() every frame to get fresh data.
 *
 * Usage:
 *   const provider = new AudioDataProvider(synthNode);
 *   // In animation loop:
 *   const data = provider.update();
 *   // data = { bass, lowMid, mid, highMid, treble, energy, beat, envelope, ... }
 */
export class AudioDataProvider {
  /**
   * @param {object} source - Tone.js audio node to analyze
   * @param {object} options - Configuration options
   * @param {number} options.fftSize - FFT size (default: 1024)
   * @param {number} options.smoothing - Analyser smoothing (default: 0.8)
   * @param {number} options.outputSmoothing - Output value smoothing alpha (default: 0.15)
   * @param {number} options.beatThreshold - Beat detection threshold (default: 0.15)
   * @param {number} options.sampleRate - Audio sample rate (default: 48000)
   */
  constructor(source, options = {}) {
    const {
      fftSize = 1024,
      smoothing = 0.8,
      outputSmoothing = 0.15,
      beatThreshold = 0.15,
      sampleRate = 48000
    } = options;

    this.fftSize = fftSize;
    this.sampleRate = sampleRate;

    // Create analyser and connect to source
    this.analyser = createAnalyser({ fftSize, smoothingTimeConstant: smoothing });
    this.analyser.connect(source);

    // Create detectors
    this.beatDetector = new BeatDetector({ threshold: beatThreshold });
    this.envelopeFollower = new EnvelopeFollower();

    // Create batch smoother for output values
    this.smoother = createBatchSmoother(
      ['bass', 'lowMid', 'mid', 'highMid', 'treble', 'sub', 'energy', 'envelope'],
      outputSmoothing
    );

    // Current data (last update result)
    this.data = {
      bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0, sub: 0,
      energy: 0, beat: 0, envelope: 0,
      // Simple 3-band aliases
      mids: 0,
      // Raw spectrum (unsmoothed, for advanced use)
      spectrum: new Float32Array(fftSize / 2)
    };
  }

  /**
   * Update all analysis and return fresh audio data.
   * Call this once per animation frame.
   *
   * @returns {object} Audio data with all metrics (0-1 normalized)
   */
  update() {
    // Get normalized spectrum
    const spectrum = this.analyser.getNormalizedValue();

    // Extract frequency bands
    const bands = extractBands(spectrum, this.sampleRate, this.fftSize);
    const simpleBands = getSimpleBands(bands);

    // Update beat detector
    this.beatDetector.update(spectrum);

    // Update envelope follower
    this.envelopeFollower.update(spectrum);

    // Calculate overall energy (average of all bands)
    const energy = (bands.sub + bands.bass + bands.lowMid + bands.mid + bands.highMid + bands.treble) / 6;

    // Assemble raw data
    const rawData = {
      ...bands,
      energy,
      envelope: this.envelopeFollower.getValue(),
      beat: this.beatDetector.getValue()
    };

    // Apply smoothing
    const smoothed = this.smoother(rawData);

    // Update stored data
    this.data = {
      ...smoothed,
      mids: simpleBands.mids,
      beat: this.beatDetector.getValue(), // Beat value not smoothed (already has its own decay)
      spectrum
    };

    return this.data;
  }

  /**
   * Get last computed data without updating.
   * @returns {object}
   */
  getData() {
    return this.data;
  }

  /**
   * Reset all detector states.
   */
  reset() {
    this.beatDetector.reset();
    this.envelopeFollower.reset();
  }

  /**
   * Dispose all resources.
   */
  dispose() {
    this.analyser.dispose();
    this.beatDetector.reset();
    this.envelopeFollower.reset();
  }
}
