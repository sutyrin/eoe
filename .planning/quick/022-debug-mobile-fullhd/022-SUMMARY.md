---
phase: quick
plan: 022
subsystem: debugging
tags:
  - responsive-design
  - mobile-layout
  - CSS
  - Playwright
  - viewport-testing
status: complete
duration: 8 minutes
completed: 2026-02-01

dependencies:
  requires:
    - v1.1 production deployment (Phase 6)
  provides:
    - Viewport comparison analysis
    - CSS issue identification
    - Layout optimization recommendations
    - Visual evidence (8 screenshots)
  affects:
    - Future responsive design fixes
    - Mobile layout optimization

tech-stack:
  added:
    - Playwright (browser automation, viewport testing)
  patterns:
    - Comparative viewport analysis
    - DOM inspection via page.evaluate()
    - CSS property extraction
    - Screenshot-based documentation

decisions:
  - Focus on two viewports: 390x844 (standard) and 1080x1920 (FullHD vertical)
  - Analyze 4 pages: gallery, au1, compose, backup
  - Capture DOM state, CSS properties, button visibility
  - Use full-page screenshots for visual evidence
---

# Quick Task 022 Summary: Mobile Layout Debug at FullHD Vertical

## Objective

Debug responsive design issues at FullHD vertical viewport (1080x1920) by comparing layouts, inspecting CSS, and identifying root causes of layout problems.

## Findings

### Root Cause Identified

**NOT a bug - CSS design inconsistency:**

Gallery and backup pages use `max-width: 600px` with `margin: 0 auto`, which centers content instead of adapting to the 1080px viewport. This is a design choice that works but looks unfinished.

### Per-Page Status

| Page | 390x844 | 1080x1920 | Issue | Severity |
|------|---------|-----------|-------|----------|
| gallery | ✅ OK | ⚠️ DESIGN | Content centered 600px | LOW |
| au1 | ✅ OK | ✅ OK | No issues | NONE |
| compose | ✅ OK | ✅ OK | Scales perfectly | NONE |
| backup | ⚠️ OVERFLOW | ✅ FIXED | Button off-screen at 390px | LOW |

### Key Issues Found

**Issue 1: Gallery/Backup Max-Width Constraint (Cosmetic)**
- CSS: `main { max-width: 600px; margin: 0 auto; }`
- At 1080px: creates 240px left/right margins
- Effect: content appears unfinished, not a functional issue
- Fix: Remove max-width or add media query for 1080px+

**Issue 2: Missing Media Query for 768px-1200px Range (Design)**
- No responsive CSS for devices 768px < width < 1200px
- 1080px falls in this gap (no specific handling)
- Effect: layout uses desktop rules, not mobile-optimized
- Fix: Add media query targeting 1000px-1200px range

**Issue 3: Backup Page Button Overflow at 390x844 (Minor)**
- 13 buttons stacked, last one at y=922px
- Viewport 844px tall, so last button off-screen
- At 1080x1920: viewport 1920px tall, all visible
- Effect: Minor UX friction on small mobile (requires scroll)
- Fix: Not critical, naturally resolved on taller devices

### CSS Analysis Results

**Gallery Page:**
- Standard (390x844): main = 390px wide (fills viewport)
- FullHD (1080x1920): main = 600px wide (centered with margins)
- Responsive: NO (max-width constraint forces centering)

**Au1 (Atom Detail):**
- Standard (390x844): main = 390px wide (fills viewport)
- FullHD (1080x1920): main = 1080px wide (fills viewport)
- Responsive: YES (max-width: 1200px is permissive)

**Compose Page:**
- Standard (390x844): main = 390px wide (flex layout)
- FullHD (1080x1920): main = 1080px wide (flex layout)
- Responsive: YES (no max-width constraint, uses flex)

**Backup Page:**
- Standard (390x844): main = 390px wide, content extends beyond viewport
- FullHD (1080x1920): main = 600px wide (centered), all content visible
- Responsive: PARTIAL (fixed width prevents scaling, height fixes visibility)

### Button Visibility Analysis

