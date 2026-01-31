import p5 from 'p5';
import GUI from 'lil-gui';
import { initAudio, startAudio, stopAudio, getAudioData, cleanupAudio } from './audio.js';
import { applyMapping } from '../../lib/audio/smoothing.js';

let p5Instance;

const sketch = (p) => {
  // --- Config ---
  let config = {
    // Visual parameters
    bgHue: 240,
    baseSize: 100,
    particleCount: 60,
    rotationSpeed: 0.5,

    // Audio-visual mapping
    bassSizeScale: 200,
    midsHueShift: 120,
    trebleDetail: 8,
    beatFlash: 0.8,

    // Audio config
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
      reverb: { decay: 3.0, wet: 0.4 }
    },
    transport: { bpm: 120 },
    analysis: {
      fftSize: 1024,
      smoothing: 0.8,
      outputSmoothing: 0.15,
      beatThreshold: 0.15
    }
  };

  let gui;
  let time = 0;
  let audioInitialized = false;

  p.setup = () => {
    p.createCanvas(800, 800);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.noStroke();
    loadConfig();
  };

  p.draw = () => {
    const audio = getAudioData();

    // Background: subtle darkening based on envelope
    const bgBrightness = 8 + audio.envelope * 5;
    p.background(config.bgHue, 20, bgBrightness);

    // Beat flash overlay
    if (audio.beat > 0.1) {
      p.fill(0, 0, 100, audio.beat * config.beatFlash * 100);
      p.rect(0, 0, p.width, p.height);
    }

    p.push();
    p.translate(p.width / 2, p.height / 2);

    // Rotation driven by treble
    const rotation = time * config.rotationSpeed + audio.treble * Math.PI;
    p.rotate(rotation);

    // Number of elements driven by treble detail
    const numElements = Math.floor(config.trebleDetail + audio.highMid * 12);

    // Size driven by bass
    const size = applyMapping(audio.bass, {
      min: config.baseSize * 0.5,
      max: config.baseSize + config.bassSizeScale,
      curve: 'cubicOut'
    });

    // Draw audio-reactive ring of circles
    for (let i = 0; i < numElements; i++) {
      const angle = (p.TWO_PI / numElements) * i;
      const radius = size + audio.mid * 50;

      const x = p.cos(angle) * radius;
      const y = p.sin(angle) * radius;

      // Hue shifts with mids
      const hue = (config.bgHue + config.midsHueShift * audio.mids + i * (360 / numElements)) % 360;
      const elementSize = 10 + audio.bass * 30 + p.sin(time + i) * 5;
      const alpha = 60 + audio.energy * 40;

      p.fill(hue, 70 + audio.treble * 30, 80 + audio.envelope * 20, alpha);
      p.circle(x, y, elementSize);
    }

    // Inner pulsing core
    const coreSize = 30 + audio.envelope * 60 + audio.bass * 40;
    const coreHue = (config.bgHue + 180 + audio.mids * config.midsHueShift) % 360;
    p.fill(coreHue, 60, 90, 80);
    p.circle(0, 0, coreSize);

    p.pop();

    time += 0.02;
  };

  async function loadConfig() {
    try {
      const response = await fetch('./config.json');
      const saved = await response.json();
      // Merge saved config (preserving nested objects)
      config = deepMerge(config, saved);
    } catch (e) {
      console.log('No saved config, using defaults');
    }

    // Initialize audio with config
    initAudio(config);
    audioInitialized = true;

    setupGUI();
    setupTransportButtons();
  }

  function setupTransportButtons() {
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');

    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        await startAudio(config.transport.bpm);
        playBtn.classList.add('active');
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        stopAudio();
        if (playBtn) playBtn.classList.remove('active');
      });
    }
  }

  function setupGUI() {
    gui = new GUI({ title: 'av1' });

    // Visual controls
    const visFolder = gui.addFolder('Visual');
    visFolder.add(config, 'bgHue', 0, 360).name('Background Hue');
    visFolder.add(config, 'baseSize', 30, 300).name('Base Size');
    visFolder.add(config, 'particleCount', 10, 100).step(1).name('Particles');
    visFolder.add(config, 'rotationSpeed', 0, 3).name('Rotation');

    // Audio-visual mapping controls
    const mapFolder = gui.addFolder('Audio Mapping');
    mapFolder.add(config, 'bassSizeScale', 0, 500).name('Bass -> Size');
    mapFolder.add(config, 'midsHueShift', 0, 360).name('Mids -> Hue');
    mapFolder.add(config, 'trebleDetail', 3, 24).step(1).name('Treble -> Detail');
    mapFolder.add(config, 'beatFlash', 0, 1).name('Beat Flash');

    // Transport
    const transportFolder = gui.addFolder('Transport');
    transportFolder.add(config.transport, 'bpm', 40, 200).step(1).name('BPM');

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
};

p5Instance = new p5(sketch);

// Vite HMR cleanup
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    await cleanupAudio();
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    }
  });
}
