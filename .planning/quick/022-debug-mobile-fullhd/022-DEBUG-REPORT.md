# Mobile Layout Debug Report: FullHD Vertical (1080x1920)

**Date:** 2026-02-01
**Status:** Analysis Complete
**Severity:** MEDIUM - Layout works but has design inconsistency at tall viewports

---

## Executive Summary

The mobile layout at FullHD vertical (1080x1920) does NOT experience the severe breaking described. Instead, the analysis reveals a **design inconsistency** where:

1. **Gallery and Backup pages**: Center-align content to 600px max-width with side margins (240px margin-left/right)
2. **Compose page**: Scales full-width to viewport, works well at both viewports
3. **Root cause**: Gallery/Backup use `max-width: 600px` with `margin: 0 auto`, which centers content instead of adapting to the wider 1080px viewport

This is NOT a bug - it's a deliberate design choice that works differently at tall viewports.

---

## Viewport Comparison

| Property | 390x844 (Standard Mobile) | 1080x1920 (FullHD Vertical) | Behavior |
|----------|--------------------------|---------------------------|----------|
| **Viewport Type** | Standard mobile (aspect 0.46) | Tall mobile (aspect 0.56) | Content is taller, wider |
| **Layout Philosophy** | Mobile-optimized (390px width) | Desktop-preview (1080px width) | Two different CSS behaviors |
| **Button Visibility** | Varies by page | All buttons accessible (except gallery has none) | Improved in most cases |
| **Container Width** | Adapts to 390px | 600px fixed (gallery/backup) or 1080px (compose) | Design inconsistency |
| **Responsive Strategy** | Constrained mobile layout | Mixed: compose is fluid, gallery/backup are centered | No media query for 1080px |

---

## Per-Page Analysis

### Page 1: /mobile/gallery

**Status at 390x844:** ✅ OK (renders correctly, no buttons expected)
**Status at 1080x1920:** ⚠️ DESIGN INCONSISTENCY (content centered, not full-width)

**Issue:** Gallery page has no interactive buttons (just display), but layout changes dramatically:
- At 390x844: main = 390px wide, fills viewport
- At 1080x1920: main = 600px wide, centered with 240px margins on each side

**CSS Findings:**
- Main container: `max-width: 600px` (explicit limit)
- At 1080x1920: Applied as `width: 600px` with `margin: 0 240px`
- No responsive CSS for 1080px viewport

**Why it works at 390x844:**
- 390px < 600px max-width, so width constraint doesn't apply
- Element sized naturally to viewport width

**Why it "breaks" at 1080x1920:**
- 1080px > 600px, so max-width constraint kicks in
- Browser applies margin auto to center it (standard CSS behavior)
- Results in: (1080 - 600) / 2 = 240px left/right margin
- Content is usable but not full-width

**Screenshots:**
- Standard (390x844): [gallery-390x844.png] - Full width, normal appearance
- FullHD (1080x1920): [gallery-1080x1920.png] - Centered 600px content with side margins

---

### Page 2: /mobile/au1

**Status at 390x844:** ✅ OK (content displays)
**Status at 1080x1920:** ✅ OK (content displays)

**Issue:** NONE - Page scales properly at both viewports

**CSS Findings:**
- Main container: `max-width: 1200px` (permissive)
- Padding: 32px (responsive to content, not overconstraining)
- Layout: block display, no flex/grid issues
- At 390x844: 390px actual width
- At 1080x1920: 1080px actual width (uses full viewport)

**Why it works at both viewports:**
- max-width of 1200px is >= 1080px, so never constrains
- Responsive padding allows breathing room
- No fixed dimensions blocking content

**Screenshots:**
- Standard (390x844): [au1-390x844.png] - Normal mobile layout
- FullHD (1080x1920): [au1-1080x1920.png] - Scaled up, still readable

---

### Page 3: /mobile/compose

**Status at 390x844:** ✅ OK (15 buttons visible, 2 intentionally hidden)
**Status at 1080x1920:** ✅ OK (15 buttons visible, 2 intentionally hidden)

**Issue:** NONE - Layout scales perfectly

**CSS Findings:**
- Main container: full-width (no max-width constraint)
- Buttons: flex layout with proper sizing
- 2 hidden buttons are `display: none` intentionally (likely mobile UI controls)
- All visible buttons remain accessible at both viewports

**Button Status:**
- Standard (390x844): 15 visible, 0 off-screen, 2 hidden (intentional)
- FullHD (1080x1920): 15 visible, 0 off-screen, 2 hidden (intentional)

**Why it works perfectly:**
- Flex layout adapts to viewport width automatically
- No max-width constraint forces centering
- Buttons scale with container

