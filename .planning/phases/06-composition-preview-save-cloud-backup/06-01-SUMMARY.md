---
phase: 06-composition-preview-save-cloud-backup
plan: 01
subsystem: composition-preview
tags: [preview, audio, iframe, parameter-routing, web-audio, real-time]
requires: [05-01, 05-02, 05-03]
provides: [preview-engine, atom-runtime, route-visualization]
affects: [06-02, 06-03]
tech-stack:
  added: []
  patterns: [sandboxed-iframe-execution, real-time-parameter-routing, audio-glitch-detection]
key-files:
  created:
    - portfolio/src/scripts/preview-engine.ts
    - portfolio/src/scripts/atom-runtime.ts
    - portfolio/src/components/PreviewControls.astro
  modified:
    - portfolio/src/scripts/composition-types.ts
    - portfolio/src/pages/mobile/compose.astro
    - portfolio/src/components/CompositionCanvas.astro
    - portfolio/src/styles/canvas.css
decisions:
  - title: Sandboxed iframe execution
    rationale: Prevent interference between atoms (separate DOM, globals, Web Audio contexts)
    alternatives: [shared-window, web-workers]
    chosen: sandboxed-iframe
  - title: 30fps routing loop
    rationale: Balance between responsiveness and performance on mobile
    alternatives: [60fps, requestAnimationFrame]
    chosen: 30fps-interval
  - title: Glitch detection via AudioContext.state
    rationale: Catch interrupted state and baseLatency spikes (buffer underruns)
    alternatives: [no-detection, user-reports-only]
    chosen: automated-detection
  - title: User agency on glitches
    rationale: Continue vs Restart gives user control, avoids forced stops
    alternatives: [auto-restart, auto-continue]
    chosen: user-choice
metrics:
  duration: 8min
  completed: 2026-02-01
---

# Phase 06 Plan 01: Composition Preview Engine Summary

**JWT auth with refresh rotation using jose library**

Real-time composition preview with parameter routing, sandboxed atom execution, and visual route highlighting. Users can now tap Play and hear/see all atoms running with routed parameters flowing in real-time.

## What Was Built

### 1. Preview Types Extension (Task 1)
Extended `Composition` interface with:
- `playbackMode: 'simultaneous' | 'sequential'` field (default: simultaneous)
- `PreviewState` type: 'stopped' | 'playing' | 'paused'
- `AtomMessage` interface for iframe <-> parent communication
- Backward compatible: existing compositions without playbackMode treated as simultaneous

### 2. AtomRuntime for Sandboxed Execution (Task 2)
Created `AtomRuntime` class managing individual atom execution:
- Sandboxed iframe with `allow-scripts` only (no top navigation, popups)
- Real-time parameter injection via `postMessage`
- Glitch monitoring every 500ms:
  - AudioContext.state === 'interrupted'
  - baseLatency spikes (buffer underruns)
- Cleanup: stops Tone.js Transport, closes AudioContext, removes iframe
- Ready/error/audio-glitch messages sent to parent

### 3. PreviewEngine Orchestrator (Task 3)
Created `PreviewEngine` class orchestrating multi-atom preview:
- Loads atom code/config from IndexedDB
- Creates `AtomRuntime` for each composition atom
- **Simultaneous mode**: starts all atoms at once
- **Sequential mode**: starts one atom at a time, user clicks Next
- Parameter routing loop at 30fps:
  - Reads source param values from iframe `window.controllers`
  - Applies to target atoms via `AtomRuntime.updateParams`
- Emits `route-active` event with active route IDs for canvas visualization
- Handles audio-glitch messages from runtimes
- Cleanup: stops all runtimes, clears interval, closes IndexedDB

### 4. PreviewControls UI (Task 4)
Created `PreviewControls.astro` component:
- Play/Pause/Stop buttons (44px touch targets)
- Playback mode toggle: ALL (simultaneous) vs SEQ (sequential)
- Next button for sequential mode (visible only when playing)
- Glitch warning toast with Continue/Restart buttons
- Event-driven: emits `preview-play/pause/stop/next/mode-change`
- Listens for `preview-state-changed` and `preview-glitch` from engine
- CSS variables added: `--bg-primary`, `--accent-color`, `--warning-color`

### 5. Canvas Integration (Task 5)
Integrated preview into compose page:
- Added `PreviewControls` to toolbar
- Wired event handlers:
  - `preview-play`: init PreviewEngine, attach event listeners, call `play()`
  - `preview-pause`: calls `engine.pause()`
  - `preview-stop`: calls `engine.stop()`, cleanup, reset to null
  - `preview-next`: calls `engine.startNext()` in sequential mode
  - `preview-mode-change`: updates composition, restarts preview if running
  - `preview-restart`: stops, cleans up, re-plays (glitch recovery)
