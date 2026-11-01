import time
import functools
import logging
from fastapi import Request

logger = logging.getLogger("performance")

def time_request(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = await func(*args, **kwargs)
        end_time = time.perf_counter()
        execution_time = end_time - start_time
        logger.info(f"Route: {func.__name__} | Execution Time: {execution_time:.4f}s")
        return result
    return wrapper
