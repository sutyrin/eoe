#!/usr/bin/env python3
"""
Macro Report Aggregator
Aggregates batch analysis results into a comprehensive Markdown report.

Usage:
    python3 report.py [--analysis-dir DIR] [--output FILE]
"""

import argparse
import json
import os
import sys
from collections import Counter, defaultdict
from datetime import datetime


def load_batch_files(analysis_dir: str) -> list[dict]:
    """Load all batch analysis JSON files from directory."""
    batches = []
    if not os.path.isdir(analysis_dir):
        print(f"Error: analysis directory not found: {analysis_dir}", file=sys.stderr)
        sys.exit(1)

    for fname in sorted(os.listdir(analysis_dir)):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(analysis_dir, fname)
        try:
            with open(path, "r", encoding="utf-8") as f:
                batch = json.load(f)
            batches.append(batch)
        except (json.JSONDecodeError, OSError) as e:
            print(f"Warning: skipping {fname}: {e}", file=sys.stderr)

    return batches


def extract_all_sessions(batches: list[dict]) -> list[dict]:
    """Extract all session analyses from batches, adding batch metadata."""
    sessions = []
    for batch in batches:
        project = batch.get("project", "unknown")
        for s in batch.get("sessions", []):
            s["_project"] = project
            s["_batch_id"] = batch.get("batch_id", "")
            s["_date_range"] = batch.get("date_range", "")
            sessions.append(s)
    return sessions


def ascii_bar(label: str, count: int, max_count: int, bar_width: int = 40) -> str:
    """Render an ASCII bar chart row."""
    if max_count == 0:
        filled = 0
    else:
        filled = int(count / max_count * bar_width)
    bar = "#" * filled + " " * (bar_width - filled)
    return f"  {label:<25} [{bar}] {count}"


def pct(count: int, total: int) -> str:
    """Format a percentage."""
    if total == 0:
        return "0.0%"
    return f"{count / total * 100:.1f}%"


def section_overview(batches: list[dict], sessions: list[dict]) -> str:
    """Section 1: Overview."""
    total_sessions = len(sessions)
    projects = set(b.get("project", "?") for b in batches)

    # Date range
    all_dates = []
    for b in batches:
        dr = b.get("date_range", "")
        if " to " in dr:
            parts = dr.split(" to ")
            all_dates.extend(parts)
        elif dr:
            all_dates.append(dr)
    all_dates.sort()
    date_range = f"{all_dates[0]} to {all_dates[-1]}" if all_dates else "unknown"

    # Cost
    total_input = sum(b.get("usage", {}).get("input_tokens", 0) for b in batches)
    total_output = sum(b.get("usage", {}).get("output_tokens", 0) for b in batches)
    total_cost = (total_input * 3 + total_output * 15) / 1_000_000

    lines = [
        "## 1. Overview",
        "",
        f"- **Sessions analyzed:** {total_sessions}",
        f"- **Batches:** {len(batches)}",
        f"- **Projects:** {', '.join(sorted(projects))}",
        f"- **Date range:** {date_range}",
        f"- **Analysis cost:** ${total_cost:.4f} ({total_input:,} input + {total_output:,} output tokens)",
        "",
    ]
    return "\n".join(lines)


def section_intent_distribution(sessions: list[dict]) -> str:
    """Section 2: Session Intent Distribution."""
    intent_counts = Counter(s.get("intent", "other") for s in sessions)
    total = len(sessions)
    max_count = max(intent_counts.values()) if intent_counts else 1

    lines = ["## 2. Session Intent Distribution", ""]

    # ASCII bar chart
    lines.append("```")
    for intent, count in intent_counts.most_common():
        lines.append(ascii_bar(intent, count, max_count))
    lines.append("```")
    lines.append("")

    # Table
    lines.append("| Intent | Count | Percentage |")
    lines.append("|--------|------:|-----------:|")
    for intent, count in intent_counts.most_common():
        lines.append(f"| {intent} | {count} | {pct(count, total)} |")
    lines.append("")

    return "\n".join(lines)


