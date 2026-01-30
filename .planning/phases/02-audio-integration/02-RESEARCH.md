# Phase 2: Audio Integration - Research

**Researched:** 2026-01-30
**Status:** Complete

---

## 1. Tone.js Audio Atom Architecture

### Overview

Tone.js is a Web Audio framework designed for creating interactive music in the browser. It provides high-level DAW-like features (global transport, scheduling, prebuilt synths/effects) while also offering low-level building blocks for custom synthesis and control signals.

### Synth Instance Patterns

**Monophonic vs. Polyphonic:**
- All Tone.js synths (FMSynth, AMSynth, NoiseSynth, etc.) are **monophonic** by default - they can only produce a single note at a time
- Use `Tone.PolySynth` wrapper to convert any synth into a polyphonic version
- PolySynth creates multiple copies of a synth and handles attack/release triggering across voices

**Template Pattern for Audio Atoms:**
```javascript
import * as Tone from 'tone';

let synthInstance;
let gui;

async function initAudio() {
  // CRITICAL: User gesture required before audio plays
  await Tone.start();

  // Load config from JSON
  const config = await loadConfig();

  // Create synth with config parameters
  synthInstance = new Tone.Synth({
    oscillator: { type: config.oscType },
    envelope: {
      attack: config.attack,
      decay: config.decay,
      sustain: config.sustain,
      release: config.release
    }
  }).toDestination();

  setupGUI(config);
}

async function loadConfig() {
  try {
    const response = await fetch('./config.json');
    return await response.json();
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

// Cleanup pattern - CRITICAL for resource management
function cleanup() {
  if (synthInstance) {
    synthInstance.dispose();
    synthInstance = null;
  }
  if (gui) {
    gui.destroy();
    gui = null;
  }
}
```

### Sequence and Event Scheduling

**Event Classes:**
- `Tone.Event`: Single event at a specific time
- `Tone.Loop`: Simplified repeating event (defined by interval, loops by default)
- `Tone.Sequence`: Sequential events with simplified notation
- `Tone.Part`: Collection of multiple ToneEvents that start/stop/loop as a unit
- `Tone.Pattern`: Arpeggio and pattern generation

**Example:**
```javascript
const sequence = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C4', 'E4', 'G4', 'B4'], '4n');

sequence.start(0);
Tone.Transport.start();
```

### Audio Context Initialization

**Browser Autoplay Policy:**
- Browsers will NOT play audio until a user interaction (click, keydown)
- ALWAYS call `Tone.start()` from an event listener triggered by user action
- Check `Tone.context.state` and call `resume()` if needed

**Example:**
```javascript
document.querySelector('#playButton').addEventListener('click', async () => {
  await Tone.start();
  console.log('Audio context started');
});
```

### Parameter Configuration Pattern

**JSON-based Config:**
```json
{
  "synth": {
    "oscillator": { "type": "sine" },
    "envelope": { "attack": 0.01, "decay": 0.2, "sustain": 0.5, "release": 1.0 }
  },
  "sequence": {
    "notes": ["C4", "E4", "G4"],
    "duration": "8n",
    "interval": "4n"
  },
  "effects": {
    "reverb": { "decay": 2.5, "wet": 0.3 },
    "delay": { "delayTime": 0.25, "feedback": 0.2 }
  }
}
```

### Cleanup and Disposal

**Critical Pattern:**
- Call `.dispose()` on all Tone.js objects (synths, effects, sequences, signals)
- Disposing disconnects Web Audio nodes and frees them for garbage collection
- **WARNING:** Disposing a synth before scheduled note releases will throw errors
- **Best practice:** Stop all scheduled events → release all notes → dispose

**Known Issues:**
- Memory leaks can occur with `Tone.Player` and `Tone.Buffer` even after disposal
- CPU usage can creep up with multiple synths running (monitor and optimize)
- Ensure no dangling references in your code after calling `.dispose()`

---

