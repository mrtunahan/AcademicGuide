import asyncio
import contextlib
import json
from collections import defaultdict
from typing import Any


class NotificationHub:
    """In-memory pub/sub for SSE notifications, keyed by user_id."""

    def __init__(self) -> None:
        self._subs: dict[int, set[asyncio.Queue[str]]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def subscribe(self, user_id: int) -> asyncio.Queue[str]:
        queue: asyncio.Queue[str] = asyncio.Queue(maxsize=64)
        async with self._lock:
            self._subs[user_id].add(queue)
        return queue

    async def unsubscribe(self, user_id: int, queue: asyncio.Queue[str]) -> None:
        async with self._lock:
            self._subs[user_id].discard(queue)
            if not self._subs[user_id]:
                self._subs.pop(user_id, None)

    async def publish(self, user_id: int, event: str, payload: dict[str, Any]) -> None:
        message = json.dumps({"event": event, "data": payload}, ensure_ascii=False)
        async with self._lock:
            queues = list(self._subs.get(user_id, ()))
        for q in queues:
            with contextlib.suppress(asyncio.QueueFull):
                q.put_nowait(message)


_hub = NotificationHub()


def get_hub() -> NotificationHub:
    return _hub
