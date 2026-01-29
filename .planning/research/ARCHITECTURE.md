# Architecture Research: Engines of Experience

## System Overview

The Engines of Experience ecosystem is a vertically-integrated creative coding and media publishing platform. It enables rapid creation of computational art, audio, and motion graphics (atoms), composition into richer pieces, web publication as browser toys, and distribution across multiple platforms—all managed through a CLI cockpit with LLM creative assistance.

**High-Level Data Flow:**
```
Idea (10-15 min burst)
  ↓
Atom Creation (TypeScript/p5.js/WebGL sketches)
  ↓
Composition (combine atoms into pieces)
  ↓
Web Runtime (browser-playable contraptions)
  ↓
Portfolio Site (showcase + embed)
  ↓
Publishing Pipeline (format → distribute → YouTube/TikTok/Reddit)
  ↓
CLI Cockpit (metrics, feedback, control)
  ↑
LLM Creative Console (pair-creation assistance)
```

**Core Architectural Principle:** Atomic Design meets Git-first workflow. Every creative output is version-controlled, modular, composable, and deployable independently.

---

## Components

### 1. Atom Workspace

**Purpose:** Where individual creative atoms are created—sketches, audio compositions, motion graphics, game mechanics.

**Architecture:**
- **Project Structure:** Git-based monorepo with atomic design hierarchy
  - `/atoms/sketches/` - p5.js/Canvas API sketches
  - `/atoms/audio/` - Web Audio API compositions
  - `/atoms/motion/` - Three.js/WebGL motion graphics
  - `/atoms/mechanics/` - Reusable game logic (TypeScript modules)
- **Tooling:**
  - Vite for instant dev server + HMR
  - TypeScript for type safety
  - p5.js for creative coding sketches
  - Three.js + React Three Fiber for 3D graphics
  - Web Audio API for audio synthesis
- **File Organization:**
  - Each atom = self-contained directory with `index.ts`, `README.md`, assets
  - Metadata in frontmatter: tags, duration, dependencies
  - Export as ES modules for composition

**Development Pattern:**
```
/atoms/
  sketches/
    particle-burst/
      index.ts          # Main sketch code
      config.json       # Parameters (size, colors, etc.)
      preview.png       # Thumbnail
      README.md         # Description, usage
  audio/
    ambient-drone/
      index.ts
      config.json
  motion/
    geometric-morph/
      index.ts
      config.json
```

**Key Design Decision:** Each atom is a standalone, runnable module with hot-reload support. Atoms export standardized interfaces (e.g., `init()`, `update()`, `draw()`, `cleanup()`).

---

### 2. Composition Layer

**Purpose:** Combine multiple atoms into richer, coordinated pieces (e.g., audio + visuals, multi-scene experiences).

**Architecture:**
- **Composition Files:** JSON/YAML manifests describing atom combinations
  ```json
  {
    "title": "Ocean Dreams",
    "atoms": [
      { "type": "sketch", "src": "atoms/sketches/wave-field" },
      { "type": "audio", "src": "atoms/audio/ambient-drone" }
    ],
    "timeline": [
      { "at": 0, "atom": 0, "action": "start" },
      { "at": 2, "atom": 1, "action": "fadeIn", "duration": 3 }
    ]
  }
  ```
- **Composition Engine:** Runtime that orchestrates atom lifecycle
  - Load atoms dynamically
  - Manage shared state/events between atoms
  - Timeline/sequencing for coordinated playback
- **Tooling:**
  - CLI command: `eoe compose create <name>`
  - Visual timeline editor (optional future enhancement)
  - Validation against atom schemas

**Composition Types:**
1. **Layered:** Visual atoms stack with blend modes
2. **Sequenced:** Atoms play in temporal order
3. **Reactive:** Atoms respond to shared parameters (e.g., audio volume drives visual intensity)

---

### 3. Web Runtime

**Purpose:** Execute atoms and compositions as browser-playable contraptions.

**Architecture:**
- **Hosting:** Static site generation + CDN
  - Vite builds each atom/composition to optimized JS bundle
  - Deploy to Vercel/Netlify/Cloudflare Pages
  - Each contraption gets unique URL: `eoe.site/play/<atom-id>`
- **Embedding:**
  - `<iframe>` embeds for portfolio/external sites
  - Query params for configuration: `?autoplay=true&loop=false`
  - Responsive canvas that adapts to container
