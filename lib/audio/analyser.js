import * as Tone from 'tone';

/**
 * Create a Tone.Analyser configured for FFT analysis with normalized 0-1 output.
 *
 * @param {object} options - { fftSize, smoothingTimeConstant }
 * @returns {object} { analyser, connect(source), getValue(), dispose() }
 */
export function createAnalyser(options = {}) {
  const {
    fftSize = 1024,
    smoothingTimeConstant = 0.8
  } = options;

  const analyser = new Tone.Analyser('fft', fftSize);
  analyser.smoothing = smoothingTimeConstant;

  return {
    analyser,

    /**
     * Connect an audio source to this analyser.
     * @param {object} source - Tone.js audio node
     */
    connect(source) {
      source.connect(analyser);
      return this;
    },

    /**
     * Get current FFT data as Float32Array (dB values).
     * @returns {Float32Array}
     */
    getRawValue() {
      return analyser.getValue();
    },

    /**
     * Get current FFT data normalized to 0-1 range.
     * Tone.Analyser returns dB values (typically -100 to 0).
     * We map to 0-1 using minDecibels/maxDecibels.
     *
     * @param {number} minDb - Minimum dB value (maps to 0). Default: -100
     * @param {number} maxDb - Maximum dB value (maps to 1). Default: -30
     * @returns {Float32Array} Values in 0-1 range
     */
    getNormalizedValue(minDb = -100, maxDb = -30) {
      const raw = analyser.getValue();
      const range = maxDb - minDb;
      const normalized = new Float32Array(raw.length);

      for (let i = 0; i < raw.length; i++) {
        normalized[i] = Math.max(0, Math.min(1, (raw[i] - minDb) / range));
      }

      return normalized;
    },

    /**
     * Get the FFT size (number of frequency bins = fftSize / 2).
     */
    get binCount() {
      return fftSize / 2;
    },

    dispose() {
      analyser.dispose();
    }
  };
}
