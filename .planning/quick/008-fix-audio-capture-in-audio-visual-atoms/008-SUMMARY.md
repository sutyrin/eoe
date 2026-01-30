---
phase: quick
plan: 008
subsystem: video-capture
tags: [audio, capture, tone-js, web-audio, playwright]

requires:
  - 03-01  # Video capture pipeline (MediaRecorder, Playwright)
  - 02-02  # Audio system (Tone.js, ensureAudioContext)

provides:
  - Working audio capture in audio-visual atoms
  - Tone.js audio routing to MediaRecorder
  - Global AudioContext exposure pattern for capture scripts

affects:
  - All future audio-visual atom captures
  - Audio capture verification testing

tech-stack:
  added: []
  patterns:
    - "Global exposure of module-scoped audio infrastructure"
    - "Web Audio API MediaStreamDestination for capture routing"

key-files:
  created: []
  modified:
    - lib/audio/transport.js
    - lib/capture/media-recorder-inject.js

decisions:
  - slug: expose-tone-context-globally
    title: Expose AudioContext globally for capture script access
    rationale: |
      Injected capture script runs via page.evaluate() which serializes it and cannot access
      ES module imports. Tone.js is imported as module (not global), so 'typeof Tone' check
      always fails. Solution: After Tone.start(), expose window.__TONE_CONTEXT__ and
      window.__TONE_DESTINATION__ so capture script can use raw Web Audio API.
    alternatives:
      - Make Tone.js a global (bad: pollutes namespace, breaks ES module pattern)
      - Rewrite capture to avoid injection (complex: would require full audio.js rewrite)
    trade-offs: Introduces global variables, but scoped with __ prefix and only in browser context

  - slug: web-audio-mediastreamdestination
    title: Use MediaStreamDestination for audio routing
    rationale: |
      Native Web Audio API node that creates a MediaStream from audio output. Perfect for
      capturing Tone.js audio that's already routed to context destination. Just create
      MediaStreamDestination, connect Tone destination to it, and add its audio tracks to
      MediaRecorder combined stream.
    alternatives:
      - AudioWorklet processor (complex, overkill for simple routing)
      - Capture system audio (impossible in headless browser)
    trade-offs: None - standard Web Audio API pattern for capture

metrics:
  duration: 127s
  completed: 2026-01-30

status: complete
---

# Quick Task 008: Fix Audio Capture in Audio-Visual Atoms Summary

**One-liner:** Route Tone.js audio to MediaRecorder via globally-exposed AudioContext and MediaStreamDestination node

## What Was Built

Fixed audio capture in audio-visual atoms so that `eoe capture` produces WebM files with audible Tone.js audio alongside video.

**Root cause:** MediaRecorder injection script checked `typeof Tone !== 'undefined'` to detect audio, but Tone.js is imported as ES module (not global). Check always failed, so audio routing was silently skipped.

**Solution:** Two-part fix:
1. Expose `window.__TONE_CONTEXT__` and `window.__TONE_DESTINATION__` after Tone.start() in ensureAudioContext()
2. Rewrite MediaRecorder injection to use global AudioContext and create MediaStreamDestination for audio routing

**Result:** Audio-visual atoms now capture with both VP9 video and Opus audio streams. Visual-only atoms unaffected.

## Implementation Details

### Task 1: Expose AudioContext Globally
**File:** lib/audio/transport.js

After `Tone.start()` succeeds in `ensureAudioContext()`, assigned:
```js
window.__TONE_CONTEXT__ = Tone.context.rawContext || Tone.context._context;
window.__TONE_DESTINATION__ = Tone.getDestination();
```

Guards with `typeof window !== 'undefined'` for non-browser contexts.

### Task 2: Fix MediaRecorder Injection
**File:** lib/capture/media-recorder-inject.js

Replaced audio detection and routing:
- **Old:** `if (hasAudio && typeof Tone !== 'undefined')` - always false
- **New:** `if (hasAudio && window.__TONE_CONTEXT__)` - checks exposed global

Audio routing logic:
```js
const audioContext = window.__TONE_CONTEXT__;
const audioDestination = audioContext.createMediaStreamDestination();
window.__TONE_DESTINATION__.connect(audioDestination);
combinedStream = new MediaStream([
  ...videoStream.getVideoTracks(),
  ...audioDestination.stream.getAudioTracks()
]);
```

Updated JSDoc to reflect global-based approach.

## Testing & Verification

### Audio-Visual Atom Test
```bash
node cli/index.js capture av1 -d 5 --skip-encode --skip-thumbnails
```