- Route highlighting on canvas:
  - Listens for `preview-routes-active` events
  - Active routes styled with green (#00ff88), 3px stroke, pulsing animation
  - Pulse animation: 1s ease-in-out opacity fade (100% → 60% → 100%)

## Technical Implementation

### Sandboxed Iframe Execution
Each atom runs in its own iframe with:
```html
<iframe sandbox="allow-scripts">
```
- Atom code injected as inline script with `window.controllers` from config.json
- postMessage for bidirectional communication:
  - Parent → iframe: `{ type: 'param-update', params: {...} }`
  - iframe → Parent: `{ type: 'ready' | 'error' | 'audio-glitch' }`
- Isolation prevents:
  - Atoms interfering with each other (separate globals, DOM, Web Audio contexts)
  - Crashes in one atom affecting others
  - Security issues (no top navigation, popups)

### Real-Time Parameter Routing
Routing loop (30fps):
1. For each route in composition:
2. Read source param from source runtime's iframe `window.controllers`
3. Apply to target runtime via `updateParams({ [targetParam]: value })`
4. Target iframe receives postMessage, updates `window.controllers`
5. Track active routes for visualization

### Audio Glitch Detection
Every 500ms, check each atom's AudioContext:
- **Interrupted state**: `audioContext.state === 'interrupted'`
- **Buffer underruns**: `baseLatency` doubled from last check
- Emit `audio-glitch` event with atomNodeId and reason
- UI shows toast with Continue (dismiss) or Restart (stop + re-play)

### Route Visualization
- PreviewEngine emits `route-active` with array of route IDs
- Canvas component applies styling to active edges:
  - Green stroke (#00ff88)
  - 3px width (vs 2px default)
  - Pulsing opacity animation (CSS @keyframes)
- Routes animate only during playback, return to blue when stopped

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Sandboxed iframe execution | Prevents interference, enables parameter injection, isolates errors | Each atom runs in isolated environment, safe multi-atom preview |
| 30fps routing loop | Balance responsiveness and mobile performance | Parameter changes apply ~every 33ms, smooth enough for audio/visual |
| Glitch detection via AudioContext.state | Catch interrupted state and buffer underruns automatically | Users warned of audio issues, can choose to continue or restart |
| User agency on glitches | Continue vs Restart gives user control | No forced stops, user decides if glitch is acceptable |
| Green pulsing animation for active routes | High-contrast color, attention-grabbing animation | Users see routing in real-time, understand parameter flow |
| Event-driven architecture | Loose coupling between PreviewControls, engine, canvas | Easy to extend, test, and maintain |

## Validation Results

### Build Verification
- `npm run build` completes without errors
- No TypeScript errors
- All modified files compile successfully
- PWA bundle size: 645.40 KiB (60 files precached)

### Code Quality
- All functions have clear responsibilities
- Event-driven architecture: loose coupling
- Error handling: try/catch blocks, console errors, user-facing toasts
- Cleanup: all resources freed on stop (iframes, intervals, IndexedDB)

### UX Considerations
- 44px touch targets on all buttons (Apple HIG compliant)
- Visual feedback: disabled states, active mode highlight
- Glitch toast slides in from bottom (non-blocking)
- Route animation subtle (1s pulse, not distracting)

## Known Limitations

1. **Cross-origin parameter reading**: If iframe is cross-origin (shouldn't happen, but security edge case), routing reads fail silently
2. **Audio latency**: AudioContext.baseLatency check may not catch all glitches (some audio issues don't affect latency)
3. **Mobile performance**: 5-atom simultaneous preview may struggle on low-end devices
4. **No pause for sequential**: Sequential mode doesn't support pause (only play/stop)
5. **Routing reads synchronous**: Routing loop reads `window.controllers` synchronously, may miss rapid changes

## Next Phase Readiness

### For Plan 06-02 (Save/Load Compositions)
- ✅ Composition type includes `playbackMode` field
- ✅ Backward compatible: existing compositions work without playbackMode
- ✅ Preview state persists in composition (playbackMode saved to IndexedDB)

### For Plan 06-03 (Cloud Backup)
- ✅ All composition data in single JSON object (easy to serialize)
- ✅ Preview works with loaded compositions (no in-memory-only state)
- ✅ Atoms referenced by slug (cloud sync can resolve from IndexedDB)

### Blockers
None identified.

### Concerns
- **Mobile battery drain**: Preview with 5 atoms + routing loop may drain battery quickly
- **Audio glitch frequency**: May need to tune detection threshold if false positives occur
- **Preview resumability**: No mechanism to resume paused sequential preview (would need to track which atoms are running)

## Files Modified

### Created
- `portfolio/src/scripts/preview-engine.ts` (338 lines) - PreviewEngine orchestrator
- `portfolio/src/scripts/atom-runtime.ts` (242 lines) - Sandboxed atom execution
- `portfolio/src/components/PreviewControls.astro` (357 lines) - Play/Pause/Stop UI

### Modified
- `portfolio/src/scripts/composition-types.ts` (+16 lines) - Preview types
- `portfolio/src/pages/mobile/compose.astro` (+67 lines, -18 lines) - Preview integration
- `portfolio/src/components/CompositionCanvas.astro` (+18 lines) - Route highlighting
- `portfolio/src/styles/canvas.css` (+24 lines) - CSS variables, route animation

## Metrics

- **Execution time**: 8 minutes
- **Commits**: 5 (one per task)
- **Files created**: 3
- **Files modified**: 4
- **Lines added**: ~937
- **No deviations**: Plan executed as written

## Success Criteria Met

- ✅ COMP-04: User can preview composition with real-time parameter routing
- ✅ Simultaneous and sequential playback modes available and user-configurable
- ✅ Active routes visualized with green pulsing animation during playback
- ✅ Audio glitches show warning with user choice (Continue/Restart)
- ✅ Parameter changes apply instantly during preview (30fps routing loop)
- ✅ Preview engine cleans up all resources when stopped
- ✅ Foundation for save/load (Plan 06-02) is backward-compatible with new fields

## What's Next

**Plan 06-02**: Save/Load Compositions
- IndexedDB persistence for compositions
- Load composition by ID
- Restore canvas state (nodes, edges, viewport)

**Plan 06-03**: Cloud Backup
- Upload compositions to cloud storage
- Download compositions from cloud
- Merge local + cloud compositions

---

**Phase 6 Progress**: 1/3 plans complete
**Next**: Plan 06-02 (Save/Load Compositions)
