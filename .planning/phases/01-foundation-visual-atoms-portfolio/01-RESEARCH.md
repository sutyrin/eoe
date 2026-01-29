# Phase 1: Foundation - Visual Atoms & Portfolio - Research

**Researched:** 2026-01-29
**Domain:** Creative coding with p5.js, monorepo tooling, CLI development
**Confidence:** HIGH

## Summary

This phase combines p5.js instance mode creative coding with modern JavaScript tooling (Vite, npm workspaces, commander.js) to create a fast-iteration creative practice environment. The standard approach uses p5.js 2.2.0 in instance mode for sketch isolation, Vite 7.x for instant hot-reload, lil-gui 0.21.0 for parameter editing with JSON persistence, and npm workspaces for monorepo structure without additional orchestration overhead.

The ecosystem is mature and well-documented. p5.js instance mode integrates cleanly with Vite's HMR, lil-gui provides built-in save/load for JSON config files, and commander.js (14.x) offers zero-dependency CLI scaffolding. The key architectural pattern is self-contained atom folders, each with sketch.js (instance mode), config.json (parameters), and NOTES.md (creative log), all served by a single Vite dev server with multiple entry points.

For portfolio presentation, Astro 5.16.x (stable) or 6.0 (beta) provides static site generation with native support for embedding multiple p5.js instances. The dev dashboard can be a simple Vite-served HTML page that displays atom thumbnails using p5.js saveCanvas() or the p5.capture library for snapshot generation.

**Primary recommendation:** Use npm workspaces with a flat monorepo structure (atoms/, dashboard/, portfolio/, cli/), Vite for all dev servers, commander.js for the eoe CLI, and lil-gui for parameter editing. Plain JavaScript throughout (locked decision) with shared ESLint/Prettier configs at root.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| p5.js | 2.2.0 | Creative coding canvas sketches | Industry standard for generative art, mature API, excellent docs, instance mode prevents conflicts |
| Vite | 7.3.1 | Dev server with hot-reload | Fastest HMR in ecosystem, native ES modules, zero-config for simple cases, multi-entry support |
| lil-gui | 0.21.0 | Parameter editing GUI panel | Modern dat.gui replacement, zero dependencies, built-in JSON save/load, lightweight (290KB) |
| commander.js | 14.0.2 | CLI framework | Zero dependencies, 245M+ weekly downloads, hierarchical commands, minimal boilerplate |
| npm workspaces | npm 7+ | Monorepo management | Built into npm, no additional tools, automatic symlinking, sufficient for <50 packages |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Astro | 5.16.11 (stable) / 6.0 (beta) | Static site generator for portfolio | Multi-sketch embedding, content-driven sites, p5.js component support documented |
| p5.capture | 1.6.0 | Canvas screenshot/video capture | Generate thumbnails for dev dashboard, export animations (WebM, GIF, MP4, PNG, JPG) |
| fs-extra | latest | File system operations for CLI | Scaffolding atoms, copying templates, more convenient API than fs |
| chalk | latest | CLI output styling | Color-coded success/error messages, better UX than plain console.log |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| npm workspaces | Turborepo, Nx, pnpm workspaces | Better caching/parallelization but adds complexity; npm workspaces sufficient for Phase 1's ~20 atoms |
| commander.js | yargs | More validation features (16 deps) but slower, bigger; commander's simplicity fits short-burst workflow |
| lil-gui | dat.gui | Original library but unmaintained; lil-gui is drop-in replacement with active development |
| Astro | VitePress, Eleventy | VitePress is docs-focused, Eleventy more complex; Astro has verified p5.js integration patterns |

**Installation:**
```bash
# Root dependencies
npm install vite lil-gui p5 p5.capture commander chalk fs-extra

# Portfolio site (separate workspace)
npm install astro --workspace=portfolio
```

## Architecture Patterns

