"""
Circuit breaker pattern for external service resilience.
"""

import asyncio
import logging
import time
from enum import Enum
from functools import wraps
from typing import Any, Callable, Optional

logger = logging.getLogger("circuit_breaker")


class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        half_open_max_retries: int = 3,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_retries = half_open_max_retries

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.half_open_attempts = 0

    def _reset(self):
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.half_open_attempts = 0

    def _trip(self):
        self.state = CircuitState.OPEN
        self.last_failure_time = time.time()
        logger.warning(f"Circuit breaker '{self.name}' tripped OPEN")

    async def call(self, func: Callable, *args, **kwargs) -> Any:
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_attempts = 0
                logger.info(f"Circuit breaker '{self.name}' moving to HALF_OPEN")
            else:
                raise CircuitBreakerOpenError(f"Circuit '{self.name}' is OPEN")

        try:
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_attempts += 1
            if self.half_open_attempts >= self.half_open_max_retries:
                self._reset()
                logger.info(f"Circuit breaker '{self.name}' CLOSED after half-open success")
        else:
            self._reset()

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.state == CircuitState.HALF_OPEN:
            self._trip()
        elif self.failure_count >= self.failure_threshold:
            self._trip()


class CircuitBreakerOpenError(Exception):
    pass


# Registry of all circuit breakers
_circuit_breakers: dict[str, CircuitBreaker] = {}


def get_circuit_breaker(name: str, **kwargs) -> CircuitBreaker:
    if name not in _circuit_breakers:
        _circuit_breakers[name] = CircuitBreaker(name=name, **kwargs)
    return _circuit_breakers[name]


def with_circuit_breaker(name: str, **cb_kwargs):
    def decorator(func: Callable) -> Callable:
        cb = get_circuit_breaker(name, **cb_kwargs)

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            return await cb.call(func, *args, **kwargs)

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            return cb.call(func, *args, **kwargs)

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    return decorator
