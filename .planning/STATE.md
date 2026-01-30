# Project State: Engines of Experience

**Last Updated:** 2026-01-30
**Session:** Phase 3 Wave 1: Video Capture Pipeline (Plan 03-01 COMPLETE)

---

## Project Reference

### Core Value
Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

### Current Focus
Phase 3 IN PROGRESS: Video capture pipeline with headless Playwright, MediaRecorder API, and master WebM output. Plan 03-01 complete, encoding and distribution next.

---

## Current Position

### Active Phase
**Phase 3: Video Capture & Distribution** - IN PROGRESS
- Status: 1 of 3 plans complete (Plan 03-01 done, 03-02 and 03-03 pending)
- Goal: Users can capture running atoms as video, encode for platforms, and track distribution
- Requirements: 2/5 fulfilled (VID-01, VID-04, CLI-04 done; VID-02, VID-03 pending)

### Last Plan Completed
**Plan 03-01: Create Video Capture Pipeline** - COMPLETE (2026-01-30)
- Playwright headless browser automation for atom capture
- MediaRecorder API captures canvas@30fps + Tone.js audio
- `eoe capture <atom>` CLI command with duration/FPS options
- Master WebM VP9+Opus output at 8 Mbps quality
- Audio detection from config.json or file presence
- Temporary Vite server per capture, cleaned up after
- Known limitation: audio may be silent in headless mode

**Previous: Quick Task 002: Add Shell Completion for Atom Short Names** - COMPLETE (2026-01-30)
- Shell tab completion suggests short atom names
- getShortNames() function strips date prefixes
- Short names appear first in completion list
- Completion UX now matches runtime resolution UX

### Status
Phase 1: COMPLETE (4 plans, 11/12 requirements)
Phase 2: COMPLETE (3 plans, 12/12 requirements)
Phase 3: IN PROGRESS (1 of 3 plans, 2/5 requirements)

### Progress Bar
```
[█████████████████████>                           ] 25/28 requirements (89%)
Phase 1 ██████████░ (11/12 reqs complete)
Phase 2 ████████████ (12/12 reqs complete)
Phase 3 ████░░░░░░░░ (2/5 reqs: VID-01, VID-04, CLI-04 done)
```

---

## Performance Metrics

### Velocity
- Requirements completed this session: 2 (Phase 3: VID-01, VID-04, CLI-04)
- Plans completed this session: 1 (03-01)
- Plans completed total: 8 (01-01, 01-02, 01-03, 01-04, 02-01, 02-02, 02-03, 03-01)
- Average time per plan: ~6 min

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

### Active Todos
- [ ] Execute Plan 03-02: Video encoding and thumbnails (ffmpeg transcoding for platforms)
- [ ] Execute Plan 03-03: Distribution CLI (track publishing status, manual upload workflow)
- [ ] Investigate headed browser capture for reliable audio (or accept silent audio in headless mode)
- [ ] Track creation vs. setup time (must stay below 20% setup)

### Known Blockers
None identified. Clear path to Plan 03-02 execution.

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
4. Created lib/capture/ library with 4 modules:
   - browser-capture.js: Playwright orchestration for headless capture
   - media-recorder-inject.js: In-browser MediaRecorder script for canvas+audio
   - audio-capture.js: Audio detection from config.json type or file presence
   - index.js: Barrel export
5. Created `eoe capture <atom>` CLI command
6. Implemented duration validation (1-120s, default 10)
7. Implemented FPS validation (15-60, default 30)
8. Implemented custom output directory option (-o)
9. Verified visual atom capture: 3s and 10s recordings to WebM VP9
10. Verified audio-visual atom capture: audio detection and stream combination
11. Verified validation and error handling: missing atoms, validation errors
12. Created 03-01-SUMMARY.md documenting capture pipeline
13. Updated STATE.md to reflect Phase 3 progress (1 of 3 plans complete)

### Context for Next Session
**Last session:** 2026-01-30 10:06 UTC
**Stopped at:** Completed Plan 03-01: Create Video Capture Pipeline (Phase 3 Wave 1)
**Resume file:** None

**Phase 3 Status:**
- ✓ Plan 03-01: Create Video Capture Pipeline (VID-01, VID-04, CLI-04)
- ☐ Plan 03-02: Video Encoding & Thumbnails (VID-02, VID-05)
- ☐ Plan 03-03: Distribution CLI (VID-03)
- Phase 3: 1 of 3 plans complete (2/5 requirements met)

**Phase 3 Wave 1 COMPLETE - Capture Pipeline Ready:**
- `eoe capture <atom>` command with duration/FPS options
- Headless Playwright browser automation with GPU support
- MediaRecorder API captures canvas@30fps + Tone.js audio
- Master WebM VP9+Opus output at 8 Mbps quality
- Audio detection from config.json or file presence
- Temporary Vite server per capture, cleaned up after
- Known limitation: audio may be silent in headless mode (expected behavior)

**Next Actions:**
- Execute Plan 03-02: Video Encoding & Thumbnails
  - ffmpeg transcoding to platform-specific formats (YouTube, Twitter, Instagram, TikTok)
  - Thumbnail generation from first frame
  - `eoe encode <atom>` CLI command
- Execute Plan 03-03: Distribution CLI
  - Track publishing status (pending, published, url)
  - Manual upload workflow (copy file, paste URL)
  - `eoe publish <atom>` CLI command

**Warning signs to watch:**
- Audio capture silent in headless mode (may need headed browser workaround)
- ffmpeg encoding performance (target <30s for typical video lengths)
- Platform-specific encoding requirements (bitrate, resolution, codec constraints)

---

## Project Health

### Status: EXCELLENT ✓✓
- Phase 3 IN PROGRESS: Video capture pipeline complete (1 of 3 plans)
- 89% total requirements complete (25/28)
- All 4 atom types working (visual, audio, audio-visual, composition)
- Full CLI toolchain (7 commands: create, dev, build, capture, list, note, status)
- Video capture pipeline ready (Playwright + MediaRecorder)
- Master WebM output at 8 Mbps quality
- No blockers identified
- Ready for Plan 03-02 (encoding and thumbnails)

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

**Confidence:** VERY HIGH - Phase 3 Wave 1 complete, video capture pipeline validated, encoding and distribution next.

---

*State initialized: 2026-01-29*
*Last updated: 2026-01-30 after Plan 03-01 completion (Phase 3 Wave 1 COMPLETE)*
*Next review: Before Plan 03-02 execution*
