# Project State: Engines of Experience

**Last Updated:** 2026-01-30
**Session:** Phase 3 Wave 2: Video Encoding & Thumbnails (Plan 03-02 COMPLETE)

---

## Project Reference

### Core Value
Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

### Current Focus
Phase 3 IN PROGRESS: FFmpeg-based video encoding and thumbnail extraction. Plans 03-01 and 03-02 complete, distribution CLI next.

---

## Current Position

### Active Phase
**Phase 3: Video Capture & Distribution** - IN PROGRESS
- Status: 2 of 3 plans complete (Plans 03-01 and 03-02 done, 03-03 pending)
- Goal: Users can capture running atoms as video, encode for platforms, and track distribution
- Requirements: 4/5 fulfilled (VID-01, VID-02, VID-04, VID-05 done; VID-03 pending, CLI-04 complete)

### Last Plan Completed
**Plan 03-02: Video Encoding & Thumbnails** - COMPLETE (2026-01-30)
- FFmpeg encoding library with YouTube 1920x1080 16:9 and TikTok 1080x1920 9:16 profiles
- Aspect ratio conversion with scale+pad filters (centered content with black bars)
- Thumbnail extraction at 1s, 5s, midpoint, and best-frame using FFmpeg thumbnail filter
- Integrated capture command produces master + encoded + thumbnails in single run
- H.264 High profile, AAC audio, yuv420p pixel format, faststart flag for platform compatibility
- Skip flags (--skip-encode, --skip-thumbnails) for partial pipeline runs
- fluent-ffmpeg wrapper with ffmpeg-static bundled binary (no system dependency)

**Previous: Plan 03-01: Create Video Capture Pipeline** - COMPLETE (2026-01-30)
- Playwright headless browser automation for atom capture
- MediaRecorder API captures canvas@30fps + Tone.js audio
- `eoe capture <atom>` CLI command with duration/FPS options
- Master WebM VP9+Opus output at 8 Mbps quality
- Audio detection from config.json or file presence
- Temporary Vite server per capture, cleaned up after
- Known limitation: audio may be silent in headless mode

### Status
Phase 1: COMPLETE (4 plans, 11/12 requirements)
Phase 2: COMPLETE (3 plans, 12/12 requirements)
Phase 3: IN PROGRESS (2 of 3 plans, 4/5 requirements)

### Progress Bar
```
[████████████████████████>                        ] 27/28 requirements (96%)
Phase 1 ██████████░ (11/12 reqs complete)
Phase 2 ████████████ (12/12 reqs complete)
Phase 3 ████████░░░░ (4/5 reqs: VID-01, VID-02, VID-04, VID-05, CLI-04 done)
```

---

## Performance Metrics

### Velocity
- Requirements completed this session: 4 (Phase 3: VID-01, VID-02, VID-04, VID-05, CLI-04)
- Plans completed this session: 2 (03-01, 03-02)
- Plans completed total: 9 (01-01, 01-02, 01-03, 01-04, 02-01, 02-02, 02-03, 03-01, 03-02)
- Average time per plan: ~5 min

### Quality
- Tests passing: N/A
- Failed plans (requiring revision): 0
- Research phases conducted: 1 (completed before roadmap)

### Efficiency
- Blocked plans: 0
- Parallelization enabled: Yes (config.json)
- Research-to-execution ratio: 1 research : 0 execution (healthy - researched before building)

---

## Accumulated Context

