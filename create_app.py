
import asyncio
from backend.db import opportunity_applications_col
from bson import ObjectId

async def create_app():
    # Opp ID: 6a19874db3a0be28194e208c
    # User: 91e52fb4-5a9a-4bf4-964b-0233bcce7519
    await opportunity_applications_col.insert_one({
        "opportunity_id": "6a19874db3a0be28194e208c",
        "user_id": "91e52fb4-5a9a-4bf4-964b-0233bcce7519",
        "status": "approved"
    })
    print("Created application")

asyncio.run(create_app())
