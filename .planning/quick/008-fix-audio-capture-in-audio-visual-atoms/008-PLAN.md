---
phase: quick
plan: 008
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/capture/media-recorder-inject.js
  - lib/audio/transport.js
autonomous: true

must_haves:
  truths:
    - "Audio-visual atoms produce audible audio in captured WebM files"
    - "Tone.js audio output is routed to MediaRecorder audio track during capture"
    - "Visual-only atoms still capture correctly (no regression)"
  artifacts:
    - path: "lib/capture/media-recorder-inject.js"
      provides: "MediaRecorder injection that captures audio via AudioContext destination node"
    - path: "lib/audio/transport.js"
      provides: "Exposes Tone context globally for capture script access"
  key_links:
    - from: "lib/audio/transport.js"
      to: "window.__TONE_CONTEXT__"
      via: "global assignment in ensureAudioContext()"
      pattern: "window\\.__TONE_CONTEXT__"
    - from: "lib/capture/media-recorder-inject.js"
      to: "window.__TONE_CONTEXT__"
      via: "reads global AudioContext reference for MediaStreamDestination"
      pattern: "window\\.__TONE_CONTEXT__"
---

<objective>
Fix audio capture in audio-visual atoms so that `eoe capture` produces WebM files with audible Tone.js audio.

Purpose: Currently, captured audio-visual atoms have video but no audio. The root cause is that the MediaRecorder injection script (`media-recorder-inject.js`) checks `typeof Tone !== 'undefined'` to detect audio -- but Tone.js is loaded as an ES module import, NOT as a global variable. The check always fails, so the audio capture branch is never entered. The entire audio track is silently skipped.

Output: Fixed capture pipeline that routes Tone.js audio to MediaRecorder via the AudioContext's destination node.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key files:
@lib/capture/media-recorder-inject.js  - MediaRecorder injection script (runs inside browser page.evaluate)
@lib/capture/browser-capture.js        - Playwright browser automation (launches headless Chromium)
@lib/capture/audio-capture.js          - Audio detection (checks config.json and file presence)
@lib/audio/transport.js                - Tone.js transport controls (ensureAudioContext, startTransport)
@cli/templates/audio-visual/audio.js   - Audio-visual template (calls ensureAudioContext on Play click)
</context>

<root_cause>
## Bug Analysis

The audio capture failure has ONE root cause with TWO contributing factors:

### Primary: Tone.js is not a global variable

`media-recorder-inject.js` line 33 checks:
```js
if (hasAudio && typeof Tone !== 'undefined') {
```

But Tone.js is imported as an ES module inside `audio.js`:
```js
import * as Tone from 'tone';
```

ES module imports are NOT globals. `typeof Tone` in the injected script's scope is always `'undefined'`. The entire audio routing block (lines 33-46) is **never executed**. The MediaRecorder only gets the video stream.

### Secondary: Injected script cannot access module-scoped Tone

Even if we somehow made the condition true, the injected function runs via `page.evaluate()` which serializes it. It cannot reference module-scoped variables. `Tone.getDestination()` and `Tone.context` inside the injected code would fail because `Tone` is not in scope.

### Fix Strategy

Two-part fix:
1. **Expose the AudioContext globally** from `ensureAudioContext()` in `transport.js` -- when Tone.start() creates/resumes the context, stash it on `window.__TONE_CONTEXT__` so the injected capture script can access it.
2. **Rewrite the audio capture branch** in `media-recorder-inject.js` to use the raw Web Audio API via `window.__TONE_CONTEXT__` instead of referencing the Tone module. The AudioContext's `destination` node already has all audio routed to it (via `.toDestination()` calls in audio.js). We just need to create a `MediaStreamDestination`, connect it to the context destination, and add its audio tracks to the combined MediaStream.

This approach works because:
- `effectsChain.output.toDestination()` in audio.js routes all audio to the Tone.js destination
- Tone.js destination IS the AudioContext.destination under the hood
- We can tap into the same audio by connecting a MediaStreamDestination to the context
</root_cause>

<tasks>

<task type="auto">
  <name>Task 1: Expose AudioContext globally from Tone.js initialization</name>
  <files>lib/audio/transport.js</files>
  <action>
In `ensureAudioContext()` function, after `await Tone.start()` succeeds (or if context is already running), assign the raw AudioContext to a global:

```js
export async function ensureAudioContext() {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  // Expose for capture script access (media-recorder-inject.js)
  if (typeof window !== 'undefined') {
    window.__TONE_CONTEXT__ = Tone.context.rawContext || Tone.context._context;
  }
}
```

The `typeof window !== 'undefined'` guard ensures this is safe in non-browser contexts (though currently only used in browser). Use `rawContext` first (Tone.js v14+ public API), falling back to `_context` (internal property).

Also expose the Tone destination node globally so the capture script can create a parallel connection:

