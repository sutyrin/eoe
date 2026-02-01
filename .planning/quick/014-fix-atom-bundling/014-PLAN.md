---
phase: quick
plan: 014
type: execute
wave: 1
depends_on: []
files_modified:
  - portfolio/scripts/bundle-atoms.js
  - portfolio/scripts/copy-atoms.js
  - portfolio/package.json
  - portfolio/Dockerfile
autonomous: true

must_haves:
  truths:
    - "Every atom page on https://llm.sutyrin.pro renders a visible canvas"
    - "Audio atoms (au1, av1) show lil-gui panels and Play/Stop buttons work"
    - "No 'Failed to resolve module specifier' errors in browser console"
    - "Dev workflow (npm run dev) still works unchanged"
  artifacts:
    - path: "portfolio/scripts/bundle-atoms.js"
      provides: "Vite-based atom bundler that resolves bare imports from node_modules and lib/ imports"
    - path: "portfolio/scripts/copy-atoms.js"
      provides: "Updated to call bundle-atoms after copy"
  key_links:
    - from: "portfolio/scripts/bundle-atoms.js"
      to: "node_modules/p5, node_modules/lil-gui, node_modules/tone, lib/audio/"
      via: "Vite build API with resolve.alias"
      pattern: "vite\\.build|rollupOptions"
    - from: "portfolio/scripts/copy-atoms.js"
      to: "portfolio/scripts/bundle-atoms.js"
      via: "import and call after copy"
      pattern: "bundle|import.*bundle"
    - from: "atoms/*/index.html"
      to: "bundled JS files"
      via: "script src pointing to bundled output"
      pattern: "script.*module.*src"
---

<objective>
Fix production atom pages by pre-bundling each atom's JS entry points with Vite during build. Currently, atoms are copied raw to dist/ with bare ES module imports (p5, lil-gui, tone) and relative lib/ imports that fail in nginx static context. After this fix, every atom's JS will be a self-contained bundle with all dependencies resolved.

Purpose: Unblock production -- atom pages are the core creative output and currently show blank canvases.
Output: Working bundle-atoms.js script, updated build pipeline, deployed and verified production atoms.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/013-debug-atom-page/013-SUMMARY.md
@portfolio/scripts/copy-atoms.js
@portfolio/package.json
@portfolio/Dockerfile
@vite.config.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Vite atom bundler and integrate into build pipeline</name>
  <files>
    portfolio/scripts/bundle-atoms.js
    portfolio/scripts/copy-atoms.js
    portfolio/package.json
    portfolio/Dockerfile
  </files>
  <action>
Create `portfolio/scripts/bundle-atoms.js` that uses Vite's JavaScript API (`import { build } from 'vite'`) to bundle each atom's JS entry points into self-contained files.

**Discovery of entry points per atom:**
- Scan each atom directory in `portfolio/public/atoms/` after copy
- Parse index.html for `<script type="module" src="...">` tags to find entry points
- Each atom may have one entry (sketch.js) or two entries (sketch.js + audio.js)

**Vite build config per atom:**
```js
await build({
  root: atomDir,                    // e.g., portfolio/public/atoms/2026-01-30-av1/
  build: {
    lib: {
      entry: entryFile,             // e.g., 'sketch.js' or 'audio.js'
      formats: ['es'],
      fileName: (format) => entryFile.replace('.js', '.bundle.js')
    },
    outDir: atomDir,                // output in same directory
    emptyOutDir: false,             // DO NOT delete other atom files
    rollupOptions: {
      output: {
        // Inline all dependencies (no code splitting for atoms)
        inlineDynamicImports: true
      }
    }
  },
  resolve: {
    alias: {
      // Resolve lib/ imports that use relative paths like ../../lib/
      // Map to the actual lib/ directory at repo root
    }
  },
  // Prevent Vite from trying to resolve import.meta.hot
  define: {
    'import.meta.hot': 'undefined'
  }
})
```

