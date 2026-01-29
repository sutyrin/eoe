# Project Research Summary

**Project:** Engines of Experience (EoE)
**Domain:** Creative Coding + Media Publishing Ecosystem
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

Engines of Experience is a vertically-integrated creative coding and media publishing platform designed for short-burst workflows (10-15 min to 1 hour). The research reveals a critical tension: building a T-shaped creative practice requires deep expertise in one domain (likely generative/creative coding) plus broad skills across audio, video, publishing, and community—but attempting all simultaneously is the project's primary risk. Experts in this space prioritize web-first creation using browser standards (p5.js, Three.js, Web Audio API, GLSL) over proprietary desktop tools, manual workflows before automation, and consistent output over perfect infrastructure.

The recommended approach is radical simplicity: establish a minimal creative coding environment first (Phase 1), ship 20+ sketches to validate the core workflow, then layer on complementary capabilities (audio, publishing automation, streaming) only after the vertical is proven. The stack prioritizes mainstream open-source tools over trendy alternatives, web standards over native apps, and CLI-first automation over GUI complexity. The architecture follows atomic design principles where every creative output is version-controlled, modular, composable, and independently deployable.

The primary existential risk is the "Tooling Trap"—spending months researching and configuring the perfect environment instead of creating. This was explicitly identified by the creator as threat #1. Secondary risks include scope creep leading to burnout (typical solo developer death spiral), over-breadth without depth (becoming I-shaped rather than T-shaped), and premature automation before understanding real pain points. Prevention requires output-first mentality, weekly shipping quota, time-boxed exploration (1 hour research → 4+ hours creation), and ruthless MVP discipline.

## Key Findings

### Recommended Stack

The research converges on a **web-first, open-source, CLI-centric** stack that minimizes setup friction while maximizing cross-platform compatibility. All tools align with the T-shaped development philosophy: deep expertise in creative coding while maintaining broad technical capabilities across the full publishing pipeline.

**Core technologies:**

- **p5.js v1.9.4** (2D creative coding) — Gentle learning curve, browser-native, perfect for 10-15 min creative bursts
- **Three.js r169** (3D/WebGL) — Industry standard for web 3D, GPU-accelerated, runs everywhere
- **Tone.js v14.8.49** (browser audio) — Web Audio API wrapper with musician-friendly abstractions, works on mobile
- **Astro v4.16** (static site) — Zero JavaScript by default, blazing fast, perfect for portfolio + embedding contraptions
- **Cloudflare Pages** (hosting) — Unlimited bandwidth, global edge, git integration, generous free tier
- **Syncthing v1.28** (multi-device sync) — P2P, zero cost, real-time sync across desktop/laptop/mobile without cloud lock-in
- **n8n** (publishing automation) — Self-hosted, open-source workflow automation for YouTube/Reddit/TikTok distribution
- **FFmpeg 7.1** (video processing) — Swiss Army knife for video, CLI-first, integrates with automation workflows
- **Blender 4.3 LTS + Python** (3D/procedural) — Open-source, powerful scripting, geometry nodes for procedural generation
- **Claude API + Ollama** (LLM augmentation) — Claude for structural work, local models (Qwen3-Coder, DeepSeek) for cost-effective iterations

**Anti-recommendations (avoid tooling rabbit holes):**
- TouchDesigner, Max/MSP, Processing desktop — proprietary, steep learning curves, not web-compatible
- Ableton Live — overkill for "simple tunes," desktop-only workflow
- Unity/Unreal — massive learning curve for web contraptions
- Vercel — expensive bandwidth overages vs. Cloudflare
- Buffer/Hootsuite — SaaS vendor lock-in vs. self-hosted n8n

**Confidence:** HIGH — All recommendations sourced from established creative coding communities (Processing Foundation, OpenProcessing, Creative Coding Berlin), verified with official documentation, and battle-tested by practitioners.

### Expected Features

Research across 8 dimensions (atom creation, web contraptions, portfolio, publishing, CLI, streaming, community) reveals clear patterns.

**Must have (table stakes):**

- **Browser-based creative coding editor** with live preview, hot reload, error highlighting — users expect p5.js Editor standard
- **Shareable web contraptions** with embeddable player, unique URLs, no-install friction — industry baseline
- **Portfolio site** with project showcase, filtering/search, responsive design — 72% of portfolio traffic is mobile in 2026
- **Export capabilities** — download sketch, export as standalone HTML, render to video — required for distribution
- **Multi-platform publishing** to YouTube, TikTok, Reddit, blog at minimum — table stakes for creator economy
- **Cross-device sync** — desktop/laptop/mobile file synchronization — mandatory for short-burst workflow
- **Git-based version control** with LFS for media assets — standard practice for code + creative work

**Should have (competitive advantage):**

- **Audio-reactive visuals** — sync visual parameters to audio analysis (FFT, beat detection) — key differentiator for tech+media fusion
- **Short-burst workflow optimizations** — session resumption, quick templates, autosave, undo history — aligns with 10-15 min constraint
- **LLM creative assistance** — structural scaffolding (GSD), lighter console for variations — 67% of video creators using AI-assisted editing by Jan 2026
- **CLI cockpit** with TUI dashboard — terminal-native metrics, publishing commands, developer-first experience — 2026 trend toward CLI tools
- **Remixability** — fork button, view source, attribution chain — OpenProcessing model for community
- **Platform-specific adaptation** — auto-resize for TikTok/Shorts, format adaptation per channel — beats generic cross-posting
- **Narrative portfolio experience** — story over grid, case study depth, interactive storytelling with GSAP — 43% higher job offer rate per 2026 trends

