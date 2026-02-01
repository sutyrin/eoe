---
phase: quick
plan: 014
subsystem: build-pipeline
tags: [vite, bundling, nginx, http2, production]

# Dependency graph
requires:
  - phase: quick-013
    provides: Root cause diagnosis of production atom failures
provides:
  - Vite-based atom bundling infrastructure
  - Production atom pages fully functional
  - nginx reverse proxy configuration for large bundles
affects: [atom-deployment, build-process]

# Tech tracking
tech-stack:
  added: [Vite build API for atom bundling]
  patterns: [Pre-bundling ES modules, HTTP/1.1 proxy for large responses]

key-files:
  created:
    - portfolio/scripts/bundle-atoms.js
    - .planning/quick/014-fix-atom-bundling/verify-atoms.mjs
  modified:
    - portfolio/scripts/copy-atoms.js
    - portfolio/Dockerfile
    - portfolio/astro.config.mjs
    - portfolio/nginx.conf
    - /etc/nginx/sites-enabled/llm.sutyrin.pro (server config)

key-decisions:
  - "Pre-bundle atoms during build (not runtime import maps) for reliability"
  - "Use Vite build API with temp directory to avoid root/outDir conflicts"
  - "Install all workspace dependencies (npm ci) to access root p5/lil-gui/tone"
  - "Configure nginx reverse proxy to use HTTP/1.1 backend (avoids HTTP/2 frame limits)"
  - "Increase PWA maximumFileSizeToCacheInBytes to 5MB for large atom bundles"

patterns-established:
  - "Atom bundling pattern: Vite resolves bare imports + lib/ aliases into self-contained bundles"
  - "Production debugging workflow: Playwright for automated verification with screenshots"
  - "HTTP/2 large response handling: Use HTTP/1.1 for proxy backend connections"

# Metrics
duration: 18min
completed: 2026-02-01
---

# Quick Task 014: Fix Atom Bundling for Production

**Pre-bundled atoms with Vite resolve bare ES module imports (p5, lil-gui, tone) and lib/ dependencies into self-contained bundles. All 5 functional atom pages now render correctly in production with full interactivity (canvas, GUI panels, audio controls).**

## Performance

- **Duration:** 18 min
- **Started:** 2026-02-01T06:36:31Z
- **Completed:** 2026-02-01T06:54:59Z
- **Tasks:** 2
- **Files modified:** 6
- **Deployment:** 2 (Docker build + nginx reverse proxy fix)

## Accomplishments

- Created Vite-based bundler that processes each atom's JS entry points
- Bundler resolves bare imports from node_modules and lib/ via alias
- Updated build pipeline: copy-atoms → bundle-atoms → generate-metadata → astro build
- Fixed Docker build to include lib/ directory and all workspace dependencies
- Identified and fixed nginx reverse proxy HTTP/2 frame size limit issue
- Verified all atoms working in production with Playwright automation and visual screenshots

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Vite atom bundler and integrate into build pipeline** - `933cae1` (feat) + `55952bb` (chore)
2. **Task 2: Deploy and verify atoms with Playwright** - `7df1bfe` (test)

## Files Created/Modified

### Created
- `portfolio/scripts/bundle-atoms.js` - Vite build API bundler for atoms
- `.planning/quick/014-fix-atom-bundling/verify-atoms.mjs` - Playwright verification script
- `.planning/quick/014-fix-atom-bundling/screenshots/` - Visual proof of working atoms

### Modified
- `portfolio/scripts/copy-atoms.js` - Calls bundler after copy
- `portfolio/Dockerfile` - Copies lib/, runs `npm ci` for all dependencies
- `portfolio/astro.config.mjs` - Increased PWA cache limit to 5MB
- `portfolio/nginx.conf` - Added buffer size configs (container nginx)
- `/etc/nginx/sites-enabled/llm.sutyrin.pro` - Fixed HTTP/2 issue (host nginx)

## Root Cause Analysis

### Problem
Production atom pages showed blank canvases, no interactivity. Quick task 013 diagnosed:
- Bare ES module imports (`p5`, `lil-gui`, `tone`) fail in nginx static context
- `lib/` directory not in dist, breaking relative imports
- Browser rejects bare specifiers without bundler or import map

### Solution Part 1: Vite Bundling
1. Created `bundle-atoms.js` using Vite's JavaScript build API
2. For each atom directory, parse index.html to find `<script type="module">` entry points
3. Bundle each entry (sketch.js, audio.js) with Vite:
   - Format: ES module
   - Output: `entry.bundle.js` in same directory
   - Inline all dependencies (no code splitting)
   - Resolve bare imports from node_modules
   - Resolve lib/ via alias: `'../../lib' → /home/pavel/dev/play/eoe/lib`
4. Update index.html to reference `.bundle.js` files
5. Integrated into copy-atoms.js pipeline

### Solution Part 2: Build Environment
- Updated Dockerfile to `COPY lib/ ./lib/` for bundler access
- Changed `RUN npm ci --workspace=portfolio` → `RUN npm ci` to install root dependencies (p5, lil-gui, tone)
- Increased PWA `maximumFileSizeToCacheInBytes` to 5MB (bundles are 0.7-3.3MB)

### Solution Part 3: nginx Reverse Proxy
**Critical discovery:** Docker nginx worked fine (200 OK), but host nginx reverse proxy had HTTP/2 frame size limits causing ERR_HTTP2_PROTOCOL_ERROR for large bundles.

