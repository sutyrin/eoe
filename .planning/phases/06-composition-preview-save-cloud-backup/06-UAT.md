---
status: testing
phase: 06-composition-preview-save-cloud-backup
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md
started: 2026-02-01T00:35:00Z
updated: 2026-02-01T00:35:00Z
---

## Current Test

number: 1
name: Composition Preview - Play Button
expected: |
  Tap the Play button on a composition with 2+ atoms. All atoms start playing simultaneously (or in sequence if mode is set to sequential). You hear audio (or see visual output if atoms are visual). Active routes are highlighted with a pulsing green animation on the canvas edges.
awaiting: user response

## Tests

### 1. Composition Preview - Play Button
expected: Tap Play button on composition with atoms. All atoms play simultaneously with visual route highlighting (green pulsing animation). Parameter routing applies instantly.
result: pending

### 2. Composition Playback Modes
expected: Toggle between ALL (simultaneous) and SEQ (sequential) modes. In simultaneous mode, all atoms play together. In sequential mode, atoms play one at a time with a Next button.
result: pending

### 3. Pause and Resume
expected: Tap Pause during playback (button changes from play to pause icon). Playback pauses. Tap again to resume. Pause state shows orange highlight on play button.
result: pending

### 4. Stop and Cleanup
expected: Tap Stop button. All playback stops. Iframes are removed, resources are cleaned up. Clicking Play again works without issues.
result: pending

### 5. Save Composition as Snapshot
expected: Create a composition with 2-3 atoms and routes. Tap the Save button in toolbar. Toast shows "Snapshot saved!" Composition is immutable - changes to original atoms don't affect the saved snapshot.
result: pending

### 6. Load Saved Composition
expected: Navigate to Compositions page. Find "Saved Snapshots" section. Tap a snapshot. Compose page loads with the exact snapshot data (atoms, routes, parameter values) from when it was saved.
result: pending

### 7. Cloud Backup Auto-trigger
expected: Create a composition, add atoms, then close the app (navigate away or close browser tab). When you return, app auto-backed up to server. Sync status badge shows green "All backed up".
result: pending

### 8. Backup Status Badge
expected: Open any mobile page. Top-right header area shows a badge with sync status: green dot if "All backed up", orange dot with count if "N items not backed up", blue pulsing if "Backing up...", red if "Backup failed".
result: pending

### 9. Backup Management Page
expected: Tap the sync status badge. Navigate to /mobile/backup page. Shows list of available backups with timestamps, item counts (atoms, compositions, snapshots), and file sizes. Manual backup button at top.
result: pending

### 10. Manual Backup Trigger
expected: From /mobile/backup page, tap "Backup Now" button. Status shows "Backing up..." then "Backup complete" with timestamp. Backup appears in list.
result: pending

### 11. Selective Restore
expected: From /mobile/backup page, tap a backup's Restore button. Modal shows checkboxes for atoms, compositions, snapshots. Select categories and confirm. Only selected items are restored to IndexedDB. Page reloads to show restored data.
result: pending

### 12. Shareable Composition URL
expected: Save a composition as snapshot. A Share button appears on the snapshot card. Tap Share. URL copied to clipboard (toast says "Copied!"). Paste URL in browser (e.g., https://llm.sutyrin.pro/c/snapshot-id). Read-only composition viewer loads showing atoms, routes, and a Play button.
result: pending

### 13. Shared Composition Playback
expected: On the /c/[id] shared page, tap Play button. Composition plays using the captured atom code (not current code). Audio/visuals play correctly. Routes highlighted.
result: pending

### 14. Audio Glitch Handling
expected: During playback, if an audio glitch is detected, warning modal pops up with "Audio glitch detected" message and two buttons: Continue (dismiss) and Restart (stop and play again). Choosing either works smoothly.
result: pending

### 15. Retry on Network Failure
expected: Force a network outage (dev tools > offline mode) and trigger a manual backup. Backup retries 3 times with exponential backoff (1s, 2s, 4s). If still fails, badge shows red "Backup failed". Go online and retry - backup succeeds.
result: pending

## Summary

total: 15
passed: 0
issues: 0
pending: 15
skipped: 0

## Gaps

[none yet]