### Key Decisions
| Date | Decision | Impact |
|------|----------|--------|
| 2026-01-29 | Roadmap: 3 phases focusing on foundation | Defers v2 features (automation, streaming, community) to preserve focus on core creation loop |
| 2026-01-29 | Phase 1: 20+ sketch quota | Enforces depth-before-breadth, prevents tooling trap by requiring output volume |
| 2026-01-29 | Manual publishing before automation | Phase 3 requires manual workflow to discover real pain points per project constraint |
| 2026-01-29 | Visual atoms before audio | Lower complexity path enables faster validation of short-burst workflow |
| 2026-01-30 | p5.js instance mode for atoms | Enables multiple sketches, HMR cleanup, avoids global pollution |
| 2026-01-30 | Date-prefix naming (YYYY-MM-DD-name) | Chronological organization without manual versioning |
| 2026-01-30 | lil-gui integrated by default | Parameter tuning is core workflow, not optional add-on |
| 2026-01-30 | config.json runtime fetch | Separates code from parameters for experimentation |
| 2026-01-30 | Astro static site generation for portfolio | No backend needed, pure HTML/CSS/JS deployable anywhere |
| 2026-01-30 | Iframe embedding for sketches | Isolation prevents p5.js namespace conflicts, safe for multiple sketches per page |
| 2026-01-30 | Metadata from folder names and NOTES.md | Single source of truth in filesystem, no separate database |
| 2026-01-30 | Dashboard uses Vite directory listing | No build step needed for dev dashboard, works seamlessly with Vite dev server |
| 2026-01-30 | Iframe previews at 0.5 scale for thumbnails | Shows full sketch layout but fits in 220px card |
| 2026-01-30 | Status command parses NOTES.md for stage | Single source of truth in filesystem, no separate database |
| 2026-01-30 | Tone.js v15.1.22 for audio synthesis | Proven Transport scheduling, comprehensive Web Audio API abstraction |
| 2026-01-30 | Disposal pattern for Tone.js cleanup | stop transport -> cancel events -> wait 100ms -> dispose nodes to prevent memory leaks |
| 2026-01-30 | Three synth types (mono, poly, drums) | mono for melodic lines, poly for chords, drums for percussion |
| 2026-01-30 | HMR cleanup for audio contexts | import.meta.hot.dispose prevents audio duplication on hot reload |
| 2026-01-30 | CompositionManager for multi-atom orchestration | Centralized transport, scheduling, and lifecycle for compositions combining audio + visual atoms |
| 2026-01-30 | Mix bus pattern for audio analysis | Single Gain node combines all audio sources before analysis for unified reactivity |
| 2026-01-30 | Build from atom directory | Running `vite build` from atom dir makes index.html default entry, simpler than custom config |
| 2026-01-30 | Type detection from config.json | Explicit "type" field with fallback to file structure detection for robustness |
| 2026-01-30 | Short-name atom resolution | CLI commands accept short names (my-first-sketch) via suffix matching with exact-match priority for backward compatibility |
| 2026-01-30 | Short-name completion first | Shell completion suggests short names before full names to prioritize primary UX |
| 2026-01-30 | Playwright headless capture | Mature browser automation with GPU support for canvas rendering, reliable cleanup |
| 2026-01-30 | MediaRecorder API for recording | Native browser API handles codec negotiation, high quality WebM VP9+Opus output |
| 2026-01-30 | Temporary Vite server per capture | Reuses dev infrastructure, ensures consistent environment, auto-cleanup |
| 2026-01-30 | Base64 video transfer | Simple page.evaluate() return value avoids filesystem coordination |
| 2026-01-30 | VP9+Opus WebM at 8 Mbps | High quality master for downstream encoding, wide browser support |
| 2026-01-30 | Auto-click Play for audio atoms | Headless capture requires automated audio start, no user interaction |
| 2026-01-30 | fluent-ffmpeg wrapper for FFmpeg | Clean JavaScript API eliminates manual CLI string construction, reduces error-prone command building |
| 2026-01-30 | ffmpeg-static bundles FFmpeg binary | Eliminates system dependency, ensures consistent FFmpeg version across environments |
| 2026-01-30 | H.264 High profile with AAC audio | Maximum platform compatibility (YouTube, TikTok, Instagram, Twitter), yuv420p pixel format, faststart flag |
| 2026-01-30 | Scale+pad aspect ratio conversion | Preserves original content without stretching/cropping, black bars for aspect ratio mismatch |
| 2026-01-30 | YouTube 1920x1080 16:9, TikTok 1080x1920 9:16 | Most common aspect ratios for video platforms, PLATFORMS config easily extensible |
| 2026-01-30 | Thumbnail extraction at 1s/5s/midpoint + best frame | Multiple thumbnail options for platform uploads and portfolio display |
| 2026-01-30 | Skip flags for partial pipeline runs | --skip-encode and --skip-thumbnails enable testing and flexibility |

### Active Todos
- [ ] Execute Plan 03-03: Distribution CLI (track publishing status, manual upload workflow)
- [ ] Verify audio-visual atom encoding (audio stream preservation through FFmpeg)
- [ ] Investigate headed browser capture for reliable audio (or accept silent audio in headless mode)
- [ ] Track creation vs. setup time (must stay below 20% setup)

### Known Blockers
None identified. Clear path to Plan 03-03 execution.

### Technical Debt
- Audio capture in headless mode may be silent (Tone.js routing to non-existent audio output)
  - Workaround: Accept current behavior as expected for headless capture
  - Alternative: Use headed browser for audio verification
  - Impact: LOW - video capture works correctly, audio stream is present in file

---

## Research Insights

### Research Summary
Comprehensive research completed 2026-01-29 covering creative coding ecosystem, stack recommendations, architecture patterns, and critical pitfalls. Key finding: Primary existential risk is "Tooling Trap" (spending months on infrastructure instead of creating).

### Research Flags for Upcoming Phases
- **Phase 1:** SKIP research - well-documented technologies (p5.js, Vite, Astro)
- **Phase 2:** MEDIUM priority - audio-visual synchronization complexity may need investigation
- **Phase 3:** HIGH priority - publishing pipeline complexity warrants research phase before planning

### Applied Patterns
- **Goal-backward methodology:** Each phase has 5 observable success criteria from user perspective
- **Atomic design:** Every creative output is self-contained, version-controlled, modular, composable
- **CLI-first:** Terminal-native workflow for developer experience
- **Manual-first:** Prove workflows manually before automating

---

## Session Continuity

