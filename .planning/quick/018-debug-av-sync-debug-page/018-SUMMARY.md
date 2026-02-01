---
phase: quick
plan: 018
status: complete
execution_time: 15 minutes
task: "Debug av-sync-debug atom page showing gallery instead of canvas"
date_completed: 2026-02-01
---

# Quick Task 018: Debug av-sync-debug Atom Page Issue

## Summary

Investigated why the page for atom `2026-01-30-av-sync-debug` displays a gallery grid instead of the expected atom's canvas with controls.

**Key Finding:** The atom is **incomplete** — missing the `index.html` file that serves as the entry point for the iframe, which causes nginx to return a fallback response (likely the main gallery index page).

## What We Found

### Page State (from Playwright capture)
- **Page Title:** "av-sync-debug - Engines of Experience" ✓
- **Page Heading:** "av-sync-debug" ✓
- **Page Displays Gallery:** YES (grid of 5 atom cards visible in iframe)
- **Has Canvas Element in Iframe:** NO
- **Has Play/Stop Buttons in Iframe:** NO
- **Console Errors:** 6 errors (Prism.js parsing errors on OTHER atoms' bundles — not related to av-sync-debug)

### Network Requests
- **Main Request:** `https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/` → loads Astro page ✓
- **Iframe Load:** `https://llm.sutyrin.pro/atoms/2026-01-30-av-sync-debug/index.html` → **FAILS** (404 or fallback)
- **Result:** Browser receives gallery HTML instead of atom HTML
- **Pattern:** Same request made for iframes of au1, av1, my-first-sketch, etc., but those succeed because they have index.html

### Filesystem State
**av-sync-debug directory contents:**
- `audio.js` (2.4 KB)
- `sketch.js` (1.9 KB)
- `config.json` (515 B)
- **MISSING:** `index.html`
- **MISSING:** `audio.bundle.js` or `sketch.bundle.js`

**Comparison to working atom (au1):**
```
au1 (WORKING):
- audio.js (4.5 KB) [source]
- audio.bundle.js (748 KB) [bundled for production]
- config.json (450 B)
- index.html (1.7 KB) [CRITICAL]
- NOTES.md (385 B)

av-sync-debug (BROKEN):
- audio.js (2.4 KB) [source only]
- sketch.js (1.9 KB) [source only]
- config.json (515 B)
- NO index.html
- NO bundled files
```

### Architecture Analysis
The page routing flow:
1. User navigates to `/atom/2026-01-30-av-sync-debug/`
2. Astro page ([slug].astro) renders, shows title and metadata
3. P5Sketch component renders `<iframe src="/atoms/2026-01-30-av-sync-debug/index.html">`
4. Browser requests `/atoms/2026-01-30-av-sync-debug/index.html`
5. **Request fails** (file doesn't exist)
6. **Browser fallback:** Shows directory listing or server default page
7. **Result observed:** Gallery page displays in the iframe (likely from a default Astro route or nginx fallback)

## Root Cause

**The av-sync-debug atom is incomplete.**

Unlike all other atoms (au1, av1, my-first-sketch, test-verify, workflow-test):
- av-sync-debug has **NO `index.html`** — the HTML shell that loads bundled code
- av-sync-debug has **NO bundled files** (.bundle.js) — the production JavaScript

This is a **missing setup step**, not a bug or routing issue.

### Why This Happened
av-sync-debug was added to the atoms directory with only source files (audio.js, sketch.js, config.json) but was never:
1. Given an index.html template (like au1 has)
2. Bundled for production with Vite (unlike the 5 other atoms that were bundled in quick-014)

## Fix Recommendation

**Recommended approach: Create index.html for av-sync-debug**

Since av-sync-debug is marked as `type: "audio-visual"` in config.json (combining audio and visual elements), it needs both audio and sketch bundled.

### Option A: Complete the atom (RECOMMENDED for v1.1)
**Steps:**
1. Create `/portfolio/public/atoms/2026-01-30-av-sync-debug/index.html` with both audio and visual controls
2. Add av-sync-debug to the Vite bundler configuration (if it isn't already)
3. Build bundled files: `audio.bundle.js` and `sketch.bundle.js`
4. Deploy

**Why recommended:**
- Consistent with other atoms
- av-sync-debug appears intentional (has full config.json, audio.js, sketch.js)
- User may be actively developing this atom

### Option B: Remove av-sync-debug from site (ALTERNATIVE)
**Steps:**
1. Delete `/portfolio/public/atoms/2026-01-30-av-sync-debug/` directory entirely
2. Redeploy

**Why NOT recommended:**
- atom directory structure and config.json suggest active development
- Would lose work in progress
- Other atoms in same directory are working fine

### Option C: Add graceful fallback to P5Sketch (ARCHITECTURAL CHANGE)
**Steps:**
1. Modify P5Sketch.astro to handle 404 responses
2. Show error message instead of gallery

**Why NOT recommended:**
- Doesn't fix the root issue (missing atom setup)
- Adds complexity to component
- Better to complete the atom than hide the problem

## Evidence

### Screenshots
- **main-page.png** (61 KB): Full page screenshot showing page header and gallery displayed in iframe
- **main-page-with-viewport.png** (46 KB): Viewport version

### Debug Results
See: `.planning/quick/018-debug-av-sync-debug-page/debug-results.json`

Key data:
```json
"pageState": {
  "pageShowsGallery": false (main page),
  "iframeUrl": "/atoms/2026-01-30-av-sync-debug/index.html",
  "iframeAccessible": true,
  "iframeHasCanvas": false
},
"filesystem": {
  "hasIndexHtml": false,
  "hasBundledFiles": false,
  "files": ["audio.js", "config.json", "sketch.js"]
}
```

### Console Analysis
- 6 Prism.js parsing errors (on OTHER atoms' bundles, not av-sync-debug) — these are unrelated noise from gallery rendering
- AudioContext warnings (normal for browser autoplay policy)
- No errors specific to av-sync-debug failing to load

## Conclusion

**Status:** Diagnosed successfully

**Root Cause:** av-sync-debug is an incomplete atom missing essential setup files (index.html and bundled JavaScript)

**Recommended Action:** Complete the atom setup by creating index.html and bundling JavaScript files (quick-019 task)

**Impact:** Currently the atom is non-functional. User sees gallery instead of canvas. Once index.html and bundled files are added, the page will render correctly like au1 and av1 do.

**Next Steps:** Quick-019 should implement Option A above to complete av-sync-debug atom setup.