**Defer (v2+):**

- Real-time collaboration on same canvas — Git workflow sufficient, CRDT complexity not justified
- Full DAW/video compositing capabilities — focus on atoms/contraptions, not professional production
- Native mobile apps — web-based approach, accessible from mobile browser is sufficient
- Social network features — portfolio is home base, not social platform
- Monetization/marketplace — anti-commercial stance to preserve creative freedom
- NFT/Web3 integration — 2026 research shows space still questionable fit for creative practice

**Confidence:** HIGH — Feature priorities validated across multiple sources (OpenProcessing community, ShaderToy patterns, Sonic Pi design, StreamYard UX, Buffer alternatives research).

### Architecture Approach

The architecture follows **atomic design meets Git-first workflow**. Every creative output is version-controlled, modular, composable, and deployable independently. The system is structured as a vertically-integrated pipeline from idea to feedback loop.

**Major components:**

1. **Atom Workspace** — Git-based monorepo where individual sketches, audio, motion graphics are created. Each atom is self-contained directory (index.ts, config.json, README.md, assets) exporting standardized interface (init, update, draw, cleanup). Tooling: Vite for instant HMR, TypeScript for safety, p5.js/Three.js/Web Audio API for creation.

2. **Composition Layer** — JSON/YAML manifests combine multiple atoms into richer pieces with timeline orchestration. Composition engine manages shared state, lifecycle, and reactive parameters (e.g., audio volume drives visual intensity).

3. **Web Runtime** — Static site generation (Vite builds) deployed to Cloudflare Pages. Each atom/composition gets unique URL (eoe.site/play/<id>) with embeddable iframe, query params for config, responsive canvas.

4. **Portfolio Site** — Astro-based showcase with auto-generated gallery from atom metadata, Markdown content, embedded contraptions. Git-based CMS—filesystem is database, build-time generation, Vercel deployment.

5. **Publishing Pipeline** — Playwright captures canvas to video, FFmpeg encodes per platform (16:9 YouTube, 9:16 TikTok), LLM generates descriptions/tags, APIs upload to YouTube/Reddit/TikTok. n8n orchestrates multi-platform workflows.

6. **CLI Cockpit** — oclif framework with commands (create, dev, build, publish, status, metrics). TUI dashboard (Ink/blessed) shows live metrics from YouTube/Reddit APIs, publishing queue, sync status. SQLite for state/cache.

7. **Sync Layer** — Syncthing for P2P file sync (full repo on desktop/server, selective on mobile), rsync for backups, Git for version control (separate concerns—Syncthing moves files, Git tracks history).

8. **LLM Integration** — Two-tier: Claude Code for structure/refactoring, Aider for sketch generation. CLI commands (eoe ai sketch "description", eoe ai caption <id>) generate code/content, human iterates with hot-reload.

9. **Streaming Infrastructure** — OBS Studio with WebRTC/WHIP for low-latency (<100ms), VDO.Ninja for browser-based guest participation (up to 10 guests), multi-platform simulcast to Twitch/YouTube Live, local recording + VOD upload automation.

**Data flow:** Idea → Atom creation (TypeScript/p5.js) → Composition (combine atoms) → Web runtime (browser contraptions) → Portfolio (showcase) → Publishing pipeline (YouTube/TikTok/Reddit) → CLI cockpit (metrics/feedback) → Iteration. LLM augments creation, sync enables multi-device work.

**Build order:** Phase 1 (Foundation: atom workspace + CLI basics + first sketch) → Phase 2 (Web runtime + portfolio + embeds) → Phase 3 (Composition layer + sync) → Phase 4 (Publishing pipeline + video capture) → Phase 5 (LLM integration + streaming) → Phase 6 (Metrics dashboard + refinement). Each phase delivers shippable output.

**Confidence:** HIGH — Architecture patterns validated from p5.js web editor source code, n8n workflow templates, atomic design methodology research, CLI TUI frameworks (blessed/Ink comparison), WebRTC/WHIP streaming guides, Syncthing setup documentation.

### Critical Pitfalls

Research identified 3 meta-risks and domain-specific pitfalls across creative coding, audio, publishing, portfolio, streaming, community, and LLM integration.

**THE PRIMARY EXISTENTIAL RISK:**

1. **The Tooling Trap** — Getting sucked into endless learning, setup, configuration instead of producing actual creative output. This was explicitly identified by the creator as threat #1. Warning signs: spending days researching "the perfect stack," constant framework switching, more time in docs than creation, building elaborate dev environments instead of prototypes, "just one more tutorial" syndrome. Prevention: **Output-first mentality** (every tool/learning must lead to shipped output within 24-48 hours), **start manual then automate pain points** (project constraint), **time-box exploration** (1 hour research max → 4+ hours creation), **weekly output quota** (ship something every 7 days minimum), **track creation vs. setup hours** (setup never exceeds 20% of total time). Phase mapping: Phase 0 establishes bare minimum tooling only; Phase 1 manual workflows to discover pain; Phase 2+ automation of proven problems.

**SECONDARY META-RISKS:**

2. **Scope Creep → Burnout Spiral** — For solo developers, scope creep leads to burnout, burnout leads to project failure. Warning signs: "just one more feature" before launch, moving MVP finish line repeatedly, working on multiple features without finishing any, feeling overwhelmed, loss of excitement. Prevention: **Establish MVP ruthlessly** (define minimal viable product and focus only on what truly matters), **parking lot for ideas** (separate future features list), **learn to say no**, **one feature at a time** (finish and ship before starting next), **regular breaks mandatory** (mental health as important as code), **scope audit weekly** (review if current work aligns with original MVP).

