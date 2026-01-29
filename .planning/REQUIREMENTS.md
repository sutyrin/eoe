# Requirements: Engines of Experience

**Defined:** 2026-01-29
**Core Value:** Consistent output of creative atoms that compound into a body of work, tools, and audience — producing results, not consuming time learning tools.

## v1 Requirements

### Monorepo Structure

- [ ] **REPO-01**: Single monorepo contains all atoms, compositions, tools, and notes
- [ ] **REPO-02**: Standardized atom directory structure (each atom is self-contained folder)
- [ ] **REPO-03**: Shared tooling config (TypeScript, Vite, linting) at root level
- [ ] **REPO-04**: Git + LFS configured for media assets (audio, video, images)

### Creative Coding (Visual)

- [ ] **VIS-01**: Create p5.js sketches with Vite hot-reload in browser
- [ ] **VIS-02**: Atom template scaffolding (one command creates new sketch with boilerplate)
- [ ] **VIS-03**: Standardized atom interface (init, update, draw, cleanup, config)
- [ ] **VIS-04**: Parameter config per atom (colors, speeds, sizes) as editable JSON

### Audio

- [ ] **AUD-01**: Create audio atoms with Tone.js in browser
- [ ] **AUD-02**: Simple tune composition (synths, sequences, effects)
- [ ] **AUD-03**: Audio-reactive visual parameters (FFT analysis drives sketch properties)
- [ ] **AUD-04**: Audio atom template scaffolding

### Video Capture

- [ ] **VID-01**: Capture running atom canvas to video via Playwright
- [ ] **VID-02**: FFmpeg encoding to platform formats (16:9 YouTube, 9:16 TikTok)
- [ ] **VID-03**: Thumbnail extraction from key frames
- [ ] **VID-04**: Capture with audio (record Tone.js output alongside visuals)

### CLI Cockpit

- [ ] **CLI-01**: `eoe create <type> <name>` scaffolds new atom from template
- [ ] **CLI-02**: `eoe dev <atom>` starts Vite dev server with hot-reload
- [ ] **CLI-03**: `eoe build <atom>` produces production bundle
- [ ] **CLI-04**: `eoe capture <atom>` records canvas to video
- [ ] **CLI-05**: `eoe list` shows all atoms with status (idea/wip/done)

### Creative Notebook

- [ ] **NOTE-01**: Markdown-based idea capture (quick jot with context, tags)
- [ ] **NOTE-02**: Per-atom notes file tracking stage, plans, creative decisions
- [ ] **NOTE-03**: WIP tracker showing all pieces and their current stage
- [ ] **NOTE-04**: CLI integration (`eoe note <atom>` opens notes, `eoe status` shows WIP)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Web Platform

- **WEB-01**: Playable web contraptions with unique shareable URLs
- **WEB-02**: Astro portfolio site deployed to Cloudflare Pages
- **WEB-03**: Responsive design with mobile touch controls
- **WEB-04**: Embeddable contraptions via iframe

### Publishing Pipeline

- **PUB-01**: Multi-platform publishing automation (YouTube, Reddit, TikTok APIs)
- **PUB-02**: CLI publish command for one-click distribution
- **PUB-03**: Platform-specific format adaptation (aspect ratios, durations)
- **PUB-04**: LLM-generated descriptions, tags, thumbnails

### Infrastructure

- **INFRA-01**: Syncthing multi-device sync (desktop, laptop, mobile, server)
- **INFRA-02**: LLM creative console for pair-creation
- **INFRA-03**: Metrics dashboard and feedback aggregation
- **INFRA-04**: n8n workflow automation on Linux server

### Advanced Creation

- **ADV-01**: Three.js 3D scenes, shaders, WebGL
- **ADV-02**: Motion graphics with GSAP animations
- **ADV-03**: Composition layer (combine atoms via JSON manifests)
- **ADV-04**: Blender + Python procedural generation

### Community & Performance

- **COM-01**: Live streaming setup (OBS, WebRTC, guest participation)
- **COM-02**: Discord community server
- **COM-03**: GitHub organization for open source tools
- **COM-04**: Teaching/tutorial content pipeline

## Out of Scope

| Feature | Reason |
|---------|--------|
| Professional DAW/video compositing | Atoms only, not production suites |
| Native mobile apps | Web browser is sufficient |
| Social network features | Portfolio is home base, not platform |
| Real-time collaboration | Git workflow sufficient for solo practice |
| Monetization/NFT | Anti-commercial to preserve creative freedom |
| Premature automation | Manual first, automate proven pain points |
| End-to-end paid creative suites | Building own tooling from explored atoms |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REPO-01 | Phase 1 | Pending |
| REPO-02 | Phase 1 | Pending |
| REPO-03 | Phase 1 | Pending |
| REPO-04 | Phase 1 | Pending |
| VIS-01 | Phase 1 | Pending |
| VIS-02 | Phase 1 | Pending |
| VIS-03 | Phase 1 | Pending |
| VIS-04 | Phase 1 | Pending |
| CLI-01 | Phase 1 | Pending |
| CLI-02 | Phase 1 | Pending |
| NOTE-01 | Phase 1 | Pending |
| NOTE-02 | Phase 1 | Pending |
| AUD-01 | Phase 2 | Pending |
| AUD-02 | Phase 2 | Pending |
| AUD-03 | Phase 2 | Pending |
| AUD-04 | Phase 2 | Pending |
| CLI-03 | Phase 2 | Pending |
| CLI-05 | Phase 2 | Pending |
| NOTE-03 | Phase 2 | Pending |
| NOTE-04 | Phase 2 | Pending |
| VID-01 | Phase 3 | Pending |
| VID-02 | Phase 3 | Pending |
| VID-03 | Phase 3 | Pending |
| VID-04 | Phase 3 | Pending |
| CLI-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0
- Coverage: 100%

**Phase Distribution:**
- Phase 1: 12 requirements (Foundation - Visual Atoms & Portfolio)
- Phase 2: 8 requirements (Audio Integration)
- Phase 3: 5 requirements (Video Capture & Distribution)

---
*Requirements defined: 2026-01-29*
*Last updated: 2026-01-29 after roadmap creation*
