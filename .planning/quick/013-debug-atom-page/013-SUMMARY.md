---
phase: quick
plan: 013
subsystem: testing
tags: [playwright, debugging, production, es-modules]

# Dependency graph
requires:
  - phase: quick-012
    provides: Deployed v1.1 to production server
provides:
  - Root cause diagnosis of production atom page failures
  - Playwright debugging infrastructure for production testing
  - Evidence-based fix recommendations for module resolution
affects: [atom-bundling, build-process]

# Tech tracking
tech-stack:
  added: [@playwright/test for production debugging]
  patterns: [Playwright browser automation, iframe debugging, module error capture]

key-files:
  created:
    - .planning/quick/013-debug-atom-page/debug-atom.mjs
    - .planning/quick/013-debug-atom-page/debug-results.json
    - .planning/quick/013-debug-atom-page/screenshots/
  modified:
    - package.json (added @playwright/test)

key-decisions:
  - "Used pageerror listener to capture module resolution errors (console listener doesn't catch them)"
  - "Tested both iframe and direct URL to confirm error occurs in both contexts"
  - "Captured screenshots to visually confirm missing canvas/GUI elements"

patterns-established:
  - "Playwright debugging pattern: capture console + pageerror + network + DOM + screenshots"
  - "Production debugging workflow for atom iframe issues"

# Metrics
duration: 8min
completed: 2026-02-01
---

# Quick Task 013: Debug Production Atom Page Issues

**Playwright automation captured root cause: bare ES module imports fail in production (p5, lil-gui, tone) + missing lib/ directory prevents relative imports, resulting in blank atom pages with no canvas or interactivity**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-01T06:22:25Z
- **Completed:** 2026-02-01T06:30:25Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Automated production debugging with Playwright browser automation
- Captured exact module resolution error: "Failed to resolve module specifier 'p5'. Relative references must start with either '/', './', or '../'."
- Confirmed root cause with evidence: bare imports + missing lib/ in dist breaks all atom functionality
- Provided 3 ranked fix recommendations with tradeoffs analysis

## Task Commits

Each task was committed atomically:

1. **Task 1: Run Playwright against production atom page** - `738ad6b` (test)
2. **Task 2: Analyze results and write root cause diagnosis** - (this commit) (docs)

## Files Created/Modified

- `.planning/quick/013-debug-atom-page/debug-atom.mjs` - Playwright script to capture production errors
- `.planning/quick/013-debug-atom-page/debug-results.json` - Captured console errors, DOM state, network failures
- `.planning/quick/013-debug-atom-page/screenshots/` - Visual evidence of broken state
- `package.json` - Added @playwright/test dev dependency

## Key Findings

### Console Errors Captured

**Primary Error (both iframe and direct URL):**
```
Failed to resolve module specifier "p5". Relative references must start with either "/", "./", or "../".
```

This error occurs immediately when sketch.js tries to load. The browser's native ES module loader rejects bare specifiers like `import p5 from 'p5'` because they require a bundler or import map to resolve.

### DOM State Analysis

**Expected state (v1.0 working behavior):**
- 800x800 p5.js canvas with audio-reactive visuals
- lil-gui parameter panel for tweaking
- Play/Stop buttons trigger Tone.js audio
- Canvas renders even before Play (with silent audio data)

**Actual production state:**
- ❌ No canvas element (p5 never initializes)
- ❌ No lil-gui panel (lil-gui fails to import)
- ✓ Play/Stop buttons exist (from index.html)
- ❌ Buttons non-functional (audio.js fails to import dependencies)
- ❌ Blank iframe with only transport controls visible

### Network Failures

No 404s captured for the initial .js files (sketch.js, audio.js load successfully), BUT:
- The module RESOLUTION fails at browser parse time (before network request)
- Bare imports (`p5`, `lil-gui`, `tone`) never trigger network requests (browser rejects them immediately)
- Relative imports (`../../lib/audio/smoothing.js`) would resolve to `/lib/audio/smoothing.js` which doesn't exist in dist

### File System Evidence

**In dist/atoms/2026-01-30-av1/:**
- ✓ `sketch.js` exists with bare imports: `import p5 from 'p5'`, `import GUI from 'lil-gui'`
- ✓ `audio.js` exists with bare import: `import * as Tone from 'tone'`
- ✓ Both files have relative imports: `import {...} from '../../lib/audio/index.js'`
- ❌ `/lib/audio/` does NOT exist in dist/ (exists at repo root but not copied)

