import p5 from 'p5';
import * as Tone from 'tone';
import GUI from 'lil-gui';
import {
  CompositionManager,
  createSynth,
  createEffectsChain,
  createSequence,
  AudioDataProvider,
  applyMapping
} from '../../lib/audio/index.js';

// --- State ---
let manager = null;
let audioDataProvider = null;
let p5Instance = null;
let gui = null;
let positionInterval = null;

// --- Config ---
let config = {
  // Composition metadata
  title: 'test-comp-task1',

  // Transport
  transport: {
    bpm: 120,
    timeSignature: 4,
    loopLength: 4  // Loop after 4 measures (0 = no loop)
  },

  // Audio atoms
  audio: {
    lead: {
      synth: {
        type: 'mono',
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.8 }
      },
      sequence: {
        notes: ['C4', 'E4', 'G4', 'B4', 'C5', null, 'G4', 'E4'],
        duration: '8n',
        interval: '8n'
      },
      effects: {
        reverb: { decay: 2.5, wet: 0.3 },
        delay: { delayTime: 0.25, feedback: 0.15, wet: 0.2 }
      }
    },
    bass: {
      synth: {
        type: 'mono',
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.5 }
      },
      sequence: {
        notes: ['C2', null, 'C2', null, 'G2', null, 'G2', null],
        duration: '4n',
        interval: '8n'
      },
      effects: {}
    }
  },

  // Visual parameters
  visual: {
    bgHue: 240,
    baseSize: 80,
    bassSizeScale: 150,
    midsHueShift: 120,
    beatFlash: 0.6
  },

  // Analysis
  analysis: {
    fftSize: 1024,
    smoothing: 0.8,
    outputSmoothing: 0.15,
    beatThreshold: 0.15
  }
};

async function init() {
  // Load config
  try {
    const response = await fetch('./config.json');
    const saved = await response.json();
    config = deepMerge(config, saved);
  } catch (e) {
    console.log('No saved config, using defaults');
  }

  // Create composition manager
  manager = new CompositionManager(config.transport);

  // Setup audio atoms
  setupAudioAtoms();

  // Setup visual atom
  setupVisualAtom();

  // Setup GUI
  setupGUI();

  // Setup transport buttons
  setupTransportControls();
}

function setupAudioAtoms() {
  // A Gain node to mix all audio atoms together before analysis
  const mixBus = new Tone.Gain(1).toDestination();

  for (const [name, atomConfig] of Object.entries(config.audio)) {
    // Create effects chain
    const effects = createEffectsChain(atomConfig.effects || {});
    effects.output.connect(mixBus);

    // Create synth
    const synth = createSynth(atomConfig.synth || {});
    synth.connect(effects.chain);

    // Create sequence
    const sequence = createSequence(synth, atomConfig.sequence || {});

    // Register with manager
    manager.addAudioAtom(name, {
      node: synth,
      sequences: [sequence],
      effects,
      async dispose() {
        sequence.stop();
        sequence.dispose();
        await new Promise(r => setTimeout(r, 50));
        synth.dispose();
        effects.dispose();
      }
    });
  }

  // Create AudioDataProvider on the mix bus (analyzes combined output)
  audioDataProvider = new AudioDataProvider(mixBus, config.analysis);
}