## 2. Frequency Analysis & Visualization

### AnalyserNode Fundamentals

**Web Audio API AnalyserNode:**
- Provides real-time frequency and time-domain analysis
- Uses Fast Fourier Transform (FFT) to convert time-domain to frequency-domain
- Default FFT size: 2048 (configurable via `fftSize` property)
- Output range: 0 to 255 (unsigned byte values)

**Key Methods:**
```javascript
const analyser = new Tone.Analyser('fft', 1024);
synth.connect(analyser);

// In animation loop:
const frequencyData = analyser.getValue(); // Uint8Array
```

### Frequency Band Extraction

**Frequency Distribution:**
- Frequencies spread linearly from 0 to Nyquist frequency (sampleRate / 2)
- For 48kHz sample rate: last array item represents 24kHz
- Divide array into bands (bass, mid, treble) by index ranges

**Example Band Mapping:**
```javascript
const fftSize = 1024;
const binCount = fftSize / 2;
const sampleRate = 48000;
const binWidth = sampleRate / fftSize; // ~47Hz per bin

// Bass: 20-250Hz (bins 0-5)
// Low-mid: 250-500Hz (bins 5-11)
// Mid: 500-2000Hz (bins 11-43)
// High-mid: 2000-4000Hz (bins 43-85)
// Treble: 4000-8000Hz (bins 85-170)
```

### Normalization and Scaling

**minDecibels / maxDecibels:**
- `minDecibels`: Minimum power value for FFT scaling (default: -100dB)
- `maxDecibels`: Maximum power value for FFT scaling (default: -30dB)
- Values below minDecibels → 0
- Values above maxDecibels → 255
- Adjust these to control sensitivity

**Normalize to 0-1 Range:**
```javascript
function normalizeFrequencyData(byteArray) {
  return byteArray.map(value => value / 255);
}
```

### Smoothing and Jitter Reduction

**smoothingTimeConstant:**
- AnalyserNode property: 0 to 1 (default: 0.8)
- Higher value = more smoothing, slower response
- Lower value = less smoothing, faster response (more jitter)
- **0:** No moving average (very jittery)
- **1:** Maximum averaging (very smooth, laggy)

**Example:**
```javascript
analyser.smoothingTimeConstant = 0.8; // Good balance
```

**Additional Smoothing Techniques:**
- Linear interpolation (lerp) between current and target values
- Exponential moving average
- Low-pass filter on output values
- Frame-to-frame delta clamping (prevent large jumps)

### Beat Detection Patterns

**Spectral Flux Algorithm:**
1. Calculate frequency spectrum at each frame
2. Compare current frame to previous frame
3. Sum positive differences (increase in energy)
4. Apply threshold: if flux > threshold, register beat

**Example Implementation:**
```javascript
let prevSpectrum = new Uint8Array(analyser.frequencyBinCount);

function detectBeat(currentSpectrum, threshold = 50) {
  let flux = 0;
  for (let i = 0; i < currentSpectrum.length; i++) {
    const diff = currentSpectrum[i] - prevSpectrum[i];
    if (diff > 0) flux += diff;
  }
  prevSpectrum.set(currentSpectrum);
  return flux > threshold;
}
```

**Onset Detection:**
- Peak detection: Find local maxima in energy envelope
- Adaptive thresholding: Adjust threshold based on recent history
- Spectral difference: Compare magnitude spectrum changes
- Phase-based: Weighted phase deviation detection
- Complex domain: Complex difference analysis

**Existing Libraries:**
- `web-audio-beat-detector` (GitHub: chrisguttandin/web-audio-beat-detector)
- `BeatDetector` (GitHub: stasilo/BeatDetector) - configurable sensitivity and FFT size

### Envelope Follower Implementation

