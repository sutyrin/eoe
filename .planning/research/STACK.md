# Stack Research: Engines of Experience

**Research Date**: 2026-01-29
**Status**: Greenfield / Foundation
**Scope**: Creative coding + audio/visual publishing ecosystem

---

## Executive Summary

This stack prioritizes **short burst workflows** (10-15 min to 1h), **multi-device sync**, **web-first distribution**, and **CLI automation** while avoiding tooling rabbit holes. All recommendations align with the "T-shaped development" philosophy from your research: deep expertise in creative coding while maintaining broad technical capabilities.

**Core Philosophy**: Use mainstream open-source tools, prefer web standards over proprietary platforms, automate everything publishable, and keep setup friction minimal.

---

## Creative Coding

### Primary Stack

**p5.js v1.9.4** (2D generative art, sketches, posters)
- Rationale: Gentle learning curve, instant browser gratification, massive community
- Perfect for 10-15 min creative bursts
- Runs on mobile browsers without modification
- Export to static HTML for web contraptions
- Confidence: **HIGH** ✓

**Three.js r169** (3D scenes, WebGL, particles, cinematic work)
- Rationale: Industry standard for web 3D, huge ecosystem, well-documented
- GPU-accelerated, runs on all modern devices
- Works with GLSL shaders for advanced effects
- Confidence: **HIGH** ✓

**Hydra v1.4.9** (live coding video synth)
- Rationale: Browser-based, zero setup, perfect for experimental visual performance
- Real-time coding with immediate visual feedback
- Integrates with audio for reactive visuals
- Great for short creative sessions
- Confidence: **MEDIUM-HIGH** ✓

### Shader Programming

**GLSL (via Three.js/WebGL)**
- Rationale: Web standard, GPU-powered, cross-platform
- Tools: glsl.app (online editor), The Book of Shaders (learning)
- ShaderGPT for AI-assisted shader generation (experimental)
- Confidence: **HIGH** ✓

### 3D/Procedural Work

**Blender 4.3 LTS + Python API**
- Rationale: Industry-standard open source, powerful Python scripting
- Geometry Nodes for procedural generation
- Libraries: geometry-script, geonodes, pynodes
- Node To Python addon converts visual setups to code
- Confidence: **HIGH** ✓

**Anti-Recommendation**: TouchDesigner
- Why avoid: Proprietary, expensive, workflow rabbit hole for beginners
- Use Hydra instead for live visuals
- Confidence: **HIGH** ✗

---

## Audio/Music

### Browser-Based (Primary)

**Tone.js v14.8.49**
- Rationale: Web Audio API wrapper, musician-friendly abstractions
- Works on desktop + mobile browsers
- DAW-like features: transport, scheduling, synths, effects
- Time notation: "4n", "8t", "1m" instead of seconds
- Sample-accurate scheduling
- Confidence: **HIGH** ✓

**Web Audio API (native)**
- Rationale: Browser standard, zero dependencies
- Low-level control when Tone.js isn't enough
- Confidence: **HIGH** ✓

### Mobile Creation

**GarageBand (iOS)** or **FL Studio Mobile (Android)**
- Rationale: Quick tune creation on commute/breaks
- Export to web via Tone.js or embed audio files
- Sync via Syncthing to desktop for finishing
- Confidence: **MEDIUM** ✓

### Anti-Recommendation: Ableton Live, Max/MSP
- Why avoid: Deep workflow investment, desktop-only, overkill for "simple tunes"
- Use browser tools instead for faster iteration
- Confidence: **HIGH** ✗

---

## Motion/Video

### Animation Libraries

**GSAP v3.12.5 (GreenSock Animation Platform)**
- Rationale: Rendering-agnostic, works with Canvas/SVG/WebGL
- Industry standard, 60fps performance
- Animates DOM, Canvas coordinates, Three.js scenes
- Confidence: **HIGH** ✓

**VFX-JS (2025)**
- Rationale: Easy WebGL effects for DOM elements
- Add GPU-powered effects to images/videos without low-level coding
- Confidence: **MEDIUM** ✓

### Video Processing

**FFmpeg 7.1**
- Rationale: Swiss Army knife for video, CLI-first
- Batch processing, format conversion, compression
- Integrates with n8n workflows for automation
- Docker image available for consistent environments
- Confidence: **HIGH** ✓

