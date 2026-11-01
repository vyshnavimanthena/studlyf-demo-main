import asyncio
import sys
import os
import pprint
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from db import db

async def run():
    cert = await db.db.event_certificates.find().sort('issued_at', -1).limit(1).to_list(None)
    pprint.pprint(cert)

if __name__ == '__main__':
    asyncio.run(run())
