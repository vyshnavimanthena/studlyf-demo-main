
import asyncio
from backend.db import opportunity_applications_col

async def count_apps():
    count = await opportunity_applications_col.count_documents({})
    print(count)

asyncio.run(count_apps())