**Basic Envelope Tracker:**
```javascript
function envelopeFollower(spectrum, attack = 0.1, release = 0.3) {
  const energy = spectrum.reduce((sum, val) => sum + val, 0) / spectrum.length;

  if (energy > currentEnvelope) {
    // Attack phase
    currentEnvelope += (energy - currentEnvelope) * attack;
  } else {
    // Release phase
    currentEnvelope += (energy - currentEnvelope) * release;
  }

  return currentEnvelope / 255; // Normalize to 0-1
}
```

---

## 3. Audio-Visual Binding

### Integration with p5.js (via p5.sound)

**Recent Development (2024-2025):**
- p5.sound.js library was completely revamped in 2024
- Now built as a **wrapper for Tone.js**
- `p5.Oscillator` creates instances of `Tone.Oscillator` under the hood
- Simplifies integration between Tone.js audio and p5.js visuals

**Pattern for Passing Audio Data to Sketches:**
```javascript
// Audio atom (audio.js)
const analyser = new Tone.Analyser('fft', 512);
synth.connect(analyser);

export function getAudioData() {
  const spectrum = analyser.getValue();
  const bass = getFrequencyBand(spectrum, 0, 5);
  const mid = getFrequencyBand(spectrum, 5, 40);
  const treble = getFrequencyBand(spectrum, 40, 100);

  return {
    spectrum: Array.from(spectrum),
    bass: normalizeBand(bass),
    mid: normalizeBand(mid),
    treble: normalizeBand(treble),
    energy: getOverallEnergy(spectrum)
  };
}

// Visual atom (sketch.js)
import { getAudioData } from './audio.js';

const sketch = (p) => {
  p.draw = () => {
    const audio = getAudioData();
    const size = p.map(audio.bass, 0, 1, 50, 300);
    const hue = p.map(audio.mid, 0, 1, 0, 360);
    p.circle(p.width/2, p.height/2, size);
  };
};
```

### Normalization Strategy

**0-1 Range Conversion:**
- FFT data arrives as 0-255 (unsigned byte)
- Divide by 255 for 0-1 normalization
- Apply `minDecibels`/`maxDecibels` for sensitivity control
- Consider logarithmic scaling for perceptually linear response

**Example:**
```javascript
function normalizeFrequency(byteValue, min = 0, max = 255) {
  return (byteValue - min) / (max - min);
}
```

### Easing Curves for Smoothness

**Apply Easing to Audio-Driven Parameters:**
```javascript
// Linear interpolation (lerp)
function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Ease-out cubic
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Usage in draw loop
let currentSize = 100;
const targetSize = audio.bass * 200;
currentSize = lerp(currentSize, targetSize, 0.1); // Smooth approach
```

**Easing Libraries:**
- Built-in: `p5.js` lerp(), map() with easing
- External: `gsap` for advanced easing
- Custom: Implement Robert Penner's easing equations

### Synchronization Timing

**requestAnimationFrame + Audio Clock:**
- Visual frame rate: ~60fps (16.67ms per frame)
- Audio sample rate: 44100 or 48000 Hz (microsecond precision)
- **Problem:** RAF and audio clocks are independent

**Solution Pattern:**
```javascript
// Use Tone.Transport time for both audio and visual events
function draw() {
  requestAnimationFrame(draw);

  const audioTime = Tone.Transport.seconds;
  const visualTime = performance.now() / 1000;

  // Use audioTime for timing-critical visuals
  // Use visualTime for frame-based animations
}
```

**Best Practice:**
- Schedule visual events via `Tone.Transport.schedule()` for beat-sync
- Use `requestAnimationFrame` for continuous visual updates
- Pull audio analysis data every frame (already time-aligned)

---

## 4. Composition Pattern (Nested Code)

### Parent-Child Orchestration

**Pattern: Composition Atom Structure**
```
composition-atom/
  ├── index.html
  ├── index.js (parent orchestrator)
  ├── audio.js (audio atom instance)
  ├── visual.js (visual atom instance)
  └── config.json (composition-level config)
```

