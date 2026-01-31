import * as Tone from 'tone';
import GUI from 'lil-gui';
import {
  createSynth,
  createEffectsChain,
  ensureAudioContext,
  startTransport,
  stopTransport,
  getTransportPosition,
  createSequence,
  disposeAll
} from '../../lib/audio/index.js';

// --- State ---
let synth = null;
let effectsChain = null;
let sequence = null;
let gui = null;
let positionInterval = null;
let isPlaying = false;

// --- Config ---
let config = {
  synth: {
    type: 'mono',
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 1.0 }
  },
  sequence: {
    notes: ['C4', 'E4', 'G4', 'B4', 'C5', 'B4', 'G4', 'E4'],
    duration: '8n',
    interval: '8n'
  },
  effects: {
    reverb: { decay: 2.5, wet: 0.3 }
  },
  transport: {
    bpm: 120
  }
};

async function init() {
  // Load config from JSON
  try {
    const response = await fetch('./config.json');
    const saved = await response.json();
    config = { ...config, ...saved };
  } catch (e) {
    console.log('No saved config, using defaults');
  }

  setupAudio();
  setupGUI();
  setupTransportControls();
}

function setupAudio() {
  // Create effects chain
  effectsChain = createEffectsChain(config.effects);
  effectsChain.output.toDestination();

  // Create synth and connect to effects chain
  synth = createSynth(config.synth);
  synth.connect(effectsChain.chain);

  // Create sequence
  sequence = createSequence(synth, config.sequence);
}

function setupTransportControls() {
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const positionEl = document.getElementById('position');

  playBtn.addEventListener('click', async () => {
    await ensureAudioContext();

    if (!isPlaying) {
      sequence.start(0);
      startTransport(config.transport.bpm);
      isPlaying = true;
      playBtn.classList.add('active');

      // Update position display
      positionInterval = setInterval(() => {
        positionEl.textContent = getTransportPosition();
      }, 100);
    }
  });

  stopBtn.addEventListener('click', () => {
    if (isPlaying) {
      sequence.stop();
      stopTransport();
      isPlaying = false;
      playBtn.classList.remove('active');

      if (positionInterval) {
        clearInterval(positionInterval);
        positionInterval = null;
      }
      positionEl.textContent = '0:0:0';
    }
  });
}

function setupGUI() {
  gui = new GUI({ title: 'au1 Parameters' });

  // Synth controls
  const synthFolder = gui.addFolder('Synth');
  synthFolder.add(config.synth.oscillator, 'type', ['sine', 'triangle', 'sawtooth', 'square'])
    .name('Oscillator')
    .onChange(val => {
      if (synth && synth.oscillator) synth.oscillator.type = val;
    });
  synthFolder.add(config.synth.envelope, 'attack', 0.001, 2).name('Attack')
    .onChange(val => { if (synth && synth.envelope) synth.envelope.attack = val; });
  synthFolder.add(config.synth.envelope, 'decay', 0.01, 2).name('Decay')
    .onChange(val => { if (synth && synth.envelope) synth.envelope.decay = val; });
  synthFolder.add(config.synth.envelope, 'sustain', 0, 1).name('Sustain')
    .onChange(val => { if (synth && synth.envelope) synth.envelope.sustain = val; });
  synthFolder.add(config.synth.envelope, 'release', 0.01, 5).name('Release')
    .onChange(val => { if (synth && synth.envelope) synth.envelope.release = val; });

  // Transport controls
  const transportFolder = gui.addFolder('Transport');
  transportFolder.add(config.transport, 'bpm', 40, 200).step(1).name('BPM')
    .onChange(val => {
      Tone.getTransport().bpm.value = val;
    });

  // Effects controls
  if (config.effects.reverb) {
    const reverbFolder = gui.addFolder('Reverb');
    reverbFolder.add(config.effects.reverb, 'decay', 0.1, 10).name('Decay');
    reverbFolder.add(config.effects.reverb, 'wet', 0, 1).name('Wet');
  }

  gui.onChange(() => {
    console.log('Copy to config.json:', JSON.stringify(config, null, 2));
  });
}

// --- Cleanup ---
async function cleanup() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }

  await disposeAll({
    sequences: [sequence],
    effects: effectsChain,
    synths: [synth],
    gui
  });

  synth = null;
  effectsChain = null;
  sequence = null;
  gui = null;
  isPlaying = false;
}

// Initialize
init();

// Vite HMR cleanup (prevents audio duplication and memory leaks)
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    await cleanup();
  });
}
