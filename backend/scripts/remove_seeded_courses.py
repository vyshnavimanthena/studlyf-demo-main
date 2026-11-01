import os
import certifi
import asyncio
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None
from motor.motor_asyncio import AsyncIOMotorClient


async def main():
    root_env = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    if load_dotenv and os.path.exists(root_env):
        try:
            load_dotenv(root_env, override=False)
        except Exception:
            pass

    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'studlyf_db')
    if not mongo_url:
        print('MONGO_URL not set')
        return

    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    db = client[db_name]

    to_remove = ['ai -101', 'ai-01']
    removed = 0
    for cid in to_remove:
        res = await db.courses.delete_one({'_id': cid})
        if res.deleted_count:
            print('Deleted course', cid)
            removed += 1
        else:
            print('No document for', cid)

    print('Total removed:', removed)
    client.close()


if __name__ == '__main__':
    asyncio.run(main())
