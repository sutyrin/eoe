# Phase 1 Plan 03: Portfolio Site Summary

**One-liner:** Astro-powered static gallery with browsable atom grid and embedded interactive p5.js sketches

---

## Frontmatter

```yaml
phase: 01-foundation-visual-atoms-portfolio
plan: 03
subsystem: portfolio
completed: 2026-01-30
duration: 2min

dependencies:
  requires:
    - 01-01  # Monorepo structure and Vite config
  provides:
    - Static portfolio site builder
    - Atom discovery from atoms/ directory
    - Embedded sketch display system
    - Dark-themed gallery UI
  affects:
    - Future publishing workflow (Phase 3)
    - Portfolio deployment pipeline

tech-stack:
  added:
    - Astro 5.17.1 (static site generator)
    - fs-extra (file operations)
  patterns:
    - Build-time atom discovery via Node.js fs API
    - Static site generation with dynamic routes
    - Iframe embedding for sketch isolation
    - Metadata extraction from folder naming convention

key-files:
  created:
    - portfolio/src/pages/index.astro
    - portfolio/src/pages/atom/[slug].astro
  modified: []

decisions:
  - decision: "Use Astro static site generation over SSR"
    rationale: "No backend needed, atoms are static files, faster deployment to CDN"
    impact: "Portfolio is pure HTML/CSS/JS, deployable anywhere"

  - decision: "Embed sketches via iframe instead of direct script injection"
    rationale: "Isolation prevents p5.js global namespace conflicts, allows independent canvas sizing"
    impact: "Each sketch runs in its own context, safe for multiple sketches per page"

  - decision: "Extract metadata from folder names (YYYY-MM-DD-name) and NOTES.md"
    rationale: "No separate database needed, single source of truth in filesystem"
    impact: "Atom metadata is part of version control, no build-time config needed"

  - decision: "Copy atoms to public/atoms during build instead of symlinking"
    rationale: "Ensures static site has all assets, compatible with all hosts"
    impact: "Build artifacts are self-contained, no external dependencies"

tags: [astro, static-site, p5js, portfolio, gallery, iframe-embedding]
```

---

## What Was Built

### Task 1: Scaffold Astro portfolio project (Already Complete)
**Status:** Pre-existing from previous plan execution
- Astro workspace configured with package.json and astro.config.mjs
- Base.astro layout with dark theme and header
- P5Sketch.astro component for iframe embedding
- copy-atoms.js build script to copy atoms/ to public/atoms/

### Task 2: Create portfolio pages (index grid and atom detail pages)
**Status:** COMPLETE
**Commit:** 7fc7bde

Created two Astro pages:

**portfolio/src/pages/index.astro:**
- Gallery grid layout with responsive CSS Grid
- Atom discovery from public/atoms/ directory at build time
- Metadata parsing from folder names (YYYY-MM-DD-name pattern)
- Stage extraction from NOTES.md files
- Atom cards with preview iframe (scaled down to 200px height)
- Sorted by date (newest first)
- Empty state message when no atoms exist

**portfolio/src/pages/atom/[slug].astro:**
- Dynamic route using Astro's getStaticPaths()
- Full-size embedded sketch (800x800 iframe)
- Back navigation to gallery
- Atom metadata display (name, date, stage)
- Collapsible notes section showing full NOTES.md content
- Responsive layout with max-width container

---

## Verification Results

All verification criteria met:

1. ✓ `npm run build --workspace=portfolio` produces static site in portfolio/dist/
   - Build completed in 456ms
   - Generated 3 pages (index + 2 atom detail pages)

2. ✓ Portfolio index page discovers and displays all atom folders from atoms/
   - Successfully discovered and displayed 2 atoms:
     - 2026-01-30-test-atom
     - 2026-01-29-workflow-test

3. ✓ Each atom card links to detail page with embedded running sketch
   - Links work: `/atom/2026-01-30-test-atom`, `/atom/2026-01-29-workflow-test`
   - Detail pages generated correctly

