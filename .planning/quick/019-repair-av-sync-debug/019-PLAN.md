---
phase: quick
plan: 019
type: execute
wave: 1
depends_on: []
files_modified:
  - portfolio/public/atoms/2026-01-30-av-sync-debug/index.html
autonomous: true
---

<objective>
Repair av-sync-debug atom by creating its index.html entry point and deploying to production.

Purpose: av-sync-debug atom is incomplete (missing index.html), causing gallery to show instead of the atom canvas. This plan creates the missing entry point and verifies deployment.

Output: Working av-sync-debug atom accessible at https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/ with both audio (tone.js) and sketch (p5.js) functional.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
Key files:
@portfolio/public/atoms/2026-01-30-av-sync-debug/audio.js (audio synthesis logic)
@portfolio/public/atoms/2026-01-30-av-sync-debug/sketch.js (p5.js visualization)
@portfolio/public/atoms/2026-01-30-av-sync-debug/config.json (audio-visual config)

Reference models:
@portfolio/public/atoms/2026-01-30-au1/index.html (audio-only template)
@portfolio/public/atoms/2026-01-30-av1/index.html (sketch-only template)

Bundler:
@portfolio/scripts/bundle-atoms.js (automatically bundles atoms with index.html)
</context>

<tasks>

<task type="auto">
  <name>Create index.html for av-sync-debug with audio + sketch controls</name>
  <files>portfolio/public/atoms/2026-01-30-av-sync-debug/index.html</files>
  <action>
Create index.html that:
1. Models the structure from au1 (audio.html) and av1 (sketch.html)
2. Loads BOTH audio.bundle.js AND sketch.bundle.js as module scripts
3. Includes transport controls (Play/Stop buttons) positioned above the sketch canvas
4. Uses dark theme consistent with other atoms (background #0a0a0a)
5. Sets minimal height to 100vh to fill the viewport
6. Title: "av-sync-debug"

The HTML should layer the controls on top of p5's canvas using z-index: 10.
Keep styling minimal - just button styling and layout positioning.
The bundler (bundle-atoms.js) will automatically detect the two <script type="module"> tags and bundle audio.js -> audio.bundle.js and sketch.js -> sketch.bundle.js.
  </action>
  <verify>cat portfolio/public/atoms/2026-01-30-av-sync-debug/index.html</verify>
  <done>index.html exists with two module script tags (one for audio.bundle.js, one for sketch.bundle.js), dark styling, and transport controls</done>
</task>

<task type="auto">
  <name>Build project and bundle atoms</name>
  <files>portfolio/public/atoms/2026-01-30-av-sync-debug/index.html (reads and updates)</files>
  <action>
Run build process from repository root:

1. npm run build

This will:
- Execute vite build which triggers copy-atoms.js and bundleAtoms()
- Copy atoms from /atoms to portfolio/public/atoms
- Bundle all atoms that have index.html (including av-sync-debug)
- For av-sync-debug specifically: create audio.bundle.js and sketch.bundle.js, update HTML to reference them
- The bundler script parses index.html for <script type="module" src="./X.js"> and bundles X.js -> X.bundle.js

Watch for bundler output confirming:
- "av-sync-debug: bundling audio.js, sketch.js"
- "✓ audio.js → audio.bundle.js"
- "✓ sketch.js → sketch.bundle.js"
  </action>
  <verify>
    npm run build 2>&1 | grep -A 5 "av-sync-debug"
    ls -la portfolio/public/atoms/2026-01-30-av-sync-debug/ | grep ".bundle.js"
  </verify>
  <done>Both audio.bundle.js and sketch.bundle.js exist in portfolio/public/atoms/2026-01-30-av-sync-debug/, build output shows successful bundling</done>
</task>

<task type="auto">
  <name>Deploy to production</name>
  <files>portfolio/public/atoms/2026-01-30-av-sync-debug/ (reads bundled files)</files>
  <action>
Deploy the built portfolio to production:

1. Verify vercel CLI is available: which vercel
2. Run: vercel --prod --yes
   - This builds and deploys the portfolio/ workspace to production at llm.sutyrin.pro
   - --prod ensures deployment to production (not preview)
   - --yes skips confirmation prompts

Wait for deployment to complete. The output will show the production URL.
  </action>
  <verify>
    vercel --prod --yes 2>&1 | grep -E "(Deployed|https://llm.sutyrin.pro|Production)"
    sleep 5
    curl -s https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/ | head -20
  </verify>
  <done>Deployment completes successfully, production URL is updated, curl returns HTML response (200)</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>av-sync-debug atom with HTML entry point, bundled JavaScript, and production deployment</what-built>
  <how-to-verify>
1. Open browser to: https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/
2. Verify you see:
   - Transport controls (Play, Stop buttons) at the top
   - p5.js sketch canvas below the controls
   - Dark background (not gallery view)
3. Click Play button - audio should start, visualization should animate
4. Click Stop button - audio should stop
5. No errors in browser console (F12 -> Console tab)
  </how-to-verify>
  <resume-signal>Type "approved" if atom works correctly, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
1. index.html created in portfolio/public/atoms/2026-01-30-av-sync-debug/
2. Both audio.bundle.js and sketch.bundle.js exist after build
3. Build completes without bundling errors for av-sync-debug
4. Deployment to production succeeds
5. Atom loads at https://llm.sutyrin.pro/atom/2026-01-30-av-sync-debug/ with functioning controls and canvas
6. No broken reference to missing index.html in gallery
</verification>

<success_criteria>
- av-sync-debug atom loads as full-canvas experience, not gallery fallback
- Transport controls (Play/Stop) are functional
- Audio synthesis runs when Play is clicked
- p5.js sketch visualization displays and responds to audio
- No console errors
- Changes persist after page refresh
</success_criteria>

<output>
After completion, create `.planning/quick/019-repair-av-sync-debug/019-SUMMARY.md` with:
- Actual index.html content (for reference)
- Bundle output showing both files bundled
- Deployment URL and verification results
</output>
