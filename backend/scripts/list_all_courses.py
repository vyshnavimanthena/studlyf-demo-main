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

    count = await db.courses.count_documents({})
    print(f'Total courses in database: {count}')
    print()

    cursor = db.courses.find({}).limit(10)
    courses = await cursor.to_list(length=10)
    
    for i, course in enumerate(courses, 1):
        print(f'Course {i}:')
        print(f"  _id: {course.get('_id')}")
        print(f"  title: {course.get('title')}")
        print(f"  description: {course.get('description')[:80] if course.get('description') else 'N/A'}...")
        print(f"  role_tag: {course.get('role_tag')}")
        print(f"  price: {course.get('price')}")
        print()

    client.close()


if __name__ == '__main__':
    asyncio.run(main())