**Parent Orchestrator Pattern:**
```javascript
// index.js (composition atom)
import { createAudioAtom } from './audio.js';
import { createVisualAtom } from './visual.js';

let audio, visual, config;

async function init() {
  config = await loadConfig();

  // Initialize child atoms
  audio = await createAudioAtom(config.audio);
  visual = await createVisualAtom(config.visual, document.getElementById('canvas'));

  // Bind audio data to visual parameters
  bindAudioToVisual(audio, visual);

  // Start composition
  startComposition();
}

function bindAudioToVisual(audioAtom, visualAtom) {
  function updateLoop() {
    const audioData = audioAtom.getAnalysis();
    visualAtom.updateParams({
      size: audioData.bass,
      color: audioData.mid,
      rotation: audioData.treble
    });
    requestAnimationFrame(updateLoop);
  }
  updateLoop();
}

function startComposition() {
  Tone.Transport.start();
}

// Cleanup composition
function dispose() {
  audio.dispose();
  visual.dispose();
  Tone.Transport.stop();
}
```

### Beat-Based Scheduling with Tone.Transport

**Transport Features:**
- Tempo-relative scheduling: "4n", "8n", "1m" (quarter note, eighth note, one measure)
- BPM control: `Tone.Transport.bpm.value = 120`
- Time changes and tempo curves supported
- **Critical:** Transport time is independent of wall-clock time

**Scheduling Methods:**
```javascript
// Schedule single event
Tone.Transport.schedule((time) => {
  visual.triggerAnimation(time);
}, '0:0:0'); // Bar:Beat:Sixteenth

// Schedule repeating event
Tone.Transport.scheduleRepeat((time) => {
  visual.pulse(time);
}, '4n'); // Every quarter note

// Schedule once
Tone.Transport.scheduleOnce((time) => {
  visual.flash(time);
}, '2m'); // At 2 measures
```

**Lookahead Scheduling:**
- Transport schedules events in advance (configurable lookahead time)
- Scheduling further ahead improves performance (easier for audio thread)
- Adjust via `Tone.context.lookAhead` (default: 0.1 seconds)

### Managing Multiple Synths + Sketches

**Resource Management Pattern:**
```javascript
class CompositionManager {
  constructor() {
    this.audioAtoms = [];
    this.visualAtoms = [];
  }

  async addAudioAtom(config) {
    const atom = await createAudioAtom(config);
    this.audioAtoms.push(atom);
    return atom;
  }

  async addVisualAtom(config, container) {
    const atom = await createVisualAtom(config, container);
    this.visualAtoms.push(atom);
    return atom;
  }

  start() {
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
  }

  dispose() {
    this.audioAtoms.forEach(atom => atom.dispose());
    this.visualAtoms.forEach(atom => atom.dispose());
    this.audioAtoms = [];
    this.visualAtoms = [];
  }
}
```

**Isolation Strategy:**
- Each visual atom runs in its own p5 instance (instance mode)
- Each audio atom has its own Tone.js nodes (connected to shared destination)
- Use Tone.js Groups/Channels for mixing multiple audio sources
- Coordinate timing via shared Transport

### Playback Timing Precision for Video Capture

**Critical Requirements:**
- Deterministic playback: Same audio output every time
- Frame-accurate synchronization: Audio and visual must align perfectly
- Consistent frame rate: No dropped frames during capture

**Pattern for Offline Rendering:**
```javascript
// For video capture: Use Tone.Offline for deterministic audio rendering
const buffer = await Tone.Offline(({ transport }) => {
  // Set up composition
  const synth = new Tone.Synth().toDestination();
  const sequence = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, '8n', time);
  }, ['C4', 'E4', 'G4'], '4n').start(0);

  transport.start();
}, duration); // duration in seconds

// Buffer now contains rendered audio
// Sync visual rendering to this exact timeline
```

**Real-Time Capture Pattern:**
- Use `Tone.Transport.seconds` as ground truth time
- Render visuals at fixed frame rate (e.g., 60fps)
- Capture using MediaRecorder API or canvas.captureStream()
- Ensure audio buffer size matches video frame timing

