import asyncio
import sys
import os
import pprint
from bson import ObjectId

# Ensure backend directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from db import db

async def run():
    # Use the correct collection based on where templates are stored
    template = await db.cert_templates.find_one({'template_id': 'b7003ed5'})
    pprint.pprint(template)

if __name__ == '__main__':
    asyncio.run(run())
