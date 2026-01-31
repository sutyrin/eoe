# Existing Infrastructure Landscape

**Research Date:** 2026-01-31
**Domain:** Live coding / generative music / visual composition
**Focus:** Browser-based and mobile-embeddable infrastructure for EoE v1.1
**Overall Confidence:** HIGH (verified with current sources, 2025-2026 activity confirmed)

---

## Executive Summary

The live coding and creative browser ecosystem is **actively thriving in 2025-2026** with several production-ready options for EoE integration. Key findings:

**Quick wins identified:**
1. **Strudel** (live coding) - TidalCycles in browser, active 2025, could embed entire system
2. **Hydra** (visuals) - Browser-based visual synthesis, WebGL, networked, actively maintained
3. **Tone.js** (audio) - Already using, confirmed best-in-class for Web Audio (2025)
4. **Tonal.js** (music theory) - 4.1k stars, pure functions, comprehensive theory support
5. **React Flow / xyflow** (node editor) - 35k stars, mobile-ready, MIT license, Dec 2025 release

**Avoid:**
- SuperCollider/scsynth (browser port too new, alpha status, Oct 2025 creation)
- ORCA (esoteric, steep learning curve, not mobile-friendly)
- Cables.gl (powerful but heavy, desktop-oriented UX)
- TouchOSC (proprietary, moved off GitHub)

**Build custom:**
- Mobile-first timeline/sequencer (existing libs not touch-optimized)
- Atom composition layer (unique to EoE vision)
- Sync layer for multi-device workflow

---

## Live Coding Systems

### Strudel ⭐ TOP PICK - Live Coding
**Repository:** https://codeberg.org/uzu/strudel (moved from GitHub June 2025)
**GitHub (archived):** https://github.com/tidalcycles/strudel (2.8k stars)
**Status:** ACTIVE (moved to Codeberg for ethical reasons)
**Last Activity:** June 2025 (archive), actively maintained on Codeberg
**License:** AGPL-3.0
**Confidence:** HIGH

**What it is:**
- TidalCycles pattern language ported to JavaScript
- Browser-based live coding environment at strudel.cc
- Built on Tone.js for Web Audio synthesis
- 54 contributors, 4,676 commits

**Architecture:**
- JavaScript port of Haskell TidalCycles
- Pattern-based algorithmic music generation
- Real-time code editing with immediate audio feedback
- Web Audio API + Tone.js integration

**Integration Potential for EoE:**
- **Fork it:** Could embed entire Strudel editor as atom type
- **Build on top:** Use pattern language as text-based composition format
- **Extract core:** Take pattern engine, skip UI, build custom mobile interface

**Strengths:**
- Mature, proven pattern language (TidalCycles heritage)
- Active community, UT Austin workshops scheduled for Feb 2026
- Browser-native, no installation
- Text-based = version control friendly

**Weaknesses:**
- AGPL-3.0 license (copyleft, requires open-sourcing derivative work)
- Text-focused UI not mobile-friendly (keyboard required)
- Moved to Codeberg (smaller ecosystem than GitHub)

**Mobile Readiness:** LOW (designed for keyboard-based coding)

**Recommendation:** Extract pattern engine for headless use, build mobile UI on top. Respect AGPL by open-sourcing EoE components using it.

---

### Sonic Pi (Web Version)
**Main Site:** https://sonic-pi.net/
**SuperSonic (browser port):** https://sonic-pi.net/supersonic/demo.html
**SuperSonic GitHub:** https://github.com/samaaron/supersonic (144 stars)
**Status:** SuperSonic = ALPHA (created Oct 2025, v0.36.0 Jan 2026)
**License:** MIT (Sonic Pi = GPL-2.0+, SuperSonic = MIT)
**Confidence:** MEDIUM

**What it is:**
- Sonic Pi: Educational live coding synth (desktop app)
- SuperSonic: scsynth (SuperCollider) in browser via WebAssembly + AudioWorklet
- Created by Sam Aaron (Sonic Pi author) in Oct 2025

**Architecture:**
- C++ synthesis engine (scsynth) compiled to WebAssembly
- Runs in AudioWorklet for high-priority audio thread
- SharedArrayBuffer mode for lower latency (requires COOP/COEP headers)
- OSC API for integration with live coding tools

**Integration Potential:**
- **Too new:** Created Oct 2025, still alpha status
- **Educational focus:** Sonic Pi targets teaching, not production composition
- **Desktop-first:** Full Sonic Pi has no official web version (community requests open)

**Recommendation:** AVOID for v1.1 - too early (alpha), no mobile story, educational rather than production-focused. Revisit in 2027 when mature.

---

### ORCA
**Repository:** https://github.com/hundredrabbits/Orca (4.9k stars)
**C Port:** https://github.com/hundredrabbits/Orca-c
**Status:** ACTIVE (1,387 commits)
**License:** MIT
**Confidence:** HIGH

**What it is:**
- Esoteric 2D grid-based programming language
- Sends MIDI/OSC/UDP to external synthesizers (not a synth itself)
- Each letter of alphabet = operation (lowercase=bang, uppercase=per-frame)
- Available: Desktop (Linux/Win/Mac), Browser (WebMidi), Terminal (C), Monome Norns (Lua)

