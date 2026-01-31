---
phase: quick
plan: 010
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
must_haves:
  truths:
    - "Any GSD task that posts to chat includes a Telethon-based verification step."
    - "The Telethon verification rule is discoverable by future planners/executors."
    - "The rule is enforced through documented guidance for GSD tasks."
  artifacts:
    - path: ".planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-RULE.md"
      provides: "Saved rule describing Telethon verification requirement for chat posting tasks"
    - path: ".planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-PLAN.md"
      provides: "Plan capturing the rule and its enforcement guidance"
  key_links:
    - from: ".planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-RULE.md"
      to: "GSD task authors"
      via: "Explicit instruction to include Telethon verification when posting to chat"
      pattern: "Telethon verification"
---

<objective>
Capture a critical rule: whenever a task involves posting something to chat, it must include Telethon-based verification, and this requirement must be discoverable and enforced for future GSD tasks.

Purpose: Prevent regressions where chat-posting tasks skip verification; encode the Telethon verification rule in a durable, findable location for planners and executors.
Output: A saved rule file with clear guidance on applying Telethon verification to chat-post tasks.
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Create rule file documenting Telethon verification requirement</name>
  <files>.planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-RULE.md</files>
  <action>
  - Create 010-RULE.md capturing the rule: any task that posts to chat must include Telethon-based verification of the post.
  - Include sections: "Rule", "Applicability", "How to apply" (steps for planners/executors), and "Example wording" (snippet planners can paste into plans).
  - Emphasize that verification must use Telethon to confirm the message actually appears in chat after posting.
  - Keep concise (quick task) and self-contained.
  </action>
  <verify>
  - File exists and contains the Telethon verification rule with the required sections.
  - Content explicitly states verification must be performed via Telethon after posting to chat.
  </verify>
  <done>
  - 010-RULE.md present with clear, actionable Telethon verification guidance for chat-post tasks.
  </done>
</task>

</tasks>

<verification>
- Confirm 010-RULE.md exists and the rule text mandates Telethon verification for any chat-posting task.
</verification>

<success_criteria>
- Telethon verification rule is written, scoped to chat-post tasks, and actionable for future plans.
- Rule file is discoverable under .planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-RULE.md.
</success_criteria>

<output>
After completion, create `.planning/quick/010-when-task-is-to-post-smth-to-chat-go-and/010-SUMMARY.md`
</output>