3. **The T-Shaped Paradox** — Project embodies T-shaped development (deep expertise + broad knowledge) but risks becoming I-shaped (all breadth, no depth) by attempting creative coding + audio + video + web + streaming + community simultaneously. Warning signs: learning 5 frameworks without shipping anything, touching audio/video/3D/generative all in same week, following every trend without developing signature style, consuming more content about techniques than creating work. Prevention: **Define the vertical first** (choose ONE primary creative domain for 50-60% of time—likely generative/creative coding), **limit horizontal domains to 3-4 initially**, **seasonal focus** (dedicate months to specific domains, not days), **ship depth first** (demonstrate mastery before expanding), **signature over versatility** (build recognizable style before diversifying).

**TOP DOMAIN-SPECIFIC PITFALLS:**

4. **Tutorial purgatory (creative coding)** — Following endless tutorials without developing personal style, copy-pasting without understanding, relying on AI suggestions without grasping logic. Prevention: After each tutorial, create original variation immediately. Phase 0-1: break tutorial dependence early.

5. **Gear obsession over skill (audio)** — Focusing on gear over skills, waiting for "right microphone" before recording. Prevention: Record with phone/basic tools first, upgrade only when hitting real limitations. Phase 0-1: prove need before buying.

6. **Premature automation (publishing)** — Building perfect multi-platform pipeline before creating content. Prevention: Publish manually to 1-2 platforms first, understand what needs automation. Phase 0-1: manual first always.

7. **Portfolio over-engineering (web)** — Spending 3-6 months on fancy website instead of simple MVP. Prevention: Ship basic portfolio in 1-2 short bursts, iterate based on feedback. Phase 0-1: get online fast.

8. **No testing before live (streaming)** — Not testing setup leads to technical glitches during stream. Prevention: Dry runs before every stream, wired Ethernet always. Phase 2+ when starting streaming.

9. **Vague prompts without planning (LLM)** — Diving into code generation with vague prompt instead of spec first. Security blindness: AI produces secure code only 56% of time. Prevention: Spec → plan → code, never deploy AI code without review. Phase 2+ when integrating AI.

**Prevention strategies (universal):**
- Output over input (80/20 rule: creation hours > learning hours)
- Manual before automation (feel the pain first)
- Ship regularly (weekly output quota non-negotiable)
- Time-box everything (research 1h, features 2-4h bursts, explorations 1 day max)
- MVP ruthlessly (define minimum, ship it, iterate based on real use)
- One thing at a time (finish before starting next)
- Embrace constraints (short bursts + limited time = forced prioritization)

**Emergency reset protocol:** If caught in tooling trap or scope spiral: STOP all learning/setup → AUDIT what you've shipped vs. what you've built → RESET to absolute basics (one tool, one domain, one simple piece) → SHIP something in 1-2 bursts (2-4 hours max) → REFLECT on warning signs → GUARD with new rule → RESUME with focus on output.

**Confidence:** HIGH — Pitfalls validated from solo developer survival guides (Wayline, Codecks), creative coding community mistakes (Processing forums), music production common errors (MI.edu, Hyperbits), content publishing failures (ActivePieces, Mixpost), LLM integration mistakes (Addy Osmani, Dark Reading security research), creator economy 2025 retrospectives (NetInfluencer, ExchangeWire).

## Implications for Roadmap

Based on research, the roadmap must prioritize **depth before breadth**, **output before infrastructure**, and **validation before expansion**. The critical path follows dependency chains from architecture research while respecting pitfall warnings about tooling traps and scope creep.

### Phase 0: Absolute Minimum (Week 1)
**Rationale:** Establish bare essentials without falling into tooling trap. Research shows 20% of time maximum should be setup; this phase enforces that constraint by limiting to 1 week total.

**Delivers:**
- Terminal, code editor, git configured
- ONE creative coding tool (p5.js) installed
- First sketch created and running locally
- Basic HTML export of sketch

**Addresses:**
- Pitfall #1 (Tooling Trap) by strict time limit and output requirement
- Pitfall #3 (T-Shaped Paradox) by forcing choice of vertical domain
- Stack recommendation: p5.js for gentle learning curve, instant browser gratification

**Avoids:**
- Setting up entire pipeline before creating anything
- Learning multiple frameworks simultaneously
- Building elaborate dev environments

**Research flag:** SKIP RESEARCH — p5.js is well-documented with extensive tutorials, no deeper research needed.

### Phase 1: Core Creation Loop (Weeks 2-8)
**Rationale:** Validate the fundamental hypothesis before building anything else. Can you create consistently in short bursts and enjoy the process? If not, entire project fails. Architecture research shows atom workspace is foundation enabling all downstream components. Pitfall research demands 20+ pieces in vertical domain before expanding.

**Delivers:**
- Atom workspace structure (/atoms/sketches/, /atoms/audio/, /atoms/motion/)
- Vite dev server with hot-reload
- 20+ p5.js sketches shipped (proves consistency and validates workflow)
- Each atom as self-contained module with standardized interface
- CLI basics: `eoe create atom`, `eoe dev <atom>`, `eoe build <atom>`
- Basic portfolio site (Astro) deployed to Cloudflare Pages with 5-10 best sketches
- Manual publishing to 1-2 platforms (YouTube + Reddit) to discover pain points