- **Sharing:**
  - Open Graph meta tags for rich social previews
  - Direct link sharing with preview thumbnails
  - Optional: QR codes for mobile access

**Performance Considerations:**
- Code splitting: load only required atoms
- Asset optimization: compress textures, use WebP/AVIF
- Target: 60 FPS, <100 MB memory (per search findings on Three.js performance)

**Playback Controls:**
- Standard media controls (play/pause/restart)
- Full-screen mode
- Parameter tweaking UI (sliders for colors, speeds, etc.)

---

### 4. Portfolio Site

**Purpose:** Showcase all creative work with embeds, descriptions, and navigation.

**Architecture:**
- **Tech Stack:** Static site generator (Astro/11ty) or React-based (Next.js)
  - Markdown content for descriptions
  - Automatic gallery from atom metadata
  - Three.js background/interactive elements (optional)
- **Structure:**
  - Home: Featured pieces
  - Gallery: Grid of all contraptions with filters (tags, type, date)
  - Detail pages: Embed + description + metadata
  - About: Artist statement, tools used
- **CMS Approach:** Git-based
  - Metadata in frontmatter/JSON
  - No external CMS—filesystem is the database
  - Build-time generation from `/atoms/` directory

**Design Pattern:**
- Minimalist UI to emphasize creative work
- Fast loading (preload thumbnails, lazy-load embeds)
- Mobile-responsive grid

**Hosting:** Vercel (already in use) with automatic deploys on git push.

---

### 5. Publishing Pipeline

**Purpose:** Transform creative work from web contraptions to platform-specific formats and distribute.

**Architecture:**
- **Multi-Platform Strategy:**
  - **YouTube:** Record canvas to video (1080p/4K), add audio, upload via API
  - **TikTok/Instagram:** Vertical crop (9:16), 15-60s edits, automated posting
  - **Reddit:** Embed links + preview GIFs, cross-post to relevant subreddits
  - **Twitter/X:** Short clips with preview media

**Pipeline Stages:**
1. **Capture:** Headless browser (Playwright) records canvas output
   - Puppeteer/Playwright runs contraption, captures frames
   - FFmpeg encodes to video (H.264/VP9)
2. **Format:** Platform-specific transformations
   - Aspect ratio conversion (16:9 → 9:16 for TikTok)
   - Duration trimming (e.g., TikTok max 3 min)
   - Watermark overlay (optional branding)
