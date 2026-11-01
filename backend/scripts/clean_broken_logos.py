"""Clear broken file-path logo/banner URLs from the database."""
import os, sys, asyncio
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

async def clean():
    url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'studlyf_db')
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=20000, tlsCAFile=certifi.where() if url.lower().startswith('mongodb+srv://') else None)
    db = client[db_name]
    
    for col_name in ['events', 'opportunities']:
        col = db[col_name]
        async for doc in col.find({}):
            updates = {}
            for f in ['logo_url', 'banner_url']:
                val = doc.get(f, '')
                if val and not val.startswith('data:') and 'render.com' in val:
                    updates[f] = ''
                    print(f'[{col_name}] {doc["_id"]}: clearing {f}')
            if updates:
                await col.update_one({'_id': doc['_id']}, {'$set': updates})
                print(f'  -> cleared {len(updates)} field(s)')
    
    client.close()
    print('Done.')

asyncio.run(clean())
