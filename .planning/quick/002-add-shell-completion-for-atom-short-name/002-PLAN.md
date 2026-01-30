---
phase: quick-002
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - cli/lib/completion.js
autonomous: true

must_haves:
  truths:
    - "Typing `eoe dev my<tab>` completes to `my-first-sketch` (short name without date prefix)"
    - "Typing `eoe build work<tab>` completes to `workflow-test` (short name)"
    - "Typing `eoe dev 2026<tab>` still completes full date-prefixed names (backward compat)"
    - "When multiple atoms share a short-name prefix, all matching short names are offered"
    - "Short-name completions resolve unambiguously to the correct full atom directory at execution time"
  artifacts:
    - path: "cli/lib/completion.js"
      provides: "Shell completion with short-name atom suggestions"
      exports: ["getAtomNames", "getShortNames", "setupCompletion"]
  key_links:
    - from: "cli/lib/completion.js"
      to: "atoms/ directory"
      via: "fs.readdir scanning and date-prefix stripping"
      pattern: "replace.*\\d{4}-\\d{2}-\\d{2}-"
    - from: "cli/lib/completion.js"
      to: "cli/lib/resolve-atom.js"
      via: "shared naming convention (short name = folder name minus YYYY-MM-DD- prefix)"
      pattern: "conceptual alignment, not direct import"
---

<objective>
Add short-name atom completion to the eoe CLI shell tab completion.

Purpose: Currently `eoe dev <tab>` only suggests full date-prefixed names like `2026-01-30-my-first-sketch`. Users need to type `eoe dev my<tab>` and get `my-first-sketch` suggested, matching the short-name resolution already supported by `resolveAtomPath` in runtime commands.

Output: Updated `cli/lib/completion.js` that suggests both short names and full names for atom arguments, so tab completion aligns with the short-name CLI UX.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Key source files:
@cli/lib/completion.js - Current completion logic (suggests full atom names only)
@cli/lib/resolve-atom.js - Short-name resolution logic (suffix matching, ambiguity handling)
@cli/index.js - CLI entry point with tabtab env check
@cli/commands/completion.js - Completion install/uninstall commands
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add short-name completion suggestions to completion.js</name>
  <files>cli/lib/completion.js</files>
  <action>
Modify `cli/lib/completion.js` to suggest short atom names (without date prefix) alongside full names when completing atom arguments for `dev`, `build`, and `note` commands.

Specific changes:

1. Add a `getShortNames()` export that derives short names from atom folder names by stripping the `YYYY-MM-DD-` date prefix pattern. Use regex `/^\d{4}-\d{2}-\d{2}-/` to detect and strip the prefix. If a folder name does NOT match the date-prefix pattern, include it as-is (it is already a "short name").

2. Update `setupCompletion(env)` so that when completing after `dev`, `build`, or `note`:
   - Collect both full atom names (from `getAtomNames()`) AND short names (from `getShortNames()`)
   - Deduplicate: if a folder has no date prefix, it appears only once (not as both "full" and "short")
   - Pass the combined unique list to `tabtab.log()`
   - Short names should appear FIRST in the list (they are the primary UX), followed by full names

3. Ambiguity handling for completion: If multiple atoms produce the same short name (e.g., `2026-01-29-demo` and `2026-01-30-demo` both yield `demo`), include the short name ONCE in completions. The ambiguity is handled at execution time by `resolveAtomPath` which shows all matches. At completion time, offering `demo` once is correct -- the user will see the ambiguity error when they run the command, which tells them to use the full name.

4. Handle `env.lastPartial` filtering: tabtab provides `env.lastPartial` which is what the user has typed so far. Both short and full names should be filtered against this partial. Do NOT manually filter -- tabtab handles partial matching internally. Just provide the full list.

Do NOT import resolve-atom.js -- the completion module should remain self-contained with its own fs scanning (it already has `getAtomNames()`). The date-prefix stripping is trivial and does not warrant a shared dependency.

Do NOT change cli/commands/completion.js, cli/index.js, or any other file.
  </action>
  <verify>
