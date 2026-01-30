import * as Tone from 'tone';

/**
 * Create a synth instance based on type and config.
 * Supported types: 'mono', 'poly', 'drums'
 *
 * @param {object} synthConfig - Synth configuration from config.json
 * @returns {object} Tone.js synth instance
 */
export function createSynth(synthConfig) {
  const { type = 'mono', oscillator = {}, envelope = {}, voices = 4 } = synthConfig;

  const synthOptions = {
    oscillator: { type: oscillator.type || 'sine' },
    envelope: {
      attack: envelope.attack ?? 0.01,
      decay: envelope.decay ?? 0.2,
      sustain: envelope.sustain ?? 0.5,
      release: envelope.release ?? 1.0
    }
  };

  switch (type) {
    case 'poly':
      return new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: voices,
        voice: Tone.Synth,
        options: synthOptions
      });

    case 'drums':
      return createDrumKit(synthConfig);

    case 'mono':
    default:
      return new Tone.Synth(synthOptions);
  }
}

/**
 * Create a simple drum kit using Tone.MembraneSynth (kick),
 * Tone.MetalSynth (hihat), and Tone.NoiseSynth (snare).
 * Returns an object with trigger methods.
 */
function createDrumKit(config) {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
  });

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.005, decay: 0.15, sustain: 0 }
  });

  const hihat = new Tone.MetalSynth({
    frequency: 200,
    envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5
  });

  // Wrap in a duck-typed object with connect/dispose interface
  const kit = {
    kick,
    snare,
    hihat,
    _voices: [kick, snare, hihat],

    connect(destination) {
      this._voices.forEach(v => v.connect(destination));
      return this;
    },

    toDestination() {
      this._voices.forEach(v => v.toDestination());
      return this;
    },

    triggerAttackRelease(note, duration, time) {
      // For drum kit, note selects the voice
      const n = typeof note === 'string' ? note.toLowerCase() : note;
      if (n === 'kick' || n === 'k' || n === 'C2') kick.triggerAttackRelease(n === 'kick' || n === 'k' ? 'C2' : n, duration, time);
      else if (n === 'snare' || n === 's') snare.triggerAttackRelease(duration, time);
      else if (n === 'hihat' || n === 'h') hihat.triggerAttackRelease(duration, time);
    },

    dispose() {
      this._voices.forEach(v => v.dispose());
    }
  };

  return kit;
}