3. **Metadata:** Auto-generate descriptions, tags, thumbnails
   - LLM generates captions from atom metadata
   - Extract key frame for thumbnail
   - Platform-specific hashtags (#generativeart, #creativecoding)
4. **Distribution:** API-based upload
   - YouTube Data API v3
   - TikTok API (requires business account)
   - Reddit API (PRAW for Python, Snoowrap for Node.js)
   - Scheduling: queue posts for optimal times

**Automation Tools:**
- n8n workflows for multi-platform publishing (per search findings)
- Repurpose.io-style approach: one source, many formats
- CLI commands: `eoe publish <atom-id> --platforms youtube,tiktok`

**Video Encoding Stack:**
- Playwright for capture
- FFmpeg for encoding
- Cloudinary/Mux for cloud transcoding (optional)

---

### 6. CLI Cockpit

**Purpose:** Terminal-based control center for publishing, metrics, feedback, and management.

**Architecture:**
- **Tech Stack:**
  - Node.js (TypeScript)
  - oclif for CLI framework (command structure, plugins)
  - Ink (React-based TUI) or blessed for terminal UI
  - Ratatui (Rust) if performance becomes critical
- **Core Commands:**
  ```bash
  eoe create atom <type> <name>      # New sketch/audio/motion
  eoe compose new <name>             # New composition
  eoe dev <atom-id>                  # Live dev server
  eoe build <atom-id>                # Production build
  eoe publish <atom-id> [--platforms] # Publish to platforms
  eoe status                         # Dashboard view
  eoe metrics <atom-id>              # Fetch analytics
  eoe sync                           # Multi-device sync
  ```

**Dashboard Interface (TUI):**
- Live metrics display (views, likes, comments per platform)
- Recent uploads with status (processing/live/failed)
- Feedback aggregation (comments from YouTube/Reddit)
- Publishing queue with scheduled posts
- System health (disk space, build status, sync status)

**Data Sources:**
- YouTube Data API for views/engagement
- Reddit API for post metrics
- TikTok Business API for analytics
- Local SQLite database for cache/history

**Visual Design:**
- Split panes: top = metrics, bottom = logs
- Color-coded status (green = live, yellow = processing, red = failed)
- Keyboard shortcuts (vim-style navigation)

**Integration Pattern:**
- CLI wraps all ecosystem functionality
- Each command delegates to specialized modules
- Logs to `/logs/` directory for debugging

---

### 7. Sync Layer

**Purpose:** Keep work synchronized across desktop, laptop, mobile, and Linux server.

**Architecture:**
- **Primary Tool:** Syncthing (decentralized P2P sync)
  - Works on desktop, laptop, server, Android
  - Real-time bi-directional sync
  - Encrypted transfers (TLS with perfect forward secrecy)
  - No central server—direct device-to-device mesh
- **Sync Strategy:**
  - **Full Repo Sync:** `/atoms/`, `/compositions/`, `/config/` (code + assets)
  - **Selective Sync:** Mobile syncs only metadata + small previews (not full assets)
  - **Git Integration:** Syncthing handles file sync; Git handles version control
- **Conflict Resolution:**
  - Syncthing creates `.sync-conflict` files
  - CLI command: `eoe resolve-conflicts` to review and merge
- **Mobile Workflow:**
  - Android: Syncthing app + Termux (CLI access)
  - View previews, trigger builds/publishes via SSH to server
  - No heavy editing on mobile—just review and control

**Alternative/Complementary Tools:**
- rsync for one-way server backups
- Git for code versioning (separate layer from file sync)
- Lsyncd for near-real-time server mirroring

**Server Role:**
- Central always-on sync hub
- Builds + publishes can run headless
- Hosts portfolio site
- Stores full history + large assets

---

### 8. LLM Integration

**Purpose:** AI-powered creative assistance for ideation, code generation, and iteration.

**Architecture:**
- **Two-Tier Strategy:**
  1. **Claude Code (Structural):** For architecture, refactoring, testing, documentation
  2. **Lightweight Console (Creative):** For sketch generation, shader code, composition ideas
     - Aider for terminal-based pair programming
     - Custom prompts for generative art (e.g., "create a particle system with gravity")
- **Integration Points:**
  - **CLI Commands:**
    ```bash
    eoe ai sketch "flowing organic shapes"  # Generate p5.js sketch
    eoe ai compose "combine wave and drone" # Generate composition manifest
    eoe ai caption <atom-id>                # Generate platform captions
    ```
  - **Workflow:**
    1. User describes intent in natural language
    2. LLM generates code/config
    3. Code inserted into atom template
    4. User iterates with quick feedback loops (hot-reload)

**Creative Coding Use Cases:**
- **GLSL Shader Generation:** AI Co-Artist approach (per research findings)
  - Novice users created 4.2 shaders with AI vs 0.6 without
  - Human sets aesthetic direction, AI fills technical details
- **Audio Synthesis:** Generate Web Audio API graphs from descriptions
- **Parameter Tuning:** LLM suggests color palettes, timing adjustments

**Best Practices (from research):**
- Human maintains oversight ("senior dev" model)
- Iterate in small loops—test immediately
- LLM excels at contained tasks, not full rewrites
- Validate libraries/APIs actually exist

**Model Selection:**
- Claude 3.7 Sonnet for best code quality (per Aider recommendations)
- GPT-4o for visual understanding (shader feedback)
- DeepSeek for cost-effective iterations

---

### 9. Streaming Infrastructure

**Purpose:** Live streaming creative sessions with guest participation, screen sharing, and recording.

**Architecture:**
- **Broadcasting Tool:** OBS Studio (open source, Linux-compatible)
  - Scene management: code editor, browser preview, camera
  - Overlays: chat, timers, current atom title
- **Protocol:** WebRTC via WHIP (WebRTC HTTP Ingestion Protocol)
  - OBS 30+ supports WHIP natively
  - Low latency (<100ms) for interactive sessions
  - E2E encryption option
- **Guest Participation:**
  - OBS.Ninja (now VDO.Ninja) for browser-based remote guests
    - Up to 10 guests recommended
    - Screen sharing, audio/video streams
    - No software install for guests
  - Alternative: Daily.co or Whereby API for structured guest rooms
- **Streaming Targets:**
  - Twitch (primary live platform)
  - YouTube Live (secondary + VOD archive)
  - Kick (backup/experimental)
- **Recording + VODs:**
  - OBS local recording (MKV for safety, remux to MP4)
  - Upload VODs to YouTube automatically
  - Clip highlights for TikTok/Twitter

**Workflow:**
1. Pre-stream: Prepare scene, test audio/video
2. Live: Create atom, explain process, interact with chat
3. Guest segment: Invite collaborator via VDO.Ninja link
4. Post-stream: Auto-upload VOD, extract clips, publish to platforms

**Server Setup:**
- Linux server runs OBS in headless mode (optional for automated streams)
- RTMP relay for multi-platform simulcast
- nginx-rtmp module for custom RTMP endpoint

**Integration with Ecosystem:**
- CLI command: `eoe stream start` (configure scenes, start OBS)
- Overlay shows current atom metadata from CLI
- Chat commands trigger builds/publishes (`!build particle-burst`)

---

## Data Flow

### Complete Lifecycle: Idea → Feedback

1. **Ideation (1-15 min)**
   - User describes idea: "Particle system with gravity and color fade"
   - LLM generates starter code in `/atoms/sketches/gravity-particles/`

2. **Creation (Desktop)**
   - `eoe dev gravity-particles` starts hot-reload server
   - User iterates on code, sees live updates
   - Commits to Git: `git commit -m "feat: add gravity particles"`

3. **Sync (Multi-Device)**
   - Syncthing propagates changes to laptop, server
   - Laptop can continue editing during commute (offline-first)
   - Conflicts resolved via `eoe resolve-conflicts`

4. **Composition (Desktop/Laptop)**
   - Combine particles with ambient audio
   - `eoe compose new ocean-dreams --atoms gravity-particles,ambient-drone`
   - Timeline defined in `ocean-dreams.json`

5. **Web Publication**
   - `eoe build ocean-dreams` → Vite bundles to static files
   - Auto-deploy to Vercel: `eoe.site/play/ocean-dreams`
   - Portfolio site auto-updates with new entry

6. **Platform Distribution**
   - `eoe publish ocean-dreams --platforms youtube,tiktok,reddit`
   - Pipeline captures 30s video, formats for each platform
   - YouTube: 16:9, 1080p, auto-generated title/description
   - TikTok: 9:16, 30s, trending hashtags
   - Reddit: Link post to `r/generative` with preview GIF

7. **Metrics + Feedback**
   - `eoe metrics ocean-dreams` shows dashboard
   - YouTube: 1.2K views, 45 likes, 8 comments
   - Reddit: 234 upvotes, 12 comments
   - CLI aggregates feedback: "Users love the color palette"

8. **Iteration**
   - User reads feedback, tweaks colors
   - Republish updated version
   - Cycle repeats

---

## Build Order

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Establish atom workspace and basic tooling.

1. **Atom Workspace Setup**
   - Define directory structure (`/atoms/sketches/`, `/atoms/audio/`, `/atoms/motion/`)
   - Create Vite template for sketches with p5.js integration
   - Build first sample atom (particle system) as proof of concept
   - **Dependencies:** None
   - **Output:** Working atom that runs in browser

2. **CLI Cockpit (Basic)**
   - Initialize oclif project with core commands: `create`, `dev`, `build`
   - Implement `eoe create atom` to scaffold new atoms from templates
   - Implement `eoe dev <atom-id>` to start Vite dev server
   - **Dependencies:** Atom workspace structure
   - **Output:** Terminal workflow for atom creation

3. **Git Workflow**
   - Establish commit conventions (conventional commits)
   - Set up `.gitignore` for `node_modules`, build artifacts
   - Document branching strategy (main + feature branches)
   - **Dependencies:** None
   - **Output:** Clean version control

**Milestone:** Can create and iterate on atoms locally.

---

### Phase 2: Web Runtime + Portfolio (Weeks 5-8)
**Goal:** Make atoms playable on the web and build a showcase.

4. **Web Runtime**
   - Create runtime loader that dynamically imports atoms
   - Build playback controls (play/pause/restart)
   - Add parameter UI (sliders, color pickers)
   - Optimize bundle size (code splitting, tree shaking)
   - **Dependencies:** Atom workspace (Phase 1)
   - **Output:** Browser contraptions with shareable URLs

5. **Portfolio Site**
   - Choose static site generator (Astro recommended for performance)
   - Auto-generate gallery from atom metadata
   - Build detail pages with embeds
   - Deploy to Vercel with auto-build on push
   - **Dependencies:** Web runtime (Phase 2)
   - **Output:** Live portfolio at custom domain

**Milestone:** Public-facing website with playable contraptions.

---

### Phase 3: Composition + Sync (Weeks 9-12)
**Goal:** Enable richer creative pieces and multi-device workflow.

6. **Composition Layer**
   - Define composition manifest schema (JSON)
   - Build composition engine (timeline, atom orchestration)
   - Extend CLI: `eoe compose new`, `eoe compose build`
   - Create sample composition (visuals + audio)
   - **Dependencies:** Atom workspace, web runtime
   - **Output:** Multi-atom experiences

7. **Sync Layer**
   - Install Syncthing on desktop, laptop, server
   - Configure selective sync (full on desktop/server, metadata-only on mobile)
   - Build `eoe sync` command to show sync status
   - Document conflict resolution workflow
   - **Dependencies:** None (parallel to other work)
   - **Output:** Seamless cross-device workflow

**Milestone:** Can compose complex pieces and work from any device.

---

### Phase 4: Publishing Pipeline (Weeks 13-16)
**Goal:** Automate distribution to platforms.

8. **Video Capture + Encoding**
   - Playwright script to record canvas to video
   - FFmpeg encoding profiles (YouTube 1080p, TikTok 9:16)
   - Thumbnail extraction
   - **Dependencies:** Web runtime
   - **Output:** Platform-ready videos from atoms

9. **Platform APIs**
   - Integrate YouTube Data API (upload, metadata)
   - Integrate Reddit API (submit links)
   - TikTok API (requires business account—defer or manual)
   - **Dependencies:** Video capture
   - **Output:** Automated posting

10. **CLI Publishing**
    - `eoe publish <atom-id> --platforms` command
    - Queue management (schedule posts)
    - Status tracking (processing/live/failed)
    - **Dependencies:** Platform APIs
    - **Output:** One-command publishing

**Milestone:** Push-button distribution to YouTube, Reddit.

---

### Phase 5: LLM + Streaming (Weeks 17-20)
**Goal:** Creative AI assistance and live engagement.

11. **LLM Integration**
    - Install Aider for terminal pair programming
    - Create custom prompts for sketch generation
    - Build `eoe ai sketch` command (calls Aider with template)
    - Build `eoe ai caption` for platform descriptions
    - **Dependencies:** Atom workspace
    - **Output:** AI-assisted creation workflow

12. **Streaming Infrastructure**
    - Configure OBS scenes (code, browser, camera)
    - Integrate VDO.Ninja for guest participation
    - Set up stream targets (Twitch, YouTube Live)
    - Build VOD upload automation
    - **Dependencies:** Web runtime (to show contraptions live)
    - **Output:** Live streaming setup

**Milestone:** Live creative sessions with AI assistance.

---

### Phase 6: Metrics + Refinement (Weeks 21-24)
**Goal:** Close the feedback loop and polish.

13. **Metrics Dashboard**
    - Fetch analytics from YouTube/Reddit APIs
    - Build TUI dashboard (Ink/blessed)
    - `eoe metrics` command with live view counts
    - Aggregate feedback (comments, upvotes)
    - **Dependencies:** Platform APIs
    - **Output:** Real-time metrics in terminal

14. **Refinement**
    - Performance optimization (bundle size, load times)
    - Mobile preview improvements
    - Documentation (user guide, API reference)
    - Community showcase (invite others to contribute atoms)
    - **Dependencies:** All prior phases
    - **Output:** Production-ready ecosystem

**Milestone:** Fully operational end-to-end system.

---

## Integration Points

### Inter-Component APIs

1. **Atom Interface (Standard Contract)**
   - All atoms export: `{ init, update, draw, cleanup, config }`
   - `config` defines parameters (colors, speeds, etc.)
   - Runtime calls lifecycle methods

2. **Composition Manifest Schema**
   - JSON format with atom references, timeline, events
   - Validated against JSON Schema
   - Consumed by composition engine

3. **CLI ↔ Modules**
   - CLI delegates to specialized modules:
     - `@eoe/build` - Vite builds
     - `@eoe/publish` - Platform distribution
     - `@eoe/metrics` - Analytics fetching
   - Shared config in `~/.eoerc` (JSON)

4. **Web Runtime ↔ Portfolio**
   - Runtime hosted at `eoe.site/play/`
   - Portfolio embeds via `<iframe src="eoe.site/play/<id>">`
   - Query params for config: `?autoplay=true`

5. **Publishing Pipeline ↔ CLI**
   - CLI triggers pipeline via `eoe publish`
   - Pipeline writes status to SQLite DB
   - CLI reads DB for `eoe status` dashboard

6. **Sync ↔ Git**
   - Syncthing syncs files
   - Git manages versions (separate concern)
   - Workflow: sync files, commit changes, push to remote

7. **LLM ↔ CLI**
   - CLI calls Aider with templates
   - Aider generates code, CLI writes to `/atoms/`
   - User iterates via `eoe dev`

### Shared State

- **SQLite Database (`~/.eoe/state.db`):**
  - Publishing queue and history
  - Metrics cache (reduce API calls)
  - Sync conflict tracking
- **File-Based Config:**
  - `~/.eoerc` - User preferences (API keys, default platforms)
  - `.eoe/atom.json` - Per-atom metadata (title, tags, created date)

### External APIs

- **YouTube Data API v3:** Upload, metadata, analytics
- **Reddit API:** Submit links, fetch post metrics
- **TikTok API:** Upload videos (requires business account)
- **Anthropic API:** Claude for LLM assistance
- **OpenAI API:** GPT-4 for visual feedback (optional)

---

## Technology Stack Summary

| Component | Technologies |
|-----------|-------------|
| Atom Creation | TypeScript, p5.js, Three.js, Web Audio API, Vite |
| Composition | JSON manifests, custom runtime engine |
| Web Runtime | Vite, Vercel, Canvas API, WebGL |
| Portfolio | Astro (or Next.js), Markdown, Vercel |
| Publishing | Playwright, FFmpeg, YouTube/Reddit APIs, n8n-style workflows |
| CLI Cockpit | Node.js, TypeScript, oclif, Ink/blessed, SQLite |
| Sync | Syncthing, rsync, Git |
| LLM | Aider, Claude API, GPT-4 API |
| Streaming | OBS Studio, WebRTC/WHIP, VDO.Ninja, Twitch/YouTube Live |
| Server | Linux (Ubuntu/Debian), nginx, systemd for services |

---

## Open Questions / Future Considerations

1. **Mobile Editing:** Full editing on mobile is complex—current approach is review + control only. Future: Progressive Web App with simplified editor?

2. **Monetization:** Not in scope yet, but possible: Patreon for supporters, NFT drops of select pieces, YouTube ad revenue.

3. **Collaboration:** Multi-user atoms? Git branches + merge process works, but real-time co-editing would require CRDT/OT.

4. **Asset Management:** Large textures/audio files could bloat repo. Future: Git LFS or separate asset CDN with references.

5. **Analytics Privacy:** Self-hosted analytics (Plausible/Umami) vs. platform APIs? Trade-off: control vs. completeness.

6. **TikTok API Access:** Requires business account verification—may need manual uploads initially.

---

## References

This architecture research synthesized findings from:

**Creative Coding Ecosystems:**
- [p5.js](https://p5js.org/)
- [GitHub - processing/p5.js](https://github.com/processing/p5.js)
- [GitHub - terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding)
- [Processing and p5.js compared](https://timrodenbroeker.de/p5-comparison/)

**Media Publishing Pipelines:**
- [Fully automated AI video generation & multi-platform publishing | n8n workflow](https://n8n.io/workflows/3442-fully-automated-ai-video-generation-and-multi-platform-publishing/)
- [Automate content publishing to TikTok, YouTube, Instagram, Facebook via Blotato | n8n workflow](https://n8n.io/workflows/7187-automate-content-publishing-to-tiktok-youtube-instagram-facebook-via-blotato/)
- [Distribute Your TikTok Content Everywhere » Repurpose.io](https://repurpose.io/content-creators/)
- [TikTok System Design: Step-by-Step Guide](https://grokkingthesystemdesign.com/guides/tiktok-system-design/)

**Browser-Based Interactive Portfolios:**
- [Build a 3D Portfolio with Vite, React, Three.js and Strapi](https://strapi.io/blog/build-a-simple-3-d-portfolio-website-with-vite-react-three-js-and-strapi)
- [Create an interactive, 3D portfolio website! - DEV Community](https://dev.to/0xfloyd/create-an-interactive-3d-portfolio-website-that-stands-out-to-employers-47gc)
- [GitHub - theringsofsaturn/3D-art-gallery-threejs](https://github.com/theringsofsaturn/3D-art-gallery-threejs)

**Atomic Design Methodology:**
- [Atomic Design for Developers: Better Component Composition and Organization](https://benjaminwfox.com/blog/tech/atomic-design-for-developers)
- [Atomic Design for Developers: Project Structure](https://betterprogramming.pub/atomic-design-for-developers-part-1-b41e547a555c)
- [Atomic Design and Its Relevance in Frontend in 2025](https://dev.to/m_midas/atomic-design-and-its-relevance-in-frontend-in-2025-32e9)

**CLI Dashboards & TUIs:**
- [GitHub - rothgar/awesome-tuis](https://github.com/rothgar/awesome-tuis)
- [GitHub - chjj/blessed](https://github.com/chjj/blessed)
- [Building Terminal Interfaces with Node.js](https://blog.openreplay.com/building-terminal-interfaces-nodejs/)
- [ink vs blessed | Terminal User Interface Libraries Comparison](https://npm-compare.com/blessed,ink)

**Live Streaming Architecture:**
- [WebRTC cracks the WHIP on OBS - webrtcHacks](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/)
- [Using WebRTC in OBS for Remote Live Production | Dolby OptiView](https://optiview.dolby.com/resources/blog/streaming/using-webrtc-in-obs-for-remote-live-production/)
- [How to Add Remote Video Sources to Live Streams With OBS.Ninja and OBS](https://photography.tutsplus.com/articles/how-to-easily-add-a-remote-source-to-streaming-video-with-obs-and-obsninja--cms-35885)
- [WHIP Streaming Guide | OBS](https://obsproject.com/kb/whip-streaming-guide)

**Cross-Device Sync:**
- [Sync files across multiple devices with Syncthing | Opensource.com](https://opensource.com/article/20/1/sync-files-syncthing)
- [Syncthing](https://syncthing.net/)
- [Synchronize Files Between Multiple Systems With Syncthing :: IT'S FOSS](https://itsfoss.gitlab.io/post/synchronize-files-between-multiple-systems-with-syncthing/)
- [rsync - Wikipedia](https://en.wikipedia.org/wiki/Rsync)

**LLM Integration:**
- [My LLM coding workflow going into 2026 | by Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e)
- [AI Co-Artist: A LLM-Powered Framework for Interactive GLSL Shader Animation Evolution](https://arxiv.org/html/2512.08951v1)
- [Aider - AI Pair Programming in Your Terminal](https://aider.chat/)
- [GitHub - Aider-AI/aider](https://github.com/Aider-AI/aider)
- [Developers with AI assistants need to follow the pair programming model - Stack Overflow](https://stackoverflow.blog/2024/04/03/developers-with-ai-assistants-need-to-follow-the-pair-programming-model/)

---

## Conclusion

The Engines of Experience architecture is designed for velocity, modularity, and creative freedom. By treating every creative output as a versionable, composable atom, the system enables rapid iteration, multi-device workflows, and seamless distribution. The CLI-first approach keeps the creator in control, while LLM integration accelerates the creative process without sacrificing artistic intent.

**Critical Success Factors:**
1. **Atomic modularity:** Every piece is reusable and composable
2. **Git-first workflow:** All creative work is version-controlled
3. **CLI cockpit:** Terminal-based control keeps workflow fast
4. **Multi-device sync:** Work from anywhere without friction
5. **Automated publishing:** One command to distribute everywhere
6. **LLM augmentation:** AI assists but doesn't replace creative judgment

**Next Steps:**
- Use this document to inform roadmap phase structure
- Prioritize Phase 1 (Foundation) to establish core workflow
- Iterate on each component with short feedback loops
- Maintain architectural flexibility—adapt as creative needs evolve