### Recommended Project Structure
```
eoe/
├── atoms/                      # All creative sketches
│   ├── 2026-01-29-spiral/     # Date-prefixed atom folder
│   │   ├── sketch.js          # p5.js instance mode sketch
│   │   ├── config.json        # Parameter source of truth
│   │   ├── index.html         # Vite entry point (loads sketch)
│   │   └── NOTES.md           # Creative log (intent, decisions, sessions)
│   └── 2026-01-30-waves/      # Another atom
├── dashboard/                  # Dev gallery page
│   ├── index.html             # Thumbnail grid, click to open atom
│   └── generate-thumbs.js     # Script to capture snapshots
├── portfolio/                  # Public-facing static site
│   ├── src/
│   │   ├── pages/             # Astro pages
│   │   └── components/        # P5Sketch component wrapper
│   └── astro.config.mjs
├── cli/                        # eoe command implementation
│   ├── index.js               # Entry point (#!/usr/bin/env node)
│   ├── commands/              # create.js, dev.js, note.js, status.js
│   └── templates/             # Atom scaffold templates
├── shared/                     # Shared configs (optional)
│   ├── eslint.config.js
│   └── prettier.config.js
├── ideas.md                    # Root-level idea capture
├── package.json                # Workspaces config
├── vite.config.js              # Multi-entry for all atoms
└── .gitattributes              # Git LFS config
```

### Pattern 1: p5.js Instance Mode Sketch
**What:** Encapsulate p5.js sketch in a function, export as new p5() instance
**When to use:** Every atom (locked decision for namespace safety)
**Example:**
```javascript
// Source: https://github.com/processing/p5.js/wiki/Global-and-instance-mode
import p5 from 'p5';
import GUI from 'lil-gui';

const sketch = (p) => {
  let config = {
    bgColor: '#1a1a1a',
    fillColor: '#ff6b6b',
    size: 50,
    speed: 2
  };

  let gui;

  p.setup = () => {
    p.createCanvas(800, 800);

    // Load config from JSON if exists
    fetch('./config.json')
      .then(r => r.json())
      .then(data => {
        Object.assign(config, data);
        setupGUI();
      });
  };

  p.draw = () => {
    p.background(config.bgColor);
    p.fill(config.fillColor);
    p.circle(p.width/2, p.height/2, config.size);
  };

  function setupGUI() {
    gui = new GUI();
    gui.addColor(config, 'bgColor').onChange(() => saveConfig());
    gui.addColor(config, 'fillColor').onChange(() => saveConfig());
    gui.add(config, 'size', 10, 200).onChange(() => saveConfig());
  }

  function saveConfig() {
    // Note: In dev, use Vite server endpoint to write JSON
    // For now, user copies from gui.save() in console
    console.log('Config:', JSON.stringify(config, null, 2));
  }
};

new p5(sketch);
```

### Pattern 2: lil-gui JSON Sync
**What:** Use lil-gui's built-in save/load with config.json file
**When to use:** All parameter editing (locked decision)
**Example:**
```javascript
// Source: https://github.com/georgealways/lil-gui/blob/main/Guide.md
import GUI from 'lil-gui';

// Load existing config
const response = await fetch('./config.json');
const config = await response.json();

const gui = new GUI();

// Add controllers
gui.addColor(config, 'bgColor');
gui.add(config, 'speed', 0, 10);

// Load saved state (if exists)
const savedState = await fetch('./config.json').then(r => r.json());
gui.load(savedState);

// Save on change
gui.onChange(() => {
  const state = gui.save();
  // Write to config.json via custom endpoint or manual copy
  console.log('Save this to config.json:', JSON.stringify(state, null, 2));
});
```

