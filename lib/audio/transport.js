import * as Tone from 'tone';

/**
 * Ensure audio context is running (requires user gesture).
 * Call this from a click/keydown handler.
 */
export async function ensureAudioContext() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
}

/**
 * Configure and start Tone.Transport with given BPM.
 * @param {number} bpm - Beats per minute
 */
export function startTransport(bpm = 120) {
  Tone.getTransport().bpm.value = bpm;
  Tone.getTransport().start();
}

/**
 * Stop Tone.Transport and cancel all scheduled events.
 */
export function stopTransport() {
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
}

/**
 * Get current transport time in seconds.
 * @returns {number}
 */
export function getTransportTime() {
  return Tone.getTransport().seconds;
}

/**
 * Get current transport position as bar:beat:sixteenth string.
 * @returns {string}
 */
export function getTransportPosition() {
  return Tone.getTransport().position;
}

/**
 * Create a Tone.Sequence from config.
 * @param {function} synth - Synth with triggerAttackRelease method
 * @param {object} seqConfig - { notes, duration, interval }
 * @returns {Tone.Sequence}
 */
export function createSequence(synth, seqConfig) {
  const { notes = ['C4'], duration = '8n', interval = '4n' } = seqConfig;

  const sequence = new Tone.Sequence((time, note) => {
    if (note !== null && note !== 'rest') {
      synth.triggerAttackRelease(note, duration, time);
    }
  }, notes, interval);

  return sequence;
}
