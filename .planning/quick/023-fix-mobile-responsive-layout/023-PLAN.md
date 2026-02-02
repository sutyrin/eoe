---
phase: quick
plan: 023
type: execute
wave: 1
depends_on: []
files_modified:
  - "portfolio/src/layouts/MobileLayout.astro"
autonomous: true

must_haves:
  truths:
    - "Mobile layout at 390x844 remains unchanged and works as before"
    - "Mobile layout at 1080x1920 scales content to full width responsively"
    - "Layout is responsive across all mobile viewport sizes (390px to 1920px)"
    - "Gallery and backup pages use full available width at larger viewports"
    - "Compose page remains full-width (no constraint)"
  artifacts:
    - path: "portfolio/src/layouts/MobileLayout.astro"
      provides: "MobileLayout with responsive max-width constraint"
      key_section: ".mobile-main style block"
  key_links:
    - from: "MobileLayout.astro .mobile-main"
      to: "CSS max-width constraint"
      via: "media query breakpoint"
      pattern: "@media.*min-width.*1000px"
    - from: "390px viewport"
      to: ".mobile-main max-width: 600px"
      via: "no matching media query"
      pattern: "mobile-main.*max-width.*600px"
    - from: "1080px+ viewport"
      to: ".mobile-main max-width: none"
      via: "media query applies"
      pattern: "@media.*min-width.*1000px.*max-width.*none"

---

<objective>
Fix mobile responsive layout for FullHD vertical viewports (1080x1920) by removing the fixed 600px max-width constraint on smaller viewports and enabling full-width layout for devices with larger screens.

Purpose: Enable the gallery and backup pages to use full available width on FullHD vertical phones while keeping the layout comfortable on standard mobile (390x844).

Output: Updated MobileLayout.astro with responsive media query that removes max-width constraint for viewports >= 1000px.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/022-debug-mobile-fullhd/022-DEBUG-REPORT.md

**Issue context:**
- Problem: Gallery and backup pages show narrow centered layout at 1080x1920 viewport (FullHD vertical)
- Root cause: MobileLayout.astro has `max-width: 600px` on `.mobile-main` element
- Current constraint applies to ALL mobile viewports (390px to 1920px)
- Solution: Add media query to remove max-width for larger mobile devices (>= 1000px)
- Pages affected: /mobile/gallery, /mobile/backup, /mobile/compose, /mobile/[slug]

**Pattern to follow:**
- Compose page already uses `max-width: none` via `:global(.mobile-main)` override in component styles
- Gallery and backup pages inherit the 600px constraint from MobileLayout
- New media query should handle both composition and gallery/backup pages together

**Responsive design strategy:**
- Keep 600px max-width for standard mobile (390px - 999px)
- Scale to full width (max-width: none) for larger mobile devices (1000px+)
- No impact to tablet or desktop layouts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update MobileLayout.astro with responsive media query</name>
  <files>portfolio/src/layouts/MobileLayout.astro</files>
  <action>
Update the `.mobile-main` style in MobileLayout.astro to add a responsive media query:

**Current code (lines 99-104):**
```css
.mobile-main {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
  max-width: 600px;
  margin: 0 auto;
}
```

**Change to:**
```css
.mobile-main {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
  max-width: 600px;
  margin: 0 auto;
}

@media (min-width: 1000px) {
  .mobile-main {
    max-width: none;
    padding-left: calc(16px + env(safe-area-inset-left, 0));
    padding-right: calc(16px + env(safe-area-inset-right, 0));
  }
}
```

**Why this approach:**
- Keeps 600px max-width for comfortable reading on standard mobile (390px - 999px)
- Removes max-width constraint at 1000px+ for full-width layout on FullHD vertical phones
- Adds safe-area-inset adjustments for landscape mode and notched phones
- Media query breakpoint (1000px) chosen as gap between standard phones (390px) and large phones (1080px+)
- Maintains margin: 0 auto for centering when max-width is active
- No changes to default padding (16px) for consistency

**Implementation steps:**
1. Open portfolio/src/layouts/MobileLayout.astro
2. Find the `.mobile-main` style block (currently lines 99-104)
3. Keep the existing CSS as-is
4. Add the new `@media (min-width: 1000px)` block after the `.mobile-main` rule
5. Save the file

**Verification checklist:**
- File loads without syntax errors
- CSS is properly nested within the <style> block
- Media query uses correct min-width breakpoint
- max-width: none is set inside the media query
- Safe-area-inset paddings adjusted for landscape
  </action>
  <verify>