def section_prompt_quality(sessions: list[dict]) -> str:
    """Section 3: Prompt Quality Analysis."""
    scores = [(s.get("prompt_quality", 0), s) for s in sessions if s.get("prompt_quality")]
    if not scores:
        return "## 3. Prompt Quality Analysis\n\nNo prompt quality data available.\n"

    all_scores = [sc for sc, _ in scores]
    avg_overall = sum(all_scores) / len(all_scores) if all_scores else 0

    # By project
    by_project = defaultdict(list)
    for sc, s in scores:
        by_project[s.get("_project", "unknown")].append(sc)

    # Distribution histogram
    dist = Counter(all_scores)

    lines = [
        "## 3. Prompt Quality Analysis",
        "",
        f"**Average score:** {avg_overall:.1f} / 5",
        "",
        "### Distribution",
        "",
        "```",
    ]
    max_dist = max(dist.values()) if dist else 1
    for rating in range(5, 0, -1):
        count = dist.get(rating, 0)
        lines.append(ascii_bar(f"{'*' * rating} ({rating})", count, max_dist))
    lines.append("```")
    lines.append("")

    # By project
    lines.append("### By Project")
    lines.append("")
    lines.append("| Project | Avg Score | Sessions |")
    lines.append("|---------|----------:|---------:|")
    for proj in sorted(by_project.keys()):
        proj_scores = by_project[proj]
        avg = sum(proj_scores) / len(proj_scores)
        lines.append(f"| {proj} | {avg:.1f} | {len(proj_scores)} |")
    lines.append("")

    # Bottom 10
    sorted_scores = sorted(scores, key=lambda x: x[0])
    lines.append("### Bottom 10 (Improvement Targets)")
    lines.append("")
    lines.append("| Session ID | Project | Score | Reason |")
    lines.append("|------------|---------|------:|--------|")
    for sc, s in sorted_scores[:10]:
        sid = s.get("session_id", "?")[:12]
        proj = s.get("_project", "?")
        reason = s.get("prompt_quality_reason", "")
        lines.append(f"| {sid}... | {proj} | {sc} | {reason} |")
    lines.append("")

    # Top 10
    lines.append("### Top 10 (Examples to Replicate)")
    lines.append("")
    lines.append("| Session ID | Project | Score | Reason |")
    lines.append("|------------|---------|------:|--------|")
    for sc, s in sorted(scores, key=lambda x: -x[0])[:10]:
        sid = s.get("session_id", "?")[:12]
        proj = s.get("_project", "?")
        reason = s.get("prompt_quality_reason", "")
        lines.append(f"| {sid}... | {proj} | {sc} | {reason} |")
    lines.append("")

    return "\n".join(lines)


def section_workflow_patterns(sessions: list[dict]) -> str:
    """Section 4: Workflow Pattern Analysis."""
    pattern_counts = Counter(s.get("workflow_pattern", "unknown") for s in sessions)
    total = len(sessions)
    max_count = max(pattern_counts.values()) if pattern_counts else 1

    lines = ["## 4. Workflow Pattern Analysis", ""]

    # Distribution
    lines.append("### Distribution")
    lines.append("")
    lines.append("```")
    for pattern, count in pattern_counts.most_common():
        lines.append(ascii_bar(pattern, count, max_count))
    lines.append("```")
    lines.append("")

    # By project
    by_project = defaultdict(lambda: Counter())
    for s in sessions:
        proj = s.get("_project", "unknown")
        pattern = s.get("workflow_pattern", "unknown")
        by_project[proj][pattern] += 1

    lines.append("### Pattern by Project")
    lines.append("")
    all_patterns = sorted(pattern_counts.keys())
    header = "| Project | " + " | ".join(all_patterns) + " |"
    sep = "|---------|" + "|".join("------:" for _ in all_patterns) + "|"
    lines.append(header)
    lines.append(sep)
    for proj in sorted(by_project.keys()):
        counts = by_project[proj]
        row = f"| {proj} | " + " | ".join(str(counts.get(p, 0)) for p in all_patterns) + " |"
        lines.append(row)
    lines.append("")

    # Monthly evolution (if dates available)
    by_month = defaultdict(lambda: Counter())
    for s in sessions:
        date_range = s.get("_date_range", "")
        if " to " in date_range:
            month = date_range.split(" to ")[0][:7]
        else:
            month = date_range[:7] if date_range else "unknown"
        pattern = s.get("workflow_pattern", "unknown")
        by_month[month][pattern] += 1

    if len(by_month) > 1:
        lines.append("### Monthly Evolution")
        lines.append("")
        months = sorted(by_month.keys())
        header = "| Month | " + " | ".join(all_patterns) + " |"
        sep = "|-------|" + "|".join("------:" for _ in all_patterns) + "|"
        lines.append(header)
        lines.append(sep)
        for month in months:
            counts = by_month[month]
            row = f"| {month} | " + " | ".join(str(counts.get(p, 0)) for p in all_patterns) + " |"
            lines.append(row)
        lines.append("")

    return "\n".join(lines)


