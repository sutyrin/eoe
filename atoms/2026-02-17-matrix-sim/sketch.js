import p5 from 'p5';
import GUI from 'lil-gui';

let p5Instance;

const sketch = (p) => {
  let config = {
    stress: 55,
    zionEnabled: true,
    simSpeed: 1,
    rainOpacity: 0.6,
    gridCols: 40,
    gridRows: 20
  };

  // --- Simulation state ---
  let processors = [];
  let totalPopulation = 0;
  let zionPopulation = 0;
  let anomalyCount = 0;
  let computeOutput = 0;
  let tickCount = 0;
  let neoEvents = 0;
  let cascadeFailure = false;
  let neoFlashTimer = 0;
  let discoveries = new Set();

  // Sparkline histories
  let computeHistory = [];
  let anomalyHistory = [];
  let awakeningHistory = [];
  const HISTORY_LEN = 200;

  // Matrix rain
  let rainDrops = [];
  const RAIN_COUNT = 120;

  let gui;

  // --- Processor states ---
  const STATE = {
    NORMAL: 0,
    AWAKENING: 1,
    ANOMALY: 2,
    ZION: 3,
    NEO: 4
  };

  p.setup = () => {
    p.createCanvas(900, 700);
    p.textFont('monospace');
    loadConfig();
    initRain();
    initProcessors();
  };

  function initProcessors() {
    processors = [];
    totalPopulation = config.gridCols * config.gridRows;
    zionPopulation = 0;
    anomalyCount = 0;
    neoEvents = 0;
    cascadeFailure = false;
    tickCount = 0;
    discoveries = new Set();
    computeHistory = [];
    anomalyHistory = [];
    awakeningHistory = [];

    for (let i = 0; i < totalPopulation; i++) {
      processors.push({
        state: STATE.NORMAL,
        productivity: 0.5 + p.random(0.5),
        hackAffinity: p.random(1),
        awakeningProgress: 0,
        pulsePhase: p.random(p.TWO_PI)
      });
    }
  }

  function initRain() {
    rainDrops = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      rainDrops.push({
        x: p.random(p.width),
        y: p.random(p.height),
        speed: p.random(2, 8),
        char: String.fromCharCode(0x30A0 + p.floor(p.random(96))),
        brightness: p.random(80, 255),
        size: p.random(10, 16)
      });
    }
  }

  // --- Simulation tick ---
  function simulate() {
    if (cascadeFailure) return;

    tickCount++;
    let stressNorm = config.stress / 100;

    // Productivity: Gaussian centered at ~0.6 stress
    let optimalStress = 0.6;
    let sigma = 0.25;
    let stressEff = Math.exp(-Math.pow(stressNorm - optimalStress, 2) / (2 * sigma * sigma));

    let totalCompute = 0;
    let awakenings = 0;
    anomalyCount = 0;

    for (let proc of processors) {
      if (proc.state === STATE.ZION || proc.state === STATE.NEO) continue;

      // Awakening pressure: higher stress + higher hack affinity = faster awakening
      let awakeningRate = stressNorm * 0.003 * (1 + proc.hackAffinity * 2);
      proc.awakeningProgress += awakeningRate;

      if (proc.state === STATE.NORMAL && proc.awakeningProgress > 0.7) {
        proc.state = STATE.AWAKENING;
      }

      if (proc.state === STATE.AWAKENING && proc.awakeningProgress > 1.0) {
        if (config.zionEnabled && p.random(1) < 0.6) {
          proc.state = STATE.ZION;
          zionPopulation++;
          awakenings++;
        } else {
          proc.state = STATE.ANOMALY;
          anomalyCount++;
        }
      }

      if (proc.state === STATE.ANOMALY) {
        anomalyCount++;
        // Anomalies can spread instability to neighbors
        if (p.random(1) < 0.01 * stressNorm) {
          let neighbor = processors[p.floor(p.random(processors.length))];
          if (neighbor.state === STATE.NORMAL) {
            neighbor.awakeningProgress += 0.1;
          }
        }
      }

      if (proc.state === STATE.NORMAL || proc.state === STATE.AWAKENING) {
        totalCompute += proc.productivity * stressEff;
      }
    }

    computeOutput = totalCompute / totalPopulation;

    // Neo event: statistical inevitability
    let activeHackers = processors.filter(
      (proc) => proc.state === STATE.AWAKENING && proc.hackAffinity > 0.95
    );
    for (let hacker of activeHackers) {
      if (p.random(1) < 0.002 * hacker.hackAffinity * stressNorm) {
        hacker.state = STATE.NEO;
        neoEvents++;
        neoFlashTimer = 30;
      }
    }

    // Cascade failure: too many anomalies
    let anomalyRatio = anomalyCount / totalPopulation;
    if (anomalyRatio > 0.3) {
      cascadeFailure = true;
    }

    // Track history
    pushHistory(computeHistory, computeOutput);
    pushHistory(anomalyHistory, anomalyRatio);
    pushHistory(awakeningHistory, awakenings);

    // Discovery checks
    checkDiscoveries(stressNorm, anomalyRatio);
  }

  function pushHistory(arr, val) {
    arr.push(val);
    if (arr.length > HISTORY_LEN) arr.shift();
  }

  function checkDiscoveries(stressNorm, anomalyRatio) {
    if (stressNorm < 0.15 && computeOutput < 0.2) {
      discoveries.add('Paradise is unproductive: low stress = idle brains');
    }
    if (stressNorm > 0.85 && anomalyRatio > 0.1) {
      discoveries.add('Hell is unstable: high stress = mass awakenings');
    }
    if (stressNorm > 0.5 && stressNorm < 0.7 && computeOutput > 0.35) {
      discoveries.add('Optimal stress ~60%: the machines need tension, not peace');
    }
    if (!config.zionEnabled && anomalyRatio > 0.15) {
      discoveries.add('Without Zion, anomalies accumulate — no pressure valve');
    }
    if (config.zionEnabled && anomalyRatio < 0.05 && zionPopulation > 10) {
      discoveries.add('Zion stabilizes: resistance IS the control mechanism');
    }
    if (neoEvents > 0) {
      discoveries.add('Neo is not prophecy — just statistics on large numbers');
    }
    if (cascadeFailure) {
      discoveries.add('Cascade failure: the Matrix crashes when anomalies exceed 30%');
    }
  }

  // --- Drawing ---
  p.draw = () => {
    p.background(0);

    // Run simulation ticks per frame
    let ticks = Math.max(1, Math.round(config.simSpeed));
    for (let i = 0; i < ticks; i++) {
      simulate();
    }

    drawRain();
    drawGrid();
    drawStats();
    drawSparklines();
    drawDiscoveries();

    if (neoFlashTimer > 0) {
      drawNeoFlash();
      neoFlashTimer--;
    }

    if (cascadeFailure) {
      drawCascade();
    }
  };

  function drawRain() {
    let stressNorm = config.stress / 100;
    let speed = 1 + stressNorm * 3;
    let alpha = config.rainOpacity * (0.3 + stressNorm * 0.7);

    for (let drop of rainDrops) {
      drop.y += drop.speed * speed;
      if (drop.y > p.height) {
        drop.y = -20;
        drop.x = p.random(p.width);
        drop.char = String.fromCharCode(0x30A0 + p.floor(p.random(96)));
      }

      p.fill(0, drop.brightness * alpha, 0);
      p.textSize(drop.size);
      p.text(drop.char, drop.x, drop.y);
    }
  }

  function drawGrid() {
    let gridX = 30;
    let gridY = 60;
    let gridW = 540;
    let gridH = 360;
    let cellW = gridW / config.gridCols;
    let cellH = gridH / config.gridRows;

    p.noStroke();

    for (let i = 0; i < processors.length; i++) {
      let col = i % config.gridCols;
      let row = Math.floor(i / config.gridCols);
      let x = gridX + col * cellW;
      let y = gridY + row * cellH;
      let proc = processors[i];

      let pulse = 0.7 + 0.3 * p.sin(p.frameCount * 0.05 + proc.pulsePhase);

      switch (proc.state) {
        case STATE.NORMAL: {
          let bright = proc.productivity * pulse * 200;
          p.fill(0, bright, 0);
          break;
        }
        case STATE.AWAKENING: {
          let t = proc.awakeningProgress;
          p.fill(255 * t * pulse, 180 * (1 - t) * pulse, 0);
          break;
        }
        case STATE.ANOMALY: {
          let flicker = cascadeFailure ? p.random(100, 255) : 180 * pulse;
          p.fill(flicker, 0, 0);
          break;
        }
        case STATE.ZION: {
          p.fill(120 * pulse, 40 * pulse, 200 * pulse);
          break;
        }
        case STATE.NEO: {
          p.fill(255, 255, 0);
          break;
        }
      }

      let margin = 1;
      p.rect(x + margin, y + margin, cellW - margin * 2, cellH - margin * 2, 2);
    }

    // Grid border
    p.noFill();
    p.stroke(0, 80, 0);
    p.strokeWeight(1);
    p.rect(gridX, gridY, gridW, gridH);
    p.noStroke();
  }

  function drawStats() {
    let x = 600;
    let y = 60;
    let lineH = 22;

    p.fill(0, 200, 0);
    p.textSize(14);
    p.textAlign(p.LEFT);

    let active = processors.filter(
      (proc) => proc.state === STATE.NORMAL || proc.state === STATE.AWAKENING
    ).length;
    let anomalies = processors.filter((proc) => proc.state === STATE.ANOMALY).length;

    p.text(`TICK: ${tickCount}`, x, y);
    p.text(`ACTIVE PROCESSORS: ${active}`, x, y + lineH);

    p.fill(120, 40, 200);
    p.text(`ZION POPULATION: ${zionPopulation}`, x, y + lineH * 2);

    p.fill(200, 0, 0);
    p.text(`ANOMALIES: ${anomalies}`, x, y + lineH * 3);

    p.fill(0, 200, 0);
    p.text(`COMPUTE OUTPUT: ${(computeOutput * 100).toFixed(1)}%`, x, y + lineH * 4);

    p.fill(255, 255, 0);
    p.text(`NEO EVENTS: ${neoEvents}`, x, y + lineH * 5);

    if (cascadeFailure) {
      p.fill(255, 0, 0);
      p.textSize(18);
      p.text('CASCADE FAILURE', x, y + lineH * 7);
    }

    // Legend
    let ly = y + lineH * 9;
    p.textSize(11);
    let legend = [
      { color: [0, 150, 0], label: 'Normal' },
      { color: [200, 140, 0], label: 'Awakening' },
      { color: [180, 0, 0], label: 'Anomaly' },
      { color: [120, 40, 200], label: 'Zion' },
      { color: [255, 255, 0], label: 'Neo' }
    ];
    for (let item of legend) {
      p.fill(...item.color);
      p.rect(x, ly - 8, 10, 10, 2);
      p.fill(150);
      p.text(item.label, x + 16, ly);
      ly += 16;
    }

    // Reset button hint
    p.fill(80);
    p.textSize(10);
    p.text('Press R to reset', x, ly + 10);
  }

  function drawSparklines() {
    let x = 600;
    let y = 380;
    let w = 260;
    let h = 40;
    let gap = 55;

    drawSparkline(x, y, w, h, computeHistory, [0, 200, 0], 'Compute', 0, 0.6);
    drawSparkline(x, y + gap, w, h, anomalyHistory, [200, 0, 0], 'Anomalies', 0, 0.4);
  }

  function drawSparkline(x, y, w, h, data, color, label, minVal, maxVal) {
    // Background
    p.fill(10, 15, 10);
    p.stroke(0, 60, 0);
    p.strokeWeight(1);
    p.rect(x, y, w, h, 3);

    // Label
    p.noStroke();
    p.fill(...color, 150);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text(label, x + 4, y + 11);

    if (data.length < 2) return;

    // Line
    p.stroke(...color);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < data.length; i++) {
      let px = x + (i / (HISTORY_LEN - 1)) * w;
      let val = p.constrain(data[i], minVal, maxVal);
      let py = y + h - ((val - minVal) / (maxVal - minVal)) * h;
      p.vertex(px, py);
    }
    p.endShape();
    p.noStroke();
  }

  function drawDiscoveries() {
    let x = 30;
    let y = 450;

    p.fill(0, 180, 0);
    p.textSize(13);
    p.textAlign(p.LEFT);
    p.text(`OBSERVATIONS [${discoveries.size}/7]`, x, y);

    p.textSize(11);
    let i = 0;
    for (let d of discoveries) {
      p.fill(0, 140, 0, 200);
      p.text(`> ${d}`, x, y + 20 + i * 18);
      i++;
    }
  }

  function drawNeoFlash() {
    let alpha = (neoFlashTimer / 30) * 80;
    p.fill(255, 255, 0, alpha);
    p.rect(0, 0, p.width, p.height);
  }

  function drawCascade() {
    if (p.frameCount % 3 === 0) {
      p.fill(255, 0, 0, 15);
      p.rect(0, 0, p.width, p.height);
    }
  }

  // --- Input ---
  p.keyPressed = () => {
    if (p.key === 'r' || p.key === 'R') {
      initProcessors();
    }
  };

  // --- Config ---
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
    gui = new GUI({ title: 'Matrix Simulation' });

    gui.add(config, 'stress', 0, 100, 1).name('Stress Level');
    gui.add(config, 'zionEnabled').name('Zion Enabled');
    gui.add(config, 'simSpeed', 0.5, 5, 0.5).name('Sim Speed');
    gui.add(config, 'rainOpacity', 0, 1, 0.05).name('Rain Opacity');
    gui.add({ reset: () => initProcessors() }, 'reset').name('Reset Simulation');

    gui.onChange(() => {
      console.log(
        'Copy to config.json:',
        JSON.stringify({ controllers: config }, null, 2)
      );
    });
  }
};

p5Instance = new p5(sketch);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (p5Instance) {
      p5Instance.remove();
      p5Instance = null;
    }
  });
}