IMPORTANT considerations:
- The `lib/` directory is at the REPO ROOT (`/home/pavel/dev/play/eoe/lib/`), not in portfolio/. Atoms reference it via `../../lib/audio/index.js`. In the Docker build context, lib/ is available because the Dockerfile copies from `..` context. The resolve.alias or the Vite root must account for this.
- Use the root package.json's node_modules for p5, lil-gui, tone (they are dependencies of the root workspace, NOT the portfolio workspace). In Docker, `npm ci --workspace=portfolio` runs from /app which has root node_modules.
- The `import.meta.hot` references in atom source will fail outside Vite dev -- define it as undefined so the HMR cleanup blocks are dead code eliminated.
- After bundling each entry, update the atom's index.html to point `<script type="module" src="./sketch.js">` to `<script type="module" src="./sketch.bundle.js">` (and same for audio.js -> audio.bundle.js). Use simple string replacement on the HTML.
- If an atom's sketch.js imports from `./audio.js` (like av1 does), the bundler will inline audio.js into sketch.bundle.js. That is correct -- no separate audio.bundle.js needed in that case. But if index.html has a separate `<script src="./audio.js">` tag (like au1), that audio.js needs its own bundle.
- For av-sync-debug: sketch.js imports from `./audio.js` AND uses `import config from './config.json'` -- Vite's JSON plugin handles this natively, and the config.json import should be inlined into the bundle. However, some atoms fetch config.json at runtime via `fetch('./config.json')` which is fine (the JSON file is still present).
- Strip `import.meta.hot` blocks since they are dev-only (the `define` approach handles this).

**Update copy-atoms.js:**
After copying atoms to public/atoms/, import and call the bundler:
```js
import { bundleAtoms } from './bundle-atoms.js';
// ... existing copy logic ...
await bundleAtoms();
```

