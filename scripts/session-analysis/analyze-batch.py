#!/usr/bin/env python3
"""
LLM Batch Analyzer
Feeds session digests to Claude API for structured analysis.

Usage:
    python3 analyze-batch.py [--digests-dir DIR] [--output-dir DIR] [--batch-size N]
                             [--project FILTER] [--limit N] [--model MODEL] [--dry-run]

Requires: ANTHROPIC_API_KEY environment variable
"""

import argparse
import csv
import json
import os
import sys
import time
from collections import defaultdict


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


def call_api(client, model: str, prompt: str, max_retries: int = 3) -> tuple[dict | None, dict]:
    """Call Claude API with retry on rate limit. Returns (response_dict, usage_dict)."""
    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model=model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )

            # Extract text content
            text = ""
            for block in response.content:
                if block.type == "text":
                    text += block.text

            # Parse JSON from response
            # Try to find JSON in the response (may be wrapped in markdown code blocks)
            json_text = text
            if "```json" in json_text:
                json_text = json_text.split("```json")[1].split("```")[0]
            elif "```" in json_text:
                json_text = json_text.split("```")[1].split("```")[0]

            result = json.loads(json_text.strip())

            usage = {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            }

            return result, usage

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "rate" in error_str.lower():
                wait = (2 ** attempt) * 1
                print(f"    Rate limited, waiting {wait}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            elif "overloaded" in error_str.lower():
                wait = (2 ** attempt) * 2
                print(f"    API overloaded, waiting {wait}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            else:
                print(f"    API error: {e}", file=sys.stderr)
                return None, {"input_tokens": 0, "output_tokens": 0}

    print(f"    Max retries exceeded", file=sys.stderr)
    return None, {"input_tokens": 0, "output_tokens": 0}


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

    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("\nError: ANTHROPIC_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    # Import anthropic (only when actually needed)
    try:
        import anthropic
    except ImportError:
        print("Error: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Process batches
    total_input_tokens = 0
    total_output_tokens = 0
    successful_batches = 0

    print(f"\nProcessing {len(batches)} batches with model {args.model}...")
    print()

    for i, batch in enumerate(batches):
        project = batch["project"]
        sessions = batch["sessions"]
        dates = [s["row"].get("date", "?") for s in sessions]
        date_range = f"{min(dates)} to {max(dates)}" if dates else "?"

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

        # Call API
        result, usage = call_api(client, args.model, prompt)

        total_input_tokens += usage.get("input_tokens", 0)
        total_output_tokens += usage.get("output_tokens", 0)

        if result is None:
            print(f"  FAILED - skipping batch")
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
            "usage": usage,
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
        input_cost = usage.get("input_tokens", 0) * 3 / 1_000_000
        output_cost = usage.get("output_tokens", 0) * 15 / 1_000_000
        print(f"  Done: {len(result.get('sessions', []))} sessions analyzed, "
              f"cost: ${input_cost + output_cost:.4f} "
              f"({usage.get('input_tokens', 0)} in / {usage.get('output_tokens', 0)} out)")
        print(f"  Saved: {output_path}")

        # Brief pause between batches to avoid rate limits
        if i < len(batches) - 1:
            time.sleep(1)

    # Final stats
    total_cost = (total_input_tokens * 3 + total_output_tokens * 15) / 1_000_000
    print(f"\n{'='*60}")
    print(f"Analysis complete")
    print(f"{'='*60}")
    print(f"Batches: {successful_batches}/{len(batches)} successful")
    print(f"Total input tokens:  {total_input_tokens:>10,}")
    print(f"Total output tokens: {total_output_tokens:>10,}")
    print(f"Estimated cost:      ${total_cost:.4f}")
    print(f"Output directory:    {args.output_dir}")


if __name__ == "__main__":
    main()
