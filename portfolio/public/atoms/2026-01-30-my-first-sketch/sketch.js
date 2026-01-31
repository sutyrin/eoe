import p5 from 'p5';
import GUI from 'lil-gui';

let p5Instance;

const sketch = (p) => {
  let config = {
    bgHue: 200,
    shapeHue: 30,
    size: 100,
    speed: 1,
    noiseScale: 0.01
  };

  let time = 0;
  let gui;

  p.setup = () => {
    p.createCanvas(800, 800);
    p.colorMode(p.HSB, 360, 100, 100);
    p.noStroke();
    loadConfig();
  };

  p.draw = () => {
    p.background(config.bgHue, 30, 95);
    const x = p.width / 2 + p.noise(time) * 50 - 25;
    const y = p.height / 2 + p.noise(time + 100) * 50 - 25;
    const size = config.size + p.sin(time * config.speed) * 20;
    p.fill(config.shapeHue, 80, 90);
    p.circle(x, y, size);
    time += config.noiseScale;
  };

  async function loadConfig() {
    try {
      const response = await fetch('./config.json');
      const saved = await response.json();
      Object.assign(config, saved.controllers || saved);
    } catch (e) {
      console.log('No saved config, using defaults');
    }
    setupGUI();
  }

  function setupGUI() {
    gui = new GUI({ title: 'my-first-sketch Parameters' });
    gui.add(config, 'bgHue', 0, 360).name('Background Hue');
    gui.add(config, 'shapeHue', 0, 360).name('Shape Hue');
    gui.add(config, 'size', 50, 200).name('Size');
    gui.add(config, 'speed', 0.1, 5).name('Speed');
    gui.add(config, 'noiseScale', 0.001, 0.1).name('Noise Scale');

    gui.onChange(() => {
      console.log('Copy to config.json:', JSON.stringify({ controllers: config }, null, 2));
    });
  }
};

p5Instance = new p5(sketch);

// Vite HMR cleanup (prevents canvas duplication)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    }
  });
}
