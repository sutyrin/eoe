# Phase 4: Mobile Gallery & Ideation Tools - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

---

<domain>
## Phase Boundary

Establish mobile (PWA) as accessible companion to desktop, enabling users to:
1. Browse and view existing atoms (gallery + detail view)
2. Tweak atom parameters on touch screen
3. Capture ideation (voice notes, screenshot annotations, quick text notes)
4. Work completely offline

Mobile is a **viewing/capture tool**, not a code editor. Desktop remains primary workspace.

</domain>

---

<decisions>
## Implementation Decisions

### Atom Gallery Layout
- **Display format:** List view (not grid), showing thumbnail + title + date modified + atom type
- **Ordering:** Most recent first (reverse chronological, matching YYYY-MM-DD naming)
- **Search:** Text search by atom name/folder name (simple text filter)
- **Interaction:** Tap atom → open detail view (full code, params, notes on single page)

### Code Viewing Experience
- **Syntax highlighting:** Yes, using existing library (highlight.js, prismjs, or similar) — zero custom code editor
- **Font size:** Readable/large font on 6" screen (readability prioritized over fitting more lines)
- **Line numbers:** No (cleaner look, more space for code)
- **Search:** Ctrl+F style search with highlight (find + next/prev navigation)
- **Line wrapping:** Normal vertical scroll, code wraps to fit screen width (no horizontal scroll)
- **Implementation:** Adopt existing code viewer library, do NOT build custom editor

### Voice Note Workflow
- **Recording:** Single tap to start, tap again to stop (simple on/off button)
- **Transcription timing:** Auto-transcribe immediately after recording stops (transcription happens in background)
- **Transcription service:** Whisper API (OpenAI) — accuracy prioritized over offline capability
- **Storage:** Store as separate voice note files (audio file + transcript in atoms/{name}/voice-notes/ directory), separately from NOTES.md
- **Transcription handling:** Let user review/edit transcript before final save

### Screenshot Annotation Tools
- **Drawing tools:** Pen (freehand) + Text annotations (user can add text labels)
- **No shapes:** Circles, rectangles deferred to future — keep v1.1 simple
- **Pen styling:** Single color (black or dark), user can adjust stroke width
- **Undo/Redo:** Yes, full undo/redo stack (user can undo/redo multiple strokes)
- **Storage:** Save as image files in atoms/{name}/screenshots/ directory with timestamps, sync to desktop
- **Format:** PNG or JPG (you decide during implementation)

### Parameter Tweaking
- **Feedback:** Instant visual feedback when user adjusts slider (real-time parameter update in local config)
- **Persistence:** Changes saved to local config.json immediately
- **Desktop sync:** Parameter changes sync to desktop on next sync cycle (Phase 6)
- **Live preview:** Not in Phase 4 — parameters update config but don't auto-preview (preview happens on desktop or in Phase 5+ composition)

### Claude's Discretion
- Code viewer library choice (highlight.js vs prismjs vs other)
- Screenshot image format (PNG vs JPG, compression settings)
- Whisper API integration details (error handling, timeout behavior)
- Exact UI for recording button (icon, placement, visual feedback)
- Stroke width slider details (min/max range, default)
- Storage quota monitoring (when to warn user about storage)

</decisions>

---

<specifics>
## Specific Ideas

- Mobile companion, not replacement for desktop — user should feel natural context-switching between devices
- Voice notes are for ideation capture during commute — should feel quick and frictionless
- Annotation on screenshots is for marking up inspiration — not a full drawing app
- Code viewing is for understanding what atoms do — not for editing or debugging
- All tools should work offline (except Whisper transcription which requires network)

</specifics>

---

<deferred>
## Deferred Ideas

- **Shape drawing tools** (rectangles, circles, arrows) — add to Phase 5+ if annotation needs grow
- **Live parameter preview on mobile** — deferred to Phase 5 composition preview
- **Multi-color pen** — single color is sufficient for v1.1
- **Voice note organization/tagging** — keep simple in v1.1, organize later
- **Screenshot gallery/lightbox** — keep minimal in v1.1, add viewer if needed

</deferred>

---

*Phase: 04-mobile-gallery-ideation-tools*
*Context gathered: 2026-01-31*
