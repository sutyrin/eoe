---
phase: quick-005
task: 1
type: execute
autonomous: true

---

# Quick Task 005: Fix Shell Completion for All Commands

**Objective:** Ensure all CLI commands have shell tab completion, with atom name arguments showing recent atoms first when empty string.

**Problem:** Phase 3 added new commands (capture, auth, publish) but completion.js only handled dev/build/note. Also added preventive measure to catch this in future.

**Solution:** 
1. Add capture, auth, publish to atomCommands list in setupCompletion()
2. Add all 10 commands to top-level completion suggestions
3. Reverse atom list to show newest (most recent date) first
4. Add code comment flagging atomCommands list for future additions

**Files Modified:**
- cli/lib/completion.js

**Changes:**
- getAtomNames(): sort then reverse to get reverse chronological order
- getShortNames(): preserve reverse order from getAtomNames()
- setupCompletion(): add atomCommands list with all atom-taking commands, update command list
- Added preventive comment for future developers

**Verification:**
- Atom list shows reverse chronological order (newest at top)
- All 10 commands (create, dev, build, capture, list, note, status, auth, publish, completion) in top-level completion
- capture, auth, publish commands now complete atom names