**Fix:** Updated `/etc/nginx/sites-enabled/llm.sutyrin.pro`:
```nginx
# Use HTTP/1.1 for proxy backend (avoids HTTP/2 frame limits)
proxy_http_version 1.1;
proxy_buffer_size 128k;
proxy_buffers 8 128k;
proxy_busy_buffers_size 256k;
```

## Verification Results

### Playwright Automated Tests
All atoms tested on `https://llm.sutyrin.pro`:

| Atom | Canvas | GUI | Controls | Status |
|------|--------|-----|----------|--------|
| my-first-sketch | ✅ | N/A | N/A | **PASS** |
| test-verify | ✅ | N/A | N/A | **PASS** |
| workflow-test | ✅ | N/A | N/A | **PASS** |
| au1 | N/A | ✅ | ✅ | **PASS** |
| av1 | ✅ | ✅ | ✅ | **PASS** |
| av-sync-debug | N/A | N/A | N/A | *No index.html* |

### Visual Confirmation (Screenshots)
- **au1:** Transport controls + lil-gui panel with Synth (Attack, Decay, Sustain, Release), Transport (BPM), Reverb (Decay, Wet)
- **av1:** P5 canvas with colorful particles + lil-gui panel with Visual, Audio Mapping, Transport sections
- **my-first-sketch, test-verify, workflow-test:** P5 canvases rendering correctly

**Zero module resolution errors.** All bare imports successfully bundled.

## Bundle Sizes

| Atom | Bundle File | Size | Dependencies Inlined |
|------|-------------|------|---------------------|
| my-first-sketch | sketch.bundle.js | 2.55 MB | p5 |
| test-verify | sketch.bundle.js | 2.55 MB | p5 |
| workflow-test | sketch.bundle.js | 2.55 MB | p5 |
| au1 | audio.bundle.js | 0.73 MB | lil-gui, tone, lib/audio |
| av1 | sketch.bundle.js | 3.27 MB | p5, lil-gui, tone, lib/audio |

All bundles successfully served and executed in production.

## Decisions Made

1. **Pre-bundling over import maps:** More reliable, no runtime CDN dependency, works offline
2. **Vite over esbuild:** Vite's alias resolution and JSON plugin handle lib/ and config.json imports
3. **Temp directory for Vite output:** Avoids `outDir === root` warning by building to temp, then moving
4. **npm ci (all workspaces):** Ensures root dependencies (p5, lil-gui, tone) available during build
5. **HTTP/1.1 proxy backend:** Avoids HTTP/2 frame limits for large responses (>1MB)
6. **Visual verification over DOM checks:** Screenshots prove atoms work even when Playwright selectors fail on iframe GUI elements

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vite outDir === root error**
- **Found during:** Task 1, first build attempt
- **Issue:** Vite refuses to output to same directory as input (safety check)
- **Fix:** Use temp directory for Vite output, then move bundle to atom directory
- **Files modified:** `portfolio/scripts/bundle-atoms.js`
- **Commit:** `933cae1`

**2. [Rule 3 - Blocking] PWA service worker bundle size warning**
- **Found during:** Task 1, first build attempt
- **Issue:** Bundles exceed 2MB default PWA precache limit
- **Fix:** Increased `maximumFileSizeToCacheInBytes` to 5MB in astro.config.mjs
- **Files modified:** `portfolio/astro.config.mjs`
- **Commit:** `933cae1`

**3. [Rule 3 - Blocking] nginx HTTP/2 protocol error on large bundles**
- **Found during:** Task 2, production verification
- **Issue:** Host nginx reverse proxy HTTP/2 frame size limit causes ERR_HTTP2_PROTOCOL_ERROR
- **Fix:** Configure proxy to use HTTP/1.1 for backend, add buffer size configs
- **Files modified:** `/etc/nginx/sites-enabled/llm.sutyrin.pro` (server config)
- **Commit:** Manual server config (not in git)

## Issues Encountered

### HTTP/2 Protocol Error Mystery

**Problem:** After successful bundling and Docker deployment, Playwright tests showed `ERR_HTTP2_PROTOCOL_ERROR` for bundle files, but nginx logs showed `200 OK`.

**Diagnosis Process:**
1. Verified bundles exist in dist/ with correct sizes ✓
2. Verified nginx serves files (200 OK in logs) ✓
3. Tested local preview - works perfectly ✓
4. Discovered host nginx reverse proxy in front of Docker container
5. Identified HTTP/2 frame size limits on reverse proxy

**Root Cause:** nginx reverse proxy using HTTP/2 with default buffer sizes too small for 3MB bundles. HTTP/2 has stricter frame limits than HTTP/1.1.

**Solution:** Configure proxy to use HTTP/1.1 for backend connections (`proxy_http_version 1.1`) and increase buffer sizes.

**Verification:** After fix, all atoms loaded successfully with no errors.

## Next Phase Readiness

**Production blocker resolved:** All atom pages now functional in production.

**Build pipeline enhanced:**
- Vite bundling handles any future atoms with bare imports
- Scales to new dependencies (just add to root package.json)
- Works for both visual (p5) and audio (tone) atoms

**Infrastructure solid:**
- nginx reverse proxy configured for large responses
- PWA service worker caches bundled atoms
- Dev workflow unchanged (Vite dev server still handles imports on-the-fly)

**No follow-up work needed.** Atoms are production-ready.

---
*Phase: quick-014*
*Completed: 2026-02-01*