**Architecture:**
- 26 core operators + specialized I/O commands
- Grid-based visual programming (left-to-right, top-to-bottom execution)
- Controls external audio/visual interfaces (Ableton, Renoise, VCV Rack, SuperCollider)

**Integration Potential:**
- **Esoteric barrier:** Steep learning curve, cryptic syntax
- **External dependency:** Requires MIDI/OSC receiver (not standalone)
- **Desktop UX:** Grid editing not touch-friendly

**Recommendation:** AVOID - too esoteric for short-burst workflow, not mobile-friendly, requires external synthesizer. Cool but wrong fit.

---

### TidalCycles (Web Clients)
**Main Site:** https://tidalcycles.org/
**Strudel:** See above (primary web implementation)
**Estuary:** https://github.com/dktr0/estuary (collaborative platform)
**Status:** Core TidalCycles = ACTIVE, Estuary = ACTIVE (v0.3, Apr 2025 release)
**License:** GPL-3.0 (Estuary)
**Confidence:** HIGH

**What it is:**
- TidalCycles: Haskell-based pattern language (desktop, requires SuperCollider)
- Estuary: Browser-based collaborative live coding platform (McMaster University)
- Strudel: JavaScript port (see above)

**Estuary Details:**
- Collaborative, networked ensembles
- Multiple live coding languages in one environment
- Audiovisual support (minitidal subset runs in browser)
- 24/7 server at https://estuary.mcmaster.ca
- 2,763 commits, 241 releases, Apr 2025 latest
- Haskell 92%, CSS 5%, JS 1.2%

**Integration Potential:**
- **Estuary = collaborative focus** (multi-user, ensembles)
- **Strudel = solo focus** (better fit for EoE)
- **Haskell codebase** (Estuary) = hard to fork/modify

**Recommendation:** Use Strudel (JavaScript) over Estuary (Haskell). Estuary is for collaborative performances, EoE is for solo short-burst creation.

---

## Visual Composition Tools

### Hydra ⭐ TOP PICK - Visual Synthesis
**Repository:** https://github.com/hydra-synth/hydra (2.6k stars)
**Live Site:** https://hydra.ojack.xyz/
**Status:** ACTIVE (Sept 2025 commits)
**License:** AGPL-3.0
**Confidence:** HIGH

**What it is:**
- Live coding for visuals in browser
- WebGL-based video synthesis
- Real-time networked streaming (WebRTC peer-to-peer)
- Audio-reactive via Meyda (FFT analysis)

**Architecture:**
- Regl (functional WebGL)
- CodeMirror (code editor)
- simple-peer (WebRTC networking)
- Multiple framebuffers (o0-o3) for dynamic mixing
- Chained function transformations (modular synthesis inspired)

**Integration Potential:**
- **Embed entire system:** Could iframe Hydra instances for visual atoms
- **Fork core engine:** Extract WebGL synthesis pipeline
- **Audio coupling:** Already integrates Meyda for reactive visuals

**Strengths:**
- Mature, proven in live coding performances
- Networked visuals (share between browser windows via WebRTC)
- MIDI controller support (experimental)
- Loads external libraries (Three.js, Tone.js, P5.js)
- Active community, extensive documentation

**Weaknesses:**
- AGPL-3.0 (copyleft)
- Live coding syntax (keyboard-heavy, not mobile-optimized)
- Desktop UX (code editor focus)

**Mobile Readiness:** LOW (code editing not touch-friendly, but WebGL runs fine on mobile)

**Recommendation:** Use Hydra engine for visual synthesis, build mobile UI wrapper. Or run Hydra instances on desktop, stream output to mobile via WebRTC. AGPL requires open-sourcing derivative work.

---

### Cables.gl
**Main Site:** https://cables.gl/
**GitHub:** https://github.com/cables-gl
**Status:** ACTIVE (June 2025 release, NGI Zero funding 2024-2025)
**License:** MIT (core is open source)
**Confidence:** HIGH

**What it is:**
- Node-based visual programming for WebGL/WebGPU
- Browser + standalone (macOS Intel/Apple Silicon, Windows, Linux)
- Operator-based (connect "ops" with virtual cables)

**Recent Updates:**
- June 2025: Huge release after 6 months, faster editing, improved patching
- NGI Zero Commons Fund (Feb 2024 - Apr 2025)
- Future: GLTF support, texture formats, bones, rigged meshes

**Integration Potential:**
- **Desktop-first UX:** Node editor optimized for mouse/keyboard
- **Heavy runtime:** Full 3D engine, large dependency
- **Commercial focus:** Backup storage, supporter tiers

**Strengths:**
- Polished, professional-grade tool
- MIT license (permissive)
- Active development, well-funded
- 3D/WebGPU support

**Weaknesses:**
- Desktop UX not mobile-friendly
- Complex for short-burst workflow
- Overkill for simple visual atoms

**Mobile Readiness:** LOW (node editor requires precise mouse/keyboard)

**Recommendation:** AVOID for v1.1 - too heavy, desktop-oriented. Consider for v2+ if 3D/advanced visuals needed.

---

### Pure Data (Browser Implementations)