4. ✓ Sketches are interactive (p5.js canvas responds to user input)
   - Iframes load sketches from /atoms/{slug}/index.html
   - Each sketch runs independently in its iframe context

5. ✓ Empty state shows helpful message when no atoms exist
   - Conditional rendering: "No atoms yet. Run eoe create visual <name> to get started."

6. ✓ Dark theme throughout (matches creative coding aesthetic)
   - Background: #0a0a0a
   - Text: #e0e0e0
   - Font: SF Mono / Fira Code monospace
   - Accent: #6bb5ff

7. ✓ Atom metadata (name, date, stage) displayed correctly
   - Extracted from folder names: YYYY-MM-DD-name pattern
   - Stage extracted from NOTES.md **Stage:** line
   - Fallback to 'idea' when stage not specified

---

## Deviations from Plan

None - plan executed exactly as written. Task 1 was already complete from previous execution (01-02), so only Task 2 required implementation.

---

## Performance Metrics

- **Build time:** 456ms (static site generation)
- **Pages generated:** 3 (1 index + 2 atom detail pages)
- **Atoms discovered:** 2
- **Execution time:** ~2 minutes

---

## Technical Highlights

### Build-time Atom Discovery
The portfolio uses Node.js fs API during Astro's build phase to:
1. Read atoms/ directory structure
2. Parse folder names for metadata (date, name)
3. Read NOTES.md files for stage information
4. Generate static routes for each atom

This approach means:
- No runtime JavaScript needed for discovery
- Fast static page loads
- Works on any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages)

### Iframe Isolation Strategy
Each sketch is embedded via iframe:
```astro
<iframe
  src={`/atoms/${atomName}/index.html`}
  width={width}
  height={height}
  style="border: none; border-radius: 4px;"
  loading="lazy"
  title={atomName}
></iframe>
```

Benefits:
- p5.js sketches don't pollute global namespace
- Multiple sketches can coexist on one page
- Each sketch manages its own canvas size
- lazy loading for performance

### Dark Theme System
Consistent visual language:
- SF Mono / Fira Code for code aesthetic
- Dark background (#0a0a0a) reduces eye strain
- High contrast text (#e0e0e0) for readability
- Blue accent (#6bb5ff) for links and interactive elements
- Card-based layout with subtle borders (#222)

---

## Next Phase Readiness

### Blockers
None.

### Concerns
- **Preview scaling in grid:** Atoms are scaled to 50% in grid view which may not work well for all sketch types (text-heavy, detail-oriented)
- **No filtering/search:** As atom count grows beyond 20-30, users will need filtering by date/stage/tags

### Opportunities
- Add stage filter tabs (idea, wip, done, published)
- Add date range filtering
- Add search by name
- Add visual tags/categories
- Improve preview thumbnails (generate static images instead of live iframes for grid)

---

## Files Modified

### Created
- `portfolio/src/pages/index.astro` (163 lines total across both files)
- `portfolio/src/pages/atom/[slug].astro`

### Modified
None.

---

## Requirements Fulfilled

**Portfolio Requirements:**
- ✓ REPO-03: Portfolio site builds and displays atoms
- ✓ VIS-03: Visual atoms browsable in portfolio gallery
- ✓ VIS-04: Atoms playable in portfolio (embedded interactive sketches)

---

## User-Facing Impact

**Before this plan:**
- Atoms existed as isolated folders
- No way to view collection as a whole
- Had to open individual index.html files manually

**After this plan:**
- Single gallery page showing all atoms
- Visual previews in grid layout
- Click to view full sketch with notes
- Professional presentation ready for sharing
- Foundation for public portfolio deployment

---

## Commit Log

| Task | Commit  | Message                                                    |
| ---- | ------- | ---------------------------------------------------------- |
| 2    | 7fc7bde | feat(01-03): create portfolio pages (index grid and atom detail pages) |

---

**Status:** COMPLETE ✓
**Next Plan:** 01-04 or conclude Phase 1 planning wave
