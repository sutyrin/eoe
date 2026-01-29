# Features Research: Engines of Experience

**Research Date:** 2026-01-29
**Milestone Context:** Greenfield research for creative coding + media publishing ecosystem
**Research Foundation:** See research.md for intellectual foundation (expanding horizons, T-shaped development, cross-disciplinary learning)

---

## Executive Summary

This document synthesizes feature research across 8 major dimensions of creative coding and media publishing ecosystems. Each category identifies:
- **Table Stakes:** Features users expect or they'll leave
- **Differentiators:** Features that provide competitive advantage
- **Anti-Features:** Deliberate choices to NOT build certain capabilities

The research draws from established platforms (p5.js, OpenProcessing, ShaderToy, Sonic Pi), modern web tools (Jitter, Pikimov), creator platforms (StreamYard, Buffer), and emerging 2026 trends (AI-powered analytics, browser-based collaboration, CLI-first workflows).

---

## 1. Atom Creation

### Table Stakes

**Creative Coding Environment:**
- **Browser-based editor** with syntax highlighting and autocomplete (p5.js Editor standard)
- **Live preview/hot reload** — see changes without manual refresh (industry standard by 2026)
- **Error highlighting** with friendly error messages (p5.js philosophy: accessible to beginners)
- **Save/load sketches** with cloud sync across devices
- **Library management** — enable common libraries (p5.sound, ml5.js, etc.) with one click
- **Export capabilities** — download sketch, export as standalone HTML
- **Mobile-friendly** — at minimum, view and tweak values on mobile
- **Complexity:** Medium (editor infrastructure, preview system, library loading)

**Audio Creation for Non-Musicians:**
- **Text-based composition** — Sonic Pi/TidalCycles model (code-as-score)
- **Pattern-based syntax** — concise, expressive pattern description (TidalCycles strength)
- **Live playback** — hear changes immediately while coding
- **Simple sound library** — built-in synths and samples to start making noise quickly
- **Export to audio files** — WAV/MP3 export for use in other contexts
- **Complexity:** High (audio engine, real-time synthesis, timing/scheduling)

**Motion Graphics:**
- **Timeline-based or code-based** animation (hybrid approach winning in 2026)
- **Shape primitives** — circles, rectangles, paths (Processing/p5.js model)
- **Transform operations** — rotate, scale, translate with easing
- **Export to video** — render to MP4/WebM (critical for YouTube pipeline)
- **Complexity:** Medium-High (rendering pipeline, video encoding)

### Differentiators

**Cross-Pollination Features:**
- **Audio-reactive visuals** — sync visual parameters to audio analysis (beat detection, FFT)
- **Unified timeline** — compose tech + media atoms together
- **Parameter mapping UI** — visual connection between audio patterns and visual transforms
- **Complexity:** High (requires both audio and visual systems working together)

**Short-Burst Workflow:**
- **Session resumption** — pick up exactly where you left off (10-15 min sessions requirement)
- **Quick templates** — start from patterns/sketches, not blank canvas
- **Incremental saves** — autosave every change, never lose work
- **Undo/redo with history browsing** — see all previous states
- **Complexity:** Medium (state management, localStorage/cloud sync)

**LLM Augmentation:**
- **Structural scaffolding** — GSD/Claude Code generates boilerplate, sets up libraries
- **Creative pair programming** — lighter console suggests variations, remixes ideas
- **Code explanation** — understand what existing sketches do
- **Split model strategy** — heavy for structure, light for creativity (per project constraints)
- **Complexity:** Medium (API integration, prompt engineering, context management)

**Educational Value:**
- **Inline documentation** — hover for parameter explanations (ShaderToy model)
- **Visual examples in docs** — every function shows what it does
- **Progressive complexity** — simple functions first, advanced later
- **Complexity:** Low-Medium (documentation infrastructure)

### Anti-Features

- ❌ **Full DAW capabilities** — not building Ableton Live; simple tunes only
- ❌ **Professional video compositing** — not replacing After Effects; motion graphics only
- ❌ **Native mobile apps** — web-based approach, accessible from mobile browser
- ❌ **Custom plugin systems** — use mainstream libraries, avoid tooling rabbit holes
- ❌ **Real-time collaboration on same canvas** — sharing and remixing, not Google Docs-style co-editing (p5.js has this as requested feature but not implemented)
- ❌ **Version control inside editor** — Git handles this externally

