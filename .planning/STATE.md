# Project State: Engines of Experience

**Last Updated:** 2026-02-01
**Session:** v1.1 Complete + Quick Task 016 - Prism error handling and atom pages restored

---

## Project Reference

### Core Value
Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

### Current Focus
**v1.1 PLANNED:** Mobile-first ideation and composition workflow. Users can capture voice ideas, view/tweak atoms, compose multi-atom pieces on mobile, with simple cloud backup for continuity.

---

## Current Position

### Active Milestone
**v1.1: Mobile-First Creative Practice** - IN PROGRESS
- Duration: 8-12 weeks
- Phases: 4, 5, 6 (3 phases total)
- Requirements: 13 total (all mobile/composition/backup focused)

### Current Phase
**Phase 6: Composition Preview, Save, Cloud Backup** - COMPLETE (5/5 plans + deployed)
- Goal: Enable real-time preview of compositions with parameter routing, save/load capability, and cloud backup
- Requirements: COMP-04 (preview), COMP-05 (save/load), SYNC-01 (backup), SYNC-02 (status), SYNC-03 (restore)
- Delivered: Preview engine, immutable composition snapshots, cloud backup with auto-backup on app close, backup status UI and management, shareable composition URLs
- **Last activity:** 2026-02-01 - Quick task 022: Debugged mobile layout at FullHD vertical (1080x1920), identified CSS max-width constraint causing centered layout on gallery/backup pages

### Status
v1.0 COMPLETE (shipped 2026-01-30). v1.1 COMPLETE (shipped 2026-02-01). All 15 plans executed.

**Progress:** █████████████████████████████████████ 15/15 plans (100%)

---

## Milestone Progress

### v1.0 Status (COMPLETE)
- 3 phases, 10 plans executed
- 28/28 requirements fulfilled
- Full creation-to-distribution pipeline live
- Production-ready for solo creator

### v1.1 Status (COMPLETE)
- 3 phases executed (Phases 4-6)
- 13/13 requirements fulfilled
- 15/15 plans executed (all phases complete)
- Full mobile-first creative workflow live
- Cloud backup operational
- Shareable composition URLs live

---

## Accumulated Context

