# Mobile Visual Modular Composition Research

**Domain:** Visual modular interfaces for combining creative coding atoms (p5.js + Tone.js)
**Platform path:** PWA first, Android native later
**Researched:** 2026-01-31
**Overall confidence:** MEDIUM

## Executive Summary

The landscape for mobile visual modular composition is **fragmented but promising**. Desktop tools like Cables.gl, Rete.js, and NoiseCraft offer sophisticated visual programming, but mobile support ranges from "works with compromises" to "explicitly unsupported." The most proven mobile pattern is **React Flow** with touch-optimized interactions, while **Android native apps** like Hexen and ModSynth demonstrate that modular synthesis works well on mobile when built touch-first.

**Key insight:** Don't port desktop node editors to mobile. Build mobile-first composition tools that start simple (parameter routing) and grow progressively. Think TouchOSC's parameter control + p5.touchgui's mobile-friendly widgets + React Flow's tap-to-connect pattern.

**Critical gap:** No proven web-based tool currently combines visual sketches + audio synthesis on mobile. This is an **open opportunity** for EoE v1.1.

## What's Proven on Mobile

### Desktop Visual Programming Tools (Limited Mobile Support)

| Tool | Mobile Status | Why It Matters |
|------|---------------|----------------|
| **Cables.gl** | Works in browser, but one user reported "doesn't work on mobile" | Open source (MIT), powerful WebGL/creative focus, but not mobile-optimized |
| **NoiseCraft** | Explicitly unsupported ("mobile support is currently lacking") | Browser-based audio-visual synthesis, designed for desktop+keyboard |
| **Rete.js** | No explicit mobile documentation found | TypeScript-first framework for node editors, unclear touch support |
| **Blockly** | Official mobile demos, Android/iOS SDKs | Block-based (not node-based), proven touch interaction patterns |

**Verdict:** Desktop visual programming tools treat mobile as afterthought. Cables.gl and NoiseCraft are inspirational but not mobile-realistic.

