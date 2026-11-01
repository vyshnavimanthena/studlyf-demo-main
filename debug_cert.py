import asyncio
import sys
import os
import pprint
# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from db import db

async def run():
    # Fetch latest cert
    cert = await db.event_certificates_col.find_one({}, sort=[("issued_at", -1)])
    pprint.pprint(cert)

if __name__ == '__main__':
    asyncio.run(run())
