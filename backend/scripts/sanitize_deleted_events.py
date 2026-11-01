import asyncio
from datetime import datetime
import logging

from db import events_col, opportunities_col
from bson import ObjectId

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sanitize_deleted_events")


async def main(dry_run: bool = False):
    """Mark deleted events as hidden to students and sync opportunity mirrors.

    Usage: python scripts/sanitize_deleted_events.py
    """
    query = {
        "$or": [
            {"status": {"$in": ["DELETED", "deleted"]}},
            {"removed_at": {"$exists": True}}
        ]
    }

    updated = 0
    async for ev in events_col.find(query):
        try:
            ev_id = ev.get("_id")
            ev_id_str = str(ev_id)
            logger.info(f"Processing event {ev_id_str} - title={ev.get('title')}")

            # Prepare updates
            ev_update = {
                "visible_to_students": False,
                "status": "DELETED",
                "updated_at": datetime.utcnow()
            }

            if not dry_run:
                await events_col.update_one({"_id": ev_id}, {"$set": ev_update})

                # Sync opportunity mirror if any
                opp = await opportunities_col.find_one({"event_link_id": ev_id_str})
                if opp:
                    opp_update = {"status": "deleted", "visible_to_students": False, "updated_at": datetime.utcnow()}
                    await opportunities_col.update_one({"_id": opp.get("_id")}, {"$set": opp_update})

            updated += 1
        except Exception as e:
            logger.exception(f"Failed to process event {ev.get('_id')}: {e}")

    logger.info(f"Completed. Events processed: {updated}")


if __name__ == '__main__':
    # Run the script
    try:
        asyncio.run(main(dry_run=False))
    except Exception as e:
        logger.exception(f"Script failed: {e}")
