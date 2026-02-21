"""
Pluggable agents for the orchestrator.
Each agent is an async function: (Task, context: str) -> response: str

Add your own agents by following this pattern.
"""

import httpx
import json
import os
import shutil
import subprocess
import tempfile
import logging
from typing import Optional

log = logging.getLogger("agents")


# ── CLAUDE AGENT ─────────────────────────────────────────

def make_claude_agent(
    api_key: str,
    model: str = "claude-sonnet-4-20250514",
    system_prompt: Optional[str] = None,
):
    """
    Factory: creates an agent backed by Claude API.
    
    Usage:
        agents.register("default", make_claude_agent(
            api_key="sk-ant-...",
            system_prompt="Ты помощник-разработчик. Отвечай кратко."
        ))
    """

    default_system = (
        "Ты агент-исполнитель в системе управления задачами. "
        "Тебе приходит задача с контекстом. "
        "Действуй конкретно: либо выполни задачу и покажи результат, "
        "либо задай уточняющий вопрос (максимум один). "
        "Формат: plain text, без markdown заголовков. Кратко и по делу."
    )

    async def agent(task, context: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": model,
                    "max_tokens": 1024,
                    "system": system_prompt or default_system,
                    "messages": [
                        {"role": "user", "content": context}
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            # Extract text from response
            return data["content"][0]["text"]

    return agent


# ── CLAUDE HEADLESS AGENT (claude -p CLI) ────────────────

def _find_claude_cli() -> str:
    path = shutil.which("claude")
    if path:
        return path
    for candidate in [
        os.path.expanduser("~/.nvm/versions/node/v23.11.0/bin/claude"),
        "/usr/local/bin/claude",
        "/usr/bin/claude",
    ]:
        if os.path.isfile(candidate):
            return candidate
    return "claude"


def make_claude_headless_agent(
    model: str = "claude-sonnet-4-20250514",
    system_prompt: Optional[str] = None,
    timeout: int = 120,
    max_retries: int = 2,
):
    """
    Factory: agent that calls `claude -p` CLI (headless mode).
    No API key needed — uses Claude Code's own auth.
    """

    claude_bin = _find_claude_cli()

    default_system = (
        "Ты агент-исполнитель в системе управления задачами. "
        "Тебе приходит задача с контекстом. "
        "Действуй конкретно: либо выполни задачу и покажи результат, "
        "либо задай уточняющий вопрос (максимум один). "
        "Формат: plain text, без markdown заголовков. Кратко и по делу."
    )

    async def agent(task, context: str) -> str:
        prompt = context
        sys_prompt = system_prompt or default_system

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".txt", delete=False, encoding="utf-8"
        ) as f:
            f.write(prompt)
            prompt_file = f.name

        try:
            # Remove CLAUDECODE env var to allow nested invocation
            env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

            cmd = [
                claude_bin, "-p",
                "--model", model,
                "--output-format", "text",
                "--no-session-persistence",
                "--system-prompt", sys_prompt,
            ]

            for attempt in range(max_retries):
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
                    log.warning("Claude CLI timeout (%ds), attempt %d/%d", timeout, attempt + 1, max_retries)
                    if attempt < max_retries - 1:
                        continue
                    return f"[ОШИБКА] Таймаут CLI ({timeout}с)"

                stdout = result.stdout.strip()
                stderr = result.stderr.strip()
                output = stdout or stderr

                if result.returncode != 0:
                    log.warning("Claude CLI error (exit %d): %s", result.returncode, output[:300])
                    if attempt < max_retries - 1:
                        continue
                    raise RuntimeError(f"CLI exit {result.returncode}: {output[:200]}")

                if not output:
                    raise RuntimeError("Пустой ответ от CLI")

                return output

            return "[ОШИБКА] Все попытки исчерпаны"
        finally:
            os.unlink(prompt_file)

    return agent


# ── YANDEXGPT AGENT ──────────────────────────────────────

def make_yandexgpt_agent(
    api_key: str,
    folder_id: str,
    model: str = "yandexgpt-lite",
    system_prompt: Optional[str] = None,
):
    """
    Factory: agent backed by YandexGPT API.
    Useful for Russian-market tasks where latency to Yandex is lower.
    """

    default_system = (
        "Ты агент-исполнитель. Выполняй задачи конкретно и кратко."
    )

    async def agent(task, context: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
                headers={
                    "Authorization": f"Api-Key {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "modelUri": f"gpt://{folder_id}/{model}",
                    "completionOptions": {
                        "stream": False,
                        "temperature": 0.3,
                        "maxTokens": 1024,
                    },
                    "messages": [
                        {"role": "system", "text": system_prompt or default_system},
                        {"role": "user", "text": context},
                    ],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["result"]["alternatives"][0]["message"]["text"]

    return agent


# ── SIMPLE AGENTS (no LLM) ───────────────────────────────

async def status_update_agent(task, context: str) -> str:
    """Simple agent that just acknowledges a task."""
    return f"Задача принята: {task.item.name}. Начинаю работу."


async def echo_agent(task, context: str) -> str:
    """Debug agent — echoes the context back. Useful for testing."""
    return f"[ECHO] Получил контекст ({len(context)} символов). Последние 200:\n{context[-200:]}"


# ── COMPOSITE AGENT ──────────────────────────────────────

def make_routing_agent(routes: dict):
    """
    Agent that routes to sub-agents based on task keywords.
    
    Usage:
        agents.register("default", make_routing_agent({
            "код": make_claude_agent(key, system_prompt="Ты разработчик..."),
            "текст": make_claude_agent(key, system_prompt="Ты копирайтер..."),
            "аналитика": make_claude_agent(key, system_prompt="Ты аналитик..."),
        }))
    """

    async def agent(task, context: str) -> str:
        name_lower = task.item.name.lower()
        for keyword, sub_agent in routes.items():
            if keyword in name_lower:
                return await sub_agent(task, context)

        # Fallback: use first available
        first = next(iter(routes.values()))
        return await first(task, context)

    return agent