**Rationale:** Focus on creation of atoms, not professional production. Tools are output themselves (build own tooling from atoms). Avoid premature infrastructure complexity.

---

## 2. Web Contraptions (Playable Experiences)

### Table Stakes

**Browser Toy Fundamentals:**
- **Embeddable player** — iframe or web component, drop anywhere
- **Responsive layout** — works on desktop, tablet, mobile
- **No install friction** — runs in browser, no plugins
- **Shareable URL** — unique link per contraption
- **Performance optimization** — 60fps target, efficient rendering
- **Complexity:** Medium (packaging, CDN, responsive design)

**Interactive Controls:**
- **Mouse/touch input** — drag, click, tap, swipe
- **Keyboard input** — for more complex interactions
- **On-screen controls** — sliders, buttons for parameters (ShaderToy model)
- **Mobile-first interactions** — touch-friendly hit targets
- **Complexity:** Low-Medium (input handling, UI components)

**Discoverability:**
- **Preview thumbnail** — static image or animated GIF
- **Description/instructions** — what does this do, how to play
- **Tags/categories** — generative art, audio-visual, game-like, etc.
- **Complexity:** Low (metadata, image generation)

### Differentiators

**Progressive Enhancement:**
- **Start simple, grow complex** — contraption v1 might be single atom, v10 combines many
- **Composition history** — show how contraption evolved from atoms
- **Learning pathway** — "start with this simple one, then try this more complex"
- **Complexity:** Medium (versioning, relationship tracking)

**Remixability:**
- **Fork button** — start from someone else's contraption
- **View source** — see the code, learn how it works (OpenProcessing model)
- **Attribution chain** — show remix lineage
- **Complexity:** Low-Medium (Git-like forking, metadata)

**Community Features:**
- **Like/favorite** — simple engagement metric
- **Comments** — discussion per contraption
- **Collections** — curate sets of related contraptions
- **Complexity:** Medium (database, moderation, user accounts)

**Audio-Visual Unity:**
- **Sound on by default** (with mute button) — contraptions can be musical instruments
- **Visual music** — every contraption can be both eye and ear candy
- **Complexity:** Low (player configuration)

### Anti-Features

- ❌ **User accounts required to play** — anonymous play, account only for creating
- ❌ **Social network features** — no feeds, no follows, no algorithmic timeline
- ❌ **Monetization/marketplace** — not selling contraptions, all free/open
- ❌ **Game leaderboards** — contraptions are toys, not competitive games
- ❌ **Analytics tracking** — respect user privacy, minimal metrics
- ❌ **NFT/Web3 integration** — avoid speculative hype (2026 trend: "digital collectibles" replacing NFT terminology, but still questionable fit)

**Rationale:** Maximize accessibility and openness. Portfolio is home base, not social network. Anti-commercial to preserve creative freedom.

---

## 3. Portfolio Site

### Table Stakes

**Project Showcase:**
- **Grid/list of contraptions** — visual browsing
- **Detail pages** — per-project with embedded player, description, code
- **Filtering/search** — by tag, date, complexity
- **Responsive design** — mobile-friendly (72% of portfolio traffic from mobile in 2026)
- **Performance optimized** — fast load times, lazy loading
- **Complexity:** Medium (CMS, templating, optimization)

**Content Types:**
- **Contraptions** — embedded playable experiences
- **Blog posts** — process, journey, learning angles
- **Code repos** — links to GitHub, inline code snippets
- **Videos** — embedded YouTube/TikTok content
- **Complexity:** Low-Medium (content modeling, embeds)

**Navigation:**
- **Clear structure** — atoms, contraptions, blog, about
- **Breadcrumbs** — show where you are in hierarchy
- **Related content** — "if you liked this, try this"
- **Complexity:** Low (sitemap, linking)

### Differentiators

**Narrative Experience (2026 Trend):**
- **Story over grid** — "ditching the typical Hero-About-Projects grid"
- **Interactive storytelling** — GSAP animations, scroll-based reveals
- **Case study depth** — not just "what" but "why" and "how" (43% higher job offer rate)
- **Process visibility** — show evolution, not just final result
- **Complexity:** Medium-High (custom layouts, animations, narrative structure)

**Cross-Disciplinary Showcase:**
- **T-shaped presentation** — deep expertise (coding) + broad interests (music, motion, etc.)
- **Journey documentation** — "what I'm learning" angle from research.md
- **Connection mapping** — show how different atoms/contraptions relate
- **Complexity:** Medium (relationship modeling, visualization)