def section_delegation_effectiveness(sessions: list[dict]) -> str:
    """Section 5: Delegation Effectiveness."""
    scores = [(s.get("delegation_effectiveness", 0), s) for s in sessions
              if s.get("delegation_effectiveness")]
    if not scores:
        return "## 5. Delegation Effectiveness\n\nNo delegation data available.\n"

    all_scores = [sc for sc, _ in scores]
    avg_overall = sum(all_scores) / len(all_scores)

    # By project
    by_project = defaultdict(list)
    for sc, s in scores:
        by_project[s.get("_project", "unknown")].append(sc)

    # Correlation with prompt quality
    pq_de_pairs = []
    for s in sessions:
        pq = s.get("prompt_quality", 0)
        de = s.get("delegation_effectiveness", 0)
        if pq and de:
            pq_de_pairs.append((pq, de))

    lines = [
        "## 5. Delegation Effectiveness",
        "",
        f"**Average score:** {avg_overall:.1f} / 5",
        "",
    ]

    # By project
    lines.append("### By Project")
    lines.append("")
    lines.append("| Project | Avg Score | Sessions |")
    lines.append("|---------|----------:|---------:|")
    for proj in sorted(by_project.keys()):
        proj_scores = by_project[proj]
        avg = sum(proj_scores) / len(proj_scores)
        lines.append(f"| {proj} | {avg:.1f} | {len(proj_scores)} |")
    lines.append("")

    # Correlation
    if pq_de_pairs:
        avg_pq = sum(p for p, _ in pq_de_pairs) / len(pq_de_pairs)
        avg_de = sum(d for _, d in pq_de_pairs) / len(pq_de_pairs)
        # Simple correlation
        num = sum((p - avg_pq) * (d - avg_de) for p, d in pq_de_pairs)
        den_pq = sum((p - avg_pq) ** 2 for p, _ in pq_de_pairs) ** 0.5
        den_de = sum((d - avg_de) ** 2 for _, d in pq_de_pairs) ** 0.5
        corr = num / (den_pq * den_de) if den_pq * den_de > 0 else 0

        lines.append("### Correlation with Prompt Quality")
        lines.append("")
        lines.append(f"Pearson correlation: **{corr:.2f}**")
        if corr > 0.5:
            lines.append("*Strong positive: better prompts lead to better delegation.*")
        elif corr > 0.2:
            lines.append("*Moderate positive: some relationship between prompt quality and delegation.*")
        elif corr > -0.2:
            lines.append("*Weak: prompt quality and delegation effectiveness are mostly independent.*")
        else:
            lines.append("*Negative: surprisingly, prompt quality and delegation effectiveness diverge.*")
        lines.append("")

    # Bottom and Top 10
    sorted_scores = sorted(scores, key=lambda x: x[0])
    lines.append("### Bottom 10")
    lines.append("")
    lines.append("| Session ID | Project | Score | Summary |")
    lines.append("|------------|---------|------:|---------|")
    for sc, s in sorted_scores[:10]:
        sid = s.get("session_id", "?")[:12]
        proj = s.get("_project", "?")
        summary = s.get("session_summary", "")[:60]
        lines.append(f"| {sid}... | {proj} | {sc} | {summary} |")
    lines.append("")

    lines.append("### Top 10")
    lines.append("")
    lines.append("| Session ID | Project | Score | Summary |")
    lines.append("|------------|---------|------:|---------|")
    for sc, s in sorted(scores, key=lambda x: -x[0])[:10]:
        sid = s.get("session_id", "?")[:12]
        proj = s.get("_project", "?")
        summary = s.get("session_summary", "")[:60]
        lines.append(f"| {sid}... | {proj} | {sc} | {summary} |")
    lines.append("")

    return "\n".join(lines)


