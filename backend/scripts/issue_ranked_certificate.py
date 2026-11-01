import asyncio
from bson import ObjectId
from db import db, participants_col, event_certificates_col
from services.institutional_certificate_service import certificate_service

EVENT_ID = '6a1923bdbcdebc6f5fff4fbb'

async def main():
    await db.connect()
    # Find participant for our test user
    p = await participants_col.find_one({'event_id': EVENT_ID, 'user_id': 'e2e_user_1'})
    if not p:
        print('NO_PARTICIPANT')
        return
    pid = str(p.get('_id'))
    print('Participant _id:', pid)

    rankings = [
        {"participant_id": pid, "rank": 1}
    ]

    issued = await certificate_service.issue_ranked_event_certificates(EVENT_ID, rankings, send_email=True)
    print('Issued count:', len(issued))
    for r in issued:
        print('CERT:', r.get('certificate_id'), 'user_id:', r.get('user_id'))

    # Verify in DB
    certs = await event_certificates_col.find({'event_id': EVENT_ID}).to_list(length=20)
    print('DB certificates for event:', len(certs))

if __name__ == '__main__':
    asyncio.run(main())
