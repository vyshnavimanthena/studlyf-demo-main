import asyncio
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from db import db

async def run():
    # 'db' is likely a MotorDatabase instance
    # To list collections, use the database object directly
    print(await db.list_collection_names())

if __name__ == '__main__':
    asyncio.run(run())