function setupVisualAtom() {
  const sketch = (p) => {
    let time = 0;

    p.setup = () => {
      const container = document.getElementById('canvas-container');
      const canvas = p.createCanvas(800, 800);
      canvas.parent(container);
      p.colorMode(p.HSB, 360, 100, 100, 100);
      p.noStroke();
    };

    p.draw = () => {
      const audio = audioDataProvider ? audioDataProvider.update() : {
        bass: 0, mid: 0, treble: 0, mids: 0, energy: 0, beat: 0, envelope: 0, highMid: 0
      };
      const v = config.visual;

      // Background
      p.background(v.bgHue, 15, 8 + audio.envelope * 4);

      // Beat flash
      if (audio.beat > 0.1) {
        p.fill(0, 0, 100, audio.beat * v.beatFlash * 80);
        p.rect(0, 0, p.width, p.height);
      }

      p.push();
      p.translate(p.width / 2, p.height / 2);

      // Outer ring: driven by bass
      const ringRadius = applyMapping(audio.bass, {
        min: v.baseSize,
        max: v.baseSize + v.bassSizeScale,
        curve: 'cubicOut'
      });
      const numRing = 16;
      for (let i = 0; i < numRing; i++) {
        const angle = (p.TWO_PI / numRing) * i + time * 0.3;
        const x = p.cos(angle) * ringRadius;
        const y = p.sin(angle) * ringRadius;
        const hue = (v.bgHue + v.midsHueShift * audio.mids + i * (360 / numRing)) % 360;
        const sz = 12 + audio.bass * 25;
        p.fill(hue, 65, 85, 70 + audio.energy * 30);
        p.circle(x, y, sz);
      }

      // Inner particles: driven by mids and treble
      const innerCount = 8 + Math.floor(audio.highMid * 16);
      for (let i = 0; i < innerCount; i++) {
        const angle = (p.TWO_PI / innerCount) * i - time * 0.5;
        const r = 30 + audio.mid * 60;
        const x = p.cos(angle) * r;
        const y = p.sin(angle) * r;
        const hue = (v.bgHue + 180 + audio.treble * 90 + i * 15) % 360;
        p.fill(hue, 80, 90, 50 + audio.treble * 40);
        p.circle(x, y, 6 + audio.treble * 10);
      }

      // Center core: pulsing with envelope
      const coreSize = 20 + audio.envelope * 50;
      p.fill((v.bgHue + 60) % 360, 40, 95, 90);
      p.circle(0, 0, coreSize);

      p.pop();
      time += 0.016;
    };
  };

  p5Instance = new p5(sketch);

  manager.addVisualAtom('main', {
    instance: p5Instance,
    dispose() {
      if (p5Instance) {
        p5Instance.remove();
        p5Instance = null;
      }
    }
  });
}

function setupTransportControls() {
  const playBtn = document.getElementById('playBtn');
  const stopBtn = document.getElementById('stopBtn');
  const positionEl = document.getElementById('position');

  playBtn.addEventListener('click', async () => {
    if (!manager.isPlaying) {
      await manager.start();
      playBtn.classList.add('active');

      positionInterval = setInterval(() => {
        positionEl.textContent = manager.getPosition();
      }, 100);
    }
  });

  stopBtn.addEventListener('click', () => {
    if (manager.isPlaying) {
      manager.stop();
      playBtn.classList.remove('active');
      if (audioDataProvider) audioDataProvider.reset();

      if (positionInterval) {
        clearInterval(positionInterval);
        positionInterval = null;
      }
      positionEl.textContent = '0:0:0';
    }
  });
}

function setupGUI() {
  gui = new GUI({ title: config.title });

  // Transport
  const transportFolder = gui.addFolder('Transport');
  transportFolder.add(config.transport, 'bpm', 40, 200).step(1).name('BPM')
    .onChange(val => { Tone.getTransport().bpm.value = val; });

  // Visual mapping
  const visualFolder = gui.addFolder('Visual');
  visualFolder.add(config.visual, 'bgHue', 0, 360).name('Background Hue');
  visualFolder.add(config.visual, 'baseSize', 20, 200).name('Base Size');
  visualFolder.add(config.visual, 'bassSizeScale', 0, 400).name('Bass Scale');
  visualFolder.add(config.visual, 'midsHueShift', 0, 360).name('Mids Hue');
  visualFolder.add(config.visual, 'beatFlash', 0, 1).name('Beat Flash');

  gui.onChange(() => {
    console.log('Copy to config.json:', JSON.stringify(config, null, 2));
  });
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// --- Cleanup ---
async function cleanup() {
  if (positionInterval) {
    clearInterval(positionInterval);
    positionInterval = null;
  }

  if (audioDataProvider) {
    audioDataProvider.dispose();
    audioDataProvider = null;
  }

  if (manager) {
    await manager.dispose();
    manager = null;
  }

  if (gui) {
    gui.destroy();
    gui = null;
  }
}

// Initialize
init();

// Vite HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    await cleanup();
  });
}
