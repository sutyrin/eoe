---
phase: 06-composition-preview-save-cloud-backup
plan: 02
subsystem: persistence
tags: [composition, snapshot, immutability, indexeddb, offline]

requires:
  - 05-05-SUMMARY.md  # Composition CRUD and autosave foundation
  - 06-01-SUMMARY.md  # Preview engine to play snapshots

provides:
  - Immutable composition snapshots with inline atom code
  - Hybrid structure (slug reference + inline code)
  - Snapshot CRUD operations
  - Compositions list showing drafts and snapshots
  - Snapshot loading with synthetic atoms map

affects:
  - 06-03-SUMMARY.md  # Cloud backup will use snapshot export/import
  - 06-05-SUMMARY.md  # Shareable URLs will load snapshots

tech-stack:
  added:
    - CompositionSnapshot interface with inline code
    - buildAtomsMapFromSnapshot for immutability guarantee
  patterns:
    - Hybrid data structure: reference + embedded content
    - Synthetic metadata generation from inline snapshot data
    - Lossless save/reload cycle

key-files:
  created:
    - portfolio/src/scripts/composition-snapshot.ts
  modified:
    - portfolio/src/scripts/composition-types.ts
    - portfolio/src/scripts/db.ts
    - portfolio/src/components/CompositionToolbar.astro
    - portfolio/src/pages/mobile/compose.astro
    - portfolio/src/pages/mobile/compositions.astro

decisions:
  - id: hybrid-snapshot-structure
    choice: Store both slug reference AND inline code in snapshots
    rationale: Slug enables future linking/attribution, inline code guarantees immutability
    alternatives: ["Slug-only (no immutability)", "Code-only (no attribution)"]
    impact: Snapshots are portable and immutable, ~2-10KB per snapshot

  - id: separate-snapshots-store
    choice: Store snapshots in separate IndexedDB store from drafts
    rationale: Clear separation between mutable drafts and immutable snapshots
    alternatives: ["Single compositions store with isSnapshot flag"]
    impact: Simpler queries, clearer semantics, no risk of accidental mutation

  - id: snapshot-read-only
    choice: Snapshots are read-only in compose page (no history, no autosave)
    rationale: Snapshots are "locked in time" - editing should create new draft
    alternatives: ["Allow snapshot editing in-place"]
    impact: Users understand snapshots as immutable records

metrics:
  duration: 9m 2s
  tasks: 5
  commits: 5
  files_created: 1
  files_modified: 5
  completed: 2026-01-31
---

# Phase 6 Plan 02: Composition Snapshot Save/Load Summary

**One-liner:** Immutable composition snapshots with inline atom code, hybrid structure (slug + code), lossless save/reload cycle, snapshots visible in compositions list

## What Was Built

### 1. CompositionSnapshot Type System
- **CompositionSnapshot interface**: Full composition snapshot with inline atom code
- **SnapshotAtom interface**: Hybrid structure with atomSlug reference + inline code/config
- **Immutability guarantee**: Snapshots capture exact code at moment of save
- **Shareable structure**: UUID-based IDs suitable for /c/[id] URLs

### 2. IndexedDB Snapshots Store
- **Bumped DB version to 3**: Added 'snapshots' object store
- **Indexes**: compositionId, createdAt, synced (for cloud backup queries)
- **Separation**: Snapshots stored separately from draft compositions
- **Migration**: Existing compositions unaffected by schema change

### 3. Snapshot Creation and Loading
- **createSnapshotFromComposition**: Captures inline atom code from IndexedDB
- **Snapshot CRUD**: save, get, delete, getAll operations
- **buildNodesFromSnapshot**: React Flow rendering from snapshot data
- **buildAtomsMapFromSnapshot**: Synthetic atoms map for immutable preview playback
- **Export/import JSON**: Foundation for cloud backup in Plan 06-03
- **Size helpers**: Calculate and format snapshot size for UI display

### 4. Toolbar Save Button
- **Save snapshot button**: Disk icon in composition toolbar
- **Event-driven**: Triggers eoe:save-snapshot event
- **Autosave integration**: Flushes pending autosave before creating snapshot
- **Toast feedback**: Shows snapshot size on successful save
- **Error handling**: Graceful fallback if atom not found in IndexedDB

