---
phase: 04-mobile-gallery-ideation-tools
plan: 02
subsystem: mobile-pwa
tags: [gallery, code-viewer, notes-editor, prismjs, indexeddb, offline]
requires: [04-01]
provides:
  - Mobile gallery list view at /mobile/gallery with search
  - Atom detail view at /mobile/<slug> with tabbed Code/Config/Notes
  - Prism.js syntax highlighting (JavaScript, JSON, Markdown)
  - NOTES.md inline editor with View/Edit modes
  - Build-time metadata generation (atom-metadata.json)
  - Offline gallery via IndexedDB population
affects: [04-03, 04-04, 04-05]
tech-stack:
  added: [prismjs]
  patterns: [SSG-with-client-hydration, build-time-metadata-generation]
key-files:
  created:
    - portfolio/scripts/generate-metadata.js
    - portfolio/public/atom-metadata.json
    - portfolio/src/pages/mobile/gallery.astro
    - portfolio/src/pages/mobile/[slug].astro
    - portfolio/src/components/SearchBar.astro
    - portfolio/src/components/AtomListItem.astro
    - portfolio/src/components/CodeViewer.astro
    - portfolio/src/components/NotesViewer.astro
    - portfolio/src/components/NotesEditor.astro
    - portfolio/src/scripts/notes-editor.ts
  modified:
    - portfolio/package.json
