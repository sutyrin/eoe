# Phase 3: Video Capture & Distribution - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Capture running atoms (visual + audio) to video, encode for YouTube (16:9) and TikTok (9:16), extract thumbnails for platform uploads, and publish videos via CLI with platform API integration. Manual workflow discovery first — automate pain points in v2.

</domain>

<decisions>
## Implementation Decisions

### Recording Scope
- Single atom at a time: `eoe capture 2026-01-30-my-sketch`
- Default duration: 10 seconds, overridable via `--duration` flag
- Resolution: Canvas native (800x800) — no upscaling
- Output: Generate both master file AND platform-specific encoded versions (YouTube 16:9 + TikTok 9:16) from single capture

### Manual Publishing Workflow
- CLI publish command: `eoe publish video.mp4 --platform youtube` handles upload via API
- Metadata: Title required, description/tags/thumbnail optional via flags (--description, --tags, --thumbnail)
- Authentication: Save credentials after first `eoe auth youtube` / `eoe auth tiktok`, reuse for subsequent publishes
- Distribution tracking: Platform URLs stored in atom NOTES.md (e.g., `published: [youtube-url] [tiktok-url]`)
- Bulk publishing: `eoe publish --all` publishes all captured videos, or publish single file at a time
- Error handling: Retry 3 times with backoff on network/API failures, then report error

### Claude's Discretion
- Exact platform API client libraries (google-auth-library, TikTok SDK)
- FFmpeg encoding profiles and quality settings
- Thumbnail extraction algorithm (keyframe detection strategy)
- Credential storage location and encryption method

</decisions>

<specifics>
## Specific Ideas

- Captured videos should feel like artifacts of the atom — link back to the atom that created them
- Publishing should validate that platforms accept the video (aspect ratio, duration, codec) before uploading
- Should be able to document the publishing pain points for future automation (which metadata was hardest to fill, which API quirks emerged)

</specifics>

<deferred>
## Deferred Ideas

- Batch recording of multiple atoms — Phase 4 or future enhancement
- Platform-specific encoding profiles (Instagram Reels, YouTube Shorts) — add to backlog after YouTube/TikTok validated
- Automated scheduling/posting on platforms — Phase 4 automation layer
- Social media analytics tracking — separate phase when needed

</deferred>

---

*Phase: 03-video-capture-distribution*
*Context gathered: 2026-01-30*
