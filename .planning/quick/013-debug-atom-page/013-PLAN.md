---
phase: quick
plan: 013
type: execute
wave: 1
depends_on: []
files_modified:
  - ".planning/quick/013-debug-atom-page/debug-atom.mjs"
  - ".planning/quick/013-debug-atom-page/013-SUMMARY.md"
autonomous: true

must_haves:
  truths:
    - "Playwright captures DOM state, console errors, and network failures from the production atom page"
    - "Root cause of 'nothing works' is identified with specific broken import paths and missing files"
    - "Diagnosis includes concrete fix recommendations comparing dev vs production module resolution"
  artifacts:
    - path: ".planning/quick/013-debug-atom-page/screenshots/"
      provides: "Visual evidence of broken atom page"
    - path: ".planning/quick/013-debug-atom-page/013-SUMMARY.md"
      provides: "Root cause analysis and fix recommendations"
  key_links:
    - from: "playwright"
      to: "https://llm.sutyrin.pro/atom/2026-01-30-av1/"
      via: "browser automation"
      pattern: "page.goto.*atom/2026-01-30-av1"
---

<objective>
Debug production issues on https://llm.sutyrin.pro/atom/2026-01-30-av1/ where user reports "click play and nothing works, no canvas, no editing."

Purpose: Use Playwright to capture the exact browser state (DOM, console errors, network failures) on the production atom page, then diagnose why the atom iframe fails to render canvas/play functionality.

Output: Playwright debug script, screenshots, console error logs, and root cause analysis with fix recommendations.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/012-deploy-test-phase6/012-PLAN.md

Key facts from investigation:
- Atom page at /atom/2026-01-30-av1/ uses P5Sketch.astro component which embeds an iframe: `<iframe src="/atoms/2026-01-30-av1/index.html">`
- The atom's index.html loads `<script type="module" src="./sketch.js">` as a RAW ES module (not bundled by Astro/Vite)
- sketch.js has bare imports: `import p5 from 'p5'`, `import GUI from 'lil-gui'` -- these FAIL in production (no bare module resolution from nginx)
- sketch.js imports `../../lib/audio/smoothing.js` -- resolves to `/lib/audio/smoothing.js` which does NOT exist in dist/
- audio.js imports `../../lib/audio/index.js` -- same problem, path doesn't exist in production dist
- In Vite dev mode, these resolve fine (Vite handles bare imports and fs.allow: ['..'] enables parent dir access)
- In production (nginx serving static dist/), raw ES module imports from node_modules and relative lib/ paths all fail
- CONFIRMED: `portfolio/dist/lib/` does NOT exist. `portfolio/dist/atoms/2026-01-30-av1/sketch.js` still has raw bare imports.

Likely root cause (pre-diagnosis): Atoms in public/ are copied as-is to dist/ without bundling. Their ES module imports (bare specifiers like 'p5', 'lil-gui' and relative paths to lib/) cannot resolve in a static nginx environment. This worked in dev because Vite's dev server intercepts all module requests.

Playwright testing will CONFIRM this by capturing:
1. Console errors showing failed module resolution
2. Network 404s for import paths
3. Missing canvas element (p5 never initializes)
4. Play button present but non-functional (audio.js fails to load)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run Playwright against production atom page, capture DOM state, console errors, and network failures</name>
  <files>.planning/quick/013-debug-atom-page/debug-atom.mjs</files>
  <action>
Write a Playwright script at `.planning/quick/013-debug-atom-page/debug-atom.mjs` that:

1. Launches Chromium browser (desktop viewport 1280x800, since atom pages are desktop-oriented)
2. Navigates to `https://llm.sutyrin.pro/atom/2026-01-30-av1/`
3. Collects ALL console messages (errors, warnings, logs) from both the main page AND the iframe
4. Monitors network requests and captures any that fail (4xx, 5xx, or blocked)
5. Waits for page load + 3 seconds for JS execution
6. Takes a full-page screenshot of the main page
7. Attempts to access the iframe content:
   - Get the iframe element (`iframe[title="2026-01-30-av1"]`)
   - Access iframe's contentFrame()
   - Check for: canvas element, #playBtn, #stopBtn, .lil-gui elements
   - Take screenshot of iframe content if accessible
   - Log iframe's document.body.innerHTML (truncated to 2000 chars)
8. Clicks the Play button (inside iframe) if it exists, waits 2 seconds, captures any new console errors
9. Also navigate directly to `https://llm.sutyrin.pro/atoms/2026-01-30-av1/index.html` (the raw iframe URL) to get unfiltered console errors
10. For the raw URL: capture all console errors, check for canvas, check for failed network requests (especially .js imports)
11. Save all results to a JSON file at `.planning/quick/013-debug-atom-page/debug-results.json`
12. Save screenshots to `.planning/quick/013-debug-atom-page/screenshots/`

Run the script with: `node .planning/quick/013-debug-atom-page/debug-atom.mjs`

