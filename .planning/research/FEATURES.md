# Research: Features for v1.1 (Mobile + LLM Workflows)

**Research Date:** 2026-01-31
**Milestone Context:** v1.1 milestone adds mobile creation, LLM variation generation, and multi-device sync to v1.0
**v1.0 Foundation:** Visual atoms (p5.js), audio atoms (Tone.js), video capture, manual YouTube publishing
**Confidence:** MEDIUM (mobile realities verified, LLM patterns emerging, sync established practice)

---

## Executive Summary

This research examines the **HARD PARTS** of mobile creative coding and LLM-assisted variation workflows. The findings reveal that **mobile isn't desktop-lite** — it's a fundamentally different creative mode focused on ideation, exploration, and curation rather than full code editing. LLM variations must be **concrete and actionable** (not vague "AI assistance"), and multi-device sync requires **clear boundaries** about what syncs, what doesn't, and how conflicts resolve.

**Key Reality Check:** p5.js sketches CAN run on mobile browsers but with **significant performance constraints** (30 FPS max, canvas size matters). Mobile workflow is NOT "write full code on phone" but rather "capture ideas, explore variations, review results" with desktop as the refinement environment.

**Strategic Direction for v1.1:**
- Mobile = ideation + variation exploration + quick parameter tweaks (NOT full code editing)
- LLM = generate concrete variations (color schemes, parameter ranges, alternative algorithms) with rapid feedback loop
- Sync = lightweight source files + notes (NOT build artifacts, videos, or node_modules)
- Publishing = queue requests on mobile, execute on desktop (NOT direct upload from phone)

---

## 1. Mobile Creation Workflow

### Reality Check: What's Actually Feasible on Mobile

**Browser Performance (2026 State):**
- p5.js sketches **CAN run** in mobile browsers without native apps
- Performance ceiling: **~30 FPS** on modern phones (iPhone 6-era: ~20-25 FPS)
- Canvas size **critically impacts performance** — larger canvases = exponential slowdown
- **Workaround proven effective:** Render at moderate resolution (400x600), CSS-scale to full screen
- **Touch interactions work** but require thoughtful hit targets (ShaderToy model: on-screen sliders)

