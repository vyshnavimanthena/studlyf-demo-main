import time
import logging
import functools
from fastapi import Request
from pymongo import monitoring

# Setup performance logger
logging.basicConfig(level=logging.INFO)
perf_logger = logging.getLogger("perf_audit")

# 1. Route Timing Middleware
async def performance_middleware(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    end_time = time.perf_counter()
    
    process_time = end_time - start_time
    # Note: Accessing response size can be complex, will log timing for now
    perf_logger.info(f"API_AUDIT | Method: {request.method} | Path: {request.url.path} | Time: {process_time:.4f}s")
    
    return response

# 2. Database Monitoring (Query Execution Time)
class CommandLogger(monitoring.CommandListener):
    def started(self, event):
        self.start_time = time.perf_counter()

    def succeeded(self, event):
        duration = time.perf_counter() - self.start_time
        if duration > 0.5: # Only log slow queries > 500ms
            perf_logger.warning(f"DB_AUDIT | Command: {event.command_name} | Duration: {duration:.4f}s | Query: {event.command}")

    def failed(self, event):
        perf_logger.error(f"DB_AUDIT_FAIL | Command: {event.command_name} | Error: {event.failure}")

monitoring.register(CommandLogger())
