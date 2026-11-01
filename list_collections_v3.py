import asyncio
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from db import db

async def run():
    # Access the motor database directly
    print(await db.db.list_collection_names())
    # Inspect collections
    print(await db.db.event_certificates_col.count_documents({}))

if __name__ == '__main__':
    asyncio.run(run())