**Update portfolio/package.json:**
The build script is currently: `"build": "node scripts/copy-atoms.js && node scripts/generate-metadata.js && astro build"`
This should remain the same since copy-atoms.js now calls bundle-atoms.js internally.
However, Vite needs to be available in the portfolio context. Check if `vite` is accessible from the portfolio workspace (it's a root devDependency). If not accessible during Docker build, add `vite` as a devDependency to portfolio/package.json.

**Update Dockerfile:**
The Dockerfile currently only copies `atoms/` for copy-atoms.js. Now bundle-atoms.js also needs access to `lib/` for resolving relative imports. Add:
```dockerfile
COPY lib/ ./lib/
```
After the `COPY atoms/ ./atoms/` line. Also ensure node_modules at root level has p5, lil-gui, tone. Currently `npm ci --workspace=portfolio` only installs portfolio deps. The bare imports need root deps too. Change to `npm ci` (install all workspaces) OR add p5, lil-gui, tone to portfolio/package.json devDependencies.

The SIMPLEST approach for Docker: change `RUN npm ci --workspace=portfolio` to `RUN npm ci` so all workspace dependencies (including root p5, lil-gui, tone) are installed. This ensures Vite can resolve all bare imports.

Also need to copy the root package files that include the workspaces. Currently the Dockerfile copies:
```
COPY package.json package-lock.json ./
COPY portfolio/package.json ./portfolio/
```
Add the cli package.json too (npm ci needs all workspace package.jsons):
```
COPY cli/package.json ./cli/
```
Or if cli doesn't exist as a directory, just ensure all workspace refs are satisfied.
  </action>
  <verify>
Run the portfolio build locally to verify bundling works:
```bash
cd /home/pavel/dev/play/eoe/portfolio
npm run build
```
Then check that bundled files exist:
```bash
ls portfolio/public/atoms/2026-01-30-my-first-sketch/sketch.bundle.js
ls portfolio/public/atoms/2026-01-30-av1/sketch.bundle.js
ls portfolio/public/atoms/2026-01-30-au1/audio.bundle.js
```
Check that index.html files reference .bundle.js:
```bash
grep 'bundle.js' portfolio/public/atoms/*/index.html
```
Check that no bare imports remain in bundles:
```bash
grep "from 'p5'" portfolio/public/atoms/*/sketch.bundle.js  # should find NOTHING
```
  </verify>
  <done>
All atoms have .bundle.js files with all dependencies inlined. index.html files updated to reference .bundle.js. No bare ES module imports in bundled output. Local `npm run build` succeeds without errors.
  </done>
</task>

<task type="auto">
  <name>Task 2: Deploy to production and verify atoms with Playwright</name>
  <files>
    deploy.sh (run only, not modified)
    .planning/quick/014-fix-atom-bundling/verify-atoms.mjs
  </files>
  <action>
1. Commit the bundling changes (bundle-atoms.js, updated copy-atoms.js, Dockerfile changes).

2. Run deploy.sh to push to production:
```bash
bash deploy.sh
```
Wait for Docker build to complete on remote. The Docker build now runs `npm ci` (full install), copies lib/, and the build script runs copy-atoms -> bundle-atoms -> generate-metadata -> astro build.

3. Create a Playwright verification script at `.planning/quick/014-fix-atom-bundling/verify-atoms.mjs` that tests each atom page on production:

For each atom (my-first-sketch, test-verify, workflow-test, au1, av1, av-sync-debug):
- Navigate to `https://llm.sutyrin.pro/atom/{slug}`
- Wait for iframe to load
- Check inside iframe for:
  - Canvas element exists (p5 atoms: my-first-sketch, test-verify, workflow-test, av1, av-sync-debug)
  - lil-gui panel exists (`.lil-gui` selector) for atoms that use it
  - No pageerror events (the "Failed to resolve module specifier" error must be gone)
- For audio-only atom (au1): Check for Play/Stop buttons functional (no module errors)
- Take screenshot of each atom for visual verification

Expected results:
- ALL 6 atoms render without module errors
- Visual atoms show canvas element
- GUI panels visible where expected
- au1 shows transport controls

4. Run the verification script:
```bash
npx playwright install chromium  # ensure browser installed
node .planning/quick/014-fix-atom-bundling/verify-atoms.mjs
```

5. If any atom fails, diagnose from the Playwright output and fix the bundler configuration. Common issues:
- If Tone.js fails: may need special handling for Web Audio API imports
- If config.json import fails: ensure Vite JSON plugin is active (it is by default)
- If lib/ imports fail: check resolve.alias paths in bundle config
  </action>
  <verify>
Playwright script exits with 0, all atoms show:
- hasCanvas: true (for visual atoms)
- hasGUI: true (for atoms with lil-gui)
- consoleErrors: [] (no module resolution errors)
- Screenshots in .planning/quick/014-fix-atom-bundling/screenshots/ show rendered atoms
  </verify>
  <done>
All 6 atom pages on https://llm.sutyrin.pro render correctly -- canvas visible, no module errors, GUI panels present. Production blocker resolved.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` in portfolio/ completes without errors
2. Each atom directory in public/atoms/ contains .bundle.js files
3. No bare import specifiers (p5, lil-gui, tone) appear in bundled output
4. index.html files reference .bundle.js not raw .js
5. Playwright verification on production passes for all 6 atoms
6. Dev workflow (`npm run dev` at root) still works (atoms load via Vite dev server as before)
</verification>

<success_criteria>
- All 6 production atom pages render visible canvas/controls (zero blank pages)
- Zero "Failed to resolve module specifier" errors on any atom page
- Build pipeline: copy-atoms -> bundle-atoms -> generate-metadata -> astro build
- Dev workflow unaffected (Vite dev server still resolves bare imports on the fly)
</success_criteria>

<output>
After completion, create `.planning/quick/014-fix-atom-bundling/014-SUMMARY.md`
</output>
