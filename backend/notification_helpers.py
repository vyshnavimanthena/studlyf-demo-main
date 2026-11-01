"""In-app notifications for institution dashboards (navbar / alerts)."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from db import notifications_col


async def notify_institution(
    institution_id: Optional[str],
    message: str,
    *,
    ntype: str = "info",
    title: Optional[str] = None,
    meta: Optional[dict[str, Any]] = None,
) -> None:
    """Persist a notification keyed by ``institution_id`` for GET /notifications/{institution_id}."""
    if not institution_id or not str(institution_id).strip():
        return
    doc: dict[str, Any] = {
        "institution_id": str(institution_id).strip(),
        "message": message,
        "type": ntype,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    if title:
        doc["title"] = title
    if meta:
        doc["meta"] = meta
    try:
        await notifications_col.insert_one(doc)
    except Exception:
        pass