decisions:
  - id: prismjs-over-shiki
    context: Need lightweight syntax highlighting for mobile
    choice: Prism.js with only 3 language components (JS/JSON/Markdown)
    rationale: Smaller bundle (<10KB vs Shiki's ~300KB), mobile-optimized, sufficient for atom code
    alternatives: [highlight.js, Shiki]
  - id: build-time-metadata-generation
    context: Need atom data available both SSG and client-side
    choice: Generate atom-metadata.json at build time with all atom data embedded
    rationale: Enables both SSG rendering and offline IndexedDB population, single source of truth
    alternatives: [runtime-fs-reads, separate-api-endpoint]
  - id: code-wrapping-strategy
    context: Mobile screens can't show long code lines
    choice: CSS pre-wrap with word-break for mobile viewports
    rationale: Better mobile UX than horizontal scroll, preserves readability
    alternatives: [horizontal-scroll, line-clipping]
  - id: notes-editor-inline
    context: Need quick editing without leaving detail view
    choice: View/Edit toggle within Notes tab
    rationale: Minimal context switch, same component handles view and edit
    alternatives: [separate-edit-page, modal-editor]
metrics:
  duration: 8m
  commits: 4
  files_created: 10
  files_modified: 2
  loc_added: ~1200
completed: 2026-01-31
---

# Phase 04 Plan 02: Mobile Gallery & Code Viewer Summary

**One-liner:** Mobile gallery with search, syntax-highlighted code viewer (Prism.js), and inline NOTES.md editor persisting to IndexedDB.

## What Was Built

Created the mobile gallery and atom detail views that enable browsing, viewing, and editing atoms on mobile devices.

### Gallery List View (/mobile/gallery)
- **SearchBar component:** Text input with custom event dispatch for real-time filtering
- **AtomListItem component:** Touch-friendly list items (64px min-height) with type badges and stage indicators
- **Gallery page:** SSG rendering from atom-metadata.json with all 6 atoms sorted by date (newest first)
- **Client-side search:** Filters atoms by name/slug without re-rendering
- **IndexedDB population:** First visit fetches atom-metadata.json and caches to IndexedDB for offline

### Atom Detail View (/mobile/<slug>)
- **CodeViewer component:** Prism.js syntax highlighting with Tomorrow Night theme
  - 14px font for mobile readability
  - pre-wrap to screen width (no horizontal scroll)
  - Supports JavaScript, JSON, Markdown (bundle <10KB)
- **NotesViewer component:** Read-only NOTES.md display with formatted text
- **Tab navigation:** Code | Config | Notes tabs (44px tap targets)
- **All content SSG:** Embedded at build time for offline access

### NOTES.md Inline Editor (IDEA-04)
- **NotesEditor component:** Replaces NotesViewer with View/Edit mode toggle
- **View mode:** Same read-only display as NotesViewer (default)
- **Edit mode:** Textarea with Save/Cancel buttons
- **Persistence:** Saves to IndexedDB atom notes field via notes-editor.ts helpers
- **Mobile-optimized:** 16px textarea font (prevents iOS zoom on focus)

### Build Infrastructure
- **generate-metadata.js:** Reads all atoms from ../atoms/, extracts slug/title/date/type/stage/code/notes/configJson, writes to atom-metadata.json
- **Package.json scripts:** Run generate-metadata before dev and build
- **Prism.js integration:** Only 3 language components loaded (keeps bundle minimal)

## Requirements Fulfilled

- **MOB-01 (View atom code on mobile):** CodeViewer with syntax highlighting ✓
- **MOB-02 (Browse atom gallery on mobile):** Gallery list with search ✓
- **MOB-03 (View NOTES.md on mobile):** NotesViewer in detail view ✓
- **IDEA-04 (Quick-edit NOTES.md on mobile):** NotesEditor with inline editing ✓

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan 04-01 dependency missing**
- **Found during:** Task 1 execution
- **Issue:** Plan 04-02 depends on 04-01 (PWA Foundation) but foundation files didn't exist
- **Fix:** Executed Plan 04-01 tasks first (install PWA deps, create db.ts, MobileLayout.astro, etc.)
- **Files created:**
  - portfolio/src/scripts/db.ts
  - portfolio/src/layouts/MobileLayout.astro
  - portfolio/src/components/OfflineIndicator.astro
  - portfolio/src/scripts/pwa-register.ts
  - portfolio/src/scripts/offline-status.ts
  - portfolio/src/styles/mobile.css
  - portfolio/public/pwa-*.png
- **Commit:** ff83046 (feat(04-01): implement PWA foundation)
- **Rationale:** Plan 04-02 cannot execute without MobileLayout.astro and db.ts from 04-01

## Technical Decisions

### Prism.js Over Shiki
Chose Prism.js with selective language imports over heavier alternatives. Bundle size critical for mobile: Prism.js core + 3 languages = ~30KB vs Shiki's ~300KB. Sufficient syntax highlighting for atom code without mobile performance penalty.

### Build-Time Metadata Generation
Generate atom-metadata.json at build time rather than runtime filesystem reads. Enables both SSG rendering and client-side IndexedDB population from single source of truth. Alternative (separate API endpoint) adds deployment complexity.

### Code Wrapping for Mobile
CSS pre-wrap with word-break instead of horizontal scroll. Mobile users expect vertical scrolling, not horizontal panning. Code readability prioritized over preserving exact line structure.

### Inline Notes Editor
View/Edit toggle within Notes tab instead of separate edit page or modal. Minimal context switch, reduces navigation overhead. User stays in detail view throughout editing flow.

## Files Created

1. **portfolio/scripts/generate-metadata.js** - Build-time atom metadata generator
2. **portfolio/public/atom-metadata.json** - Pre-generated atom data (6 atoms)
3. **portfolio/src/pages/mobile/gallery.astro** - Gallery list view with search
4. **portfolio/src/pages/mobile/[slug].astro** - Atom detail view with tabs
5. **portfolio/src/components/SearchBar.astro** - Search input with custom events
6. **portfolio/src/components/AtomListItem.astro** - Gallery list item with badges
7. **portfolio/src/components/CodeViewer.astro** - Prism.js syntax highlighter
8. **portfolio/src/components/NotesViewer.astro** - Read-only notes display
9. **portfolio/src/components/NotesEditor.astro** - Inline notes editor
10. **portfolio/src/scripts/notes-editor.ts** - Notes persistence helpers

## Files Modified

1. **portfolio/package.json** - Added prismjs, updated dev/build scripts
2. **portfolio/astro.config.mjs** - (Modified by 04-01 foundation work)

## Commits

1. **ff83046** - feat(04-01): implement PWA foundation (blocking dependency)
2. **1b4c373** - feat(04-02): install Prism.js and create build-time metadata generator
3. **09c1637** - feat(04-02): create gallery list view with search
4. **537a048** - feat(04-02): create atom detail view with code viewer and notes
5. **21d516f** - feat(04-02): add inline NOTES.md editor to atom detail view

## What's Next

**Plan 04-03: Parameter Tweaking**
- Sliders for config.json numeric parameters
- Real-time preview (challenging on mobile without atom runtime)
- Save overrides to IndexedDB configOverrides store

**Plan 04-04: Voice Notes**
- Web Audio API voice recording
- Whisper transcription (Phase 6)
- Attach to atoms

**Plan 04-05: Visual Annotations**
- Screenshot capture
- Canvas drawing for annotations
- Attach to atoms

## Verification Checklist

- [x] Gallery shows 6 atoms sorted by date (newest first)
- [x] Search filters atoms by name in real-time
- [x] Detail view shows syntax-highlighted code (verified Prism.js token classes in HTML)
- [x] Tab navigation works (Code/Config/Notes)
- [x] Code wraps to mobile viewport (pre-wrap CSS confirmed)
- [x] Back button returns to gallery
- [x] Build succeeds with 14 pages generated
- [x] IndexedDB population script exists in gallery page
- [x] Notes editor has View/Edit toggle
- [x] Textarea uses 16px font (prevents iOS zoom)

## Known Issues

None. All verification checks passed.

## Dependencies

**Builds on:**
- Plan 04-01 (PWA Foundation) - MobileLayout.astro, db.ts, IndexedDB schema

**Enables:**
- Plan 04-03 (Parameter Tweaking) - Detail view ready for config sliders
- Plan 04-04 (Voice Notes) - Gallery infrastructure for note attachments
- Plan 04-05 (Visual Annotations) - Gallery infrastructure for screenshot attachments

## Performance Notes

- **Prism.js bundle:** 29.82 KB (9.29 KB gzipped) - Within 10KB target
- **Build time:** 1.75s for 14 pages
- **Gallery page:** All atoms embedded at build time (no runtime fetch required for SSG)
- **IndexedDB population:** Async, non-blocking, happens after page render

## Next Phase Readiness

Phase 4 Plans 03-05 can proceed. Gallery and detail view infrastructure complete. Parameter tweaking (04-03) will extend detail view with sliders. Voice notes (04-04) and annotations (04-05) will attach to atoms via IndexedDB.
