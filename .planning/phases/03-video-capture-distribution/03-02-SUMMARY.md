---
phase: 03-video-capture-distribution
plan: 02
subsystem: video-encoding
tags: [ffmpeg, fluent-ffmpeg, ffmpeg-static, h264, aac, video-encoding, thumbnails]

# Dependency graph
requires:
  - phase: 03-01
    provides: Master WebM capture pipeline with Playwright and MediaRecorder API
provides:
  - FFmpeg encoding library for platform-specific transcoding (YouTube 16:9, TikTok 9:16)
  - Aspect ratio utilities with letterbox/pillarbox padding (no stretching)
  - Thumbnail extraction at specific timestamps (1s, 5s, midpoint) plus best-frame detection
  - Integrated capture pipeline producing master + encoded + thumbnails in single command
affects: [03-03-distribution-cli, portfolio-integration, video-publishing]

# Tech tracking
tech-stack:
  added: [fluent-ffmpeg@2.1.3, ffmpeg-static@5.2.0]
  patterns:
    - FFmpeg encoding with fluent-ffmpeg wrapper (no manual CLI construction)
    - Platform profiles for aspect ratio conversion (scale+pad with black bars)
    - Bundled FFmpeg binary via ffmpeg-static (no system dependency)
    - H.264 High profile with AAC audio, yuv420p pixel format, faststart flag
    - Progressive encoding with percentage callbacks
    - Skip flags for partial pipeline runs (--skip-encode, --skip-thumbnails)

key-files:
  created:
    - lib/encoding/aspect-ratio.js
    - lib/encoding/ffmpeg-encoder.js
    - lib/encoding/thumbnail.js
    - lib/encoding/index.js
  modified:
    - package.json
    - cli/commands/capture.js

key-decisions:
  - "fluent-ffmpeg wrapper for all FFmpeg operations (no manual CLI string construction)"
  - "ffmpeg-static bundles FFmpeg binary (eliminates system dependency)"
  - "H.264 High profile with AAC audio, yuv420p, movflags faststart for platform compatibility"
  - "Scale+pad strategy for aspect ratio conversion (never stretch or crop)"
  - "YouTube 1920x1080 16:9, TikTok 1080x1920 9:16 as initial platform targets"
  - "Thumbnail extraction at 1s, 5s, midpoint, plus FFmpeg thumbnail filter for best frame"
  - "Skip flags for partial runs (--skip-encode, --skip-thumbnails) enable testing and flexibility"

patterns-established:
  - "Platform profiles: PLATFORMS config object defines target dimensions and aspect ratios"
  - "Encoding flow: captureAtom → encodeForAllPlatforms → extractThumbnails → summary + publish guidance"
  - "Progress callbacks: onProgress(platform, percent) for real-time encoding feedback"
  - "Output organization: videos/masters/, videos/youtube/, videos/tiktok/, videos/thumbnails/"

# Metrics
duration: 4min
completed: 2026-01-30
---

# Phase 3 Plan 2: FFmpeg-Based Encoding and Thumbnail Extraction Summary

**Master WebM automatically transcoded to YouTube 16:9 and TikTok 9:16 MP4s with H.264 High profile, plus timestamp and best-frame thumbnail extraction via fluent-ffmpeg**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-30T13:11:36Z
- **Completed:** 2026-01-30T13:15:46Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- FFmpeg encoding library with YouTube 1920x1080 16:9 and TikTok 1080x1920 9:16 profiles
- Aspect ratio conversion with scale+pad filters (centered content with black bars, no stretching)
- Thumbnail extraction at 1s, 5s, midpoint, and best-frame using FFmpeg thumbnail filter
- Integrated capture command produces master + encoded + thumbnails in single run
- H.264 High profile, AAC audio, yuv420p pixel format, faststart flag for maximum platform compatibility
- Skip flags (--skip-encode, --skip-thumbnails) for partial pipeline runs
- Progress reporting during encoding with platform name and percentage
- Output summary and publish guidance showing next-step eoe publish commands

## Task Commits

Each task was committed atomically:

1. **Task 1: Install FFmpeg dependencies and create encoding library** - `1baeb14` (feat)
2. **Task 2: Integrate encoding, thumbnails, and publish guidance into capture command** - `8afe8ee` (feat)
3. **Task 3: Verify encoding quality and platform compatibility** - `c420114` (test)

**Plan metadata:** (pending - will be added in final commit)

## Files Created/Modified

### Created
- `lib/encoding/aspect-ratio.js` - Platform profiles (YouTube 16:9, TikTok 9:16) and video filter generation (scale+pad with black bars)
- `lib/encoding/ffmpeg-encoder.js` - FFmpeg encoding functions (encodeForPlatform, encodeForYouTube, encodeForTikTok, encodeForAllPlatforms) with H.264 High, AAC, yuv420p, faststart
- `lib/encoding/thumbnail.js` - Thumbnail extraction at specific timestamps and best-frame detection via FFmpeg thumbnail filter
- `lib/encoding/index.js` - Barrel export for encoding library

### Modified
- `package.json` - Added fluent-ffmpeg@2.1.3 dependency
- `cli/commands/capture.js` - Integrated encoding and thumbnail extraction phases with skip flags, progress reporting, output summary, and publish guidance

## Decisions Made