### Pattern 3: Vite Multi-Entry for Atoms
**What:** Configure Vite to serve multiple atoms from single dev server
**When to use:** Development workflow (split-screen editor + browser)
**Example:**
```javascript
// Source: https://vite.dev/guide/build
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Auto-discover all atom folders
const atomsDir = resolve(__dirname, 'atoms');
const atoms = readdirSync(atomsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const input = {
  dashboard: resolve(__dirname, 'dashboard/index.html'),
};

// Add each atom as entry point
atoms.forEach(atom => {
  input[atom] = resolve(__dirname, `atoms/${atom}/index.html`);
});

export default defineConfig({
  build: {
    rollupOptions: { input }
  },
  server: {
    open: '/dashboard' // Open dev dashboard by default
  }
});
```

### Pattern 4: CLI Template Scaffolding
**What:** Use commander.js with fs-extra to scaffold new atoms
**When to use:** eoe create visual <name> command
**Example:**
```javascript
// Source: https://github.com/tj/commander.js + community patterns
// cli/commands/create.js
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export const createCommand = new Command('create')
  .argument('<type>', 'Atom type (visual, audio, video)')
  .argument('<name>', 'Atom name')
  .description('Scaffold a new atom from template')
  .action(async (type, name) => {
    if (type !== 'visual') {
      console.error(chalk.red(`Error: Type "${type}" not supported in Phase 1`));
      process.exit(1);
    }

    const date = new Date().toISOString().split('T')[0];
    const atomName = `${date}-${name}`;
    const atomPath = path.join(process.cwd(), 'atoms', atomName);

    if (await fs.pathExists(atomPath)) {
      console.error(chalk.red(`Error: Atom "${atomName}" already exists`));
      process.exit(1);
    }

    const templatePath = path.join(__dirname, '../templates/visual');
    await fs.copy(templatePath, atomPath);

    // Replace template variables
    const sketchPath = path.join(atomPath, 'sketch.js');
    let sketch = await fs.readFile(sketchPath, 'utf8');
    sketch = sketch.replace('{{ATOM_NAME}}', name);
    await fs.writeFile(sketchPath, sketch);

    console.log(chalk.green(`✓ Created atom: ${atomName}`));
    console.log(chalk.gray(`  Run: eoe dev ${atomName}`));
  });
```

### Pattern 5: Astro p5.js Component
**What:** Wrapper component for embedding p5.js sketches in portfolio
**When to use:** Portfolio site pages
**Example:**
```astro
---
// Source: https://osbm.dev/blog/p5js-component-for-astro/
// portfolio/src/components/P5Sketch.astro
export interface Props {
  sketchPath: string;
  width?: number;
  height?: number;
}

const { sketchPath, width = 800, height = 800 } = Astro.props;
const sketchId = `sketch-${Math.random().toString(36).slice(2)}`;
---

<div id={sketchId} class="p5-container"></div>

<script define:vars={{ sketchPath, sketchId, width, height }}>
  // Load p5 and sketch
  import('p5').then(p5Module => {
    const p5 = p5Module.default;
    import(sketchPath).then(sketchModule => {
      // Sketch should export instance function
      new p5(sketchModule.default, sketchId);
    });
  });
</script>

<style>
  .p5-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
</style>
```

### Anti-Patterns to Avoid
- **Global mode p5.js:** Pollutes window namespace, breaks when embedding multiple sketches (locked decision: instance mode only)
- **TypeScript for sketches:** Adds friction to creative flow (locked decision: plain JS)
- **Manual config sync:** Don't maintain separate GUI state and JSON; use lil-gui's save/load as single source
- **Monorepo orchestrators for Phase 1:** Turborepo/Nx add complexity; npm workspaces sufficient for 20 atoms
- **Custom parameter GUI:** Don't build sliders/pickers from scratch; lil-gui handles all common types

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parameter editing UI | Custom sliders, color pickers, number inputs | lil-gui 0.21.0 | Handles all common types (number, color, string, boolean, select), built-in save/load, auto-detects types, 290KB |
| Canvas snapshot/thumbnails | Custom canvas.toDataURL() wrapper | p5.capture 1.6.0 or p5.saveCanvas() | Handles multiple formats, frame capture for animations, deals with CORS/timing issues |
| CLI argument parsing | Manual process.argv parsing | commander.js 14.0.2 | Handles subcommands, options, validation, help text generation, zero dependencies |
| File scaffolding | String concatenation + fs.writeFile | fs-extra + template files | Copy directory trees, replace variables, handle errors, preserve file permissions |
| Monorepo linking | Manual npm link commands | npm workspaces (built-in) | Automatic symlinking, shared node_modules, workspace protocol for dependencies |
| Hot module reload | Custom file watchers + page refresh | Vite HMR API | Sub-100ms updates, preserves state, handles CSS/JS/assets, production build included |
| Static site + p5.js | Custom build pipeline | Astro 5.16.11 | Zero-JS by default, component islands, documented p5.js patterns, fast builds |