Run: `npm run build` in /home/pavel/dev/play/eoe/portfolio/

Expected output:
- Build completes without errors
- No CSS syntax errors reported
- MobileLayout.astro compiles successfully

Visual verification (local):
- At 390x844 viewport: .mobile-main has max-width: 600px (centered layout)
- At 1080x1920 viewport: .mobile-main has max-width: none (full-width layout)
- Check computed styles via browser dev tools to confirm media query applies
  </verify>
  <done>
MobileLayout.astro updated with responsive media query. The max-width: 600px constraint applies to viewports < 1000px, and max-width: none applies to viewports >= 1000px, enabling full-width layout on FullHD vertical phones.
  </done>
</task>

<task type="auto">
  <name>Task 2: Build and deploy the fix to production</name>
  <files>portfolio/</files>
  <action>
Build the updated portfolio and deploy to production server:

**Build steps:**
1. Navigate to /home/pavel/dev/play/eoe/portfolio/
2. Run: `npm run build`
3. Verify build succeeds (check dist/ directory is generated)
4. If local testing needed, run: `npm run preview` to test at different viewports

**Deploy steps:**
1. Push changes to git: `git add portfolio/src/layouts/MobileLayout.astro && git commit -m "fix: responsive layout for FullHD vertical viewports (1080x1920)"`
2. Deploy to production using your deployment script: `npm run deploy` or equivalent
3. Wait for deployment to complete (typically 1-2 minutes)
4. Verify deployment successful by checking https://llm.sutyrin.pro/mobile/gallery loads

**Post-deployment verification:**
- Open https://llm.sutyrin.pro/mobile/gallery in browser
- Test at 390x844 viewport: content should be centered with max-width constraint
- Test at 1080x1920 viewport: content should expand to full width
- Test at 768px viewport: content should remain centered (max-width: 600px applies)
- Test backup page at /mobile/backup
- Test composition page at /mobile/compose (should remain full-width as before)
  </action>
  <verify>
Run: `npm run build` in portfolio/ and confirm:
- Build output shows successful compilation
- dist/ directory exists with generated assets
- No build errors or warnings
- MobileLayout CSS is included in final bundle

After deployment:
- https://llm.sutyrin.pro/mobile/gallery loads without errors
- Page renders responsive layout based on viewport size
- Browser dev tools show correct CSS applied at different viewports
- Previous style constraints removed (no hard-coded 600px limit at 1080px+)

Manual testing checklist:
- 390x844: centered, max-width: 600px
- 768px: centered, max-width: 600px
- 1000px: full-width (max-width: none)
- 1080x1920: full-width (max-width: none)
- 1920px (desktop): full-width with side padding
  </verify>
  <done>
Portfolio built and deployed to production. MobileLayout.astro responsive CSS changes are live at https://llm.sutyrin.pro. Layout now scales properly for FullHD vertical viewports.
  </done>
</task>

</tasks>

<verification>
After both tasks complete, verify:
1. MobileLayout.astro contains new media query: `@media (min-width: 1000px) { .mobile-main { max-width: none; ... } }`
2. Build completes successfully: `npm run build` exits 0
3. Deployment successful: https://llm.sutyrin.pro/mobile/gallery is live
4. Layout responsive across viewports:
   - 390x844: max-width: 600px (centered)
   - 1080x1920: max-width: none (full-width)
5. All mobile pages work correctly:
   - /mobile/gallery - full-width at 1080x1920
   - /mobile/backup - full-width at 1080x1920
   - /mobile/compose - full-width (unchanged, already had override)
   - /mobile/[slug] - full-width at 1080x1920
</verification>

<success_criteria>
- MobileLayout.astro updated with responsive media query
- New CSS rule: `@media (min-width: 1000px) { .mobile-main { max-width: none; ... } }`
- Build succeeds without errors
- Deployment to production complete
- Gallery and backup pages use full width at 1080x1920 viewport
- Standard mobile layout (390x844) unchanged with max-width: 600px
- No regressions on other viewports (768px, 1200px, etc.)
- All pages render responsive layout correctly
</success_criteria>

<output>
After completion, update `.planning/STATE.md` with:
- Quick task 023 completed
- Mobile responsive layout fixed for FullHD vertical viewports
- MobileLayout.astro updated with media query breakpoint at 1000px
- Changes deployed to production at https://llm.sutyrin.pro
</output>
