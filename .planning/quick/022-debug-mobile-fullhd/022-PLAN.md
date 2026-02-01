---
phase: quick
plan: 022
type: execute
wave: 1
depends_on: []
files_modified:
  - ".planning/quick/022-debug-mobile-fullhd/debug-fullhd.mjs"
  - ".planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md"
autonomous: true

must_haves:
  truths:
    - "Mobile layout at 1080x1920 (FullHD vertical) can be tested via Playwright"
    - "Layout issues are visually documented with before/after screenshots"
    - "CSS media queries are inspected and compared between viewports"
    - "Button visibility and positioning issues are identified"
    - "Cluttering and alignment problems are analyzed"
    - "Root cause is determined (media queries, fixed widths, overflow, etc.)"
  artifacts:
    - path: ".planning/quick/022-debug-mobile-fullhd/debug-fullhd.mjs"
      provides: "Playwright automation script testing 1080x1920 and 390x844 viewports"
    - path: ".planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md"
      provides: "Comprehensive CSS analysis and issue identification"
    - path: ".planning/quick/022-debug-mobile-fullhd/screenshots/"
      provides: "Before/after screenshots at both viewports"
  key_links:
    - from: "1080x1920 viewport"
      to: "Layout rendering"
      via: "page.setViewportSize"
      pattern: "setViewportSize.*1080.*1920"
    - from: "CSS inspection"
      to: "Media queries"
      via: "page.evaluate(() => document.styleSheets)"
      pattern: "media.*query|@media"
    - from: "Button elements"
      to: "Visibility"
      via: "page.locator('button').isVisible()"
      pattern: "button.*hidden|display.*none"

---

<objective>
Debug responsive design issues at FullHD vertical viewport (1080x1920) by comparing layouts, inspecting CSS, capturing visual evidence, and identifying root causes of cluttering, misalignment, and hidden buttons.

Purpose: Identify why the mobile layout breaks at 1080x1920 and determine whether the issue is in media queries, fixed dimensions, overflow, flex/grid settings, or viewport meta tags.

Output: Detailed debug report with screenshots showing the problem, CSS analysis, and specific root cause identification.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

**Issue context:**
- Site: https://llm.sutyrin.pro
- Reported problem: Mobile layout breaks at FullHD vertical (1080x1920)
- Symptoms: Cluttering, misalignment, buttons not visible
- Likely cause: Responsive design not accounting for tall mobile viewports
- Pages to test:
  * /mobile/gallery
  * /mobile/au1 (or another atom detail)
  * /mobile/compose
  * /mobile/backup

**Testing strategy:**
1. Compare 1080x1920 (FullHD vertical) vs 390x844 (standard mobile)
2. Take screenshots showing the problem
3. Inspect CSS media queries and layout properties
4. Identify specific CSS issues causing layout problems
5. Document findings for repair
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create viewport comparison script (1080x1920 vs 390x844)</name>
  <files>.planning/quick/022-debug-mobile-fullhd/debug-fullhd.mjs</files>
  <action>
Create a Playwright script that systematically debugs the FullHD vertical viewport issue:

**Script structure:**

1. Test both viewports on the same pages:
   - Viewport A (Standard mobile): 390x844
   - Viewport B (FullHD vertical): 1080x1920

2. Pages to test (4 pages):
   - https://llm.sutyrin.pro/mobile/gallery
   - https://llm.sutyrin.pro/mobile/au1
   - https://llm.sutyrin.pro/mobile/compose
   - https://llm.sutyrin.pro/mobile/backup

