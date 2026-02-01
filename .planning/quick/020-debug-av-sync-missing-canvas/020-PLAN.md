---
phase: quick
plan: 020
type: execute
wave: 1
depends_on: []
files_modified:
  - ".planning/quick/020-debug-av-sync-missing-canvas/debug-canvas.mjs"
  - ".planning/quick/020-debug-av-sync-missing-canvas/020-SUMMARY.md"
autonomous: true

must_haves:
  truths:
    - "Playwright can capture what's actually rendering on av-sync-debug page"
    - "Console errors and warnings are collected from page load"
    - "Canvas element existence and visibility checked via DOM inspection"
    - "p5.js initialization errors identified if present"
    - "Comparison to working av1 atom shows differences in execution"
    - "Root cause of missing canvas is diagnosed (JS error, p5 init failure, hidden element, etc.)"
  artifacts:
    - path: ".planning/quick/020-debug-av-sync-missing-canvas/debug-results.json"
      provides: "DOM inspection, console output, canvas presence/visibility"
    - path: ".planning/quick/020-debug-av-sync-missing-canvas/screenshots/"
      provides: "Visual comparison of av-sync-debug vs av1 (working baseline)"
    - path: ".planning/quick/020-debug-av-sync-missing-canvas/020-SUMMARY.md"
      provides: "Root cause analysis and specific JavaScript error details"
  key_links:
    - from: "sketch.bundle.js"
      to: "p5 initialization"
      via: "window.p5 or createCanvas()"
      pattern: "createCanvas|p5\\.instance"
    - from: "audio.js (bundled into sketch.bundle.js)"
      to: "Tone.js audio system"
      via: "initAudio function"
      pattern: "initAudio|Tone"
    - from: "index.html"
      to: "sketch.bundle.js"
      via: "<script type=\"module\">"
      pattern: "src=.*sketch\\.bundle\\.js"

---

<objective>
Debug https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/ where user reports only play/pause buttons visible but no canvas or p5.js visualization.

Purpose: Determine if the issue is a p5.js initialization failure, missing canvas element, hidden element (CSS), JavaScript error preventing execution, or bundle loading issue.

Output: Playwright inspection results, screenshots showing actual page state, browser console errors, and diagnosis of why canvas is missing.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Known facts:
- av-sync-debug index.html exists and loads sketch.bundle.js
- sketch.bundle.js exists (693 KB, likely includes audio.js dependencies via bundler)
- av-sync-debug has BOTH audio.js and sketch.js (unlike av1 which only has sketch.js)
- av1 works correctly - shows play/pause buttons + p5 canvas
- av-sync-debug shows only buttons but no canvas
- Quick plans 018-019 diagnosed and repaired index.html, but issue persists

Key files:
- atoms/2026-01-30-av-sync-debug/sketch.js - p5.js visualization code with export function setup(p), export function draw(p)
- atoms/2026-01-30-av-sync-debug/audio.js - Tone.js audio synthesis
- portfolio/public/atoms/2026-01-30-av-sync-debug/sketch.bundle.js - bundled output

Possible root causes:
1. **p5 initialization failure**: sketch.js exports setup/draw but p5 instance may not be created
2. **Missing canvas creation**: setup() function not called by p5
3. **Bundle loading failure**: sketch.bundle.js has JavaScript error preventing execution
4. **Audio dependency error**: audio.js bundled incorrectly, causing sketch to fail
5. **Canvas rendered but hidden**: CSS issue hiding the canvas element
6. **Missing p5 import**: p5.js not included in sketch.bundle.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Use Playwright to inspect av-sync-debug and capture actual page state</name>
  <files>.planning/quick/020-debug-av-sync-missing-canvas/debug-canvas.mjs</files>
  <action>
Create a Playwright debugging script that investigates av-sync-debug page rendering:

**Part A: Debug av-sync-debug page**
1. Launch Chromium with desktop viewport (1280x900)
2. Navigate to `https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/`
3. Wait 3 seconds for full page load and JS execution
4. Collect ALL console messages (log, warn, error):
   - Listen to page.on('console') for all console calls
   - Record message text, type (log/warn/error), and source
5. Inspect DOM to find canvas elements:
   - Query document.querySelectorAll('canvas')
   - For each canvas found, record:
     - Size: canvas.width, canvas.height
     - Computed style: display, visibility, opacity, z-index
     - Parent element: what contains the canvas
     - Whether it's visible (offsetParent !== null)
6. Check if p5 created any elements:
   - Look for elements with class 'p5Container' or 'p5Canvas'
   - Check window.p5 or window.p5Instance existence
7. Inspect the transport controls:
   - Find playBtn, stopBtn elements
   - Check if they exist and are clickable
