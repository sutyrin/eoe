---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - cli/commands/dev.js
  - cli/commands/build.js
  - cli/commands/note.js
autonomous: true

must_haves:
  truths:
    - "eoe dev my-first-sketch starts Vite dev server for atoms/2026-01-30-my-first-sketch"
    - "eoe dev 2026-01-30-my-first-sketch also works (exact match still supported)"
    - "eoe build and eoe note also resolve short names the same way"
    - "Ambiguous short names (multiple atoms with same suffix) produce a clear error listing matches"
  artifacts:
    - path: "cli/commands/dev.js"
      provides: "Atom lookup with short-name resolution"
    - path: "cli/commands/build.js"
      provides: "Same short-name resolution for build"
    - path: "cli/commands/note.js"
      provides: "Same short-name resolution for note"
  key_links:
    - from: "cli/commands/dev.js"
      to: "atoms/ directory listing"
      via: "resolveAtomPath helper"
      pattern: "resolveAtomPath"
---

<objective>
Fix atom lookup in `eoe dev`, `eoe build`, and `eoe note` commands so users can reference atoms by short name (e.g., `my-first-sketch`) instead of requiring the full date-prefixed folder name (`2026-01-30-my-first-sketch`).

Purpose: `eoe status` displays short names but `eoe dev <short-name>` fails because it does a literal path lookup against the date-prefixed folder. This is a UX-breaking mismatch -- the CLI tells you your atom is called "my-first-sketch" then refuses to find it.

Output: All three commands resolve short names by scanning `atoms/` for suffix matches, with exact-match priority and ambiguity handling.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@cli/commands/dev.js
@cli/commands/build.js
@cli/commands/note.js
@cli/commands/status.js
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add resolveAtomPath helper and fix all three commands</name>
  <files>cli/commands/dev.js, cli/commands/build.js, cli/commands/note.js</files>
  <action>
The root cause: dev.js, build.js, and note.js all do `path.resolve('atoms', atomName)` which requires the FULL folder name (e.g., `2026-01-30-my-first-sketch`). But `eoe status` displays the SHORT name (`my-first-sketch`), so users naturally type the short name and get "Atom not found."

Create a shared `resolveAtomPath` function. Place it in a new file `cli/lib/resolve-atom.js` (keep the helper isolated from commands). The function should:

1. Accept `atomName` string (could be short name OR full date-prefixed name)
2. First try exact match: `path.resolve('atoms', atomName)` -- if exists, return it (preserves backward compat)
3. If no exact match, scan `atoms/` directory for folders ending with `-${atomName}` (the date-prefix pattern is `YYYY-MM-DD-name`, so a short name match is any folder whose suffix after the date matches)
4. If exactly ONE match found, return that path
5. If ZERO matches, return null (caller prints error)
6. If MULTIPLE matches (e.g., `2026-01-29-spiral` and `2026-01-30-spiral`), return null but also return the list of matches so the caller can print them

Function signature:
```js
export async function resolveAtomPath(atomName) {
  // Returns { path: string, name: string } | { error: 'not_found' } | { error: 'ambiguous', matches: string[] }
}
```

Then update all three commands:

**dev.js** - Replace the `path.resolve('atoms', atomName)` + `pathExists` check with a call to `resolveAtomPath`. On success, use the resolved path. On `not_found`, print the existing error. On `ambiguous`, print the matches and ask user to be more specific.

**build.js** - Same pattern. Replace lines 11-18 with resolveAtomPath call.

**note.js** - Same pattern. Replace lines 12-13 with resolveAtomPath call. Note: note.js has dual behavior (atom notes vs quick idea capture). The resolve should only apply when checking if it's an atom name; if resolve fails, fall through to the idea-capture behavior (existing logic).

Keep the error messages consistent with the existing style (chalk.red for errors, chalk.gray for hints). When ambiguous, print something like:
```
Multiple atoms match "spiral":
  2026-01-29-spiral
  2026-01-30-spiral
Use the full name to disambiguate.
```
  </action>
  <verify>
Run these commands from the project root to verify:

```bash
# Should resolve and start dev server (Ctrl+C to exit immediately)
cd /home/pavel/dev/play/eoe && node cli/index.js dev my-first-sketch

# Should also work with full name
cd /home/pavel/dev/play/eoe && node cli/index.js dev 2026-01-30-my-first-sketch

# Should fail gracefully for nonexistent atom
cd /home/pavel/dev/play/eoe && node cli/index.js dev nonexistent-atom

# Build should also resolve short names (will fail at vite but path resolution should work)
cd /home/pavel/dev/play/eoe && node cli/index.js build my-first-sketch

# Note should resolve short atom names to open NOTES.md
cd /home/pavel/dev/play/eoe && node cli/index.js note my-first-sketch
```

All five commands should produce the expected behavior (no "Atom not found" for valid short names).
  </verify>
  <done>
- `eoe dev my-first-sketch` resolves to `atoms/2026-01-30-my-first-sketch/` and starts Vite
- `eoe dev 2026-01-30-my-first-sketch` still works (exact match backward compat)
- `eoe dev nonexistent` prints "Atom not found" error
- `eoe build` and `eoe note` have identical short-name resolution
- Ambiguous names produce clear error with list of matches
- New shared helper lives in `cli/lib/resolve-atom.js`
  </done>
</task>

</tasks>

<verification>
1. `eoe status` shows atom names -> those same names work with `eoe dev`, `eoe build`, `eoe note`
2. Full date-prefixed names still work (backward compatibility)
3. Invalid names produce helpful error messages
4. No regressions in existing command behavior
</verification>

<success_criteria>
The names displayed by `eoe status` are directly usable as arguments to `eoe dev`, `eoe build`, and `eoe note`. The lookup mismatch between status (which strips dates) and other commands (which require dates) is eliminated.
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-eoe-dev-atom-lookup/001-SUMMARY.md`
</output>
