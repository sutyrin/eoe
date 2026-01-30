---
phase: quick-006
task: 1
type: execute
autonomous: true

---

# Quick Task 006: Remove Duplicate Atom Names from Completion

**Objective:** Fix shell completion to show only short names, eliminating duplicates.

**Problem:** Completion was showing both short and full names:
- `my-first-sketch` AND `2026-01-30-my-first-sketch`
- `workflow-test` AND `2026-01-29-workflow-test`
- etc.

**Root Cause:** setupCompletion() was combining shortNames + fullNames arrays, creating duplicate suggestions.

**Solution:** 
Only show short names in completion. The `resolveAtomPath()` helper already handles both short and full name resolution at runtime, so users can type either and it works.

**Files Modified:**
- cli/lib/completion.js (removed redundant fullNames combination logic)

**Changes:**
- Removed fullNames variable from completion logic
- Changed tabtab.log([...shortNames, ...fullNames]) to just tabtab.log(shortNames)
- Updated comment to explain that resolveAtomPath() handles both formats

**Result:**
Completion now shows only: `my-first-sketch`, `test-verify`, `workflow-test` (3 unique suggestions instead of 6)