### 5. Compositions List Updates
- **Dual sections**: Separate "Drafts" and "Snapshots" sections
- **Snapshot metadata**: Displays atom count, route count, size, creation date
- **Snapshot badge**: Visual indicator to distinguish snapshots from drafts
- **Snapshot loading**: ?snapshot=id URL parameter for loading snapshots
- **Read-only mode**: Snapshots have no history or autosave (immutable)
- **Delete handling**: Separate delete paths for drafts vs snapshots

## Key Behaviors

### Save/Reload Cycle (Lossless)
1. User creates composition with 3 atoms, 2 routes, parameter overrides
2. User clicks "Save Snapshot" button in toolbar
3. System:
   - Flushes autosave (ensures draft is saved)
   - Loads full atom code from IndexedDB for each atom
   - Creates CompositionSnapshot with inline code + slug references
   - Generates UUID for snapshot (suitable for shareable URLs)
   - Saves to IndexedDB 'snapshots' store
4. User reloads app, navigates to compositions list
5. Snapshot appears in "Snapshots" section with metadata
6. User clicks snapshot
7. System:
   - Loads snapshot from IndexedDB
   - Builds synthetic atoms map from inline code
   - Converts snapshot to composition format for canvas
   - Renders composition in read-only mode
8. Composition is IDENTICAL to original (lossless cycle)

### Immutability Guarantee
- **Original atoms evolve**: User edits atom code in atoms/ directory
- **Snapshot unchanged**: Snapshot continues to play exact code it captured
- **buildAtomsMapFromSnapshot**: Creates synthetic AtomMetadata from inline code
- **Preview engine**: Uses synthetic atoms map, not current IndexedDB atoms
- **"Lock in a moment"**: Snapshots are permanent records of creative state

### Hybrid Structure Benefits
- **Slug reference**: Enables attribution ("built with atom X")
- **Inline code**: Ensures portability and immutability
- **Best of both worlds**: Can link to original atom while guaranteeing playback

## Deviations from Plan

None - plan executed exactly as written.

## Testing & Verification

### Build Verification
- ✅ `npm run build` completes without errors
- ✅ TypeScript types validated
- ✅ All imports resolved correctly

### Data Structure
- ✅ CompositionSnapshot has id, compositionId, atoms (with inline code), routes
- ✅ SnapshotAtom has both atomSlug and inline code/configJson
- ✅ IndexedDB version 3 with 'snapshots' store
- ✅ Indexes on compositionId, createdAt, synced

