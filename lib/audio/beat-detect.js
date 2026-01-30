/**
 * Beat detector using spectral flux algorithm.
 * Tracks energy changes between frames and fires on positive transients.
 *
 * Usage:
 *   const detector = new BeatDetector();
 *   // In animation loop:
 *   const isBeat = detector.update(spectrum);
 */
export class BeatDetector {
  /**
   * @param {object} options
   * @param {number} options.threshold - Flux threshold for beat detection (default: 0.15)
   * @param {number} options.decayRate - How fast the threshold adapts (default: 0.98)
   * @param {number} options.minInterval - Minimum ms between beats (default: 200)
   */
  constructor(options = {}) {
    this.threshold = options.threshold ?? 0.15;
    this.decayRate = options.decayRate ?? 0.98;
    this.minInterval = options.minInterval ?? 200;

    this.prevSpectrum = null;
    this.adaptiveThreshold = this.threshold;
    this.lastBeatTime = 0;
    this.beatValue = 0;        // 0-1: 1 at beat, decays to 0
    this.beatDecay = 0.9;      // How fast beat value decays per frame
  }

  /**
   * Update beat detector with new spectrum data.
   *
   * @param {Float32Array} spectrum - Normalized 0-1 FFT data
   * @returns {boolean} True if a beat was detected this frame
   */
  update(spectrum) {
    // Decay beat value each frame
    this.beatValue *= this.beatDecay;

    if (!this.prevSpectrum) {
      this.prevSpectrum = new Float32Array(spectrum);
      return false;
    }

    // Calculate spectral flux (positive differences only)
    let flux = 0;
    for (let i = 0; i < spectrum.length; i++) {
      const diff = spectrum[i] - this.prevSpectrum[i];
      if (diff > 0) flux += diff;
    }

    // Normalize flux by number of bins
    flux /= spectrum.length;

    // Adaptive threshold: slowly decays toward base threshold
    this.adaptiveThreshold = Math.max(
      this.threshold,
      this.adaptiveThreshold * this.decayRate
    );

    // Check for beat
    const now = performance.now();
    const isBeat = flux > this.adaptiveThreshold &&
                   (now - this.lastBeatTime) > this.minInterval;

    if (isBeat) {
      this.lastBeatTime = now;
      this.adaptiveThreshold = flux * 1.1; // Raise threshold after beat
      this.beatValue = 1.0; // Reset to 1 on beat
    }

    // Store current spectrum for next frame
    this.prevSpectrum.set(spectrum);

    return isBeat;
  }

  /**
   * Get current beat value (0-1).
   * 1.0 at moment of beat, decays exponentially to 0.
   * Use this for smooth visual reactions to beats.
   */
  getValue() {
    return this.beatValue;
  }

  /**
   * Reset detector state.
   */
  reset() {
    this.prevSpectrum = null;
    this.adaptiveThreshold = this.threshold;
    this.lastBeatTime = 0;
    this.beatValue = 0;
  }
}
