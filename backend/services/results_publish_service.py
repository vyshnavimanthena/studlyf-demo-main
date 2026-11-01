"""
Shared "results are final" stamping, used by the admin finalize endpoint (main.py) and the
organizer "Publish results" endpoint (routes/organizer_results_routes.py), so both leave the
event in exactly the same state: status ENDED, updated_at and finalized_at set in one $set.

The Talent API treats an event's results as published once finalized_at (or a results doc) exists,
see services/talent_service.py.
"""
from datetime import datetime

from db import events_col


async def stamp_event_finalized(event_filter_id) -> datetime:
    """Mark an event's results final. `event_filter_id` is the value of the event's `_id`."""
    now = datetime.utcnow()
    await events_col.update_one(
        {"_id": event_filter_id},
        {"$set": {"status": "ENDED", "updated_at": now, "finalized_at": now}},
    )
    return now
