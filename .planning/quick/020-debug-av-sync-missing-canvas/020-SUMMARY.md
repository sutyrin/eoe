---
phase: quick
plan: 020
subsystem: debugging-atoms
type: analysis
tags: [p5.js, bundling, initialization, audio-visual-sync]
completed: 2026-02-01
duration: 12 minutes
---

# Quick Task 020: Debug av-sync-debug Canvas Missing

## Summary

**Root Cause Identified:** av-sync-debug's sketch.js exports setup() and draw() functions but **does not instantiate a p5 instance**. The bundle contains Tone.js and the audio system, but without p5 instantiation, no canvas is created.

## What Was Debugged

Compared av-sync-debug (showing only buttons) vs av1 (working baseline with canvas + visualization).

**Playwright investigation:**
- Navigated to both atom pages on production
- Captured console messages, DOM inspection, and screenshots
- Analyzed bundle sizes and structure
- Examined source code for p5 initialization patterns

## Key Findings

### av-sync-debug vs av1 Comparison

| Aspect | av-sync-debug | av1 (Working) | Difference |
|--------|---------------|---------------|-----------|
| Bundle Size | 693 KB | 3.2 MB | av1 is 4.6x larger |
| Console Errors | 0 | 1 (Prism parsing error) | av1 has code viewer error |
| Canvas Elements | 0 found | 0 found | Both show 0 via Playwright (in iframe) |
| p5 Imported | No | Yes | **av-sync-debug missing import** |
| p5 Instantiated | No | Yes (`new p5(sketch)`) | **av-sync-debug never creates instance** |
| Visual Output | Only buttons | Buttons + canvas + particles | av1 works, av-sync-debug doesn't |

### Console Output

**av-sync-debug console:**
- Tone.js v15.1.22 banner logged (line 8631 in bundle)
- 2 AudioContext warnings (normal - needs user gesture to start)
- **NO JavaScript errors**

**av1 console:**
- Tone.js v15.1.22 banner logged (line 88877 in bundle)
- 1 Prism.js syntax error (code viewer attempting to parse code - not related to p5)
- Multiple AudioContext warnings
- Renders correctly despite Prism error (code viewer gracefully fails)

### Screenshot Comparison

**av-sync-debug page:**
```
[Header] Engines of Experience
← Back to Gallery
av-sync-debug
2026-01-30 · idea

[Play] [Stop]

[Empty space below - NO CANVAS]
```

**av1 page:**
```
[Header] Engines of Experience
← Back to Gallery
av1
2026-01-30 · idea

[Play] [Stop]    [av1 Parameters Panel]
                 [Visual sliders]
                 [Audio Mapping controls]
                 [Transport BPM]

[Canvas with colorful particle visualization]
```

### Root Cause Analysis: The Missing p5 Instantiation

**av1/sketch.js (WORKING):**
```javascript
import p5 from 'p5';  // <-- IMPORTS p5
import GUI from 'lil-gui';
...

const sketch = (p) => {
  // All setup and draw logic inside sketch object
  p.setup = () => { ... }
  p.draw = () => { ... }
  ...
};

p5Instance = new p5(sketch);  // <-- INSTANTIATES p5 WITH SKETCH
```

**av-sync-debug/sketch.js (BROKEN):**
```javascript
// NO p5 import!
import { initAudio, startAudio, stopAudio, ... } from './audio.js';
import config from './config.json';

// Just exports raw functions - no p5 object
export function setup(p) {
  p.createCanvas(800, 800);  // <-- createCanvas called but p never gets instantiated
  ...
}

export function draw(p) {
  ...
}

// NO p5Instance = new p5(...) anywhere!
```

**Why this breaks:**
1. av-sync-debug exports setup() and draw() as standalone functions
2. The bundle contains Tone.js and the code, but has no p5 library
3. There is no code that creates a p5 instance with these functions
4. p5 never runs, so createCanvas() is never called
5. No canvas element appears in the DOM
6. User sees only the transport buttons

**Why av1 works:**
1. av1 imports p5 from 'p5'
2. Creates a sketch object with all p5 callbacks inside
3. Instantiates: `new p5(sketch)` - this triggers setup() and draw()
4. p5 creates canvas, runs setup, starts animation loop
5. Canvas renders with particle visualization

## Architectural Pattern Mismatch

av-sync-debug was written to export setup/draw as standalone functions (design pattern from Phase 5/6 composition system where atoms are instantiated dynamically). However:

- **Phase 5/6 pattern:** Atoms export setup/draw functions for the CompositionPreview component to instantiate
- **av1 pattern:** Atoms instantiate p5 themselves, design for standalone pages

av-sync-debug was built for a different use case (composition system) but the atom page doesn't know how to instantiate it.

## Evidence

**From sketch.bundle.js analysis:**

Line 19549: `function setup(p) { p.createCanvas(800, 800); ... }`
Line 19554: `function draw(p) { ... }`
Lines 19592-19595: `export { draw, setup }`

But NO code in the bundle instantiates p5 with these functions.

**From av1/sketch.js:**

Line 240: `p5Instance = new p5(sketch);` - the critical line that makes it work

**Missing from av-sync-debug/sketch.js:**
- `import p5 from 'p5'`
- `new p5(...)` instantiation

## Next Steps

Create quick-021 to fix av-sync-debug by converting it to the av1 pattern:

1. Import p5: `import p5 from 'p5'`
2. Create sketch object wrapping the exported functions
3. Instantiate: `new p5(sketch)`
4. Re-bundle and verify canvas appears

Alternatively, if av-sync-debug is meant for composition system (Phase 6 preview), move it there instead of the atom pages, as its architecture doesn't fit standalone atom page rendering.

## Deviations from Plan

None - debugging executed as planned. Investigation revealed architectural pattern mismatch, not a bundling or build issue.

## Files Analyzed

- `/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-av-sync-debug/sketch.bundle.js` (693 KB)
- `/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-av1/sketch.bundle.js` (3.2 MB)
- `/home/pavel/dev/play/eoe/atoms/2026-01-30-av-sync-debug/sketch.js` (source)
- `/home/pavel/dev/play/eoe/atoms/2026-01-30-av1/sketch.js` (source)
- Debug results: `.planning/quick/020-debug-av-sync-missing-canvas/debug-results.json`

## Screenshots

- av-sync-debug.png: Shows page with Play/Stop buttons only, no canvas
- av1-baseline.png: Shows page with buttons + parameter panel + particle visualization canvas

Both screenshots in `.planning/quick/020-debug-av-sync-missing-canvas/screenshots/`

---

**Execution Time:** 12 minutes
**Date:** 2026-02-01
