---
phase: quick-017
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - portfolio/src/components/VoiceRecorder.astro
  - portfolio/src/components/NotesEditor.astro
  - portfolio/src/components/AnnotationCanvas.astro
  - portfolio/src/components/ParamTweaker.astro
  - portfolio/src/components/VoiceNoteList.astro
  - portfolio/src/styles/mobile.css
autonomous: false
user_setup: []

must_haves:
  truths:
    - "All buttons are visible with good contrast on dark theme"
    - "Tab controls are clickable and clearly distinguished"
    - "Input fields (sliders, text, number) have visible borders/backgrounds"
    - "Icons within buttons are visible (not white on white or black on black)"
    - "Disabled buttons are clearly distinguished from enabled buttons"
    - "Form labels are visible and readable"
    - "Voice recorder UI (record button, timer, text) is visible"
  artifacts:
    - path: "portfolio/src/components/ParamTweaker.astro"
      provides: "Slider and number input controls with proper contrast"
      min_lines: 100
    - path: "portfolio/src/components/VoiceRecorder.astro"
      provides: "Record button, status indicators, transcript textarea with visibility"
      min_lines: 100
    - path: "portfolio/src/components/NotesEditor.astro"
      provides: "Notes editing UI with visible textarea and buttons"
      min_lines: 80
    - path: "portfolio/src/styles/mobile.css"
      provides: "CSS rules for buttons, sliders, inputs with dark theme contrast"
      contains: "color|background|border"
  key_links:
    - from: "portfolio/src/styles/mobile.css"
      to: "portfolio/src/components/*.astro"
      via: "class selectors (.btn, .slider-control, .input-field)"
      pattern: "\\.(btn|input|slider|control|record)"
    - from: "canvas.css (CSS variables)"
      to: "component styles"
      via: "--text-primary, --button-bg, --border-color, --button-hover"
      pattern: "var\\(--(text|button|border|bg)"
---

<objective>
Debug and fix invisible or low-contrast controls (buttons, sliders, inputs, icons) on atom pages in dark theme. User reports controls are not visible despite page rendering.

Purpose: Ensure all interactive elements are visually apparent and usable with proper contrast ratios (WCAG AA minimum 4.5:1 for text).

Output: All controls visible, high contrast, functional, with before/after Playwright screenshots verifying the fix.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Current dark theme setup:
- CSS variables defined in canvas.css: --bg-primary (#0a0a0a), --text-primary (#e0e0e0), --button-bg (#1a1a1a), --accent-color (#6bb5ff)
- All components use these variables via Astro scoped styles or global mobile.css
- MobileLayout sets body background #0a0a0a, color #e0e0e0
- Components: ParamTweaker (sliders), VoiceRecorder (buttons), NotesEditor (textarea), AnnotationCanvas (drawing), VoiceNoteList (list items)

Common control types on atom pages:
- Buttons: .btn, .btn-primary, .btn-secondary, .btn-danger, .record-btn, .control-btn, .mode-btn
- Sliders: input[type="range"] in ParamTweaker
- Text inputs: textarea, input[type="text"], input[type="number"]
- Tabs: .tab buttons
- Icons: inline SVG in buttons

Potential issues:
- White text on light backgrounds (color contrast)
- Transparent/missing backgrounds on inputs
- Invisible borders (dark border on dark background)
- SVG icon color not inherited or set explicitly
- Disabled state opacity too low (0.4 may be too faint)
- focus/active states not visible
</context>

<tasks>

<task type="auto">
  <name>Task 1: Inspect CSS and create before screenshot with Playwright</name>
  <files>[]</files>
  <action>
    Analyze current CSS and capture visual issues:
    1. Read all CSS files (mobile.css, canvas.css) and component styles
    2. Create Playwright test script to capture before screenshots:
       - Navigate to https://llm.sutyrin.pro/mobile/gallery (or localhost if available)
       - Click on first atom (e.g., 2026-01-30-my-first-sketch)
       - Take screenshot of full page showing all tabs
       - Click on "Params" tab, take screenshot showing parameter sliders
       - Click on "Voice" tab, take screenshot showing record button and voice controls
       - Save screenshots to .planning/quick/017-fix-dark-theme-controls/before-screenshots/
    3. Inspect actual rendered colors using browser DevTools simulation
    4. Document findings:
       - Which controls are invisible/low-contrast
       - Specific CSS rules causing issues
       - Contrast ratio calculations (text vs background)

    Why: Establishes baseline for before/after comparison and identifies root causes.
  </action>
  <verify>
    1. Playwright test script created and runs successfully
    2. Before screenshots captured in before-screenshots/ directory
    3. CSS analysis document created listing specific issues (file, line, property, current value, problem)
    4. Each issue maps to specific control element (e.g., "ParamTweaker slider thumb: #6bb5ff (blue) on #1a1a1a (dark grey) = poor contrast")
  </verify>
  <done>
    - Before screenshots show actual visibility issues
    - CSS problems identified with specific file locations
    - Analysis document ready for developer review
  </done>
</task>

<task type="checkpoint:human-verify">
  <what-built>
    CSS analysis and before screenshots showing invisible/low-contrast controls.
  </what-built>
  <how-to-verify>
    1. Review before screenshots for visibility issues
    2. Check CSS analysis document - do the identified issues match what you see?
    3. Confirm which controls should be fixed:
       - Sliders in Params tab?
       - Record button in Voice tab?
       - Buttons in Notes tab?
       - All of the above?
    4. Any other controls you've noticed are invisible beyond what's documented?
  </how-to-verify>
  <resume-signal>Confirm issues identified or describe additional problems to fix</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Fix CSS contrast and visibility issues</name>
  <files>
    - portfolio/src/components/ParamTweaker.astro
    - portfolio/src/components/VoiceRecorder.astro
    - portfolio/src/components/NotesEditor.astro
    - portfolio/src/styles/mobile.css
  </files>
  <action>
    Apply CSS fixes for identified contrast issues:
    1. Button text contrast (WCAG AA 4.5:1 minimum):
       - Verify .btn text color #e0e0e0 on button-bg #1a1a1a (contrast: ~9:1, good)
       - Verify .btn-primary text white on #6bb5ff (contrast: ~5.5:1, good)
       - Verify .btn-secondary text #e0e0e0 on #333 (contrast: ~8:1, good)
       - Add explicit color properties where missing
    2. Slider control visibility:
       - Ensure input[type="range"] thumb is visible (#6bb5ff on transparent, currently fine)
       - Ensure track is visible (#333 track on transparent, may need background)
       - Add explicit background: transparent to range input if missing
    3. Input field visibility:
       - textarea: background #1a1a1a, color #e0e0e0, border #333 (check all set)
       - input[type="text"]: same as textarea
       - input[type="number"]: same as textarea
       - Add placeholder styling: color #555 (lighter grey for hints)
    4. Icon visibility in buttons:
       - SVG fill="currentColor" in button (inherits button text color, should work)
       - Verify all SVG icons use fill="currentColor" not hardcoded colors
    5. Focus/active states:
       - Ensure focus states have visible outline or border change
       - :focus should have outline: 2px solid #6bb5ff or similar
       - :active should have clear visual feedback
    6. Disabled state:
       - Current opacity: 0.4 (may be too faint)
       - Change to opacity: 0.5 AND lighter color, or darker background
       - Example: .btn:disabled { opacity: 0.6; background: #0a0a0a; }

    Implementation order:
    a) mobile.css: Update .btn, .btn-primary, .btn-secondary, .btn-danger, .slider-control styles
    b) ParamTweaker.astro: Add scoped styles for param row, label, input if needed
    c) VoiceRecorder.astro: Add/update .record-btn, .recording-indicator styles
    d) NotesEditor.astro: Add textarea, button styles
    e) Build and test locally

    Why: Ensures WCAG AA contrast compliance and improves visual clarity.
  </action>
  <verify>
    1. All .btn* classes have explicit color and background
    2. input[type="range"] has visible thumb and track
    3. textarea has background, color, border defined
    4. SVG icons inside buttons use fill="currentColor"
    5. focus states defined with visible indicators
    6. disabled states use opacity 0.5+ or background color change
    7. npm run build completes without errors
    8. Local preview shows improved contrast (manually inspect in browser)
  </verify>
  <done>
    - CSS updated with proper contrast ratios
    - All controls have explicit colors/backgrounds
    - Focus and disabled states visible
    - Build succeeds
  </done>