**Technical Execution:**
- **WebGL/3D elements** — portfolio itself is creative coding (2026 trend: studios blending aesthetics, WebGL, 3D)
- **Micro-animations** — subtle, intentional motion (2026 trend)
- **Live prototypes** — embed Figma/code directly, not just screenshots
- **Complexity:** High (advanced web tech, performance optimization)

**Educational Transparency:**
- **Code available** — view source for portfolio site itself
- **Build in public** — portfolio documents its own creation
- **Meta-commentary** — site explains its own design decisions
- **Complexity:** Low (documentation, code hosting)

### Anti-Features

- ❌ **Generic portfolio builder** — custom site, not Wix/Squarespace template
- ❌ **Client work showcase** — personal practice only, not freelance portfolio
- ❌ **Resume/CV focus** — not job-hunting site, creative home base
- ❌ **Analytics dashboards on public site** — metrics are private (CLI cockpit)
- ❌ **Contact forms** — simple email link, no form spam

**Rationale:** Portfolio is creative expression itself, not generic template. Focuses on practice and learning journey, not commercial presentation.

---

## 4. Content Publishing Pipeline

### Table Stakes

**Multi-Platform Distribution:**
- **YouTube** — video uploads with metadata (title, description, tags)
- **TikTok/Shorts** — vertical video optimization
- **Blog** — written content on portfolio site
- **GitHub** — code repositories for open source
- **Complexity:** Medium (platform APIs, format adaptation)

**Format Adaptation:**
- **Auto-resize** — 60s TikTok → YouTube Shorts → Instagram Reel dimensions
- **Thumbnail generation** — per-platform specs
- **Description templating** — adapt message to platform conventions
- **Complexity:** Medium (video processing, templating)

**Content Angles:**
- **Output** — "Here's what I made" (demos, performances)
- **Process** — "Here's how I made it" (tutorials, breakdowns)
- **Journey** — "Here's what I'm learning" (experiments, growth)
- **Complexity:** Low (categorization, templating)

### Differentiators

**Creation-to-Published Speed:**
- **Minimal friction path** — finish contraption → publish everywhere in <30 min
- **Smart defaults** — pre-filled templates based on content type
- **One command publish** — CLI triggers multi-platform distribution
- **Complexity:** Medium (automation, APIs, CLI integration)

**Code-Centric Workflow:**
- **Embed contraption in video** — screen recording with interaction
- **Code explanation overlays** — show code alongside output
- **GitHub sync** — auto-create repo from contraption source
- **Complexity:** Medium (video generation, code formatting, Git automation)

**AI-Assisted Publishing (2026):**
- **Description generation** — LLM drafts platform-specific copy
- **Tag suggestions** — analyze content, suggest relevant tags
- **Thumbnail design** — AI-assisted composition from key frames
- **67% of video creators using AI-assisted editing by Jan 2026**
- **Complexity:** Medium (AI integration, prompt engineering)

**Cross-Promotion:**
- **Blog embeds contraption** — playable toy + written explanation
- **Video links to code** — YouTube description → GitHub → portfolio
- **Portfolio aggregates all** — single source of truth for body of work
- **Complexity:** Low-Medium (metadata, linking, templating)

### Anti-Features

- ❌ **Premature automation** — start manual, automate pain points as they emerge
- ❌ **Social media management SaaS** — personal use only, not building Buffer competitor
- ❌ **Scheduled posting calendar** — publish when ready, not calendar-driven
- ❌ **A/B testing** — not optimizing for engagement, authentic output
- ❌ **Algorithmic optimization** — create what you want, not what algorithm wants
- ❌ **Paid promotion** — organic reach only, no ads

**Rationale:** Focus on consistent creative output, not content marketing optimization. Manual process first to learn real pain points. Personal practice, not commercial growth hacking.

---

## 5. CLI Cockpit

### Table Stakes

**Terminal Dashboard:**
- **TUI (Text User Interface)** — visual dashboard in terminal (not just commands)
- **Real-time updates** — watch metrics update live
- **Keyboard navigation** — arrow keys, vim bindings
- **Color-coded status** — green/yellow/red for health indicators
- **Complexity:** Medium (TUI framework, real-time data)