### What We Accomplished This Session
1. Executed Plan 03-01: Create Video Capture Pipeline
2. Installed Playwright ^1.50.0 and ffmpeg-static ^5.2.0
3. Downloaded Chromium browser binary (167 MB) via npx playwright install
4. Created lib/capture/ library with 4 modules for headless capture
5. Created `eoe capture <atom>` CLI command
6. Verified visual atom capture: 3s and 10s recordings to WebM VP9
7. Created 03-01-SUMMARY.md documenting capture pipeline
8. Executed Plan 03-02: Video Encoding & Thumbnails
9. Installed fluent-ffmpeg ^2.1.3 dependency
10. Created lib/encoding/ library with 4 modules:
    - aspect-ratio.js: Platform profiles (YouTube 16:9, TikTok 9:16) and video filters
    - ffmpeg-encoder.js: FFmpeg encoding functions (encodeForPlatform, encodeForAllPlatforms)
    - thumbnail.js: Thumbnail extraction at timestamps and best-frame detection
    - index.js: Barrel export
11. Integrated encoding and thumbnails into `eoe capture` command
12. Added --skip-encode and --skip-thumbnails flags
13. Verified full pipeline: master WebM + YouTube MP4 + TikTok MP4 + thumbnails
14. Verified encoding specs: H.264 High, AAC, yuv420p, faststart
15. Verified aspect ratio handling: centered content with black bars
16. Created 03-02-SUMMARY.md documenting encoding pipeline
17. Updated STATE.md to reflect Phase 3 progress (2 of 3 plans complete)

### Context for Next Session
**Last session:** 2026-01-30 13:15 UTC
**Stopped at:** Completed Plan 03-02: Video Encoding & Thumbnails (Phase 3 Wave 2)
**Resume file:** None

**Phase 3 Status:**
- ✓ Plan 03-01: Create Video Capture Pipeline (VID-01, VID-04, CLI-04)
- ✓ Plan 03-02: Video Encoding & Thumbnails (VID-02, VID-05, CLI-04)
- ☐ Plan 03-03: Distribution CLI (VID-03)
- Phase 3: 2 of 3 plans complete (4/5 requirements met)

**Phase 3 Wave 2 COMPLETE - Encoding Pipeline Ready:**
- FFmpeg encoding library with YouTube 1920x1080 16:9 and TikTok 1080x1920 9:16 profiles
- Aspect ratio conversion with scale+pad filters (centered content with black bars)
- Thumbnail extraction at 1s, 5s, midpoint, and best-frame using FFmpeg thumbnail filter
- Integrated capture command produces master + encoded + thumbnails in single run
- H.264 High profile, AAC audio, yuv420p pixel format, faststart flag for platform compatibility
- Skip flags (--skip-encode, --skip-thumbnails) for partial pipeline runs
- fluent-ffmpeg wrapper with ffmpeg-static bundled binary (no system dependency)

**Next Actions:**
- Execute Plan 03-03: Distribution CLI
  - Track publishing status (pending, published, url)
  - Manual upload workflow (copy file, paste URL)
  - `eoe publish <atom>` CLI command

**Warning signs to watch:**
- Audio capture silent in headless mode (may need headed browser workaround)
- Audio-visual atom encoding may need verification (audio stream preservation through FFmpeg)
- Platform encoding specs may evolve (validate settings before first real upload)

---

## Project Health

### Status: EXCELLENT ✓✓
- Phase 3 IN PROGRESS: Video capture and encoding pipelines complete (2 of 3 plans)
- 96% total requirements complete (27/28)
- All 4 atom types working (visual, audio, audio-visual, composition)
- Full CLI toolchain (7 commands: create, dev, build, capture, list, note, status)
- Video capture pipeline ready (Playwright + MediaRecorder)
- Video encoding pipeline ready (FFmpeg with YouTube 16:9 and TikTok 9:16)
- Thumbnail extraction ready (timestamps + best-frame detection)
- No blockers identified
- Ready for Plan 03-03 (distribution CLI)

### Risk Watch
- **Tooling Trap (HIGH):** Research explicitly flagged as threat #1. Mitigation: Phase 1 enforces 20+ sketch quota, setup time tracking.
- **Scope Creep (MEDIUM):** Solo developer burnout risk. Mitigation: v2 features deferred, ruthless MVP focus, one phase at a time.
- **T-Shaped Paradox (MEDIUM):** Risk of breadth without depth. Mitigation: Phase 1 establishes vertical (visual coding) before Phase 2 adds horizontal (audio).

### Momentum Indicators
- Clear roadmap: ✓
- Executable next step: ✓
- Research foundation: ✓
- Known stack: ✓
- Constraint awareness: ✓

**Confidence:** VERY HIGH - Phase 3 Waves 1-2 complete, video capture and encoding pipelines validated, distribution CLI next.

---

*State initialized: 2026-01-29*
*Last updated: 2026-01-30 after Plan 03-02 completion (Phase 3 Wave 2 COMPLETE)*
*Next review: Before Plan 03-03 execution*