#### WebPd ⭐ BEST Pd-for-Web
**Repository:** https://github.com/sebpiq/WebPd (658 commits)
**Web Compiler:** https://sebpiq.github.io/WebPd_website
**Status:** ACTIVE (alpha release, heavy development)
**License:** Not specified in search results
**Confidence:** MEDIUM

**What it is:**
- Compiles Pure Data patches to JavaScript or AssemblyScript
- Lean audio compiler (not GUI replication)
- Human-readable, high-performance output code
- CLI tool: `npm install -g webpd`

**Architecture:**
- Pd file parser → WebPd compiler → Runtime
- White-box approach (transparency over black-box execution)
- No GUI support (audio graph only)

**Integration Potential:**
- **Use Pd for prototyping** → Compile to JS → Embed in EoE
- **Bridge to Pd ecosystem** (tons of patches available)
- **Alpha status risk** (many patches won't work yet)

**Recommendation:** WATCH - promising for bridging Pd ecosystem, but alpha = risky. Use if specific Pd patches needed, otherwise stick to Tone.js.

---

#### pd4web
**Main Site:** https://charlesneimog.github.io/pd4web/
**Status:** ACTIVE (v2.4.0 in 2025-2026, recent versions: 2.4.0, 2.2.6, etc.)
**Confidence:** MEDIUM

**What it is:**
- Runs PureData patches in browser (vanilla Pd + externals!)
- No programming expertise required
- Web Audio API backend
- Desktop + mobile platforms

**Integration Potential:**
- **Full Pd compatibility** (including externals)
- **No-code approach** (easier than WebPd for non-programmers)
- **Less info available** (GitHub not in search results)

**Recommendation:** WATCH - alternative to WebPd if full Pd compatibility needed. Less mature than WebPd based on documentation depth.

---

## Audio Synthesis & Music Theory

### Tone.js ⭐ CURRENT CHOICE - Confirmed Best
**Main Site:** https://tonejs.github.io/
**GitHub:** https://github.com/Tonejs/Tone.js
**Status:** ACTIVE (de facto standard for Web Audio)
**License:** MIT
**Confidence:** HIGH

**What it is:**
- Web Audio framework for interactive music in browser
- Multiple synth types (FM, AM, Noise, PolySynth)
- Global transport (event sync, scheduling, tempo)
- Audio-rate parameter automation (sample-accurate)
- Effects: distortion, filters, delays, routing

**Current Status:**
- Stable version: `npm install tone`
- Development version: `npm install tone@next`
- Nearly 100% test coverage (mocha + chai)
- Available via unpkg.com CDN

**Alternatives Considered:**

| Library | Strengths | Why Not Tone.js? |
|---------|-----------|------------------|
| **Pizzicato.js** | Simplifies Web Audio API | Less comprehensive |
| **XSound.js** | Full stack audio | Smaller community |
| **Elementary** | Declarative, functional | Less mature |
| **Sound.js** | Micro-library | Too minimal |
| **SoundJS** | Higher-level API | Gaming focus |
| **p5.sound** | Creative coding integration | Tied to p5.js |
| **@magenta/music** | ML-powered generation | Niche use case |

**Recommendation:** KEEP using Tone.js - it's the clear winner for comprehensive Web Audio in 2025. No alternatives offer better mobile + feature coverage.

---

### Tonal.js ⭐ TOP PICK - Music Theory
**Repository:** https://github.com/tonaljs/tonal (4.1k stars)
**Docs:** https://tonaljs.github.io/tonal/docs
**Status:** ACTIVE (1,042 commits, 68 contributors, used by 1,600+ projects)
**License:** MIT
**Confidence:** HIGH

**What it is:**
- Functional music theory library for JavaScript
- TypeScript implementation (98.9% of codebase)
- Pure functions, no data mutation
- Modular npm packages

**Features:**
- Note operations: MIDI conversion, frequency, transposition, accidentals
- Intervals: semitones, distance, inversion
- Scales & chords: generation, identification, inversions
- Voicing: chord voicing, voice-leading
- Harmonic analysis: keys, modes, progressions, Roman numerals
- Rhythm: time signatures, durations, patterns

**Alternatives Considered:**

| Library | Features | Why Tonal? |
|---------|----------|-----------|
| **Teoria.js** | Jazz & classical theory | Less active (last updates unclear) |
| **Zazate.js** | Scales, intervals, chords | Smaller community |

**Recommendation:** ADOPT Tonal.js for music theory. 4.1k stars, 1,600+ dependents, functional programming style, comprehensive features. MIT license, actively maintained.

---

### Meyda - Audio Feature Extraction
**Repository:** https://github.com/meyda/meyda (1.6k stars)
**Main Site:** https://meyda.js.org/
**NPM:** https://www.npmjs.com/package/meyda
**Status:** STABLE (v5.6.3 April 2024, moderate activity)
**License:** MIT
**Confidence:** MEDIUM

**What it is:**
- Audio feature extraction for JavaScript
- Real-time + offline extraction
- Web Audio API integration

**Features:**
- Amplitude spectrum, power spectrum
- Spectral centroid, flatness, flux, spread
- Zero-crossing rate
- MFCC (Mel-frequency cepstral coefficients)
- Chroma, energy, RMS

**Integration Potential:**
- **Reactive visuals:** Extract features → drive Hydra parameters
- **Audio analysis:** Beat detection, onset detection
- **Performance:** Real-time capable with Web Audio API

**Recommendation:** ADOPT for audio-reactive features. Stable, MIT licensed, proven in Hydra integration.

---

### Scribbletune - MIDI Generation
**Repository:** https://github.com/scribbletune/scribbletune
**Main Site:** https://scribbletune.com/
**Status:** ACTIVE (Oct 2025 updates to site, Sept 2025 to live tools)
**Version:** 5.1.0 on NPM
**License:** Not specified in search results
**Confidence:** MEDIUM

**What it is:**
- Generate musical patterns with JavaScript strings and arrays
- Export MIDI files for DAWs (Ableton, Reason, GarageBand)
- Browser use with Tone.js

**Recent Activity (2025):**
- scribbletune.com: Oct 6, 2025
- pydrums (AI drum patterns): Sept 24, 2025
- Live performance tools: Sept 5, 2025
- Harmonics: Aug 12, 2025

**Integration Potential:**
- **Pattern generation:** Algorithmic MIDI creation
- **DAW bridge:** Export atoms as MIDI for further production
- **Tone.js integration:** Direct browser playback

**Recommendation:** ADOPT for MIDI export workflow. Active in 2025, proven pattern generation, DAW bridge for post-processing.

---

## Node-Based Visual Editors

### React Flow / xyflow ⭐ TOP PICK - Node Editor
**Repository:** https://github.com/xyflow/xyflow (35k stars!)
**React Flow:** https://reactflow.dev
**Svelte Flow:** https://svelteflow.dev
**Status:** EXTREMELY ACTIVE (v0.36.0 Dec 2025, 6,032 commits)
**License:** MIT
**Confidence:** HIGH

**What it is:**
- Node-based UI libraries for React and Svelte
- Ready out-of-the-box, infinitely customizable
- Used by 15.5k+ projects

**Architecture:**
- TypeScript: 85.5%
- Svelte: 11.6%
- Four packages: @xyflow/react (v12), reactflow (v11 legacy), @xyflow/svelte, @xyflow/system (shared)
- Built-in: MiniMap, Controls, Background components

**Features:**
- Seamless zooming and panning
- Single + multi-selection
- Custom nodes with multiple handles
- Fast rendering (only changed nodes re-render)
- TypeScript support
- Mobile-touch friendly

**Recent Activity (Jan 2026):**
- Experimental Strudel node UI built with React Flow
- Vite templates for React Flow and Svelte Flow
- Node collision algorithms

**Integration Potential:**
- **Atom composition layer:** Visual programming for connecting atoms
- **Mobile-ready:** Touch support included
- **Proven at scale:** 35k stars, 2.3k forks

**Alternatives Considered:**

| Library | Stars | Why React Flow? |
|---------|-------|-----------------|
| **Rete.js** | 11.8k | Good, but React Flow has 3x stars, more active |
| **Flume** | Less info | Smaller community |

**Recommendation:** ADOPT React Flow for node-based composition UI. Best-in-class, MIT license, mobile-ready, extremely active (Dec 2025 release). Perfect for EoE atom composition.

---

## Timeline / Sequencing

### Analysis: No Clear Winner for Mobile Timeline

**Desktop/Web Timeline Libraries (2025):**
- Mobiscroll (commercial, updated Dec 2025)
- Syncfusion (commercial)
- Nuxt UI Timeline (Vue component, not sequencer-focused)
- timingsrc Sequencer (pure JS, sequencing logic only)

**Step Sequencer Projects:**
- michd/step-sequencer (drums, tempo, URL sharing)
- thooyork/step-sequencer (Vue.js + Tone.js)
- Eden12345/JSequencer (Tone.js, synthesis + samples)
- Tone.js built-in Sequence (16th note callbacks)

**Gap Identified:**
- **No mobile-first timeline UI** for audio sequencing
- Existing libs focus on event timelines, not musical sequencing
- Tone.js Transport is strong for logic, weak for mobile UI

**Recommendation:** BUILD CUSTOM mobile timeline/sequencer. Use Tone.js Transport for timing, build touch-optimized UI. Reference video editor UX (CapCut, InShot) for mobile patterns.

---

### Ableton Link Protocol
**Official Docs:** https://ableton.github.io/link/
**NPM:** https://www.npmjs.com/package/@ktamas77/abletonlink
**GitHub:** https://github.com/Ableton/link
**Status:** ACTIVE (industry standard)
**License:** Dual (GPLv2+ or proprietary, contact link-devs@ableton.com)
**Confidence:** HIGH

**What it is:**
- Synchronizes tempo, beat, phase, start/stop across devices/apps
- Local network discovery (automatic)
- UDP multicast (fast, low-latency)

**JavaScript Implementation:**
- @ktamas77/abletonlink: Node.js wrapper around C++ SDK
- Native bindings (compiled during install)
- Not browser-compatible (requires Node.js)

**Integration Potential:**
- **Desktop sync:** Sync EoE with Ableton Live, other DAWs
- **Multi-device sync:** Could sync across laptop + mobile
- **Browser limitation:** Requires Node.js bridge (UDP not in browser)

**Recommendation:** WATCH for v1.2+. Requires native Node.js bridge between browser clients. Worth exploring for desktop-mobile sync, but not trivial to implement.

---

## Audio Visualization

### Wavesurfer.js ⭐ TOP PICK - Waveform Visualization
**Repository:** https://github.com/katspaugh/wavesurfer.js (10.1k stars!)
**Main Site:** https://wavesurfer.xyz/
**Version:** 7.12.1 (Dec 4, 2025)
**Status:** EXTREMELY ACTIVE (2,076 commits, 145 releases, used by 15.5k projects)
**License:** BSD-3-Clause
**Confidence:** HIGH

**What it is:**
- Interactive waveform rendering and audio playback
- Web Audio API + Shadow DOM (v7 rewrite in TypeScript)
- Plugins: Regions, Timeline, Record, Spectrogram, Minimap

**Architecture:**
- TypeScript rewrite (v7)
- Shadow DOM rendering
- Web Audio API backend
- Plugin architecture

**Mobile Compatibility:**
- Documentation doesn't explicitly address mobile
- Uses modern web standards (works across browsers)
- 15.5k projects use it (likely includes mobile apps)

**Integration Potential:**
- **Audio playback UI:** Waveform scrubbing for atom editing
- **Recording:** Record plugin for capturing audio atoms
- **Regions:** Mark sections of audio for editing

**Recommendation:** ADOPT for waveform visualization. Industry standard (10.1k stars, 15.5k users), actively maintained (Dec 2025), BSD license. Perfect for audio atom playback/editing UI.

---

## Collaboration & Streaming

### WebRTC for Audio Collaboration
**Status:** ACTIVE (industry standard, 2025 improvements)
**Confidence:** HIGH

**2025 State:**
- Low-latency: 250-500ms typical, often <250ms
- QUIC transport: MOQ (Media over QUIC) for even lower latency
- AI integration: LLMs powering conversational agents
- Scalability: Transcoding needed for >50 concurrent connections

**Use Cases in 2025:**
- Live chat apps, video conferencing, cloud collaboration
- Live streaming + interactive chats, virtual watch parties
- Sports broadcasting, real-time music collaboration

**Challenges:**
- Peer-to-peer = not scalable for broadcasting (>50 users)
- Network layer issues: packet loss, jitter, bandwidth limits
- NAT traversal, STUN/TURN server requirements

**Integration Potential for EoE:**
- **Multi-device sync:** Stream audio/visual between desktop and mobile
- **Hydra networking:** Hydra already uses WebRTC for visual streaming
- **Live sessions:** Guest collaboration (v2+ feature)

**Recommendation:** ADOPT for multi-device sync in v1.1. Proven technology, Hydra already uses it, fits "work on desktop, stream to mobile" workflow.

---

## SuperCollider & Csound (Advanced Synthesis)

### SuperCollider (scsynth) via SuperSonic
**Repository:** https://github.com/samaaron/supersonic (144 stars)
**Demo:** https://sonic-pi.net/supersonic/demo.html
**Status:** ALPHA (created Oct 2025, v0.36.0 Jan 28, 2026)
**License:** MIT
**Confidence:** MEDIUM

**What it is:**
- SuperCollider's scsynth audio engine in browser
- WebAssembly + AudioWorklet
- Zero config via CDN (unpkg)
- OSC API for live coding integration

**Performance:**
- High-priority audio thread (AudioWorklet)
- SharedArrayBuffer mode (lower latency, requires COOP/COEP headers)
- WebAssembly (C++ compiled to browser)

**Recommendation:** AVOID for v1.1 - created Oct 2025 (3 months old), still alpha. Too new, too risky. Revisit in 2027 when mature.

---

### Csound via WebAssembly
**Main Site:** https://csound.com/wasm/
**Examples:** https://gogins.github.io/csound-examples/
**GitHub:** https://github.com/gogins/csound-wasm
**Status:** ACTIVE (v6.19.0, AudioWorklet support)
**Confidence:** HIGH

**What it is:**
- Csound audio synthesis language in browser
- JavaScript/TypeScript library (WebAudio Csound)
- AudioWorklet for superior performance
- CsoundObj API (high-level, hides Workers/WebAssembly)

**Features:**
- No Csound installation required (runs in browser)
- MIDI players, step sequencers, interactive controls
- Demos include classic music performances
- Integration with Strudel discussed (GitHub issue #270)

**Integration Potential:**
- **Synthesis power:** More advanced than Tone.js for certain algorithms
- **Complexity:** Csound syntax, learning curve
- **Niche use case:** Only needed if Tone.js synthesis insufficient

**Recommendation:** WATCH - powerful but complex. Use Tone.js first, consider Csound only if specific synthesis capabilities needed (FM, granular, etc.). Active in 2025, proven WebAssembly build.

---

## Creative Coding Frameworks

### p5.js
**Main Site:** https://p5js.org/
**GitHub:** https://github.com/processing/p5.js
**Generative Design Examples:** https://github.com/generative-design/Code-Package-p5.js (v1.4.3 May 2025)
**Status:** ACTIVE (v1.11.7 as of May 2025)
**License:** LGPL-2.1 (permissive for libraries)
**Confidence:** HIGH

**What it is:**
- JavaScript library for creative coding
- Processing heritage (Java → JavaScript)
- Focus: accessible to artists, designers, educators, beginners
- HTML5 objects: text, input, video, webcam, sound

**Mobile Compatibility:**
- Supports HTML5 (runs on mobile browsers)
- Touch events supported
- Not specifically mobile-optimized, but functional

**Integration Potential:**
- **Visual atoms:** Generative art sketches
- **Educational content:** Beginner-friendly for tutorials
- **Existing ecosystem:** Tons of examples, books (Generative Design)

**Recommendation:** ADOPT for visual creative coding atoms. Proven, beginner-friendly, active (May 2025 update), large ecosystem. Complements Hydra (Hydra = live coding, p5.js = sketch-based).

---

## Open Source Control Surfaces

### Open Stage Control (OSC/MIDI)
**Original GitHub:** https://github.com/jean-emmanuel/Open-Stage-Control (ARCHIVED Dec 17, 2025)
**New Location:** https://framagit.org/jean-emmanuel/open-stage-control
**Main Site:** https://openstagecontrol.ammd.net/
**Status:** ACTIVE (moved off GitHub, active on Framagit)
**License:** GPL-3.0
**Confidence:** MEDIUM (location change = uncertainty)

**What it is:**
- Libre and modular OSC/MIDI controller
- Multi-touch support (iOS, Android, Windows, macOS, Linux)
- Server-based architecture (Node.js server, browser clients)
- Custom interface design

**GitHub Situation:**
- Archived Dec 17, 2025 with message "Open Stage Control is no longer on Github"
- Moved to Framagit (France-based GitLab instance)
- Smaller ecosystem, harder to track

**Recommendation:** NEUTRAL - powerful tool, but moved off GitHub (fragmentation risk). If OSC/MIDI control surface needed, consider it. But TouchOSC (proprietary) has larger user base. Build custom if mobile-first control surface needed.

---

## Synthesis: Quick Wins vs. Build Custom

### Quick Wins (Adopt These)

| Project | Use Case | Timeline | Risk |
|---------|----------|----------|------|
| **Tone.js** | Audio synthesis | Already using | None (mature) |
| **Tonal.js** | Music theory | v1.1 | None (mature) |
| **React Flow** | Node composition UI | v1.1 | None (mature) |
| **Wavesurfer.js** | Waveform visualization | v1.1 | None (mature) |
| **Meyda** | Audio feature extraction | v1.1 (reactive visuals) | None (stable) |
| **Scribbletune** | MIDI export | v1.1 (DAW bridge) | Low (active) |
| **p5.js** | Visual sketches | v1.1 | None (mature) |

### Consider (Evaluate Before Adopting)

| Project | Use Case | Why Consider | Risk |
|---------|----------|--------------|------|
| **Strudel** | Pattern language | TidalCycles in JS | AGPL license |
| **Hydra** | Visual synthesis | Live coding visuals | AGPL license, desktop UX |
| **WebPd** | Pd patch bridge | Access Pd ecosystem | Alpha status |
| **Csound WASM** | Advanced synthesis | Beyond Tone.js capabilities | Complexity |

### Avoid (Wrong Fit for v1.1)

| Project | Why Avoid |
|---------|-----------|
| **SuperSonic** | Too new (Oct 2025), alpha status |
| **ORCA** | Esoteric, steep learning curve, not mobile-friendly |
| **Cables.gl** | Desktop-oriented, heavy runtime, overkill for simple atoms |
| **Sonic Pi (full)** | No web version, educational focus |
| **TouchOSC** | Proprietary, not open source |
| **Open Stage Control** | Moved off GitHub (uncertainty) |

### Build Custom

| Component | Why Custom | Reference |
|-----------|------------|-----------|
| **Mobile timeline** | No touch-optimized sequencer exists | CapCut/InShot UX patterns |
| **Atom composition layer** | Unique to EoE vision | React Flow for node UI |
| **Multi-device sync** | WebRTC bridge needed | Hydra networking patterns |
| **Short-burst UX** | Mobile-first, 10-15 min workflows | Custom design |

---

## Integration Roadmap for EoE v1.1

### Phase 1: Foundation (Current)
**Status:** v1.0 complete
**Stack:**
- Tone.js (audio synthesis) ✓
- TypeScript + Vite ✓
- Web-based contraptions ✓

### Phase 2: Composition Layer (v1.1 Target)
**Add:**
- **React Flow** - Node-based atom composition
- **Tonal.js** - Music theory (scales, chords, progressions)
- **Wavesurfer.js** - Audio waveform editing
- **Meyda** - Audio-reactive visual coupling

**Build:**
- Mobile timeline UI (custom, touch-optimized)
- Atom composition graph (React Flow-based)
- Multi-device sync (WebRTC bridge)

### Phase 3: Advanced Creation (v1.2+)
**Evaluate:**
- **Strudel pattern engine** (headless, mobile UI) - if AGPL acceptable
- **Hydra visual engine** (embed or fork) - if AGPL acceptable
- **Scribbletune** - MIDI export for DAW post-production
- **p5.js integration** - Visual sketch atoms

**Watch:**
- **Csound WASM** - If advanced synthesis needed
- **Ableton Link** - If desktop DAW sync needed
- **SuperSonic** - Revisit in 2027 when mature

---

## Risk Assessment

### License Compatibility

| License | Projects | Risk | Mitigation |
|---------|----------|------|------------|
| **MIT** | Tone.js, Tonal.js, React Flow, Wavesurfer.js, Meyda, ORCA | NONE | Permissive, commercial-friendly |
| **AGPL-3.0** | Strudel, Hydra | HIGH | Requires open-sourcing derivative work | Use headless or isolate in separate process |
| **GPL-3.0** | Estuary, Open Stage Control | MEDIUM | Copyleft if linked | Avoid or use via API/network boundary |
| **BSD-3-Clause** | Wavesurfer.js | NONE | Permissive with attribution |

### Maintenance Risk

| Project | Last Activity | Risk | Notes |
|---------|---------------|------|-------|
| **Tone.js** | Active (2025+) | NONE | De facto standard |
| **React Flow** | Dec 2025 | NONE | Extremely active (35k stars) |
| **Strudel** | June 2025 | LOW | Moved to Codeberg (smaller ecosystem) |
| **Hydra** | Sept 2025 | NONE | Active community |
| **SuperSonic** | Jan 2026 | HIGH | 3 months old, alpha |
| **Meyda** | April 2024 | LOW | Stable, not rapid development |
| **Scribbletune** | Oct 2025 | LOW | Active org with multiple projects |
| **Wavesurfer.js** | Dec 2025 | NONE | 10.1k stars, 15.5k users |
| **Open Stage Control** | Dec 2025 | MEDIUM | Moved off GitHub |

### Complexity vs. Value

| Project | Complexity | Value for EoE | Verdict |
|---------|------------|---------------|---------|
| **Tone.js** | Medium | Essential | ADOPT |
| **Tonal.js** | Low | High (music theory) | ADOPT |
| **React Flow** | Medium | High (composition UI) | ADOPT |
| **Wavesurfer.js** | Low | High (waveform UI) | ADOPT |
| **Meyda** | Low | Medium (reactive) | ADOPT |
| **Strudel** | High | Medium (patterns) | EVALUATE (AGPL) |
| **Hydra** | High | High (visuals) | EVALUATE (AGPL) |
| **Csound** | Very High | Low (unless needed) | WATCH |
| **SuperSonic** | High | Low (too new) | AVOID |

---

## Mobile-First Gaps & Custom Solutions

### Gap 1: Touch-Optimized Timeline/Sequencer
**Problem:** Existing timeline libs are desktop-oriented (mouse/keyboard)
**Examples:** Mobiscroll (commercial), Nuxt UI (event timeline, not sequencer)
**Solution:** Build custom mobile timeline using:
- Tone.js Transport (timing logic)
- Canvas or SVG (rendering)
- Touch gestures (pan, zoom, tap)
- CapCut/InShot UX patterns (mobile video editor reference)

### Gap 2: Mobile Live Coding UI
**Problem:** Strudel, Hydra require keyboard (code editing)
**Solution:** Hybrid approach:
- Desktop: Full code editor (Strudel/Hydra)
- Mobile: Parameter control surface (OSC/MIDI style)
- WebRTC: Stream desktop output to mobile
- OR: Build mobile-friendly pattern builder (visual, not text)

### Gap 3: Multi-Device Atom Sync
**Problem:** No turnkey solution for syncing atoms across devices
**Solution:** Custom sync layer:
- WebRTC (real-time) OR WebSocket (server-based)
- Atom version control (local git, sync to server)
- Conflict resolution (last-write-wins or manual merge)
- Reference: Hydra's WebRTC networking

### Gap 4: Short-Burst Workflow UX
**Problem:** Most creative coding tools assume long sessions
**Solution:** Custom state management:
- Auto-save every N seconds
- Resume from exact state (transport position, code, parameters)
- Bookmark system (quick return to specific states)
- "10-minute atom" templates (scaffolding for quick start)

---

## Technology Decisions for v1.1

### Confirmed Stack

| Category | Technology | Version | Rationale |
|----------|------------|---------|-----------|
| **Audio** | Tone.js | Latest stable | De facto standard, comprehensive, mobile-ready |
| **Music Theory** | Tonal.js | Latest | 4.1k stars, functional, comprehensive |
| **Node Editor** | React Flow | 12.x | 35k stars, mobile-ready, MIT, Dec 2025 active |
| **Waveform** | Wavesurfer.js | 7.x | 10.1k stars, 15.5k users, Dec 2025 active |
| **Audio Analysis** | Meyda | 5.6.3+ | Stable, reactive visuals, MIT |
| **Visual Coding** | p5.js | 1.11.7+ | Beginner-friendly, ecosystem, active May 2025 |

### Evaluate for v1.1

| Technology | Use Case | Decision Point |
|------------|----------|----------------|
| **Strudel** | Pattern language | AGPL acceptable? Desktop-only OK? |
| **Hydra** | Visual synthesis | AGPL acceptable? Desktop-only OK? |
| **Scribbletune** | MIDI export | Need DAW bridge workflow? |
| **WebPd** | Pd patches | Need Pd ecosystem access? Alpha risk OK? |

### Defer to v1.2+

| Technology | Reason to Defer |
|------------|-----------------|
| **Csound WASM** | Complex, only if Tone.js insufficient |
| **Ableton Link** | Desktop DAW sync (v2+ feature: streaming) |
| **SuperSonic** | Too new (Oct 2025), alpha status |
| **Cables.gl** | 3D/advanced visuals (v2+ feature) |

---

## Confidence Assessment

| Research Area | Confidence | Notes |
|---------------|------------|-------|
| **Live Coding Systems** | HIGH | Verified Strudel, Hydra, ORCA repos + activity |
| **Audio Synthesis** | HIGH | Tone.js confirmed best-in-class, alternatives reviewed |
| **Music Theory** | HIGH | Tonal.js clear winner (4.1k stars, 1,600+ dependents) |
| **Node Editors** | HIGH | React Flow verified (35k stars, Dec 2025 release) |
| **Waveform Viz** | HIGH | Wavesurfer.js verified (10.1k stars, Dec 2025 release) |
| **Mobile Timeline** | HIGH | Confirmed gap exists, must build custom |
| **WebRTC Collab** | HIGH | 2025 standards confirmed, Hydra uses it |
| **Licenses** | MEDIUM | AGPL flagged (Strudel, Hydra), requires decision |
| **Mobile Readiness** | MEDIUM | Most tools desktop-first, hybrid approach needed |

---

## Sources

### Live Coding Systems
- [Strudel (Codeberg)](https://codeberg.org/uzu/strudel)
- [Strudel GitHub (archived)](https://github.com/tidalcycles/strudel)
- [Strudel REPL](https://strudel.cc/)
- [Live Coding Techno With Strudel | Hackaday](https://hackaday.com/2025/10/16/live-coding-techno-with-strudel/)
- [Exploring Sound and Music with Strudel and Tone.js | UT Austin](https://calendar.utexas.edu/event/exploring-sound-and-music-in-browser-based-code-strudel-and-tonejs)
- [Hydra GitHub](https://github.com/hydra-synth/hydra)
- [Hydra](https://hydra.ojack.xyz/)
- [ORCA GitHub](https://github.com/hundredrabbits/Orca)
- [Sonic Pi](https://sonic-pi.net/)
- [SuperSonic GitHub](https://github.com/samaaron/supersonic)
- [SuperSonic Demo](https://sonic-pi.net/supersonic/demo.html)
- [Estuary GitHub](https://github.com/dktr0/estuary)
- [Estuary Live](https://estuary.mcmaster.ca)

### Visual Composition
- [Cables.gl](https://cables.gl/)
- [Cables June 2025 Release](https://blog.cables.gl/2025/06/17/june-2025-release/)
- [WebPd GitHub](https://github.com/sebpiq/WebPd)
- [pd4web](https://charlesneimog.github.io/pd4web/)

### Audio Synthesis & Music Theory
- [Tone.js](https://tonejs.github.io/)
- [Tonal.js GitHub](https://github.com/tonaljs/tonal)
- [Meyda GitHub](https://github.com/meyda/meyda)
- [Meyda](https://meyda.js.org/)
- [Scribbletune GitHub](https://github.com/scribbletune/scribbletune)
- [Scribbletune](https://scribbletune.com/)
- [Teoria.js GitHub](https://github.com/saebekassebil/teoria)

### Node Editors & UI
- [React Flow / xyflow GitHub](https://github.com/xyflow/xyflow)
- [React Flow](https://reactflow.dev)
- [Svelte Flow](https://svelteflow.dev/)
- [Rete.js GitHub](https://github.com/retejs/rete)
- [Rete.js](https://retejs.org/)

### Audio Visualization
- [Wavesurfer.js GitHub](https://github.com/katspaugh/wavesurfer.js)
- [Wavesurfer.js](https://wavesurfer.xyz/)

### Collaboration & Streaming
- [Ableton Link Docs](https://ableton.github.io/link/)
- [WebRTC Low Latency Guide 2025 | VideoSDK](https://www.videosdk.live/developer-hub/webrtc/webrtc-low-latency)

### Advanced Synthesis
- [Csound WebAssembly](https://csound.com/wasm/)
- [Csound Examples](https://gogins.github.io/csound-examples/)

### Creative Coding
- [p5.js](https://p5js.org/)
- [Generative Design Code Package](https://github.com/generative-design/Code-Package-p5.js)

### Control Surfaces
- [Open Stage Control (Framagit)](https://framagit.org/jean-emmanuel/open-stage-control)
- [Open Stage Control](https://openstagecontrol.ammd.net/)

### Mobile & PWA
- [Leading Mobile Music Creation Tools 2025 | StoryLab](https://storylab.ai/leading-mobile-music-creation-tools/)
- [Progressive Web Apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

*Research completed: 2026-01-31*
*Confidence: HIGH overall (verified GitHub repos, 2025-2026 activity confirmed)*
*License review: AGPL flagged for Strudel and Hydra (requires decision)*
*Mobile gaps: Confirmed - must build custom timeline, hybrid desktop-mobile UX*