**Publishing Commands:**
- **One-command publish** — `eoe publish contraption-name --platforms youtube,tiktok,blog`
- **Preview before publish** — see what will be posted where
- **Dry-run mode** — test without actually publishing
- **Complexity:** Medium (CLI framework, API integration)

**Metrics Aggregation:**
- **Cross-platform stats** — views, engagement from YouTube, TikTok, blog, GitHub
- **Unified dashboard** — one view for all channels
- **Historical trends** — see growth over time
- **Complexity:** Medium-High (API integration, data aggregation, storage)

### Differentiators

**Developer-First Experience (2026 Trend):**
- **Terminal-native** — "living where developers spend most of their day"
- **Composable commands** — Unix philosophy, pipe-able
- **Scriptable** — integrate into existing workflows, cron jobs
- **Configuration as code** — .toml files, version controlled
- **Complexity:** Low-Medium (CLI design, config parsing)

**AI-Powered CLI (2026 Innovation):**
- **Natural language commands** — "publish my latest contraption to all platforms"
- **Context awareness** — knows current state, recent work
- **Smart suggestions** — "you haven't published in a week, ready to ship?"
- **Qodo Command / GitHub Copilot CLI model** — .toml agent configuration
- **Complexity:** Medium-High (AI integration, context management)

**Feedback Loop:**
- **Comment notifications** — see new comments across platforms
- **Sentiment analysis** — AI-powered mood detection (positive/negative/neutral)
- **Response suggestions** — draft replies to comments
- **Complexity:** Medium-High (API polling, AI, notification system)

**Workflow Integration:**
- **Git integration** — auto-commit when publishing, track versions
- **Asset management** — see disk usage, clean up old renders
- **Dependency health** — check for library updates, security issues
- **Complexity:** Medium (Git hooks, filesystem operations, dependency checking)

### Anti-Features

- ❌ **Web-based dashboard** — terminal only, no GUI
- ❌ **Mobile app** — desktop/laptop CLI, not mobile (align with workflow constraints)
- ❌ **Real-time alerts** — batch notifications, not interrupt-driven
- ❌ **Vanity metrics** — focus on creation count, not virality
- ❌ **Comparison to others** — personal practice, not competitive
- ❌ **Growth hacking features** — no "best time to post" optimization

**Rationale:** Fits developer workflow (project constraints). Scriptable and composable (decision rationale). Focuses on creation output, not engagement optimization.

---

## 6. Live Streaming / Performance

### Table Stakes

**Basic Streaming:**
- **Browser-based streaming** — StreamYard model, no OBS complexity for simple streams
- **Multi-platform output** — stream to YouTube, Twitch, etc. simultaneously
- **Screen sharing** — show code editor, contraptions in action
- **Audio input** — capture microphone, system audio (for music performance)
- **Complexity:** Medium-High (WebRTC, platform APIs, audio routing)

**Guest Support:**
- **Multi-guest capability** — 2-10 guests on screen (StreamYard: 10 guests)
- **Low friction invite** — guests join via browser link, no install
- **Guest audio/video** — everyone can be heard and seen
- **Complexity:** High (WebRTC, peer-to-peer networking, UI layout)

**Recording:**
- **Local recording** — save stream to disk (4K on StreamYard premium)
- **Platform recording** — auto-save to YouTube/Twitch
- **Separate audio tracks** — isolate guest audio for post-editing
- **Complexity:** Medium (encoding, storage, multi-track audio)

### Differentiators

**Creative Coding Focus:**
- **Code + output side-by-side** — show editor and running sketch simultaneously
- **Live coding mode** — code changes appear in output in real-time (hot reload during stream)
- **Visual music performance** — contraptions as instruments during stream
- **Complexity:** High (custom layouts, hot reload infrastructure, performance)

**Hybrid OBS + StreamYard Workflow:**
- **OBS for complex scenes** — multiple cameras, advanced composition
- **StreamYard for guests/multistream** — easier guest management, distribution
- **RTMP bridge** — send OBS output to StreamYard for final distribution
- **Complexity:** High (multiple tools, RTMP setup, workflow coordination)

**Intimate to Growing Shows:**
- **Start small** — 1-2 guests, simple setup (project requirement)
- **Scale with community** — add complexity as audience grows
- **Low barrier to join** — guests don't need technical setup
- **Complexity:** Medium (progressive enhancement, scalable architecture)