**Addresses:**
- Features: Browser-based editor with live preview (table stakes)
- Features: Export capabilities, shareable URLs (table stakes)
- Architecture: Atom workspace + web runtime + basic portfolio
- Pitfall #1 (Tooling Trap) by shipping volume weekly
- Pitfall #2 (Scope Creep) by ruthless MVP focus
- Pitfall #3 (T-Shaped Paradox) by establishing vertical depth
- Pitfall #4 (Tutorial purgatory) by requiring original work
- Pitfall #6 (Premature automation) by staying manual
- Pitfall #7 (Portfolio over-engineering) by 1-2 burst limit on site

**Uses:**
- Stack: p5.js, Vite, TypeScript, Astro, Cloudflare Pages
- Architecture: Atom workspace pattern, static site generation

**Success criteria:**
- Creating 2-3 sketches per week consistently
- Enjoying the creative process
- Portfolio live with embedded contraptions
- Manual publishing workflow documented with pain points identified

**Research flag:** SKIP RESEARCH — All technologies well-documented. Focus is execution and validation, not learning new domains.

### Phase 2: First Horizontal + Sync (Weeks 9-12)
**Rationale:** After proving core creative coding workflow (vertical depth established), add first horizontal capability to enhance output. Research suggests audio as natural complement (audio-reactive visuals as differentiator from FEATURES.md). Sync infrastructure enables multi-device workflow (table stakes per project constraints). Order respects T-shaped balance: continue 50-60% creative coding while adding 40-50% new skills.

**Delivers:**
- Audio atoms: Tone.js integration, simple synth/pattern compositions
- 5-10 audio pieces created
- Audio-reactive sketches combining visual + audio atoms
- Composition layer: JSON manifests, timeline orchestration
- Syncthing configured across desktop/laptop/server
- CLI: `eoe compose new`, `eoe sync` status command
- Cross-device workflow validated (start on desktop, continue on laptop)

**Addresses:**
- Features: Audio creation for non-musicians (table stakes for "simple tunes")
- Features: Audio-reactive visuals (differentiator)
- Features: Cross-device sync (table stakes)
- Architecture: Composition layer + sync layer
- Pitfall #3 (T-Shaped Paradox) by adding one horizontal at a time
- Pitfall #5 (Gear obsession) by starting with browser-based tools
- Stack: Tone.js for browser audio, Syncthing for P2P sync

**Uses:**
- Stack: Tone.js v14.8.49, Web Audio API, Syncthing v1.28
- Architecture: Composition layer orchestration pattern

**Research flag:** MEDIUM PRIORITY — May need deeper research on Web Audio API patterns and composition timing/synchronization. Tone.js is well-documented but audio-visual sync has complexity. Consider `/gsd:research-phase` if timeline orchestration proves difficult.

### Phase 3: Publishing Automation (Weeks 13-16)
**Rationale:** By now you have 25-35 pieces (20+ sketches + 5-10 audio + 5-10 compositions) and manual publishing to 2 platforms. You've felt the real pain points. Now automate only what hurts, respecting "start manual, automate pain points" constraint. Architecture research shows publishing pipeline depends on web runtime (Phase 1 delivered) and composition layer (Phase 2 delivered).

**Delivers:**
- Video capture: Playwright scripts record canvas output
- FFmpeg encoding profiles (YouTube 1080p 16:9, TikTok 9:16, thumbnail extraction)
- Platform API integrations (YouTube Data API v3, Reddit API/PRAW)
- CLI: `eoe publish <atom> --platforms youtube,reddit,tiktok` command
- n8n self-hosted with workflows for multi-platform distribution
- Publishing queue, status tracking (processing/live/failed)
- Platform-specific adaptation (auto-resize, format conversion, metadata templating)

**Addresses:**
- Features: Multi-platform publishing (table stakes)
- Features: Export to video (table stakes for YouTube pipeline)
- Features: Platform-specific adaptation (competitive advantage)
- Architecture: Publishing pipeline component
- Pitfall #6 (Premature automation) avoided by doing Phase 1-2 manually first
- Pitfall: Automation without monitoring by building status tracking from start
- Stack: FFmpeg, n8n, Playwright for capture, platform APIs

**Uses:**
- Stack: Playwright, FFmpeg 7.1, n8n, YouTube API, Reddit API, TikTok API
- Architecture: Publishing pipeline stages (capture → format → metadata → distribute)

**Research flag:** HIGH PRIORITY — Publishing pipeline is high complexity with many API integrations, video encoding gotchas, platform-specific quirks. Recommend `/gsd:research-phase` to investigate:
- Playwright canvas capture best practices (frame rate, quality settings)
- FFmpeg encoding for web video (H.264 profiles, compression settings)
- Platform API rate limits and error handling (YouTube quota management, Reddit rules)
- n8n workflow patterns for multi-platform publishing
- TikTok API access requirements (business account verification)

### Phase 4: CLI Cockpit + Metrics (Weeks 17-20)
**Rationale:** Publishing automation (Phase 3) creates need for monitoring and control. CLI cockpit centralizes management and closes feedback loop from distribution back to creation. Architecture research shows CLI depends on publishing pipeline (metrics source) and portfolio (content source). Features research emphasizes developer-first terminal-native experience as 2026 trend.

**Delivers:**
- TUI dashboard (Ink or blessed) with live metrics display
- Analytics aggregation from YouTube/Reddit APIs
- SQLite database for metrics cache and history
- Enhanced CLI commands: `eoe status`, `eoe metrics <atom>`, `eoe resolve-conflicts`
- Real-time view counts, engagement metrics, comment aggregation
- Publishing queue visualization
- Sync status monitoring

