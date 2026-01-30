/**
 * Envelope follower that tracks overall audio energy level.
 * Uses different attack/release rates for smooth tracking.
 *
 * Usage:
 *   const follower = new EnvelopeFollower();
 *   // In animation loop:
 *   const level = follower.update(spectrum);
 */
export class EnvelopeFollower {
  /**
   * @param {object} options
   * @param {number} options.attack - Attack rate (0-1, how fast to rise). Default: 0.1
   * @param {number} options.release - Release rate (0-1, how fast to fall). Default: 0.05
   */
  constructor(options = {}) {
    this.attack = options.attack ?? 0.1;
    this.release = options.release ?? 0.05;
    this.currentLevel = 0;
    this.peakLevel = 0;
    this.peakDecay = 0.999; // Very slow peak decay for auto-gain
  }

  /**
   * Update envelope with current spectrum.
   *
   * @param {Float32Array} spectrum - Normalized 0-1 FFT data
   * @returns {number} Current envelope level (0-1)
   */
  update(spectrum) {
    // Calculate RMS energy
    let sumSquares = 0;
    for (let i = 0; i < spectrum.length; i++) {
      sumSquares += spectrum[i] * spectrum[i];
    }
    const rms = Math.sqrt(sumSquares / spectrum.length);

    // Track peak for auto-normalization
    if (rms > this.peakLevel) {
      this.peakLevel = rms;
    } else {
      this.peakLevel *= this.peakDecay;
    }

    // Normalize by peak (auto-gain)
    const targetLevel = this.peakLevel > 0.001 ? rms / this.peakLevel : 0;

    // Apply attack/release smoothing
    if (targetLevel > this.currentLevel) {
      this.currentLevel += (targetLevel - this.currentLevel) * this.attack;
    } else {
      this.currentLevel += (targetLevel - this.currentLevel) * this.release;
    }

    return Math.max(0, Math.min(1, this.currentLevel));
  }

  /**
   * Get current level without updating.
   * @returns {number} Current level (0-1)
   */
  getValue() {
    return this.currentLevel;
  }

  /**
   * Reset follower state.
   */
  reset() {
    this.currentLevel = 0;
    this.peakLevel = 0;
  }
}
