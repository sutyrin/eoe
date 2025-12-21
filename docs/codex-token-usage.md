# Token usage from Codex CLI logs

## Direct (preferred): token_count events
Codex CLI session logs include `event_msg` entries with `type: "token_count"`.
They carry `total_token_usage` (cumulative for the session) and `last_token_usage`
(tokens for the latest request). This is the most direct local source of truth.

### Where the logs live
- `~/.codex/sessions/YYYY/MM/DD/*.jsonl`
- `~/.codex/history.jsonl`
- `~/.codex/log/codex-tui.log`

### Quick summary script
```
./scripts/codex_token_usage.py --date 2025-12-21
```

Output columns:
- `sessions`: number of Codex sessions for the day
- `missing`: sessions that had no `token_count` info
- `input`, `cached`, `output`, `reasoning`, `total`: summed from per‑session max `total_token_usage`
Numbers are printed with a space thousands separator for readability.

Notes:
- `cached_input_tokens` can be non‑zero when the model reuses cached context.
- By default the script uses **session deltas** (max − min of `total_token_usage`)
  so it still works if totals are cumulative across sessions.

### Per‑request totals (deduped)
```
./scripts/codex_token_usage.py --date 2025-12-21 --mode request
```

This mode sums `last_token_usage` across `token_count` events and dedupes
identical entries to avoid double counting repeated telemetry ticks.

### Per‑request usage
Inside a session JSONL, each `event_msg` with `payload.type == "token_count"` and
`info.last_token_usage` corresponds to the most recent request. Use those to build
per‑request analytics (dedupe duplicates if needed).

## Approximate fallback (when token_count is missing)
If a session lacks `token_count`, you can approximate by tokenizing messages
with `tiktoken` and summing the prompt/response texts. This is only an estimate
and may differ from billed usage.

Example outline:
```
python - <<'PY'
import tiktoken
# parse ~/.codex/sessions/YYYY/MM/DD/*.jsonl
# count tokens for user/assistant/system messages
PY
```

## External sources (most accurate when you use API keys)
- OpenAI Usage Dashboard for account‑level totals.
- API responses expose `usage` fields per request (when using OpenAI APIs).
