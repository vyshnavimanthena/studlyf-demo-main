
import asyncio
from backend.db import registrations_col
from bson import ObjectId

async def check_reg():
    # User: 91e52fb4-5a9a-4bf4-964b-0233bcce7519
    # Event: 6a19874db3a0be28194e208a
    reg = await registrations_col.find_one({"user_id": "91e52fb4-5a9a-4bf4-964b-0233bcce7519", "event_id": "6a19874db3a0be28194e208a"})
    print(reg)

asyncio.run(check_reg())