**Compose Page (interactive):**
- Standard mobile: 15 visible, 0 off-screen, 2 hidden (intentional)
- FullHD mobile: 15 visible, 0 off-screen, 2 hidden (intentional)
- Status: PERFECT CONSISTENCY

**Backup Page (interactive):**
- Standard mobile: 12 visible, 1 off-screen, 0 hidden
- FullHD mobile: 13 visible, 0 off-screen, 0 hidden
- Status: NATURALLY IMPROVED (taller viewport fixes it)

### Viewport Behavior Summary

**At 390x844 (Standard Mobile):**
- All pages use responsive mobile layouts
- Gallery/backup: content fills screen (390px width)
- Compose: buttons fit in flex containers
- Backup: last button off-screen (requires scroll)

**At 1080x1920 (FullHD Vertical):**
- Gallery/backup: content centers with margins (600px width)
- Au1: content scales nicely (1080px width)
- Compose: buttons spread across wider space
- Backup: all content visible in single view (no scroll needed)

## Recommendations

### Immediate Fix (Cosmetic Only - Optional)

**Quick CSS change to remove centered layout:**

```css
/* In gallery and backup pages */
main {
  /* Remove: max-width: 600px; */
  width: 100%;
  padding: 16px;
  margin: 0;
}
```

**Impact:**
- Gallery/backup scale full-width at 1080px
- Matches compose behavior
- Takes 2 minutes
- Makes design feel intentional

### Better Long-Term Fix (Proper Responsive)

**Add media query for 1080px range:**

```css
@media (min-width: 1000px) and (max-width: 1199px) {
  main {
    max-width: 100%;
    margin: 0;
    padding: 32px;
  }
}
```

**Impact:**
- Explicit handling for 1080px devices
- Future-proofs for similar devices
- Consistent with responsive design principles
- Takes 5 minutes

## Outputs Delivered

### 1. Playwright Script: debug-fullhd.mjs
- Automated viewport testing (390x844 and 1080x1920)
- DOM inspection (buttons, containers, CSS properties)
- Media query extraction
- Layout analysis
- Runnable: `node debug-fullhd.mjs` (2 minutes execution)

### 2. CSS Analysis JSON: css-analysis.json
- Detailed DOM state at both viewports
- Button properties (position, visibility, dimensions)
- Container CSS (display, width, max-width, overflow)
- Media query references
- Issue identification per page

### 3. Debug Report: 022-DEBUG-REPORT.md
- Executive summary of findings
- Viewport comparison table
- Per-page detailed analysis
- CSS issues identified with evidence
- Button visibility matrix
- Media query analysis
- Root cause explanation
- Specific recommendations

### 4. Visual Evidence: 8 Screenshots
All in `screenshots/` directory:
- gallery-390x844.png (full-width)
- gallery-1080x1920.png (centered 600px)
- au1-390x844.png (responsive)
- au1-1080x1920.png (responsive)
- compose-390x844.png (responsive)
- compose-1080x1920.png (responsive)
- backup-390x844.png (button off-screen)
- backup-1080x1920.png (all visible)

## Conclusion

The layout at 1080x1920 is **NOT broken** - it's **design-inconsistent**. Gallery and backup pages have a fixed max-width that was fine on older devices but looks odd on tall mobile phones. This is a cosmetic issue, not a functional one.

**User Experience Impact:**
- LOW - All content is accessible
- MEDIUM appearance inconsistency (centered layout looks unfinished)
- Gallery/backup work fine, just not as polished as compose page

**Recommended Action:**
Remove or adjust the `max-width: 600px` constraint on gallery/backup pages to match the responsive behavior of compose page. This is a 2-5 minute fix that makes the design feel intentional.

## Artifacts

- Location: `.planning/quick/022-debug-mobile-fullhd/`
- Commit: 6c39beb
- Files:
  - debug-fullhd.mjs (Playwright script)
  - css-analysis.json (1965 lines, detailed DOM/CSS data)
  - 022-DEBUG-REPORT.md (410 lines, comprehensive analysis)
  - screenshots/ (8 PNG files, 352KB total)
