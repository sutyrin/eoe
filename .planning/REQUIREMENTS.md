# Requirements: Engines of Experience v1.1

**Defined:** 2026-01-31
**Core Value:** Enable consistent creative output through mobile-first ideation and composition, with simple infrastructure to support multi-device continuity.

## v1.1 Requirements

### Mobile Creation Tools

- [x] **MOB-01**: User can view atom code (read-only, syntax-highlighted, searchable)
- [x] **MOB-02**: User can browse atom gallery (thumbnails, titles, last modified, offline-capable)
- [x] **MOB-03**: User can view NOTES.md (process notes, explorations, markdown rendered)
- [x] **MOB-04**: User can tweak parameters (sliders/number inputs modify config.json)
- [x] **MOB-05**: User can access atoms offline (service worker caches atoms, works without network)

### Composition & Modular Tools

- [x] **COMP-01**: User can add atoms to composition canvas (tap-to-add from gallery)
- [x] **COMP-02**: User can route parameters (dropdown UI: select source param → target param)
- [x] **COMP-03**: User can create rich combinations (parameter routing supports many-to-many mappings, combinatorial possibilities)
- [ ] **COMP-04**: User can preview composition (play all atoms simultaneously + apply routed parameters in real-time)
- [ ] **COMP-05**: User can save composition (persisted locally, shareable format, restorable)

### Ideation Tools

- [x] **IDEA-01**: User can capture voice notes (record audio on mobile, store as files)
- [x] **IDEA-02**: User can transcribe voice notes (audio → text via speech-to-text, appended to NOTES.md)
- [x] **IDEA-03**: User can annotate screenshots (capture phone screenshot, draw markup, store as image)
- [x] **IDEA-04**: User can quick-edit NOTES.md (text editor for process notes on mobile)

### Cloud Backup

- [ ] **SYNC-01**: User can backup atoms to cloud (one-way upload: atoms/ → server)
- [ ] **SYNC-02**: User can see backup status (last backup time, pending changes count)
- [ ] **SYNC-03**: User can restore from backup (recover atoms from cloud if device lost)

## v1.2+ Requirements (Deferred)

### LLM Variations
- **VAR-01**: Parameter variation generation (Claude CLI reads config, generates alternatives)
- **VAR-02**: Color palette generation (color theory variations)
- **VAR-03**: Publishing metadata generation (titles, descriptions, tags)
- **MON-01**: Monitor LLM requests (track usage, display costs/cap alerts)

### Advanced Composition
- **COMP-06**: Timeline sequencing (order atoms, set timing/duration)
- **COMP-07**: Visual node graph (upgrade from dropdowns to Cables.gl-style nodes)
- **COMP-08**: FFT coupling (audio analysis → visual parameter control)

### Multi-Device Sync
- **SYNC-04**: Real-time Syncthing sync (desktop/server P2P)
- **SYNC-05**: Mobile PouchDB/CouchDB sync (metadata replication, manual trigger)
- **SYNC-06**: Conflict resolution (explicit UI for competing edits)

### Advanced Ideation
- **IDEA-05**: Sketch drawing tool (freehand drawing on mobile canvas)
- **IDEA-06**: Variation gallery (LLM-generated variations with rating/promotion)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Code editing on mobile | Too cumbersome on phone; desktop sufficient. May reconsider in v2.0 if demand validates. |
| Native mobile app (iOS/Android) | Web PWA sufficient for v1.1; native path deferred until power users request. |
| Direct video upload from mobile | Phone storage/battery/bandwidth constraints make impractical. Desktop handles publishing. |
| Real-time multi-device sync | Sync infrastructure in v1.2. v1.1 uses simple cloud backup. |
| Automated publishing | Manual workflow validated in v1.0. LLM assistance deferred to v1.2. |
| Full desktop IDE on mobile | Out of scope; mobile is companion tool, desktop is primary workspace. |

## Traceability

Which phases cover which requirements (populated during roadmap creation).

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOB-01 | Phase 4 | Complete |
| MOB-02 | Phase 4 | Complete |
| MOB-03 | Phase 4 | Complete |
| MOB-04 | Phase 4 | Complete |
| MOB-05 | Phase 5 | Complete |
| COMP-01 | Phase 5 | Complete |
| COMP-02 | Phase 5 | Complete |
| COMP-03 | Phase 5 | Complete |
| COMP-04 | Phase 6 | Pending |
| COMP-05 | Phase 6 | Pending |
| IDEA-01 | Phase 4 | Complete |
| IDEA-02 | Phase 4 | Complete |
| IDEA-03 | Phase 4 | Complete |
| IDEA-04 | Phase 4 | Complete |
| SYNC-01 | Phase 6 | Pending |
| SYNC-02 | Phase 6 | Pending |
| SYNC-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---

*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after Phase 4 execution*