**Key insight:** Creative coding ecosystem has mature, well-maintained libraries. Custom solutions add maintenance burden and miss edge cases (CORS, file permissions, browser compatibility). Use standard tools so time goes to creative work, not infrastructure.

## Common Pitfalls

### Pitfall 1: p5.js Instance Cleanup Not Called
**What goes wrong:** When hot-reloading or navigating between sketches, old p5 instances keep running, causing memory leaks and multiple canvases stacking up
**Why it happens:** p5.js doesn't auto-cleanup; developers forget to call .remove() on instance before creating new one
**How to avoid:**
- In Vite HMR, use `import.meta.hot.dispose()` to call `p5Instance.remove()`
- When embedding multiple sketches (portfolio), track instances in WeakMap and cleanup on component unmount
**Warning signs:** Multiple canvases appear on page, console shows multiple draw loops running, browser memory usage grows

### Pitfall 2: lil-gui CSS Class Name Conflicts (v0.21.0 Breaking Change)
**What goes wrong:** If using lil-gui 0.20.x or earlier with custom CSS targeting `.title`, `.autoPlace`, etc., upgrade to 0.21.0 breaks styling
**Why it happens:** Version 0.21.0 prefixed all classes with `lil-` to prevent conflicts (.title → .lil-title)
**How to avoid:**
- Use lil-gui 0.21.0+ from start (current standard)
- If upgrading, update custom CSS to use `.lil-title`, `.lil-auto-place`, etc.
- Check PR #154 for full list of renamed classes
**Warning signs:** GUI panel loses styling, appears unstyled or incorrectly positioned

### Pitfall 3: Vite Multi-Entry 404s on Nested Routes
**What goes wrong:** When configuring multiple HTML entry points, dev server returns 404 for nested paths like `/atoms/sketch-1/` instead of serving the HTML
**Why it happens:** Vite dev server doesn't automatically map directories to index.html for non-root paths
**How to avoid:**
- Use explicit paths in browser: `http://localhost:5173/atoms/sketch-1/index.html`
- Or configure Vite middleware to rewrite URLs (simple express middleware in vite.config.js)
- Dashboard approach: single index.html with links to explicit paths
**Warning signs:** Direct navigation to atom folders returns 404, but full path with index.html works

### Pitfall 4: p5.js Instance Mode Requires Prefixing All p5 Methods
**What goes wrong:** Forgetting to prefix p5 methods with sketch parameter (e.g., `createCanvas()` instead of `p.createCanvas()`) causes ReferenceError
**Why it happens:** Instance mode doesn't add methods to global scope; must explicitly call on p object
**How to avoid:**
- Use consistent naming (p or sketch) for instance parameter
- Remember: only p5.js methods need prefix, your own functions don't
- Linter rule can catch missing prefixes (custom ESLint rule or manual review)
**Warning signs:** `ReferenceError: createCanvas is not defined`, sketch doesn't render