</task>

<task type="auto">
  <name>Task 3: Deploy and capture after screenshots</name>
  <files>[]</files>
  <action>
    Deploy fixed code and verify with after screenshots:
    1. Build production (npm run build from portfolio/)
    2. Deploy to production server (fra server or Vercel)
    3. Run same Playwright test script used in Task 1:
       - Navigate to https://llm.sutyrin.pro/mobile/gallery
       - Click first atom
       - Take screenshot (full page)
       - Click Params tab, take screenshot
       - Click Voice tab, take screenshot
       - Save to .planning/quick/017-fix-dark-theme-controls/after-screenshots/
    4. Compare before/after:
       - Buttons should be clearly visible and distinct from background
       - Sliders should have visible thumb and track
       - Text inputs should have visible borders and backgrounds
       - Icons should be clearly visible
       - Tab buttons should show clear active state
    5. Manually test controls on production:
       - Click buttons - should respond
       - Drag sliders - should respond smoothly
       - Type in text inputs - text visible
       - Verify tabs switch content
       - Check all interactive elements work

    Why: Confirms fix is deployed and visible in production.
  </action>
  <verify>
    1. Production deployment succeeds
    2. https://llm.sutyrin.pro/mobile/gallery loads
    3. After screenshots show visibly improved contrast/visibility
    4. Manual testing: all controls clickable and functional
    5. Browser DevTools: no CSS errors, all styles applied
    6. Cross-device check: test on phone if available (iOS Safari, Android Chrome)
  </verify>
  <done>
    - Production deployment successful
    - All controls now visible with good contrast
    - After screenshots confirm fix
    - Full user workflow restored (view/edit atoms, adjust parameters, record voice notes)
  </done>
</task>

</tasks>

<verification>
Phase complete when:
1. CSS analysis identifies all invisible/low-contrast controls
2. Before screenshots show the visibility problems
3. CSS fixed with WCAG AA contrast compliance
4. After screenshots show improved visibility
5. All controls tested and functional in production
6. Manual testing confirms interactive elements work
7. No visual regressions on other page elements
</verification>

<success_criteria>
- All buttons visible with clear contrast against background
- Sliders have visible thumb and track
- Text inputs (textarea, text, number) have visible borders and backgrounds
- Icons in buttons are clearly visible
- Focus states are visible (outline or color change)
- Disabled buttons are clearly distinguished from enabled
- Tab buttons show clear active/inactive states
- All controls functional: buttons clickable, sliders draggable, inputs editable
- Contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for UI components)
- Production deployment successful
- No JavaScript errors in console
- Works on desktop, tablet, and mobile devices
</success_criteria>

<output>
After completion, create `.planning/quick/017-fix-dark-theme-controls/017-SUMMARY.md` documenting:
- CSS visibility issues identified and fixed
- Contrast ratio improvements
- Before/after screenshots
- Testing results
- Production deployment status
- Any remaining or deferred items
</output>
