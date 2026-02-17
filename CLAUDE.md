# CLAUDE.md — Engines of Experience (EoE)

## Project Overview

A creative practice and publishing ecosystem for expanding horizons through making. Users create small "atoms" (creative coding sketches, audio pieces, motion graphics), compose them into richer works, and distribute across platforms. Built for short-burst workflows (10 min–1 hour) across desktop and mobile, augmented by LLMs.

**Core value:** Consistent output of creative atoms that compound into a body of work, tools, and audience.

**Production URL:** https://llm.sutyrin.pro

## Tech Stack

- **Languages:** TypeScript, JavaScript (ES modules), Python (scripts)
- **Frontend frameworks:** Astro 5, React 19, p5.js, Tone.js, Phaser 3, React Flow
- **Build:** Vite 7, npm workspaces
- **Testing:** Playwright (e2e), Vitest (unit)
- **Deployment:** Vercel (games), Docker + nginx (portfolio/backup server)
- **Platforms:** YouTube, Reddit (Devvit), TikTok (manual)
- **Other:** FFmpeg (encoding), OpenAI Whisper (voice-to-text)

## Repository Structure

```
eoe/
├── atoms/                  # Creative code sketches (p5.js, Tone.js)
├── cli/                    # `eoe` CLI tool (create/dev/build/capture/publish)
├── dashboard/              # Simple local dashboard UI
├── devvit/                 # Reddit Devvit app versions of games
│   └── steppy-scroller/    # Devvit Steppy Scroller (0.12.6)
├── docs/                   # Documentation, archives, game ideas
├── games/                  # Browser games
│   └── steppy-scroller/    # Main game (Phaser 3, Vite, TypeScript)
├── lib/                    # Shared JS libraries
│   ├── audio/              # Tone.js audio synthesis & analysis
│   ├── capture/            # Canvas/audio recording
│   ├── encoding/           # FFmpeg video/audio encoding
│   ├── utils/              # Credentials, retry logic
│   └── platforms/          # OAuth, YouTube API client
├── packages/               # Shared npm packages
│   ├── game-api/           # MCP Game API (window.__GAME__, window.__MCP__)
│   └── game-core/          # Game logic (steppy.ts, state-controller)
├── portfolio/              # Astro PWA portfolio site
│   ├── src/pages/          # 8 Astro routes (home, atom, mobile tools)
│   ├── src/scripts/        # 20+ TS files (runtime, composition, params)
│   └── src/components/     # React components
├── scripts/                # Utility scripts (token tracking)
├── server/                 # Express backup server
├── shared/                 # Shared ESLint + Prettier configs
├── .planning/              # Project state, roadmap, phase plans, quick tasks
└── vite.config.js          # Root Vite config (auto-discovers atoms)
```

## AGENTS.md Hierarchy

This project uses a hierarchy of `AGENTS.md` files. Read from root to current directory; deeper files take priority:

- `AGENTS.md` — Root: global rules, TODO, tech stack summary
- `docs/AGENTS.md` — Dev process, test pyramid, logging standards
- `games/AGENTS.md` — Common game rules (portrait, step-based, state-driven)
- `games/steppy-scroller/AGENTS.md` — Steppy Scroller roadmap, API contract, e2e
- `packages/game-api/AGENTS.md` — MCP Game API spec (getState/getActions/act)
- `devvit/AGENTS.md` — Devvit deployment, Reddit login, e2e/gif automation
- `devvit/steppy-scroller/AGENTS.md` — Devvit-specific build, deploy, test instructions

Always check the relevant AGENTS.md files before working in a subdirectory.

## Key Concepts

### Atoms

Small self-contained creative pieces. Each lives in `atoms/<YYYY-MM-DD-name>/` with:

- `index.html` — Entry point
- `sketch.js` — p5.js visual sketch or Tone.js audio
- `audio.js` — Optional audio layer (for audio-visual atoms)
- `config.json` — Parameter controllers (knobs exposed to the UI)
- `NOTES.md` — Development session log

Four atom types: `visual` (p5.js), `audio` (Tone.js), `audio-visual` (both), `composition` (multi-atom).

### MCP Game API

Games expose a browser-side API on `window.__GAME__` / `window.__MCP__`:

- `getState()` — Returns current game state
- `getActions()` — Returns available actions
- `act(actionId)` — Performs an action, returns new state

