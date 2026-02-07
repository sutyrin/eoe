---
phase: quick-016
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - portfolio/scripts/generate-metadata.js
  - portfolio/src/components/CodeViewer.astro
autonomous: true
---

<objective>
Fix production atom pages that are blank due to Prism.js crashes. Implement Option C: Store original unbundled atom code in atom-metadata.json at build time, display original code in CodeViewer instead of bundled code.

Purpose: Restore full functionality to all atom detail pages (/mobile/[slug]) which are currently non-functional due to JavaScript execution halting when Prism.js fails to parse bundled dependencies at line 1166.

Output: Atom pages display proper syntax-highlighted code, all tabs work, gallery is functional.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md

Current state: Atom pages are blank in production. Prism.js crashes when highlighting code, preventing DOM rendering. CodeViewer already uses atom-metadata.json (source of truth). generate-metadata.js already stores original code. Issue: Need to ensure metadata is rebuilt and code is Prism-safe.

Key files:
- portfolio/public/atom-metadata.json — compiled metadata (source of truth)
- portfolio/scripts/generate-metadata.js — generates metadata from atoms/ folder
- portfolio/src/components/CodeViewer.astro — displays code with Prism highlighting
- portfolio/src/pages/mobile/[slug].astro — uses CodeViewer (line 63)

Root cause (from quick-015): Prism can't parse bundled code because it contains minified dependencies with unusual syntax.
Solution: Keep using original code from metadata (already there), add error handling to Prism, rebuild atoms.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add error handling to CodeViewer for Prism failures</name>
  <files>portfolio/src/components/CodeViewer.astro</files>
  <action>
    Wrap Prism.highlightAll() in try/catch and add fallback styling:
    1. Import Prism as before
    2. After line 34 (Prism.highlightAll()):
       - Wrap in try/catch block
       - On catch: log error, don't throw (allows page to render even if Prism fails)
       - Add fallback CSS for when highlight fails: code block still visible and readable
    3. Verify code blocks render even if Prism encounters syntax it can't parse
    4. Alternative: If catch is needed, can add class="prism-failed" to pre element as fallback indicator

    Why: If Prism still crashes on specific syntax, the page should still be readable. This is a safety net while we ensure metadata has good code.
  </action>
  <verify>
    After modification:
    1. Check that Prism.highlightAll() is wrapped in try/catch
    2. Check that catch block logs error
    3. Inspect portfolio/src/components/CodeViewer.astro lines 27-35 show error handling
  </verify>
  <done>
    - Prism.highlightAll() wrapped in try/catch
    - catch block logs error and continues (doesn't throw)
    - Code blocks render even if Prism fails to highlight
  </done>
</task>

<task type="auto">
  <name>Task 2: Rebuild metadata and bundle atoms</name>
  <files>portfolio/public/atom-metadata.json</files>
  <action>
    Regenerate the production metadata and bundles:
    1. Run: npm run build (from portfolio/ directory)
       - This will:
         a) Run generate-metadata.js (updates portfolio/public/atom-metadata.json with original code)
         b) Vite bundle each atom (creates sketch.bundle.js in each atom folder)
         c) Astro build generates static HTML pages
    2. After build completes:
       - Check portfolio/public/atom-metadata.json exists and has "code" fields populated
       - Check portfolio/public/atoms/*/sketch.bundle.js files exist (bundles for execution)
       - Check that build completed without errors
    3. Build output should show "✔ build complete" or similar

    Why: Ensures metadata with original code is in place for CodeViewer to use, atoms are bundled for execution, pages are ready for deployment.
  </action>
  <verify>
    1. npm run build completes successfully with exit code 0
    2. portfolio/public/atom-metadata.json file size > 50KB (substantial metadata)
    3. portfolio/public/atom-metadata.json contains "code" field in first atom entry (verify with: cat portfolio/public/atom-metadata.json | jq '.[0].code | length')
    4. portfolio/public/atoms/2026-01-30-au1/sketch.bundle.js exists (bundle file)
  </verify>
  <done>
    - Build completes without errors
    - Metadata regenerated with original code
    - Atoms re-bundled for production
    - Static pages generated
  </done>
</task>

<task type="auto">
  <name>Task 3: Deploy and verify atom pages work in production</name>
  <files>[]</files>
  <action>
    Deploy the build and verify pages are functional:
    1. Deploy to production (existing deployment script/process):
       - If using fra server: Copy dist/ to server, restart nginx
       - If using Vercel: git push triggers auto-deploy
       - Verify deployment completes
    2. Once deployed, test production URLs:
       - Visit https://llm.sutyrin.pro/mobile/gallery (or your production URL)
       - Verify gallery list renders (tabs, atoms visible)
       - Click on an atom (e.g., 2026-01-30-au1)
       - Verify:
         a) Page loads without blank screen
         b) Atom title and metadata visible
         c) Code tab shows code with syntax highlighting (or at least readable without highlight)
         d) Can click through tabs: Code, Config, Notes, Params, Voice
         e) Parameter tweaker loads and shows sliders
         f) No JavaScript errors in console
    3. Test cross-browser/device:
       - Desktop: Firefox/Chrome/Safari
       - Mobile: iOS Safari (PWA), Android Chrome
       - Verify responsive layout works
    4. If pages still blank: Check browser console for JavaScript errors
       - If Prism error persists: error handling should have logged it, page should still render
       - If different error: record and diagnose

    Why: Ensures fix works in real production environment where issue was observed.
  </action>
  <verify>
    1. Production deployment succeeds (no errors in deployment logs)
    2. https://llm.sutyrin.pro/mobile/gallery loads without blank screen
    3. Atom detail page (e.g., /mobile/2026-01-30-au1) renders:
       - Title visible
       - Code tab shows code (highlighted or unhighlighted, readable)
       - Can click tabs and see content
       - No JavaScript execution halts
    4. Browser console has no fatal errors (Prism error logged if it occurs, but page still renders)
    5. All 5 functional atoms display properly (au1, av1, my-first-sketch, test-verify, workflow-test)
  </verify>
  <done>
    - All atom pages functional in production
    - No blank screens
    - Code viewer displays code with or without Prism highlighting
    - All tabs accessible and interactive
    - Users can view and edit atoms again
  </done>
</task>

</tasks>

<verification>
Phase complete when:
1. CodeViewer has error handling for Prism.highlightAll()
2. atom-metadata.json rebuilt with original code fields
3. Atoms re-bundled in production
4. Deployed to production server
5. All atom detail pages load without blank screens
6. Code tab displays readable code (with or without highlighting)
7. All tabs clickable and interactive
8. No JavaScript execution halts
</verification>

<success_criteria>
- Production atom pages no longer blank
- Gallery list at /mobile/gallery renders
- Atom detail pages (e.g., /mobile/2026-01-30-au1) display properly
- Code viewer shows code with syntax highlighting (or plain readable if Prism fails gracefully)
- All 5 atoms (au1, av1, my-first-sketch, test-verify, workflow-test) accessible
- Parameter tweaker, notes editor, voice notes all functional
- Zero fatal JavaScript errors causing page render failures
- Can compose and preview atoms again (full v1.1 workflow restored)
</success_criteria>

<output>
After successful deployment, create `.planning/quick/016-fix-atom-pages-prism/016-SUMMARY.md` documenting:
- Prism error handling added
- Metadata rebuilt
- Deployment success
- All pages verified working in production
</output>