---

## 5. Implementation Risks & Gaps

### Audio Context State Management

**Risk: Multiple Atoms Sharing AudioContext**
- Tone.js uses a singleton AudioContext by default
- Multiple atoms will share the same context (usually desired)
- **Problem:** Closing context affects all atoms
- **Mitigation:** Never close the context; use `.dispose()` on nodes instead

**Risk: Suspended Context State**
- Browser autoplay policy may suspend context
- User gesture required to resume
- **Mitigation:** Always check `Tone.context.state` and call `Tone.start()` from UI event

**Pattern:**
```javascript
// Check context state before playing
async function ensureAudioContext() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
}

// Call before any audio playback
playButton.addEventListener('click', async () => {
  await ensureAudioContext();
  sequence.start();
});
```

### Cleanup and Disposal

**Risk: Memory Leaks from Incomplete Disposal**
- Known issue: `Tone.Player` and `Tone.Buffer` may not free memory
- CPU usage creeps up with long-running compositions
- **Mitigation:**
  - Call `.dispose()` on all Tone.js objects
  - Remove all references in your code
  - Stop Transport before disposing synths
  - Release all notes before disposal (avoid errors)

**Risk: Premature Disposal**
- Disposing synth before scheduled release → error
- **Mitigation:** Track active notes or wait for silence before disposal

**Recommended Disposal Pattern:**
```javascript
async function cleanupAtom() {
  // 1. Stop scheduling new events
  Tone.Transport.stop();
  Tone.Transport.cancel(); // Cancel all scheduled events

  // 2. Wait for audio to stop (or force stop)
  await new Promise(resolve => setTimeout(resolve, 100));

  // 3. Dispose all nodes
  synth.dispose();
  effects.forEach(fx => fx.dispose());

  // 4. Clear references
  synth = null;
  effects = [];
}
```

### Browser Compatibility

**Risk: Web Audio API Feature Support**
- AnalyserNode: Widely supported (Chrome, Firefox, Safari, Edge)
- AudioWorklet: Modern feature (Chrome 66+, Safari 14.1+)
- Offline rendering: Generally supported but quality varies

**Compatibility Table:**
- Chrome/Edge: Full support (best performance)
- Firefox: Full support (slight performance lag)
- Safari: Full support (iOS requires user gesture for ALL audio)
- Safari iOS: Additional restrictions (muted autoplay, limited concurrent contexts)

**Mitigation:**
- Test on target browsers early
- Provide fallback UI for unsupported features
- Feature detection: `if ('AudioContext' in window || 'webkitAudioContext' in window)`

### Performance Bottlenecks

**Risk: ConvolverNode and Panner3D Performance**
- Most processor-intensive nodes in Tone.js
- Excessive use → audio crackles, pops, silence
- **Mitigation:** Use sparingly, monitor CPU usage, increase latency hint

**Risk: FFT Analysis Overhead**
- Large FFT sizes (4096+) can impact performance
- Running multiple analysers simultaneously
- **Mitigation:**
  - Use smallest FFT size that meets needs (1024 or 2048)
  - Share single analyser across multiple visual consumers
  - Throttle analysis updates (skip frames if needed)

**Risk: Scheduling Overhead**
- Scheduling thousands of events too close to playback time
- **Mitigation:** Increase lookahead time via `Tone.context.lookAhead`

**Performance Configuration:**
```javascript
// Adjust latency hint (trade responsiveness for stability)
const audioContext = new AudioContext({
  latencyHint: 'playback' // Options: 'interactive', 'balanced', 'playback'
});
Tone.setContext(audioContext);

// Increase lookahead for complex compositions
Tone.context.lookAhead = 0.2; // Default: 0.1 seconds
```

### Frame Rate Synchronization