This is the canonical interface for testing and external integrations.

### Compositions

Multi-atom arrangements built on React Flow. Parameters route between atoms. Stored in IndexedDB with cloud backup. Shareable via URL.

## Common Commands

### Root (atoms dev)

```bash
npm run dev          # Start Vite dev server (opens dashboard)
npm run build        # Build all atoms
```

### CLI

```bash
npx eoe create       # Create new atom (interactive)
npx eoe dev <atom>   # Dev server for specific atom
npx eoe build <atom> # Build atom
npx eoe capture      # Record video/audio from atom
npx eoe list         # List all atoms
npx eoe publish      # Publish to YouTube/platforms
```

### Steppy Scroller (`games/steppy-scroller/`)

```bash
npm run dev          # Vite dev server with mock API
npm run build        # Production build
npm run preview      # Preview production build
npx playwright test  # Run all e2e tests
npx playwright test tests/e2e/smoke.spec.ts  # Single test
```

### Portfolio (`portfolio/`)

```bash
npm run dev          # Astro dev server
npm run build        # Production build
npm run preview      # Preview build
```

### Deployment

```bash
# Portfolio + backup server (Docker on remote)
./deploy.sh

# Steppy Scroller — auto-deploys to Vercel from master
# Devvit — manual: npm run build && devvit upload --bump patch
```

## Code Style & Formatting

- **Prettier:** Single quotes, no trailing commas, 100-char width, 2-space indent, semicolons
- **ESLint:** `no-unused-vars: warn`, `no-console: off`, ignores `node_modules/`, `dist/`, `.planning/`
- Config files live in `shared/eslint.config.js` and `shared/prettier.config.js`

## Testing

### Test Pyramid

- **Unit (60–80%):** Vitest for pure logic (game-core, lib)
- **Game API (15–30%):** Contract tests against `window.__MCP__`
- **E2E (5–10%):** Playwright browser tests

### Playwright Setup (Steppy Scroller)

- Config: `games/steppy-scroller/playwright.config.ts`
- 5 viewport projects: baseline-420x900, mobile-360x800, mobile-390x844, mobile-412x915, desktop-1920x1080
- Base URL: `E2E_BASE_URL` env var or `http://127.0.0.1:4173`
- Timeout: 60s
- Tests in `games/steppy-scroller/tests/e2e/` (6 specs: smoke, mcp, infinite, persistence, capture-screenshot, record-gif)

### Running Tests

```bash
cd games/steppy-scroller
npx playwright test                              # All tests
npx playwright test --project=baseline-420x900   # Specific viewport
```

## Development Workflow

1. Before starting work, run available tests (skip heavy e2e unless relevant)
2. Read AGENTS.md from root to working directory for context
3. Make minimal changes — feature first via API, then UI
4. All tests must pass before committing
5. `git push` after every commit
6. If working in a branch, rebase on fresh master before pushing and re-run tests
7. New decisions go in the nearest AGENTS.md
8. Completed tasks and large items move to `docs/archive.md`
9. Game ideas live in `docs/ideas/` only — do not use during active game work

## Project State

- **v1.0:** COMPLETE (2026-01-30) — Full atom creation-to-distribution pipeline
- **v1.1:** COMPLETE (2026-02-01) — Mobile-first tools, composition canvas, cloud backup
- **Current:** Quick tasks and polish (responsive fixes, atom verification)
- **Planning directory:** `.planning/` contains `STATE.md`, `PROJECT.md`, `ROADMAP.md`, phase plans, and quick task logs

## npm Workspaces

Root `package.json` defines workspaces: `cli`, `portfolio`. Game packages use local `file:` references to `packages/game-api` and `packages/game-core`.

## Important Paths

| What | Path |
|---|---|
| Project state | `.planning/STATE.md` |
| Project vision | `.planning/PROJECT.md` |
| Phase plans | `.planning/phases/` |
| Quick task logs | `.planning/quick/` |
| Atom templates | `cli/templates/` |
| Game API types | `packages/game-api/src/index.ts` |
| Game core logic | `packages/game-core/src/steppy.ts` |
| Steppy main | `games/steppy-scroller/src/main.ts` |
| Portfolio pages | `portfolio/src/pages/` |
| Shared configs | `shared/` |

## Language Note

The AGENTS.md files and some documentation are written in Russian. The codebase itself (variable names, comments, commit messages) uses English.
