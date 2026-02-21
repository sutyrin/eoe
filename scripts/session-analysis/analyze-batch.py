#!/usr/bin/env python3
"""
LLM Batch Analyzer
Feeds session digests to Claude CLI for structured analysis.

Usage:
    python3 analyze-batch.py [--digests-dir DIR] [--output-dir DIR] [--batch-size N]
                             [--project FILTER] [--limit N] [--model MODEL] [--dry-run]

Uses `claude -p` CLI (no API key needed — uses Claude Code's own auth).
"""

import argparse
import csv
import json
import os
import subprocess
import sys
import tempfile
import time
from collections import defaultdict

# Ensure output is not buffered (critical when running as subprocess)
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)


ANALYSIS_PROMPT = """You are analyzing Claude Code session transcripts for a solo developer.
Each session is a compressed digest: user messages are shown in full,
assistant responses are summarized (first 500 chars + tool names).

Analyze these {n} sessions from project "{project}" ({date_range}).

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

Respond in JSON format with this exact structure:
{{
  "sessions": [
    {{
      "session_id": "uuid",
      "intent": "feature-build",
      "prompt_quality": 4,
      "prompt_quality_reason": "Clear goal but missing acceptance criteria",
      "workflow_pattern": "iterative-refinement",
      "delegation_effectiveness": 3,
      "notable_patterns": ["good-context-setting", "over-correction-mid-session"],
      "session_summary": "Built user authentication flow with JWT tokens"
    }}
  ],
  "batch_summary": {{
    "common_patterns": ["pattern1", "pattern2"],
    "anti_patterns": ["anti1", "anti2"],
    "strengths": ["strength1"],
    "improvements": ["improvement1"]
  }}
}}

Here are the session digests:

{digests}"""


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return len(text) // 4