### Snapshot Creation
- ✅ createSnapshotFromComposition captures all atom code inline
- ✅ Snapshot includes routes, viewport, playbackMode
- ✅ Error if atom not found in IndexedDB (can't create incomplete snapshot)
- ✅ Snapshot has unique UUID suitable for URLs

### Snapshot Loading
- ✅ ?snapshot=id URL parameter loads snapshot correctly
- ✅ buildAtomsMapFromSnapshot creates synthetic atoms map
- ✅ Snapshot playback uses inline code, not current IndexedDB atoms
- ✅ Snapshots are read-only (no history, no autosave)

### UI Integration
- ✅ Save button in toolbar creates snapshot with toast feedback
- ✅ Compositions page shows drafts and snapshots in separate sections
- ✅ Snapshot badge visually distinguishes snapshots from drafts
- ✅ Snapshot metadata shows atom count, route count, size, date
- ✅ Clicking snapshot navigates to compose page and loads correctly

### Lossless Cycle
- ✅ Save composition with 3 atoms, 2 routes, parameter overrides
- ✅ Create snapshot
- ✅ Reload app
- ✅ Load snapshot
- ✅ Composition is IDENTICAL (same atoms, routes, positions, params)

### Backward Compatibility
- ✅ Existing draft compositions continue to work
- ✅ Composition CRUD operations unaffected
- ✅ Autosave and undo/redo still functional
- ✅ No regressions in Phase 5 features

## Success Criteria Met

- ✅ **COMP-05**: User can save composition as immutable snapshot
- ✅ **Hybrid structure**: Inline code + slug references (portability + linkability)
- ✅ **Save/reload cycle is lossless**: Snapshots preserve exact state
- ✅ **Snapshots visible in list**: With metadata (atoms, routes, size, date)
- ✅ **Snapshot playback immutable**: Uses captured code, not current atoms
- ✅ **Foundation for cloud backup**: Export/import JSON ready for Plan 06-03
- ✅ **Foundation for shareable URLs**: UUID-based snapshot IDs ready for Plan 06-05

## Next Phase Readiness

**Blockers:** None

**Concerns:** None

**Smooth handoff to Plan 06-03 (Cloud Backup):**
- Snapshot export/import JSON helpers already implemented
- Synced flag in snapshots store ready for cloud sync tracking
- Snapshot size helpers useful for upload/download progress
- Immutable snapshots ideal for cloud storage (no sync conflicts)

## Decisions Made

### 1. Hybrid Snapshot Structure
**Decision:** Store both slug reference AND inline code in snapshots

**Rationale:**
- Slug enables future linking ("this composition uses atom X")
- Inline code guarantees immutability (snapshot always plays same code)
- Hybrid structure gives us best of both worlds
- ~2-10KB per snapshot is acceptable storage cost

**Alternatives considered:**
- Slug-only: No immutability guarantee, broken if atom deleted
- Code-only: No attribution, can't link back to original atom

**Impact:** Snapshots are portable, immutable, and attributable

### 2. Separate Snapshots Store
**Decision:** Store snapshots in separate IndexedDB store from drafts

**Rationale:**
- Clear separation between mutable drafts and immutable snapshots
- Simpler queries (getAllSnapshots vs filtering compositions)
- No risk of accidental snapshot mutation
- Clearer semantics (draft vs snapshot is fundamental distinction)

**Alternatives considered:**
- Single compositions store with isSnapshot flag
- Storing snapshots as special composition type

**Impact:** Clear data model, simpler code, no mutation risk

### 3. Snapshot Read-Only in Compose Page
**Decision:** Snapshots loaded in compose page are read-only (no history, no autosave)

**Rationale:**
- Snapshots are "locked in time" - editing defeats the purpose
- Users should create new draft if they want to modify
- Read-only mode is clear UX signal: this is a record, not a workspace

**Alternatives considered:**
- Allow editing snapshots in-place (creates new snapshot on save)
- Create draft copy when snapshot is opened for editing

**Impact:** Clear mental model, snapshots remain immutable records

## Impact on Codebase

### Files Created (1)
- `portfolio/src/scripts/composition-snapshot.ts`: Snapshot creation, loading, export/import

### Files Modified (5)
- `portfolio/src/scripts/composition-types.ts`: CompositionSnapshot and SnapshotAtom interfaces
- `portfolio/src/scripts/db.ts`: IndexedDB version 3, snapshots store
- `portfolio/src/components/CompositionToolbar.astro`: Save snapshot button
- `portfolio/src/pages/mobile/compose.astro`: Snapshot loading logic
- `portfolio/src/pages/mobile/compositions.astro`: Dual list (drafts + snapshots)

### Code Quality
- All TypeScript strict mode compliant
- Proper error handling (missing atoms, failed saves)
- Clear separation of concerns (snapshot vs draft logic)
- Lossless data transformations (snapshot ↔ composition)

## Technical Notes

### Snapshot Size Estimates
- Minimal snapshot (1 visual atom, no routes): ~1.5KB
- Typical snapshot (3 atoms, 2 routes): ~5KB
- Max snapshot (5 atoms, 4 routes, overrides): ~10KB
- IndexedDB quota: 50MB+ (can store thousands of snapshots)

### Immutability Implementation
- `buildAtomsMapFromSnapshot` creates synthetic AtomMetadata
- Synthetic metadata uses inline code from snapshot, not IndexedDB
- Preview engine receives synthetic atoms map via loadAtomsMap override
- No way to "break out" and load current atoms (immutability enforced)

### Future: Shareable URLs
- Snapshot ID is UUID (suitable for /c/[id] routes)
- Snapshot JSON is self-contained (can be shared as file)
- Cloud backup (Plan 06-03) enables /c/[id] URLs to fetch from server
- Snapshots are perfect for sharing (no dependencies, immutable)

---

**Status:** ✅ Complete - All tasks executed, verified, and committed