8. Take full-page screenshot showing actual rendered content
9. Save all results to `.planning/quick/020-debug-av-sync-missing-canvas/debug-results.json`:
   - consoleMessages: array of {type, message}
   - canvasElements: array of canvas details or empty if none found
   - canvasVisible: boolean
   - pageContent: description of what's visible
   - scriptErrors: any JS errors preventing execution

**Part B: Debug av1 page (working baseline for comparison)**
1. Navigate to `https://llm.sutyrin.pro/atom/2026-01-30-av1/`
2. Wait 2 seconds
3. Collect same data as av-sync-debug
4. Save to JSON under av1Baseline for comparison

**Part C: Detailed comparison**
1. Calculate differences: canvas count, console errors, visibility
2. Identify what av1 does that av-sync-debug doesn't
3. Highlight first error message as primary root cause indicator

Save script to `.planning/quick/020-debug-av-sync-missing-canvas/debug-canvas.mjs`
  </action>
  <verify>
Script runs: `node .planning/quick/020-debug-av-sync-missing-canvas/debug-canvas.mjs` exits 0
debug-results.json exists with av-sync-debug and av1 sections
Screenshots exist: av-sync-debug.png and av1.png in screenshots/ directory
  </verify>
  <done>
Playwright has captured actual page state, console errors, and DOM analysis for both av-sync-debug and working av1. Data ready for analysis.
  </done>
</task>

<task type="auto">
  <name>Task 2: Analyze results and write root cause diagnosis</name>
  <files>.planning/quick/020-debug-av-sync-missing-canvas/020-SUMMARY.md</files>
  <action>
Read debug-results.json and analyze findings:

**Root Cause Analysis**

1. **Check for JavaScript errors first**:
   - If debug-results.json shows consoleMessages with type='error', those are likely preventing sketch execution
   - Common errors: "ReferenceError: p5 is not defined", "Cannot read property 'createCanvas'", module loading errors
   - If errors exist, they are the PRIMARY root cause

2. **Check canvas element existence**:
   - If canvasElements array is empty: p5.js never called createCanvas (likely due to error in setup or p5 not being available)
   - If canvasElements has entries but canvasVisible=false: CSS issue or canvas rendered outside viewport

3. **Compare to av1**:
   - av1 should show: 1 canvas element, visible, no console errors
   - av-sync-debug showing different: identifies what's broken

4. **Possible diagnoses**:
   - **Diagnosis A: p5 not available in bundle**
     - Evidence: "p5 is not defined" in console
     - Fix: Ensure p5 is imported in sketch.bundle.js

   - **Diagnosis B: Audio module loading fails, blocks sketch**
     - Evidence: Error related to audio imports, Tone.js, or audio.js
     - Fix: Debug why audio.js bundling broke sketch execution

   - **Diagnosis C: sketch.js exports aren't connected to p5 instance**
     - Evidence: No errors BUT no canvas
     - Fix: Check if p5 instance is being created and setup/draw exported functions are being used

   - **Diagnosis D: Canvas rendered but off-screen or hidden**
     - Evidence: canvas elements exist but canvasVisible=false
     - Fix: Check CSS, z-index, overflow properties

Write `.planning/quick/020-debug-av-sync-missing-canvas/020-SUMMARY.md` with:
- **Execution time**: approx X minutes
- **What was debugged**: av-sync-debug vs av1 baseline comparison
- **What we found**: List key findings from debug-results.json
- **Root cause**: Most likely diagnosis with evidence from console/DOM
- **Next action**: Specific fix recommendation (create quick plan for repair)
- **Evidence**: Quote relevant console errors or DOM findings
- **Screenshots**: Note what screenshots show
  </action>
  <verify>
020-SUMMARY.md exists with:
- Clear root cause statement
- Evidence from debug-results.json
- Specific error message or DOM finding as proof
- Next action clearly stated
  </verify>
  <done>
Root cause of missing canvas is diagnosed with specific evidence and actionable next steps documented.
  </done>
</task>

</tasks>

<verification>
1. Playwright script runs successfully without errors
2. debug-results.json populated with av-sync-debug and av1 comparison data
3. Screenshots show visual comparison (av-sync-debug showing only buttons, av1 showing canvas)
4. Console error messages captured if present
5. Canvas element inspection confirms presence/absence in DOM
6. Summary provides specific root cause with evidence
7. Next steps clearly documented for repair plan
</verification>

<success_criteria>
- User's report of "no canvas, only buttons" is explained with evidence
- Root cause clearly stated (e.g., "p5 is not defined in bundle", "audio.js import error breaks setup", etc.)
- Specific JavaScript error or DOM finding provided as proof
- Comparison to av1 shows exact difference causing issue
- Next quick plan recommendation provided (e.g., quick-021 to fix bundling)
</success_criteria>

<output>
After completion, create `.planning/quick/020-debug-av-sync-missing-canvas/020-SUMMARY.md` with root cause analysis and evidence.
</output>