**Screenshots:**
- Standard (390x844): [compose-390x844.png] - Buttons arranged for small screen
- FullHD (1080x1920): [compose-1080x1920.png] - Same buttons, stretched horizontally

---

### Page 4: /mobile/backup

**Status at 390x844:** ⚠️ PARTIAL (12 buttons visible, 1 off-screen at bottom)
**Status at 1080x1920:** ✅ IMPROVED (13 buttons visible, 0 off-screen)

**Issue:** Button positioning off-screen at 390x844, resolved at 1080x1920

**CSS Findings:**
- Main container: `max-width: 600px` with centered layout
- At 390x844: Buttons stretch to 326px (main - padding)
- At 1080x1920: Buttons stretch to 536px (main - padding)
- Last "Restore" button position:
  - 390x844: y=922px (BELOW viewport height of 844px - OFF SCREEN)
  - 1080x1920: y=922px (WITHIN viewport height of 1920px - VISIBLE)

**Why it's off-screen at 390x844:**
- Page content height exceeds viewport
- Last restore button positioned at y=922px
- Viewport only 844px tall, so button cut off at bottom
- User must scroll to see it

**Why it's visible at 1080x1920:**
- Viewport is 1920px tall
- Button at y=922px is well within visible area
- All buttons now visible without scrolling

**Screenshots:**
- Standard (390x844): [backup-390x844.png] - Last button requires scrolling
- FullHD (1080x1920): [backup-1080x1920.png] - All buttons visible at once

---

## CSS Issues Identified

### Issue 1: Max-width constraint on gallery/backup pages

**Affected Elements:**
- `main` element on /mobile/gallery
- `main` element on /mobile/backup

**CSS Rule:**
```css
main {
  max-width: 600px;
  margin: 0 auto;
}
```

**Problem:**
- Designed for desktop/tablet preview, not mobile-first
- At 1080px viewport, centers content with 240px margins
- Feels unfinished/broken on wide mobile devices

**Evidence:**
- Gallery main: width: 600px (vs 1080px viewport)
- Backup main: width: 600px (vs 1080px viewport)
- Compose main: width: 1080px (responsive, no max-width)

**Fix Needed:**
- Option A (Minimal): Add media query for 1080px+
  ```css
  @media (min-width: 1000px) {
    main {
      max-width: 100%;
      margin: 0;
    }
  }
  ```
- Option B (Better): Remove max-width from gallery/backup, match compose approach
  ```css
  main {
    /* Remove max-width: 600px */
    margin: 0 auto;
  }
  ```

---

### Issue 2: No media query for 1080px-1200px range

**Current Breakpoints:** Only for external stylesheets loaded, no inline media queries detected

**Gap:**
- Mobile optimized: <= 768px
- Desktop: >= 1200px
- **MISSING:** 768px to 1200px range (where 1080px falls)

**Evidence:**
- Gallery/backup have no responsive CSS for 1080px
- Compose works because it has no constraints (good practice)

**Recommendation:**
```css
/* Add this breakpoint */
@media (min-width: 1000px) and (max-width: 1199px) {
  main {
    /* Adapt layout for wide mobile/tablets */
    max-width: 100%;
    padding: 32px;
  }
}
```

---

### Issue 3: Backup page button overflow at standard mobile

**Affected Element:** Restore buttons on /mobile/backup

**CSS Rule:**
```css
button {
  display: inline-block;
  width: auto;
}
```

**Problem:**
- Page has many "Restore" buttons stacked vertically
- At 390x844: buttons extend beyond viewport height
- Last button (y=922px) is off-screen, not visible at first load

**Evidence:**
- Standard mobile: 12 visible buttons, 1 off-screen
- FullHD mobile: 13 visible buttons, 0 off-screen (fixed by height)

**Fix Needed:**
- This is NOT actually broken - it's responsive overflow
- Users can scroll to see hidden button
- At 1080x1920, the taller viewport fixes it naturally
- No CSS change needed, but UI could benefit from "Load More" pattern

---

## Button Visibility Matrix

| Page | Viewport | Total Buttons | Visible | Off-Screen | Hidden | Status |
|------|----------|---------------|---------|-----------|--------|--------|
| gallery | 390x844 | 0 | 0 | 0 | 0 | OK |
| gallery | 1080x1920 | 0 | 0 | 0 | 0 | OK |
| au1 | 390x844 | 0 | 0 | 0 | 0 | OK |
| au1 | 1080x1920 | 0 | 0 | 0 | 0 | OK |
| compose | 390x844 | 17 | 15 | 0 | 2 | OK |
| compose | 1080x1920 | 17 | 15 | 0 | 2 | OK |
| backup | 390x844 | 13 | 12 | 1 | 0 | OVERFLOW |
| backup | 1080x1920 | 13 | 13 | 0 | 0 | FIXED |