def load_digests_index(digests_dir: str) -> list[dict]:
    """Load digests-index.csv."""
    index_path = os.path.join(digests_dir, "digests-index.csv")
    if not os.path.exists(index_path):
        print(f"Error: digests-index.csv not found at {index_path}", file=sys.stderr)
        sys.exit(1)

    rows = []
    with open(index_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows


def load_digest(digests_dir: str, session_id: str) -> dict | None:
    """Load a single digest JSON file."""
    path = os.path.join(digests_dir, f"{session_id}.json")
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def group_into_batches(index_rows: list[dict], digests_dir: str,
                       batch_size: int, max_tokens: int = 80000) -> list[dict]:
    """Group sessions into batches by project, respecting token limits."""
    # Group by project_clean
    by_project = defaultdict(list)
    for row in index_rows:
        by_project[row.get("project_clean", "unknown")].append(row)

    batches = []
    for project, rows in sorted(by_project.items()):
        # Sort by date within project
        rows.sort(key=lambda r: r.get("date", ""))

        current_batch = []
        current_tokens = 0

        for row in rows:
            digest = load_digest(digests_dir, row["session_id"])
            if digest is None:
                continue

            digest_text = json.dumps(digest, indent=None)
            digest_tokens = estimate_tokens(digest_text)

            # If adding this digest would exceed token limit, flush batch
            if current_batch and (len(current_batch) >= batch_size or
                                   current_tokens + digest_tokens > max_tokens):
                batches.append({
                    "project": project,
                    "sessions": current_batch,
                    "estimated_tokens": current_tokens,
                })
                current_batch = []
                current_tokens = 0

            current_batch.append({
                "row": row,
                "digest": digest,
                "digest_text": digest_text,
                "tokens": digest_tokens,
            })
            current_tokens += digest_tokens

        # Flush remaining
        if current_batch:
            batches.append({
                "project": project,
                "sessions": current_batch,
                "estimated_tokens": current_tokens,
            })

    return batches


def find_claude_cli() -> str:
    """Find claude CLI binary, resolving full path to avoid PATH issues in subprocess."""
    import shutil
    path = shutil.which("claude")
    if path:
        return path
    # Common locations
    for candidate in [
        os.path.expanduser("~/.nvm/versions/node/v23.11.0/bin/claude"),
        "/usr/local/bin/claude",
        "/usr/bin/claude",
    ]:
        if os.path.isfile(candidate):
            return candidate
    return "claude"  # fallback, hope PATH works


CLAUDE_BIN = find_claude_cli()


def call_claude_cli(model: str, prompt: str, timeout: int = 120, max_retries: int = 3) -> dict | None:
    """Call claude -p CLI. Returns parsed JSON dict or None on failure."""
    # Write prompt to temp file to avoid shell escaping issues
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as f:
        f.write(prompt)
        prompt_file = f.name

    try:
        for attempt in range(max_retries):
            # Build env without CLAUDECODE to allow nested invocation
            env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

            cmd = [
                CLAUDE_BIN, "-p",
                "--model", model,
                "--output-format", "text",
                "--no-session-persistence",
            ]

            try:
                result = subprocess.run(
                    cmd,
                    stdin=open(prompt_file, "r", encoding="utf-8"),
                    capture_output=True,
                    text=True,
                    timeout=timeout,
                    env=env,
                )
            except subprocess.TimeoutExpired:
                print(f"    Timeout after {timeout}s (attempt {attempt + 1}/{max_retries})")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            # claude -p writes response to stderr (not stdout)
            text = result.stderr.strip() or result.stdout.strip()

            if result.returncode != 0 and not text:
                print(f"    CLI error (exit {result.returncode}): {result.stderr[:200]}", file=sys.stderr)
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            if not text:
                print(f"    Empty response from CLI", file=sys.stderr)
                return None

            # Extract JSON from response
            json_text = text
            if "```json" in json_text:
                json_text = json_text.split("```json")[1].split("```")[0]
            elif "```" in json_text:
                parts = json_text.split("```")
                if len(parts) >= 3:
                    json_text = parts[1]

            try:
                return json.loads(json_text.strip())
            except json.JSONDecodeError:
                # Try to find JSON object in the text
                start = text.find("{")
                end = text.rfind("}") + 1
                if start >= 0 and end > start:
                    try:
                        return json.loads(text[start:end])
                    except json.JSONDecodeError:
                        pass
                print(f"    Failed to parse JSON from response ({len(text)} chars)", file=sys.stderr)
                print(f"    First 200 chars: {text[:200]}", file=sys.stderr)
                return None

        return None
    finally:
        os.unlink(prompt_file)


def main():
    parser = argparse.ArgumentParser(description="Batch-analyze session digests with Claude API")
    parser.add_argument("--digests-dir", default="/mnt/db/claude/sessions/digests",
                        help="Directory containing digest JSON files and digests-index.csv")
    parser.add_argument("--output-dir", default="/mnt/db/claude/sessions/analysis",
                        help="Output directory for batch analysis JSON files")
    parser.add_argument("--batch-size", type=int, default=10,
                        help="Max sessions per batch (default: 10)")
    parser.add_argument("--project", default="",
                        help="Filter to matching project")
    parser.add_argument("--limit", type=int, default=0,
                        help="Limit total sessions analyzed (0 = all)")
    parser.add_argument("--model", default="claude-sonnet-4-20250514",
                        help="Model to use for analysis")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show batch plan without calling API")
    parser.add_argument("--skip-existing", action="store_true",
                        help="Skip batches whose output file already exists")
    parser.add_argument("--start-batch", type=int, default=1,
                        help="Start from batch N (1-indexed, for resuming)")
    args = parser.parse_args()

    # Load index
    index_rows = load_digests_index(args.digests_dir)
    print(f"Loaded {len(index_rows)} sessions from digests index")

    # Filter by project
    if args.project:
        pf = args.project.lower()
        index_rows = [r for r in index_rows if pf in r.get("project_clean", "").lower()]
        print(f"Filtered to {len(index_rows)} sessions matching '{args.project}'")

    # Apply limit
    if args.limit > 0:
        index_rows = index_rows[:args.limit]
        print(f"Limited to {args.limit} sessions")

    # Group into batches
    batches = group_into_batches(index_rows, args.digests_dir, args.batch_size)
    total_sessions = sum(len(b["sessions"]) for b in batches)
    total_tokens = sum(b["estimated_tokens"] for b in batches)

    print(f"\nBatch plan: {len(batches)} batches, {total_sessions} sessions, ~{total_tokens:,} estimated input tokens")
    print(f"Estimated input cost: ${total_tokens * 3 / 1_000_000:.2f} (at $3/MTok)")
    print()

    # Print batch summary
    for i, batch in enumerate(batches):
        dates = [s["row"].get("date", "?") for s in batch["sessions"]]
        date_range = f"{min(dates)} to {max(dates)}" if dates else "?"
        print(f"  Batch {i+1}: project={batch['project']}, "
              f"sessions={len(batch['sessions'])}, "
              f"tokens=~{batch['estimated_tokens']:,}, "
              f"dates={date_range}")

    if args.dry_run:
        print("\n[DRY RUN] No API calls made.")
        return

    # Verify claude CLI is available
    try:
        subprocess.run([CLAUDE_BIN, "--version"], capture_output=True, timeout=5)
    except FileNotFoundError:
        print(f"Error: claude CLI not found at '{CLAUDE_BIN}'. Install Claude Code first.", file=sys.stderr)
        sys.exit(1)
    print(f"Using claude CLI: {CLAUDE_BIN}")

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Process batches
    successful_batches = 0

    print(f"\nProcessing {len(batches)} batches with model {args.model} via claude CLI...")
    print()

    for i, batch in enumerate(batches):
        project = batch["project"]
        sessions = batch["sessions"]
        dates = [s["row"].get("date", "?") for s in sessions]
        date_range = f"{min(dates)} to {max(dates)}" if dates else "?"

        # Skip batches before start-batch
        if i + 1 < args.start_batch:
            continue

        print(f"Batch {i+1}/{len(batches)}: project={project}, sessions={len(sessions)}, tokens=~{batch['estimated_tokens']:,}")

        # Build prompt
        digests_text = "\n\n---\n\n".join(
            f"SESSION: {s['row']['session_id']} (date: {s['row'].get('date', '?')})\n{s['digest_text']}"
            for s in sessions
        )

        prompt = ANALYSIS_PROMPT.format(
            n=len(sessions),
            project=project,
            date_range=date_range,
            digests=digests_text,
        )

        prompt_tokens = estimate_tokens(prompt)
        print(f"  Prompt tokens: ~{prompt_tokens:,}")

        # Call claude CLI
        t0 = time.time()
        result = call_claude_cli(args.model, prompt)
        elapsed = time.time() - t0

        if result is None:
            print(f"  FAILED after {elapsed:.1f}s - skipping batch")
            continue

        # Build batch output
        batch_id = f"{project}_{dates[0][:7] if dates else 'unknown'}"
        batch_output = {
            "batch_id": batch_id,
            "project": project,
            "date_range": date_range,
            "session_count": len(sessions),
            "model_used": args.model,
            "sessions": result.get("sessions", []),
            "batch_summary": result.get("batch_summary", {}),
        }

        # Save immediately
        output_path = os.path.join(args.output_dir, f"{batch_id}.json")
        # Handle duplicate batch IDs
        counter = 1
        while os.path.exists(output_path):
            output_path = os.path.join(args.output_dir, f"{batch_id}_{counter}.json")
            counter += 1

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(batch_output, f, indent=2, ensure_ascii=False)

        successful_batches += 1
        print(f"  Done: {len(result.get('sessions', []))} sessions analyzed in {elapsed:.1f}s")
        print(f"  Saved: {output_path}")

        # Brief pause between batches
        if i < len(batches) - 1:
            time.sleep(1)

    # Final stats
    print(f"\n{'='*60}")
    print(f"Analysis complete")
    print(f"{'='*60}")
    print(f"Batches: {successful_batches}/{len(batches)} successful")
    print(f"Output directory:    {args.output_dir}")


if __name__ == "__main__":
    main()
