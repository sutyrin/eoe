# Telethon Verification Rule for Chat-Posting Tasks

## Rule
Any GSD task that posts a message to chat **must include a Telethon-based verification step** to confirm the message appears in the target chat after posting.

## Applicability
- Applies to all tasks that create, update, or delete messages in chat via CLI, bot, or script.
- Applies to both manual and automated posting flows.
- Applies to planners writing tasks and executors performing them.

## How to apply (planners & executors)
1. **Plan inclusion:** In the plan, add a verification step explicitly stating that Telethon will be used to fetch the target chat/message to confirm the post is present (or absent, for deletions).
2. **Execution:** After posting, run a Telethon snippet/command to fetch recent messages (or the specific message by ID) and assert the expected content is present.
3. **Evidence:** Capture the Telethon check result (e.g., log/output) as proof during execution/summary.
4. **Failure handling:** If Telethon does not find the message, treat as failure and investigate (auth, chat ID, permissions, timing).

## Example wording (paste into plans)
- "Verification: Use Telethon to fetch the target chat after posting and confirm the new message text matches the expected content."
- "Verification: After the bot posts, run a Telethon script to retrieve the message by ID; fail if not returned or text mismatches."