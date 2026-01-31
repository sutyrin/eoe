# Roadmap: Engines of Experience v1.1

**Milestone:** v1.1 (Mobile-First Creative Practice)
**Duration:** 8-12 weeks
**Phases:** 4, 5, 6 (continuation from v1.0 Phase 3)

---

## Overview

v1.1 enables mobile-first creative practice: quick ideation capture (voice notes, sketches, text), parameter composition on touch screens (simple routing UI with rich combinatorial possibilities), and simple cloud backup for multi-device continuity. Desktop remains primary workspace; mobile augments creation during commutes and quick sessions.

**Core value:** Consistent output across devices without friction.

---

## Phase 4: Mobile Gallery & Ideation Tools

**Goal:** Establish mobile as accessible companion to desktop, enabling voice/visual ideation capture.

**Requirements addressed:**
- MOB-01: View atom code
- MOB-02: Browse atom gallery
- MOB-03: View NOTES.md
- MOB-04: Tweak parameters
- IDEA-01: Voice note capture
- IDEA-02: Voice transcription
- IDEA-03: Screenshot annotations
- IDEA-04: Quick text notes

**Deliverables:**
1. Mobile PWA foundation (Astro-based, responsive design, touch-optimized)
2. Atom gallery view (thumbnails, titles, dates, offline-capable via service worker)
3. Atom detail view (code viewer with syntax highlighting, searchable)
4. Parameter tweaker (sliders/number inputs for config.json values, visual feedback)
5. NOTES.md viewer + quick editor (markdown preview, inline editing)
6. Voice note recorder (Web Audio API, save as audio files, transcription via Web Speech API or Whisper)
7. Screenshot capture + annotation (HTML5 canvas drawing, markup overlay, save as images)
8. Service worker for offline access (cache atoms, notes, code, images)

**Success criteria:**
- Can view 5+ atoms on mobile without network
- Can edit config parameters and see instant feedback
- Voice notes transcribe with >80% accuracy
- Screenshot markup feels natural (pen tool, colors, undo)
- All interactions work on 6" phone screen
- Battery impact <2% per hour idle

**Duration:** 3-4 weeks

**Research flags:** None (patterns well-established). Speech-to-text quality validation during implementation.

---

## Phase 5: Composition Canvas & Offline Support

**Goal:** Build touch-friendly composition tool enabling parameter routing and multi-atom combinations.

**Requirements addressed:**
- COMP-01: Add atoms to composition canvas
- COMP-02: Route parameters (dropdown UI)
- COMP-03: Create rich combinations (many-to-many routing)
- MOB-05: Offline access (extend to composition)

**Deliverables:**
1. React Flow integration on mobile (tap-to-add atoms, tap-tap-to-connect parameters)
2. Parameter routing UI (dropdown: source atom param → target atom param)
3. Routing possibilities visualizer (show what combinations are valid, suggest common paths)
4. Composition canvas optimization for touch (large tap targets, gesture support, pinch-zoom)
5. Local storage for composition (IndexedDB, persist across sessions)
6. Composition list (gallery of saved compositions)
7. Full offline composition support (atoms + Tone.js engine work offline)

**Success criteria:**
- Can add 3-5 atoms to canvas without lag
- Parameter routing UI is discoverable (users understand source → target)
- Composition persists across app reload
- Works offline (no network required)
- Canvas responsive from 4" to 12" screens
- Touch interactions feel natural (no accidental taps)

**Duration:** 3-4 weeks

**Research flags:** React Flow performance on mobile with custom atom nodes (benchmark during implementation).

---

## Phase 6: Composition Preview, Save & Cloud Backup

**Goal:** Complete composition workflow (preview real-time, save for later, backup to cloud).

**Requirements addressed:**
- COMP-04: Preview composition
- COMP-05: Save composition
- SYNC-01: Backup atoms to cloud
- SYNC-02: Backup status
- SYNC-03: Restore from backup

**Deliverables:**
1. Composition preview engine (play all atoms simultaneously, apply routed parameters in real-time, visualization of active routes)
2. Web Audio integration (route Tone.js synthesis through parameter mappings, FFT visualization optional)
3. Composition save format (JSON: atom list, routing graph, metadata; shareable URL or QR code)
4. Cloud backup service (simple HTTP endpoint: upload atoms/ directory, one-way)
5. Backup status dashboard (last backup time, pending changes count, storage usage)
6. Restore from backup (download atoms from server, merge with local)
7. Conflict resolution UI (if local changes conflict with backup: choose version, manual merge)
8. Push notifications for backup reminders (optional)

**Success criteria:**
- Composition preview is stable (no audio glitches, synced parameter changes)
- Save/restore cycle is lossless (save composition, reload app, composition identical)
- Cloud backup completes in <30 seconds
- Backup restoration works for complete atom recovery
- Backup status is always visible (last synced time, pending items)
- Users understand what's backed up (atoms yes, videos optional)