**Performance Features:**
- **MIDI controller integration** — control contraptions with hardware during performance
- **Parameter automation** — record and playback parameter changes
- **Visual effects pipeline** — apply shaders/effects to stream output
- **Complexity:** High (hardware integration, real-time effects)

### Anti-Features

- ❌ **Professional broadcast features** — not building vMix competitor
- ❌ **Complex scene switching** — keep it simple, focus on content
- ❌ **Chat overlays** — minimal distraction, not Twitch clone
- ❌ **Donation/monetization** — streams are practice, not income
- ❌ **Scheduled streaming calendar** — stream when inspired, not calendar-driven
- ❌ **VOD editing suite** — post-process elsewhere if needed

**Rationale:** Intimate jams → growing shows (requirement). Low complexity for guests (accessibility). Focus on creative performance, not broadcast production.

---

## 7. Community Building

### Table Stakes

**Platform Presence:**
- **Discord server** — real-time chat, Q&A (industry standard for creative coding communities)
- **GitHub organization** — open source code, contributions
- **YouTube community tab** — updates, polls for video watchers
- **Complexity:** Low (platform setup, moderation)

**Contribution Pathways:**
- **Remix/fork contraptions** — OpenProcessing model
- **Submit to showcase** — community gallery of best work
- **Bug reports/feature requests** — GitHub issues
- **Complexity:** Low-Medium (submission system, moderation)

**Documentation:**
- **Getting started guide** — how to create first atom
- **API reference** — all functions, parameters
- **Examples library** — progressively complex samples
- **Complexity:** Medium (documentation system, examples curation)

### Differentiators

**Audience Tiers (Project Requirement):**
- **Creators** — use tools to make their own contraptions
- **Consumers** — watch/listen to output (YouTube, TikTok)
- **Participants** — guests in streams, perform and explain
- **Multi-level engagement** — easy to move between tiers
- **Complexity:** Low (conceptual model, clear pathways)

**Educational Focus:**
- **Teaching platform** — OpenProcessing classroom features as inspiration
- **Assignments/challenges** — weekly creative prompts
- **Feedback loops** — showcase and critique community work
- **Complexity:** Medium (classroom infrastructure, moderation, feedback system)

**Cross-Pollination:**
- **Tech + media fusion** — encourage audio-visual combinations
- **Skill sharing** — musicians teach coders, coders teach musicians
- **Interdisciplinary showcases** — celebrate breadth (research.md values)
- **Complexity:** Low (curation, showcasing)

**Open Source Ethos:**
- **All tools public** — GitHub repos for everything
- **Contributor recognition** — attribution, featured contributors
- **Transparent development** — roadmap, decision-making visible
- **Complexity:** Low (Git workflow, documentation)

### Anti-Features

- ❌ **Closed/exclusive community** — open to all, no gatekeeping
- ❌ **NFT/token gating** — no Web3 gatekeeping (anti-commercial stance)
- ❌ **Competition/rankings** — collaborative, not competitive
- ❌ **Premium tiers** — all community features free
- ❌ **Algorithm-driven discovery** — curated showcases, not algorithmic feeds
- ❌ **User-generated ads** — no promotion, no self-promotion spam

**Rationale:** Openness and accessibility (research.md values). Focus on learning and growth, not competition. Anti-commercial to preserve creative freedom.

---

## Feature Dependencies

### Critical Path (Must Build First)

1. **Atom Creation Editor** (Foundation)
   - Dependencies: None (greenfield)
   - Enables: All contraptions, portfolio content, streaming demos
   - Complexity: Medium
   - **Start Here:** Without atoms, nothing else exists

2. **Web Contraption Player** (Core Output)
   - Dependencies: Atoms must be exportable
   - Enables: Portfolio embedding, sharing, community
   - Complexity: Medium
   - **Build Second:** Transform atoms into shareable experiences

3. **Portfolio Site** (Home Base)
   - Dependencies: Contraptions must be embeddable
   - Enables: Content pipeline destination, portfolio showcase
   - Complexity: Medium-High
   - **Build Third:** Central hub for all output

### Secondary Features (Enhance Core)

4. **Content Publishing Pipeline**
   - Dependencies: Portfolio site (content source), contraptions (content)
   - Enables: Multi-platform reach, audience growth
   - Complexity: Medium
   - **Build Fourth:** Start distributing work