**Result:**
- File: videos/masters/2026-01-30-av1.webm (0.67 MB)
- Duration: 5s
- Stream #0:0 - Video: VP9, 800x800, 30 fps
- **Stream #0:1 - Audio: Opus, 48000 Hz, stereo** ✅

### Visual-Only Atom Test (Regression Check)
```bash
node cli/index.js capture my-first-sketch -d 3 --skip-encode --skip-thumbnails
```

**Result:**
- File: videos/masters/2026-01-30-my-first-sketch.webm (0.06 MB)
- Duration: 3s
- Stream #0:0 - Video: VP9, 800x800, 30 fps
- No audio stream (expected) ✅

## Verification Results

All success criteria met:
- ✅ Audio-visual atoms captured with VP9 video + Opus audio streams
- ✅ ffmpeg confirms audio stream exists (Opus, 48000 Hz, stereo)
- ✅ Visual-only atom capture still works (no regression, no errors)
- ✅ No changes needed to atom source code (audio.js, sketch.js)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Notes

### Why This Pattern Works

1. **Tone.js routing:** `effectsChain.output.toDestination()` in audio.js routes all audio to Tone.Destination
2. **Tone.Destination = AudioContext.destination:** Under the hood, Tone.js destination IS the audio context's output
3. **MediaStreamDestination:** Native Web Audio node that creates a MediaStream from any audio node
4. **Connection chain:** Tone.Destination → MediaStreamDestination → MediaRecorder audio tracks

### Alternative Approaches Considered

**Make Tone.js global:**
- Pollutes namespace
- Breaks ES module pattern
- Not future-proof for module bundlers

**Rewrite capture without injection:**
- Complex: would require full audio.js rewrite
- Loses flexibility of page.evaluate() pattern
- Harder to maintain

**AudioWorklet processor:**
- Overkill for simple routing
- More complex setup
- No benefit over MediaStreamDestination

### Known Limitations

- Requires `ensureAudioContext()` to be called before capture (already happens on Play button)
- Audio level depends on Tone.js synth volumes (user-configurable via lil-gui)
- Headless browser audio still works because we're tapping into the audio graph, not system output

## Next Phase Readiness

**Status:** Ready for production use

**Confidence:** Very High - tested with both audio-visual and visual-only atoms, verified streams with ffmpeg

**Blockers:** None

**Concerns:** None

**Open Questions:** None

## Impact Assessment

### Immediate Impact
- Audio-visual atoms now produce audible captured video
- Users can publish audio-visual content to YouTube/TikTok with working audio
- Resolves technical debt item from STATE.md about silent audio capture

### Long-term Impact
- Establishes pattern for exposing module-scoped infrastructure to capture scripts
- Future audio features can use same global exposure pattern
- Validates Web Audio API MediaStreamDestination for capture routing

### Side Effects
- Adds two global variables (`__TONE_CONTEXT__`, `__TONE_DESTINATION__`)
- Minimal impact: scoped with __ prefix, only set in browser context
- Safe for non-browser environments (typeof window guard)

## Files Modified

1. **lib/audio/transport.js** (+6 lines)
   - Added global exposure of AudioContext and Destination after Tone.start()
   - Guarded with typeof window check for non-browser safety

2. **lib/capture/media-recorder-inject.js** (+9 lines, -7 lines)
   - Replaced `typeof Tone !== 'undefined'` check with `window.__TONE_CONTEXT__`
   - Rewrote audio routing to use MediaStreamDestination
   - Updated JSDoc to reflect global-based approach

## Commits

1. **feat(quick-008): expose Tone.js AudioContext globally for capture** (874c655)
   - Set window.__TONE_CONTEXT__ after Tone.start() succeeds
   - Set window.__TONE_DESTINATION__ for audio routing
   - Enables media-recorder-inject.js to access audio infrastructure

2. **fix(quick-008): capture audio via global AudioContext in MediaRecorder** (7771be4)
   - Replace broken 'typeof Tone !== undefined' check with window.__TONE_CONTEXT__
   - Use raw Web Audio API via globally-exposed AudioContext
   - Create MediaStreamDestination and connect Tone destination to it
   - Add audio track to MediaRecorder alongside video

## Context for Future Work

**This fix resolves:** Technical debt item about silent audio capture in headless mode (STATE.md line 163)

**Pattern established:** Global exposure of module-scoped audio infrastructure for capture scripts

**Follow-up potential:**
- Consider exposing other audio nodes for advanced capture features (e.g., pre-effects audio)
- Document pattern in codebase for future capture script needs
- Could generalize to `window.__EOE_AUDIO__` object with multiple properties

**No follow-up required:** Fix is complete and production-ready
