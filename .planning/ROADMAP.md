# Roadmap: Engines of Experience

**Created:** 2026-01-29
**Status:** Active
**Depth:** Standard (5-8 phases)
**Core Value:** Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

## Overview

This roadmap delivers a creative practice and publishing ecosystem in 3 phases, prioritizing depth before breadth and manual workflows before automation. Phase 1 establishes the vertical (visual creative coding) with foundational tooling. Phase 2 adds the first horizontal (audio) to enable cross-domain composition. Phase 3 completes the distribution pipeline with video capture and CLI tooling maturity. The structure respects the "Tooling Trap" warning by requiring 20+ shipped sketches in Phase 1 before expanding capabilities.

## Phases

### Phase 1: Foundation - Visual Atoms & Portfolio

**Goal:** Users can create p5.js sketches in short bursts, see them live in a portfolio, and track creative progress.

**Dependencies:** None (foundational phase)

**Plans:** 4 plans

Plans:
- [ ] 01-01-PLAN.md — Monorepo skeleton with npm workspaces, Vite, Git LFS, shared configs
- [ ] 01-02-PLAN.md — CLI tool with create/dev commands and visual atom template
- [ ] 01-03-PLAN.md — Astro portfolio site with atom gallery and detail pages
- [ ] 01-04-PLAN.md — Note/status CLI commands and dev dashboard

**Requirements:**
- REPO-01: Single monorepo contains all atoms, compositions, tools, and notes
- REPO-02: Standardized atom directory structure (each atom is self-contained folder)
- REPO-03: Shared tooling config (TypeScript, Vite, linting) at root level
- REPO-04: Git + LFS configured for media assets (audio, video, images)
- VIS-01: Create p5.js sketches with Vite hot-reload in browser
- VIS-02: Atom template scaffolding (one command creates new sketch with boilerplate)
- VIS-03: Standardized atom interface (init, update, draw, cleanup, config)
- VIS-04: Parameter config per atom (colors, speeds, sizes) as editable JSON
- CLI-01: `eoe create <type> <name>` scaffolds new atom from template
- CLI-02: `eoe dev <atom>` starts Vite dev server with hot-reload
- NOTE-01: Markdown-based idea capture (quick jot with context, tags)
- NOTE-02: Per-atom notes file tracking stage, plans, creative decisions

**Success Criteria:**
1. User can scaffold a new p5.js sketch with one CLI command and see it running in browser within 30 seconds
2. User can edit sketch parameters in JSON and see visual changes update instantly via hot-reload
3. User can view all created atoms in a web portfolio with embedded playable contraptions
4. User can jot down creative ideas in markdown and associate notes with specific atoms
5. User has created and published 20+ original sketches, proving consistent short-burst workflow

**Research Flag:** REQUIRED - User override. Research implementation patterns for p5.js instance mode, lil-gui integration, Vite dev server customization, and monorepo structure.

---

### Phase 2: Audio Integration

**Goal:** Users can create audio atoms with Tone.js and combine them with visual atoms to produce audio-reactive compositions.

**Dependencies:** Phase 1 (requires atom workspace structure, CLI foundation, portfolio deployment)

**Requirements:**
- AUD-01: Create audio atoms with Tone.js in browser
- AUD-02: Simple tune composition (synths, sequences, effects)
- AUD-03: Audio-reactive visual parameters (FFT analysis drives sketch properties)
- AUD-04: Audio atom template scaffolding
- CLI-03: `eoe build <atom>` produces production bundle
- CLI-05: `eoe list` shows all atoms with status (idea/wip/done)
- NOTE-03: WIP tracker showing all pieces and their current stage
- NOTE-04: CLI integration (`eoe note <atom>` opens notes, `eoe status` shows WIP)

**Success Criteria:**
1. User can create a simple audio tune using Tone.js with synths and sequences in a short burst
2. User can connect audio analysis (FFT) to visual parameters so visuals react to sound
3. User can compose audio + visual atoms together via JSON manifest with timeline orchestration
4. User can see WIP status of all atoms at a glance via CLI command
5. User has created 5-10 audio pieces and 3-5 audio-reactive compositions

**Research Flag:** MEDIUM PRIORITY - Audio-visual synchronization complexity. Consider research if timeline orchestration proves difficult. Web Audio API timing precision and composition patterns may need deeper investigation.

---

### Phase 3: Video Capture & Distribution

**Goal:** Users can capture running atoms as video, encode for multiple platforms, and track distribution via enhanced CLI.

**Dependencies:** Phase 2 (requires mature atom ecosystem with visual + audio compositions)