5. **CLI Cockpit**
   - Dependencies: Publishing pipeline (what to manage), portfolio (metrics source)
   - Enables: Efficient workflow, automation
   - Complexity: Medium-High
   - **Build Fifth:** Streamline and automate

### Advanced Features (Community & Growth)

6. **Live Streaming**
   - Dependencies: Atoms (content to show), contraptions (performances), audience (viewers)
   - Enables: Real-time engagement, guest collaboration
   - Complexity: High
   - **Build Later:** After consistent content output established

7. **Community Platform**
   - Dependencies: All of the above (gives community something to do)
   - Enables: Creators using tools, participants in streams
   - Complexity: Medium
   - **Build Last:** Community forms around existing work

### Parallel Development Opportunities

- **Audio atoms** can be developed parallel to **visual atoms** (shared editor infrastructure)
- **Motion graphics** can be developed parallel to **interactive contraptions** (shared rendering)
- **Blog content** can be developed parallel to **video content** (shared publishing pipeline)
- **CLI commands** can be developed incrementally (scriptable, composable)

### Anti-Dependencies (Deliberate Decoupling)

- **Portfolio site should NOT require user accounts** — anonymous viewing
- **Contraptions should NOT require platform APIs** — standalone HTML/JS
- **CLI cockpit should NOT require web dashboard** — terminal-only
- **Streaming should NOT require contraptions** — can stream code editor directly
- **Community should NOT gate content** — all work public before community forms

---

## Complexity Assessment

### Low Complexity (Weeks to MVP)

- **Basic portfolio site** — Static site generator, embed contraptions
- **Simple sharing** — URLs, metadata, thumbnails
- **Discord setup** — Off-the-shelf platform
- **GitHub presence** — Standard Git workflow
- **Estimated effort:** 2-4 weeks per feature

### Medium Complexity (Months to MVP)

- **Creative coding editor** — Monaco/CodeMirror + p5.js + preview
- **Contraption player** — Packaging, embedding, responsive design
- **Publishing pipeline** — Platform APIs, format adaptation
- **CLI cockpit** — TUI framework, commands, metrics
- **Community features** — Submission system, moderation
- **Estimated effort:** 1-3 months per feature

### High Complexity (Multi-Month to MVP)

- **Audio creation tools** — Audio engine, synthesis, timing (Sonic Pi complexity)
- **Motion graphics** — Timeline, rendering, video export
- **Live streaming** — WebRTC, multi-guest, recording
- **AI integration** — Model integration, prompt engineering, context management
- **Audio-visual cross-pollination** — Tight integration between audio and visual systems
- **Estimated effort:** 3-6 months per feature

### Very High Complexity (Major Undertakings)

- **Full creative suite** — All atom types + contraptions + publishing + streaming
- **Real-time collaboration** — Multiplayer editing, conflict resolution
- **Professional production tools** — DAW-level audio or AE-level motion graphics
- **Estimated effort:** 6+ months, possibly years

### Recommended Build Order (By Complexity + Dependencies)

**Phase 1: Core Creation (3-6 months)**
1. Visual coding editor (Medium, 2-3 months)
2. Contraption player (Medium, 1-2 months)
3. Basic portfolio site (Low-Medium, 1 month)

**Phase 2: Distribution (2-4 months)**
4. Publishing pipeline (Medium, 2 months)
5. CLI cockpit v1 (Medium, 2 months)

**Phase 3: Audio Integration (3-6 months)**
6. Audio creation tools (High, 3-4 months)
7. Audio-visual fusion (High, 2-3 months)

**Phase 4: Community & Performance (3-6 months)**
8. Streaming setup (High, 2-3 months)
9. Community platform (Medium, 2 months)
10. Motion graphics (High, 3-4 months)

**Total Estimated Timeline:** 12-24 months to full ecosystem

---

## Strategic Recommendations

### 1. Start Minimal, Validate Fast

**Ship atom editor + contraption player + simple portfolio first** (Phase 1). This validates:
- Can you create atoms enjoyably in short bursts? (Core workflow)
- Are contraptions engaging as playable toys? (Core value)
- Does portfolio present work effectively? (Core distribution)

**3-6 month validation milestone:** If not creating consistently and enjoying the process, re-evaluate before building more.

### 2. Manual Before Automation

**Publish manually for first 10-20 pieces**. Learn:
- What's actually painful? (Not what you assume)
- What takes time? (Optimize real bottlenecks)
- What's valuable? (Metrics that matter)