def section_anti_pattern_catalog(sessions: list[dict]) -> str:
    """Section 6: Anti-Pattern Catalog."""
    all_patterns = []
    for s in sessions:
        patterns = s.get("notable_patterns", [])
        if isinstance(patterns, list):
            all_patterns.extend(patterns)
        elif isinstance(patterns, str):
            all_patterns.append(patterns)

    if not all_patterns:
        return "## 6. Anti-Pattern Catalog\n\nNo patterns recorded.\n"

    pattern_counts = Counter(all_patterns)

    # Heuristic: patterns with "good", "clear", "effective", "strong" are positive
    positive_keywords = {"good", "clear", "effective", "strong", "well", "concise", "specific", "thorough", "excellent"}
    negative_keywords = {"over", "vague", "dump", "missing", "lack", "poor", "unclear", "premature", "excessive"}

    positive = []
    negative = []
    neutral = []

    for pattern, count in pattern_counts.most_common():
        p_lower = pattern.lower().replace("-", " ").replace("_", " ")
        words = set(p_lower.split())
        if words & positive_keywords:
            positive.append((pattern, count))
        elif words & negative_keywords:
            negative.append((pattern, count))
        else:
            neutral.append((pattern, count))

    lines = ["## 6. Anti-Pattern Catalog", ""]

    if negative or neutral:
        lines.append("### Things to Stop Doing")
        lines.append("")
        lines.append("| Pattern | Occurrences |")
        lines.append("|---------|------------:|")
        for pattern, count in sorted(negative + neutral, key=lambda x: -x[1]):
            lines.append(f"| {pattern} | {count} |")
        lines.append("")

    if positive:
        lines.append("### Things to Keep Doing")
        lines.append("")
        lines.append("| Pattern | Occurrences |")
        lines.append("|---------|------------:|")
        for pattern, count in sorted(positive, key=lambda x: -x[1]):
            lines.append(f"| {pattern} | {count} |")
        lines.append("")

    if not negative and not positive and not neutral:
        lines.append("No categorizable patterns found.")
        lines.append("")

    return "\n".join(lines)


def section_project_profiles(sessions: list[dict]) -> str:
    """Section 7: Project Profiles."""
    by_project = defaultdict(list)
    for s in sessions:
        by_project[s.get("_project", "unknown")].append(s)

    lines = ["## 7. Project Profiles", ""]

    for proj in sorted(by_project.keys()):
        proj_sessions = by_project[proj]
        count = len(proj_sessions)

        pq_scores = [s.get("prompt_quality", 0) for s in proj_sessions if s.get("prompt_quality")]
        de_scores = [s.get("delegation_effectiveness", 0) for s in proj_sessions if s.get("delegation_effectiveness")]
        avg_pq = sum(pq_scores) / len(pq_scores) if pq_scores else 0
        avg_de = sum(de_scores) / len(de_scores) if de_scores else 0

        intents = Counter(s.get("intent", "other") for s in proj_sessions)
        top_intents = ", ".join(f"{k} ({v})" for k, v in intents.most_common(3))

        patterns = Counter(s.get("workflow_pattern", "unknown") for s in proj_sessions)
        top_patterns = ", ".join(f"{k} ({v})" for k, v in patterns.most_common(3))

        lines.append(f"### {proj}")
        lines.append("")
        lines.append(f"- **Sessions:** {count}")
        lines.append(f"- **Avg prompt quality:** {avg_pq:.1f}")
        lines.append(f"- **Avg delegation:** {avg_de:.1f}")
        lines.append(f"- **Primary intents:** {top_intents}")
        lines.append(f"- **Common patterns:** {top_patterns}")
        lines.append("")

    # Best/worst
    project_quality = {}
    for proj, sess_list in by_project.items():
        pqs = [s.get("prompt_quality", 0) for s in sess_list if s.get("prompt_quality")]
        if pqs:
            project_quality[proj] = sum(pqs) / len(pqs)

    if project_quality:
        best = max(project_quality, key=project_quality.get)
        worst = min(project_quality, key=project_quality.get)
        lines.append(f"**Best quality project:** {best} ({project_quality[best]:.1f})")
        lines.append(f"**Worst quality project:** {worst} ({project_quality[worst]:.1f})")
        lines.append("")

    return "\n".join(lines)