3. For each page in each viewport:

   **Initial inspection:**
   - Navigate to page
   - Wait 2 seconds for JS to render
   - Capture full-page screenshot
   - Record viewport dimensions

   **DOM analysis:**
   - Count visible buttons and their positions
   - Check button CSS properties: display, visibility, position, width, height
   - Inspect parent containers (flex/grid, overflow, max-width)
   - Look for fixed dimensions (width: XXXpx, height: XXXpx) on layout elements
   - Check if buttons are inside overflow containers

   **CSS inspection:**
   - Extract all media queries from <style> and <link> tags
   - Identify which media queries apply to current viewport
   - List CSS rules for: body, main, [role="main"], .container, .gallery, .compose-panel, button
   - Check for width constraints, padding, margin that might cause issues
   - Look for overflow: hidden or fixed heights limiting content visibility

   **Layout measurement:**
   - Get bounding rects for all buttons (x, y, width, height)
   - Check if buttons are positioned outside viewport (top/left < 0 or > viewport height)
   - Measure container dimensions vs content dimensions
   - Identify overflow situations (content width > container width)

   **Comparison data:**
   For each page, record:
   - Page URL
   - Viewport dimensions (390x844 and 1080x1920)
   - Button count and visibility at each viewport
   - CSS properties that differ between viewports (if any)
   - Media query breakpoints (what thresholds exist)
   - Layout issues identified (what's broken at 1080x1920)

4. **Screenshot organization:**
   - Create screenshots/ directory
   - Save as: {page}-{viewport}.png
   - Examples:
     * gallery-390x844.png
     * gallery-1080x1920.png
     * au1-390x844.png
     * au1-1080x1920.png
   - Total: 8 screenshots (4 pages × 2 viewports)

5. **CSS dump:**
   For the 1080x1920 viewport, extract and save the following to a JSON file:
   ```json
   {
     "pages": [
       {
         "url": "https://llm.sutyrin.pro/mobile/gallery",
         "viewport": {
           "width": 1080,
           "height": 1920
         },
         "media_queries": [
           "@media (max-width: 768px) { ... }",
           "@media (min-width: 768px) { ... }"
         ],
         "applied_media_queries": [
           "List media queries that actually apply to 1080x1920"
         ],
         "buttons": [
           {
             "text": "Play",
             "visible": true/false,
             "position": { "x": N, "y": N, "width": N, "height": N },
             "css": {
               "display": "...",
               "position": "...",
               "visibility": "...",
               "width": "...",
               "height": "..."
             },
             "parent_css": {
               "display": "...",
               "overflow": "...",
               "width": "...",
               "max-width": "..."
             }
           }
         ],
         "containers": [
           {
             "selector": ".gallery",
             "dimensions": { "width": N, "height": N },
             "css": {
               "display": "...",
               "width": "...",
               "max-width": "...",
               "overflow": "..."
             }
           }
         ],
         "issues": [
           "Issue description"
         ]
       }
     ]
   }
   ```

6. **Output files:**
   - Save script to `.planning/quick/022-debug-mobile-fullhd/debug-fullhd.mjs`
   - Save CSS analysis to `.planning/quick/022-debug-mobile-fullhd/css-analysis.json`
   - Screenshots saved to `.planning/quick/022-debug-mobile-fullhd/screenshots/`
  </action>
  <verify>
Script runs: `node .planning/quick/022-debug-mobile-fullhd/debug-fullhd.mjs` exits 0
8 screenshots exist (4 pages × 2 viewports)
css-analysis.json exists with media queries and CSS properties
Button analysis includes visibility status at both viewports
Script completes in approximately 1-2 minutes
  </verify>
  <done>
Playwright has captured screenshots at both viewports, inspected CSS, and identified button positioning issues and media query mismatches.
  </done>
</task>

<task type="auto">
  <name>Task 2: Analyze findings and create comprehensive debug report</name>
  <files>.planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md</files>
  <action>
Analyze the CSS data and screenshots, then create a comprehensive debug report:

**Report structure:**

1. **Executive Summary**
   - Issue: Mobile layout broken at 1080x1920 (FullHD vertical)
   - Symptoms: Cluttering, misalignment, hidden buttons
   - Root cause (based on CSS analysis)
   - Severity: High (mobile layout compromised)
   - Recommendation: [Specific fix needed]

2. **Viewport Comparison**

   | Property | 390x844 (Standard) | 1080x1920 (FullHD) |
   |----------|-------------------|-------------------|
   | Layout type | (flex/grid/block?) | (same/different?) |
   | Button visibility | X visible | Y visible |
   | Content width | Wpx | W'px |
   | Overflow issues | none/some | none/some |
   | Media query active | (which?) | (which?) |

3. **Per-Page Analysis**

   For each page (gallery, au1, compose, backup):

   **Page: /mobile/gallery**
   - Status at 390x844: ✅ OK
   - Status at 1080x1920: ❌ BROKEN
   - Issue description: [What's broken]
   - Screenshots:
     * Standard (390x844): [gallery-390x844.png]
     * FullHD (1080x1920): [gallery-1080x1920.png]
   - CSS findings:
     * Media queries active at 390x844: [list]
     * Media queries active at 1080x1920: [list]
     * Container max-width: [px or ...]
     * Buttons display: [visible/hidden/positioned outside]
     * Layout type: [flex/grid/block]
   - Problem analysis:
     * Root cause: [What's causing the issue]
     * Why it works at 390x844: [Explanation]
     * Why it breaks at 1080x1920: [Explanation]

4. **CSS Issues Identified**

   List each CSS problem found:

   **Issue 1: Media query breakpoint mismatch**
   - Breakpoint: 768px or other?
   - Problem: Layout assumes max 768px width, doesn't account for 1080px
   - Evidence: CSS shows max-width constraint not applying correctly
   - Fix: Add media query for 1080px or remove max-width cap

   **Issue 2: Fixed dimensions on flex/grid containers**
   - Problem: Container has fixed width (e.g., width: 375px) not responsive
   - Evidence: CSS shows width: XXXpx on .container or .gallery
   - Fix: Change to width: 100% or max-width: 95vw

   **Issue 3: Button positioning outside viewport**
   - Problem: Buttons positioned at fixed x/y coordinates, off-screen at 1080x1920
   - Evidence: Button bounding rect shows x > 1080 or y > 1920
   - Fix: Use position: relative or adjust layout to be responsive

   **Issue 4: Overflow hidden cutting off content**
   - Problem: Parent container has overflow: hidden, buttons clipped
   - Evidence: Parent container overflow: hidden, button partially outside bounds
   - Fix: Change overflow: hidden to overflow: visible or adjust container size

   **Issue 5: Padding/margin/gap creating unseen space**
   - Problem: Large padding/margin accumulates at 1080x1920
   - Evidence: CSS shows padding/margin rules creating large gaps
   - Fix: Use responsive padding (e.g., clamp, calc, or media query)

5. **Button Visibility Analysis**

   | Page | Buttons at 390x844 | Buttons at 1080x1920 | Status |
   |------|-------------------|----------------------|--------|
   | gallery | 5 visible | 2 visible | BROKEN |
   | au1 | 3 visible | 0 visible | BROKEN |
   | compose | 6 visible | 4 visible | PARTIAL |
   | backup | 2 visible | 1 visible | BROKEN |

   For each hidden button, explain:
   - Button selector/name
   - Why it's hidden (overflow, position, display: none, etc.)
   - CSS property causing the issue

6. **Media Query Analysis**

   Current media queries in CSS:
   - @media (max-width: 480px) { ... }
   - @media (max-width: 768px) { ... }
   - @media (min-width: 768px) { ... }
   - [other queries if any]

   Analysis:
   - 390x844 matches: max-width: 768px (mobile-optimized)
   - 1080x1920 matches: ??? (likely no specific rule for tall mobile)
   - Gap identified: No media query for devices 768px < width < 1200px at tall aspect ratios
   - Recommendation: Add media query for tall viewports or restructure CSS

7. **Root Cause Summary**

   Primary cause: [One of: media query gap, fixed dimensions, overflow, flex/grid misconfiguration, viewport meta tag issue]

   Evidence:
   - CSS property X is causing Y symptom
   - Media query not applying to 1080x1920 viewport
   - Specific files/classes affected: [list]

   Why this matters:
   - Users on FullHD vertical phones have broken layout
   - Buttons unreachable or hidden
   - App unusable at this viewport

8. **Recommendations**

   **Immediate fix (quick):**
   - [Specific CSS change to make layout work at 1080x1920]
   - Example: "Remove max-width: 375px from .container" or "Add media query for min-width: 1000px"

   **Better fix (longer-term):**
   - [Refactor to prevent this recurring]
   - Example: "Use clamp() for responsive sizing instead of fixed media queries"

   **Testing after fix:**
   - Retest at both 390x844 and 1080x1920 to confirm all buttons visible
   - Verify no regression on other viewports (iPad, tablet sizes)
   - Check viewport meta tag is correct: <meta name="viewport" content="width=device-width, initial-scale=1">

Write report to `.planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md`
  </action>
  <verify>
022-DEBUG-REPORT.md exists with:
- Executive summary identifying root cause
- Viewport comparison showing 390x844 vs 1080x1920 differences
- Per-page analysis (gallery, au1, compose, backup)
- CSS issues identified (media queries, fixed dimensions, overflow, etc.)
- Button visibility matrix showing which buttons hidden at 1080x1920
- Media query analysis showing gap between 768px and 1080px
- Root cause clearly stated with evidence
- Specific recommendations for fixing the issue
- Screenshot references with before/after comparisons
  </verify>
  <done>
Debug analysis complete. Report identifies root cause of layout issues at 1080x1920, provides evidence with screenshots and CSS inspection, and recommends specific fixes.
  </done>
</task>

</tasks>

<verification>
1. Script runs without errors: `node debug-fullhd.mjs` exits 0
2. 8 screenshots captured (4 pages × 2 viewports):
   - gallery-390x844.png and gallery-1080x1920.png
   - au1-390x844.png and au1-1080x1920.png
   - compose-390x844.png and compose-1080x1920.png
   - backup-390x844.png and backup-1080x1920.png
3. css-analysis.json exists with:
   - Media queries extracted from each page
   - Button CSS properties at both viewports
   - Container CSS properties
   - Issues identified per page
4. 022-DEBUG-REPORT.md provides:
   - Executive summary with root cause
   - Viewport comparison table
   - Per-page detailed analysis
   - CSS issues identified with evidence
   - Button visibility analysis showing which buttons hidden
   - Media query analysis showing gaps
   - Clear root cause statement
   - Specific recommendations for fix
5. Screenshots show clear visual differences between viewports
6. CSS analysis correlates visual issues to specific CSS properties
</verification>

<success_criteria>
- User can see visual evidence (screenshots) of layout issues at 1080x1920
- Root cause clearly identified (media query gap, fixed dimensions, overflow, etc.)
- CSS analysis explains why layout works at 390x844 but breaks at 1080x1920
- Specific buttons/elements identified as hidden or misaligned
- Media query structure documented (showing what applies at each viewport)
- Recommendations provided for fixing the responsive design
- Report provides actionable insight for repair plan
</success_criteria>

<output>
After completion:
1. `.planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md` - comprehensive findings
2. `.planning/quick/022-debug-mobile-fullhd/screenshots/` - visual evidence
3. `.planning/quick/022-debug-mobile-fullhd/css-analysis.json` - technical details
</output>