```js
if (typeof window !== 'undefined') {
  window.__TONE_CONTEXT__ = Tone.context.rawContext || Tone.context._context;
  window.__TONE_DESTINATION__ = Tone.getDestination();
}
```
  </action>
  <verify>
Run `grep -n '__TONE_CONTEXT__\|__TONE_DESTINATION__' lib/audio/transport.js` and confirm both globals are set after Tone.start(). Verify the function still exports properly and no syntax errors with `node -e "import('./lib/audio/transport.js')"` (will fail on Tone import but should show no syntax errors in the file itself).
  </verify>
  <done>
`ensureAudioContext()` sets `window.__TONE_CONTEXT__` and `window.__TONE_DESTINATION__` after Tone.start(), making the AudioContext and destination accessible to injected capture scripts.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix MediaRecorder injection to capture audio via global AudioContext</name>
  <files>lib/capture/media-recorder-inject.js</files>
  <action>
Replace the audio detection and routing block (lines 33-48) in the `captureInBrowser` function. Instead of checking `typeof Tone !== 'undefined'` and calling Tone module methods, use the globals set by Task 1.

The new audio capture logic should:

1. Check for audio using the exposed globals:
```js
if (hasAudio && window.__TONE_CONTEXT__) {
```

2. Get the AudioContext from the global:
```js
const audioContext = window.__TONE_CONTEXT__;
```

3. Create a MediaStreamDestination on that context:
```js
const audioDestination = audioContext.createMediaStreamDestination();
```

4. Connect the Tone destination node to the MediaStreamDestination. The `window.__TONE_DESTINATION__` is a Tone.js ToneAudioNode, which has a `.connect()` method that accepts native Web Audio nodes:
```js
window.__TONE_DESTINATION__.connect(audioDestination);
```

5. Combine streams as before:
```js
combinedStream = new MediaStream([
  ...videoStream.getVideoTracks(),
  ...audioDestination.stream.getAudioTracks()
]);
```

The full replacement for the audio block (lines 33-48 of the original):

```js
if (hasAudio && window.__TONE_CONTEXT__) {
  const audioContext = window.__TONE_CONTEXT__;
  const audioDestination = audioContext.createMediaStreamDestination();

  // Connect Tone.js master output to our recording destination
  // __TONE_DESTINATION__ is the Tone.Destination node set in ensureAudioContext()
  if (window.__TONE_DESTINATION__) {
    window.__TONE_DESTINATION__.connect(audioDestination);
  }

  // Combine video and audio tracks
  combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioDestination.stream.getAudioTracks()
  ]);
} else {
  combinedStream = videoStream;
}
```

Also update the JSDoc comment at the top to reflect the new approach (references window globals instead of Tone module).

IMPORTANT: Do NOT change anything else in the function -- the MediaRecorder setup, chunk collection, base64 conversion, and promise handling should remain exactly as-is.
  </action>
  <verify>
1. Verify syntax: `node --check lib/capture/media-recorder-inject.js` (if supported) or use a quick parse test.
2. Test with an audio-visual atom: `node cli/eoe.js capture av1 -d 3 --skip-encode --skip-thumbnails`
3. Check the output WebM file has audio: `ffprobe videos/masters/2026-01-30-av1.webm` -- should show BOTH a video stream (vp9) AND an audio stream (opus). If audio stream is present AND has non-zero duration, the fix is working.
4. Test with a visual-only atom to confirm no regression: `node cli/eoe.js capture my-first-sketch -d 3 --skip-encode --skip-thumbnails` -- should still produce video without errors (the `hasAudio` flag will be false, so the audio branch is skipped).
  </verify>
  <done>
Audio-visual atom capture produces WebM files with both video and audio tracks. The `ffprobe` output shows an Opus audio stream alongside the VP9 video stream. Visual-only atoms still capture correctly without audio.
  </done>
</task>

</tasks>

<verification>
1. Capture an audio-visual atom: `node cli/eoe.js capture av1 -d 5 --skip-encode --skip-thumbnails`
2. Inspect output with ffprobe: `ffprobe -v error -show_streams videos/masters/2026-01-30-av1.webm`
   - MUST show Stream #0 (video) with codec vp9
   - MUST show Stream #1 (audio) with codec opus
3. Play the file locally to confirm audible audio (or check audio stream bitrate > 0 in ffprobe output)
4. Capture a visual-only atom: `node cli/eoe.js capture my-first-sketch -d 3 --skip-encode --skip-thumbnails`
   - MUST succeed without errors
   - Audio stream may or may not be present (visual atom has no audio)
</verification>

<success_criteria>
- Audio-visual atoms captured with `eoe capture` produce WebM files containing both VP9 video and Opus audio streams
- ffprobe confirms audio stream exists in captured output
- Visual-only atom capture still works (no regression)
- No changes needed to atom source code (audio.js, sketch.js) -- fix is entirely in the capture infrastructure
</success_criteria>

<output>
After completion, create `.planning/quick/008-fix-audio-capture-in-audio-visual-atoms/008-SUMMARY.md`
</output>
