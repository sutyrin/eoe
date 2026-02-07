---
phase: quick
plan: 018
type: execute
wave: 1
depends_on: []
files_modified:
  - ".planning/quick/018-debug-av-sync-debug-page/debug-av-sync.mjs"
  - ".planning/quick/018-debug-av-sync-debug-page/018-SUMMARY.md"
autonomous: true

must_haves:
  truths:
    - "Page navigation to av-sync-debug atom shows what content is actually rendering (gallery or canvas)"
    - "Filesystem state and bundling status of av-sync-debug is confirmed (has index.html or missing)"
    - "Root cause identified: incomplete atom, missing index.html, or routing bug"
    - "Fix recommendation provided based on evidence"
  artifacts:
    - path: ".planning/quick/018-debug-av-sync-debug-page/debug-results.json"
      provides: "Playwright DOM capture, console errors, what's actually rendering"
    - path: ".planning/quick/018-debug-av-sync-debug-page/screenshots/"
      provides: "Visual evidence of what user sees"
    - path: ".planning/quick/018-debug-av-sync-debug-page/018-SUMMARY.md"
      provides: "Root cause analysis and actionable fix"
  key_links:
    - from: "P5Sketch.astro"
      to: "/atoms/{slug}/index.html"
      via: "iframe src"
      pattern: "src=.*atoms.*index\\.html"
    - from: "filesystem"
      to: "/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-av-sync-debug/"
      via: "file check"
      pattern: "ls.*av-sync-debug"
---

<objective>
Debug https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/ where user reports seeing a gallery instead of the atom's canvas, with no visible controls.

Purpose: Determine if this is an incomplete atom (missing index.html), a bundling issue, or a page routing bug that shows fallback content.

Output: Playwright debugging results, screenshots, filesystem analysis, and clear fix recommendation.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key facts:
- av-sync-debug atom directory exists at portfolio/public/atoms/2026-01-30-av-sync-debug/
- Contains: audio.js, sketch.js, config.json (found via `find`)
- Does NOT contain: index.html (not in list of 5 atoms with index.html)
- Page structure: [slug].astro -> P5Sketch.astro component -> iframe src="/atoms/{slug}/index.html"
- Other atoms (au1, av1, my-first-sketch, test-verify) all have index.html + bundled files
- Quick-013 to Quick-014 diagnosed and fixed atom bundling issues with Vite

Why av-sync-debug might show gallery instead of canvas:
1. Missing index.html -> iframe fails to load -> fallback occurs somewhere?
2. Or: Page routing shows gallery as fallback for missing atoms?
3. Or: av-sync-debug is incomplete and intentionally skipped during bundling

Recent commits indicate production bundling works for 5 atoms. av-sync-debug is the 6th atom but wasn't bundled.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Capture page state with Playwright, verify filesystem status</name>
  <files>.planning/quick/018-debug-av-sync-debug-page/debug-av-sync.mjs</files>
  <action>
Create a Playwright script that investigates the av-sync-debug page issue from two angles:

**Part A: Playwright Browser Capture**
1. Launch Chromium (desktop viewport 1280x800)
2. Navigate to `https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/`
3. Wait 3 seconds for page load and JS execution
4. Collect ALL console messages (from both main page and iframe)
5. Take full-page screenshot of main page
6. Inspect the iframe element:
   - Get `<iframe>` tag and read its `src` attribute (what URL is it trying to load?)
   - Try to access iframe's contentFrame() and check:
     - Does iframe have canvas element?
     - Does iframe have play/stop buttons?
     - What's the iframe's innerHTML? (gallery-like or canvas-like?)
   - Take screenshot of iframe content if accessible
7. Check if page shows gallery (look for elements like: gallery container, atom list, search bar)
8. Capture network requests to understand what actually loaded
9. Save all results to `.planning/quick/018-debug-av-sync-debug-page/debug-results.json` with:
   - `pageTitle`: what the HTML title says
   - `pageHeading`: what h1/h2 text says
   - `iframeUrl`: the src attribute of the iframe
   - `iframeAccessible`: true/false (could we reach iframe content?)
   - `iframeHasCanvas`: true/false
   - `iframeHasPlayBtn`: true/false
   - `iframeHasGallery`: true/false (look for gallery-specific elements)
   - `consoleErrors`: array of {message, source}
   - `pageShowsGallery`: true/false (inferred from visible elements)
10. Take screenshots:
    - main-page.png (full page)
    - iframe-content.png (if accessible)

**Part B: Filesystem Check (run via Node.js in same script)**
1. Check if `/home/pavel/dev/play/eoe/portfolio/public/atoms/2026-01-30-av-sync-debug/index.html` exists
2. List all files in that directory
3. Check if there are bundled files (.bundle.js files) present
4. Compare to other atoms (au1, av1) which have index.html + .bundle.js files
5. Record in results JSON under `filesystem` section:
   - `hasIndexHtml`: true/false
   - `hasBundledFiles`: true/false
   - `files`: [list of all files in directory]
   - `comparisonToAu1`: brief notes on differences