**Sources:**
- [WebGL visual programming editor cables.gl is now open source](https://news.ycombinator.com/item?id=41162036)
- [NoiseCraft: Browser-Based Visual Programming Language for Sound & Music](https://pointersgonewild.com/2021/12/05/noisecraft-a-browser-based-visual-programming-language-for-sound-music/)
- [Blockly mobile demos](https://github.com/google/blockly/tree/master/demos/mobile)
- [Rete.js - JavaScript framework for visual programming](https://retejs.org/)

### React Flow: Most Proven Touch-First Node Editor

**React Flow v11.5** (recent 2026) delivers the best mobile experience for web-based node editors:

**Touch interaction pattern:**
- **Tap-to-connect:** Tap two handles sequentially to connect nodes (no drag required)
- **Enlarged handles:** 20px touch targets (vs typical 8-10px for mouse)
- **Visual feedback:** Bounce animation during connection attempts
- **Virtualization:** Only render visible nodes (critical for mobile performance)

**Performance optimizations:**
- React.memo() for custom nodes prevents re-renders
- `onlyRenderVisibleElements` property for viewport culling
- Built-in support for touch panning/zooming

**Example:** [React Flow Touch Device Demo](https://reactflow.dev/examples/interaction/touch-device)

**Verdict:** React Flow is the **reference implementation** for touch-friendly node composition. Use this pattern for v1.1.

**Sources:**
- [React Flow Touch Device Support](https://reactflow.dev/examples/interaction/touch-device)
- [React Flow v11.5 Release - improved touch device usability](https://xyflow.com/blog/react-flow-v-11-5)
- [React Flow Performance Documentation](https://reactflow.dev/learn/advanced-use/performance)

### Mobile-Native Creative Tools (What Works)

Android native modular synthesis apps prove that complex visual composition works on phones:

| App | What It Does Well | Touch Patterns |
|-----|-------------------|----------------|
| **Hexen** | 50+ modules, eurorack-style patching | Tap-and-drag to connect, all modules in free version |
| **ModSynth** | Polyphonic modular synth builder | Graphical editor for module connection |
| **TouchOSC** | MIDI/OSC parameter control for DAWs/VJs | Custom layouts with buttons/faders/knobs |
| **p5.touchgui** | GUI widgets for p5.js sketches | Buttons, sliders, crossfaders with multi-touch |

**Verdict:** When built touch-first, modular composition works great on 6" screens. The pattern: **large touch targets + direct manipulation + sequential actions (tap-tap) instead of complex gestures.**

**Sources:**
- [Hexen - Modular Synthesizer on Google Play](https://play.google.com/store/apps/details?id=com.silicondroid.hexen&hl=en)
- [ModSynth Modular Synthesizer on Google Play](https://play.google.com/store/apps/details?id=com.gallantrealm.modsynth&hl=en_US)
- [TouchOSC Wireless Control](https://www.linkedin.com/pulse/touchosc-wireless-control-john-pistotti)
- [p5.touchgui GitHub](https://github.com/L05/p5.touchgui)

## What Works for Atom Composition Specifically

### Parameter Routing Examples

**TouchOSC model:** Map parameters (sliders, knobs) to control remote software via MIDI/OSC
- Works wirelessly across devices
- Custom layouts saved and shared
- Controls audio (Ableton, Logic) and visual (Resolume, VDMX) software

**p5.touchgui model:** Embed GUI widgets directly in p5.js sketches
- Buttons, sliders (horizontal/vertical), toggles, crossfaders
- Multi-touch + mouse support
- Quick iteration, minimal code

**Practical pattern for EoE:**
1. Each atom exposes parameters (e.g., visual: hue, speed; audio: filter cutoff, reverb)
2. Composition interface shows parameter mappings visually (node graph or simpler list)
3. User connects audio FFT → visual speed, MIDI note → hue shift, etc.

**Start simple:** List-based parameter routing (dropdown menus) before full node graph. Example:

```
Audio Atom: "Drone Synth"
  ↓ FFT Low →
Visual Atom: "Circle Swarm"
  Parameter: circleSize (0-100)
```

### Timeline/Sequencing Examples

**Web-based timeline editors:**
- **IMG.LY Timeline Editor** (Vanilla JS, React, Vue): Video clips on top track, audio strips below
- **Beet.js**: Polyrhythmic sequencer library for Web Audio API
- **Vezér**: MIDI/OSC/DMX timeline sequencer for audiovisual work (desktop, but shows pattern)

**Key pattern:** Horizontal timeline with:
- Multiple tracks (visual layers, audio tracks)
- Scrubbing support (audio playback while dragging)
- Audio sync functionality (visual timing locked to audio beats)

**Motion UI Trends 2026:** Audio + haptics synchronized with visual motion for multisensory mobile experiences.

**Practical pattern for EoE:**
- Start with simple sequencing: "Play visual atom for 10s, switch to next"
- Grow to multi-track: Visual layer 1 + Visual layer 2 + Audio composition
- Eventually: Beat-synced transitions (visual changes on audio kicks/snares)

**Sources:**
- [IMG.LY Video and Audio Timeline Editor](https://img.ly/docs/cesdk/js/create-video/timeline-editor-912252/)
- [Beet.js: Polyrhythmic sequencer library for Web Audio API](https://www.awwwards.com/inspiration/beet-js-polyrhythmic-sequencer-library-for-web-audio-api)
- [Motion UI Trends 2026](https://lomatechnology.com/blog/motion-ui-trends-2026/2911)

### Audio-Visual Coupling Examples

**FFT Analysis → Visual Mapping:**
- **audioMotion-analyzer:** High-resolution real-time spectrum analyzer (JavaScript, no dependencies, works mobile)
- **p5.js music visualization examples:** FFT data drives visual sketch parameters
- **Audio Reactive Visuals:** Platforms link video effect parameters to audio rhythm/frequencies via FFT, beat detection

**Effective mapping patterns (from research):**
- **Louder = bigger:** Volume → visual scale
- **Higher pitch = higher position:** Frequency → Y-axis position
- **More complex sound = more complex visuals:** Spectral complexity → particle count

**FFT technical details:**
- FFT size: Power of 2 (32-32768), larger = more frequency detail, less time detail
- Smoothing: Controls response speed to audio changes
- Frequency bands: Bass (20-250Hz), midrange (250-2000Hz), treble (2000-20000Hz)

**Practical pattern for EoE:**
1. Audio atom runs Tone.js composition, outputs FFT analysis
2. Visual atom receives FFT data via parameter routing
3. Mapping UI shows: "Bass energy (0-250Hz) → circle size" with preview

**Sources:**
- [audioMotion-analyzer GitHub](https://github.com/hvianna/audioMotion-analyzer)
- [Visualizing Music with p5.js](https://therewasaguy.github.io/p5-music-viz/)
- [Audio Analysis Techniques for Music Visualization](https://audioreactivevisuals.com/audio-analysis.html)
- [Making Audio Reactive Visuals with FFT](https://sangarshanan.com/2024/11/05/visualising-music/)

## Android Native Precedents

### Creative Apps Doing Visual Composition

**Modular synthesis pattern:**
- **Hexen:** 50+ eurorack modules, tap-drag to patch, visual cable routing
- **ModSynth:** Graphical module editor, polyphonic, paid upgrades unlock more modules
- **SunVox:** Pattern-based sequencer + modular interface, cross-platform (Android/iOS/desktop sync)

**Lessons for native Android path:**
- **Custom View + Canvas API:** All use Android Canvas for drawing modules/cables
- **Touch gesture handling:** onTouchEvent() with multi-touch support for pan/zoom/connect
- **Performance:** Native rendering significantly faster than web for complex graphs (hundreds of nodes)

**When to go native:**
- 100+ nodes in composition (web virtualization maxes out)
- Real-time audio with <10ms latency requirements (Web Audio buffer size limitations)
- Advanced gestures (pinch-zoom-rotate simultaneously, pressure sensitivity)

### Jetpack Compose for Node Editors (2026)

**Compose Canvas API capabilities:**
- Draw shapes, lines, text
- Apply transformations, gradients, blending modes
- Handle touch events for drag/drop/gestures
- GPU-accelerated rendering

**Compose Multiplatform 1.10.0** (January 2026): Unified `@Preview`, Navigation 3, stable hot reload

**Pattern for migration:**
1. Build React Flow prototype in PWA
2. Port to Compose Multiplatform (shares Web + Android codebase)
3. Android-specific optimizations (native Canvas performance, offline audio)

**Challenge:** No existing Compose node editor libraries found in research. Would need custom implementation.

**Sources:**
- [Jetpack Compose Canvas API](https://otsembo.hashnode.dev/compose-canvas-api)
- [Canvas API in Android Jetpack Compose - GeeksforGeeks](https://www.geeksforgeeks.org/kotlin/canvas-api-in-android-jetpack-compose/)
- [Compose Multiplatform 1.10.0 Release](https://blog.jetbrains.com/kotlin/2026/01/compose-multiplatform-1-10-0/)

### What Native Unlocks vs. PWA

| Capability | PWA | Android Native |
|------------|-----|----------------|
| Works offline | Yes (Service Worker) | Yes (no browser dependency) |
| Install friction | None (just a URL) | App store approval, download |
| Touch performance | Good (React Flow 60fps) | Excellent (native Canvas) |
| Audio latency | ~20-50ms (Web Audio) | ~10ms (OpenSL ES / AAudio) |
| File system access | Limited (File System API) | Full access |
| Complex gestures | Basic multi-touch | Advanced (pressure, tilt, etc.) |
| Node count ceiling | ~100-200 (virtualization) | ~1000+ (native rendering) |
| Cross-platform | Works everywhere | Android only (unless Compose Multiplatform) |

**Migration path:**
1. **v1.1 (PWA):** React Flow-based composition, parameter routing, simple sequencing
2. **v1.2 (PWA refined):** Add timeline, FFT coupling, mobile performance tuning
3. **v2.0 (Native option):** Kotlin + Jetpack Compose for users wanting offline/advanced features

**Sources:**
- [PWA performance constraints - HashStudioz](https://www.hashstudioz.com/blog/why-do-some-pwas-feel-slower-than-native-apps-solving-performance-bottlenecks/)
- [Web Audio API performance debugging notes](https://padenot.github.io/web-audio-perf/)
- [Android touch handling tutorial - Vogella](https://www.vogella.com/tutorials/AndroidTouch/article.html)

## Touch Interaction Patterns

### What Gestures Work Well for Composition

**Proven patterns from research:**

| Gesture | Use Case | Example |
|---------|----------|---------|
| **Tap (single)** | Select node, toggle parameter | React Flow node selection |
| **Tap-tap (sequential)** | Connect nodes | React Flow: tap output handle, tap input handle |
| **Tap-and-hold** | Context menu, delete | Long press → "Delete node" |
| **Drag (single finger)** | Pan viewport, move node | Standard viewport navigation |
| **Pinch (two fingers)** | Zoom viewport | React Flow supports natively |
| **Swipe** | Switch between modes/screens | Next atom in timeline |

**Anti-patterns (don't work well on mobile):**
- ❌ Drag-to-connect (conflicts with pan gesture)
- ❌ Hover interactions (no hover on touch)
- ❌ Right-click menus (no right-click on touch)
- ❌ Small touch targets (<44x44px)
- ❌ Complex multi-step gestures

**Design guidelines:**
- **Minimum touch target:** 44x44px (Apple) or 48x48dp (Material Design)
- **Gesture vocabulary:** Keep to 3-4 core gestures maximum
- **Visual affordances:** Show connection points clearly (enlarged handles, color coding)
- **Immediate feedback:** Bounce animations, haptic vibrations, color changes

**Sources:**
- [Mobile touch interaction design patterns - MDPI](https://www.mdpi.com/2078-2489/13/5/236)
- [Material Design - Gestures](https://m2.material.io/design/interaction/gestures.html)
- [How to Design for Touch Interactions in Mobile-First Design](https://blog.pixelfreestudio.com/how-to-design-for-touch-interactions-in-mobile-first-design/)

### Screen Size Tradeoffs

**6" phone (1080x2400 portrait):**
- ✅ **Works:** Parameter lists, simple 2-3 node compositions, timeline scrubbing
- ⚠️ **Challenging:** Complex node graphs (6-10+ nodes), detailed waveform editing
- ❌ **Doesn't work:** Full modular patch bays (50+ modules like desktop)

**10" tablet (landscape):**
- ✅ **Works:** Everything phone does + larger node graphs (10-20 nodes)
- ✅ **Sweet spot:** Composition interface (left: atoms library, center: canvas, right: parameters)

**Responsive strategies:**
1. **Phone:** Fullscreen canvas, swipe to switch between library/canvas/parameters views
2. **Tablet:** Split-screen layout, all views visible simultaneously
3. **Desktop:** Multi-panel workbench (like Cables.gl)

**Progressive disclosure:**
- Start: Show only 2-3 atoms on screen, simple connections
- Grow: Reveal more complex routing as user builds composition
- Advanced: Full node graph for power users on tablets/desktops

### Keyboard-Free Workflows

**Critical for mobile-first design:** No text input required for core composition.

**Proven alternatives:**
1. **Voice input:** Name atoms with speech-to-text (Android native, Web Speech API in PWA)
2. **Visual selection:** Choose from preset library (grid of thumbnails)
3. **Sliders for numeric input:** No typing numbers, drag slider instead
4. **Preset buttons:** Common values as one-tap buttons (e.g., "50%", "75%", "100%")

**When keyboard IS available (Bluetooth keyboard + phone):**
- Shortcut keys for common actions (spacebar = play/pause)
- Arrow keys for nudging values
- Number keys for selecting atoms 1-9

**Example keyboard-free workflow:**
1. Tap "+" button → Atom library grid appears
2. Tap visual atom thumbnail → Atom added to canvas
3. Tap-tap to connect to existing audio atom
4. Tap parameter (e.g., "Hue") → Slider appears
5. Drag slider to adjust hue (0-360°)
6. Tap play button → Composition runs

**Sources:**
- [Vibe coding - natural language app development](https://newuserapprove.com/top-vibe-coding-tools-for-mobile-apps/)
- [Mobile design innovations 2026](https://uidesignz.com/blogs/mobile-apps-design-innovations)

## Prototypes Worth Building

### MVP Visual Modular for v1.1

**Minimal viable composition tool for mobile:**

**Components:**
1. **Atom library panel:** Grid of atom thumbnails (visual + audio)
2. **Composition canvas:** 2-4 atoms placed on canvas (React Flow nodes)
3. **Parameter routing panel:** List-based connections (not node graph yet)
4. **Play/preview button:** Run composition, see live result

**Interactions:**
1. Tap atom thumbnail → Add to canvas
2. Tap atom on canvas → Show parameters
3. Tap "Route parameter" → Choose source atom + parameter + target atom + parameter
4. Tap play → Composition executes

**Why this first:**
- ✅ Works on 6" phone without complex gestures
- ✅ No keyboard required
- ✅ Builds on existing EoE atoms (p5.js + Tone.js)
- ✅ Can be built in 2-3 sprints with React Flow

**What's deferred to v1.2+:**
- Timeline sequencing (use single-shot playback first)
- Visual node graph for routing (list is simpler)
- Complex FFT mappings (start with simple volume → size)

### Quick Prototypes (1-2 weeks each)

**Prototype A: Parameter Routing List**
- UI: Dropdown menus for source/target selection
- Tech: React state management, prop passing
- Complexity: **Low** (weekend prototype)

**Prototype B: React Flow Canvas with Atoms**
- UI: Tap-to-add atoms, tap-tap-to-connect
- Tech: React Flow + custom atom node components
- Complexity: **Medium** (1 week)

**Prototype C: FFT Coupling Proof-of-Concept**
- UI: One audio atom + one visual atom, live FFT data flow
- Tech: Tone.js Analyser → p5.js sketch parameter
- Complexity: **Medium** (1 week)

**Prototype D: Timeline Sequencer**
- UI: Horizontal timeline, atoms as clips, scrubbing
- Tech: Custom React component or IMG.LY library
- Complexity: **High** (2 weeks)

**Recommendation:** Build A → B → C → D in sequence. A validates concept, B proves mobile interaction, C demonstrates audio-visual magic, D enables complex compositions.

### What's Complex (Don't Build for v1.1)

**High complexity, defer to later:**
- ❌ Full node-based programming (like NoiseCraft)
- ❌ Custom atom creation on mobile (code editor on phone is painful)
- ❌ Advanced audio DSP (convolution reverb, HRTF panning)
- ❌ Real-time collaboration (multi-user composition)
- ❌ 3D visual atoms (Three.js on mobile is heavy)

**Why defer:**
- Mobile performance ceiling (Web Audio API limitations)
- Touch interaction complexity (coding on phone is anti-pattern)
- EoE atoms already created on desktop (mobile is for composition, not atom creation)

## Web vs. Native Tradeoff

### What PWA Can Do Now (v1.1-v1.2)

**Capabilities:**
- ✅ React Flow node composition (proven 60fps on mobile)
- ✅ Web Audio API synthesis (Tone.js works well)
- ✅ Canvas rendering for p5.js (hardware-accelerated)
- ✅ Touch gesture handling (tap, drag, pinch, swipe)
- ✅ Offline mode (Service Worker caches atoms)
- ✅ Works on iPhone + Android without app stores

**Performance ceiling:**
- ~100-200 nodes before virtualization struggles
- ~20-50ms audio latency (acceptable for most creative work)
- 60fps canvas animations (with optimization)
- ~5-10 simultaneous audio sources (Web Audio limitation)

**PWA strengths:**
- Zero install friction (just a URL)
- Instant updates (no app store approval)
- Cross-platform (iOS + Android + desktop)
- Shareable compositions (send URL to friend)

**Sources:**
- [PWA performance solving bottlenecks](https://www.hashstudioz.com/blog/why-do-some-pwas-feel-slower-than-native-apps-solving-performance-bottlenecks/)
- [60fps on mobile web - Flipboard Engineering](https://engineering.flipboard.com/2015/02/mobile-web)
- [Web Audio API performance tips](https://blog.mi.hdm-stuttgart.de/index.php/2021/02/24/web-audio-api-tips-for-performance/)

### What Android Native Would Unlock (v2.0+)

**Capabilities beyond PWA:**
- 🚀 ~10ms audio latency (AAudio/OpenSL ES)
- 🚀 1000+ nodes (native Canvas rendering)
- 🚀 Full file system access (import/export atoms)
- 🚀 Advanced gestures (pressure sensitivity, stylus support)
- 🚀 Background audio (composition plays while app backgrounded)
- 🚀 Offline-first by default (no browser dependency)

**Native weaknesses:**
- ❌ App store friction (Google Play approval, updates)
- ❌ Android-only (unless Compose Multiplatform)
- ❌ Larger APK size (embedded audio engine, libraries)
- ❌ Development complexity (Kotlin + JNI for audio)

**When to go native:**
- User has >50 atoms in library (PWA feels sluggish)
- User needs <10ms audio latency (live performance)
- User wants offline-first with no browser (subway commute)

**Sources:**
- [Web Audio API limitations on mobile](https://padenot.github.io/web-audio-perf/)
- [Android canvas touch tutorial](https://www.vogella.com/tutorials/AndroidTouch/article.html)
- [Jetpack Compose Canvas API](https://otsembo.hashnode.dev/compose-canvas-api)

### Migration Path from PWA to Kotlin

**Phase 1: PWA (v1.1-v1.2)**
- Build composition interface in React + React Flow
- Validate touch interactions on real devices
- Ship to users, gather feedback on performance ceiling

**Phase 2: PWA + Native Bridge (v1.3)**
- Build "Export to Native" feature (download Kotlin starter project)
- User opens project in Android Studio, builds APK
- Serves advanced users without forcing all users to native

**Phase 3: Compose Multiplatform (v2.0)**
- Rewrite composition engine in Kotlin Multiplatform
- Share codebase between web (Wasm) and Android (native)
- Web users get faster engine, Android users get native benefits

**Phase 4: Native-First (v2.1+)**
- Android app becomes primary platform for power users
- PWA remains for casual users and cross-platform access
- Sync layer keeps compositions synced across web + native

**Technology stack for native:**
- **UI:** Jetpack Compose (Canvas API for node graph)
- **Audio:** Oboe library (AAudio wrapper with fallback to OpenSL ES)
- **Data:** Room database (atom library), Kotlin serialization (composition format)
- **Sync:** Firebase Firestore or custom backend (Linux server available per PROJECT.md)

**Estimated timeline:**
- Phase 1: 2-3 months (v1.1-v1.2)
- Phase 2: 1 month (v1.3)
- Phase 3: 3-4 months (v2.0, significant rewrite)
- Phase 4: Ongoing evolution

**Sources:**
- [Compose Multiplatform 1.10.0](https://blog.jetbrains.com/kotlin/2026/01/compose-multiplatform-1-10-0/)
- [Android custom views tutorial](https://www.vogella.com/tutorials/AndroidCustomViews/article.html)

## Confidence & Unknowns

### Confidence Levels by Area

| Area | Confidence | Reason |
|------|------------|--------|
| React Flow for PWA | **HIGH** | Official touch demos, v11.5 improvements, active development |
| Mobile touch patterns | **HIGH** | React Flow + Material Design guidelines + real app examples |
| Web Audio API performance | **MEDIUM** | Documented limitations, but Tone.js mitigates many issues |
| p5.js mobile performance | **MEDIUM** | Hardware-accelerated canvas works, but FPS depends on sketch complexity |
| Native Android path | **MEDIUM** | Jetpack Compose is mature, but no existing node editor libraries |
| Timeline sequencing | **LOW** | IMG.LY library exists but mobile performance unclear |
| FFT coupling robustness | **LOW** | Proof-of-concepts exist, but production-ready mobile implementation unknown |

### Known Unknowns (Need Validation)

**Technical unknowns:**
1. **How many p5.js + Tone.js atoms can run simultaneously on mid-range Android phone?**
   - Hypothesis: 2-3 visual + 2-3 audio without frame drops
   - Validation: Build prototype, test on Pixel 6a / Samsung Galaxy A54

2. **Does React Flow virtualization work well with <10 nodes on small screens?**
   - Hypothesis: Virtualization overhead may hurt more than help for simple compositions
   - Validation: A/B test with virtualization on/off

3. **Can Web Audio API handle real-time FFT analysis + synthesis on mobile without glitches?**
   - Hypothesis: Yes with buffer size tuning (256 or 512 samples)
   - Validation: Prototype C + real device testing

4. **Is tap-tap connection intuitive for non-technical users?**
   - Hypothesis: Yes with onboarding tutorial
   - Validation: User testing with 5-10 people unfamiliar with node editors

**UX unknowns:**
1. **What's the cognitive ceiling for compositions on 6" screen?**
   - Hypothesis: 3-5 atoms feels manageable, 10+ feels overwhelming
   - Validation: Prototype + user testing

2. **Do users want to compose on mobile, or just view/tweak existing compositions?**
   - Hypothesis: View/tweak is primary use case, creation is secondary
   - Validation: User interviews (ask about mobile workflow vs. desktop workflow)

3. **Is list-based parameter routing sufficient, or do users need visual node graph?**
   - Hypothesis: List is sufficient for <5 connections, graph needed for 10+
   - Validation: Build both, A/B test

### Research Gaps (Needs Phase-Specific Investigation)

**For v1.1 (parameter routing MVP):**
- [ ] Benchmark React Flow with 5-10 custom atom nodes on Pixel 6a
- [ ] Profile p5.js sketch + Tone.js synth running simultaneously (FPS, memory)
- [ ] User test: Can non-coders understand "Route FFT bass → circle size"?

**For v1.2 (timeline sequencing):**
- [ ] Evaluate IMG.LY timeline library mobile performance
- [ ] Research alternative timeline libraries (custom React component vs. library)
- [ ] UX pattern: How do mobile video editors (InShot, CapCut) handle timeline on small screens?

**For v2.0 (native Android):**
- [ ] Prototype Jetpack Compose Canvas-based node editor (technical spike)
- [ ] Benchmark Oboe audio latency vs. Web Audio API
- [ ] Cost-benefit analysis: Development time vs. user value of native app

## Recommendation: Start Simple, Grow Progressive

### v1.1 MVP: Parameter Routing + React Flow Canvas

**What to build:**
1. Atom library grid (thumbnails of existing p5.js + Tone.js atoms)
2. React Flow canvas with 3-5 atom slots
3. Parameter routing list (dropdown-based, not node graph)
4. Play button → Composition runs in fullscreen

**Success criteria:**
- User can add 2 atoms (1 visual, 1 audio) on phone in <2 minutes
- User can route 1 parameter (e.g., volume → size) in <1 minute
- Composition plays at 60fps on mid-range Android phone
- Zero keyboard input required

**Timeline:** 2-3 sprints (4-6 weeks)

**Why this first:** Proves mobile composition viability with minimal complexity. If this doesn't work, node graph won't save it.

### v1.2: Visual Node Graph + FFT Coupling

**What to add:**
1. Replace parameter routing list with React Flow node graph
2. Add FFT analysis node (outputs bass/mid/treble energy)
3. Add preset mappings ("Audio reactive visual" one-click setup)

**Success criteria:**
- User can create 5-connection node graph on phone
- FFT data drives visual parameters without audio glitches
- Tap-tap connection feels intuitive

**Timeline:** 2-3 sprints (4-6 weeks)

### v1.3: Timeline Sequencing

**What to add:**
1. Horizontal timeline with atom clips
2. Scrubbing support (preview at any time point)
3. Clip trimming (start/end time for each atom)

**Success criteria:**
- User can sequence 3-5 atoms in 20-second composition
- Timeline scrubbing responds <100ms on phone
- Export composition as video file

**Timeline:** 3-4 sprints (6-8 weeks)

### v2.0: Android Native (Optional)

**What to rebuild:**
- Composition engine in Kotlin + Jetpack Compose
- Audio engine with Oboe (low-latency)
- Offline-first storage with Room

**Success criteria:**
- Audio latency <10ms
- 50+ atoms in library load instantly
- Works in airplane mode (subway commute workflow)

**Timeline:** 3-4 months (significant rewrite)

**Decision point:** Ship v2.0 only if v1.x users request native features. Don't build native speculatively.

---

## Sources Summary

**High confidence sources (official documentation, proven libraries):**
- [React Flow official documentation](https://reactflow.dev)
- [Tone.js performance wiki](https://github.com/Tonejs/Tone.js/wiki/Performance)
- [Material Design touch guidelines](https://m2.material.io/design/interaction/gestures.html)
- [p5.touchgui GitHub](https://github.com/L05/p5.touchgui)
- [Jetpack Compose Canvas API](https://developer.android.com/develop/ui/compose/graphics)

**Medium confidence sources (community tools, recent articles):**
- [Cables.gl open source announcement](https://news.ycombinator.com/item?id=41162036)
- [NoiseCraft browser-based modular synth](https://pointersgonewild.com/2021/12/05/noisecraft-a-browser-based-visual-programming-language-for-sound-music/)
- [audioMotion-analyzer GitHub](https://github.com/hvianna/audioMotion-analyzer)
- [Hexen modular synthesizer on Google Play](https://play.google.com/store/apps/details?id=com.silicondroid.hexen&hl=en)

**Low confidence sources (requires validation):**
- WebSearch results about IMG.LY timeline editor mobile performance (no specific mobile benchmarks found)
- Assumptions about React Flow virtualization with <10 nodes (needs testing)
- Hypothesis about user preference for list vs. node graph (needs user research)

---

**Ready for roadmap creation.** Research provides sufficient context for v1.1 MVP scoping and v2.0 native decision point.
