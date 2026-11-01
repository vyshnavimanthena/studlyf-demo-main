
import sys
import asyncio
sys.path.insert(0, './backend')
from db import leaderboard_col, submission_data_col

async def run():
    lc = await leaderboard_col.count_documents({})
    sc = await submission_data_col.count_documents({})
    print(f"Leaderboard count: {lc}")
    print(f"Submission data count: {sc}")

if __name__ == '__main__':
    asyncio.run(run())