Save the script and run with: `node .planning/quick/018-debug-av-sync-debug-page/debug-av-sync.mjs`
  </action>
  <verify>
Script runs: `node .planning/quick/018-debug-av-sync-debug-page/debug-av-sync.mjs` exits 0
Screenshots exist in `.planning/quick/018-debug-av-sync-debug-page/screenshots/`
`debug-results.json` exists with populated pageShowsGallery, iframeUrl, and filesystem sections
  </verify>
  <done>
Playwright has captured what user actually sees on the page, and filesystem state of av-sync-debug atom is confirmed.
  </done>
</task>

<task type="auto">
  <name>Task 2: Analyze results and write diagnosis with fix recommendation</name>
  <files>.planning/quick/018-debug-av-sync-debug-page/018-SUMMARY.md</files>
  <action>
Read debug-results.json, screenshots, and cross-reference with code:

**Analysis**

1. **Determine the root cause** - use Playwright results and filesystem check:
   - If `pageShowsGallery === true` AND `hasIndexHtml === false` -> Likely **Cause A: Missing index.html causes fallback to gallery**
     - Why: P5Sketch component tries to load `/atoms/av-sync-debug/index.html`, which returns 404
     - Fallback: Page shows gallery (need to check if there's error handling in P5Sketch or parent page)
   - If `pageShowsGallery === true` AND `hasIndexHtml === true` BUT `hasBundledFiles === false` -> Likely **Cause B: index.html exists but atom not bundled**
     - Why: index.html tries to load bundled files that don't exist (like sketch.bundle.js)
     - Similar to Quick-013/014 issue: missing bundling for production
   - If `iframeUrl` is NOT `/atoms/av-sync-debug/index.html` -> **Cause C: Routing bug**
     - Why: P5Sketch component or Astro page is pointing to wrong URL
   - If iframe is inaccessible and no errors -> **Cause D: Page doesn't render iframe at all**
     - Why: Astro page might skip P5Sketch rendering for some reason

2. **Compare to working atoms**:
   - au1 has: index.html (manually written HTML), audio.bundle.js
   - av1 has: index.html (manually written HTML), sketch.bundle.js
   - av-sync-debug has: audio.js, sketch.js, config.json (NO index.html)
   - This is a clear difference: av-sync-debug is missing the HTML container file

3. **Determine status**:
   - Is av-sync-debug **intentionally incomplete** (no index.html means user hasn't created the HTML shell)?
   - Or is this a **build bug** (index.html should exist but wasn't created)?

4. **Provide fix recommendation** based on what's missing:
   - If missing index.html: Create index.html (copy template from au1 or av1, adapt to av-sync-debug)
   - If missing bundled files: Add bundling step for av-sync-debug in Vite bundler
   - If routing bug: Fix P5Sketch or [slug].astro to handle missing atoms gracefully

Write the summary to `.planning/quick/018-debug-av-sync-debug-page/018-SUMMARY.md`:
- Frontmatter: phase, plan, status (complete), execution_time
- **What was done**: Investigated page rendering and filesystem state
- **What we found**:
  - av-sync-debug directory structure (what files exist)
  - What page actually shows (gallery or canvas?)
  - Why it's showing what it shows (missing index.html vs other issues)
- **Root cause**: Clear statement of why page doesn't work
- **Fix recommendation**:
  - Option 1: Create index.html for av-sync-debug
  - Option 2: Add bundling for av-sync-debug in quick-014's Vite bundler
  - Option 3: Add graceful fallback in P5Sketch for missing atoms
  - Recommend which is best for current project stage (all other atoms are working)
- **Screenshots and evidence**: Reference the captured images

Keep it concise (400-600 words), focused on diagnosis not implementation.
  </action>
  <verify>
018-SUMMARY.md exists with:
- Clear statement of root cause (av-sync-debug missing index.html, OR not bundled, OR other specific issue)
- At least one fix recommendation with clear steps
- Reference to evidence (screenshots, debug-results.json findings)
  </verify>
  <done>
Root cause of av-sync-debug page showing gallery is diagnosed, with actionable fix recommendation.
  </done>
</task>

</tasks>

<verification>
- Playwright script runs and produces clean debug-results.json
- Screenshots show what user sees (gallery or canvas)
- Filesystem state of av-sync-debug confirmed (index.html present/absent)
- Summary provides clear root cause and fix recommendation
- Fix is actionable (e.g., "create index.html" or "add bundling" with specific file paths)
</verification>

<success_criteria>
- User's report of "gallery instead of canvas" is explained with evidence
- Clear statement: av-sync-debug is missing [specific thing] causing [specific symptom]
- Fix is concrete (e.g., "create /portfolio/public/atoms/2026-01-30-av-sync-debug/index.html" OR "add av-sync-debug to bundler")
- Next quick plan can implement based on this diagnosis
</success_criteria>

<output>
After completion, create `.planning/quick/018-debug-av-sync-debug-page/018-SUMMARY.md`
</output>