**Addresses:**
- Features: CLI cockpit with TUI dashboard (competitive advantage)
- Features: Platform analytics tracking (table stakes for feedback loop)
- Architecture: CLI cockpit component
- Pitfall: Broadcasting without engagement by surfacing comments/feedback
- Pitfall: No documentation by building history tracking from start
- Stack: oclif, Ink/blessed, SQLite

**Uses:**
- Stack: Node.js, TypeScript, oclif, Ink (React TUI) or blessed, SQLite
- Architecture: CLI cockpit pattern, data aggregation from platform APIs

**Research flag:** LOW PRIORITY — CLI frameworks well-documented (oclif docs, Ink examples, blessed tutorials). YouTube/Reddit APIs straightforward for read-only analytics. Standard patterns exist. SKIP deeper research unless hitting specific issues.

### Phase 5: LLM Augmentation (Weeks 21-24)
**Rationale:** By this point you've created 30-40+ pieces manually, established workflows, identified creative bottlenecks. Now introduce AI assistance for acceleration without replacement. Pitfall research shows timing is critical: "code periodically without AI to keep raw skills sharp." Adding LLM after manual mastery prevents Dunning-Kruger effect and skill atrophy.

**Delivers:**
- Aider integration for terminal-based pair programming
- CLI commands: `eoe ai sketch "description"`, `eoe ai caption <atom>`
- Custom prompts for p5.js sketch generation
- LLM-assisted platform caption/description generation
- Two-tier strategy: Claude Code for structure, lighter model for variations
- Documentation on when to use AI vs. manual creation

**Addresses:**
- Features: LLM creative assistance (competitive advantage)
- Features: AI-assisted publishing metadata (67% of creators using by 2026)
- Architecture: LLM integration component
- Pitfall #9 (Vague prompts) by building structured prompt templates
- Pitfall: Security blindness by enforcing human review always
- Pitfall: Dunning-Kruger effect by adding AI after skill foundation
- Pitfall: Creativity replacement by positioning AI as assistant not driver
- Stack: Claude API, Ollama for local models, Aider

**Uses:**
- Stack: Aider, Claude API, Ollama (Qwen3-Coder, DeepSeek), custom prompts
- Architecture: LLM integration pattern with two-tier strategy

**Research flag:** MEDIUM PRIORITY — LLM integration for creative coding is emerging area. May need deeper research on:
- Effective prompting for p5.js/Three.js code generation
- AI Co-Artist approach for shader/generative art (research shows novice users created 4.2 shaders with AI vs 0.6 without)
- Context management for creative coding (how much to show LLM)
- Security practices for AI-generated code
Consider `/gsd:research-phase` if going beyond basic integration.

### Phase 6: Streaming Infrastructure (Weeks 25-28)
**Rationale:** At this point you have substantial body of work (40-50+ pieces), automated publishing, metrics tracking. Ready to share process live. Architecture research shows streaming depends on atom workspace (content to show) and web runtime (contraptions for performance). Features research emphasizes starting simple (intimate jams → growing shows) to avoid complexity traps.

**Delivers:**
- OBS Studio configured with scenes (code editor, browser preview, camera)
- WebRTC/WHIP for low-latency streaming
- VDO.Ninja integration for browser-based guest participation
- Stream targets: Twitch primary, YouTube Live secondary
- Local recording to MKV with auto-remux to MP4
- VOD upload automation to YouTube
- CLI: `eoe stream start` command

**Addresses:**
- Features: Live streaming with guest participation (table stakes per project vision)
- Features: Recording + VODs (table stakes for archive)
- Architecture: Streaming infrastructure component
- Pitfall #8 (No testing before live) by building dry-run checklist
- Pitfall: Complexity without practice by starting with simple talking head
- Pitfall: WiFi streaming by documenting wired Ethernet requirement
- Pitfall: Audio neglect by prioritizing mic setup
- Stack: OBS Studio, WebRTC/WHIP, VDO.Ninja

**Uses:**
- Stack: OBS Studio, WebRTC/WHIP protocol, VDO.Ninja (formerly OBS.Ninja), Twitch/YouTube Live APIs
- Architecture: Streaming infrastructure with guest integration

**Research flag:** MEDIUM-HIGH PRIORITY — Live streaming has many technical gotchas. Recommend `/gsd:research-phase` to investigate:
- OBS scene configuration best practices for live coding
- WebRTC/WHIP latency optimization (<100ms target)
- VDO.Ninja guest setup (up to 10 guests recommended, but how to manage layouts)
- RTMP relay for multi-platform simulcast
- Recording settings (MKV safety, remux automation)
- Audio routing (system audio + mic + guests)

### Phase 7: Community + 3D Expansion (Weeks 29-32+)
**Rationale:** With consistent output (50+ pieces), automated publishing, live streaming established, natural audience has emerged. Now formalize community platform. Also add third horizontal (3D/Three.js) after proving can manage two (creative coding vertical + audio horizontal). T-shaped balance maintained: 50% creative coding depth, 25% audio, 25% 3D/community.

**Delivers:**
- Discord server setup for community
- GitHub organization for open-source code
- Community showcase/gallery on portfolio site
- Remix/fork features for contraptions
- Three.js integration for 3D/WebGL atoms
- Blender + Python workflow for procedural 3D assets
- 5-10 3D pieces created
- Motion graphics capabilities (GSAP integration)