### Key Decisions (v1.1)
| Decision | Rationale | Outcome | Phase |
|----------|-----------|---------|-------|
| Mobile first (not sync first) | Creative value > infrastructure | Phase 4 focuses on ideation/composition tools | Planning |
| Simple cloud backup (not full sync) | Simpler implementation, validates mobile UX first | Phase 6: one-way backup + restore, defer P2P sync to v1.2 | Planning |
| Hybrid ideation + composition | Supports variable creative modes (ideation vs. hands-on) | Both voice capture and atom canvas in v1.1 | Planning |
| React Flow for composition UI | Touch-friendly, mature, MIT licensed | Simple dropdown routing Phase 5, visual graph deferred to v1.2 | Planning |
| Claude CLI (not API) | Personal use, no API key management | LLM deferred to v1.2; v1.1 focuses on core tools | Planning |
| PWA first, native later | Leverage existing web stack, Android native path open | Start with mobile web, migrate to native if needed | Planning |
| Adopt MIT/BSD libraries | Maximum creative freedom, avoid licensing constraints | React Flow, Tonal.js, Wavesurfer.js, Meyda ready to integrate | Planning |
| @vite-pwa/astro over raw Workbox | Astro integration, auto-registration | Service worker generates with correct config | 04-01 |
| CacheFirst for atoms, StaleWhileRevalidate for thumbnails | Atoms immutable, thumbnails change occasionally | Optimal cache hit rate and freshness balance | 04-01 |
| 44px minimum tap targets | Apple HIG compliance for touch UI | All mobile buttons/links meet accessibility standard | 04-01 |
| System fonts for mobile | Readability over code aesthetic | Better mobile UX, faster rendering | 04-01 |
| Storage quota monitoring at 80% | iOS can evict data aggressively | Early warning prevents data loss | 04-01 |
| Prism.js over Shiki | Mobile bundle size critical | ~30KB vs ~300KB, sufficient for atom code | 04-02 |
| Build-time metadata generation | Single source of truth for SSG + client | atom-metadata.json enables offline gallery | 04-02 |
| Code wrapping for mobile | Mobile UX > exact line structure | pre-wrap CSS, no horizontal scroll | 04-02 |
| Inline notes editor | Minimal context switch | View/Edit toggle within Notes tab | 04-02 |
| Quadratic Bezier smoothing for pen | Smooth curves vs jagged lines on fast strokes | continueStroke uses quadraticCurveTo | 04-05 |
| ImageData for undo/redo | Memory efficiency (10x vs base64) | History stores ImageData not toDataURL | 04-05 |
| 20-state undo limit | Prevent mobile memory exhaustion | ~80MB max for 1080p canvas | 04-05 |
| prompt() for text annotation | v1.1 simplicity over rich UI | Native dialog, defer custom modal to v1.2 | 04-05 |
| Single color pen | Focus on core workflow | No color picker in v1.1, defer to v1.2 | 04-05 |
| Heuristic range inference | No explicit min/max in config.json | Name and value-based slider ranges (hue: 0-360, etc.) | 04-03 |
| Instant parameter persistence | Mobile autosave UX pattern | Changes save immediately to IndexedDB, no Save button | 04-03 |
| Separate override storage | Easy reset and sync | Overrides stored separately from original config.json | 04-03 |
| Defer live preview to Phase 5 | Mobile performance/battery constraints | "Preview on desktop" message, no canvas rendering on mobile | 04-03 |
| React Flow for canvas | Touch-friendly, MIT licensed, mature | 47KB gzipped, mobile-optimized touch config | 05-01 |
| Tree-shaken React Flow imports | Bundle size critical | Named imports reduce from 600KB to 47KB | 05-01 |
| Client-side only React | React Flow requires DOM APIs | No SSR, Astro script tag with React.createElement | 05-01 |
| Same-type routing only | Phase 5 simplicity | number->number, string->string, no transforms yet | 05-01 |
| Max 5 atoms per composition | Phase 5 performance limit | Prevents mobile memory/rendering issues | 05-01 |
| React.memo on AtomNode | Prevent unnecessary re-renders | Custom comparator checks data changes only | 05-01 |
| Sandboxed iframe execution | Prevent interference between atoms | Each atom runs in isolated environment with separate globals, DOM, Web Audio context | 06-01 |
| 30fps routing loop | Balance responsiveness and mobile performance | Parameter changes apply ~every 33ms, smooth for audio/visual | 06-01 |
| Glitch detection via AudioContext.state | Catch interrupted state and buffer underruns | Users warned of audio issues, can choose Continue or Restart | 06-01 |
| User agency on glitches | Continue vs Restart gives user control | No forced stops, user decides if glitch is acceptable | 06-01 |
| Hybrid snapshot structure | Store slug + inline code in snapshots | Enables attribution while guaranteeing immutability | 06-02 |
| Separate snapshots store | Snapshots in dedicated IndexedDB store | Clear separation between mutable drafts and immutable snapshots | 06-02 |
| Snapshot read-only mode | Snapshots loaded without history/autosave | Clear UX signal: snapshots are records, not workspaces | 06-02 |
| Express backup server | Express over serverless for simple JSON file storage | No cold starts, persistent volume, easy debugging | 06-03 |
| sendBeacon for auto-backup | sendBeacon over fetch for page close reliability | Survives navigation on mobile, iOS Safari compatible | 06-03 |
| Timestamp-based backup IDs | YYYY-MM-DDTHH-MM-SS format for backup filenames | Natural chronological sorting, human-readable | 06-03 |
| Voice note metadata only | Exclude audio blobs from backups | Reduces backup size (audio typically large) | 06-03 |
| No auth in v1.1 backup | Single-user, private server | Simplifies implementation, defer auth to v1.2+ | 06-03 |
| Indefinite backup retention | Keep all backups, no storage limits | User manages their own storage, full archive available | 06-03 |
| Selective restore | items filter in restore endpoint | User can restore atoms, compositions, snapshots independently | 06-03 |
| visibilitychange over beforeunload | Use visibilitychange for auto-backup trigger | More reliable on mobile (iOS ignores beforeunload) | 06-03 |
| 3-retry exponential backoff | 1s, 2s, 4s retry delays | Network resilience for backup uploads | 06-03 |
| Query param shareable URLs | /c/?id=abc123 instead of /c/[id] dynamic route | Avoids Astro SSG complexity with runtime-generated IDs | 06-05 |
| Dual snapshot storage | Snapshots in backups AND standalone files | Backups for restore, standalone for lightweight sharing | 06-05 |
| Cross-backup search prioritization | Search most recent backups first | Performance optimization for typical sharing patterns | 06-05 |
| Badge shows pending count from both stores | Users need total unsynced count | Aggregates compositions + snapshots for accurate badge | 06-04 |
| Category-level restore checkboxes | v1.1 simplicity over per-item granularity | User selects atoms/compositions/snapshots categories | 06-04 |
| ConflictResolver ready but not triggered in v1.1 | v1.1 uses last-write-wins, defer conflict detection | UI complete, awaits enhanced sync in v1.2 | 06-04 |
| Periodic pending count checks | Badge accuracy without continuous polling | Check every 60s after initial 1.5s delay | 06-04 |
| Pre-bundle atoms for production | Bare ES module imports fail in static nginx context | Atoms must be bundled during build to resolve p5, lil-gui, tone from node_modules | quick-013 |
| Vite bundler for atoms | Option A from quick-013: build-time bundling | Atoms bundled with Vite during build, all dependencies inlined | quick-014 |
| HTTP/1.1 proxy for large responses | HTTP/2 frame limits cause errors on 3MB bundles | nginx reverse proxy uses HTTP/1.1 backend with increased buffers | quick-014 |

