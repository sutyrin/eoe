---
phase: quick-024
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - scripts/session-analysis/extract.py
  - scripts/session-analysis/analyze-batch.py
  - scripts/session-analysis/report.py
autonomous: true

must_haves:
  truths:
    - "User can run extract.py to produce compressed session digests from raw JSONL"
    - "User can run analyze-batch.py to feed digests to an LLM and get structured analysis"
    - "User can run report.py to aggregate batch analyses into a final macro report"
  artifacts:
    - path: "scripts/session-analysis/extract.py"
      provides: "Preprocessing pipeline: JSONL -> compressed digests"
    - path: "scripts/session-analysis/analyze-batch.py"
      provides: "LLM batch analysis of session digests"
    - path: "scripts/session-analysis/report.py"
      provides: "Aggregation of batch results into macro report"
  key_links:
    - from: "extract.py"
      to: "/mnt/db/claude/sessions/"
      via: "reads index.csv + sources/ JSONL files"
    - from: "analyze-batch.py"
      to: "extract.py output"
      via: "reads digest JSON files from output dir"
---

<objective>
Build a 3-stage pipeline to analyze 2,363 Claude session dialogues for macro patterns.

**The core design question answered: what should scripts do vs LLM?**

Scripts (extract.py) handle:
- Parse JSONL, extract user messages in full, summarize assistant messages
- Strip tool_use input/output (file contents, bash output, grep results) - these are 80%+ of session bulk
- Keep assistant thinking blocks (truncated), text responses (truncated to first 500 chars), and tool names called (without payloads)
- Compute session metadata: duration, turn count, project, tools used, message sizes
- Output compressed "digest" JSON files (~10-50x compression vs raw JSONL)

LLM (analyze-batch.py) handles:
- Classify session intent (feature build, bug fix, refactor, research, config, etc.)
- Rate prompt quality (clarity, specificity, context provided)
- Identify workflow patterns (iteration style, delegation style, recovery from errors)
- Detect anti-patterns (vague prompts, over-correction, context dumps, premature optimization)

Report (report.py) handles:
- Aggregate batch analyses into macro view
- Project-level patterns, time-of-day patterns, evolution over months
- Top recommendations

Purpose: Understand personal LLM usage patterns to improve productivity.
Output: Three runnable Python scripts in scripts/session-analysis/
</objective>

<execution_context>
@/home/pavel/.claude/get-shit-done/workflows/execute-plan.md
@/home/pavel/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
Data location: /mnt/db/claude/sessions/
Index: /mnt/db/claude/sessions/index.csv (columns: date,source,project,session_id,size_bytes,file_path)
Sessions: /mnt/db/claude/sessions/sources/{file_path} (JSONL files)

JSONL line types:
- file-history-snapshot: keys [isSnapshotUpdate, messageId, snapshot, type] -- SKIP entirely
- user (no toolUseResult): keys [message.role, message.content (str)] -- KEEP full text
- user (with toolUseResult): keys [toolUseResult.type, toolUseResult.file, message.content (list of tool_result)] -- KEEP only tool name + truncated summary
- assistant: keys [message.content (list)] where items are:
  - type=thinking: thinking text -- KEEP first 200 chars
  - type=text: response text -- KEEP first 500 chars
  - type=tool_use: name + input -- KEEP tool name only, DROP input payload
- summary: session summary -- KEEP in full
- progress: -- SKIP

Session stats from discovery:
- 2,363 sessions, 1.37 GB total
- 208 empty, 271 < 1KB, 551 1-10KB, 424 10-100KB, 547 100KB-1MB, 362 > 1MB
- Top projects: tm (642), tesla (547+workers), codev (50), dost (49), eoe (42)
- Top tools: Bash (dominant), Read, Edit, TodoWrite, Grep, Write, Glob
</context>

<tasks>

<task type="auto">
  <name>Task 1: Session digest extractor (extract.py)</name>
  <files>scripts/session-analysis/extract.py</files>
  <action>
Create extract.py that reads sessions from /mnt/db/claude/sessions/ and produces compressed digest files.

**Input:** /mnt/db/claude/sessions/index.csv + sources/
**Output:** output dir (default: /mnt/db/claude/sessions/digests/) with one JSON file per session + a digests-index.csv

**Per-session digest JSON structure:**
```json
{
  "session_id": "uuid",
  "date": "2025-11-15",
  "source": "desktop-claude",
  "project": "-home-pavel-dev-tm",
  "project_clean": "tm",
  "raw_size_bytes": 123456,
  "digest_size_bytes": 4567,
  "duration_minutes": 45,
  "turn_count": 12,
  "tools_used": {"Bash": 8, "Read": 3, "Edit": 1},
  "turns": [
    {
      "role": "user",
      "text": "full user message text here",
      "has_tool_result": false,
      "char_count": 234
    },
    {
      "role": "user_tool_result",
      "tool_name": "Read",
      "summary": "tool_result for Read (11397 chars)",
      "char_count": 11397
    },
    {
      "role": "assistant",
      "thinking_preview": "first 200 chars of thinking...",
      "text_preview": "first 500 chars of text response...",
      "text_full_chars": 2400,
      "tools_called": ["Bash", "Read"],
      "tool_count": 2
    }
  ]
}
```

