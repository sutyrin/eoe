---
phase: quick-001-tiktok-is-too-complex-for-now-remove-that-code-to-keep-codebase-clean
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - /home/pavel/dev/play/eoe/lib/platforms/index.js
  - /home/pavel/dev/play/eoe/lib/platforms/oauth-manager.js
  - /home/pavel/dev/play/eoe/lib/platforms/tiktok-client.js
  - /home/pavel/dev/play/eoe/cli/commands/auth.js
  - /home/pavel/dev/play/eoe/cli/commands/publish.js
autonomous: true
must_haves:
  truths:
    - "CLI auth command only supports YouTube and has no TikTok prompts or token handling"
    - "Publish command only lists and routes to YouTube with no TikTok branches or help text"
    - "Platform layer has no TikTok client or exports reachable from CLI"
  artifacts:
    - path: "/home/pavel/dev/play/eoe/lib/platforms/index.js"
      provides: "Exports limited to YouTube platform helpers"
    - path: "/home/pavel/dev/play/eoe/lib/platforms/oauth-manager.js"
      provides: "Only YouTube auth helpers, no TikTok token accessor"
    - path: "/home/pavel/dev/play/eoe/cli/commands/auth.js"
      provides: "CLI auth flow restricted to YouTube"
    - path: "/home/pavel/dev/play/eoe/cli/commands/publish.js"
      provides: "CLI publish flow restricted to YouTube"
  key_links:
    - from: "/home/pavel/dev/play/eoe/cli/commands/publish.js"
      to: "/home/pavel/dev/play/eoe/lib/platforms/index.js"
      via: "YouTube upload import only"
    - from: "/home/pavel/dev/play/eoe/cli/commands/auth.js"
      to: "/home/pavel/dev/play/eoe/lib/platforms/oauth-manager.js"
      via: "YouTube auth helper imports only"
---

<objective>
Remove TikTok-specific code paths to keep the CLI and platform layer focused on YouTube-only publishing for now.

Purpose: Reduce surface area and complexity by eliminating unused/unsupported TikTok integration.
Output: CLI commands and platform exports that only reference YouTube; TikTok client removed.
</objective>

<execution_context>
@/home/pavel/dev/play/eoe/.planning/STATE.md
</execution_context>

<context>
@/home/pavel/dev/play/eoe/cli/commands/auth.js
@/home/pavel/dev/play/eoe/cli/commands/publish.js
@/home/pavel/dev/play/eoe/lib/platforms/index.js
@/home/pavel/dev/play/eoe/lib/platforms/oauth-manager.js
@/home/pavel/dev/play/eoe/lib/platforms/tiktok-client.js
</context>

<tasks>

<task type="auto">
  <name>Remove TikTok platform code and exports</name>
  <files>/home/pavel/dev/play/eoe/lib/platforms/index.js, /home/pavel/dev/play/eoe/lib/platforms/oauth-manager.js, /home/pavel/dev/play/eoe/lib/platforms/tiktok-client.js</files>
  <action>
    - Delete the TikTok client module and stop exporting it from the platform index.
    - Remove TikTok access token helpers from oauth-manager so only YouTube auth utilities remain.
    - Ensure no remaining TikTok references are reachable from platform exports.
  </action>
  <verify>rg "tiktok" /home/pavel/dev/play/eoe/lib/platforms -n</verify>
  <done>TikTok client file removed and platform layer only exposes YouTube helpers.</done>
</task>

<task type="auto">
  <name>Simplify CLI auth and publish commands to YouTube-only</name>
  <files>/home/pavel/dev/play/eoe/cli/commands/auth.js, /home/pavel/dev/play/eoe/cli/commands/publish.js</files>
  <action>
    - Update auth command to validate only YouTube, drop TikTok branches and token prompts.
    - Update publish command to accept only YouTube as a valid platform, remove TikTok option handling and result logging, and simplify help text accordingly.
    - Ensure NOTES/atom tracking logic remains functional for YouTube flow.
  </action>
  <verify>rg "tiktok" /home/pavel/dev/play/eoe/cli/commands -n</verify>
  <done>CLI commands offer and execute only YouTube auth/publish with no TikTok references in code or help text.</done>
</task>

</tasks>

<verification>
- Ripgrep shows no TikTok references under /home/pavel/dev/play/eoe/lib/platforms or /home/pavel/dev/play/eoe/cli/commands.
</verification>

<success_criteria>
- TikTok client file removed and not exported.
- Auth command supports only YouTube with clear messaging.
- Publish command routes exclusively to YouTube and help text lists only YouTube.
</success_criteria>

<output>
After completion, create `.planning/quick/001-tiktok-is-too-complex-for-now-remove-that-code-to-keep-codebase-clean/001-SUMMARY.md`
</output>
