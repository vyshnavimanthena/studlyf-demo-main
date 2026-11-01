import asyncio
from bson import ObjectId
from datetime import datetime

from db import db, participants_col, events_col, users_col, notifications_col
from services.event_workflow_service import workflow_service

EVENT_ID = '6a1923bdbcdebc6f5fff4fbb'
USER_ID = 'e2e_user_1'

async def main():
    await db.connect()
    # Find event and participant
    ev = await events_col.find_one({'_id': ObjectId(EVENT_ID)})
    if not ev:
        print('EVENT_NOT_FOUND')
        return
    stages = ev.get('stages', [])
    participant = await participants_col.find_one({'event_id': EVENT_ID, 'user_id': USER_ID})
    if not participant:
        print('PARTICIPANT_NOT_FOUND')
        return
    cur_stage_id = participant.get('current_stage')
    # find index
    idx = None
    for i,s in enumerate(stages):
        if s.get('id') == cur_stage_id:
            idx = i
            break
    if idx is None:
        print('CURRENT_STAGE_NOT_FOUND')
        return
    if idx+1 >= len(stages):
        print('ALREADY_AT_LAST_STAGE')
        return
    next_stage = stages[idx+1]
    next_stage_name = next_stage.get('name')

    # Run workflow checks
    try:
        ok = await workflow_service.process_phase_transition(EVENT_ID, [str(participant.get('_id'))], next_stage_name)
        if not ok:
            print('WORKFLOW_REJECTED')
            return
    except Exception as e:
        print('WORKFLOW_EXCEPTION', e)
        return

    # Update participant doc
    update = {'current_stage': next_stage.get('id'), 'last_updated': datetime.utcnow()}
    prev_stage = participant.get('current_stage')
    if prev_stage:
        update['last_stage_submitted'] = prev_stage
        await participants_col.update_one({'_id': participant['_id']}, {'$set': update, '$push': {'completed_stages': prev_stage}})
    else:
        await participants_col.update_one({'_id': participant['_id']}, {'$set': update})

    # Enqueue email via email_queue_service
    try:
        from services.email_queue_service import enqueue_email
        # Determine recipient email
        p_email = participant.get('email')
        if not p_email and participant.get('user_id'):
            u = await users_col.find_one({'user_id': participant.get('user_id')})
            if u:
                p_email = u.get('email')
        subject = f"You've advanced to {next_stage_name}"
        html = f"<p>Congratulations! You have advanced to <strong>{next_stage_name}</strong> in event <strong>{ev.get('title')}</strong>.</p>"
        if p_email:
            await enqueue_email(p_email, subject, html, metadata={'event_id': EVENT_ID, 'stage_name': next_stage_name, 'type': 'stage_advancement'})
            print('ENQUEUED_EMAIL', p_email)
    except Exception as e:
        print('EMAIL_ENQUEUE_FAILED', e)

    # Create in-app notification
    try:
        notif = {
            'user_id': participant.get('user_id') or str(participant.get('_id')),
            'event_id': EVENT_ID,
            'message': f"You've advanced to '{next_stage_name}' stage of {ev.get('title')}",
            'type': 'PHASE_ADVANCEMENT',
            'timestamp': datetime.utcnow().isoformat(),
            'is_read': False
        }
        await notifications_col.insert_one(notif)
    except Exception as e:
        print('NOTIF_CREATE_FAILED', e)

    print('ADVANCED', participant.get('user_id'), 'to', next_stage_name)

if __name__ == '__main__':
    asyncio.run(main())
