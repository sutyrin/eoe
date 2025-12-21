#!/usr/bin/env python3
"""Summarize Codex CLI token usage from local session logs.

Reads ~/.codex/sessions/YYYY/MM/DD/*.jsonl and aggregates token_count events
by model. Uses total_token_usage deltas per session to avoid double counting
when totals are cumulative across sessions.
"""

from __future__ import annotations

import argparse
import json
import os
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, Optional


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize Codex CLI token usage")
    parser.add_argument(
        "--date",
        default=datetime.now().strftime("%Y-%m-%d"),
        help="Date in YYYY-MM-DD (default: today)",
    )
    parser.add_argument(
        "--mode",
        choices=("session", "request"),
        default="session",
        help=(
            "Aggregation mode: 'session' uses delta of total_token_usage, "
            "'request' sums last_token_usage per token_count event (deduped)."
        ),
    )
    parser.add_argument(
        "--root",
        default=str(Path.home() / ".codex" / "sessions"),
        help="Codex sessions root (default: ~/.codex/sessions)",
    )
    return parser.parse_args()


def iter_jsonl(path: Path) -> Iterable[Dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue


def find_model(entries: Iterable[Dict[str, Any]]) -> Optional[str]:
    for entry in entries:
        payload = entry.get("payload")
        if not isinstance(payload, dict):
            continue
        model = payload.get("model")
        if model:
            return model
        response = payload.get("response")
        if isinstance(response, dict) and response.get("model"):
            return response.get("model")
    return None


def collect_token_counts(entries: Iterable[Dict[str, Any]]) -> list[Dict[str, Any]]:
    counts = []
    for entry in entries:
        if entry.get("type") != "event_msg":
            continue
        payload = entry.get("payload")
        if not isinstance(payload, dict) or payload.get("type") != "token_count":
            continue
        info = payload.get("info")
        if not info:
            continue
        total = info.get("total_token_usage")
        if isinstance(total, dict):
            counts.append(total)
    return counts


def collect_last_usages(entries: Iterable[Dict[str, Any]]) -> list[Dict[str, Any]]:
    usages = []
    for entry in entries:
        if entry.get("type") != "event_msg":
            continue
        payload = entry.get("payload")
        if not isinstance(payload, dict) or payload.get("type") != "token_count":
            continue
        info = payload.get("info")
        if not info:
            continue
        last = info.get("last_token_usage")
        if isinstance(last, dict):
            usages.append(last)
    return usages


def pick_session_delta(totals: list[Dict[str, Any]]) -> Optional[Dict[str, int]]:
    if not totals:
        return None

    def total_key(item: Dict[str, Any]) -> int:
        return int(item.get("total_tokens") or 0)

    first = min(totals, key=total_key)
    last = max(totals, key=total_key)

    delta: Dict[str, int] = {}
    for key in (
        "input_tokens",
        "cached_input_tokens",
        "output_tokens",
        "reasoning_output_tokens",
        "total_tokens",
    ):
        delta[key] = int(last.get(key) or 0) - int(first.get(key) or 0)
    return delta


def sum_request_usages(usages: list[Dict[str, Any]]) -> Optional[Dict[str, int]]:
    if not usages:
        return None

    seen = set()
    summary = {key: 0 for key in (
        "input_tokens",
        "cached_input_tokens",
        "output_tokens",
        "reasoning_output_tokens",
        "total_tokens",
    )}

    for usage in usages:
        signature = (
            usage.get("input_tokens"),
            usage.get("cached_input_tokens"),
            usage.get("output_tokens"),
            usage.get("reasoning_output_tokens"),
            usage.get("total_tokens"),
        )
        if signature in seen:
            continue
        seen.add(signature)
        for key in summary:
            summary[key] += int(usage.get(key) or 0)

    return summary


def main() -> int:
    args = parse_args()
    date = args.date
    try:
        yyyy, mm, dd = date.split("-")
    except ValueError:
        raise SystemExit("Expected --date in YYYY-MM-DD format")

    root = Path(args.root)
    day_dir = root / yyyy / mm / dd
    if not day_dir.exists():
        raise SystemExit(f"No session directory: {day_dir}")

    per_model: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "sessions": 0,
            "input_tokens": 0,
            "cached_input_tokens": 0,
            "output_tokens": 0,
            "reasoning_output_tokens": 0,
            "total_tokens": 0,
            "missing_sessions": 0,
        }
    )

    for session_file in sorted(day_dir.glob("*.jsonl")):
        entries = list(iter_jsonl(session_file))
        model = find_model(entries) or "unknown"
        if args.mode == "request":
            usages = collect_last_usages(entries)
            delta = sum_request_usages(usages)
        else:
            totals = collect_token_counts(entries)
            delta = pick_session_delta(totals)

        bucket = per_model[model]
        bucket["sessions"] += 1

        if not delta:
            bucket["missing_sessions"] += 1
            continue

        for key in (
            "input_tokens",
            "cached_input_tokens",
            "output_tokens",
            "reasoning_output_tokens",
            "total_tokens",
        ):
            bucket[key] += int(delta.get(key) or 0)

    def fmt(value: int) -> str:
        return f"{value:,}".replace(",", " ")

    print(f"Codex token usage for {date} (from token_count in session logs)")
    print("model\tsessions\tmissing\tinput\tcached\toutput\treasoning\ttotal")
    for model, data in per_model.items():
        print(
            f"{model}\t{fmt(data['sessions'])}\t{fmt(data['missing_sessions'])}\t"
            f"{fmt(data['input_tokens'])}\t{fmt(data['cached_input_tokens'])}\t"
            f"{fmt(data['output_tokens'])}\t{fmt(data['reasoning_output_tokens'])}\t"
            f"{fmt(data['total_tokens'])}"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
