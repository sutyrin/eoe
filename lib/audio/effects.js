import * as Tone from 'tone';

/**
 * Create an effects chain from config.
 * Each effect in the config array is instantiated and chained together.
 * Returns { chain: Tone.js node (first effect), effects: [all effects], dispose() }.
 *
 * @param {object} effectsConfig - Effects configuration from config.json
 * @returns {object} { chain, effects, dispose }
 */
export function createEffectsChain(effectsConfig = {}) {
  const effects = [];

  if (effectsConfig.reverb) {
    effects.push(new Tone.Reverb({
      decay: effectsConfig.reverb.decay ?? 2.5,
      wet: effectsConfig.reverb.wet ?? 0.3
    }));
  }

  if (effectsConfig.delay) {
    effects.push(new Tone.FeedbackDelay({
      delayTime: effectsConfig.delay.delayTime ?? 0.25,
      feedback: effectsConfig.delay.feedback ?? 0.2,
      wet: effectsConfig.delay.wet ?? 0.3
    }));
  }

  if (effectsConfig.filter) {
    effects.push(new Tone.Filter({
      frequency: effectsConfig.filter.frequency ?? 1000,
      type: effectsConfig.filter.type ?? 'lowpass',
      Q: effectsConfig.filter.Q ?? 1
    }));
  }

  if (effectsConfig.distortion) {
    effects.push(new Tone.Distortion({
      distortion: effectsConfig.distortion.amount ?? 0.4,
      wet: effectsConfig.distortion.wet ?? 0.5
    }));
  }

  if (effectsConfig.compressor) {
    effects.push(new Tone.Compressor({
      threshold: effectsConfig.compressor.threshold ?? -24,
      ratio: effectsConfig.compressor.ratio ?? 4,
      attack: effectsConfig.compressor.attack ?? 0.003,
      release: effectsConfig.compressor.release ?? 0.25
    }));
  }

  // If no effects, return a passthrough Gain node
  if (effects.length === 0) {
    const passthrough = new Tone.Gain(1);
    return {
      chain: passthrough,
      effects: [passthrough],
      dispose() {
        passthrough.dispose();
      }
    };
  }

  // Chain effects: first -> second -> ... -> last -> destination
  for (let i = 0; i < effects.length - 1; i++) {
    effects[i].connect(effects[i + 1]);
  }

  return {
    chain: effects[0],        // Connect synth to this
    output: effects[effects.length - 1], // Connect this to destination
    effects,
    dispose() {
      effects.forEach(fx => fx.dispose());
    }
  };
}