**Canvas API + Web Codecs API**
- Rationale: Browser-native video manipulation
- Export Canvas animations to video files
- Confidence: **MEDIUM-HIGH** ✓

---

## Web Platform

### Static Site Generator

**Astro v4.16**
- Rationale: Ships zero JavaScript by default, blazing fast
- Framework-agnostic (React/Vue/Svelte components)
- Perfect for portfolios + embedding interactive contraptions
- Markdown/MDX support for content
- Excellent build performance
- Confidence: **HIGH** ✓

**Alternative**: Next.js v15
- Use if: You need server-side features, prefer React ecosystem
- Overkill for portfolio + static contraptions
- Confidence: **MEDIUM** (for this use case)

### Hosting

**Cloudflare Pages (Primary)**
- Rationale: Unlimited bandwidth (all plans), global edge, DDoS protection
- Git integration, preview deployments
- Combined with Workers for serverless functions
- Free tier: generous
- Confidence: **HIGH** ✓

**Netlify (Alternative)**
- Rationale: Excellent DX, strong form handling, build plugins
- Better for JAMstack workflows with server functions
- Limited bandwidth on free tier
- Confidence: **MEDIUM-HIGH** ✓

**Anti-Recommendation**: Vercel
- Why skip: Expensive bandwidth overages, Next.js-centric
- Use only if heavily invested in Next.js ecosystem
- Confidence: **MEDIUM** ✗

### Interactive Contraptions

**Embed Strategy**:
- p5.js sketches → `<iframe>` or inline Canvas
- Three.js scenes → separate HTML files, load via iframe
- Tone.js experiments → self-contained HTML widgets
- Host all on Cloudflare Pages subdomains

---

## Publishing Pipeline

### Multi-Platform Distribution

**Primary Tools**:
- YouTube API (via CLI)
- Reddit API (via PRAW - Python Reddit API Wrapper)
- TikTok Content Publishing API (partner access required)

**Automation Platform**:

**n8n (self-hosted)**
- Rationale: Open-source workflow automation, no-code/low-code
- Pre-built nodes for YouTube, Reddit, social platforms
- FFmpeg integration for video processing
- Self-host on Linux server
- Confidence: **HIGH** ✓

**Alternative**: Postiz (open-source)
- Supports Facebook, Instagram, TikTok, YouTube, Reddit, LinkedIn, more
- Self-hosted option available
- Confidence: **MEDIUM-HIGH** ✓

**Manual CLI Tools**:
- `youtube-upload` (Python CLI)
- PRAW (Python Reddit API)
- Custom bash scripts for TikTok uploads

### Anti-Recommendation: Buffer, Hootsuite, Later
- Why avoid: Expensive SaaS, limited customization, vendor lock-in
- Use self-hosted n8n instead
- Confidence: **HIGH** ✗

---

## CLI Tooling

### Publishing Cockpit

**Core Tools**:
- `gh` (GitHub CLI) - PR management, repo stats
- `youtube-upload` - Publish to YouTube from terminal
- `praw` + custom Python scripts - Reddit submissions
- `ffmpeg` - Video processing pipeline
- `jq` - JSON processing for API responses

**Metrics Aggregation**:
- YouTube Analytics API → JSON → dashboard
- Reddit Insights via PRAW → CSV export
- Custom shell scripts to aggregate into SQLite

**Dashboard**:
- Simple HTML + Chart.js hosted on Cloudflare Pages
- Auto-updated via cron job calling APIs
- Confidence: **MEDIUM-HIGH** ✓

### Project Scaffolding

**Degit** or custom shell scripts:
- Template repos for p5.js, Three.js, Astro projects
- One command to spin up new contraption
- Confidence: **HIGH** ✓

---

## Sync Infrastructure

### Cross-Device Synchronization

**Syncthing v1.28**
- Rationale: P2P, no cloud, real-time sync across desktop/laptop/mobile/server
- Zero monthly cost, complete privacy
- Works over LAN or internet
- Mobile apps: Syncthing-Fork (Android), Möbius Sync (iOS)
- Confidence: **HIGH** ✓

**Git + Git LFS**
- Rationale: Version control for code + media files
- LFS for large assets (video, audio, high-res images)
- Text pointers for large files, download on-demand
- File locking prevents binary merge conflicts
- Confidence: **HIGH** ✓