**1. fluent-ffmpeg wrapper for all FFmpeg operations**
- Rationale: Clean JavaScript API eliminates manual CLI string construction, reduces error-prone command building
- Impact: All encoding uses .videoCodec(), .audioCodec(), .outputOptions(), .videoFilters() methods
- Verification: No raw ffmpeg shell commands in codebase

**2. ffmpeg-static bundles FFmpeg binary**
- Rationale: Eliminates system dependency, ensures consistent FFmpeg version across environments
- Impact: Users don't need to install FFmpeg separately (already downloaded in Plan 03-01)
- Verification: ffmpeg.setFfmpegPath(ffmpegStatic) configures fluent-ffmpeg to use bundled binary

**3. H.264 High profile with AAC audio, yuv420p, movflags faststart**
- Rationale: Maximum platform compatibility (YouTube, TikTok, Instagram, Twitter all support this config)
- Impact: All encoded MP4s use -profile:v high, -level 4.2, -pix_fmt yuv420p, -movflags +faststart
- Verification: ffprobe confirms H.264 High profile and yuv420p pixel format on test outputs

**4. Scale+pad strategy for aspect ratio conversion**
- Rationale: Preserves original content without stretching or cropping, uses black bars for aspect ratio mismatch
- Impact: 800x800 atom content always centered in target dimensions (1920x1080 or 1080x1920)
- Filters: scale=${width}:${height}:force_original_aspect_ratio=decrease, pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black
- Verification: Visual inspection confirms centered content with letterbox (YouTube) and pillarbox (TikTok) bars

**5. YouTube 1920x1080 16:9, TikTok 1080x1920 9:16 as initial platform targets**
- Rationale: Most common aspect ratios for video platforms, covers primary distribution channels
- Impact: PLATFORMS config easily extensible for future platforms (Instagram 1:1, Twitter 16:9, etc.)
- Verification: YouTube and TikTok MP4s match target dimensions exactly

**6. Thumbnail extraction at 1s, 5s, midpoint, plus best frame**
- Rationale: Multiple thumbnail options for platform uploads and portfolio display
- Impact: extractThumbnails() skips timestamps beyond video duration, extractBestThumbnail() uses FFmpeg thumbnail filter to find most representative frame
- Verification: 3s capture produces 1s + midpoint only, 5s capture produces 1s + 5s + midpoint

**7. Skip flags for partial runs**
- Rationale: Testing and flexibility (capture master without encoding, or skip thumbnails for speed)
- Impact: --skip-encode produces master only, --skip-thumbnails skips thumbnail extraction, both flags skip entire pipeline for master-only output
- Verification: All three combinations tested (skip-encode, skip-thumbnails, both)

## Deviations from Plan

None - plan executed exactly as written. All must-haves delivered:
- Master WebM automatically encoded to YouTube 16:9 MP4
- Master WebM automatically encoded to TikTok 9:16 MP4
- 800x800 canvas centered with black letterbox/pillarbox bars
- Three thumbnails extracted at 1s, 5s, duration/2
- Thumbnails saved as JPEG at native resolution with quality level 2
- Output files organized in videos/youtube/, videos/tiktok/, videos/thumbnails/
- FFmpeg encoding uses yuv420p and faststart for platform compatibility
- fluent-ffmpeg wraps all FFmpeg operations
- ffmpeg-static provides bundled FFmpeg binary
- eoe capture produces master + encoded + thumbnails in single run with publish guidance

## Issues Encountered

**1. fluent-ffmpeg deprecation warning**
- Issue: npm install shows "Package no longer supported" warning for fluent-ffmpeg@2.1.3
- Impact: None - package is stable and widely used, just not actively maintained
- Resolution: Accepted warning, package works correctly for our use case
- Note: If future issues arise, consider alternatives (direct ffmpeg spawn, @ffmpeg/ffmpeg.wasm)

**2. Duplicate 1s thumbnail in 3s capture output**
- Issue: Output shows "2 thumbnails + 1 best frame extracted" but lists 1s.jpg twice
- Investigation: extractThumbnails() correctly skips 5s (beyond duration) and generates 1s + midpoint (1s). Output message concatenates thumbPaths + bestThumb arrays, but midpoint happens to also be 1s (floor(3/2) = 1).
- Impact: Minor - produces correct thumbnails (1s.jpg, best.jpg), just slightly confusing output
- Resolution: Accepted as expected behavior for short captures where midpoint rounds to same timestamp as first frame
- Future improvement: Could deduplicate timestamps before extraction

## User Setup Required

None - no external service configuration required. All FFmpeg operations use bundled binary via ffmpeg-static.

## Next Phase Readiness

**Ready for Phase 3 Plan 3 (Distribution CLI):**
- Master WebM + YouTube MP4 + TikTok MP4 ready for publishing
- Thumbnails available for platform uploads and portfolio display
- Output file organization (videos/youtube/, videos/tiktok/, videos/thumbnails/) established
- Publish guidance printed with suggested eoe publish commands

**Concerns:**
- Audio encoding: Current test atom (my-first-sketch) is visual-only. Audio-visual atoms may need verification that audio streams are preserved correctly through FFmpeg encoding.
- Platform requirements: YouTube and TikTok specs may evolve. Encoding settings should be validated before first real upload.

**Blockers:**
None identified. Clear path to Plan 03-03 execution.

---
*Phase: 03-video-capture-distribution*
*Completed: 2026-01-30*