**Then build CLI cockpit** to automate proven pain points, not imagined ones.

### 3. Grow Complexity With Practice

**Start with visual atoms only**. Audio is high complexity; defer until:
- Visual workflow is smooth
- You're creating consistently
- You have mental model for composition

**Then add audio** as enhancement, not foundation.

### 4. Build Tools FROM Atoms

**Every infrastructure piece should be its own creative output**:
- Portfolio site is a contraption (WebGL, animations)
- CLI cockpit is a code project (open source, documented)
- Publishing pipeline is a tutorial series ("how I automate")

**This aligns with project philosophy**: "Build own tooling from explored atoms."

### 5. Community Forms Around Work

**Don't build community platform first**. Instead:
- Create consistently for 6-12 months
- Share work publicly (YouTube, GitHub, portfolio)
- Let community emerge organically
- Then formalize (Discord, classroom features)

**Premature community building = empty forums**. Content attracts community, not vice versa.

### 6. Avoid Feature Creep Traps

**Each category has anti-features for a reason**. When tempted to add:
- Social network features → Remember: portfolio is home base, not social network
- Professional production tools → Remember: atoms and contraptions, not end-to-end suites
- Monetization → Remember: anti-commercial to preserve creative freedom
- Web3/NFT → Remember: 2026 trend shows this space still questionable fit

**Refer back to anti-features** when scope creeps.

### 7. Leverage 2026 Ecosystem

