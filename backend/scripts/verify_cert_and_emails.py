import asyncio
from db import db, event_certificates_col, certificate_jobs_col, email_delivery_logs_col, email_queue_col

async def main():
    await db.connect()
    event_id='6a1923bdbcdebc6f5fff4fbb'
    certs = await event_certificates_col.find({'event_id': event_id}).to_list(length=20)
    print('CERT_COUNT', len(certs))
    for c in certs:
        print('CERT', c.get('certificate_id'), c.get('user_id'), c.get('achievement_key'), c.get('issued_at'))
    jobs = await certificate_jobs_col.find({'event_id': event_id}).to_list(length=20)
    print('JOB_COUNT', len(jobs))
    for j in jobs:
        print('JOB', str(j.get('_id')), j.get('status'), j.get('processed'), j.get('total'))
    q = await email_queue_col.find({'metadata.event_id': event_id}).sort('created_at', -1).to_list(length=10)
    print('QUEUE_COUNT', len(q))
    for item in q:
        print('QUEUE', item.get('status'), item.get('recipient'), item.get('attempts'), item.get('metadata',{}).get('type'))
    logs = await email_delivery_logs_col.find({'metadata.event_id': event_id}).sort('created_at', -1).to_list(length=10)
    print('DELIVERY_LOG_COUNT', len(logs))
    for log in logs:
        print('DELIVERY', log.get('status'), log.get('recipient'), log.get('error'))

if __name__ == '__main__':
    asyncio.run(main())
