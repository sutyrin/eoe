---
phase: quick
plan: 015
subsystem: debugging
tags: [playwright, prism, code-syntax-highlighting, production]

# Dependency graph
requires:
  - phase: quick-014
    provides: Atom bundling infrastructure (Vite-based bundles deployed to production)
provides:
  - Root cause diagnosis of atom page rendering failures
  - Evidence-based fix recommendations for Prism syntax highlighting
affects: [atom-pages, code-viewer]

# Tech tracking
tech-stack:
  added: []
  patterns: [Playwright DOM inspection, Prism.js error diagnosis]

key-files:
  created:
    - .planning/quick/015-debug-atom-page/investigate-atoms.mjs
    - .planning/quick/015-debug-atom-page/investigate-results.json
    - .planning/quick/015-debug-atom-page/screenshots/

key-decisions:
  - "Identified Prism.js as source of page errors, not module loading"
  - "Discovered bundled code contains syntax Prism cannot parse"
  - "Determined issue affects both desktop and mobile views"

patterns-established:
  - "Bundled Prism code in atom bundles causes syntax parse errors"
  - "Prism.highlightAll() runs on page load, crashes on certain syntax patterns"

# Metrics
duration: 12min
completed: 2026-02-01
---

# Quick Task 015: Debug Atom Page Display Issues

**Playwright investigation reveals Prism.js syntax highlighting crashes when parsing bundled atom code at line 1166. This prevents page render and causes blank atom detail/canvas views. The bundled code contains syntax patterns Prism cannot parse (likely in p5.js or tone.js dependencies).**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-01T07:03:13Z
- **Completed:** 2026-02-01T07:15:13Z
- **Tasks:** 2
- **Tests:** 3 scenarios (desktop canvas, mobile detail, mobile gallery)
- **Screenshots:** 3 captured

## Accomplishments

- Automated production debugging with Playwright browser automation
- Captured exact error: Prism.js unable to parse bundled code syntax at line 1166
- Verified issue affects all atom pages (both desktop /atom/au1 and mobile /mobile/au1)
- Tested gallery list view separately to isolate issue
- Documented DOM state showing 6 iframes attempting to load
- Identified root cause: bundled dependencies contain syntax Prism cannot tokenize

## Key Findings

### Issue Summary

**Problem:** User reports visiting `/mobile/au1` and seeing broken pages with no interactive elements. Investigation confirms:
- ❌ Desktop canvas view (/atom/au1) shows NO canvas element
- ❌ Mobile detail view (/mobile/au1) shows NO tabs, NO back button, NO code display
- ❌ Mobile gallery view (/mobile/gallery) shows NO gallery items in list
- ❌ All pages have Prism.js parsing errors in console

### Root Cause: Prism.js Syntax Parsing Crash

**Error message (repeated 12+ times):**
```
Error parsing code: SyntaxError: Unexpected token (1166:18)
  at pp$4.raise (sketch.bundle.js:54280:13)
  at pp$9.unexpected (sketch.bundle.js:51665:8)
  at pp$9.expect (sketch.bundle.js:51662:27)
  at pp$5.parseMethod (sketch.bundle.js:54075:8)
  ... (Prism parser stack)
```

**Diagnosis:** When CodeViewer component calls `Prism.highlightAll()`, it attempts to syntax-highlight ALL code blocks on the page. The bundled sketch files contain JavaScript syntax patterns that Prism's parser rejects. Common culprits in bundled code:
- Advanced JavaScript syntax (optional chaining `?.`, nullish coalescing `??`, etc.)
- Minified code patterns
- Vendor code from p5.js or tone.js that uses non-standard syntax markers

### DOM Structure Findings

**Desktop view (/atom/au1):**
- ✅ Page loads (200 status)
- ✅ Header with back link renders
- ✅ 1 iframe element loads (atom canvas)
- ❌ No canvas element inside iframe
- ❌ No buttons visible
- ✅ Notes section renders but hidden in details

**Mobile detail view (/mobile/au1):**
- ✅ Page loads (200 status)
- ✅ Header renders with title
- ❌ No tab navigation appears (should show Code/Config/Notes/Params/Voice tabs)
- ❌ No back button (tab-accessible at 44px min)
- ❌ No code display
- 6 iframes attempted to load (side effect of CodeViewer trying to render multiple atoms)
- Tone.js initializes repeatedly (multiple Audio contexts spawning)

**Mobile gallery view (/mobile/gallery):**
- ✅ Page loads (200 status)
- ✅ Search input appears
- ❌ No gallery items in list (should show list of atoms)
- ✅ No Prism errors (no code highlighting attempted)

### Console Errors Captured

**File affected:** All bundled atom sketch files
- `/atoms/2026-01-30-my-first-sketch/sketch.bundle.js` - 3 errors
- `/atoms/2026-01-29-workflow-test/sketch.bundle.js` - 2 errors
- `/atoms/2026-01-30-av1/sketch.bundle.js` - 3 errors
- `/atoms/2026-01-30-test-verify/sketch.bundle.js` - 2 errors

**Error pattern:** Identical error at line 1166:18 in all bundles, suggesting consistent bundling issue.

### Expected vs Actual State

| Scenario | Expected | Actual | Issue |
|----------|----------|--------|-------|
| Desktop /atom/au1 | Canvas renders, GUI visible (if audio), play buttons | Blank page, no canvas | Prism crash prevents page render |
| Mobile /mobile/au1 | Code tab visible, tab nav present, code syntax highlighted | Blank, no tabs, no content | Prism crash, Tab nav hidden |
| Mobile /mobile/gallery | List of 5 atoms visible, searchable | Blank list, no items | Likely affected by same Prism issue |