def section_temporal_patterns(sessions: list[dict], batches: list[dict]) -> str:
    """Section 8: Temporal Patterns."""
    # Extract months from batch date ranges
    by_month = defaultdict(list)
    for s in sessions:
        date_range = s.get("_date_range", "")
        if " to " in date_range:
            month = date_range.split(" to ")[0][:7]
        else:
            month = date_range[:7] if date_range else "unknown"
        by_month[month].append(s)

    lines = ["## 8. Temporal Patterns", ""]

    if len(by_month) <= 1:
        lines.append("*Insufficient temporal data for trend analysis (single time period).*")
        lines.append("")
        # Still show session count
        for month, sess_list in sorted(by_month.items()):
            lines.append(f"- **{month}:** {len(sess_list)} sessions")
        lines.append("")
        return "\n".join(lines)

    # Sessions per month
    lines.append("### Sessions per Month")
    lines.append("")
    lines.append("```")
    months = sorted(by_month.keys())
    max_count = max(len(v) for v in by_month.values()) if by_month else 1
    for month in months:
        count = len(by_month[month])
        lines.append(ascii_bar(month, count, max_count))
    lines.append("```")
    lines.append("")

    # Quality over time
    lines.append("### Quality Over Time")
    lines.append("")
    lines.append("| Month | Sessions | Avg Prompt Quality | Avg Delegation |")
    lines.append("|-------|--------:|---------:|---------:|")
    for month in months:
        sess_list = by_month[month]
        pqs = [s.get("prompt_quality", 0) for s in sess_list if s.get("prompt_quality")]
        des = [s.get("delegation_effectiveness", 0) for s in sess_list if s.get("delegation_effectiveness")]
        avg_pq = sum(pqs) / len(pqs) if pqs else 0
        avg_de = sum(des) / len(des) if des else 0
        lines.append(f"| {month} | {len(sess_list)} | {avg_pq:.1f} | {avg_de:.1f} |")
    lines.append("")

    return "\n".join(lines)


def section_recommendations(batches: list[dict]) -> str:
    """Section 9: Recommendations (aggregated from batch summaries)."""
    all_improvements = []
    all_strengths = []
    all_anti_patterns = []
    all_common_patterns = []

    for batch in batches:
        summary = batch.get("batch_summary", {})
        if isinstance(summary, dict):
            all_improvements.extend(summary.get("improvements", []))
            all_strengths.extend(summary.get("strengths", []))
            all_anti_patterns.extend(summary.get("anti_patterns", []))
            all_common_patterns.extend(summary.get("common_patterns", []))

    lines = ["## 9. Recommendations", ""]

    # Top improvements (by frequency)
    if all_improvements:
        improvement_counts = Counter(all_improvements)
        lines.append("### Top Things to Improve")
        lines.append("")
        for imp, count in improvement_counts.most_common(5):
            freq = f" (cited {count}x)" if count > 1 else ""
            lines.append(f"1. {imp}{freq}")
        lines.append("")

    # Top strengths
    if all_strengths:
        strength_counts = Counter(all_strengths)
        lines.append("### Top Strengths to Maintain")
        lines.append("")
        for strength, count in strength_counts.most_common(5):
            freq = f" (cited {count}x)" if count > 1 else ""
            lines.append(f"1. {strength}{freq}")
        lines.append("")

    # Actionable changes
    if all_anti_patterns:
        lines.append("### Specific Actionable Changes")
        lines.append("")
        ap_counts = Counter(all_anti_patterns)
        for ap, count in ap_counts.most_common(5):
            freq = f" (seen {count}x)" if count > 1 else ""
            lines.append(f"- **Stop:** {ap}{freq}")
        lines.append("")

    if not all_improvements and not all_strengths and not all_anti_patterns:
        lines.append("No batch-level recommendations available yet.")
        lines.append("")

    return "\n".join(lines)


def generate_report(batches: list[dict]) -> str:
    """Generate the full Markdown report."""
    sessions = extract_all_sessions(batches)

    sections = [
        f"# Claude Session Analysis Report",
        f"",
        f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*",
        f"",
        section_overview(batches, sessions),
        section_intent_distribution(sessions),
        section_prompt_quality(sessions),
        section_workflow_patterns(sessions),
        section_delegation_effectiveness(sessions),
        section_anti_pattern_catalog(sessions),
        section_project_profiles(sessions),
        section_temporal_patterns(sessions, batches),
        section_recommendations(batches),
        "---",
        "",
        "*Report generated by scripts/session-analysis/report.py*",
    ]

    return "\n".join(sections)


def main():
    parser = argparse.ArgumentParser(description="Generate macro analysis report from batch results")
    parser.add_argument("--analysis-dir", default="/mnt/db/claude/sessions/analysis",
                        help="Directory containing batch analysis JSON files")
    parser.add_argument("--output", default="/mnt/db/claude/sessions/ANALYSIS-REPORT.md",
                        help="Output report file path")
    args = parser.parse_args()

    batches = load_batch_files(args.analysis_dir)
    if not batches:
        print(f"Error: no batch files found in {args.analysis_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Loaded {len(batches)} batch files")

    report = generate_report(batches)

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(report)

    word_count = len(report.split())
    print(f"Report written to {args.output} ({word_count} words, {len(report)} chars)")


if __name__ == "__main__":
    main()