**Extraction rules:**
1. Skip `file-history-snapshot` and `progress` lines entirely
2. For `user` lines WITHOUT toolUseResult: extract message.content as full text (it's a string)
3. For `user` lines WITH toolUseResult: record as "user_tool_result" with tool type and size only
4. For `assistant` lines: iterate message.content list:
   - thinking: keep first 200 chars
   - text: keep first 500 chars, record full length
   - tool_use: record name only, count occurrences
5. For `summary` lines: keep full content
6. Skip empty sessions (0 bytes)
7. Compute duration from first to last timestamp
8. Clean project names: strip leading `-home-pavel-dev-` or `-home-pavel-`, map known projects (tm, tesla, codev, dost, eoe, etc.), collapse tesla worker variants to "tesla"

**CLI interface:**
```
python3 extract.py [--input-dir /mnt/db/claude/sessions] [--output-dir /mnt/db/claude/sessions/digests] [--limit N] [--project FILTER]
```

--limit processes only first N sessions (for testing). --project filters to matching project names.

**digests-index.csv columns:** session_id, date, project, project_clean, raw_size, digest_size, duration_minutes, turn_count, top_tools

Print progress every 100 sessions. Print final stats: total processed, total raw size, total digest size, compression ratio.
  </action>
  <verify>
Run: `python3 scripts/session-analysis/extract.py --limit 20 --output-dir /tmp/test-digests`
Verify:
- Creates JSON digest files in output dir
- Creates digests-index.csv
- Each digest has expected structure (spot-check 2-3)
- Compression ratio is 10x+ vs raw
- No crashes on edge cases (empty sessions, missing fields)
  </verify>
  <done>extract.py processes sessions into compressed digests with 10x+ compression, preserving full user messages and assistant summaries</done>
</task>

<task type="auto">
  <name>Task 2: LLM batch analyzer (analyze-batch.py)</name>
  <files>scripts/session-analysis/analyze-batch.py</files>
  <action>
Create analyze-batch.py that feeds session digests to Claude API for structured analysis.

**Prerequisites:** Requires ANTHROPIC_API_KEY env var. Uses anthropic Python SDK (pip install anthropic).

**Strategy:** Group sessions into batches by project. For each batch, send 5-15 session digests (depending on size, targeting ~50K tokens input) with an analysis prompt.

**Per-batch analysis prompt template:**
```
You are analyzing Claude Code session transcripts for a solo developer.
Each session is a compressed digest: user messages are shown in full,
assistant responses are summarized (first 500 chars + tool names).

Analyze these {N} sessions from project "{project}" ({date_range}).

For each session, provide:
1. intent: classify as one of [feature-build, bug-fix, refactor, research, config-setup, exploration, planning, testing, deployment, other]
2. prompt_quality: rate 1-5 with brief reason
   - 5: Clear goal, good context, specific constraints
   - 3: Understandable but missing context or vague
   - 1: Ambiguous, no context, likely to produce wrong output
3. workflow_pattern: classify as one of [direct-instruction, iterative-refinement, exploratory-dialogue, error-recovery, delegation-chain, context-dump]
4. delegation_effectiveness: rate 1-5 (how well did the human leverage Claude's capabilities?)
5. notable_patterns: list any anti-patterns or good patterns observed
6. session_summary: one sentence describing what was accomplished

Then provide a batch-level summary:
- Common patterns across these sessions
- Recurring anti-patterns
- What this developer does well
- What this developer could improve

Respond in JSON format.
```

**Batch output structure (per batch):**
```json
{
  "batch_id": "tm_2025-11",
  "project": "tm",
  "date_range": "2025-11-01 to 2025-11-30",
  "session_count": 12,
  "model_used": "claude-sonnet-4-20250514",
  "sessions": [
    {
      "session_id": "uuid",
      "intent": "feature-build",
      "prompt_quality": 4,
      "prompt_quality_reason": "Clear goal but missing acceptance criteria",
      "workflow_pattern": "iterative-refinement",
      "delegation_effectiveness": 3,
      "notable_patterns": ["good-context-setting", "over-correction-mid-session"],
      "session_summary": "Built user authentication flow with JWT tokens"
    }
  ],
  "batch_summary": {
    "common_patterns": [],
    "anti_patterns": [],
    "strengths": [],
    "improvements": []
  }
}
```

**CLI interface:**
```
python3 analyze-batch.py [--digests-dir /mnt/db/claude/sessions/digests] [--output-dir /mnt/db/claude/sessions/analysis] [--batch-size 10] [--project FILTER] [--limit N] [--model claude-sonnet-4-20250514] [--dry-run]
```

--dry-run prints batch groupings and estimated token counts without calling API.
--limit limits total sessions analyzed.
Use claude-sonnet-4-20250514 as default model (cost-effective for analysis).

**Batching logic:**
1. Read digests-index.csv, sort by project then date
2. Group by project
3. Within each project, chunk into batches of --batch-size sessions
4. For each batch, concatenate digests, estimate tokens (~4 chars/token)
5. If estimated tokens > 80K, reduce batch size for that batch
6. Call API with structured prompt, parse JSON response
7. Save batch result JSON to output dir
8. Print progress: batch N/M, project, sessions, tokens, cost estimate

**Error handling:**
- Retry on rate limit (429) with exponential backoff, max 3 retries
- Skip and log on any other API error
- Save partial results (write each batch result immediately)

**Cost tracking:** Print running total of input/output tokens and estimated cost ($3/MTok input, $15/MTok output for Sonnet).
  </action>
  <verify>
Run: `python3 scripts/session-analysis/analyze-batch.py --dry-run --limit 30`
Verify:
- Dry run shows batch groupings, estimated tokens, no API calls
- Batch sizes respect token limits
Then run: `python3 scripts/session-analysis/analyze-batch.py --limit 10 --output-dir /tmp/test-analysis`
Verify:
- Produces batch JSON files with expected structure
- Sessions have all analysis fields
- Cost tracking prints reasonable numbers
  </verify>
  <done>analyze-batch.py groups digests into batches, calls Claude API for structured analysis, handles errors and tracks costs</done>
</task>

<task type="auto">
  <name>Task 3: Macro report aggregator (report.py)</name>
  <files>scripts/session-analysis/report.py</files>
  <action>
Create report.py that aggregates batch analysis results into a comprehensive macro report.

**Input:** Directory of batch analysis JSON files (from analyze-batch.py output)
**Output:** Markdown report file

**CLI:**
```
python3 report.py [--analysis-dir /mnt/db/claude/sessions/analysis] [--output /mnt/db/claude/sessions/ANALYSIS-REPORT.md]
```

**Report sections:**

1. **Overview**: Total sessions analyzed, date range, projects covered, total estimated cost of analysis

2. **Session Intent Distribution**: Bar chart (ASCII) of intent categories. Table with counts and percentages.

3. **Prompt Quality Analysis**:
   - Average score overall and by project
   - Distribution histogram (1-5)
   - Bottom 10 sessions by prompt quality (session_id, project, date, reason) -- these are improvement targets
   - Top 10 sessions by prompt quality -- these are examples to replicate

4. **Workflow Pattern Analysis**:
   - Distribution of workflow patterns
   - Pattern by project (some projects may be more exploratory, others more direct)
   - Pattern evolution over time (monthly)

5. **Delegation Effectiveness**:
   - Average score overall and by project
   - Correlation with prompt quality (do better prompts = better delegation?)
   - Bottom 10 and top 10 sessions

6. **Anti-Pattern Catalog**:
   - Aggregate all notable_patterns across sessions
   - Count occurrences of each
   - Group into "things to stop doing" vs "things to keep doing"

7. **Project Profiles**:
   - Per-project summary: session count, avg quality, avg delegation, common patterns, primary intents
   - Which projects have best/worst patterns

8. **Temporal Patterns**:
   - Sessions per week/month
   - Average quality over time (improving? degrading?)
   - Tool usage evolution

9. **Recommendations** (aggregated from batch summaries):
   - Top 5 things to improve (most frequently cited across batches)
   - Top 5 strengths to maintain
   - Specific actionable changes

**Implementation:**
- Pure Python, no external deps (just json, csv, os, collections, datetime)
- ASCII bar charts using simple `#` characters, scaled to terminal width 80
- Tables in Markdown format
- Sort recommendations by frequency across batches

Print: "Report written to {output_path}" with word count.
  </action>
  <verify>
Create 2-3 mock batch analysis JSON files in /tmp/test-analysis/ (or use real ones from Task 2 if available).
Run: `python3 scripts/session-analysis/report.py --analysis-dir /tmp/test-analysis --output /tmp/test-report.md`
Verify:
- Report has all 9 sections
- Tables are properly formatted Markdown
- ASCII charts render correctly
- Recommendations section is populated
  </verify>
  <done>report.py produces a comprehensive Markdown analysis report with distributions, patterns, project profiles, temporal trends, and actionable recommendations</done>
</task>

</tasks>

<verification>
Full pipeline test (after all 3 tasks):
1. `python3 scripts/session-analysis/extract.py --limit 50` -- produces digests
2. `python3 scripts/session-analysis/analyze-batch.py --limit 20` -- produces analysis batches
3. `python3 scripts/session-analysis/report.py` -- produces report
4. The report should contain meaningful insights even from 20 sessions
</verification>

<success_criteria>
- extract.py achieves 10x+ compression while preserving full user messages
- analyze-batch.py successfully calls Claude API and produces structured analysis JSON
- report.py generates a readable Markdown report with all 9 sections
- Full pipeline runs end-to-end on a subset of sessions
- Scripts are parameterized (input/output dirs, limits, filters) for iterative use
</success_criteria>

<output>
After completion, create `.planning/quick/024-llm-session-analysis-pipeline/024-SUMMARY.md`
</output>
