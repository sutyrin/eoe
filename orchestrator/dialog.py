"""
Dialog System for WorkFlowy
Emulates Fractal Conversations through nested items.

Convention:
  - Each task node can have a dialog thread as children
  - Messages are prefixed: 🤖 (agent) or 👤 (human)
  - Replies are nested under the message they respond to (fractal!)
  - Metadata in note field (JSON): timestamp, agent_id, awaiting
  
Example tree:
  - Добавить onboarding flow #task #status:review
    - 🤖 Сделал три варианта...         ← agent message
      - 👤 Вариант Б, но макс 3 вопроса  ← human reply (nested = in context)
        - 🤖 Понял. Кнопки или текст?    ← agent follows up
          - 👤 Кнопки                     ← human answers
            - 🤖 Готово: [ссылка]         ← agent resolves
"""

import json
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

from workflowy_client import WorkFlowyClient, WFItem


class Speaker(Enum):
    AGENT = "🤖"
    HUMAN = "👤"
    SYSTEM = "⚙️"


class DialogState(Enum):
    """Who is the ball with?"""
    AWAITING_HUMAN = "awaiting_human"     # agent asked, waiting for reply
    AWAITING_AGENT = "awaiting_agent"     # human replied, agent should act
    RESOLVED = "resolved"                  # conversation complete
    ESCALATED = "escalated"                # needs human decision (red zone)


@dataclass
class DialogMessage:
    """A single message in a dialog thread."""
    item_id: str
    speaker: Speaker
    text: str
    timestamp: Optional[datetime] = None
    children: list["DialogMessage"] = None

    def __post_init__(self):
        if self.children is None:
            self.children = []


@dataclass
class Dialog:
    """A complete dialog thread attached to a task node."""
    task_id: str
    task_name: str
    messages: list[DialogMessage]
    state: DialogState

    @property
    def last_message(self) -> Optional[DialogMessage]:
        """Get the deepest (most recent) leaf message."""
        if not self.messages:
            return None
        return _deepest_leaf(self.messages[-1])

    @property
    def last_speaker(self) -> Optional[Speaker]:
        msg = self.last_message
        return msg.speaker if msg else None

    @property
    def full_thread(self) -> list[DialogMessage]:
        """Flatten the tree into chronological order (DFS)."""
        result = []
        for msg in self.messages:
            _flatten(msg, result)
        return result

    def context_for_agent(self) -> str:
        """
        Format the entire dialog as text context for LLM prompt.
        Includes nesting to preserve thread structure.
        """
        lines = []
        for msg in self.messages:
            _format_thread(msg, lines, indent=0)
        return "\n".join(lines)


def _deepest_leaf(msg: DialogMessage) -> DialogMessage:
    if not msg.children:
        return msg
    return _deepest_leaf(msg.children[-1])


def _flatten(msg: DialogMessage, result: list):
    result.append(msg)
    for child in msg.children:
        _flatten(child, result)


def _format_thread(msg: DialogMessage, lines: list, indent: int):
    prefix = "  " * indent
    lines.append(f"{prefix}{msg.speaker.value} {msg.text}")
    for child in msg.children:
        _format_thread(child, lines, indent + 1)


def _detect_speaker(name: str) -> Speaker:
    name = name.strip()
    if name.startswith(Speaker.AGENT.value):
        return Speaker.AGENT
    elif name.startswith(Speaker.HUMAN.value):
        return Speaker.HUMAN
    elif name.startswith(Speaker.SYSTEM.value):
        return Speaker.SYSTEM
    # Default: if it's in a dialog, assume human wrote it
    return Speaker.HUMAN


def _strip_prefix(name: str) -> str:
    for s in Speaker:
        if name.strip().startswith(s.value):
            return name.strip()[len(s.value):].strip()
    return name.strip()


def _parse_messages(items: list[WFItem]) -> list[DialogMessage]:
    """Recursively parse WFItems into DialogMessages."""
    messages = []
    for item in items:
        speaker = _detect_speaker(item.name)
        msg = DialogMessage(
            item_id=item.id,
            speaker=speaker,
            text=_strip_prefix(item.name),
            timestamp=item.created_at,
            children=_parse_messages(item.sorted_children()),
        )
        messages.append(msg)
    return messages


def _determine_state(messages: list[DialogMessage]) -> DialogState:
    """
    Determine dialog state by looking at the deepest leaf.
    If last message is from agent → awaiting human.
    If last message is from human → awaiting agent.
    """
    if not messages:
        return DialogState.AWAITING_AGENT

    leaf = _deepest_leaf(messages[-1])

    # Check for explicit state markers in text
    text_lower = leaf.text.lower()
    if "#resolved" in text_lower or "#done" in text_lower:
        return DialogState.RESOLVED
    if "#escalated" in text_lower or "#red" in text_lower:
        return DialogState.ESCALATED

    if leaf.speaker == Speaker.AGENT:
        return DialogState.AWAITING_HUMAN
    elif leaf.speaker == Speaker.HUMAN:
        return DialogState.AWAITING_AGENT
    else:
        return DialogState.AWAITING_AGENT