**In source (atoms/ directory):**
- ✓ `lib/audio/` exists at `/home/pavel/dev/play/eoe/lib/audio/`
- ✓ Contains: `index.js`, `smoothing.js`, `analyser.js`, etc.
- ✓ Atoms reference it via `../../lib/audio/` (works in dev with Vite's fs.allow: ['..'])

## Root Cause

### Why It Works in Development

1. **Vite dev server intercepts ALL module requests**
   - Bare imports (`p5`, `lil-gui`, `tone`) → resolved to `node_modules/`
   - Relative imports (`../../lib/audio/`) → resolved with `fs.allow: ['..']` config
   - Module graph built on-the-fly, dependencies fetched from node_modules

2. **All atoms run in Vite's module resolution context**
   - Dev server acts as a module bundler/resolver
   - No pre-bundling needed

### Why It Breaks in Production

1. **Nginx serves static files only**
   - No module resolution capability
   - No access to node_modules
   - No awareness of parent directory structure

2. **Atoms copied as-is to dist/atoms/**
   - Raw ES modules with bare imports remain untransformed
   - `copy-atoms.js` does simple file copy (no bundling)
   - `lib/` directory not copied to dist at all

3. **Browser's native ES module loader rejects bare imports**
   - Spec requires relative (`./`, `../`) or absolute (`/`) paths, or URLs
   - `import p5 from 'p5'` is invalid without import map
   - Cascading failure: no p5 → no canvas, no lil-gui → no parameter panel, audio.js can't import lib → no audio

## Fix Recommendations

### Option A: Pre-bundle Atoms During Build (RECOMMENDED)

**What:** Add a Vite/esbuild bundling step in `copy-atoms.js` that processes each atom's sketch.js into a self-contained bundle.

**How:**
1. Modify `scripts/copy-atoms.js` to bundle each atom's sketch.js
2. Use Vite's build API or esbuild to resolve bare imports from node_modules
3. Copy lib/ to dist/lib/ or inline lib modules into bundles
4. Output bundled sketch.js to dist/atoms/[atom]/sketch.js

**Pros:**
- Aligns with existing build process (Vite already bundles Astro pages)
- No runtime import maps needed
- Efficient bundles (tree-shaking, minification)
- Works with any npm dependency
- lib/ modules can be inlined or externalized as needed

**Cons:**
- Build step becomes slightly more complex
- Atom bundles larger than raw source (but still small: ~50-100KB)
- Source maps needed for debugging

**Effort:** 2-3 hours to implement and test

---

### Option B: Add Import Maps to Each Atom

**What:** Generate import maps in each atom's index.html pointing bare specifiers to CDN URLs (esm.sh, unpkg, or skypack).

**How:**
1. Add `<script type="importmap">` to each atom's index.html
2. Map `p5 → https://esm.sh/p5@1.x`, `lil-gui → https://esm.sh/lil-gui@0.x`, etc.
3. Copy lib/ to dist/lib/ for relative imports
4. Leave sketch.js as-is (bare imports now resolve via import map)

**Pros:**
- No bundling needed
- Atoms remain readable raw source
- CDN caching benefits
- Simple to understand

**Cons:**
- Runtime network requests for each dependency (slower page load)
- Relies on third-party CDN availability
- Version pinning more fragile
- lib/ must be copied to dist (or also use CDN imports)
- Import maps browser support (96% but not universal)

**Effort:** 1-2 hours to implement, ongoing CDN dependency

---

### Option C: Copy lib/ and Use Absolute Paths

**What:** Copy lib/ to dist/lib/ and rewrite atom imports to use absolute paths (`/lib/audio/index.js`).

**How:**
1. Modify `scripts/copy-atoms.js` to copy lib/ to dist/lib/
2. Rewrite atom imports from `../../lib/` to `/lib/` (string replace or AST transform)
3. Still need Option A or B for bare imports (p5, lil-gui, tone)

**Pros:**
- Fixes lib/ path issues
- Simple file copy

**Cons:**
- Doesn't solve bare import problem (still need bundling or import maps)
- Rewriting imports fragile (what if new atoms use different patterns?)
- Partial solution only

**Effort:** 30 min, but incomplete fix

---

### Recommendation Ranking

1. **Option A (Pre-bundle)** - Best long-term solution, aligns with build architecture
2. **Option B (Import maps)** - Fast fix if CDN acceptable, good for prototyping
3. **Option C** - Incomplete, would need A or B anyway

**Next Quick Task should implement Option A** to get production atoms working properly.

## Decisions Made

- Used Playwright over manual browser testing for reproducibility
- Captured both iframe context and direct URL to confirm error occurs in both
- Installed @playwright/test as dev dependency (useful for future E2E testing)
- Prioritized bundling approach (Option A) as most aligned with existing Astro/Vite build

## Deviations from Plan

None - plan executed exactly as written. Playwright script captured all required diagnostic data (console errors, DOM state, screenshots).

## Issues Encountered

### Module Errors Not Appearing in Console Listener

**Problem:** Initial Playwright run showed 0 console errors despite broken page.

**Diagnosis:** ES module resolution errors occur during browser's module parsing phase, BEFORE execution. The `console` event only captures runtime console.log/error calls, not module loader errors.

**Solution:** Added `pageerror` event listener which captures uncaught exceptions including module resolution failures. This revealed the exact error message.

**Verification:** Re-ran script, captured "Failed to resolve module specifier 'p5'" error successfully.

## Next Phase Readiness

**Blocker for production atoms:** Option A (pre-bundling) must be implemented before any atoms work in production.

**Files ready for next quick task:**
- `portfolio/scripts/copy-atoms.js` - needs bundling logic added
- `portfolio/public/atoms/` - contains raw atoms to be bundled
- `lib/audio/` - needs to be included in bundles or copied to dist

**Technical path clear:** Vite build API or esbuild can bundle atoms, import maps known fallback.

---
*Phase: quick-013*
*Completed: 2026-02-01*