**Sources:**
- [Optimizing p5.js Code for Performance](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance)
- [p5.js mobile performance issues](https://github.com/processing/p5.js/issues/4469)
- [Frame rate thresholds on mobile](https://github.com/processing/p5.js/issues/570)

**Code Editing on Mobile (2026 State):**
- Mobile IDEs exist (AIDE-IDE, Codeit, SPCK) but are **NOT realistic for creative bursts**
- Effective use cases: urgent bug fixes, quick prototyping, NOT 10-15 min creative sessions
- **Keyboard friction** on phone makes typing code painful
- **Screen real estate** insufficient for code + preview simultaneously

**Sources:**
- [Best AI Code Editors 2026](https://playcode.io/blog/best-ai-code-editors-2026)
- [Best code editors for Android 2026](https://www.slant.co/topics/1662/~best-code-editors-for-android)

**What DOES Work on Mobile:**
- **Voice notes for ideation** — proven workflow for commute capture
- **Parameter tweaking via GUI** — lil-gui already touch-friendly
- **Visual review** — see sketch running, decide if variation is good
- **Quick notes/annotations** — NOTES.md updates via mobile editor
- **Variation selection** — pick which LLM-generated variations to keep

**Sources:**
- [Voice notes workflow 2026](https://www.kimklassen.com/blog/voice-note-idea-workflow)
- [Wispr Flow AI voice keyboard](https://wisprflow.ai/post/best-voice-typing-app-android)
- [Voice notes while commuting](https://voicetonotes.ai/blog/capture-ideas-driving-voice-to-notes/)

### Concrete Mobile Use Cases for v1.1

**Use Case 1: Commute Ideation (Offline → Sync Later)**
- User on train, sees interesting color pattern in environment
- Opens voice note app, records: "Atom idea: circular particles, purple-to-orange gradient, rotate based on audio bass"
- OR takes photo of color inspiration
- Later: syncs to desktop, LLM converts voice note → sketch scaffold

**Use Case 2: Variation Exploration (Phone Browser)**
- User generated 5 color scheme variations of existing atom (via desktop LLM)
- On commute, opens mobile browser → portfolio site → variation gallery
- Taps through variations, heart/star favorites
- Favorites metadata syncs back to desktop for refinement

**Use Case 3: Quick Parameter Tweaks (Live Preview)**
- Atom already exists on desktop
- User on phone opens atom URL (via portfolio or direct link)
- Sketch runs in browser, lil-gui controls visible
- Tweaks bgHue, rotationSpeed, watches live
- Clicks "Save config" → updates config.json remotely

**Use Case 4: Note Capture During Review**
- User reviewing published YouTube video on phone
- Notices audio-visual sync issue
- Opens NOTES.md for that atom (via GitHub mobile or synced editor)
- Adds session log entry: "2026-01-31 18:30 - A/V sync off by ~200ms, check MediaRecorder timing"

**Use Case 5: Publishing Queue (Metadata Entry)**
- Desktop captured video, encoded for YouTube
- User on commute wants to queue publish request
- Opens mobile app/CLI (via SSH or queue file)
- Fills in: title, description (LLM-suggested), tags
- Queues publish job → desktop cron job executes upload later

### Mobile-First Feature Requirements

**Table Stakes:**
| Feature | Why Expected | Complexity | Implementation |
|---------|--------------|------------|----------------|
| View atoms in mobile browser | Must review work anywhere | Low | Portfolio site already responsive (v1.0) |
| Touch-friendly parameter controls | Tweak sketches without keyboard | Low | lil-gui supports touch (verify hit targets) |
| Voice note integration | Capture ideas during commute | Medium | Integrate voice-to-text app → NOTES.md |
| Offline viewing | Sketches work without connectivity | Low | Service worker cache static assets |
| Sync status visibility | Know what's synced vs. local-only | Medium | Git status indicator in mobile view |

**Differentiators:**
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| LLM variation gallery | Explore 5-10 versions of atom without coding | High | Generate variations, host in portfolio |
| Favorite/rate variations | Curate best versions for refinement | Low | Star metadata in JSON, sync to desktop |
| Photo → color palette extraction | Capture real-world inspiration | Medium | Mobile photo → palette API → config.json |
| Voice → scaffold conversion | Speak sketch idea, get starter code | High | Voice-to-text → LLM → git commit |
| Mobile publish queue | Queue YouTube uploads from phone | Medium | JSON queue file, desktop cron processor |

**Anti-Features:**
| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Full code editor on mobile | Painful UX, slow workflow | Voice notes + LLM scaffold on desktop |
| Mobile video capture | Phone storage, encoding complexity | Desktop-only capture (v1.0 pattern) |
| Native mobile app | Development overhead, app store friction | Web-based, responsive, PWA if needed |
| Complex touch gestures | Discoverability issues, learning curve | Simple taps, standard UI controls |
| Mobile-only features | Fragments workflow, desktop confusion | Every mobile feature has desktop equivalent |

---

## 2. LLM Variation Features

### What "Variation" Actually Means

**Variation Categories (Concrete, Not Vague):**

**1. Parameter Variations (Low Complexity)**
- Generate 5 versions of existing atom with **different parameter ranges**
- Example: bgHue variations (blue, purple, orange, green, red)
- Example: Tempo variations (60 BPM, 90, 120, 140, 180)
- LLM reads current config.json, generates 5 new config.json files
- User reviews in browser, picks favorite(s)
- **Confidence: HIGH** — simple JSON manipulation, proven LLM capability

**2. Color Scheme Variations (Medium Complexity)**
- Input: current sketch
- LLM generates 5 **color palettes** (complementary, triadic, analogous, monochrome, random)
- Each palette = updated bgHue, particle colors, gradient stops
- User sees 5 versions running side-by-side (portfolio gallery view)
- **Confidence: HIGH** — color theory is well-documented, LLM can apply

**Sources:**
- [Color schemes in design systems](https://programmingdesignsystems.com/color/color-schemes/index.html)
- [Coolors palette generator](https://coolors.co/)

**3. Algorithm Variations (High Complexity)**
- Input: "circular particles with audio-reactive size"
- LLM generates **3 different approaches**:
  - Grid-based particles (not circular)
  - Spiral pattern (not static ring)
  - Random noise field (not structured)
- Each variation is **structurally different code**, not just parameters
- User compares algorithmic approaches, picks best
- **Confidence: MEDIUM** — LLM code generation quality varies, needs validation

**Sources:**
- [AIDE: AI-Driven Exploration in Code Space](https://arxiv.org/html/2502.13138v1)
- [LLM-supported Program Design Space](https://arxiv.org/abs/2503.06911)

**4. Audio-Visual Mapping Variations (High Complexity)**
- Input: audio atom + visual atom
- LLM suggests **5 different mappings**:
  - Bass → size, Mids → hue, Treble → rotation
  - Bass → rotation, Mids → particle count, Treble → brightness
  - Envelope → size, Beat → flash, Energy → color saturation
- Each mapping creates different perceptual effect
- User experiences variations, chooses most compelling
- **Confidence: MEDIUM** — mapping creativity is subjective, LLM can suggest but not judge

**5. Text Description → New Atom (Very High Complexity)**
- Input: Voice note transcript "circular particles, purple-to-orange gradient, rotate based on audio bass"
- LLM generates **complete sketch scaffold** (sketch.js, config.json, NOTES.md)
- User reviews generated code, tweaks, refines
- **Confidence: LOW-MEDIUM** — LLM can scaffold, but will need human refinement
- **Not table stakes** for v1.1 — defer to v1.2+

**Sources:**
- [Best LLM for coding 2026](https://www.xavor.com/blog/best-llm-for-coding/)
- [LLM coding workflow 2026](https://addyosmani.com/blog/ai-coding-workflow/)

### LLM Variation Workflow (User Feedback Loop)

**Step 1: Generate Variations**
```
User action: `eoe vary atom-name --type=color-scheme --count=5`
LLM action: Read sketch.js, config.json → generate 5 variations
Output: atoms/atom-name-var1/, atoms/atom-name-var2/, ... (sibling directories)
```

**Step 2: Preview Variations**
```
User action: `eoe preview-variations atom-name`
Browser opens: Portfolio page with 5 variations in grid (all running simultaneously)
Each variation shows: thumbnail, parameter diff from original, play button
```

**Step 3: Rate Variations**
```
User action: Click star icon on variation 2 and 4
Metadata: atoms/atom-name/.variations.json updated with ratings
```

**Step 4: Promote Variation to Main**
```
User action: `eoe promote atom-name-var2`
Action: Copy variation 2 code → overwrites atom-name/ (git history preserves original)
```

**Step 5: Regenerate Based on Feedback**
```
User action: `eoe vary atom-name --type=color-scheme --count=5 --like=var2 --avoid=var5`
LLM action: Read var2 (liked), var5 (disliked) → generate 5 NEW variations closer to var2 style
```

### LLM Context Requirements

**What LLM Needs to Know (Minimum Context):**
- Full source code of current atom (sketch.js, audio.js, config.json)
- Type of variation requested (parameter, color, algorithm, mapping)
- Variation count (default 5, max 10)
- User constraints (optional): "keep BPM above 100", "no red colors", "simple geometry only"

**What LLM Does NOT Need:**
- Full codebase history (just current atom)
- Other atoms (unless explicit remix request)
- User's creative intent (unless provided in prompt)
- Performance metrics (unless optimization variation)

**Caching Strategy:**
| Variation Type | Cache Duration | Why |
|----------------|----------------|-----|
| Parameter variations | Session-only | User might tweak and regenerate quickly |
| Color scheme variations | 7 days | Reusable across multiple atoms |
| Algorithm variations | Permanent (git) | Structurally different code = new atoms |
| Mapping variations | Session-only | Highly context-specific |

### Table Stakes vs. Future

**Table Stakes for v1.1:**
- Generate parameter variations (config.json only, no code changes)
- Generate color scheme variations (HSB hue/saturation updates)
- Preview variations in portfolio grid view
- Rate/favorite variations (star metadata)
- Promote variation to replace original

**Differentiators (v1.1 Nice-to-Have):**
- Voice note → LLM scaffold (text description → starter code)
- Algorithm variations (3 different structural approaches)
- Audio-visual mapping suggestions (5 different parameter mappings)

**Future (v1.2+):**
- LLM explains WHY variation works (educational value)
- LLM suggests variations based on viewing metrics (data-driven creativity)
- Variation lineage visualization (tree of explorations)
- Collaborative variation (multiple users explore same atom's design space)

**Anti-Features:**
| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Infinite variation generation | Choice paralysis, storage bloat | Cap at 5-10 variations, curate |
| Auto-publish best variation | LLM can't judge "best" subjectively | Human always chooses |
| Variation without attribution | Unclear what changed, why | Diff view, metadata explains changes |
| Replace human creativity | LLM assists, doesn't replace | Variations are starting points, not finals |

---

## 3. Multi-Device Sync & Handoff

### Sync Scope: What Syncs, What Doesn't

**DO Sync (Git-Based):**
| File Type | Size | Why Sync | Conflict Strategy |
|-----------|------|----------|-------------------|
| Source code (sketch.js, audio.js) | 2-10 KB | Core creative work | Last write wins (with warning) |
| Config files (config.json) | 1-2 KB | Parameters define sketch | Last write wins |
| Notes (NOTES.md) | 1-5 KB | Session logs, intent, ideas | Append-only (merge safe) |
| Variation metadata (.variations.json) | <1 KB | Ratings, favorites | Merge ratings (union) |
| Voice transcripts (.voice-notes/) | 1-10 KB | Ideation capture | Append-only |
| Package manifests (package.json) | 1-2 KB | Dependencies | Last write wins (desktop authoritative) |

**Total per atom:** ~20-30 KB (lightweight, mobile-friendly)

**DO NOT Sync:**
| File Type | Size | Why NOT Sync | How to Handle |
|-----------|------|--------------|---------------|
| node_modules/ | 50-200 MB | Regenerable, huge | .gitignore, npm install on each device |
| dist/ | 1-5 MB | Build artifact | .gitignore, rebuild on desktop |
| videos/ | 50-500 MB | Capture output | Desktop-only, upload to YouTube, delete local |
| .variations/ (generated atoms) | 100-500 KB | Temporary exploration | Session-only, git clean after promote |
| playwright-report/ | 1-10 MB | Test artifacts | .gitignore |

**Sources:**
- [Git LFS for large files](https://www.perforce.com/blog/vcs/how-git-lfs-works)
- [Syncing code between devices](https://dev.to/daunderworks/how-to-use-git-between-devices-3ggo)

### Sync Mechanisms (2026 Options)

**Option 1: Git + GitHub (Recommended for v1.1)**
- **Pros:** Already using Git (v1.0), free, version history, conflict detection
- **Cons:** Manual push/pull, merge conflicts possible, mobile Git clients needed
- **Mobile Git apps:** Working Copy (iOS), mgit (Android)
- **Workflow:** Desktop → git push → Mobile pulls → edits NOTES.md → git push → Desktop pulls
- **Confidence: HIGH** — established practice, well-documented

**Sources:**
- [FIT: File gIT for mobile + desktop sync](https://github.com/joshuakto/fit)
- [Obsidian sync via GitHub](https://medium.com/@proflead/sync-obsidian-notes-across-devices-for-free-using-github-mobile-pc-40db42eb91d0)

**Option 2: Syncthing + .stignore (Alternative)**
- **Pros:** Automatic sync, no manual push/pull, offline-friendly
- **Cons:** Another tool to install, not version-controlled, harder conflict resolution
- **Use case:** If Git friction too high for non-technical users
- **Confidence: MEDIUM** — works well, but adds complexity

**Sources:**
- [Syncthing-code for dev files](https://github.com/117503145/syncthing-code)
- [Syncing dev files constantly](https://dev.to/omarel/how-to-keep-all-dev-files-in-sync-when-switching-computers-constantly-42pg)

**Option 3: Cloud Storage + Selective Sync (NOT Recommended)**
- **Pros:** Familiar (Dropbox, Google Drive), automatic
- **Cons:** No version control, conflict files ("file (1).js"), not designed for code
- **Why avoid:** No merge strategy, breaks Git workflow, node_modules sync disaster

**Recommendation for v1.1:** **Git + GitHub** with mobile Git client OR simple sync script

### Conflict Resolution Strategies

**Conflict Type 1: Simultaneous Code Edits (RARE on mobile)**
- **Scenario:** User edits sketch.js on desktop, also on mobile (unlikely but possible)
- **Detection:** Git merge conflict on pull
- **Resolution:**
  - **Automatic:** Last write wins (timestamp-based) with notification "Mobile changes overwritten"
  - **Manual (better):** Show diff, let user choose (GitHub mobile supports basic conflict resolution)
- **Prevention:** Mobile workflow discourages code editing (ideation/notes instead)

**Conflict Type 2: Config.json Parameter Changes (COMMON)**
- **Scenario:** User tweaks bgHue on mobile, rotationSpeed on desktop
- **Detection:** Git merge conflict (both changed config.json)
- **Resolution:**
  - **Automatic:** Merge non-conflicting keys (bgHue from mobile, rotationSpeed from desktop)
  - **If same key changed:** Last write wins (or prompt user)
- **Implementation:** Custom merge script for JSON (git mergetool)

**Sources:**
- [Offline-first conflict resolution 2026](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-1j58)
- [Last write wins pattern](https://www.adalo.com/posts/offline-vs-real-time-sync-managing-data-conflicts)

**Conflict Type 3: NOTES.md Append (SAFE)**
- **Scenario:** User adds session log on desktop, also on mobile
- **Detection:** Git merge conflict (both appended to NOTES.md)
- **Resolution:**
  - **Automatic:** Append both entries (chronological order)
  - **No data loss:** Both notes preserved
- **Implementation:** Git handles append-only files well (line-based merge)

**Conflict Type 4: Variation Ratings (SAFE)**
- **Scenario:** User stars var2 on mobile, var4 on desktop
- **Detection:** Both modified .variations.json
- **Resolution:**
  - **Automatic:** Union merge (both var2 and var4 are starred)
- **Implementation:** JSON merge script (union of arrays/objects)

### Multi-Device Workflow (End-to-End)

**Scenario: Commute Ideation → Desktop Refinement → Mobile Review → Publish**

**Step 1: Mobile Ideation (Offline)**
- User on train (no WiFi)
- Records voice note: "Idea: hexagon grid, bass makes them pulse, color shifts with mids"
- Saves to `.voice-notes/2026-01-31-hexagons.m4a` (local only, not synced yet)

**Step 2: Sync to Desktop**
- User arrives home, phone connects to WiFi
- Git push from mobile (or Syncthing auto-sync)
- Desktop pulls changes

**Step 3: Desktop LLM Scaffold**
- User runs: `eoe scaffold-from-voice .voice-notes/2026-01-31-hexagons.m4a`
- LLM transcribes voice → text description
- LLM generates scaffold: atoms/2026-01-31-hexagons/sketch.js (basic hex grid), config.json
- User reviews, refines code, adds audio mappings
- Git commit

**Step 4: Desktop Variation Generation**
- User runs: `eoe vary 2026-01-31-hexagons --type=color-scheme --count=5`
- LLM generates 5 color variations
- User previews in browser (desktop), picks 2 favorites

**Step 5: Mobile Review (Commute Next Day)**
- User on train, opens portfolio on phone
- Navigates to hexagons atom → variation gallery
- Sees 5 variations running (30 FPS, acceptable)
- Stars variation 3 (best color balance)
- Adds note in NOTES.md: "Var3 color works best, promote this"

**Step 6: Desktop Promotion**
- User pulls mobile changes (starred var3)
- Runs: `eoe promote 2026-01-31-hexagons-var3`
- Variation 3 becomes main atom
- Captures video, encodes, queues publish

**Step 7: Mobile Publish Queue**
- User on commute, fills in YouTube metadata on phone
- Title: "Hexagon Pulse Grid - Generative Audio-Visual"
- Description (LLM-suggested): "Bass-reactive hexagonal grid with dynamic color shifting based on mid-range frequencies"
- Tags: generative art, p5.js, audio-visual, creative coding
- Saves to `.publish-queue/hexagons.json`

**Step 8: Desktop Auto-Publish**
- Desktop cron job (every 30 min) checks `.publish-queue/`
- Finds hexagons.json, executes YouTube upload
- Updates NOTES.md with published URL
- Deletes queue file, commits

**Total handoff points:** 4 syncs (mobile→desktop→mobile→desktop)
**Offline periods:** 2 (ideation, review)
**Online required:** LLM scaffold, publish

---

## 4. Publishing from Mobile

### Table Stakes: Queue-Based Publishing

**Why NOT Direct Upload from Mobile:**
- **Video files too large** for mobile upload (50-500 MB)
- **Mobile data caps** expensive for video uploads
- **Battery drain** significant for encoding/upload
- **Reliability** lower on mobile networks (interrupted uploads)
- **Already encoded on desktop** (v1.0 FFmpeg pipeline)

**Queue-Based Workflow (Realistic for v1.1):**

**Step 1: Desktop Captures + Encodes**
- User runs `eoe capture atom-name` on desktop (v1.0 workflow)
- Output: `videos/atom-name-youtube.mp4` (encoded, ready)
- State: Video ready but NOT published yet

**Step 2: Mobile Queues Publish Request**
- User on phone, opens publish interface (web form OR CLI via SSH)
- Fills metadata:
  - Title (LLM-suggested, editable)
  - Description (LLM-generated from NOTES.md, editable)
  - Tags (LLM-suggested from config.json, editable)
  - Publish date/time (now OR scheduled)
- Saves to `.publish-queue/atom-name-publish.json`
- Git commit + push (or sync)

**Step 3: Desktop Executes Upload**
- Cron job (every 30 min) OR manual `eoe publish-queue`
- Reads queue files, executes YouTube API upload
- Updates NOTES.md with published URL
- Deletes queue file (or archives to `.publish-archive/`)

**Advantages:**
- Mobile workflow lightweight (metadata only, <1 KB)
- Desktop handles heavy lifting (video upload)
- Offline-friendly (queue while offline, sync later)
- Reliable (desktop network more stable)

### LLM-Assisted Metadata Generation

**Auto-Derive from Atom:**

**Title Generation:**
```
Input: config.json (bgHue: 240, bassSizeScale: 200), NOTES.md ("exploring bass-reactive pulsing")
LLM output: "Blue Pulse Rings - Bass-Reactive Generative Art"
User edits if needed
```

**Description Generation:**
```
Input: NOTES.md session log, config.json parameters
LLM output: "An audio-reactive visualization featuring concentric circles that pulse and grow in response to bass frequencies. The blue-to-purple color palette shifts dynamically with mid-range audio, while rotation speed follows treble patterns. Created with p5.js and Tone.js."
User edits if needed
```

**Tag Suggestions:**
```
Input: config.json (audio-visual type), NOTES.md (p5.js, Tone.js mentioned)
LLM output: ["generative art", "p5.js", "audio-visual", "creative coding", "javascript", "web audio"]
User adds/removes tags
```

**Confidence: HIGH** — LLM excels at summarization and tag extraction

**Sources:**
- [AI-assisted content creation 2026](https://influenceflow.io/resources/all-in-one-creator-tools-the-complete-2026-guide-to-streamlining-your-content-creation-workflow/)
- [67% of creators using AI for editing in 2026](https://www.mobiloud.com/blog/ai-mobile-app-development-tools)

### Mobile Publishing UI Options

**Option 1: Web Form (Easiest)**
- Portfolio site includes `/publish` route (auth required)
- User logs in on mobile browser
- Form fields: atom selector, title, description, tags, schedule
- Submit → writes to `.publish-queue/` via API
- **Pros:** No app install, works on any mobile browser
- **Cons:** Requires backend API, authentication

**Option 2: Git-Based (No Backend)**
- User edits `.publish-queue/atom-name-publish.json` directly on phone
- Via GitHub mobile app OR Working Copy (iOS) OR mgit (Android)
- Git commit + push
- Desktop pulls + processes
- **Pros:** No backend needed, uses existing Git workflow
- **Cons:** Manual JSON editing (error-prone), less user-friendly

**Option 3: SSH CLI (Power Users)**
- User SSHs into desktop from phone (Termux on Android, Blink on iOS)
- Runs `eoe queue-publish atom-name --title="..." --description="..."`
- Queue file written on desktop directly
- **Pros:** Fastest for power users, no sync lag
- **Cons:** Requires SSH setup, not beginner-friendly

**Recommendation for v1.1:** Start with **Option 2 (Git-based)** for simplicity, add **Option 1 (Web form)** in v1.2 if friction too high

### Future: Direct Upload from Mobile (v1.2+)

**IF mobile direct upload becomes feasible:**
- **Scenario:** User has unlimited mobile data OR home WiFi
- **Requirements:**
  - Video already encoded on desktop (don't encode on phone)
  - Rsync/upload from desktop storage to mobile (via local network)
  - YouTube upload from mobile (using mobile YouTube API client)
- **Complexity: HIGH** — file transfer, network reliability, battery management
- **Decision:** Defer to v1.2+, validate queue-based workflow first

---

## 5. Success Metrics: How We Know Mobile + LLM Works

### Mobile Creation Metrics

**Quantitative:**
- **Mobile atom creation rate:** % of atoms that involve mobile workflow (target: 30%+)
- **Voice note → scaffold conversion:** % of voice notes that become atoms (target: 50%+)
- **Mobile parameter tweaks:** # of config.json updates via mobile per week (target: 5+)
- **Mobile preview frequency:** # of times user views atoms on mobile browser per week (target: 10+)

**Qualitative:**
- **Friction points:** User reports where mobile workflow breaks down
- **Commute productivity:** User feels mobile time is productive (not wasted)
- **Idea capture rate:** User captures more ideas than pre-mobile (baseline comparison)

### LLM Variation Metrics

**Quantitative:**
- **Variation generation rate:** # of variation batches generated per week (target: 3+)
- **Variation promotion rate:** % of variations that become promoted atoms (target: 20%+)
- **Iteration speed:** Time from variation generation → review → promote (target: <30 min)
- **Variation types:** Distribution of parameter vs. color vs. algorithm variations (track trends)

**Qualitative:**
- **Variation quality:** User rates "how many variations were worth exploring?" (target: 60%+)
- **Creative boost:** User feels LLM variations enhance creativity (not replace it)
- **Learning value:** User learns new techniques from algorithm variations

### Multi-Device Sync Metrics

**Quantitative:**
- **Sync frequency:** # of syncs per day (mobile ↔ desktop) (target: 3-5)
- **Conflict rate:** % of syncs that result in conflicts (target: <5%)
- **Conflict resolution time:** Minutes to resolve conflicts (target: <5 min)
- **Sync data volume:** MB synced per day (should stay <10 MB with proper .gitignore)

**Qualitative:**
- **Sync confidence:** User trusts sync won't lose work
- **Handoff smoothness:** User can seamlessly switch devices mid-workflow
- **Conflict understanding:** User knows WHY conflicts happen, how to resolve

### Publishing Workflow Metrics

**Quantitative:**
- **Queue-based publish rate:** % of publishes that use queue workflow (target: 50%+)
- **Metadata automation:** % of title/description/tags auto-generated by LLM (target: 80%+ suggested, 50%+ accepted as-is)
- **Mobile metadata entry time:** Minutes to fill publish queue on mobile (target: <5 min)
- **Publish success rate:** % of queued publishes that execute without error (target: 95%+)

**Qualitative:**
- **Metadata quality:** User rates LLM-generated metadata as "good enough" vs. needs heavy editing
- **Queue reliability:** User trusts queued publishes will execute (not lost)
- **Mobile convenience:** User prefers mobile metadata entry over desktop-only

---

## 6. Feature Dependencies & Phasing

### Phase 4: Mobile Viewing + Sync Foundation (v1.1 MVP)

**Goal:** User can view atoms on mobile, sync notes/config, capture voice ideas

**Features (Table Stakes):**
1. Responsive portfolio (already exists in v1.0, verify mobile performance)
2. Touch-friendly parameter controls (verify lil-gui works on mobile)
3. Git-based sync setup (document workflow, test on mobile Git clients)
4. Voice note capture integration (script to transcribe voice → NOTES.md)
5. Mobile NOTES.md editing (via GitHub mobile or Working Copy)

**Dependencies:**
- v1.0 portfolio (exists)
- Git workflow (exists)
- Mobile browser (assumed)

**Complexity:** Low-Medium (mostly workflow documentation, minimal new code)

### Phase 5: LLM Parameter Variations (v1.1 Core)

**Goal:** User can generate 5 parameter variations, preview in browser, promote favorite

**Features (Table Stakes):**
1. `eoe vary` command (LLM integration)
2. Parameter variation generation (config.json only)
3. Color scheme variation generation (HSB updates)
4. Variation preview gallery (portfolio page)
5. Variation rating/favoriting (metadata JSON)
6. Variation promotion (`eoe promote` command)

**Dependencies:**
- Phase 4 (sync must work for variations to sync)
- LLM API access (Claude or GPT)

**Complexity:** Medium-High (LLM integration, variation storage strategy)

### Phase 6: Queue-Based Publishing (v1.1 Polish)

**Goal:** User can queue publish requests on mobile, desktop executes uploads

**Features (Table Stakes):**
1. Publish queue file format (JSON schema)
2. LLM metadata generation (title, description, tags from NOTES.md + config)
3. Mobile queue creation (Git-based initially)
4. Desktop queue processor (cron job OR manual command)
5. NOTES.md update with published URL

**Dependencies:**
- Phase 4 (sync must work for queue files)
- Phase 5 (LLM already integrated, reuse for metadata)
- v1.0 YouTube publishing (exists)

**Complexity:** Medium (mostly workflow automation, minimal new API work)

### Future Phases (v1.2+)

**Phase 7: Algorithm Variations (Advanced LLM)**
- Generate structurally different code (not just parameters)
- Multiple algorithmic approaches (grid vs. spiral vs. noise)
- Code explanation (why this variation works differently)

**Phase 8: Voice → Scaffold (Full Ideation Pipeline)**
- Voice note → LLM transcription → sketch scaffold
- End-to-end: commute idea → running atom on desktop

**Phase 9: Mobile Web Form Publishing**
- Backend API for publish queue
- Authentication for mobile
- Web form UI (nicer than Git JSON editing)

**Phase 10: Direct Mobile Upload (If Feasible)**
- Local network file transfer (desktop → mobile)
- YouTube upload from mobile app
- Battery + data optimization

---

## 7. Anti-Features (What NOT to Build)

| Anti-Feature | Why Avoid | Risk If Built |
|--------------|-----------|---------------|
| Full code editor on mobile | Painful UX, doesn't fit 10-15 min bursts | Time sink, user frustration, slow creation |
| Mobile video capture | Phone storage, battery, encoding complexity | Data bloat, poor quality, crashes |
| Native mobile app | App store friction, development overhead | Maintenance burden, platform lock-in |
| Auto-publish LLM variations | LLM can't judge "best" subjectively | Bad content published, reputation damage |
| Sync everything (including node_modules) | Massive data transfer, mobile storage limits | Sync failures, slow syncs, storage full |
| Real-time collaborative editing | Complexity explosion, conflict nightmares | Months of dev time, fragile reliability |
| LLM replaces human creativity | Defeats project purpose (expanding horizons) | Passive consumption, not active creation |
| Infinite variations | Choice paralysis, storage bloat | Decision fatigue, cluttered repo |
| Mobile-only features | Fragments workflow, desktop confusion | Inconsistent UX, user must remember which device for what |

---

## 8. Sources & Confidence Assessment

### Mobile Creative Coding
- **HIGH confidence:** [p5.js mobile performance issues](https://github.com/processing/p5.js/issues/4469), [Optimization guide](https://github.com/processing/p5.js/wiki/Optimizing-p5.js-Code-for-Performance)
- **MEDIUM confidence:** Mobile workflow patterns (inferred from voice note apps + p5.js constraints)

### LLM Variation Generation
- **HIGH confidence:** [AIDE code exploration](https://arxiv.org/html/2502.13138v1), [Program design space](https://arxiv.org/abs/2503.06911)
- **MEDIUM confidence:** Variation quality (LLM coding quality varies, needs validation)

### Multi-Device Sync
- **HIGH confidence:** [Git sync workflows](https://dev.to/daunderworks/how-to-use-git-between-devices-3ggo), [Offline-first patterns](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-1j58)
- **HIGH confidence:** Conflict resolution strategies (well-established patterns)

### Voice Note Workflows
- **HIGH confidence:** [Voice note creative workflow 2026](https://www.kimklassen.com/blog/voice-note-idea-workflow), [Wispr Flow](https://wisprflow.ai/post/best-voice-typing-app-android)

### Publishing Automation
- **HIGH confidence:** Queue-based patterns (standard practice)
- **HIGH confidence:** [AI metadata generation (67% of creators using)](https://www.mobiloud.com/blog/ai-mobile-app-development-tools)

---

## 9. Roadmap Implications

### Recommended Phase Structure for v1.1

**Phase 4: Mobile Foundation (2-3 weeks)**
- Verify mobile browser performance (test p5.js atoms on phones)
- Document Git sync workflow (mobile Git client setup)
- Add voice note capture script (voice-to-text → NOTES.md)
- Verify portfolio responsiveness (touch targets, controls)

**Phase 5: LLM Variations (3-4 weeks)**
- Integrate LLM API (Claude or GPT)
- Implement `eoe vary` command (parameter + color variations)
- Build variation preview gallery (portfolio page)
- Add variation rating/promotion workflow

**Phase 6: Mobile Publishing (2-3 weeks)**
- Define publish queue JSON schema
- Implement LLM metadata generation (title/description/tags)
- Build queue processor (desktop cron job)
- Document mobile queue workflow (Git-based)

**Total v1.1 timeline:** 7-10 weeks

### Research Flags for Later Phases

**Phase 7 (Algorithm Variations) will need:**
- Deeper LLM code quality research (which models generate reliable p5.js?)
- Variation validation (how to test generated code doesn't crash?)
- Code diff visualization (how to show user what changed structurally?)

**Phase 8 (Voice → Scaffold) will need:**
- Voice transcription accuracy research (Whisper? Cloud API?)
- Prompt engineering for scaffold generation (what context produces best scaffolds?)
- Scaffold template library (common patterns to speed generation)

**Phase 9 (Web Form Publishing) will need:**
- Backend framework selection (Node.js? Deno?)
- Authentication strategy (GitHub OAuth? JWT?)
- API security (rate limiting, validation)

---

**End of v1.1 Features Research**
