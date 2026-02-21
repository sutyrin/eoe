#!/usr/bin/env python3
"""
Session Digest Extractor
Reads Claude session JSONL files and produces compressed digest JSON files.

Usage:
    python3 extract.py [--input-dir DIR] [--output-dir DIR] [--limit N] [--project FILTER]
"""

import argparse
import csv
import json
import os
import sys
from collections import Counter
from datetime import datetime

sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)


# Project name cleaning: strip common prefixes, collapse variants
PROJECT_PREFIX_STRIPS = [
    "-home-pavel-dev-play-",
    "-home-pavel-dev-",
    "-home-pavel-",
    "-home-pavel",
]

# Known project mappings (raw -> clean)
PROJECT_MAPPINGS = {
    "tm": "tm",
    "tesla": "tesla",
    "codev": "codev",
    "dost": "dost",
    "eoe": "eoe",
}

# Tesla worker variants to collapse
TESLA_VARIANTS = {"tesla-worker", "tesla-workers", "tesla-server", "tesla-api"}


def clean_project_name(raw_project: str) -> str:
    """Clean project name by stripping path prefixes and normalizing."""
    if not raw_project:
        return "unknown"

    name = raw_project
    for prefix in PROJECT_PREFIX_STRIPS:
        if name.startswith(prefix):
            name = name[len(prefix):]
            break

    # Strip leading/trailing dashes
    name = name.strip("-")

    if not name:
        return "home"

    # Collapse tesla variants
    if name.startswith("tesla"):
        return "tesla"

    # Known mappings
    for key, val in PROJECT_MAPPINGS.items():
        if name == key:
            return val

    return name


def extract_user_turn(data: dict) -> dict:
    """Extract a user turn from a JSONL line."""
    message = data.get("message", {})
    content = message.get("content", "")

    has_tool_result = "toolUseResult" in data

    if has_tool_result:
        # User line with tool result - content is a list of tool_result items
        tool_use_result = data.get("toolUseResult", {})
        if isinstance(tool_use_result, str):
            tool_name = "error"
        else:
            tool_name = tool_use_result.get("type", "unknown")

        # Calculate content size
        total_chars = len(json.dumps(content)) if isinstance(content, list) else len(str(content))

        return {
            "role": "user_tool_result",
            "tool_name": tool_name,
            "summary": f"tool_result for {tool_name} ({total_chars} chars)",
            "char_count": total_chars,
        }
    else:
        # Plain user message - content is a string
        text = content if isinstance(content, str) else json.dumps(content)
        return {
            "role": "user",
            "text": text,
            "has_tool_result": False,
            "char_count": len(text),
        }


def extract_assistant_turn(data: dict) -> dict:
    """Extract an assistant turn from a JSONL line."""
    message = data.get("message", {})
    content = message.get("content", [])

    thinking_preview = ""
    text_preview = ""
    text_full_chars = 0
    tools_called = []
    tool_count = 0

    if isinstance(content, list):
        for item in content:
            if not isinstance(item, dict):
                continue
            item_type = item.get("type", "")

            if item_type == "thinking":
                thinking_text = item.get("thinking", "")
                if thinking_text and not thinking_preview:
                    thinking_preview = thinking_text[:200]

            elif item_type == "text":
                text = item.get("text", "")
                if text:
                    text_full_chars += len(text)
                    if not text_preview:
                        text_preview = text[:500]

            elif item_type == "tool_use":
                tool_name = item.get("name", "unknown")
                tools_called.append(tool_name)
                tool_count += 1

    turn = {
        "role": "assistant",
        "tools_called": tools_called,
        "tool_count": tool_count,
    }

    if thinking_preview:
        turn["thinking_preview"] = thinking_preview
    if text_preview:
        turn["text_preview"] = text_preview
    if text_full_chars:
        turn["text_full_chars"] = text_full_chars

    return turn


def extract_summary_turn(data: dict) -> dict:
    """Extract a summary line."""
    return {
        "role": "summary",
        "text": data.get("summary", ""),
    }