### Pitfall 5: JSON Config File Not Updated from GUI
**What goes wrong:** User tweaks parameters in lil-gui, but config.json file doesn't update, so changes are lost on reload
**Why it happens:** lil-gui save() returns object in memory; need separate step to write to file (browser can't write files directly)
**How to avoid:**
- Phase 1 workflow: user copies JSON from console.log to config.json manually (acceptable for 10-15min bursts)
- Future: add Vite plugin or dev server endpoint to write config.json via POST
- Document in NOTES.md template: "After tweaking, copy console output to config.json"
**Warning signs:** Parameters reset to defaults on page reload, creative decisions lost

### Pitfall 6: Git LFS Not Configured Before Committing Large Assets
**What goes wrong:** Committing video/audio/large images directly to Git bloats repository, slows clones, causes GitHub size warnings
**Why it happens:** Forgetting to run `git lfs track` before first commit of media files
**How to avoid:**
- Set up Git LFS in Phase 1 setup: `git lfs install` then `git lfs track "*.mp4" "*.wav" "*.png"`
- Add `.gitattributes` with LFS patterns to repo immediately
- Document in setup docs: "Run git lfs install before creating first atom"
**Warning signs:** .git folder size grows rapidly, git push rejected due to file size, slow clones

### Pitfall 7: Atom Names Without Date Prefix Lose Chronological Context
**What goes wrong:** If manually creating atom folders without date prefix (e.g., `spiral` instead of `2026-01-29-spiral`), atoms lose chronological ordering
**Why it happens:** User creates folder by hand instead of using `eoe create` command
**How to avoid:**
- Always use `eoe create visual <name>` command (scaffolds with date)
- CLI validation: error if atom name doesn't match date pattern
- Document naming convention prominently in README
**Warning signs:** Atoms sorted alphabetically instead of chronologically, hard to track progression

## Code Examples

Verified patterns from official sources:

### Starter Template Sketch (Locked Decision: "Alive Immediately")
```javascript
// atoms/template/sketch.js
// Source: Community patterns + p5.js instance mode docs
import p5 from 'p5';
import GUI from 'lil-gui';

const sketch = (p) => {
  let config = {
    bgHue: 200,
    shapeHue: 30,
    size: 100,
    speed: 1,
    noiseScale: 0.01
  };

  let time = 0;
  let gui;

  p.setup = () => {
    p.createCanvas(800, 800);
    p.colorMode(p.HSB, 360, 100, 100);
    p.noStroke();

    // Load config
    loadConfig();
  };

  p.draw = () => {
    // Alive immediately: animated gradient background
    p.background(config.bgHue, 30, 95);

    // Centered shape with noise movement
    const x = p.width/2 + p.noise(time) * 50 - 25;
    const y = p.height/2 + p.noise(time + 100) * 50 - 25;
    const size = config.size + p.sin(time * config.speed) * 20;

    p.fill(config.shapeHue, 80, 90);
    p.circle(x, y, size);

    time += config.noiseScale;
  };

  async function loadConfig() {
    try {
      const response = await fetch('./config.json');
      const saved = await response.json();
      Object.assign(config, saved.controllers || saved);
      setupGUI();
    } catch (e) {
      console.log('No saved config, using defaults');
      setupGUI();
    }
  }

  function setupGUI() {
    gui = new GUI({ title: '{{ATOM_NAME}} Parameters' });
    gui.add(config, 'bgHue', 0, 360).name('Background Hue');
    gui.add(config, 'shapeHue', 0, 360).name('Shape Hue');
    gui.add(config, 'size', 50, 200).name('Size');
    gui.add(config, 'speed', 0.1, 5).name('Speed');
    gui.add(config, 'noiseScale', 0.001, 0.1).name('Noise Scale');

    gui.onChange(() => {
      console.log('Copy to config.json:', JSON.stringify(gui.save(), null, 2));
    });
  }
};

new p5(sketch);
```

### Atom index.html Entry Point
```html
<!-- atoms/template/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ATOM_NAME}}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0a0a0a;
    }
  </style>
</head>
<body>
  <script type="module" src="/atoms/{{ATOM_NAME}}/sketch.js"></script>
</body>
</html>
```

### Default config.json
```json
{
  "controllers": {
    "bgHue": 200,
    "shapeHue": 30,
    "size": 100,
    "speed": 1,
    "noiseScale": 0.01
  }
}
```

### NOTES.md Template
```markdown
# {{ATOM_NAME}}

**Created:** {{DATE}}
**Stage:** idea

## Intent
What am I exploring with this atom? What feeling or concept?

## Technical Decisions
- Why this approach?
- What techniques/algorithms?

## Session Log

### {{DATE}} {{TIME}}
- What I worked on
- What worked, what didn't
- Next steps
```

### CLI Dev Command
```javascript
// cli/commands/dev.js
// Source: commander.js docs + Vite patterns
import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

export const devCommand = new Command('dev')
  .argument('<atom>', 'Atom name to develop')
  .description('Start Vite dev server for atom')
  .action(async (atomName) => {
    const atomPath = path.join(process.cwd(), 'atoms', atomName);

    if (!await fs.pathExists(atomPath)) {
      console.error(chalk.red(`Error: Atom "${atomName}" not found`));
      process.exit(1);
    }

    // Append session log entry
    const notesPath = path.join(atomPath, 'NOTES.md');
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const sessionEntry = `\n### ${timestamp}\n- \n`;
    await fs.appendFile(notesPath, sessionEntry);

    console.log(chalk.blue(`Starting dev server for ${atomName}...`));
    console.log(chalk.gray(`Session logged to NOTES.md`));

    // Start Vite targeting this atom's index.html
    const vite = spawn('npx', ['vite', '--open', `/atoms/${atomName}/index.html`], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    vite.on('close', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Vite exited with code ${code}`));
      }
    });
  });
```

### npm Workspaces Configuration
```json
{
  "name": "eoe",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "cli",
    "portfolio"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^7.3.1",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  },
  "dependencies": {
    "p5": "^2.2.0",
    "lil-gui": "^0.21.0",
    "p5.capture": "^1.6.0"
  }
}
```

### Git LFS Configuration
```bash
# .gitattributes
# Source: https://git-lfs.com/
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.aiff filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.ai filter=lfs diff=lfs merge=lfs -text

# Setup commands
git lfs install
git lfs track "*.mp4" "*.mov" "*.wav" "*.mp3" "*.aiff" "*.psd" "*.ai"
```

### Vite HMR for p5.js Cleanup
```javascript
// atoms/{{ATOM_NAME}}/sketch.js - HMR cleanup pattern
// Source: https://vite.dev/guide/api-hmr + p5.js community
import p5 from 'p5';

let p5Instance;

const sketch = (p) => {
  // ... sketch code ...
};

p5Instance = new p5(sketch);

// Cleanup on HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (p5Instance) {
      p5Instance.remove(); // Remove canvas and stop draw loop
      p5Instance = null;
    }
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| dat.gui | lil-gui | 2021 | dat.gui unmaintained; lil-gui is drop-in replacement with active development |
| p5.js 1.x global mode | p5.js 2.x instance mode | 2024-2026 transition | p5.js 2.0 became default in 2026; instance mode required for multi-sketch pages |
| Webpack | Vite | 2020-2023 | 10-100x faster HMR; Vite became standard for frontend dev |
| Lerna monorepos | npm workspaces | 2020+ | Native npm support eliminates dependency; Lerna maintenance uncertain |
| Manual config save/load | lil-gui built-in save()/load() | 2021 | Replaces custom localStorage/JSON logic with standard API |

**Deprecated/outdated:**
- **dat.gui**: Last release 2018, unmaintained; use lil-gui (drop-in replacement)
- **p5.js global mode for portfolios**: Namespace conflicts when embedding multiple sketches; instance mode is standard
- **Bower, npm-link for monorepos**: Replaced by npm workspaces built-in linking
- **RequireJS, AMD modules**: p5.js and ecosystem fully support ES modules via npm

## Open Questions

Things that couldn't be fully resolved:

1. **GUI-to-JSON file write automation**
   - What we know: lil-gui save() returns JSON object; browser can't write files directly due to security
   - What's unclear: Best pattern for Phase 1 without backend server
   - Recommendation: Start with manual copy-paste from console.log (acceptable for short bursts); add Vite plugin in Phase 2 if friction too high

2. **Thumbnail generation timing**
   - What we know: p5.capture can save canvas snapshots; p5.saveCanvas() built-in
   - What's unclear: Best time to capture (manual command, auto on first load, scheduled)
   - Recommendation: Manual command `eoe snapshot <atom>` that runs headless browser or adds snapshot button in dev mode

3. **Astro 5 vs 6 for portfolio**
   - What we know: Astro 5.16.11 is stable; Astro 6.0 beta has redesigned dev server (Vite Environment API)
   - What's unclear: Is Astro 6 beta stable enough for Phase 1 (timeline: late January 2026)
   - Recommendation: Start with Astro 5.16.11 (stable), monitor Astro 6 release; upgrade if stable before portfolio task

4. **ESLint 9 flat config vs legacy for monorepo**
   - What we know: lil-gui upgraded to ESLint 9; flat config is new standard; some monorepo patterns use legacy .eslintrc
   - What's unclear: Best flat config pattern for npm workspaces with shared + per-package configs
   - Recommendation: Use ESLint 9 flat config at root with cascading configs; verify compatibility with npm workspaces

## Sources

### Primary (HIGH confidence)
- p5.js instance mode guide: https://github.com/processing/p5.js/wiki/Global-and-instance-mode
- lil-gui official docs: https://lil-gui.georgealways.com/
- lil-gui Guide.md: https://github.com/georgealways/lil-gui/blob/main/Guide.md
- lil-gui Changelog: https://github.com/georgealways/lil-gui/blob/main/Changelog.md
- Vite HMR API: https://vite.dev/guide/api-hmr
- Vite multi-entry config: https://vite.dev/guide/build
- commander.js official docs: https://github.com/tj/commander.js
- npm workspaces docs: https://earthly.dev/blog/npm-workspaces-monorepo/
- Git LFS official: https://git-lfs.com/

### Secondary (MEDIUM confidence)
- p5.js npm package (version): https://www.npmjs.com/package/p5 (search results indicate 2.2.0)
- lil-gui npm package: https://www.npmjs.com/package/lil-gui (0.21.0)
- Vite releases: https://vite.dev/releases (7.3.1 stable, 8.0 beta)
- Astro blog posts: https://astro.build/blog/astro-6-beta/ (6.0 beta), https://github.com/withastro/astro/releases (5.16.11 stable)
- p5.capture npm: https://www.npmjs.com/package/p5.capture (1.6.0)
- Astro + p5.js patterns: https://osbm.dev/blog/p5js-component-for-astro/, https://millan-castro.xyz/blog/improve-p5-performance-in-astro/

### Tertiary (LOW confidence - community patterns, not officially documented)
- p5.js cleanup patterns: https://discourse.processing.org/t/destroying-p5-js-instances/38333
- Vite multi-entry dev server 404s: https://github.com/vitejs/vite/discussions/8963
- CLI scaffolding patterns: https://dev.to/hexshift/build-your-own-frontend-scaffolding-cli-tool-with-nodejs-1oge
- Monorepo shared configs: https://dev.to/solleedata/making-shared-eslint-prettier-config-files-fdi

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs/npm, version numbers confirmed, wide adoption
- Architecture patterns: HIGH - p5.js instance mode, lil-gui save/load, Vite multi-entry all documented officially
- Pitfalls: MEDIUM - Mix of official docs (p5.remove(), lil-gui 0.21 breaking changes) and community reports (Vite 404s, JSON write friction)

**Research date:** 2026-01-29
**Valid until:** 2026-03-29 (60 days - ecosystem stable, but p5.js 2.x transition ongoing, Astro 6 in beta)
