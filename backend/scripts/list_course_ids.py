import os
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio


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

    distinct_ids = await db.modules.distinct('course_id')
    print('Distinct course_ids in modules collection:')
    for cid in distinct_ids:
        print('-', cid)

    # Show a sample module for the first course_id
    if distinct_ids:
        sample = await db.modules.find_one({'course_id': distinct_ids[0]})
        print('\nSample module for', distinct_ids[0])
        print({k: sample.get(k) for k in ['_id', 'title', 'course_id', 'order_index']})

    client.close()


if __name__ == '__main__':
    asyncio.run(main())
