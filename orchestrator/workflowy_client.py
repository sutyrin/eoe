"""
WorkFlowy Beta API Client
Covers all /api/beta/ endpoints + tree traversal helpers.
"""

import httpx
import asyncio
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class WFItem:
    """A single WorkFlowy node."""
    id: str
    name: str
    note: Optional[str] = None
    priority: int = 0
    layout_mode: str = "bullets"
    created_at: Optional[datetime] = None
    modified_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    children: list["WFItem"] = field(default_factory=list)

    @classmethod
    def from_api(cls, data: dict) -> "WFItem":
        return cls(
            id=data["id"],
            name=data.get("name", ""),
            note=data.get("note"),
            priority=data.get("priority", 0),
            layout_mode=data.get("data", {}).get("layoutMode", "bullets"),
            created_at=_ts(data.get("createdAt")),
            modified_at=_ts(data.get("modifiedAt")),
            completed_at=_ts(data.get("completedAt")),
        )

    @property
    def is_completed(self) -> bool:
        return self.completed_at is not None

    def find_by_tag(self, tag: str) -> list["WFItem"]:
        """Find all descendants whose name contains #tag."""
        found = []
        if tag in self.name:
            found.append(self)
        for child in self.children:
            found.extend(child.find_by_tag(tag))
        return found

    def find_by_prefix(self, prefix: str) -> list["WFItem"]:
        """Find all descendants whose name starts with prefix."""
        found = []
        if self.name.strip().startswith(prefix):
            found.append(self)
        for child in self.children:
            found.extend(child.find_by_prefix(prefix))
        return found

    def last_child(self) -> Optional["WFItem"]:
        """Return the last child by priority (bottom of the list)."""
        if not self.children:
            return None
        return max(self.children, key=lambda c: c.priority)

    def sorted_children(self) -> list["WFItem"]:
        """Children sorted by priority (top to bottom)."""
        return sorted(self.children, key=lambda c: c.priority)


def _ts(unix: Optional[int]) -> Optional[datetime]:
    if unix is None:
        return None
    return datetime.fromtimestamp(unix)


class WorkFlowyClient:
    """
    Async client for WorkFlowy Beta API.
    
    Usage:
        async with WorkFlowyClient(api_key="...") as wf:
            root_children = await wf.list_children(None)
            item = await wf.get_item("some-uuid")
            new_id = await wf.create_item(parent_id, "Hello", position="bottom")
    """

    BASE_URL = "https://beta.workflowy.com/api/beta"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        self._client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
        return self

    async def __aexit__(self, *args):
        if self._client:
            await self._client.aclose()

    async def _post(self, endpoint: str, payload: dict) -> dict:
        resp = await self._client.post(
            f"{self.BASE_URL}/{endpoint}/",
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()

    async def _get(self, endpoint: str) -> dict:
        resp = await self._client.get(f"{self.BASE_URL}/{endpoint}/")
        resp.raise_for_status()
        return resp.json()

    # ── CRUD ──────────────────────────────────────────────

    async def get_item(self, item_id: str) -> WFItem:
        data = await self._post("get-item", {"item_id": item_id})
        return WFItem.from_api(data["item"])

    async def list_children(self, item_id: Optional[str]) -> list[WFItem]:
        """Pass None for root."""
        raw_id = item_id if item_id else "None"
        data = await self._post("list-children", {"item_id": raw_id})
        items = [WFItem.from_api(i) for i in data.get("items", [])]
        return sorted(items, key=lambda x: x.priority)

    async def create_item(
        self,
        parent_id: Optional[str],
        name: str,
        note: Optional[str] = None,
        position: str = "bottom",
    ) -> str:
        """Create child item. Returns new item's UUID."""
        payload = {
            "parent_id": parent_id if parent_id else "None",
            "name": name,
            "position": position,
        }
        if note:
            payload["note"] = note
        data = await self._post("create-item", payload)
        return data["item_id"]

    async def edit_item(
        self,
        item_id: str,
        name: Optional[str] = None,
        note: Optional[str] = None,
    ) -> None:
        payload = {"item_id": item_id}
        if name is not None:
            payload["name"] = name
        if note is not None:
            payload["note"] = note
        await self._post("edit-item", payload)

    async def complete_item(self, item_id: str) -> None:
        await self._post("complete-item", {"item_id": item_id})

    async def uncomplete_item(self, item_id: str) -> None:
        await self._post("uncomplete-item", {"item_id": item_id})

    async def delete_item(self, item_id: str) -> None:
        await self._post("delete-item", {"item_id": item_id})

    async def list_all(self) -> list[WFItem]:
        """Flat list of ALL items. Rate limited: 1 req/hour."""
        data = await self._get("list-all")
        return [WFItem.from_api(i) for i in data.get("items", [])]

    # ── TREE HELPERS ──────────────────────────────────────

    async def get_subtree(self, item_id: Optional[str], depth: int = 2) -> list[WFItem]:
        """
        Recursively fetch a subtree up to `depth` levels.
        depth=1 means just direct children.
        """
        children = await self.list_children(item_id)
        if depth > 1:
            for child in children:
                child.children = await self.get_subtree(child.id, depth - 1)
        return children

    async def find_node_by_name(
        self, name_fragment: str, parent_id: Optional[str] = None
    ) -> Optional[WFItem]:
        """Find first node matching name_fragment in children."""
        children = await self.list_children(parent_id)
        for child in children:
            if name_fragment.lower() in child.name.lower():
                return child
        return None
