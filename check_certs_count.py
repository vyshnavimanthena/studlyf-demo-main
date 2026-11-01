import asyncio
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from db import db

async def run():
    # Check both potential collections
    print("Certificates count:", await db.db.certificates.count_documents({}))
    print("Event Certificates count:", await db.db.event_certificates.count_documents({}))

if __name__ == '__main__':
    asyncio.run(run())
