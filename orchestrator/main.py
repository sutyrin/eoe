"""
WorkFlowy Orchestrator — Entry Point

Setup:
  1. Copy config.example.json → config.json
  2. Fill in your API keys and WorkFlowy node UUIDs
  3. Run: python main.py

Or run once (no loop): python main.py --once
Or generate digest:    python main.py --digest
"""

import asyncio
import argparse
import json
import logging
import sys

from orchestrator import Orchestrator, OrchestratorConfig, AgentRegistry
from agents import (
    make_claude_agent,
    make_claude_headless_agent,
    make_yandexgpt_agent,
    echo_agent,
    make_routing_agent,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)

log = logging.getLogger("main")


def load_config(path: str = "config.json") -> dict:
    with open(path) as f:
        return json.load(f)


def build_orchestrator(cfg: dict) -> Orchestrator:
    """Wire everything together from config."""

    # Orchestrator config
    orch_config = OrchestratorConfig(
        api_key=cfg["workflowy"]["api_key"],
        backlog_node_id=cfg["workflowy"]["backlog_node_id"],
        review_node_id=cfg["workflowy"].get("review_node_id"),
        digest_node_id=cfg["workflowy"].get("digest_node_id"),
        poll_interval_seconds=cfg.get("poll_interval_seconds", 300),
        dialog_depth=cfg.get("dialog_depth", 5),
        stale_hours=cfg.get("stale_hours", 24),
    )

    # Build agents
    agents = AgentRegistry()

    llm_cfg = cfg.get("llm", {})

    if llm_cfg.get("claude_api_key"):
        claude = make_claude_agent(
            api_key=llm_cfg["claude_api_key"],
            model=llm_cfg.get("claude_model", "claude-sonnet-4-20250514"),
            system_prompt=llm_cfg.get("system_prompt"),
        )
        agents.register("default", claude)
        agents.register("dev-agent", claude)
        log.info("Registered Claude API agent as default + dev-agent")
    else:
        # Headless mode — use claude -p CLI, no API key needed
        claude = make_claude_headless_agent(
            model=llm_cfg.get("claude_model", "claude-sonnet-4-20250514"),
            system_prompt=llm_cfg.get("system_prompt"),
        )
        agents.register("default", claude)
        agents.register("dev-agent", claude)
        log.info("Registered Claude headless (CLI) agent as default + dev-agent")

    if llm_cfg.get("yandex_api_key") and llm_cfg.get("yandex_folder_id"):
        yandex = make_yandexgpt_agent(
            api_key=llm_cfg["yandex_api_key"],
            folder_id=llm_cfg["yandex_folder_id"],
            model=llm_cfg.get("yandex_model", "yandexgpt-lite"),
        )
        agents.register("comms-agent", yandex)
        log.info("Registered YandexGPT agent as comms-agent")

    # Fallback if nothing was registered (shouldn't happen with headless)
    if not agents.agents:
        agents.register("default", echo_agent)
        log.warning("No agents registered — using echo agent")

    return Orchestrator(orch_config, agents)


async def main():
    parser = argparse.ArgumentParser(description="WorkFlowy Orchestrator")
    parser.add_argument("--config", default="config.json", help="Config file path")
    parser.add_argument("--once", action="store_true", help="Run single tick, then exit")
    parser.add_argument("--digest", action="store_true", help="Generate and write digest")
    args = parser.parse_args()

    cfg = load_config(args.config)
    orch = build_orchestrator(cfg)

    if args.digest:
        await orch.write_digest_to_wf()
    elif args.once:
        async with __import__("workflowy_client").WorkFlowyClient(cfg["workflowy"]["api_key"]) as wf:
            await orch.tick()
        digest = await orch.generate_digest()
        print(digest)
    else:
        await orch.run_forever()


if __name__ == "__main__":
    asyncio.run(main())
