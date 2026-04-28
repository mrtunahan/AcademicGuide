import asyncio

import jwt
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse

from app.core.security import decode_token
from app.services.notifications import get_hub

router = APIRouter()

KEEPALIVE_INTERVAL = 25  # seconds


@router.get("/stream")
async def stream(request: Request, token: str = Query(...)) -> StreamingResponse:
    try:
        payload = decode_token(token)
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Geçersiz token") from exc

    hub = get_hub()
    queue = await hub.subscribe(user_id)

    async def event_generator():
        try:
            yield f': connected user={user_id}\n\n'
            while True:
                if await request.is_disconnected():
                    break
                try:
                    message = await asyncio.wait_for(
                        queue.get(), timeout=KEEPALIVE_INTERVAL
                    )
                    yield f"data: {message}\n\n"
                except TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            await hub.unsubscribe(user_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
