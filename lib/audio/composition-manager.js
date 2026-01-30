import * as Tone from 'tone';
import { ensureAudioContext, disposeAll } from './index.js';

/**
 * CompositionManager orchestrates multiple audio and visual atoms
 * with centralized transport, scheduling, and lifecycle management.
 *
 * Usage:
 *   const manager = new CompositionManager({ bpm: 120 });
 *   const audioAtom = manager.addAudioAtom('synth1', initFn);
 *   const visualAtom = manager.addVisualAtom('visual1', p5Instance);
 *   manager.schedule('0:0:0', (time) => { ... });
 *   await manager.start();
 */
export class CompositionManager {
  /**
   * @param {object} config
   * @param {number} config.bpm - Beats per minute (default: 120)
   * @param {number} config.timeSignature - Beats per measure (default: 4)
   * @param {number} config.loopLength - Loop length in measures (default: 0 = no loop)
   */
  constructor(config = {}) {
    this.bpm = config.bpm ?? 120;
    this.timeSignature = config.timeSignature ?? 4;
    this.loopLength = config.loopLength ?? 0;

    this.audioAtoms = new Map();   // name -> { node, sequences, dispose }
    this.visualAtoms = new Map();  // name -> { instance, update, dispose }
    this.scheduledEvents = [];     // Transport event IDs
    this.isPlaying = false;

    // Configure transport
    Tone.getTransport().bpm.value = this.bpm;
    Tone.getTransport().timeSignature = this.timeSignature;

    if (this.loopLength > 0) {
      Tone.getTransport().loop = true;
      Tone.getTransport().loopEnd = `${this.loopLength}m`;
    }
  }

  /**
   * Register an audio atom with the composition.
   *
   * @param {string} name - Unique identifier for this atom
   * @param {object} atom - { node, sequences, dispose } where:
   *   - node: Tone.js audio node (synth, effects output, etc.)
   *   - sequences: Array of Tone.Sequence/Part/Loop objects
   *   - dispose: Cleanup function
   * @returns {object} The registered atom
   */
  addAudioAtom(name, atom) {
    this.audioAtoms.set(name, atom);
    return atom;
  }

  /**
   * Register a visual atom with the composition.
   *
   * @param {string} name - Unique identifier
   * @param {object} atom - { instance, updateParams, dispose } where:
   *   - instance: p5 instance
   *   - updateParams: function(audioData) to inject audio-reactive parameters
   *   - dispose: Cleanup function
   * @returns {object} The registered atom
   */
  addVisualAtom(name, atom) {
    this.visualAtoms.set(name, atom);
    return atom;
  }

  /**
   * Schedule an event at a specific transport time.
   * Uses Tone.Transport time notation (bars:beats:sixteenths).
   *
   * @param {string} time - Transport time (e.g., '0:0:0', '4:0:0', '1m', '4n')
   * @param {function} callback - Function called at scheduled time. Receives (time).
   * @returns {number} Event ID
   */
  schedule(time, callback) {
    const id = Tone.getTransport().schedule(callback, time);
    this.scheduledEvents.push(id);
    return id;
  }

  /**
   * Schedule a repeating event.
   *
   * @param {string} interval - Repeat interval (e.g., '4n', '1m')
   * @param {function} callback - Function called on each repeat
   * @param {string} startTime - When to start (default: '0:0:0')
   * @returns {number} Event ID
   */
  scheduleRepeat(interval, callback, startTime = '0:0:0') {
    const id = Tone.getTransport().scheduleRepeat(callback, interval, startTime);
    this.scheduledEvents.push(id);
    return id;
  }

  /**
   * Start the composition.
   * Ensures audio context is active, starts all sequences, begins transport.
   */
  async start() {
    await ensureAudioContext();

    // Start all audio atom sequences
    for (const [, atom] of this.audioAtoms) {
      if (atom.sequences) {
        atom.sequences.forEach(seq => seq.start(0));
      }
    }

    Tone.getTransport().start();
    this.isPlaying = true;
  }

  /**
   * Stop the composition.
   * Stops transport and all sequences.
   */
  stop() {
    // Stop all sequences
    for (const [, atom] of this.audioAtoms) {
      if (atom.sequences) {
        atom.sequences.forEach(seq => seq.stop());
      }
    }

    Tone.getTransport().stop();
    Tone.getTransport().position = '0:0:0';
    this.isPlaying = false;
  }

  /**
   * Pause the composition (stops transport without resetting position).
   */
  pause() {
    Tone.getTransport().pause();
    this.isPlaying = false;
  }

  /**
   * Get current transport position as string.
   * @returns {string}
   */
  getPosition() {
    return Tone.getTransport().position;
  }

  /**
   * Get current transport time in seconds.
   * @returns {number}
   */
  getSeconds() {
    return Tone.getTransport().seconds;
  }

  /**
   * Dispose all atoms and clear scheduled events.
   * Safe disposal order: stop -> cancel -> wait -> dispose atoms.
   */
  async dispose() {
    // Stop everything
    this.stop();
    Tone.getTransport().cancel();

    // Clear scheduled events
    this.scheduledEvents = [];

    // Wait for notes to release
    await new Promise(resolve => setTimeout(resolve, 150));

    // Dispose audio atoms
    for (const [name, atom] of this.audioAtoms) {
      if (atom.dispose) {
        await atom.dispose();
      }
    }
    this.audioAtoms.clear();

    // Dispose visual atoms
    for (const [name, atom] of this.visualAtoms) {
      if (atom.dispose) {
        atom.dispose();
      }
    }
    this.visualAtoms.clear();
  }
}