**Backup Strategy**:
- Syncthing: Real-time work-in-progress sync
- Git/LFS: Version control for finished work
- Rsync: Periodic backups to Linux server
- Confidence: **HIGH** ✓

### Anti-Recommendation: Dropbox, Google Drive, iCloud
- Why avoid: Vendor lock-in, monthly costs, limited Linux support
- Use Syncthing instead
- Exception: Use Drive/iCloud for final video hosting before upload
- Confidence: **HIGH** ✗

---

## LLM Integration

### Creative Pair-Creation

**Primary: Claude API (Anthropic)**
- Rationale: Best for creative exploration, coding assistance
- Use via Claude Code (what you're using now)
- Cost-effective for burst usage
- Confidence: **HIGH** ✓

**Local Models (via Ollama v0.14+)**
- Rationale: Zero cost, privacy, works offline
- Models: Qwen3-Coder, Codestral, StarCode2, DeepSeek-Coder
- Ollama supports Anthropic Messages API format (works with Claude Code)
- Run on Linux server, access from any device
- Confidence: **MEDIUM-HIGH** ✓

**Lightweight Interfaces**:
- `ollama-code` - CLI for local creative coding assistant
- OpenCode - Open-source coding assistant
- Shell aliases for quick prompts: `alias ask="ollama run qwen3-coder"`
- Confidence: **MEDIUM** ✓

**Specialized Use**:
- ShaderGPT - Natural language → GLSL shaders
- GitHub Copilot - Code completion (optional, paid)
- Confidence: **LOW-MEDIUM** (experimental)

### Anti-Recommendation: ChatGPT API
- Why avoid: More expensive, less code-focused than Claude
- Use Claude API instead
- Confidence: **MEDIUM** ✗

---

## Anti-Recommendations

### Tools That Look Tempting But Are Rabbit Holes

**Unity / Unreal Engine**
- Why avoid: Massive learning curve, overkill for web contraptions
- Proprietary, vendor lock-in
- Use Three.js + Blender instead
- Exception: If building games is core goal (not stated)
- Confidence: **HIGH** ✗

**Max/MSP**
- Why avoid: Expensive, patching workflow is time-consuming
- Use Tone.js + Hydra instead
- Confidence: **HIGH** ✗

**TouchDesigner**
- Why avoid: Proprietary, steep learning curve, Windows/Mac only
- Use Hydra (browser) + Three.js instead
- Confidence: **HIGH** ✗

**Processing (desktop)**
- Why avoid: Desktop-only, deployment friction vs. web
- Use p5.js (browser version) instead
- Confidence: **MEDIUM-HIGH** ✗

**Adobe Creative Cloud**
- Why avoid: Expensive subscription, closed ecosystem
- Use Blender (3D), GIMP (images), FFmpeg (video)
- Exception: If already subscribed and comfortable
- Confidence: **MEDIUM** ✗

**Electron for contraptions**
- Why avoid: Bloated, deployment overhead
- Use plain HTML/JS hosted on web instead
- Confidence: **HIGH** ✗

**Docker Compose for personal dev**
- Why avoid: Overkill for single-user creative work
- Use native tools, simple shell scripts
- Exception: n8n self-hosting (Docker makes sense here)
- Confidence: **MEDIUM** ✗

---

## Confidence Levels Summary

### HIGH Confidence (Production-Ready)
- p5.js, Three.js, GLSL, Blender + Python
- Tone.js, Web Audio API
- GSAP, FFmpeg
- Astro, Cloudflare Pages
- Syncthing, Git + LFS
- Claude API, Ollama
- n8n for automation

### MEDIUM-HIGH Confidence (Solid, Minor Gaps)
- Hydra (great but niche)
- VFX-JS (newer, less battle-tested)
- Postiz (open-source alternative)
- Netlify (good but bandwidth limits)

### MEDIUM Confidence (Viable, Trade-offs)
- Mobile DAWs (workflow fragmentation)
- YouTube/Reddit API CLI tools (manual setup)
- Local LLM interfaces (still maturing)

### LOW-MEDIUM Confidence (Experimental)
- ShaderGPT (AI tools for shaders)
- Web Codecs API (newer browser standard)

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Set up Astro portfolio site
2. Deploy to Cloudflare Pages
3. Install Syncthing on all devices
4. Create first p5.js contraption
5. Set up Git + LFS for project

### Phase 2: Creative Tools (Week 3-4)
1. Build Tone.js audio playground
2. Create Three.js 3D scene template
3. Experiment with Hydra live coding
4. Set up Blender + Python workflow
5. Export first video with FFmpeg

### Phase 3: Publishing (Week 5-6)
1. Self-host n8n on Linux server
2. Connect YouTube API
3. Set up Reddit posting workflow
4. Create CLI publishing script
5. Build metrics dashboard

### Phase 4: LLM Augmentation (Week 7-8)
1. Install Ollama on server
2. Configure ollama-code
3. Create prompt templates for creative work
4. Integrate with existing workflows

---

## Version Matrix

| Tool | Current Version | Recommendation | Notes |
|------|----------------|----------------|-------|
| p5.js | v1.9.4 | Use latest | Stable, frequent updates |
| Three.js | r169 | Use latest | Active development |
| Tone.js | v14.8.49 | Use latest | Mature, stable API |
| GSAP | v3.12.5 | Use latest | Commercial use requires license |
| Astro | v4.16 | Use latest | Fast release cycle |
| Blender | 4.3 LTS | Use LTS | Stability over features |
| FFmpeg | 7.1 | Use latest stable | CLI tool, backward compatible |
| Syncthing | v1.28 | Use latest | Auto-updates available |
| Ollama | v0.14+ | Use latest | API compatibility matters |
| n8n | Latest | Use Docker latest | Self-hosted, auto-update |

---

## Licensing Considerations

### Free/Open Source (No Restrictions)
- p5.js, Three.js, Tone.js: MIT
- Blender: GPL
- FFmpeg: LGPL/GPL (varies by build)
- Syncthing: MPL 2.0
- Astro: MIT
- Ollama: MIT

### Commercial Use Requires License
- GSAP: Free for open-source, $199+/year for commercial
- Hydra: GPL (open-source okay, commercial check terms)

### API Costs
- Claude API: Pay-per-token (budget ~$10-50/month for active use)
- YouTube API: Free (quota limits apply)
- Reddit API: Free (rate limits apply)
- Cloudflare Pages: Free tier generous, paid $20+/month for scale

---

## Learning Resources (Curated)

### Creative Coding
- The Coding Train (Daniel Shiffman) - YouTube p5.js tutorials
- Generative Design book - Examples + theory
- The Book of Shaders - GLSL learning
- Frontend Masters: WebGL & Shaders course

### Audio
- Tone.js official docs + examples
- Web Audio API MDN guides

### Blender
- CG Wire: Blender Geometry Nodes with Python tutorial
- Procedural Content Generation book (Springer)

### Workflow
- n8n documentation + workflow templates
- Syncthing setup guides (opensource.com)

---

## Risk Assessment

### Low Risk
- Web standards (p5.js, Three.js, Web Audio, GLSL)
- Established tools (Blender, FFmpeg, Git)
- Open protocols (RSS, APIs)

### Medium Risk
- Self-hosted services (n8n, Ollama) - requires server maintenance
- API dependencies (YouTube, Reddit) - terms can change
- LLM costs - Claude API pricing may increase

### High Risk
- Emerging tools (VFX-JS, ShaderGPT) - may not mature
- Mobile-desktop workflow - context switching overhead
- Multi-platform publishing - API breakage possible

### Mitigation
- Prioritize web standards over frameworks
- Keep local backups independent of cloud services
- Document workflows for future replacement
- Budget for API costs increasing 2-3x

---

## Final Recommendations

**Start Here (Day 1)**:
1. Astro portfolio → Cloudflare Pages
2. First p5.js sketch → deploy as contraption
3. Syncthing on desktop + laptop

**Week 1 Goal**:
- Publish one playable contraption
- Sync work folder across devices
- Portfolio live with first piece

**Month 1 Goal**:
- 4-6 contraptions published
- Audio + visual + 3D examples
- One video published to YouTube
- CLI publishing script working

**Quarter 1 Goal**:
- 15-20 contraptions catalog
- Multi-platform publishing automated
- Metrics dashboard tracking engagement
- LLM-assisted creative workflow established

---

## Sources

### Creative Coding
- [p5.js vs Three.js for Generative Artists - Medium](https://medium.com/@TransientLabs/p5-js-vs-three-js-for-generative-artists-the-no-code-friendly-guide-e1ed891afc9d)
- [Top Creative Coding Tools in 2025 - VibeCoding](https://blog.vibecoding.vip/creative-coding-tools/)
- [Top 15 Algorithmic Art Tools - Steve Zafeiriou](https://stevezafeiriou.com/algorithmic-art-tools/)

### Audio
- [Web Audio API, Tone.js - Medium](https://medium.com/@apsue/web-audio-api-tone-js-and-making-music-in-the-browser-2a30a5500710)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Awesome Web Audio - GitHub](https://github.com/notthetup/awesome-webaudio)

### Motion/Video
- [How to Animate WebGL Shaders with GSAP - Codrops](https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/)
- [VFX-JS: WebGL Effects Made Easy - Codrops](https://tympanus.net/codrops/2025/01/20/vfx-js-webgl-effects-made-easy/)
- [Motion Graphics for the Web - Matt DesLauriers](https://mattdesl.svbtle.com/motion-graphics)

### Web Platform
- [Top Static Site Generators for 2025 - CloudCannon](https://cloudcannon.com/blog/the-top-five-static-site-generators-for-2025-and-when-to-use-them/)
- [Astro's Journey from SSG to Next.js Rival - The New Stack](https://thenewstack.io/astros-journey-from-static-site-generator-to-next-js-rival/)
- [Build a Fast Portfolio with Astro - DailyNest](https://dailynest.github.io/articles/2025/08/31/build-a-fast-portfolio-with-astro-and-github-pages/)

### Hosting Comparison
- [Vercel vs Netlify vs Cloudflare Pages 2025 - AI Infra Link](https://www.ai-infra-link.com/vercel-vs-netlify-vs-cloudflare-pages-2025-comparison-for-developers/)
- [Cloudflare Pages vs Netlify vs Vercel - Bejamas](https://bejamas.com/compare/cloudflare-pages-vs-netlify-vs-vercel)

### Publishing
- [Multi-Platform Social Media Tools - Influencer Marketing Hub](https://influencermarketinghub.com/social-media-posting-scheduling-tools/multi-social-media-posting-tools/)
- [Postiz: Open-source Social Media Tool](https://postiz.com/)
- [n8n: Create & Publish Videos Workflow](https://n8n.io/workflows/11591-create-and-publish-inspirational-videos-with-ffmpeg-google-drive-and-youtube/)

### Sync
- [Sync Files with Syncthing - Opensource.com](https://opensource.com/article/20/1/sync-files-syncthing)
- [Syncthing vs Rsync Comparison - Rosetta Digital](https://rosettadigital.com/syncthing-vs-rsync/)
- [Automated File Syncing with Syncthing and Rsync - Self-host Wiki](https://selfhost.club/guides/sync_backup/)

### LLM
- [Run Claude Code with Local LLMs via Ollama - Medium](https://medium.com/data-science-in-your-pocket/run-claude-code-with-local-llms-using-ollama-a97d2c2f2bd1)
- [Local LLM Hosting Complete 2025 Guide - Medium](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a)
- [5 Open-Source Coding LLMs - Labellerr](https://www.labellerr.com/blog/best-coding-llms/)

### Blender
- [How to Script Geometry Nodes with Python - CG Wire](https://blog.cg-wire.com/blender-scripting-geometry-nodes-2/)
- [Geometry Script - GitHub](https://github.com/carson-katri/geometry-script)
- [Node To Python - Blender Extensions](https://extensions.blender.org/add-ons/node-to-python/)

### Shaders
- [The Book of Shaders](https://thebookofshaders.com/)
- [ShaderGPT - Fountn](https://fountn.design/resource/shadergpt-generate-custom-webgl-shaders/)
- [GLSL.app Online Editor](https://glsl.app/)

### Version Control
- [Git LFS Guide - Atlassian](https://www.atlassian.com/git/tutorials/git-lfs)
- [Git LFS vs DVC - Medium](https://medium.com/@pablojusue/git-lfs-and-dvc-the-ultimate-guide-to-managing-large-artifacts-in-mlops-c1c926e6c5f4)
- [Game Development Git Workflow Guide 2025 - Generalist Programmer](https://generalistprogrammer.com/tutorials/game-development-version-control-complete-git-workflow-guide-2025)

---

**Document Version**: 1.0
**Last Updated**: 2026-01-29
**Next Review**: 2026-04-01 (quarterly update)
