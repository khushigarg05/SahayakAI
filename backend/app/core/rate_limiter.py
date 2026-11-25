import time
import threading
import logging
from typing import Dict, List, Optional, Tuple
from fastapi import Request, HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)

class HybridRateLimiter:
    """
    Production-Ready Hybrid Rate Limiter:
    - Distributed Redis-backed sliding window when REDIS_URL is configured (for multi-worker & multi-pod clusters).
    - Thread-safe in-memory sliding window fallback for local development and single-node staging.
    - Zero breaking changes: automatically falls back to in-memory if Redis is unavailable or unconfigured.
    """

    def __init__(self):
        self._lock = threading.Lock()
        # Structure: { "scope:identifier": [timestamp1, timestamp2, ...] }
        self._records: Dict[str, List[float]] = {}
        self._redis_client = None
        self._redis_initialized = False

    def _get_redis(self):
        if not self._redis_initialized:
            self._redis_initialized = True
            redis_url = getattr(settings, "REDIS_URL", None)
            if redis_url and redis_url.strip():
                try:
                    import redis
                    client = redis.from_url(redis_url.strip(), decode_responses=True, socket_connect_timeout=2)
                    client.ping()
                    self._redis_client = client
                    logger.info("HybridRateLimiter: Successfully connected to Redis for distributed rate limiting.")
                except Exception as e:
                    logger.warning(f"HybridRateLimiter: Redis connection failed ({e}). Falling back to in-memory rate limiting.")
                    self._redis_client = None
        return self._redis_client

    def _check_redis(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        r = self._get_redis()
        if not r:
            return True, 0
        now = time.time()
        window_start = now - window_seconds
        pipe = r.pipeline()
        
        # 1. Remove expired timestamps outside the sliding window
        pipe.zremrangebyscore(key, 0, window_start)
        # 2. Count remaining timestamps in window
        pipe.zcard(key)
        # 3. Add current timestamp
        pipe.zadd(key, {str(now): now})
        # 4. Set key TTL so inactive keys self-purge
        pipe.expire(key, window_seconds + 5)
        
        results = pipe.execute()
        current_count = results[1]

        if current_count >= max_requests:
            oldest = r.zrange(key, 0, 0, withscores=True)
            if oldest:
                retry_after = max(1, int(window_seconds - (now - oldest[0][1])))
            else:
                retry_after = window_seconds
            return False, retry_after
        return True, 0

    def check(
        self,
        scope: str,
        identifier: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, int]:
        key = f"rate_limit:{scope}:{identifier}"
        redis_client = self._get_redis()

        if redis_client:
            try:
                return self._check_redis(key, max_requests, window_seconds)
            except Exception as e:
                logger.warning(f"HybridRateLimiter: Redis operation error ({e}); using in-memory fallback.")

        # In-memory thread-safe sliding window fallback
        now = time.time()
        with self._lock:
            if len(self._records) > 5000:
                self._cleanup(now, window_seconds)

            timestamps = self._records.get(key, [])
            window_start = now - window_seconds
            timestamps = [t for t in timestamps if t > window_start]

            if len(timestamps) >= max_requests:
                earliest_in_window = timestamps[0]
                retry_after = max(1, int(window_seconds - (now - earliest_in_window)))
                self._records[key] = timestamps
                return False, retry_after

            timestamps.append(now)
            self._records[key] = timestamps
            return True, 0

    def _cleanup(self, now: float, window_seconds: int):
        expired_keys = []
        for key, timestamps in self._records.items():
            valid_timestamps = [t for t in timestamps if (now - t) < (window_seconds * 2)]
            if valid_timestamps:
                self._records[key] = valid_timestamps
            else:
                expired_keys.append(key)
        for key in expired_keys:
            del self._records[key]


# Global Singleton Instance
rate_limiter = HybridRateLimiter()


def enforce_rate_limit(
    request: Request,
    scope: str,
    max_requests: int = 30,
    window_seconds: int = 60,
    custom_identifier: Optional[str] = None
):
    """
    FastAPI dependency/helper to enforce rate limiting based on client IP or custom identifier.
    Raises HTTP 429 Too Many Requests if the threshold is exceeded.
    """
    if custom_identifier:
        identifier = custom_identifier
    else:
        # Extract client IP (honor reverse proxies like Cloudflare/Nginx if present)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            identifier = forwarded.split(",")[0].strip()
        elif request.client and request.client.host:
            identifier = request.client.host
        else:
            identifier = "127.0.0.1"

    allowed, retry_after = rate_limiter.check(
        scope=scope,
        identifier=identifier,
        max_requests=max_requests,
        window_seconds=window_seconds
    )

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many requests for {scope}. Please retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
