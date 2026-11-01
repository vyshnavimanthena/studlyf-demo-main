import asyncio
from bson import ObjectId
from datetime import datetime

from db import db, submission_data_col
from services.judge_service import create_judge, assign_judge_to_multiple_submissions

EVENT_ID = "6a1923bdbcdebc6f5fff4fbb"

async def main():
    await db.connect()
    # Create judge
    judge = {
        "name": "E2E Judge One",
        "full_name": "E2E Judge One",
        "email": "e2e.judge1@example.com",
        "role": "judge",
        "is_test": True,
        "created_at": datetime.utcnow().isoformat()
    }
    created = await create_judge(judge)
    judge_id = created.get("_id")
    print("JUDGE_ID", judge_id)

    # Find submission_data for our test user
    sub = await submission_data_col.find_one({"event_id": EVENT_ID})
    if not sub:
        print("NO_SUBMISSION_FOUND")
        return
    sub_id = str(sub.get("_id"))
    print("SUBMISSION_ID", sub_id)

    # Assign judge
    res = await assign_judge_to_multiple_submissions([sub_id], judge_id)
    print("ASSIGN_RESULT", res)

    # Fetch submission to get token
    updated = await submission_data_col.find_one({"_id": ObjectId(sub_id)})
    assigned = updated.get("assigned_judges", [])
    tokens = [aj.get("evaluation_token") for aj in assigned if aj.get("evaluation_token")]
    print("TOKENS", tokens)

if __name__ == '__main__':
    asyncio.run(main())