Key things to capture in the JSON output:
- `consoleErrors`: array of {source, message, type} from both page and iframe
- `networkFailures`: array of {url, status, statusText} for failed requests
- `domState`: {hasCanvas, hasPlayBtn, hasStopBtn, hasGUI, iframeAccessible, bodySnippet}
- `afterClickPlay`: {newErrors, anyChange}
- `directUrlErrors`: console errors when loading index.html directly
  </action>
  <verify>
Script runs without crashing: `node .planning/quick/013-debug-atom-page/debug-atom.mjs` exits 0.
Screenshots exist in `.planning/quick/013-debug-atom-page/screenshots/`.
`debug-results.json` exists with console errors and DOM state.
  </verify>
  <done>
Playwright has captured the complete browser state of the broken atom page: console errors, network failures, DOM element presence/absence, and screenshots.
  </done>
</task>

<task type="auto">
  <name>Task 2: Analyze Playwright results, compare with expected v1.0 behavior, write root cause diagnosis</name>
  <files>.planning/quick/013-debug-atom-page/013-SUMMARY.md</files>
  <action>
Read the debug-results.json and screenshots from Task 1. Also read the source files for comparison:
- `portfolio/public/atoms/2026-01-30-av1/sketch.js` (has bare imports: p5, lil-gui, ../../lib/audio/)
- `portfolio/public/atoms/2026-01-30-av1/audio.js` (has relative import: ../../lib/audio/index.js)
- `portfolio/public/atoms/2026-01-30-av1/index.html` (loads sketch.js as raw module)
- `portfolio/src/components/P5Sketch.astro` (embeds atom via iframe)

Analyze and document:

1. **Console Errors Analysis**: Categorize every console error. Expected errors:
   - `Failed to resolve module specifier "p5"` (bare import, no import map)
   - `Failed to resolve module specifier "lil-gui"` (bare import)
   - 404 on `/lib/audio/smoothing.js` and `/lib/audio/index.js` (relative path outside dist)
   - Any cascading errors from p5 not loading (no canvas created)

2. **Network Failures Analysis**: Identify which .js files returned 404 or failed to load

3. **DOM State Analysis**: Confirm canvas element is missing (p5 never initialized), Play/Stop buttons exist (from index.html) but are non-functional (audio.js failed to import)

4. **Root Cause**: Atoms in `public/` are raw ES modules with:
   - Bare specifiers (`p5`, `lil-gui`, `tone`) that require a bundler or import map
   - Relative paths to `../../lib/audio/` which exist in the repo but NOT in the built dist
   - These work in Vite dev mode (Vite resolves bare imports, fs.allow: ['..'] enables parent access)
   - They FAIL in production (nginx serves static files, no module resolution)

5. **Expected v1.0 Behavior**: The atom SHOULD show:
   - An 800x800 p5.js canvas with audio-reactive visuals
   - Play/Stop transport buttons that trigger Tone.js audio
   - lil-gui parameter panel for tweaking visuals
   - The canvas should render even before clicking play (draws with silent audio data)

6. **Fix Recommendations** (diagnose, do NOT implement):
   - Option A: Pre-bundle atoms during build (add a Vite/esbuild step in copy-atoms.js that bundles each atom's sketch.js into a self-contained module)
   - Option B: Add import maps to each atom's index.html pointing bare specifiers to CDN URLs (esm.sh or unpkg)
   - Option C: Copy lib/ directory to dist and use absolute paths
   - Recommend which option is most aligned with the project's architecture

Write the summary to `.planning/quick/013-debug-atom-page/013-SUMMARY.md` following the standard summary template. Include:
- Frontmatter with phase, plan, status, execution_time
- What was done
- Key findings (with specific error messages from Playwright)
- Root cause (dev vs production module resolution mismatch)
- Fix recommendations ranked by effort and alignment
- Files produced
  </action>
  <verify>
`013-SUMMARY.md` exists and contains:
- Specific console error messages from the Playwright run
- Clear root cause explanation (bare imports + missing lib/ in production)
- At least 2 fix recommendations with tradeoffs
  </verify>
  <done>
Root cause of "nothing works" is diagnosed with evidence from Playwright. Summary documents the exact failure chain (bare imports -> no canvas -> no audio -> nothing works) and provides actionable fix recommendations.
  </done>
</task>

</tasks>

<verification>
- `node .planning/quick/013-debug-atom-page/debug-atom.mjs` runs and produces results
- Screenshots captured showing the broken page state
- debug-results.json contains console errors proving module resolution failures
- 013-SUMMARY.md documents root cause and fix recommendations
</verification>

<success_criteria>
- Playwright evidence confirms WHY the atom page breaks in production (specific error messages captured)
- Root cause traced to bare ES module imports in atoms that aren't processed by the bundler
- Fix recommendations provided so next quick task can implement the actual fix
- User's report of "nothing works" is fully explained (canvas missing because p5 fails to load, play button dead because audio.js fails to import)
</success_criteria>

<output>
After completion, create `.planning/quick/013-debug-atom-page/013-SUMMARY.md`
</output>