**Risk: Audio-Visual Timing Drift**
- `requestAnimationFrame` runs at display refresh rate (~60Hz)
- Audio runs at sample rate (44100/48000 Hz)
- Independent clocks can drift over time

**Mitigation:**
- Use `Tone.Transport.seconds` as timing source for critical sync
- Pull fresh audio analysis data every frame (automatically time-aligned)
- Avoid accumulating time deltas (use absolute timestamps)

**Pattern:**
```javascript
function draw() {
  requestAnimationFrame(draw);

  // Use Transport time for beat-synced events
  const transportTime = Tone.Transport.seconds;
  const beat = Math.floor(transportTime * (bpm / 60));

  // Use RAF timestamp for smooth animations
  const rafTime = performance.now() / 1000;

  // Pull fresh audio data (already time-aligned by analyser)
  const audioData = analyser.getValue();

  render(beat, rafTime, audioData);
}
```

**Risk: Dropped Frames During Capture**
- Heavy processing (FFT + p5.js rendering) may drop frames
- **Mitigation:**
  - Optimize p5.js sketches (reduce draw calls, use offscreen buffers)
  - Reduce FFT size to minimum required
  - Consider offline rendering for final output

---

## 6. Stack Recommendations

### Core Libraries

**Tone.js: v15.1.22+ (Latest Stable)**
- Why: Industry-standard Web Audio framework, excellent Transport scheduling
- Install: `npm install tone`
- Documentation: https://tonejs.github.io/docs/

**p5.js: v2.2.0+ (Current)**
- Why: Already in use for Phase 1, creative-coding friendly
- Install: Already installed as root dependency
- Documentation: https://p5js.org/reference/

**p5.sound.js: Latest (Optional Enhancement)**
- Why: Built on Tone.js, simplifies integration if using p5-native patterns
- Install: `npm install p5.sound` (or CDN)
- Trade-off: Adds abstraction layer; consider if needed
- Documentation: https://p5js.org/reference/p5.sound/

### Analysis & Beat Detection

**Built-in: Tone.Analyser + Custom Algorithms**
- Why: Direct access to FFT data, full control, no extra dependencies
- Use Case: Frequency band extraction, envelope following

**Optional: web-audio-beat-detector**
- Why: Pre-built beat detection, BPM estimation
- Install: `npm install web-audio-beat-detector`
- GitHub: https://github.com/chrisguttandin/web-audio-beat-detector
- Use Case: If BPM detection is critical

### GUI & Parameter Control

**lil-gui: v0.21.0+ (Already in use)**
- Why: Lightweight, already integrated in Phase 1
- Perfect for: Audio parameter tuning (attack, decay, oscillator type)
- Pattern: Same config.json approach as visual atoms

### Build & Development

**Vite: v7.3.1+ (Already in use)**
- Why: Fast HMR, ES modules, already configured for atoms
- Tone.js works seamlessly with ES modules
- No additional configuration needed

### Audio Effects (Optional)

**Tone.js Built-in Effects (Recommended):**
- Reverb: `Tone.Reverb`
- Delay: `Tone.FeedbackDelay`, `Tone.PingPongDelay`
- Distortion: `Tone.Distortion`
- Filter: `Tone.Filter`, `Tone.AutoFilter`
- Compressor: `Tone.Compressor`

**External Effects (If Needed):**
- Tuna.js: Additional effects (not maintained, avoid)
- Pizzicato.js: Simpler API but less powerful than Tone.js
- **Recommendation:** Stick with Tone.js built-in effects

### Template Structure

**Recommended Audio Atom Template:**
```
audio-atom-template/
├── index.html          # Entry point with play button
├── index.js            # Main orchestration
├── audio.js            # Tone.js synth/sequence setup
├── analysis.js         # FFT analysis and beat detection
├── config.json         # Synth/sequence/effect parameters
└── NOTES.md            # Stage tracking (idea/wip/done)
```