class DialogManager:
    """
    Manages fractal dialog threads in WorkFlowy.
    
    Usage:
        dm = DialogManager(wf_client)
        
        # Read existing dialog
        dialog = await dm.read_dialog(task_item_id, depth=5)
        
        # Agent replies to the latest message
        await dm.agent_reply(dialog, "Готово, вот результат: ...")
        
        # Agent starts a new thread on a task
        await dm.agent_start(task_item_id, "Взял задачу. Вопрос: ...")
        
        # Find all dialogs awaiting agent action
        pending = await dm.find_pending_dialogs(backlog_item_id)
    """

    def __init__(self, client: WorkFlowyClient):
        self.wf = client

    async def read_dialog(self, task_id: str, depth: int = 5) -> Dialog:
        """Read the full dialog tree under a task node."""
        task = await self.wf.get_item(task_id)
        children_tree = await self.wf.get_subtree(task_id, depth=depth)
        
        # Filter: only dialog messages (prefixed with speaker emoji)
        dialog_items = [
            c for c in children_tree
            if any(c.name.strip().startswith(s.value) for s in Speaker)
        ]
        
        messages = _parse_messages(dialog_items)
        state = _determine_state(messages)
        
        return Dialog(
            task_id=task_id,
            task_name=task.name,
            messages=messages,
            state=state,
        )

    async def agent_reply(
        self,
        dialog: Dialog,
        text: str,
        reply_to: Optional[str] = None,
    ) -> str:
        """
        Agent posts a reply in the dialog.
        
        If reply_to is given, nests under that message (fractal branching).
        Otherwise, nests under the deepest leaf (continues the thread).
        """
        if reply_to:
            parent_id = reply_to
        elif dialog.last_message:
            parent_id = dialog.last_message.item_id
        else:
            parent_id = dialog.task_id

        formatted = f"{Speaker.AGENT.value} {text}"
        new_id = await self.wf.create_item(
            parent_id=parent_id,
            name=formatted,
            position="bottom",
        )
        return new_id

    async def agent_start(self, task_id: str, text: str) -> str:
        """Agent starts a new dialog thread on a task (top-level message)."""
        formatted = f"{Speaker.AGENT.value} {text}"
        new_id = await self.wf.create_item(
            parent_id=task_id,
            name=formatted,
            position="bottom",
        )
        return new_id

    async def agent_branch(
        self,
        dialog: Dialog,
        branch_from_id: str,
        text: str,
    ) -> str:
        """
        Agent creates a branching reply — responds to an earlier message
        rather than the latest one. This is the fractal part:
        
        Original thread:
          🤖 Вот 3 варианта: А, Б, В
            👤 Вариант Б
              🤖 Уточнение по Б...
        
        Branch (responds to original, not to the leaf):
          🤖 Вот 3 варианта: А, Б, В
            👤 Вариант Б
              🤖 Уточнение по Б...
            🤖 ← NEW: А между тем, по варианту А...
        """
        formatted = f"{Speaker.AGENT.value} {text}"
        new_id = await self.wf.create_item(
            parent_id=branch_from_id,
            name=formatted,
            position="bottom",
        )
        return new_id

    async def find_pending_dialogs(
        self,
        parent_id: str,
        depth: int = 3,
    ) -> list[Dialog]:
        """
        Scan children of parent_id for task nodes that have
        dialogs awaiting agent action.
        """
        children = await self.wf.list_children(parent_id)
        pending = []

        for child in children:
            # Skip completed tasks
            if child.is_completed:
                continue
            # Check if this node has dialog messages
            subtree = await self.wf.get_subtree(child.id, depth=depth)
            has_dialog = any(
                any(c.name.strip().startswith(s.value) for s in Speaker)
                for c in subtree
            )
            if not has_dialog:
                continue

            dialog = await self.read_dialog(child.id, depth=depth)
            if dialog.state == DialogState.AWAITING_AGENT:
                pending.append(dialog)

        return pending

    async def find_stale_dialogs(
        self,
        parent_id: str,
        stale_hours: float = 24,
        depth: int = 3,
    ) -> list[Dialog]:
        """Find dialogs where the last message is older than stale_hours."""
        children = await self.wf.list_children(parent_id)
        stale = []
        now = datetime.now()

        for child in children:
            if child.is_completed:
                continue
            try:
                dialog = await self.read_dialog(child.id, depth=depth)
            except Exception:
                continue

            last = dialog.last_message
            if last and last.timestamp:
                age_hours = (now - last.timestamp).total_seconds() / 3600
                if age_hours > stale_hours:
                    stale.append(dialog)

        return stale