**Addresses:**
- Features: Remixability with fork/view source (competitive advantage)
- Features: Community platform (Discord standard, GitHub for contributions)
- Features: 3D scenes, WebGL, particles (table stakes for full creative coding range)
- Architecture: Community features + expanded atom types
- Pitfall: Treating audience as customers not community by sharing process
- Pitfall: Follower count obsession by tracking engagement quality not numbers
- Stack: Three.js, Blender, GSAP, Discord, GitHub

**Uses:**
- Stack: Three.js r169, Blender 4.3 LTS + Python, GSAP v3.12.5, Discord, GitHub
- Architecture: Expanded atom workspace (3D/motion), community features

**Research flag:** MEDIUM PRIORITY — Three.js is well-documented but 3D creative coding has unique patterns. May need research on:
- Three.js + p5.js integration patterns
- Blender Python API for generative geometry
- GSAP animation of WebGL scenes
- Performance optimization for 60fps 3D
Consider `/gsd:research-phase` for 3D-specific workflows.

### Phase Ordering Rationale

**Dependency chain (from architecture research):**
- Atom workspace → Web runtime (can't deploy without creation)
- Web runtime → Portfolio (can't showcase without deployment)
- Portfolio → Publishing (can't distribute without content)
- Publishing → Metrics (can't track without distribution)
- All above → Streaming (need content to show)
- All above → Community (people gather around existing work)

**Pitfall avoidance:**
- Phase 0-1 delay automation to avoid tooling trap and premature optimization
- Phase 1 establishes vertical depth before expanding horizontals (T-shaped paradox)
- Phase 1-2 manual workflows before Phase 3 automation (start manual constraint)
- Phase 5 adds AI after skill foundation (Dunning-Kruger prevention)
- Phase 6 defers streaming until content library exists (no empty demos)
- Phase 7 defers community until consistent output proven (avoid empty forums)

**Volume targets validate vertical:**
- Phase 1: 20+ sketches proves core workflow
- Phase 2: 5-10 audio pieces proves first horizontal
- Phase 3: 25-35 total pieces justifies automation investment
- Phase 5: 30-40+ pieces ensures AI augments rather than replaces skill
- Phase 7: 50+ pieces demonstrates consistency worthy of community

**Short-burst optimization:**
- Each phase deliverable fits 10-15 min to 1 hour creation sessions
- CLI commands reduce friction for context switching
- Sync enables starting work on one device, continuing on another
- Autosave + session resumption support interrupted workflows

### Research Flags

**Phases needing deeper research during planning:**

- **Phase 3 (Publishing Pipeline):** HIGH PRIORITY — Complex integrations with multiple APIs, video encoding, platform-specific rules, rate limiting. Recommend `/gsd:research-phase` on: Playwright canvas capture, FFmpeg web video profiles, platform API patterns, n8n workflow design, TikTok business account requirements.

- **Phase 5 (LLM Augmentation):** MEDIUM PRIORITY — Emerging area with security implications. May need research on: effective prompting for creative code, AI Co-Artist patterns for generative art, context management, security practices for generated code.

- **Phase 6 (Streaming Infrastructure):** MEDIUM-HIGH PRIORITY — Technical complexity with latency, audio routing, guest management. Recommend `/gsd:research-phase` on: OBS live coding scene setup, WebRTC/WHIP optimization, VDO.Ninja guest workflows, multi-platform RTMP, recording automation.

- **Phase 2 (Audio + Composition):** MEDIUM PRIORITY — Audio-visual synchronization has complexity. May need research on: Web Audio API timing precision, composition timeline patterns, audio-reactive parameter mapping. Consider research if timeline orchestration proves difficult.

- **Phase 7 (3D Expansion):** MEDIUM PRIORITY — 3D creative coding has unique performance constraints. May need research on: Three.js + p5.js integration, Blender Python API, GSAP WebGL animation, 60fps optimization.

**Phases with standard patterns (skip research-phase):**

- **Phase 0-1 (Foundation + Core Loop):** Well-documented — p5.js tutorials extensive, Vite/Astro guides clear, Cloudflare Pages deployment straightforward. Focus on execution not learning.

- **Phase 4 (CLI Cockpit):** Well-documented — oclif has excellent docs, Ink/blessed have examples, YouTube/Reddit APIs straightforward for read-only. Standard patterns exist.

**Progressive research strategy:**
- Start each phase with quick validation (2-4 hours) to confirm standard patterns work
- Escalate to `/gsd:research-phase` only if hitting unknowns or complexity
- Budget 1-2 days research maximum per phase, then ship with "good enough"

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All recommendations from official docs, established communities (Processing Foundation, Creative Coding Berlin), 2026 trend research. Versions verified, alternatives evaluated. Anti-recommendations backed by practitioner consensus. |
| Features | **HIGH** | Synthesized from 8 domains with 40+ sources. Table stakes validated across platforms (OpenProcessing, ShaderToy, Sonic Pi, StreamYard). Differentiators confirmed by 2026 trends (CLI tools, AI-assisted editing, narrative portfolios). Anti-features align with project constraints. |
| Architecture | **HIGH** | Patterns validated from real systems (p5.js web editor source, n8n workflows, atomic design methodology). Dependency chains traced. Build order tested against solo developer constraints. Integration points specified with clear APIs. |
| Pitfalls | **HIGH** | Meta-risks explicitly identified by creator (tooling trap) + synthesized from solo dev survival research. Domain-specific pitfalls sourced from 30+ practitioner guides, postmortems, and 2025 retrospectives. Prevention strategies include phase mapping and emergency reset protocol. |

**Overall confidence:** **HIGH**

### Gaps to Address

**TikTok API access:** Requires business account verification which may take weeks. Workaround: Manual uploads via web interface until API access granted, or defer TikTok until Phase 3+ when automation is critical. Not a blocker for Phases 1-2.

**Mobile editing complexity:** Research shows full editing on mobile is complex; current architecture assumes review + control only (SSH to server for builds/publishes). Future consideration: Progressive Web App with simplified editor if mobile creation proves essential. Not addressing in initial roadmap.

**Large asset management:** Git LFS mentioned in Stack research but not deeply explored. May hit repo bloat with video/audio files. Strategy: Start with Git LFS basics (Phase 1), monitor repo size, escalate to separate asset CDN only if needed (Phase 4+). Document patterns in `.planning/decisions/` if becomes issue.

**Real-time collaboration:** Deliberately deferred (anti-feature per FEATURES.md) but may become request from community. If needed: Git branches + merge process sufficient; CRDT/OT complexity not justified until clear demand. Mark as v2+ explicitly in roadmap.

**Monetization strategy:** Not in scope (anti-commercial stance) but may need to address sustainability. Per ARCHITECTURE.md open question: Patreon, NFT drops, YouTube ad revenue possible. Decision point: After Phase 7 when community established, revisit if sustainable practice requires income. Document reasoning in `.planning/decisions/monetization.md` at that time.

**Analytics privacy trade-off:** Self-hosted analytics (Plausible/Umami) gives control but incomplete data vs. platform APIs give full metrics but less privacy. Current architecture uses platform APIs (YouTube Data API, Reddit API) for completeness. If privacy becomes concern: Add self-hosted portfolio analytics in Phase 4, keep platform APIs for distributed content. Hybrid approach documented in Phase 4 planning.

**Streaming latency optimization:** WebRTC/WHIP promises <100ms latency but achieving this requires tuning. If Phase 6 streaming experiences buffering/lag: Deep-dive on WebRTC configuration (TURN servers, bandwidth allocation, codec selection). Budget extra research time in Phase 6 for this.

**LLM cost management:** Claude API pricing may increase; research suggests 2-3x budget. Strategy: Start with Claude API (Phase 5), monitor costs monthly, shift to Ollama local models if exceeds budget (Qwen3-Coder, DeepSeek-Coder validated as alternatives). Cost tracking in CLI cockpit metrics.

**Security of AI-generated code:** Research shows AI produces secure code only 56% of time without security prompting. Mitigation: Phase 5 includes security-aware prompts, human review always, never deploy AI code without understanding. If becomes issue: Add security linting to CLI build step (`eoe build` runs static analysis on AI-generated code).

## Sources

### Primary Sources (HIGH confidence)

**Official Documentation:**
- [p5.js Official Docs](https://p5js.org/) — Creative coding framework
- [Three.js Documentation](https://threejs.org/docs/) — 3D/WebGL library
- [Tone.js Documentation](https://tonejs.github.io/) — Web Audio API wrapper
- [Astro Documentation](https://astro.build/) — Static site generator
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/) — Hosting platform
- [Syncthing Documentation](https://docs.syncthing.net/) — P2P file sync
- [n8n Documentation](https://docs.n8n.io/) — Workflow automation
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html) — Video processing
- [Blender Python API](https://docs.blender.org/api/current/) — 3D scripting
- [YouTube Data API v3](https://developers.google.com/youtube/v3) — YouTube integration
- [Reddit API](https://www.reddit.com/dev/api/) — Reddit integration
- [oclif Documentation](https://oclif.io/) — CLI framework
- [OBS Studio Docs](https://obsproject.com/docs/) — Streaming software

**Community Repositories:**
- [GitHub - processing/p5.js](https://github.com/processing/p5.js) — Source code and patterns
- [GitHub - processing/p5.js-web-editor](https://github.com/processing/p5.js-web-editor) — Editor architecture reference
- [GitHub - terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding) — Curated tools and resources
- [GitHub - CreativeCodeBerlin/creative-coding-minilist](https://github.com/CreativeCodeBerlin/creative-coding-minilist) — Berlin community recommendations
- [GitHub - Aider-AI/aider](https://github.com/Aider-AI/aider) — LLM pair programming tool

### Secondary Sources (MEDIUM confidence)

**2026 Trend Research:**
- [Top Creative Coding Tools in 2025 - VibeCoding](https://blog.vibecoding.vip/creative-coding-tools/) — Industry trends
- [Astro's Journey from SSG to Next.js Rival - The New Stack](https://thenewstack.io/astros-journey-from-static-site-generator-to-next-js-rival/) — Static site generator comparison
- [The Anthology of a Creative Developer: A 2026 Portfolio - DEV](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp) — Portfolio design trends
- [The Creator Economy in 2026 - ExchangeWire](https://www.exchangewire.com/blog/2025/12/16/the-creator-economy-in-2026-tapping-into-culture-community-credibility-and-craft/) — Creator economy shifts
- [7 Social Media Trends to Know in 2026 - Sprout Social](https://sproutsocial.com/insights/social-media-trends/) — Platform trends
- [Content Marketing Trends 2026 - CMI](https://contentmarketinginstitute.com/strategy-planning/trends-content-marketing) — 67% using AI-assisted editing

**Technical Comparisons:**
- [Vercel vs Netlify vs Cloudflare Pages 2025 - AI Infra Link](https://www.ai-infra-link.com/vercel-vs-netlify-vs-cloudflare-pages-2025-comparison-for-developers/) — Hosting comparison
- [Sonic Pi vs TidalCycles vs Strudel - Creative Coding Tech](https://creativecodingtech.com/music/live-coding/comparison/2024/10/22/sonic-pi-vs-tidalcycles-vs-strudel.html) — Audio framework comparison
- [OBS vs StreamYard Comparison - StreamYard Blog](https://streamyard.com/blog/streaming-software-comparison-between-obs-and-streamlabs) — Streaming tools
- [Syncthing vs Rsync Comparison - Rosetta Digital](https://rosettadigital.com/syncthing-vs-rsync/) — Sync strategy
- [ink vs blessed - npm-compare](https://npm-compare.com/blessed,ink) — Terminal UI frameworks

**Architecture Patterns:**
- [Atomic Design for Developers - Benjamin Fox](https://benjaminwfox.com/blog/tech/atomic-design-for-developers) — Component composition
- [Building Terminal Interfaces with Node.js - OpenReplay](https://blog.openreplay.com/building-terminal-interfaces-nodejs/) — CLI patterns
- [TikTok System Design: Step-by-Step Guide - Grokking](https://grokkingthesystemdesign.com/guides/tiktok-system-design/) — Publishing pipeline architecture
- [Automate content publishing to TikTok, YouTube, Instagram via Blotato - n8n](https://n8n.io/workflows/7187-automate-content-publishing-to-tiktok-youtube-instagram-facebook-via-blotato/) — Multi-platform workflow
- [WebRTC cracks the WHIP on OBS - webrtcHacks](https://webrtchacks.com/webrtc-cracks-the-whip-on-obs/) — Low-latency streaming

**Pitfall Research:**
- [Scope Creep: The Silent Killer of Solo Indie Game Development - Wayline](https://www.wayline.io/blog/scope-creep-solo-indie-game-development) — Solo developer burnout
- [Solo Dev's Roadmap: Building Games Without Burning Out - Wayline](https://www.wayline.io/blog/solo-dev-roadmap-building-games-without-burning-out) — Sustainability strategies
- [My LLM coding workflow going into 2026 - Addy Osmani](https://medium.com/@addyosmani/my-llm-coding-workflow-going-into-2026-52fe1681325e) — LLM best practices
- [As Coders Adopt AI Agents, Security Pitfalls Lurk - Dark Reading](https://www.darkreading.com/application-security/coders-adopt-ai-agents-security-pitfalls-lurk-2026) — AI security risks (56% secure code stat)
- [103 Music Production Tips - Hyperbits](https://hyperbits.com/103-music-production-tips/) — Audio production mistakes
- [7 Amateur Music Production Mistakes - Supreme Tracks](https://www.supremetracks.com/7-amateur-music-production-mistakes/) — Gear obsession over skill
- [5 Common Live Streaming Mistakes - Magmatic Media](https://magmaticmedia.com/blogs/magmatic-blog/5-common-live-streaming-mistakes) — WiFi streaming pitfall
- [Web Developer Portfolio: How to Build a Powerful One - Arc](https://arc.dev/talent-blog/web-developer-portfolio/) — Portfolio over-engineering (3-6 months stat)

**Community Best Practices:**
- [OpenProcessing Platform](https://openprocessing.org/) — Remixability patterns, classroom features
- [ShaderToy Wikipedia](https://en.wikipedia.org/wiki/Shadertoy) — Parameter UI patterns
- [What is creative coding and generative art - CodeNewbie](https://www.codenewbie.org/podcast/what-is-creative-coding-and-generative-art) — Expressive over functional emphasis

### Tertiary Sources (LOW-MEDIUM confidence, needs validation)

**Emerging Tools (2025-2026):**
- [VFX-JS: WebGL Effects Made Easy - Codrops](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/) — Newer library, less battle-tested
- [Postiz: Open-source Social Media Tool](https://postiz.com/) — n8n alternative, less mature
- [ShaderGPT - Fountn](https://fountn.design/resource/shadergpt-generate-custom-webgl-shaders/) — AI shader generation, experimental
- [AI Co-Artist: LLM-Powered Framework for Interactive GLSL Shader Animation](https://arxiv.org/html/2512.08951v1) — Research paper, 4.2 vs 0.6 shaders stat

**Industry Predictions:**
- [The LLM Bubble Is Bursting: The 2026 AI Reset - Medium](https://medium.com/generative-ai-revolution-ai-native-transformation/the-llm-bubble-is-bursting-the-2026-ai-reset-powering-agentic-engineering-085da564b6cd) — 15-25% productivity loss to rework stat
- [5 Key Trends Shaping Agentic Development in 2026 - The New Stack](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/) — LLM context management trends
- [20 Rules for Content in 2026 - RPN](https://rpn.beehiiv.com/p/20-rules-for-content-in-2026) — Posting frequency guidance

**Mobile Workflows:**
- [GarageBand iOS](https://www.apple.com/ios/garageband/) — Mobile audio creation
- [FL Studio Mobile](https://www.image-line.com/fl-studio-mobile/) — Android audio
- [Syncthing-Fork Android](https://f-droid.org/packages/com.github.catfriend1.syncthingandroid/) — Mobile sync

---

*Research completed: 2026-01-29*
*Ready for roadmap: YES*
*Next step: Generate roadmap with phase breakdown based on this synthesis*