**Recommended Audio-Visual Composition Template:**
```
composition-atom-template/
├── index.html          # Entry point
├── index.js            # Parent orchestrator
├── audio.js            # Audio atom instance
├── visual.js           # Visual atom (p5.js sketch)
├── binding.js          # Audio-to-visual parameter mapping
├── config.json         # Composition-level config
└── NOTES.md            # Stage tracking
```

### Version Pinning

```json
{
  "dependencies": {
    "tone": "^15.1.22",
    "p5": "^2.2.0",
    "lil-gui": "^0.21.0"
  },
  "devDependencies": {
    "vite": "^7.3.1"
  }
}
```

### Browser Targets

**Minimum Support:**
- Chrome/Edge: v66+ (AudioWorklet support)
- Firefox: v76+
- Safari: v14.1+
- iOS Safari: v14.5+ (with user gesture requirement)

**Build Configuration:**
```javascript
// vite.config.js - no changes needed
// Modern browsers have native Web Audio API support
```

---

## RESEARCH COMPLETE

### Key Findings Summary

1. **Audio Atom Architecture:** Follow same pattern as visual atoms (instance mode, config.json, dispose pattern). Tone.js provides excellent scheduling via Transport. User gesture required for audio context activation.

2. **Frequency Analysis:** Use Tone.Analyser (wraps Web Audio AnalyserNode). Normalize to 0-1 range. Apply smoothingTimeConstant (0.8 recommended) to reduce jitter. Divide spectrum into frequency bands for reactive parameters.

3. **Audio-Visual Binding:** p5.sound.js now wraps Tone.js (2024 rewrite), simplifying integration. Pass audio data via function exports. Apply easing curves for smooth visuals. Use requestAnimationFrame for visual updates, Tone.Transport for timing precision.

4. **Composition Pattern:** Parent orchestrator manages child audio/visual atoms. Use Tone.Transport for beat-based scheduling with tempo-relative notation ("4n", "1m"). Tone.Offline enables deterministic rendering for video capture.

5. **Critical Risks:**
   - Memory leaks from incomplete disposal (call .dispose() on all nodes)
   - Premature disposal causing errors (stop notes before disposing synths)
   - Performance bottlenecks (limit FFT size, avoid excessive ConvolverNodes)
   - Audio context state management (always check state, call Tone.start())
   - Frame rate sync drift (use Transport.seconds as timing source)

### Planning Readiness

**READY TO PLAN.** Research provides:
- Clear audio atom template structure
- Proven frequency analysis patterns
- Audio-visual binding strategy
- Composition orchestration approach
- Risk mitigation patterns
- No major unknowns or blockers

**Recommended Approach:**
1. Start with simple audio atom (single synth, no visuals)
2. Add frequency analysis and visualization
3. Build audio-visual binding layer
4. Create composition atom combining multiple atoms
5. Test disposal/cleanup patterns early
6. Monitor performance with multiple instances

**Next Step:** Create Phase 2 plan with tasks for audio atom template, analysis utilities, and composition framework.

---

## Sources

