---
status: complete
task: remove-duplicate-atom-completions
date: 2026-01-30

---

# Quick Task 006 Summary: Remove Duplicate Atom Names from Completion

**Status:** COMPLETE ✓

## Problem

Shell completion was showing duplicate atom names:
```
eoe capture 
2026-01-29-workflow-test    2026-01-30-test-verify      test-verify                 
2026-01-30-my-first-sketch  my-first-sketch             workflow-test
```

Users saw both short names and full date-prefixed names, creating confusing duplicates.

## Solution

Modified `cli/lib/completion.js` to show ONLY short names in completion:
- Removed fullNames from completion output
- `resolveAtomPath()` CLI helper already handles both short and full name resolution at runtime
- Users can type either format and it works; completion just shows the primary UX (short names)

## Result

Completion now shows only unique short names:
```
eoe capture 
my-first-sketch    test-verify    workflow-test
```

Clean, no duplicates, and backward-compatible (full names still work at runtime).

## Implementation Details

**File:** cli/lib/completion.js  
**Lines Changed:** 3-6  
**Commit:** c7fda56

Changed from:
```javascript
const shortNames = await getShortNames();
const fullNames = await getAtomNames();
const combined = [...new Set([...shortNames, ...fullNames])];
return tabtab.log(combined);
```

Changed to:
```javascript
const shortNames = await getShortNames();
return tabtab.log(shortNames);
```

## Why This Works

The `resolveAtomPath()` helper in cli/lib/resolve-atom.js:
- Accepts both short names (`my-first-sketch`) and full names (`2026-01-30-my-first-sketch`)
- Uses suffix matching to find atoms
- Completion doesn't need to suggest both - just the primary format

This is a clean separation: completion suggests, resolveAtomPath handles validation/mapping.

