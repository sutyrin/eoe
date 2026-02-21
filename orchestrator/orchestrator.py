"""
WorkFlowy Orchestrator
The "virtual COO" — polls the WorkFlowy tree, finds work, dispatches agents,
manages autonomy levels, generates digests.

Architecture:
  WorkFlowy Tree (source of truth)
       ↕ read/write
  Orchestrator (this module)
       ↕ dispatch
  Agent functions (pluggable)
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Callable, Awaitable, Optional

from workflowy_client import WorkFlowyClient, WFItem
from dialog import DialogManager, Dialog, DialogState, Speaker

log = logging.getLogger("orchestrator")


# ── AUTONOMY LEVELS ──────────────────────────────────────

class Autonomy(Enum):
    """
    🟢 GREEN  — agent executes, no human review needed
    🟡 YELLOW — agent executes, puts result on review
    🔴 RED    — agent prepares materials, human decides
    """
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"


# Default classification rules.
# Override via config or per-task tags.
AUTONOMY_RULES: dict[str, Autonomy] = {
    # By tag
    "#automate": Autonomy.GREEN,
    "#review": Autonomy.YELLOW,
    "#decide": Autonomy.RED,
    "#escalate": Autonomy.RED,

    # By task type keywords
    "рефакторинг": Autonomy.GREEN,
    "тесты": Autonomy.GREEN,
    "документация": Autonomy.GREEN,
    "сбор информации": Autonomy.GREEN,
    "статус": Autonomy.GREEN,

    "код": Autonomy.YELLOW,
    "аналитика": Autonomy.YELLOW,
    "драфт": Autonomy.YELLOW,
    "черновик": Autonomy.YELLOW,

    "деплой": Autonomy.RED,
    "отправить": Autonomy.RED,
    "удалить": Autonomy.RED,
    "коммуникац": Autonomy.RED,
    "партнёр": Autonomy.RED,
    "оплат": Autonomy.RED,
}


def classify_autonomy(task_name: str, task_note: Optional[str] = None) -> Autonomy:
    """Determine autonomy level from task name and note."""
    text = f"{task_name} {task_note or ''}".lower()

    # Explicit tags take priority
    for keyword, level in AUTONOMY_RULES.items():
        if keyword in text:
            return level

    # Default: yellow (do it but show me)
    return Autonomy.YELLOW


# ── TASK PARSING ─────────────────────────────────────────

@dataclass
class Task:
    """A parsed task from WorkFlowy tree."""
    item: WFItem
    status: str = "backlog"
    assignee: str = "unassigned"
    autonomy: Autonomy = Autonomy.YELLOW
    dialog: Optional[Dialog] = None

    @classmethod
    def from_item(cls, item: WFItem) -> "Task":
        name = item.name.lower()
        note = (item.note or "").lower()
        text = f"{name} {note}"

        # Parse status from tags
        status = "backlog"
        for s in ["backlog", "in-progress", "review", "done", "blocked"]:
            if f"#status:{s}" in text or f"#{s}" in text:
                status = s
                break

        # Parse assignee
        assignee = "unassigned"
        if "#agent" in text or "#dev-agent" in text:
            assignee = "agent"
        elif "#human" in text:
            assignee = "human"

        autonomy = classify_autonomy(item.name, item.note)

        return cls(
            item=item,
            status=status,
            assignee=assignee,
            autonomy=autonomy,
        )


# ── AGENT INTERFACE ──────────────────────────────────────

# An agent is any async function: (task, dialog_context) -> response_text
AgentFunc = Callable[[Task, str], Awaitable[str]]


@dataclass
class AgentRegistry:
    """Registry of available agents."""
    agents: dict[str, AgentFunc] = field(default_factory=dict)

    def register(self, name: str, func: AgentFunc):
        self.agents[name] = func

    def get(self, name: str) -> Optional[AgentFunc]:
        return self.agents.get(name)


# ── ORCHESTRATOR ─────────────────────────────────────────

@dataclass
class OrchestratorConfig:
    """Configuration for the orchestrator."""
    api_key: str
    backlog_node_id: str           # UUID of the backlog/tasks parent node
    review_node_id: Optional[str] = None  # UUID of the review queue node
    digest_node_id: Optional[str] = None  # UUID where digests are written
    poll_interval_seconds: int = 300       # 5 minutes
    dialog_depth: int = 5
    stale_hours: float = 24


class Orchestrator:
    """
    Main orchestration loop.
    
    Lifecycle per tick:
    1. Scan backlog for tasks assigned to agents
    2. For each task, check dialog state
    3. If awaiting_agent → dispatch to agent
    4. Agent responds → write back to WorkFlowy
    5. Update task status based on autonomy level
    6. Generate digest
    """

    def __init__(self, config: OrchestratorConfig, agents: AgentRegistry):
        self.config = config
        self.agents = agents
        self._running = False
        self._tick_count = 0
        self._results: list[dict] = []  # accumulate for digest
        self._in_flight: set[str] = set()  # task IDs currently being processed
        self._failed: dict[str, float] = {}  # task_id → retry_after (unix timestamp)

    async def run_forever(self):
        """Main loop — poll and process."""
        self._running = True
        log.info("Orchestrator starting. Poll interval: %ds", self.config.poll_interval_seconds)

        while self._running:
            try:
                await self.tick()
            except Exception as e:
                log.error("Tick failed: %s", e, exc_info=True)

            await asyncio.sleep(self.config.poll_interval_seconds)

    async def tick(self):
        """Single orchestration cycle."""
        self._tick_count += 1
        log.info("─── Tick #%d ───", self._tick_count)

        async with WorkFlowyClient(self.config.api_key) as wf:
            dm = DialogManager(wf)

            # 1. Scan for actionable tasks
            tasks = await self._scan_tasks(wf)
            log.info("Found %d tasks total", len(tasks))

            agent_tasks = [t for t in tasks if t.assignee == "agent" and t.status == "backlog"]
            log.info("  → %d assigned to agent in backlog", len(agent_tasks))

            # 2. Check dialogs awaiting agent response
            dialog_pending = await dm.find_pending_dialogs(
                self.config.backlog_node_id,
                depth=self.config.dialog_depth,
            )
            log.info("  → %d dialogs awaiting agent", len(dialog_pending))

            # 3. Process new tasks
            for task in agent_tasks:
                await self._process_new_task(wf, dm, task)

            # 4. Process pending dialogs (human replied, agent should act)
            for dialog in dialog_pending:
                task = Task.from_item(
                    await wf.get_item(dialog.task_id)
                )
                task.dialog = dialog
                await self._process_dialog(wf, dm, task)

            # 5. Check for stale dialogs
            stale = await dm.find_stale_dialogs(
                self.config.backlog_node_id,
                stale_hours=self.config.stale_hours,
                depth=self.config.dialog_depth,
            )
            if stale:
                log.warning("%d stale dialogs (>%dh)", len(stale), self.config.stale_hours)
                for d in stale:
                    self._results.append({
                        "type": "stale",
                        "task": d.task_name,
                        "task_id": d.task_id,
                        "last_speaker": d.last_speaker.value if d.last_speaker else "?",
                    })

    async def _scan_tasks(self, wf: WorkFlowyClient) -> list[Task]:
        """Scan the backlog node for tasks."""
        children = await wf.list_children(self.config.backlog_node_id)
        return [Task.from_item(c) for c in children if not c.is_completed]

    async def _process_new_task(
        self, wf: WorkFlowyClient, dm: DialogManager, task: Task
    ):
        """Process a new task that hasn't been started yet."""
        tid = task.item.id
        if tid in self._in_flight:
            return
        retry_after = self._failed.get(tid, 0)
        if time.time() < retry_after:
            return
        self._in_flight.add(tid)
        log.info("Processing new task: %s [%s]", task.item.name, task.autonomy.value)

        agent_func = self._select_agent(task)
        if not agent_func:
            log.warning("No agent available for: %s", task.item.name)
            return

        # Build context from task name + note + any existing children
        context = f"Task: {task.item.name}"
        if task.item.note:
            context += f"\nNote: {task.item.note}"

        try:
            # Run agent
            response = await agent_func(task, context)

            # Write response based on autonomy level
            if task.autonomy == Autonomy.GREEN:
                # Do it, mark done
                await dm.agent_start(task.item.id, response)
                await wf.edit_item(task.item.id, name=_set_tag(task.item.name, "status", "done"))
                await wf.complete_item(task.item.id)
                log.info("  🟢 Auto-completed: %s", task.item.name)

            elif task.autonomy == Autonomy.YELLOW:
                # Do it, put on review
                await dm.agent_start(task.item.id, response)
                await wf.edit_item(task.item.id, name=_set_tag(task.item.name, "status", "review"))
                log.info("  🟡 On review: %s", task.item.name)

            elif task.autonomy == Autonomy.RED:
                # Prepare, ask for decision
                question = f"Подготовил материал. Нужно твоё решение:\n{response}"
                await dm.agent_start(task.item.id, question)
                await wf.edit_item(task.item.id, name=_set_tag(task.item.name, "status", "blocked"))
                log.info("  🔴 Escalated: %s", task.item.name)

            self._results.append({
                "type": "processed",
                "task": task.item.name,
                "autonomy": task.autonomy.value,
            })

        except Exception as e:
            err_msg = str(e)
            log.error("Agent failed on %s: %s", task.item.name, err_msg)
            # Backoff: 60s for rate limits, 30s for other errors
            backoff = 60 if "limit" in err_msg.lower() else 30
            self._failed[tid] = time.time() + backoff
            log.info("Will retry %s in %ds", task.item.name[:40], backoff)
            self._results.append({
                "type": "error",
                "task": task.item.name,
                "error": err_msg[:200],
            })
        finally:
            self._in_flight.discard(tid)

    async def _process_dialog(
        self, wf: WorkFlowyClient, dm: DialogManager, task: Task
    ):
        """Process a dialog where the human has replied and agent should act."""
        dialog = task.dialog
        if not dialog:
            return
        tid = dialog.task_id
        if tid in self._in_flight:
            return
        if time.time() < self._failed.get(tid, 0):
            return
        self._in_flight.add(tid)
        log.info("Processing dialog reply for: %s", dialog.task_name)

        agent_func = self._select_agent(task)
        if not agent_func:
            return

        # Build full context: task + dialog history
        context = f"Task: {dialog.task_name}\n\nDialog history:\n{dialog.context_for_agent()}"

        last_human_msg = dialog.last_message
        if last_human_msg:
            context += f"\n\nLatest human message: {last_human_msg.text}"
            context += "\n\nRespond to the human's latest message."

        try:
            response = await agent_func(task, context)
            await dm.agent_reply(dialog, response)

            self._results.append({
                "type": "dialog_reply",
                "task": dialog.task_name,
            })
        except Exception as e:
            err_msg = str(e)
            log.error("Agent dialog failed on %s: %s", dialog.task_name[:40], err_msg)
            backoff = 60 if "limit" in err_msg.lower() else 30
            self._failed[tid] = time.time() + backoff
        finally:
            self._in_flight.discard(tid)

    def _select_agent(self, task: Task) -> Optional[AgentFunc]:
        """Select the right agent for a task. Extend with routing logic."""
        # For now: try specific agent tag, fallback to default
        name_lower = task.item.name.lower()
        for agent_name in self.agents.agents:
            if f"#{agent_name}" in name_lower:
                return self.agents.get(agent_name)

        # Fallback to "default" agent
        return self.agents.get("default")

    async def generate_digest(self) -> str:
        """
        Generate a morning digest from accumulated results.
        Call this on schedule (e.g., every morning).
        """
        if not self._results:
            return "Ничего нового."

        processed = [r for r in self._results if r["type"] == "processed"]
        dialogs = [r for r in self._results if r["type"] == "dialog_reply"]
        errors = [r for r in self._results if r["type"] == "error"]
        stale = [r for r in self._results if r["type"] == "stale"]

        lines = [f"📊 Дайджест — {datetime.now().strftime('%Y-%m-%d %H:%M')}"]
        lines.append("")

        if processed:
            green = [r for r in processed if r["autonomy"] == "green"]
            yellow = [r for r in processed if r["autonomy"] == "yellow"]
            red = [r for r in processed if r["autonomy"] == "red"]

            if green:
                lines.append(f"🟢 Выполнено автоматически: {len(green)}")
                for r in green:
                    lines.append(f"  • {r['task']}")

            if yellow:
                lines.append(f"🟡 На ревью: {len(yellow)}")
                for r in yellow:
                    lines.append(f"  • {r['task']}")

            if red:
                lines.append(f"🔴 Ждёт решения: {len(red)}")
                for r in red:
                    lines.append(f"  • {r['task']}")

        if dialogs:
            lines.append(f"💬 Ответов в диалогах: {len(dialogs)}")

        if errors:
            lines.append(f"⚠️ Ошибки: {len(errors)}")
            for r in errors:
                lines.append(f"  • {r['task']}: {r['error'][:80]}")

        if stale:
            lines.append(f"⏰ Зависли (>{self.config.stale_hours}ч): {len(stale)}")
            for r in stale:
                lines.append(f"  • {r['task']} (последний: {r['last_speaker']})")

        # Clear results after digest
        digest_text = "\n".join(lines)
        self._results = []
        return digest_text

    async def write_digest_to_wf(self):
        """Write digest directly into WorkFlowy tree."""
        digest = await self.generate_digest()
        if not self.config.digest_node_id:
            log.warning("No digest_node_id configured")
            return

        async with WorkFlowyClient(self.config.api_key) as wf:
            await wf.create_item(
                parent_id=self.config.digest_node_id,
                name=digest.split("\n")[0],  # first line as title
                note=digest,                 # full digest in note
                position="top",
            )
        log.info("Digest written to WorkFlowy")


# ── HELPERS ──────────────────────────────────────────────

def _set_tag(name: str, tag_key: str, tag_value: str) -> str:
    """Set or replace a #key:value tag in item name."""
    import re
    pattern = rf"#\s*{tag_key}:\S+"
    replacement = f"#{tag_key}:{tag_value}"
    if re.search(pattern, name):
        return re.sub(pattern, replacement, name)
    return f"{name} {replacement}"