### Known Constraints
- **Mobile:** 6" phone screen, touch interaction, battery/bandwidth limits, iOS PWA limitations
- **Audio:** Web Audio API performance on mobile (Tone.js handles synthesis, need to validate multi-atom routing)
- **Storage:** IndexedDB quota (50MB cache typical), storage monitoring required
- **Offline:** All v1.1 features work offline except cloud backup

### Known Blockers
None - all blockers resolved.

**RESOLVED (quick-016):** Prism.js parsing error on production atom pages
- Fixed by: Adding try/catch error handling to CodeViewer
- Verified: All atom pages now load and display properly
- Result: Full v1.1 workflow restored in production

### Technical Debt
None inherited from v1.0. v1.1 builds on proven v1.0 foundation (no refactoring needed).

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 022 | Debug mobile layout at FullHD vertical (1080x1920) - found CSS max-width inconsistency | 2026-02-01 | 44aff1a | [022-debug-mobile-fullhd](./quick/022-debug-mobile-fullhd/) |
| 020 | Debug av-sync-debug missing canvas - root cause: no p5 instantiation | 2026-02-01 | eec3e2a | [020-debug-av-sync-missing-canvas](./quick/020-debug-av-sync-missing-canvas/) |
| 018 | Debug av-sync-debug atom page showing gallery instead of canvas | 2026-02-01 | 9027141 | [018-debug-av-sync-debug-page](./quick/018-debug-av-sync-debug-page/) |
| 017 | Fix dark theme control visibility and contrast (WCAG AA) | 2026-02-01 | 93a9e87 | [017-fix-dark-theme-controls](./quick/017-fix-dark-theme-controls/) |
| 016 | Fix atom pages by handling Prism errors and using metadata code | 2026-02-01 | 57a7817 | [016-fix-atom-pages-prism](./quick/016-fix-atom-pages-prism/) |
| 015 | Debug atom page display issues with Prism.js syntax errors | 2026-02-01 | d0b214e | [015-debug-atom-page](./quick/015-debug-atom-page/) |
| 014 | Fix atom bundling for production with Vite | 2026-02-01 | 7df1bfe | [014-fix-atom-bundling](./quick/014-fix-atom-bundling/) |
| 013 | Debug production atom page issues with Playwright | 2026-02-01 | eaef3c7 | [013-debug-atom-page](./quick/013-debug-atom-page/) |
| 012 | Deploy v1.1 and test Phase 6 features with Playwright | 2026-02-01 | 64f3ad8 | [012-deploy-test-phase6](./quick/012-deploy-test-phase6/) |
| 011 | Deploy to fra server at https://llm.sutyrin.pro | 2026-01-31 | 4c5f0ba | [011-deployment-to-fra-server](./quick/011-deployment-to-fra-server/) |

---

## Session Continuity

### What We Accomplished This Session
1. Executed Phase 4 Plan 01: PWA Foundation & Offline Infrastructure
2. Executed Phase 4 Plan 02: Mobile Gallery & Code Viewer
3. Executed Phase 4 Plan 03: Parameter Tweaking UI
4. Executed Phase 4 Plan 04: Voice Notes with Whisper Transcription
5. Executed Phase 4 Plan 05: Screenshot Annotation Tool
6. Created mobile gallery list view with search at /mobile/gallery
7. Created atom detail view at /mobile/<slug> with syntax-highlighted code viewer
8. Added Prism.js with selective language imports (JavaScript, JSON, Markdown)
9. Implemented inline NOTES.md editor with View/Edit modes and IndexedDB persistence
10. Created parameter tweaking UI with sliders and number inputs
11. Heuristic range inference (hue: 0-360, size: 0-300, speed: 0-10, noiseScale: 0-1)
12. Instant IndexedDB persistence for parameter changes
13. Visual indicators for changed parameters (blue left border)
14. Reset button to restore original config.json values
15. Integrated OpenAI Whisper API for voice note transcription
16. Built voice recorder with MediaRecorder API (WebM/AAC capture)
17. Created canvas annotation tool with quadratic Bezier smoothing
18. ImageData-based undo/redo (20-state limit, memory-efficient)
19. Text annotation with white background for readability
20. WebP export to IndexedDB screenshots store
21. Created build-time metadata generator (atom-metadata.json)
22. All mobile features work offline after first visit (except transcription)

