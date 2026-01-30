---
phase: quick-007
task: 1
type: execute
autonomous: true

---

# Quick Task 007: Smart Atom Name Completion (Name vs Date Search)

**Objective:** Enable flexible atom lookup by showing short names when searching by name, and full names when searching by date.

**Problem:** Users needed to choose: search atoms by name OR by date, not both.

**Solution:** Smart completion that detects what user is typing:
- Empty string or letter input → show short names (my-first-sketch)
- Digit input (2026-...) → show full date-prefixed names

**Files Modified:**
- cli/lib/completion.js

**Changes:**
- Check if `env.curr` (current input) starts with digit
- If digit: use getAtomNames() for full names
- If empty/letter: use getShortNames() for short names
- Single setupCompletion() function handles both cases

**Usage:**
```
eoe capture <tab>        → short names (my-first-sketch)
eoe capture 2<tab>       → full names (2026-01-30-my-first-sketch)
eoe capture my<tab>      → short name completion (my-first-sketch)
eoe capture 2026-01<tab> → date completion (2026-01-30-*, 2026-01-29-*)
```

