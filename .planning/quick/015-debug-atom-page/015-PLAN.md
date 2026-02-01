---
phase: quick
plan: 015
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/015-debug-atom-page/investigate-atoms.mjs
  - .planning/quick/015-debug-atom-page/015-SUMMARY.md
autonomous: true

must_haves:
  truths:
    - "Playwright captures exact DOM state of /mobile/au1 page with console errors and layout structure"
    - "Root cause of reported issue (gallery appearing, no canvas) is identified"
    - "All atom page variations tested (desktop vs mobile, canvas vs detail views)"
  artifacts:
    - path: .planning/quick/015-debug-atom-page/screenshots/
      provides: "Visual evidence of current state on production"
    - path: .planning/quick/015-debug-atom-page/015-SUMMARY.md
      provides: "Investigation findings and any necessary fixes"
  key_links:
    - from: playwright
      to: https://llm.sutyrin.pro/mobile/au1
      via: browser automation
      pattern: page.goto.*mobile/au1
---

<objective>
Investigate and document the user-reported issue on atom pages where they see gallery list view appearing instead of atom detail, no visible canvas (or unexpected canvas rendering), and inability to interact with atoms.

User reports visiting https://llm.sutyrin.pro/mobile/au1 and seeing issues.

Purpose: Verify the actual state of atom pages on production (Quick task 014 just fixed bundling). Confirm if issue is a layout bug, routing confusion, or expected behavior mismatch.

Output: Playwright screenshots and investigation summary documenting actual vs expected state.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/014-fix-atom-bundling/014-SUMMARY.md

Recent context:
- Quick task 014 completed: All atoms bundled and verified working (canvas renders, GUI visible, no module errors)
- User reports visiting /mobile/au1 and seeing gallery list view + no canvas + can't interact
- This suggests either:
  - A layout/routing issue (gallery appearing when it shouldn't)
  - User expectation mismatch (mobile detail view ≠ desktop canvas view)
  - Display bug from recent changes
</context>

<tasks>

<task type="auto">
  <name>Task 1: Playwright investigation of atom pages and layout state</name>
  <files>.planning/quick/015-debug-atom-page/investigate-atoms.mjs</files>
  <action>
Create `.planning/quick/015-debug-atom-page/investigate-atoms.mjs` - a Playwright script that tests three key scenarios:

**Scenario 1: Desktop atom canvas view**
- Navigate to `https://llm.sutyrin.pro/atom/2026-01-30-au1` (DESKTOP view)
- Viewport: 1280x800
- Wait for page load
- Check for: canvas element (or audio controls), back link, page title, notes section
- Capture screenshot
- Check console for errors

**Scenario 2: Mobile detail view (reported URL)**
- Navigate to `https://llm.sutyrin.pro/mobile/au1` (MOBILE detail)
- Viewport: 390x844 (iPhone 12)
- Wait for page load
- Check for: header with back button, tab navigation (Code/Config/Notes/Params/Voice), tab content
- Check if gallery list appears (should NOT)
- Check if canvas appears (should NOT - this is a detail view)
- Capture screenshot
- Check console for errors

**Scenario 3: Mobile gallery view**
- Navigate to `https://llm.sutyrin.pro/mobile/gallery` (gallery list)
- Viewport: 390x844
- Wait for page load
- Check for: list of atoms, search input, atom items
- Capture screenshot

**For all scenarios:**
- Monitor console messages for errors
- Monitor page errors (module resolution, runtime errors)
- Log key DOM elements present/absent
- Record any network failures

Output as JSON to file with structure documenting element presence, viewport, errors, and screenshots for each scenario.

Run with: `node .planning/quick/015-debug-atom-page/investigate-atoms.mjs`
  </action>
  <verify>
Script runs without crashing: `node .planning/quick/015-debug-atom-page/investigate-atoms.mjs` exits 0.
Screenshots exist in `.planning/quick/015-debug-atom-page/screenshots/`.
Investigation output JSON captures element presence, console errors, and viewport state.
  </verify>
  <done>
Playwright has captured the exact DOM state of /mobile/au1, /atom/au1, and /mobile/gallery across different viewports. Screenshots show visual state. Console errors and element checks reveal whether reported issue is a bug or user expectation mismatch.
  </done>
</task>

<task type="auto">
  <name>Task 2: Analyze investigation results and document findings</name>
  <files>.planning/quick/015-debug-atom-page/015-SUMMARY.md</files>
  <action>
Read the investigation output from Task 1 (screenshots and JSON results). Analyze what was found:

**Key questions to answer:**
1. Does /mobile/au1 actually show a gallery list? (It shouldn't - it should show code/config/notes/params/voice tabs)
2. Does it show a canvas? (It shouldn't - detail view doesn't render canvas)
3. Are there any console errors preventing tab switching or layout rendering?
4. Does /atom/au1 (desktop) show the canvas correctly?
5. Is there a layout bug causing elements to overlap or appear incorrectly?

**Document findings in 015-SUMMARY.md:**
- What was actually observed vs what user reported
- If issue is a bug: specific DOM problem, console errors, affected files
- If issue is user confusion: what the correct URL should be (e.g., /atom/au1 for canvas, /mobile/au1 for detail)
- If issue is a styling/layout bug: specific CSS or DOM structure problems
- Any unexpected behavior or elements appearing where they shouldn't
- Screenshots as evidence

Include:
- Frontmatter (phase, plan, status, execution_time)
- What was done
- Findings for each scenario (desktop, mobile detail, mobile gallery)
- Root cause (if bug) or clarification (if expected behavior)
- Any fixes needed or recommendations
- Files produced (screenshots)
  </action>
  <verify>
015-SUMMARY.md exists and documents:
- What was actually observed on /mobile/au1
- Whether issue is a bug or user expectation mismatch
- Clear explanation of correct usage (canvas vs detail view)
- Screenshots showing actual vs expected state
  </verify>
  <done>
Investigation complete. User's reported issue is fully documented with evidence (screenshots). Root cause identified: either actual bug requiring fix, or user expectation mismatch clarified with correct URL guidance.
  </done>
</task>

</tasks>

<verification>
1. `node .planning/quick/015-debug-atom-page/investigate-atoms.mjs` completes successfully
2. Screenshots captured for all 3 scenarios (desktop atom, mobile detail, mobile gallery)
3. Investigation reveals whether /mobile/au1 is rendering correctly or has layout bug
4. Console errors (if any) captured and logged
5. 015-SUMMARY.md documents findings and identifies root cause or clarification
</verification>

<success_criteria>
- Exact state of production atom pages captured with Playwright
- User's reported issue is either explained as user expectation mismatch OR identified as specific bug
- Clear evidence (screenshots) showing actual vs expected state
- If bug: specific file(s) and DOM/CSS problem identified for next task
- If user mismatch: correct guidance on which URL to use for canvas view (/atom/slug) vs detail view (/mobile/slug)
</success_criteria>

<output>
After completion, create `.planning/quick/015-debug-atom-page/015-SUMMARY.md`
</output>