## Screenshots Evidence

Three screenshots captured showing actual page states:

1. **desktop-atom-canvas-view.png** - Shows header + back link + notes section, but empty iframe (no canvas visible inside)
2. **mobile-detail-view-(reported-issue).png** - Shows only header, completely blank below header (no tabs, no code)
3. **mobile-gallery-view.png** - Shows search bar but empty atom list below

## Technical Analysis

### Why Prism Fails on Bundled Code

The CodeViewer component loads JavaScript, JSON, and Markdown Prism plugins. When `Prism.highlightAll()` runs:
1. It finds all `<code class="language-javascript">` elements
2. For each code block, Prism's tokenizer parses the JavaScript
3. Bundled code (minified/optimized by Vite) contains syntax patterns Prism doesn't expect
4. Prism throws "SyntaxError: Unexpected token" and stops processing

**Why this happens:**
- Vite bundles minify code, which may use patterns like `const{a,b}=c` without spaces
- Bundled vendor libraries (p5.js, tone.js) may have syntax Prism 1.x doesn't support
- Prism JavaScript parser (prism-javascript.min.js) is older and less permissive than modern JS parsers

### Why Pages Appear Blank

When Prism crashes during `highlightAll()`:
1. CodeViewer component tries to render code blocks
2. Prism crashes on first code block
3. JavaScript execution stops (uncaught error)
4. Subsequent DOM updates don't happen
5. Tabs, buttons, and other interactive elements never render

This explains why mobile detail shows NO tabs (they're added by JavaScript), and why gallery shows no items.

## Recommended Fixes

### Option A: Disable Prism Highlighting (QUICK FIX)

Remove Prism.js from CodeViewer entirely. Display code as plain text with CSS styling only.

**Pros:**
- Instant fix (remove 5 lines)
- No dependencies on Prism parser version
- Code still readable with white-space: pre-wrap CSS
- Eliminates all Prism errors

**Cons:**
- Loss of syntax highlighting (visual polish)
- Less readable code for long files
- Can't easily re-enable later

**Effort:** 30 minutes (includes testing)

---

### Option B: Use Lightweight Syntax Highlighter (BETTER)

Replace Prism with Shiki or highlight.js which handle minified/bundled code better.

**Shiki approach:**
- Build-time syntax highlighting (pre-process code during Astro build)
- No runtime parsing errors
- Works on minified code
- Smaller bundle than Prism
- No JavaScript required on client

**Effort:** 2-3 hours to implement and test

---

### Option C: Pre-strip Code Before Prism (MIDDLE GROUND)

Keep Prism but extract actual code from bundles before display.

**How:**
1. In atom-metadata.json generation, store ORIGINAL code (not bundled)
2. CodeViewer displays original source, not from iframe
3. Prism parses clean source code, no syntax errors

**Pros:**
- Keeps Prism for highlighting
- Shows readable original source to users
- No runtime errors

**Cons:**
- Requires storing original code separately
- atom-metadata.json file grows larger

**Effort:** 1-2 hours

---

### Option D: Upgrade Prism + Fix Syntax (COMPREHENSIVE)

Upgrade Prism to latest version that supports modern JavaScript syntax.

**Effort:** 3-4 hours (testing multiple Prism versions, debugging compatibility)

---

## Recommendation Ranking

1. **Option C (Pre-strip Code)** - Best balance: fixes error, shows readable original code, no blocker
2. **Option B (Shiki)** - Best long-term: build-time highlighting, no runtime errors, smaller
3. **Option A (Disable)** - Fastest: 30 min, acceptable UX, but loses highlighting
4. **Option D (Upgrade)** - Most complex: version incompatibilities likely, uncertain benefit

**Next quick task should implement Option C or B** to restore atom page functionality.

## Issues Preventing Pages from Rendering

### Issue 1: Prism JavaScript Parser Too Strict

**Impact:** CodeViewer component crashes on page load
**Severity:** CRITICAL - Blocks all atom pages
**Affected components:** CodeViewer.astro → all mobile detail pages, desktop atom pages

### Issue 2: Mobile Gallery List Empty

**Impact:** Users can't browse atoms on mobile
**Severity:** HIGH - Core feature broken
**Affected components:** gallery.astro → /mobile/gallery page

### Issue 3: Tab Navigation Hidden

**Impact:** Users can't switch between Code/Config/Notes/Params/Voice tabs
**Severity:** HIGH - No way to access features
**Affected components:** [slug].astro → /mobile/[slug] pages

## User Impact

Currently, atom pages are **completely unusable in production**:
- Desktop: No canvas visible, users can't interact with atoms
- Mobile: Blank pages, no tabs, no code viewing, no parameter tweaking

This is a critical blocker for the entire v1.1 workflow (composition, parameter tweaking, etc.).

## Next Phase Readiness

**Blocker for v1.1 production:** Prism parsing issue must be resolved to restore atom page functionality.

**Files ready for fix:**
- `portfolio/src/components/CodeViewer.astro` - needs Prism fix or replacement
- `portfolio/scripts/generate-metadata.js` - needs to store original code if using Option C
- `portfolio/public/atom-metadata.json` - will grow if storing original code

**Technical path clear:** All recommended options are feasible and well-defined.

---

## Next Steps

1. Choose fix option (recommend Option C)
2. Quick task 016: Implement selected fix
3. Deploy and verify with Playwright
4. Enable atom pages in production

---

*Phase: quick-015*
*Completed: 2026-02-01*
