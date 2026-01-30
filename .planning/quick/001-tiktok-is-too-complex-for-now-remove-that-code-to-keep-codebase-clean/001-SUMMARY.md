---
phase: quick-001-tiktok-is-too-complex-for-now-remove-that-code-to-keep-codebase-clean
plan: 01
subsystem: cli
tags: [youtube, oauth2, cli]

# Dependency graph
requires:
  - phase: 03-video-capture-distribution
    provides: youtube publishing pipeline
provides:
  - youtube-only auth and publish surface
  - removed tiktok platform client and exports
affects: [future-publishing-integrations]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - lib/platforms/index.js
    - lib/platforms/oauth-manager.js
    - cli/commands/auth.js
    - cli/commands/publish.js
    - cli/commands/capture.js

key-decisions:
  - "Scope publishing CLI to YouTube only; remove dormant TikTok paths to reduce surface area"

patterns-established:
  - "CLI platform options should reflect actively supported providers only"

# Metrics
duration: 0m
completed: 2026-01-30
---

# Plan 01: TikTok is too complex for now — remove that code to keep codebase clean Summary

**Publishing layer simplified to YouTube-only, removing unused TikTok client, auth token handling, and CLI prompts**

## Performance

- **Duration:** 0m
- **Started:** 2026-01-30T13:47:10Z
- **Completed:** 2026-01-30T13:47:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Removed TikTok client module and exports from platform layer, leaving only YouTube helpers
- Simplified auth and publish CLI commands to accept and execute only YouTube flows
- Updated capture command guidance to list only YouTube outputs and next-step instructions

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove TikTok platform code and exports** - `827249c` (chore)
2. **Task 2: Simplify CLI auth and publish commands to YouTube-only** - `923dbcd` (chore)
3. **Task 2 deviation cleanup: Capture guidance YouTube-only** - `66077c5` (chore)

## Files Created/Modified
- `lib/platforms/index.js` - Dropped TikTok export; now only YouTube helpers
- `lib/platforms/oauth-manager.js` - Removed TikTok access token helper
- `cli/commands/auth.js` - Restricted to YouTube auth flow only; removed TikTok token prompts
- `cli/commands/publish.js` - Limited to YouTube publishing and NOTES tracking
- `cli/commands/capture.js` - Output summary and next-step guidance now YouTube-only

## Decisions Made
- Scope CLI publishing surface to YouTube only until TikTok integration is ready, removing dormant code paths

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Capture guidance still referenced TikTok outputs**
- **Found during:** Post-task verification
- **Issue:** CLI capture summary and next-step hints still suggested TikTok outputs and publish commands
- **Fix:** Removed TikTok lines from capture summary and guidance
- **Files modified:** cli/commands/capture.js
- **Verification:** rg "tiktok" cli/commands shows no references
- **Committed in:** 66077c5

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary cleanup to keep CLI messaging aligned with YouTube-only scope; no scope creep.

## Issues Encountered
- None

## User Setup Required
None - no external configuration changes.

## Next Phase Readiness
- Publishing surface now cleanly reflects supported YouTube flow; future reintroduction of TikTok should add platform support explicitly with tested paths.

---
*Phase: quick-001-tiktok-is-too-complex-for-now-remove-that-code-to-keep-codebase-clean*
*Completed: TODO*
