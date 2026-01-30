/**
 * Smoothing and easing utilities for audio-to-visual parameter mapping.
 * All functions work with 0-1 normalized values.
 */

/**
 * Exponential moving average smoother.
 * Create one per parameter for persistent state.
 *
 * @param {number} alpha - Smoothing factor (0-1). Lower = smoother. Default: 0.15
 * @returns {function} smoother(newValue) -> smoothedValue
 */
export function createSmoother(alpha = 0.15) {
  let current = null;

  return function smooth(value) {
    if (current === null) {
      current = value;
      return value;
    }
    current += (value - current) * alpha;
    return current;
  };
}

/**
 * Batch smoother for an object of values.
 * Creates individual smoothers for each key.
 *
 * @param {string[]} keys - Keys to smooth
 * @param {number} alpha - Smoothing factor
 * @returns {function} smoothAll(dataObject) -> smoothedObject
 */
export function createBatchSmoother(keys, alpha = 0.15) {
  const smoothers = {};
  for (const key of keys) {
    smoothers[key] = createSmoother(alpha);
  }

  return function smoothAll(data) {
    const result = { ...data };
    for (const key of keys) {
      if (key in data && smoothers[key]) {
        result[key] = smoothers[key](data[key]);
      }
    }
    return result;
  };
}

// --- Easing Functions ---
// All take a 0-1 input and return 0-1 output with nonlinear mapping.

/** Linear (identity) */
export function easeLinear(t) {
  return t;
}

/** Exponential ease-in */
export function easeExponentialIn(t) {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}

/** Exponential ease-out */
export function easeExponentialOut(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Logarithmic (soft response to quiet, compressed response to loud) */
export function easeLogarithmic(t) {
  return t <= 0 ? 0 : Math.log(1 + t * 9) / Math.log(10);
}

/** Sine ease-in-out (smooth S-curve) */
export function easeSineInOut(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Cubic ease-out (fast start, slow finish) */
export function easeCubicOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Quadratic ease-in (slow start, fast finish) */
export function easeQuadraticIn(t) {
  return t * t;
}

/**
 * Apply easing and range mapping to a 0-1 value.
 * Maps input through easing function, then scales to [min, max] range.
 *
 * @param {number} value - Input value (0-1)
 * @param {object} mapping - { min, max, curve }
 * @returns {number} Mapped value in [min, max] range
 */
export function applyMapping(value, mapping = {}) {
  const { min = 0, max = 1, curve = 'linear' } = mapping;

  // Clamp input
  const t = Math.max(0, Math.min(1, value));

  // Apply easing curve
  const easingFns = {
    linear: easeLinear,
    exponentialIn: easeExponentialIn,
    exponentialOut: easeExponentialOut,
    logarithmic: easeLogarithmic,
    sineInOut: easeSineInOut,
    cubicOut: easeCubicOut,
    quadraticIn: easeQuadraticIn
  };

  const easeFn = easingFns[curve] || easeLinear;
  const eased = easeFn(t);

  // Map to range
  return min + eased * (max - min);
}
