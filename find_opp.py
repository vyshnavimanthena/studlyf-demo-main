
import asyncio
from backend.db import opportunities_col

async def find_opp():
    # Event ID: 6a19874db3a0be28194e208a
    opp = await opportunities_col.find_one({"event_link_id": "6a19874db3a0be28194e208a"})
    print(opp)

asyncio.run(find_opp())