**Requirements:**
- VID-01: Capture running atom canvas to video via Playwright
- VID-02: FFmpeg encoding to platform formats (16:9 YouTube, 9:16 TikTok)
- VID-03: Thumbnail extraction from key frames
- VID-04: Capture with audio (record Tone.js output alongside visuals)
- CLI-04: `eoe capture <atom>` records canvas to video

**Success Criteria:**
1. User can capture a running sketch with audio to video file with one CLI command
2. User receives multiple encoded versions optimized for YouTube (16:9) and TikTok (9:16) automatically
3. User gets thumbnail images extracted from key frames for platform uploads
4. User can manually publish videos to 1-2 platforms and document pain points for future automation
5. User has captured and distributed 10+ videos across platforms, validating the full creation-to-distribution workflow

**Research Flag:** HIGH PRIORITY - Publishing pipeline has high complexity. Recommend research phase to investigate: Playwright canvas capture best practices (frame rate, quality settings), FFmpeg encoding profiles for web video (H.264 compression), platform API quirks and rate limits, thumbnail extraction strategies.

---

## Progress

| Phase | Status | Requirements | Completion |
|-------|--------|--------------|------------|
| Phase 1: Foundation - Visual Atoms & Portfolio | Planned (4 plans) | 12/12 | 0% |
| Phase 2: Audio Integration | Pending | 8/8 | 0% |
| Phase 3: Video Capture & Distribution | Pending | 5/5 | 0% |

**Total:** 0/25 requirements completed (0%)

**Current Focus:** Phase 1 planned, ready for execution

---

## Deferred to v2

The following capabilities are explicitly deferred to preserve focus on core workflow validation:

- **Web Platform (WEB-01 to WEB-04):** Playable web contraptions with unique shareable URLs, Astro portfolio site features
- **Publishing Pipeline (PUB-01 to PUB-04):** Multi-platform publishing automation, CLI publish command, platform-specific adaptation
- **Infrastructure (INFRA-01 to INFRA-04):** Syncthing multi-device sync, LLM creative console, metrics dashboard, n8n workflows
- **Advanced Creation (ADV-01 to ADV-04):** Three.js 3D scenes, motion graphics with GSAP, composition layer, Blender integration
- **Community & Performance (COM-01 to COM-04):** Live streaming setup, Discord community, GitHub organization, teaching content

**Rationale:** Phase 1-3 establish the core creation loop and prove consistent output. Automation, infrastructure, and community features require proven pain points before investment. The research explicitly warns against premature automation and tooling traps.

---

## Key Milestones

| Milestone | Target | Description |
|-----------|--------|-------------|
| First Sketch Live | Phase 1 Week 1 | One p5.js sketch running in browser with hot-reload |
| Portfolio Deployed | Phase 1 Week 3 | Basic portfolio site live on Cloudflare Pages with 5 sketches |
| 20 Sketches Shipped | Phase 1 End | Vertical depth proven, consistent workflow validated |
| First Audio Piece | Phase 2 Week 1 | One Tone.js composition playing in browser |
| Audio-Reactive Demo | Phase 2 Week 2 | Visual sketch responding to audio analysis |
| First Video Captured | Phase 3 Week 1 | Canvas recording to video file working |
| 10 Videos Distributed | Phase 3 End | Full creation-to-distribution pipeline validated manually |

---

## Anti-Patterns to Avoid

Based on research warnings and project constraints:

1. **The Tooling Trap** - Spending weeks researching "perfect stack" instead of creating. Phase 1 enforces output quota (20+ sketches) before expanding.
2. **Horizontal Layers** - Building all models, then all APIs, then all UI. Each phase delivers complete vertical capability.
3. **Premature Automation** - Automating before feeling pain. Phase 3 requires manual publishing first to discover real friction.
4. **Tutorial Purgatory** - Following tutorials without original work. Success criteria require original pieces, not reproductions.
5. **Scope Creep** - "Just one more feature" before shipping. v2 features explicitly deferred, not in roadmap.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-29 | 3 phases (not 7) | Standard depth guidance + constraint that v1 scope is foundation only. Research Phases 4-7 (publishing automation, LLM, streaming, community) deferred to v2 based on requirements categorization. |
| 2026-01-29 | Visual atoms before audio | Research priority: lower complexity, faster validation. Audio added in Phase 2 after vertical proven. |
| 2026-01-29 | Manual publishing in Phase 3 | "Start manual, automate pain points" constraint. Automation (n8n, platform APIs) deferred to v2 until manual process proven. |
| 2026-01-29 | Portfolio in Phase 1 | Table stakes for showcasing work, required to prove value before expanding capabilities. |
| 2026-01-29 | CLI evolves across phases | Research guidance: basic commands first (create, dev), then mature features (build, capture, list) as capabilities grow. |

---

*Last updated: 2026-01-29*
*Next action: Execute Phase 1 with `/gsd:execute-phase 1`*
