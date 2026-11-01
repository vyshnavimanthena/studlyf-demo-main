import asyncio
import sys
import os
import pprint
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from db import db

async def run():
    # Fetch recent records from the collection used in the registry
    certs = await db.db.event_certificates.find().sort('issued_at', -1).limit(5).to_list(None)
    pprint.pprint(certs)

if __name__ == '__main__':
    asyncio.run(run())
