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

    distinct_ids = await db.modules.distinct('course_id')
    inserted = 0
    for cid in distinct_ids:
        exists = await db.courses.find_one({'_id': cid})
        if exists:
            continue
        # Create a minimal course document
        course_doc = {
            '_id': cid,
            'title': f'Course {cid}',
            'description': 'Auto-seeded course generated from modules collection.',
            'role_tag': 'Software Engineering',
            'difficulty': 'Intermediate',
            'price': 0,
            'created_at': None,
        }
        await db.courses.insert_one(course_doc)
        print('Inserted course', cid)
        inserted += 1

    if inserted == 0:
        print('No missing courses found.')
    else:
        print('Inserted', inserted, 'course(s).')

    client.close()


if __name__ == '__main__':
    asyncio.run(main())
