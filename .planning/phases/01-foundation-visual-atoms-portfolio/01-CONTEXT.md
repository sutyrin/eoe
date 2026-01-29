# Phase 1: Foundation - Visual Atoms & Portfolio - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Create p5.js sketches in short bursts, view them live in a portfolio, and track creative progress. Users can scaffold atoms, edit parameters with hot-reload, see all work in a dev dashboard and portfolio site, and capture ideas and session history. Creating audio atoms, video capture, and publishing automation are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Sketch template
- Starter pattern template (not blank canvas) — new sketch immediately shows something alive (e.g., centered shape, basic color palette, noise seed) so you can riff on it
- p5.js in instance mode (`const s = (p) => { ... }`) — cleaner namespace, better for embedding multiple sketches in portfolio
- Plain JavaScript, not TypeScript — zero friction, fastest path from idea to pixels
- Default canvas size: 800x800 square — classic generative art format, good for portfolio grid and social media

### Parameter editing
- JSON config file as source of truth (config.json per atom)
- In-browser GUI panel (lil-gui / dat.gui style) overlaid in dev mode — sliders, color pickers, real-time tweaking
- GUI reads from and writes back to the same JSON config — both paths stay in sync

### Naming & scaffolding
- Date-prefixed naming: `eoe create visual spiral` produces `2026-01-29-spiral`
- Date prefix keeps atoms chronological, shows progression over time

### Dev experience
- Split-screen workflow: editor on one side, browser on the other — code and output simultaneously visible
- Dev dashboard: a local page showing thumbnails of recent sketches, click to open one — gallery-like development environment
- Hot-reload via Vite so edits reflect instantly

### Notes & idea capture
- Two paths for ideas: CLI quick capture (`eoe note "swirling galaxy"`) and direct markdown editing (ideas.md at repo root)
- CLI appends to the same ideas.md file — both paths converge
- ideas.md lives at monorepo root level for easy access

### Per-atom notes
- NOTES.md auto-created with every new atom scaffold — template includes intent, decisions, and session log sections
- Content captures: creative intent, technical decisions made, and timestamped session log
- Session log is auto-tracked: running `eoe dev` appends a session entry with timestamp, user fills in what they did

### Atom status stages
- Four stages: idea → sketch → refine → done
- Separates initial exploration (sketch) from polishing (refine)
- No tags in Phase 1 — stages are enough for the 20-sketch target

### Status command
- Table format output: columns for name, stage, created, last-modified
- Designed to be scannable at 20+ atoms

### Claude's Discretion
- Project structure and monorepo layout details
- Shared tooling config specifics (linting, formatting)
- Git LFS configuration approach
- Dev dashboard implementation details
- GUI panel library choice (lil-gui, dat.gui, or equivalent)
- Portfolio site layout and navigation
- Loading skeleton and error state handling

</decisions>

<specifics>
## Specific Ideas

- Starter template should feel alive immediately — something visual running from the first scaffold, not a blank canvas
- Split-screen is the primary work posture — optimize for code + output side by side
- Dev dashboard as a gallery of recent work — thumbnails you can click into
- Session log should reduce friction: auto-timestamp when dev server starts, user just fills in what happened

</specifics>

<deferred>
## Deferred Ideas

- LLM-assisted creative loop: select ideas from notes, have LLM generate code, iterate between code/GUI/LLM prompts in any order — future phase (likely v2 LLM creative console)

</deferred>

---

*Phase: 01-foundation-visual-atoms-portfolio*
*Context gathered: 2026-01-29*