Run `node cli/lib/completion.js` to confirm no syntax errors (it will exit cleanly as a module).

Verify the logic manually:
```bash
# Simulate what tabtab does -- list atoms and check short names appear
node -e "
  import('./cli/lib/completion.js').then(async m => {
    const full = await m.getAtomNames();
    const short = await m.getShortNames();
    console.log('Full names:', full);
    console.log('Short names:', short);
  });
"
```

Expected output should show:
- Full names: `['2026-01-29-workflow-test', '2026-01-30-my-first-sketch', '2026-01-30-test-verify']`
- Short names: `['workflow-test', 'my-first-sketch', 'test-verify']`
  </verify>
  <done>
- `getShortNames()` is exported and returns atom names with date prefixes stripped
- `setupCompletion()` suggests both short names and full names for dev/build/note commands
- Short names appear first in completion list
- Duplicate short names (from multiple dates) appear only once
- No changes to any file other than cli/lib/completion.js
  </done>
</task>

<task type="auto">
  <name>Task 2: Verify end-to-end completion behavior</name>
  <files>cli/lib/completion.js</files>
  <action>
Test the full completion pipeline by simulating tabtab environment variables, which is how shell completion actually works.

tabtab works by setting environment variables and re-invoking the CLI. Simulate this:

```bash
# Simulate: eoe dev <tab> (completing after "dev")
COMP_LINE="eoe dev " COMP_POINT=8 COMP_CWORD=2 node cli/index.js completion -- eoe dev ""

# Simulate: eoe dev my (completing partial "my")
COMP_LINE="eoe dev my" COMP_POINT=10 COMP_CWORD=2 node cli/index.js completion -- eoe dev my

# Simulate: eoe build 2026 (completing partial "2026")
COMP_LINE="eoe build 2026" COMP_POINT=14 COMP_CWORD=2 node cli/index.js completion -- eoe build 2026
```

If the tabtab env simulation is tricky (tabtab v3 uses specific env var names), fall back to directly testing the module:

```bash
node -e "
  import('./cli/lib/completion.js').then(async m => {
    // Test setupCompletion with mock env
    const env = { complete: true, prev: 'dev', lastPartial: '' };
    // Can't easily capture tabtab.log output, so just verify functions work
    const full = await m.getAtomNames();
    const short = await m.getShortNames();
    console.log('Full:', full);
    console.log('Short:', short);

    // Verify short names are proper substrings
    const datePattern = /^\d{4}-\d{2}-\d{2}-/;
    for (const name of full) {
      if (datePattern.test(name)) {
        const expected = name.replace(datePattern, '');
        if (!short.includes(expected)) {
          console.error('FAIL: missing short name for', name);
          process.exit(1);
        }
      }
    }
    console.log('All short names correctly derived');
  });
"
```

If any test fails, fix the issue in cli/lib/completion.js.
  </action>
  <verify>
All test commands exit with code 0 and produce expected output. Short names are present and correctly derived from full names.
  </verify>
  <done>
- Short-name completion verified working for dev, build, note commands
- Full-name completion still works (backward compatibility)
- Date-prefix stripping correctly handles YYYY-MM-DD- pattern
- No runtime errors in completion pipeline
  </done>
</task>

</tasks>

<verification>
1. `getShortNames()` returns date-stripped atom names
2. `setupCompletion()` provides both short and full names for atom-accepting commands
3. No changes to files outside `cli/lib/completion.js`
4. Module imports cleanly with no errors
5. Existing command-level completion (top-level `eoe <tab>` showing create/dev/build/etc.) still works
</verification>

<success_criteria>
- `eoe dev my<tab>` suggests `my-first-sketch` (short name)
- `eoe dev 2026<tab>` suggests full date-prefixed names
- `eoe build work<tab>` suggests `workflow-test`
- `eoe <tab>` still shows command names (create, dev, build, etc.)
- Only cli/lib/completion.js modified
</success_criteria>

<output>
After completion, create `.planning/quick/002-add-shell-completion-for-atom-short-name/002-SUMMARY.md`
</output>
