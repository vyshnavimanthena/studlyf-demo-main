from __future__ import annotations
"""
Gunicorn production configuration.

Usage:
  gunicorn main:app -c gunicorn.conf.py
"""

import os
import multiprocessing

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
backlog = 2048

# Worker processes
workers = int(os.getenv("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 10000
max_requests_jitter = 2000
timeout = 120
graceful_timeout = 30
keep_alive = 5

# Logging
loglevel = os.getenv("LOG_LEVEL", "info").lower()
accesslog = "-"
errorlog = "-"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "studlyf"

# Server mechanics
daemon = False
pidfile = None
umask = 0o027
user = None
group = None
tmp_upload_dir = "/tmp/gunicorn-uploads"

# SSL (optional - terminate at nginx/Cloudflare in production)
keyfile = None
certfile = None

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190
