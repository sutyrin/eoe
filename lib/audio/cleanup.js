import * as Tone from 'tone';

/**
 * Safely dispose all Tone.js nodes in order:
 * 1. Stop transport and cancel events
 * 2. Wait brief moment for notes to release
 * 3. Dispose sequences, then effects, then synths
 * 4. Clear all references
 *
 * @param {object} resources - { sequences, effects, synths, gui, extras }
 */
export async function disposeAll(resources = {}) {
  const {
    sequences = [],
    effects = null,
    synths = [],
    gui = null,
    extras = []
  } = resources;

  // 1. Stop transport
  Tone.getTransport().stop();
  Tone.getTransport().cancel();

  // 2. Stop and dispose sequences
  for (const seq of sequences) {
    if (seq) {
      seq.stop();
      seq.dispose();
    }
  }

  // 3. Brief wait for note releases to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // 4. Dispose synths
  for (const synth of synths) {
    if (synth) {
      synth.dispose();
    }
  }

  // 5. Dispose effects chain
  if (effects && effects.dispose) {
    effects.dispose();
  }

  // 6. Dispose extras (analysers, gains, etc.)
  for (const node of extras) {
    if (node && node.dispose) {
      node.dispose();
    }
  }

  // 7. Destroy GUI
  if (gui) {
    gui.destroy();
  }
}