def process_session(filepath: str, session_row: dict) -> dict | None:
    """Process a single session JSONL file into a digest."""
    size_bytes = int(session_row.get("size_bytes", 0))
    if size_bytes == 0:
        return None

    if not os.path.exists(filepath):
        return None

    turns = []
    tools_counter = Counter()
    timestamps = []

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    continue

                line_type = data.get("type", "")

                # Skip file-history-snapshot and progress lines
                if line_type in ("file-history-snapshot", "progress"):
                    continue

                # Collect timestamps
                ts = data.get("timestamp")
                if ts:
                    timestamps.append(ts)

                if line_type == "user":
                    turn = extract_user_turn(data)
                    turns.append(turn)

                elif line_type == "assistant":
                    turn = extract_assistant_turn(data)
                    turns.append(turn)
                    for tool in turn.get("tools_called", []):
                        tools_counter[tool] += 1

                elif line_type == "summary":
                    turn = extract_summary_turn(data)
                    turns.append(turn)

                elif line_type == "system":
                    # Skip system lines (api_error etc.)
                    continue

    except Exception as e:
        print(f"  Error processing {filepath}: {e}", file=sys.stderr)
        return None

    if not turns:
        return None

    # Compute duration from timestamps
    duration_minutes = 0
    if len(timestamps) >= 2:
        try:
            # Parse ISO timestamps
            first_ts = timestamps[0].replace("Z", "+00:00")
            last_ts = timestamps[-1].replace("Z", "+00:00")
            first_dt = datetime.fromisoformat(first_ts)
            last_dt = datetime.fromisoformat(last_ts)
            delta = (last_dt - first_dt).total_seconds() / 60
            duration_minutes = round(delta, 1)
        except (ValueError, TypeError):
            pass

    # Count actual turns (user + assistant, excluding tool results and summaries)
    turn_count = sum(1 for t in turns if t["role"] in ("user", "assistant"))

    project_raw = session_row.get("project", "")
    project_clean = clean_project_name(project_raw)

    digest = {
        "session_id": session_row.get("session_id", ""),
        "date": session_row.get("date", ""),
        "source": session_row.get("source", ""),
        "project": project_raw,
        "project_clean": project_clean,
        "raw_size_bytes": size_bytes,
        "duration_minutes": duration_minutes,
        "turn_count": turn_count,
        "tools_used": dict(tools_counter.most_common()),
        "turns": turns,
    }

    # Calculate digest size
    digest_json = json.dumps(digest)
    digest["digest_size_bytes"] = len(digest_json.encode("utf-8"))

    return digest


def main():
    parser = argparse.ArgumentParser(description="Extract session digests from JSONL files")
    parser.add_argument("--input-dir", default="/mnt/db/claude/sessions",
                        help="Base directory containing index.csv and sources/")
    parser.add_argument("--output-dir", default="/mnt/db/claude/sessions/digests",
                        help="Output directory for digest JSON files")
    parser.add_argument("--limit", type=int, default=0,
                        help="Process only first N sessions (0 = all)")
    parser.add_argument("--project", default="",
                        help="Filter to matching project names")
    args = parser.parse_args()

    index_path = os.path.join(args.input_dir, "index.csv")
    sources_dir = os.path.join(args.input_dir, "sources")

    if not os.path.exists(index_path):
        print(f"Error: index.csv not found at {index_path}", file=sys.stderr)
        sys.exit(1)

    # Read index
    sessions = []
    with open(index_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sessions.append(row)

    print(f"Loaded {len(sessions)} sessions from index")

    # Filter by project if specified
    if args.project:
        project_filter = args.project.lower()
        filtered = []
        for s in sessions:
            p_clean = clean_project_name(s.get("project", ""))
            if project_filter in p_clean.lower() or project_filter in s.get("project", "").lower():
                filtered.append(s)
        sessions = filtered
        print(f"Filtered to {len(sessions)} sessions matching '{args.project}'")

    # Apply limit
    if args.limit > 0:
        sessions = sessions[:args.limit]
        print(f"Limited to {args.limit} sessions")

    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)

    # Process sessions
    total_raw = 0
    total_digest = 0
    processed = 0
    skipped = 0
    errors = 0
    digest_index_rows = []

    for i, session in enumerate(sessions):
        filepath = os.path.join(sources_dir, session.get("file_path", ""))
        size_bytes = int(session.get("size_bytes", 0))

        if size_bytes == 0:
            skipped += 1
            continue

        digest = process_session(filepath, session)

        if digest is None:
            skipped += 1
            continue

        # Write digest JSON
        session_id = digest["session_id"]
        output_path = os.path.join(args.output_dir, f"{session_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(digest, f, ensure_ascii=False)

        total_raw += digest["raw_size_bytes"]
        total_digest += digest["digest_size_bytes"]
        processed += 1

        # Top tools for index
        top_tools = ";".join(f"{k}:{v}" for k, v in
                            sorted(digest["tools_used"].items(), key=lambda x: -x[1])[:5])

        digest_index_rows.append({
            "session_id": session_id,
            "date": digest["date"],
            "project": digest["project"],
            "project_clean": digest["project_clean"],
            "raw_size": digest["raw_size_bytes"],
            "digest_size": digest["digest_size_bytes"],
            "duration_minutes": digest["duration_minutes"],
            "turn_count": digest["turn_count"],
            "top_tools": top_tools,
        })

        if (i + 1) % 100 == 0:
            print(f"  Progress: {i + 1}/{len(sessions)} sessions processed...")

    # Write digests-index.csv
    index_output = os.path.join(args.output_dir, "digests-index.csv")
    if digest_index_rows:
        fieldnames = list(digest_index_rows[0].keys())
        with open(index_output, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(digest_index_rows)

    # Print stats
    compression_ratio = total_raw / total_digest if total_digest > 0 else 0
    print(f"\n{'='*60}")
    print(f"Extraction complete")
    print(f"{'='*60}")
    print(f"Total processed: {processed}")
    print(f"Skipped (empty/missing): {skipped}")
    print(f"Total raw size:    {total_raw:>12,} bytes ({total_raw / 1024 / 1024:.1f} MB)")
    print(f"Total digest size: {total_digest:>12,} bytes ({total_digest / 1024 / 1024:.1f} MB)")
    print(f"Compression ratio: {compression_ratio:.1f}x")
    print(f"Output directory:  {args.output_dir}")
    print(f"Digest index:      {index_output}")


if __name__ == "__main__":
    main()
