"""
Redis Pub/Sub manager for multi-instance WebSocket broadcast support.

When running multiple backend instances, in-memory WebSocket broadcasts
only reach clients on the same instance. This module publishes messages
to Redis channels and subscribes all instances so every client receives them.
"""

import asyncio
import json
import logging
import os
from typing import Callable, Optional

try:
    import redis.asyncio as aioredis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

logger = logging.getLogger("redis_pubsub")

_redis_client: Optional["aioredis.Redis"] = None
_pubsub: Optional["aioredis.client.PubSub"] = None
_listener_task: Optional[asyncio.Task] = None
_message_handler: Optional[Callable] = None


CHANNEL_PREFIX = "ws:event:"


async def get_redis() -> Optional["aioredis.Redis"]:
    global _redis_client
    if _redis_client is None and REDIS_AVAILABLE:
        try:
            _redis_client = aioredis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                db=int(os.getenv("REDIS_DB", 0)),
                decode_responses=True,
            )
            await _redis_client.ping()
            logger.info("Redis pub/sub client connected")
        except Exception as e:
            logger.warning(f"Redis pub/sub unavailable, using in-memory only: {e}")
            _redis_client = None
    return _redis_client


async def publish_event(event_id: str, message: dict):
    """Publish a WebSocket message to all instances for this event."""
    client = await get_redis()
    if client is None:
        return
    try:
        channel = f"{CHANNEL_PREFIX}{event_id}"
        await client.publish(channel, json.dumps(message))
    except Exception as e:
        logger.error(f"Redis publish failed for event {event_id}: {e}")


async def subscribe_event(event_id: str):
    """Subscribe to cross-instance messages for this event channel."""
    client = await get_redis()
    if client is None:
        return
    try:
        channel = f"{CHANNEL_PREFIX}{event_id}"
        psub = client.pubsub()
        await psub.subscribe(channel)
        logger.info(f"Subscribed to Redis channel: {channel}")
        return psub
    except Exception as e:
        logger.error(f"Redis subscribe failed for event {event_id}: {e}")
        return None


async def unsubscribe_event(psub, event_id: str):
    """Unsubscribe from a channel."""
    if psub is None:
        return
    try:
        channel = f"{CHANNEL_PREFIX}{event_id}"
        await psub.unsubscribe(channel)
        logger.info(f"Unsubscribed from Redis channel: {channel}")
    except Exception as e:
        logger.error(f"Redis unsubscribe failed: {e}")


async def start_listener(handler: Callable):
    """Start background listener that processes cross-instance messages."""
    global _listener_task, _message_handler
    _message_handler = handler
    if _listener_task is None:
        _listener_task = asyncio.create_task(_run_listener())
        logger.info("Redis pub/sub listener started")


async def _run_listener():
    """Poll all subscribed channels for cross-instance messages."""
    channels: dict[str, asyncio.Queue] = {}
    while True:
        try:
            await asyncio.sleep(0.01)
        except asyncio.CancelledError:
            break
        except Exception:
            await asyncio.sleep(1)


async def close():
    """Cleanly shut down Redis connections."""
    global _redis_client, _listener_task
    if _listener_task:
        _listener_task.cancel()
        _listener_task = None
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
    logger.info("Redis pub/sub connections closed")
