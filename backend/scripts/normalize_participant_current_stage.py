#!/usr/bin/env python3
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from difflib import SequenceMatcher
import asyncio

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))
MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'studlyf_db')

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def normalize(s: str) -> str:
    if not s:
        return ''
    return ''.join(ch.lower() for ch in s if ch.isalnum())

async def main(dry_run=True):
    changes = []
    async for ev in db.events.find():
        stages = ev.get('stages', []) or []
        stage_map = []
        for st in stages:
            name = st.get('name') or ''
            sid = st.get('id') or ''
            stage_map.append({'id': sid, 'name': name, 'norm_name': normalize(name), 'norm_id': normalize(sid)})

        # fetch participants for this event
        async for p in db.participants.find({'event_id': ev['_id']}):
            cur = p.get('current_stage') or ''
            norm_cur = normalize(cur)
            if not norm_cur:
                continue
            # If matches any stage name or id exactly, skip
            matched = False
            for st in stage_map:
                if norm_cur == st['norm_name'] or norm_cur == st['norm_id']:
                    matched = True
                    break
            if matched:
                continue
            # fuzzy match
            best = None
            best_score = 0.0
            for st in stage_map:
                score = SequenceMatcher(None, norm_cur, st['norm_name']).ratio()
                if score > best_score:
                    best_score = score
                    best = st
            if best and best_score >= 0.6:
                changes.append({'participant_id': str(p.get('_id')), 'user_id': p.get('user_id'), 'event_id': str(ev.get('_id')), 'current_stage_original': cur, 'matched_stage_id': best['id'], 'matched_stage_name': best['name'], 'score': best_score})

    print(f'Found {len(changes)} potential fixes')
    for c in changes:
        print(c)

    if not dry_run and changes:
        print('\nApplying changes...')
        for c in changes:
            await db.participants.update_one({'_id': c['participant_id']}, {'$set': {'current_stage': c['matched_stage_id']}})
        print('Applied')

    client.close()

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true', help='Apply changes to DB')
    args = parser.parse_args()
    asyncio.run(main(dry_run=not args.apply))
