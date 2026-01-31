# Phase 6: Composition Preview, Save & Cloud Backup - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete composition workflow: preview real-time playback with parameter routing, save compositions for later reuse, backup all creative content (atoms, notes, compositions) to cloud, and restore from backup if device is lost. Desktop remains primary creation; mobile is the playback and backup enabler.

</domain>

<decisions>
## Implementation Decisions

### Composition Preview Playback
- Multi-atom playback model is user-configurable: composer chooses simultaneous (all play together) or sequential (one-at-a-time) per composition
- Parameter changes apply instantly during playback (no queueing, no pause-required-to-tweak)
- Active routes visualized with animation during playback — show which routes are flowing parameter values, highlight active connections
- Audio glitches show warning to user with choice to continue or restart (not auto-restart, user has agency)

### Composition Save Format
- Hybrid save structure: composition JSON stores both inline atom code AND atom slug references for flexibility (portability + linkability)
- Compositions are immutable snapshots: once saved, composition always plays the exact code it captured (even if atom evolves later)
- Compositions synced to cloud automatically (treated like atoms for backup/restore)
- Shareable URL for read-only composition view (e.g., /c/[id]) — QR code optional, not v1.1 priority

### Cloud Backup Scope & Strategy
- Backup scope: atoms + notes + compositions (everything creative is preserved)
- Backup frequency: auto-backup on app close (background process, not disruptive)
- Storage limits: no hard limits or quotas (trust user to manage storage)
- Retention policy: keep all backups indefinitely (full archive, enables rollback to any point)

### Sync Conflicts & Restore
- Conflict resolution: user chooses per conflict (show notification "Atom X changed locally and on backup — which version?")
- Restore strategy: selective restore (user browses backup and picks which atoms/notes/compositions to restore)
- Status visibility: badge in app header (✓ synced | ⏳ pending | ⚠ error) visible at all times
- Error handling: automatic retry (3 attempts), then notify user if failure persists

### Claude's Discretion
- Exact animation details for active route visualization
- Specific UI for conflict resolution prompt
- Restore UI layout (list vs grid, metadata shown)
- Header badge implementation (position, size, styling)

</decisions>

<specifics>
## Specific Ideas

- Instant parameter feedback during playback — user tunes a value and hears it change in real-time, encouraging live exploration
- Composition snapshot immutability means "lock in a moment" — useful for experimentation without breaking old pieces
- User-chooses-conflict approach empowers composer to decide when atoms diverge, avoiding "mystery overwrites"
- Selective restore lets user cherry-pick atoms from backup (e.g., restore only atom X, ignore atom Y that was corrupted locally)

</specifics>

<deferred>
## Deferred Ideas

- QR code generation (optional, v1.2+) — shareable URL sufficient for v1.1
- Timeline sequencing for compositions (order atoms temporally, set duration) — separate phase
- Visual node graph upgrade from dropdown routing — v1.2
- Scheduled automatic backups (hourly/daily) — v1.2, after validating user behavior
- Backup encryption — v1.2 (simple one-way cloud backup for v1.1)

</deferred>

---

*Phase: 06-composition-preview-save-cloud-backup*
*Context gathered: 2026-01-31*