**Don't rebuild what exists**:
- Streaming: Start with StreamYard (browser-based, low friction)
- Community: Start with Discord (industry standard)
- Publishing: Use platform APIs (YouTube, TikTok, GitHub)
- AI: Integrate Claude/GPT APIs (don't build LLM)

**Build the unique parts**: atom creation, contraption player, cross-pollination of tech + media.

---

## Sources

### Creative Coding Platforms
- [OpenProcessing](https://openprocessing.org/)
- [p5.js](https://p5js.org/)
- [Comparing Top Generative Art Tools](https://visualalchemist.in/2024/08/31/comparing-top-generative-art-tools-processing-openframeworks-p5-js-and-more/)
- [p5.js Web Editor](https://editor.p5js.org/)
- [p5.js GitHub Repository](https://github.com/processing/p5.js-web-editor)

### Interactive Web Experiences
- [Top 21 Playable Interactive Websites](https://qodeinteractive.com/magazine/playable-interactive-websites/)
- [20 Best Interactive Websites 2026](https://inkbotdesign.com/best-interactive-websites/)
- [Create an Interactive Web Toy](https://www.creativebloq.com/character-design/create-interactive-web-toy-10079454)
- [Digital Art Trends 2026](https://www.creativebloq.com/art/digital-art/digital-art-trends-2026-reveal-how-creatives-are-responding-to-ai-pressure)

### Audio Creation for Coders
- [Sonic Pi vs TidalCycles vs Strudel](https://creativecodingtech.com/music/live-coding/comparison/2024/10/22/sonic-pi-vs-tidalcycles-vs-strudel.html)
- [Sonic Pi](https://sonic-pi.net/)
- [Music Generation Using Code](https://www.nvisia.com/insights/music-generation-using-code)
- [10 Best Sonic Pi Alternatives](https://jiyushe.com/producthunk/best-sonic-pi-alternatives-and-competitors.html)

### Portfolio Platforms
- [5 Best Portfolio Website Builders 2026](https://emergent.sh/learn/best-portfolio-website-builders)
- [Top 100 Creative Portfolio Websites 2025](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [Digital Portfolio Platforms 2026 Guide](https://influenceflow.io/resources/digital-portfolio-platforms-the-complete-2026-guide-for-creators-freelancers-and-brands/)
- [The Anthology of a Creative Developer: A 2026 Portfolio](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)

### Multi-Platform Publishing
- [All-In-One Creator Tools 2026](https://influenceflow.io/resources/all-in-one-creator-tools-the-complete-2026-guide-to-streamlining-your-content-creation-workflow/)
- [Content Creation Tools & Analytics 2026](https://influenceflow.io/resources/content-creation-tools-and-analytics-platforms-the-complete-guide-for-2026/)
- [30+ Best TikTok Tools 2026](https://www.socialchamp.com/blog/tiktok-tools/)
- [CreatorHub – Multi-Platform Analytics](https://creatorhubstudio.com/)

### Live Streaming
- [Streaming Software 2026 Comparison](https://streamyard.com/blog/streaming-software-2026-comparison)
- [Best Streaming Software for YouTube 2026](https://streamyard.com/blog/best-streaming-software-for-youtube-live-streaming)
- [What Is StreamYard? 2026 Review](https://www.learningrevolution.net/streamyard-review/)
- [OBS vs Streamlabs Comparison](https://streamyard.com/blog/streaming-software-comparison-between-obs-and-streamlabs)

### Community Platforms
- [OpenProcessing Community](https://openprocessing.org/)
- [Processing Discord Server Announcement](https://processing.org/)
- [GitHub - Awesome Creative Coding](https://github.com/terkelg/awesome-creative-coding)
- [GitHub - Creative Coding Minilist](https://github.com/CreativeCodeBerlin/creative-coding-minilist)

### Shader Tools
- [GLSL.app - Online WebGL Shader Editor](https://glsl.app/)
- [Shader Playground GitHub](https://github.com/foltik/Shader-Playground)
- [glsl-playground GitHub](https://github.com/ericjang/glsl-playground)
- [Shadertoy Wikipedia](https://en.wikipedia.org/wiki/Shadertoy)

### Development Workflows
- [Top 10 Vibe Coding Tools 2026](https://www.nucamp.co/blog/top-10-vibe-coding-tools-in-2026-cursor-copilot-claude-code-more)
- [Windsurf Review 2026](https://www.secondtalent.com/resources/windsurf-review/)
- [Compose Hot Reload 1.0.0](https://blog.jetbrains.com/kotlin/2026/01/the-journey-to-compose-hot-reload-1-0-0/)
- [Live++ Hot Reload](https://liveplusplus.tech/)

### Web3 & Generative Art
- [Digital Collectibles 2026](https://weandthecolor.com/nfts-are-dead-long-live-digital-collectibles-how-web3-ownership-is-quietly-redefining-design-and-art-in-2026/206559)
- [What is Art Blocks NFT?](https://nftevening.com/art-blocks-a-new-approach-to-nfts-with-generative-art/)
- [Generative Art NFT Introduction](https://supra.com/academy/history-of-generative-art-and-how-it-applies-to-nfts/)

### Motion Graphics
- [Jitter - Free Web-Based After Effects Alternative](https://jitter.video/after-effects-alternative/)
- [12 Best Adobe After Effects Alternatives 2026](https://www.cyberlink.com/blog/cool-video-effects/82/best-free-after-effects-alternative)
- [Motion Graphics Trends 2026](https://filtergrade.com/motion-graphics-trends-that-will-shape-2026-and-how-creators-can-prepare-their-templates-early/)

### CLI Tools
- [Top 5 CLI Coding Agents 2026](https://dev.to/lightningdev123/top-5-cli-coding-agents-in-2026-3pia)
- [7 Modern CLI Tools 2026](https://medium.com/the-software-journal/7-modern-cli-tools-you-must-try-in-2026-c4ecab6a9928)
- [GitHub Copilot CLI Enhanced Agents](https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/)
- [12 CLI Tools Redefining Developer Workflows](https://www.qodo.ai/blog/best-cli-tools/)

### Version Control for Creative Work
- [Git LFS Overview](https://www.perforce.com/blog/vcs/how-git-lfs-works)
- [Understanding Git LFS](https://namastedev.com/blog/understanding-git-lfs-managing-large-files-in-version-control/)
- [Mastering Git LFS for Game Developers](https://medium.com/@Brian_David/mastering-git-lfs-a-game-developers-guide-to-managing-large-assets-c3468551c398)
- [Version Control for Artists - Anchorpoint](https://www.anchorpoint.app/)

### Creator Analytics
- [Analytics Dashboard for Creators 2026](https://influenceflow.io/resources/analytics-dashboard-for-creators-complete-guide-to-tracking-growing-monetizing-in-2026/)
- [Creator Analytics and Performance Metrics 2026](https://influenceflow.io/resources/creator-analytics-and-performance-metrics-the-complete-2026-guide/)
- [Creator Income Analytics 2026](https://influenceflow.io/resources/creator-income-analytics-master-your-earnings-in-2026/)
- [Essential Creator Analytics Guide 2025](https://www.liveskillshub.com/knowledge-base/article/essential-creator-analytics-guide-2025)

---

**End of Features Research**