### Context for Next Session
**Last session:** 2026-02-01
**Stopped at:** Completed Quick Task 018 - Debug av-sync-debug Atom Page (root cause identified: missing index.html and bundled files)
**Resume file:** None

**Production Status:**
- ✅ All atom pages working: Prism.js error handling in place (graceful fallback)
- ✅ Vite bundling works for production (atoms load)
- ✅ nginx reverse proxy configured correctly (no HTTP/2 errors)
- ✅ Gallery list rendering at /mobile/gallery
- ✅ All atom detail pages accessible and interactive
- ✅ Code viewer displays original metadata code (with or without highlighting)
- ✅ All tabs (Code, Config, Notes, Params, Voice) functional

**Phase 6 Status:**
- ✓ Plan 01: Preview Engine complete (8 min execution)
- ✓ Plan 02: Composition Snapshots complete (9 min execution)
- ✓ Plan 03: Cloud Backup complete (5 min execution)
- ✓ Plan 04: Backup Status UI & Management complete (6 min execution)
- ✓ Plan 05: Shareable URLs & E2E Verification complete (8 min execution)
- ✓ Plan 04: Backup Status UI & Management complete (5 min execution)

**Phase 6 Progress:**
- Preview engine with sandboxed atom execution
- Real-time parameter routing at 30fps
- Route visualization with pulsing animation
- Audio glitch detection and user recovery
- Simultaneous and sequential playback modes
- Immutable composition snapshots with inline atom code
- Hybrid structure (slug reference + inline code)
- Lossless save/reload cycle
- Snapshots visible in compositions list with metadata
- Express backup server with persistent Docker volume
- Auto-backup on app close via sendBeacon
- 3-retry exponential backoff for network resilience
- Selective restore (atoms, compositions, snapshots)
- Sync status indicator with real-time progress
- Backup status badge with visual states (synced/pending/active/error)
- RestoreModal with category checkboxes
- ConflictResolver for per-item merge decisions
- Shareable composition URLs at /c/?id=[id]
- Read-only composition viewer with playback
- Server snapshot endpoints (GET/POST /api/snapshot)
- Share button with upload and clipboard integration
- BackupStatusBadge in app header (synced/pending/active/error states)
- /mobile/backup management page with manual trigger
- RestoreModal with category-based selective restore
- ConflictResolver UI ready for enhanced sync

**Gallery ready:**
- Gallery list view with search functional
- Atom detail view with syntax-highlighted code
- NOTES.md inline editor with IndexedDB persistence
- Parameter tweaking UI with sliders and instant feedback
- All features work offline after first visit

**All artifacts in place:**
- `.planning/REQUIREMENTS.md` — v1.1 + v1.2+ features
- `.planning/ROADMAP.md` — Phase 4-6 structure, success criteria
- `.planning/research/` — All domain research (mobile, modular, infrastructure)
- `.planning/PROJECT.md` — Updated with v1.1 goals

---

## Research Artifacts

**Location:** `.planning/research/`

| File | Purpose | Confidence |
|------|---------|------------|
| STACK.md | Sync + LLM infrastructure | HIGH |
| FEATURES.md | Mobile workflows, LLM variations | MEDIUM |
| ARCHITECTURE.md | Integration patterns | HIGH |
| PITFALLS.md | Failure modes + prevention | HIGH |
| MOBILE-VISUAL-MODULAR.md | Touch composition UIs | MEDIUM |
| EXISTING-INFRASTRUCTURE.md | 35+ projects analyzed | HIGH |
| SUMMARY.md | Research synthesis | HIGH |

All research informs Phase 4+ planning and execution.

---

## Project Health

### Status: READY FOR EXECUTION ✓
- v1.0 COMPLETE and stable
- v1.1 fully researched and scoped
- Phase 4 ready to plan and execute
- No blockers identified
- All dependencies understood
- Infrastructure identified (React Flow, Tone.js, etc.)

### Momentum
- Clear user value: mobile ideation + composition
- Simple technical path: build on v1.0 foundation
- Realistic scope: 8-12 weeks for 3 phases
- Risk mitigation: research identified and documented

### Next Step
**Run `/gsd:plan-phase 4`** to create execution plan for Phase 4: Mobile Gallery & Ideation Tools.

---

*State initialized: 2026-01-29 (v1.0)*
*Last updated: 2026-01-31 after v1.1 milestone initialization*
*Next review: Before Phase 4 execution*
