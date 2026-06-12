"""
Thin Redis cache layer with graceful degradation.

If Redis is unreachable the cache functions are silent no-ops, so every
endpoint continues working without a cache hit.
"""
import json
import logging
from typing import Any

import redis as redis_lib

from app.config import settings

logger = logging.getLogger("stem_commons.cache")

_pool: redis_lib.ConnectionPool | None = None


def _client() -> redis_lib.Redis | None:
    global _pool
    if not settings.REDIS_URL:
        return None
    try:
        if _pool is None:
            _pool = redis_lib.ConnectionPool.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1,
            )
        return redis_lib.Redis(connection_pool=_pool)
    except Exception as exc:
        logger.warning("Redis connection failed: %s", exc)
        return None


def cache_get(key: str) -> Any | None:
    r = _client()
    if r is None:
        return None
    try:
        raw = r.get(key)
        return json.loads(raw) if raw is not None else None
    except Exception as exc:
        logger.debug("cache_get(%s): %s", key, exc)
        return None


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = _client()
    if r is None:
        return
    try:
        r.setex(key, ttl, json.dumps(value, default=str))
    except Exception as exc:
        logger.debug("cache_set(%s): %s", key, exc)


def cache_delete(key: str) -> None:
    r = _client()
    if r is None:
        return
    try:
        r.delete(key)
    except Exception as exc:
        logger.debug("cache_delete(%s): %s", key, exc)


def cache_delete_prefix(prefix: str) -> None:
    """Delete every key whose name starts with ``prefix:``."""
    r = _client()
    if r is None:
        return
    try:
        keys = list(r.scan_iter(f"{prefix}:*", count=200))
        if keys:
            r.delete(*keys)
    except Exception as exc:
        logger.debug("cache_delete_prefix(%s): %s", prefix, exc)