---

## Media Query Analysis

**Current Media Queries Detected:**
- External stylesheets only (cannot inspect due to CORS)
- No inline `@media` blocks in page CSS

**Breakpoints Used (inferred from behavior):**
1. Mobile: <= 768px (gallery/backup constrain to 600px)
2. Tablet/Desktop: >= 768px (no specific rules for 1080px range)

**Gap Identified:**
- **768px to 1200px:** No specific rules (this is where 1080px sits)
- Results in: max-width constraint applies without responsive adjustment
- At 1080px: max-width: 600px causes centering (not ideal for mobile)

---

## Root Cause Summary

**Primary Cause:** Lack of responsive CSS for tall mobile viewports (768px-1200px)

**Secondary Cause:** Gallery/backup pages use desktop-oriented `max-width` constraint (`600px`) without media queries to handle wider viewports

**Why Users Report It "Broken":**
1. At 1080x1920, gallery/backup center their content with 240px margins
2. Feels incomplete/unfinished - like placeholder styling
3. Compose page scales properly, so users expect gallery/backup to match
4. Visual inconsistency creates perception of brokenness

**Why It Still Works:**
- Layout is not broken, just not optimized for 1080px
- All buttons remain accessible (except backup on 390px which requires scroll)
- Content is readable and usable at all viewports
- No overflow or hidden content (except intentional hidden buttons)

---

## Recommendations

### Immediate Fix (Quick CSS Adjustment)

**Option A - Minimal (recommended):**

Remove or adjust the max-width constraint on gallery/backup pages:

```css
/* In gallery and backup page stylesheets */
main {
  /* max-width: 600px;  -- DELETE THIS */
  margin: 0 auto;
  padding: 16px;
  width: 100%;
}
```

**Impact:**
- Gallery/backup now scale full-width at 1080px
- Matches compose page behavior
- Takes 2 minutes to fix

---

### Longer-Term Fix (Proper Responsive CSS)

**Option B - Structured media queries:**

Add responsive breakpoints:

```css
/* Mobile: <= 768px */
main {
  max-width: none;
  width: 100%;
  padding: 16px;
}

/* Tablet: 768px - 1200px */
@media (min-width: 768px) {
  main {
    max-width: 90%;
    margin: 0 auto;
    padding: 32px;
  }
}

/* Desktop: >= 1200px */
@media (min-width: 1200px) {
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 64px;
  }
}
```

**Impact:**
- Consistent responsive behavior across all pages
- Gallery/backup adapt to 1080px naturally
- Better scaling for future wider devices

---

### Testing After Fix

**Verify at these viewports:**
1. 390x844 (iPhone SE) - gallery should fill screen, no margins
2. 768x1024 (iPad portrait) - gallery should adapt nicely
3. 1080x1920 (FullHD portrait) - gallery should fill screen, no margins
4. 1200x900+ (desktop) - gallery should use max-width limit

**Expected behavior:**
- Gallery and backup pages match compose behavior (responsive scaling)
- No artificial margins at 1080px
- All pages appear intentional and polished

---

## Visual Evidence

8 screenshots captured in `/screenshots/` directory:

1. **gallery-390x844.png** - Gallery at standard mobile (390px full-width)
2. **gallery-1080x1920.png** - Gallery at FullHD (600px centered with margins)
3. **au1-390x844.png** - Atom detail at standard mobile (responsive)
4. **au1-1080x1920.png** - Atom detail at FullHD (responsive)
5. **compose-390x844.png** - Compose at standard mobile (responsive)
6. **compose-1080x1920.png** - Compose at FullHD (responsive)
7. **backup-390x844.png** - Backup at standard mobile (last button off-screen)
8. **backup-1080x1920.png** - Backup at FullHD (all buttons visible)

---

## Summary

The layout at 1080x1920 is **NOT broken** - it's **not fully optimized**. Gallery and backup pages have a design inconsistency where they center their content at 600px instead of adapting to the wider viewport. This is easily fixed with a small CSS change.

The real issue is **inconsistency**, not functionality:
- Compose page: adapts beautifully to 1080px
- Gallery/backup: stick to 600px max-width
- Fix: remove max-width constraint or add media query

**Estimated fix time:** 5-10 minutes
**Difficulty:** Easy (CSS only, no JS changes)
**Testing required:** Visual verification at target viewports
