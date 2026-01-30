---
phase: quick
plan: 009
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/capture/media-recorder-inject.js
  - lib/capture/browser-capture.js
autonomous: true

must_haves:
  truths:
    - "Audio and video streams are temporally aligned in captured WebM"
    - "Visual motion corresponds to audio beats without perceptible drift"
    - "Canvas frames are captured at draw boundaries, not on an independent timer"
  artifacts:
    - path: "lib/capture/media-recorder-inject.js"
      provides: "Synchronized audio+video MediaRecorder capture"
    - path: "lib/capture/browser-capture.js"
      provides: "Capture orchestration with proper audio/video sync"
  key_links:
    - from: "canvas.captureStream"
      to: "MediaRecorder"
      via: "combined MediaStream"
      pattern: "captureStream.*MediaRecorder"
---

<objective>
Investigate and fix audio/video synchronization in captured atoms. The user reports that in captured video, audio and visual motion are slightly out of sync.

Purpose: Captured atoms must have tight audio-video sync to be publishable on YouTube/TikTok. Even slight misalignment is perceptible and unprofessional.

Output: Fixed capture pipeline producing correctly synchronized WebM files.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/008-fix-audio-capture-in-audio-visual-atoms/008-SUMMARY.md
@lib/capture/browser-capture.js
@lib/capture/media-recorder-inject.js
@lib/capture/audio-capture.js
@lib/audio/transport.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Diagnose sync issue with timestamp analysis and apply fixes</name>
  <files>lib/capture/media-recorder-inject.js, lib/capture/browser-capture.js</files>
  <action>
  The audio/video desync has multiple likely root causes. Investigate each and fix:

  **Root Cause 1: captureStream(fps) uses independent timer**
  `canvas.captureStream(30)` creates frames on its own 33ms timer, independent of p5.js
  `requestAnimationFrame` draw cycle. This means captured frames may not correspond to actual
  draw boundaries -- canvas content can be sampled mid-render or between renders, creating
  visual jitter that looks like desync.

  FIX: Change `canvas.captureStream(fps)` to `canvas.captureStream(0)` (manual frame mode).
  With fps=0, `captureStream` only captures when `requestVideoFrame()` is called explicitly,
  OR more practically, it captures whenever the canvas is painted to. This makes the video
  stream follow the actual draw cadence rather than an independent timer.

  Alternatively, and more reliably: use `canvas.captureStream()` with NO argument at all.
  Per MDN: "If not set, a new frame will be captured each time the canvas changes" -- this
  is the ideal mode for p5.js which draws via requestAnimationFrame. The video stream will
  naturally follow the draw loop.

  **Root Cause 2: Audio starts before recording begins**
  In browser-capture.js, the Play button is clicked (line 90), then 500ms wait (line 93),
  THEN the MediaRecorder inject script runs. By the time MediaRecorder.start() is called,
  audio has been playing for 500ms+. The video stream starts capturing from the moment
  MediaRecorder.start() is called, but the audio stream from MediaStreamDestination is
  a live tap -- it captures audio from NOW, not from the beginning. So audio and video
  both start recording at the same moment, BUT the visual state has already been reacting
  to 500ms of audio. This means the first visual frames show audio-reactive state from
  beat N, while audio is at beat N (which is correct). However, the p5.js animation
  uses cumulative state (`time += 0.02` in av1's draw loop), so the visual state has
  diverged from what a fresh start would look like.

  FIX: Restructure the capture flow so MediaRecorder starts BEFORE audio playback begins.
  In the inject script:
  1. Set up MediaRecorder with combined stream
  2. Call MediaRecorder.start()
  3. THEN click the Play button (or dispatch a custom event to start audio)
  4. Wait for duration
  5. Stop MediaRecorder

  To achieve this, move the Play button click INTO the inject script (via DOM manipulation)
  rather than clicking it before injection. In browser-capture.js, remove the playBtn click
  and the 500ms wait. Instead, pass `playSelector` to the inject script so it can click
  Play AFTER recording starts.

  **Root Cause 3: MediaRecorder timeslice chunking**
  `mediaRecorder.start(1000)` requests data every 1 second. While this shouldn't cause
  sync issues per se, it can make the container timestamps less precise. For better sync,
  consider using `mediaRecorder.start()` with no timeslice (single chunk mode) -- the
  recording is short enough (max 120s) that memory isn't a concern. This produces a single
  blob with more accurate internal timestamps.

  FIX: Change `mediaRecorder.start(1000)` to `mediaRecorder.start()` (no timeslice).
  The ondataavailable handler remains the same (fires once on stop with the complete blob).

  **Implementation steps:**

  In `lib/capture/browser-capture.js`:
  - Remove the playBtn click block (lines 88-95)
  - Pass `playSelector` into the page.evaluate call: change line 99-103 to pass
    `{ duration: durationMs, fps, hasAudio, playSelector }` as the second argument

  In `lib/capture/media-recorder-inject.js`:
  - Change function signature to accept `{ duration, fps, hasAudio, playSelector }`
  - Change `canvas.captureStream(fps)` to `canvas.captureStream()` (no argument)
  - Change `mediaRecorder.start(1000)` to `mediaRecorder.start()` (no timeslice)
  - After `mediaRecorder.start()`, add Play button click:
    ```
    if (playSelector) {
      const playBtn = document.querySelector(playSelector);
      if (playBtn) playBtn.click();
    }
    ```
  - Add a small delay (50ms) after MediaRecorder.start() but before clicking Play,
    to ensure the recorder is fully initialized

  **What NOT to do:**
  - Do NOT add AudioContext.resume() calls -- Tone.js already handles this in ensureAudioContext()
  - Do NOT change the codec or bitrate settings -- those are fine
  - Do NOT change the audio routing (MediaStreamDestination pattern from quick-008) -- that works correctly
  </action>
  <verify>
  Run capture on the audio-visual atom and verify sync:

  ```bash
  # Capture av1 with audio
  node cli/index.js capture av1 -d 5 --skip-encode --skip-thumbnails

  # Verify output has both streams
  ffprobe -v quiet -print_format json -show_streams videos/masters/2026-01-30-av1.webm

  # Check that video and audio stream start times are aligned (both should start at ~0)
  ffprobe -v quiet -show_entries stream=start_time,codec_type videos/masters/2026-01-30-av1.webm
  ```

  Also capture a visual-only atom to verify no regression:
  ```bash
  node cli/index.js capture my-first-sketch -d 3 --skip-encode --skip-thumbnails
  ```
  </verify>
  <done>
  - captureStream() uses automatic frame mode (no fps argument), so video frames align with actual canvas draw calls
  - MediaRecorder starts BEFORE audio playback begins, so audio and video streams are temporally aligned from the first frame
  - No timeslice chunking (single blob mode) for cleaner container timestamps
  - ffprobe shows both audio and video streams with start_time near 0
  - Visual-only atom capture still works (no regression)
  - User can verify sync by playing back captured av1.webm and observing beat-reactive visuals align with audio beats
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Fixed audio/video synchronization in capture pipeline by: (1) using automatic captureStream frame mode instead of fixed 30fps timer, (2) starting MediaRecorder before audio playback so both streams begin together, (3) removing timeslice chunking for cleaner timestamps.</what-built>
  <how-to-verify>
    1. Run: `node cli/index.js capture av1 -d 10 --skip-encode --skip-thumbnails`
    2. Play back `videos/masters/2026-01-30-av1.webm` in VLC or browser
    3. Watch for audio-reactive visual elements (beat flashes, size pulsing, rotation) aligning with audible beats
    4. Compare with previous captures if available -- motion should now track audio precisely
    5. Pay special attention to the first 1-2 seconds where the old timing gap was most noticeable
  </how-to-verify>
  <resume-signal>Type "approved" if sync looks correct, or describe remaining issues</resume-signal>
</task>

</tasks>

<verification>
- ffprobe confirms both VP9 video and Opus audio streams present
- Both stream start_time values are close to 0 (within 50ms)
- Visual-only atom capture works without errors
- No console errors during capture
</verification>

<success_criteria>
- Captured audio-visual atoms show visually-aligned audio-reactive motion
- No perceptible drift between audio beats and visual responses
- Visual-only atom capture unchanged (regression-free)
</success_criteria>

<output>
After completion, create `.planning/quick/009-in-captured-video-i-see-that-audio-and-v/009-SUMMARY.md`
</output>
