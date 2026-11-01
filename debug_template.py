import asyncio
from db import db
import pprint

async def run():
    template = await db.cert_templates.find_one({'template_id': 'b7003ed5'})
    pprint.pprint(template)

if __name__ == '__main__':
    asyncio.run(run())
