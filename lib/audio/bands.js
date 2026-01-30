/**
 * Extract frequency bands from normalized FFT spectrum.
 * Frequency ranges based on standard audio bands:
 *   Bass:    20-250 Hz
 *   Low-mid: 250-500 Hz
 *   Mid:     500-2000 Hz
 *   High-mid: 2000-4000 Hz
 *   Treble:  4000-8000 Hz
 *
 * @param {Float32Array} spectrum - Normalized FFT data (0-1 range)
 * @param {number} sampleRate - Audio context sample rate (default: 48000)
 * @param {number} fftSize - FFT size used (default: 1024)
 * @returns {object} { bass, lowMid, mid, highMid, treble, sub }
 */
export function extractBands(spectrum, sampleRate = 48000, fftSize = 1024) {
  const binWidth = sampleRate / fftSize;
  const binCount = spectrum.length;

  // Convert frequency to bin index
  const freqToBin = (freq) => Math.min(Math.round(freq / binWidth), binCount - 1);

  // Band frequency ranges
  const bands = {
    sub:     [20, 60],
    bass:    [60, 250],
    lowMid:  [250, 500],
    mid:     [500, 2000],
    highMid: [2000, 4000],
    treble:  [4000, 8000]
  };

  const result = {};

  for (const [name, [lowFreq, highFreq]] of Object.entries(bands)) {
    const lowBin = freqToBin(lowFreq);
    const highBin = freqToBin(highFreq);

    if (lowBin >= highBin) {
      result[name] = 0;
      continue;
    }

    // Average the energy across bins in this band
    let sum = 0;
    let count = 0;
    for (let i = lowBin; i <= highBin && i < binCount; i++) {
      sum += spectrum[i];
      count++;
    }

    result[name] = count > 0 ? sum / count : 0;
  }

  return result;
}

/**
 * Get simplified bands (bass, mids, treble) for common use.
 * Combines sub-bands into three main categories.
 *
 * @param {object} bands - Full band extraction from extractBands()
 * @returns {object} { bass, mids, treble }
 */
export function getSimpleBands(bands) {
  return {
    bass: Math.max(bands.sub || 0, bands.bass || 0),
    mids: ((bands.lowMid || 0) + (bands.mid || 0) + (bands.highMid || 0)) / 3,
    treble: bands.treble || 0
  };
}
