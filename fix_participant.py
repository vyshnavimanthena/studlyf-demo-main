
import asyncio
from backend.db import participants_col
from bson import ObjectId

async def update_participant():
    # User: 91e52fb4-5a9a-4bf4-964b-0233bcce7519
    # Event: 6a19874db3a0be28194e208a
    result = await participants_col.update_one(
        {"user_id": "91e52fb4-5a9a-4bf4-964b-0233bcce7519", "event_id": "6a19874db3a0be28194e208a"},
        {"$set": {"status": "registered"}}
    )
    print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")

asyncio.run(update_participant())