### Tone.js Architecture
- [Tone.js Official Documentation](https://tonejs.github.io/)
- [Tone.js GitHub Repository](https://github.com/Tonejs/Tone.js)
- [Tone.js Instruments Wiki](https://github.com/Tonejs/Tone.js/wiki/Instruments)
- [Tone.js Events Wiki](https://github.com/tonejs/tone.js/wiki/Events)
- [I've built my own synthesizer using Tone.js and React - DEV Community](https://dev.to/ericsonwillians/ive-built-my-own-synthesizer-using-tonejs-and-react-293f)
- [Tone.js and the Web Audio API - DEV Community](https://dev.to/snelson723/tonejs-and-the-web-audio-api-36cj)

### Web Audio API Analysis
- [AnalyserNode - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- [Web Audio API Analysis and Visualization Book](https://webaudioapi.com/book/Web_Audio_API_Boris_Smus_html/ch05.html)
- [Visualizations with Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API)
- [Audio Analysis Techniques for Music Visualization](https://audioreactivevisuals.com/audio-analysis.html)
- [BeatDetector GitHub Repository](https://github.com/stasilo/BeatDetector)
- [web-audio-beat-detector GitHub Repository](https://github.com/chrisguttandin/web-audio-beat-detector)

### Tone.js + p5.js Integration
- [Visualizing Music with p5.js](https://therewasaguy.github.io/p5-music-viz/)
- [BitRate Series: Audio Visualization Workshop - Gray Area](https://grayarea.org/blog/workshop/bitrate-series-audio-visualization/)
- [p5.Tone Wiki](https://github.com/Tonejs/Tone.js/wiki/p5.Tone)
- [Tone-p5 GitHub Repository](https://github.com/toranoana/Tone-p5)
- [Announcing the new p5.sound.js library - Medium](https://medium.com/processing-foundation/announcing-the-new-p5-sound-js-library-42efc154bed0)
- [Interactive Sound and Visuals: A Tone.js and p5.js Beginner's Guide](https://musichackspace.org/product/interactive-sound-and-visuals-a-tone-js-and-p5-js-beginners-guide/)

### Tone.js Transport & Scheduling
- [Tone.Transport Official Documentation](https://tonejs.github.io/docs/r13/Transport)
- [Tone.js Transport Wiki](https://github.com/tonejs/tone.js/wiki/Transport)
- [TransportTime Wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime)
- [Tone.js Events Wiki](https://github.com/tonejs/tone.js/wiki/Events)
- [Higher Level Sequencers - LSU Programming Digital Media](https://pdm.lsupathways.org/3_audio/2_synthsandmusic/2_lesson_2/higherlevelsequences/)
- [Accurate Timing Wiki](https://github.com/Tonejs/Tone.js/wiki/Accurate-Timing)

### Audio Context Management
- [Web Audio API best practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- [AudioContext: close() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/close)
- [AudioContext - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)

### Audio Visualization Smoothing
- [A better FFT-based audio visualization](https://dlbeer.co.nz/articles/fftvis.html)
- [Using Processing for Music Visualization](https://www.generativehut.com/post/using-processing-for-music-visualization)
- [Intro to Signal Smoothing Filters - Seeq](https://support.seeq.com/kb/latest/cloud/intro-to-signal-smoothing-filters)

### Tone.js Performance & Cleanup
- [Tone.js Performance Wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)
- [Memory Leak from Tone.Player Issue #620](https://github.com/Tonejs/Tone.js/issues/620)
- [Disposing Synth before release Issue #1174](https://github.com/Tonejs/Tone.js/issues/1174)

### AnalyserNode Specifics
- [AnalyserNode: smoothingTimeConstant - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant)
- [AnalyserNode: getByteFrequencyData() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData)

### Component Composition Patterns
- [Component composition - Lit](https://lit.dev/docs/composition/component-composition/)
- [Compound Pattern - patterns.dev](https://www.patterns.dev/react/compound-pattern/)
- [Advanced React component composition](https://frontendmastery.com/posts/advanced-react-component-composition-guide/)

### Beat Detection Algorithms
- [Audio Processing: Beat Tracking Explained - audioXpress](https://audioxpress.com/article/audio-processing-beat-tracking-explained)
- [Web-Onset GitHub Repository](https://github.com/Keavon/Web-Onset)
- [Real-Time Beat Detection in Web-Based DJ Applications - DEV](https://dev.to/hacker_ea/real-time-beat-detection-in-web-based-dj-applications-40p3)
- [Onset detection - Essentia Documentation](https://essentia.upf.edu/tutorial_rhythm_onsetdetection.html)

### requestAnimationFrame & Timing
- [Window: requestAnimationFrame() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [requestAnimationFrame API - now with sub-millisecond precision](https://developers.google.com/web/updates/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision)
- [HTMLVideoElement: requestVideoFrameCallback() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