**Duration:** 3-4 weeks

**Research flags:** None (patterns standard). Web Audio parameter routing robustness needs validation (audio glitches with many simultaneous routes).

---

## Phase Ordering Rationale

**Why Phase 4 → Phase 5 → Phase 6:**

1. **Gallery first (Phase 4):** Establish mobile as a viewing/ideation tool before adding composition complexity. Validate touch UX on simple interactions before building React Flow.

2. **Composition second (Phase 5):** Build parameter routing after gallery/parameters are proven. Offline support comes here because composition data is lightweight (JSON) vs. videos (GB).

3. **Preview & backup last (Phase 6):** Save/preview/backup depend on stable composition UI (Phase 5). Backup architecture depends on understood sync model (simple cloud, not P2P).

**Why not Sync first:** Research showed sync infrastructure (CouchDB, Syncthing) is secondary value. Users want mobile composition tools first. Simple cloud backup (Phase 6) satisfies multi-device need without complex sync architecture.

---

## Success Criteria (v1.1 Complete)

- [ ] Can capture voice ideas on mobile, transcribed to NOTES.md
- [ ] Can view atom code on mobile, understand what it does
- [ ] Can tweak parameters on mobile, see instant visual feedback
- [ ] Can build 3-5 atom compositions on mobile without lag
- [ ] Can route audio FFT to visual parameters (example: audio intensity → circle size)
- [ ] Can save composition and reload it identically
- [ ] Can backup atoms to cloud and restore if device lost
- [ ] All workflows are offline-capable (no network dependency for core creation)
- [ ] Mobile battery impact is <3% per hour of active creation
- [ ] All interactions discoverable on 6" phone screen without documentation

---

## Dependencies & Constraints

**External libraries (adopt from existing infrastructure research):**
- React Flow v11.5+ (MIT) — node composition UI
- Tonal.js (MIT) — music theory (future use)
- Wavesurfer.js (BSD) — waveform visualization (Phase 6+)
- Meyda (MIT) — audio analysis for FFT (Phase 6+)
- Tone.js v15.1.22 (existing) — audio synthesis

**Mobile-specific constraints:**
- iOS PWA: No background sync, 50MB cache limit, filesystem access limited
- Android: WorkManager for background tasks, battery optimization aggressive
- Touch: No hover states, larger tap targets (48px minimum), gesture-friendly

**Browser APIs required:**
- Web Audio API (Tone.js engine)
- Web Speech API (voice transcription)
- MediaRecorder API (voice capture)
- Service Workers (offline support)
- IndexedDB (local persistence)
- Canvas API (screenshot annotation)

---

## Risk Mitigation

**Key risks identified in research:**

1. **Mobile performance ceiling** (Phase 5)
   - Risk: React Flow with custom atom nodes may lag on mid-range phones
   - Mitigation: Benchmark early with Pixel 6a simulator, implement virtualization, limit to 5 atoms max in v1.1

2. **Audio routing stability** (Phase 6)
   - Risk: Web Audio parameter routing may cause audio glitches with many simultaneous connections
   - Mitigation: Start with single FFT → visual mapping, test with multiple routes during implementation

3. **Offline composition conflicts** (Phase 6)
   - Risk: User edits composition offline, desktop also changes composition, sync conflict resolution unclear
   - Mitigation: Simple rule: last-write-wins with timestamp, explicit UI for version choice if timestamps conflict

4. **Storage exhaustion on mobile** (Phase 4-6)
   - Risk: 50 atoms × config + notes + audio notes = 500MB+ on 64GB phone
   - Mitigation: IndexedDB quota monitoring, warn user at 80% capacity, offer selective delete

5. **Voice transcription accuracy** (Phase 4)
   - Risk: Web Speech API accuracy varies by browser/language, user frustration if unreliable
   - Mitigation: Start with browser-native Web Speech (fast), allow manual text editing of transcription, fallback to manual typing

---

## Post-v1.1 Roadmap (v1.2+)

**Waiting for v1.1 validation before committing:**

- **Phase 7: Advanced Sync** (Syncthing desktop sync + PouchDB mobile replication, conflict resolution)
- **Phase 8: Timeline Sequencing** (order atoms temporally, set duration, visual timeline UI)
- **Phase 9: Visual Node Graph** (upgrade composition dropdowns to node-based UI, Cables.gl-style)
- **Phase 10: LLM Variations** (Claude CLI parameter variations, color generation, metadata)

These are sequenced AFTER v1.1 because they depend on v1.1's mobile patterns being validated with real use.

---

*Roadmap created: 2026-01-31*
*Ready for Phase 4 planning*
