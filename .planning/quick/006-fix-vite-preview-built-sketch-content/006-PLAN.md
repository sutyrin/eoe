---
phase: quick
plan: 006
type: execute
wave: 1
depends_on: []
files_modified:
  - cli/commands/build.js
autonomous: true

must_haves:
  truths:
    - "Running eoe build copies config.json to dist output alongside bundled JS"
    - "Running npx vite preview --outDir dist/<atom> serves a working sketch with canvas visible"
  artifacts:
    - path: "cli/commands/build.js"
      provides: "Build command that copies static assets (config.json) to dist"
  key_links:
    - from: "cli/commands/build.js"
      to: "dist/<atom>/config.json"
      via: "fs-extra copy after vite build completes"
      pattern: "copy.*config\\.json"
---

<objective>
Fix `eoe build` to copy config.json into dist output so that built sketch previews load runtime configuration correctly.

Purpose: The build command runs `vite build` from the atom directory, which bundles JS/CSS but does NOT copy static assets like config.json that are fetched at runtime via `fetch('./config.json')`. Without config.json in dist, the preview falls back to hardcoded defaults. While the sketch renders either way, the built output should match the dev experience.

Output: Updated build.js that copies config.json (and any other static assets) to dist after build completes.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key context:
- `eoe build <atom>` runs `vite build` from the atom directory with `--outDir <distPath> --emptyOutDir --base ./`
- Atoms fetch `config.json` at runtime: `fetch('./config.json')` -- this is NOT bundled by Vite
- The sketch.js code handles missing config.json gracefully (catch block logs and uses defaults)
- The built index.html references `./assets/index-*.js` which contains p5.js + lil-gui + sketch code
- The sketch renders correctly even without config.json (uses hardcoded defaults)
- Real issue: config.json is a runtime-fetched static asset that Vite does not bundle

Files to reference:
@cli/commands/build.js
@atoms/2026-01-30-my-first-sketch/index.html
@atoms/2026-01-30-my-first-sketch/sketch.js
@atoms/2026-01-30-my-first-sketch/config.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Copy static assets to dist after build</name>
  <files>cli/commands/build.js</files>
  <action>
After the vite build succeeds (inside the `vite.on('close')` callback, after the code !== 0 check), add a step to copy static assets from the atom source directory to the dist output.

Specifically:
1. Copy `config.json` from atomPath to distPath if it exists
2. Copy `NOTES.md` from atomPath to distPath if it exists (useful for portfolio metadata)
3. Use `fs-extra` copy (already imported) for each file
4. Log each copied file: `chalk.gray('  Copied: config.json')`

Implementation approach:
```javascript
// After build succeeds, copy static assets that are fetched at runtime
const staticAssets = ['config.json', 'NOTES.md'];
for (const asset of staticAssets) {
  const src = path.join(atomPath, asset);
  if (await fs.pathExists(src)) {
    await fs.copy(src, path.join(distPath, asset));
  }
}
```

Place this BEFORE the "Verify output" section (the `if (await fs.pathExists(distPath))` block).

Do NOT change any other behavior of the build command. The vite build invocation, CLI arguments, and preview hint should remain the same.
  </action>
  <verify>
Run: `cd /home/pavel/dev/play/eoe && node cli/eoe.js build my-first-sketch`
Then verify: `ls dist/2026-01-30-my-first-sketch/config.json` exists
Then verify: `cat dist/2026-01-30-my-first-sketch/config.json` matches source config
Then verify preview works: start `npx vite preview --outDir dist/2026-01-30-my-first-sketch` and use playwright headless to confirm canvas renders and config.json is served as JSON (not HTML fallback)
  </verify>
  <done>
- `eoe build my-first-sketch` copies config.json to dist/2026-01-30-my-first-sketch/
- config.json in dist matches the source atom's config.json
- NOTES.md copied to dist if it exists in source
- Built sketch preview serves config.json correctly at runtime
- No changes to build behavior for atoms without config.json (no errors)
  </done>
</task>

</tasks>

<verification>
1. `node cli/eoe.js build my-first-sketch` completes successfully
2. `ls dist/2026-01-30-my-first-sketch/` shows: index.html, assets/, config.json
3. `diff atoms/2026-01-30-my-first-sketch/config.json dist/2026-01-30-my-first-sketch/config.json` shows no differences
4. Headless browser test: `npx vite preview --outDir dist/2026-01-30-my-first-sketch` serves working sketch with canvas element
</verification>

<success_criteria>
- Built sketch dist includes config.json alongside bundled HTML/JS
- Preview of built sketch loads runtime config instead of falling back to defaults
- No regression: builds still work for atoms without config.json
</success_criteria>

<output>
After completion, create `.planning/quick/006-fix-vite-preview-built-sketch-content/006-SUMMARY.md`
</output>
