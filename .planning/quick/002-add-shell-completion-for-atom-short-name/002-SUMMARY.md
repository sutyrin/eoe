---
phase: quick-002
plan: 01
subsystem: cli-completion
tags: [shell, tabtab, completion, ux]

requires:
  - quick-001 (short-name resolution in CLI commands)

provides:
  - Short-name atom completion for dev/build/note commands
  - Backward-compatible full-name completion

affects:
  - Developer UX for shell tab completion

tech-stack:
  added: []
  patterns:
    - Date-prefix stripping with regex pattern matching
    - Deduplication of completion suggestions

key-files:
  created: []
  modified:
    - cli/lib/completion.js: Added getShortNames() and updated setupCompletion()

decisions:
  - id: short-names-first
    choice: Short names appear before full names in completion list
    rationale: Short names are the primary UX, full names for disambiguation only
  - id: self-contained-completion
    choice: Completion module does not import resolve-atom.js
    rationale: Keep completion self-contained with its own fs scanning
  - id: ambiguity-at-runtime
    choice: Ambiguous short names appear once in completions
    rationale: Ambiguity is handled at execution time by resolveAtomPath

metrics:
  duration: 1m
  completed: 2026-01-30
---

# Quick Task 002: Add Shell Completion for Atom Short Names

**One-liner:** Shell tab completion now suggests short atom names (e.g., `my-first-sketch`) alongside full date-prefixed names for seamless CLI UX.

---

## What Was Built

### Short-Name Completion Pipeline

**Extended `cli/lib/completion.js`** with short-name completion support:

1. **`getShortNames()` export**: Scans atoms directory and strips `YYYY-MM-DD-` date prefix from folder names using regex pattern `/^\d{4}-\d{2}-\d{2}-/`
2. **Updated `setupCompletion()`**: Combines short and full names for atom-accepting commands (`dev`, `build`, `note`)
3. **Deduplication**: Handles folders without date prefixes (appear in both short and full lists)
4. **UX prioritization**: Short names appear first in completion list

### Completion Behavior

**Before:**
```bash
eoe dev <tab>
# Suggested: 2026-01-30-my-first-sketch, 2026-01-29-workflow-test
```

**After:**
```bash
eoe dev <tab>
# Suggested: my-first-sketch, workflow-test, 2026-01-30-my-first-sketch, 2026-01-29-workflow-test

eoe dev my<tab>
# Filters to: my-first-sketch, 2026-01-30-my-first-sketch
```

---

## Implementation Details

### Core Changes

**File:** `cli/lib/completion.js`

**Added `getShortNames()` function:**
```javascript
export async function getShortNames() {
  const fullNames = await getAtomNames();
  const datePattern = /^\d{4}-\d{2}-\d{2}-/;

  const shortNames = fullNames.map(name => {
    if (datePattern.test(name)) {
      return name.replace(datePattern, '');
    }
    return name; // Already a short name
  });

  // Deduplicate (multiple dates might yield same short name)
  return [...new Set(shortNames)].sort();
}
```

**Updated `setupCompletion()` for atom commands:**
```javascript
if (env.prev === 'dev' || env.prev === 'build' || env.prev === 'note') {
  const shortNames = await getShortNames();
  const fullNames = await getAtomNames();

  // Combine: short names first (primary UX), then full names
  const combined = [...new Set([...shortNames, ...fullNames])];

  return tabtab.log(combined);
}
```

### Pattern Alignment

**Consistency with `resolveAtomPath`:**
- Both use same date-prefix pattern: `YYYY-MM-DD-`
- Completion suggests short names; resolution disambiguates at runtime
- Ambiguous short names appear once in completion (handled at execution)

---

## Verification Results

### Test 1: Short Names Derived Correctly
```
Full: ['2026-01-29-workflow-test', '2026-01-30-my-first-sketch', '2026-01-30-test-verify']
Short: ['my-first-sketch', 'test-verify', 'workflow-test']
✓ All short names correctly derived
```

### Test 2: Completion Pipeline Works
```
Testing atom completion (dev command):
  my-first-sketch
  test-verify
  workflow-test
  2026-01-29-workflow-test
  2026-01-30-my-first-sketch
  2026-01-30-test-verify

✓ Completion pipeline works without errors
```

### Test 3: Deduplication Logic
```
Short names count: 3
Full names count: 3
Combined (deduplicated) count: 6
✓ Deduplication working (no overlaps in current atoms)
```

### Test 4: Command-Level Completion Still Works
```
Testing command completion at top level:
  create, dev, build, list, note, status, completion
✓ Top-level completion unchanged
```

---

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 61103f4 | feat | Add short-name completion to atom arguments (getShortNames, updated setupCompletion) |

---

## Decisions Made

### 1. Short Names First in Completion List
**Rationale:** Short names are the primary UX (established in Quick Task 001). Full names are for backward compatibility and disambiguation. Putting short names first makes the most common use case fastest.

**Impact:** Users see `my-first-sketch` before `2026-01-30-my-first-sketch` when hitting tab.

---

### 2. Self-Contained Completion Module
**Rationale:** Completion module already has `getAtomNames()` with fs scanning. Adding date-prefix stripping is trivial (4 lines). Importing `resolve-atom.js` would create unnecessary coupling for completion logic.

**Impact:** Completion module remains standalone. Date-prefix pattern (`/^\d{4}-\d{2}-\d{2}-/`) is duplicated but consistent.

---

### 3. Ambiguity Handled at Execution Time
**Rationale:** If multiple atoms yield the same short name (e.g., `2026-01-29-demo` and `2026-01-30-demo` both → `demo`), showing `demo` once in completion is correct. The user will see the ambiguity error when they run the command, which tells them to use the full name.

**Impact:** Completion stays simple. Runtime resolution (via `resolveAtomPath`) handles the edge case with clear error messages.

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Next Phase Readiness

**Status:** Complete - shell completion now matches runtime short-name resolution UX.

**Blockers:** None

**Concerns:** None

---

## Technical Observations

### Pattern Consistency
The date-prefix pattern `YYYY-MM-DD-` is now used in three places:
1. **Atom folder naming convention** (user-facing)
2. **`resolveAtomPath()` suffix matching** (runtime resolution)
3. **`getShortNames()` prefix stripping** (completion)

This triple usage reinforces the convention. If the pattern changes, all three must update.

### Tabtab Filtering Behavior
Tabtab's `log()` function handles partial matching internally using `env.lastPartial`. The completion module provides the full list, and tabtab filters it. This is the expected behavior.

### Deduplication Edge Case
If a user creates an atom folder WITHOUT a date prefix (e.g., just `my-atom`), it appears in both `getAtomNames()` and `getShortNames()` results. The `new Set([...shortNames, ...fullNames])` deduplication handles this correctly.

---

## Session Notes

**Duration:** ~1 minute
**Tasks completed:** 2/2
- Task 1: Modify cli/lib/completion.js to add short-name completion
- Task 2: Verify end-to-end completion behavior

**Quality:** All verification tests passed, no issues found.

---

**Quick Task 002 Complete** ✓
