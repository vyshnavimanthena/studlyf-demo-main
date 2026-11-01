import argparse
import asyncio
import os
import ssl
import smtplib
from email.message import EmailMessage
from datetime import datetime

from db import db, email_queue_col, email_delivery_logs_col, event_certificates_col, participants_col


def send_via_smtp(recipient, subject, body, smtp_conf):
    msg = EmailMessage()
    msg["From"] = smtp_conf['user']
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.set_content(body)

    server = smtp_conf['server']
    port = smtp_conf['port']
    user = smtp_conf['user']
    pwd = smtp_conf['pass']
    use_ssl = smtp_conf.get('use_ssl', False)
    use_tls = smtp_conf.get('use_tls', False)

    if use_ssl:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(server, port, context=context) as s:
            s.login(user, pwd)
            s.send_message(msg)
    else:
        with smtplib.SMTP(server, port) as s:
            if use_tls:
                s.starttls()
            s.login(user, pwd)
            s.send_message(msg)


async def main(event_id, dry_run=False, limit=100):
    await db.connect()

    # Try to find queued email entries for this event first
    queued = await email_queue_col.find({'metadata.event_id': event_id}).to_list(length=limit)

    # If no explicit queued emails, synthesize from certificates
    if not queued:
        certs = await event_certificates_col.find({'event_id': event_id}).to_list(length=limit)
        queued = []
        for c in certs:
            user_id = c.get('user_id')
            # try to find participant email
            p = await participants_col.find_one({'user_id': user_id, 'event_id': event_id})
            recipient = None
            if p:
                recipient = p.get('email')
            recipient = recipient or c.get('email')
            if not recipient:
                continue
            queued.append({
                '_id': None,
                'recipient': recipient,
                'subject': c.get('email_subject') or f"Your certificate for {event_id}",
                'body': c.get('email_body') or f"Congratulations! Attached is your certificate for event {event_id}.",
                'metadata': {'event_id': event_id, 'type': 'certificate_issue'},
                'attempts': 0,
            })

    print(f"Found {len(queued)} emails to attempt for event {event_id}")

    # load SMTP config from env
    smtp_conf = {
        'server': os.getenv('SMTP_SERVER', 'smtp.example.com'),
        'port': int(os.getenv('SMTP_PORT', 587)),
        'user': os.getenv('SMTP_USER', ''),
        'pass': os.getenv('SMTP_PASS', ''),
        'use_ssl': os.getenv('SMTP_USE_SSL', 'false').lower() in ('1','true','yes'),
        'use_tls': os.getenv('SMTP_USE_TLS', 'true').lower() in ('1','true','yes'),
    }

    if dry_run:
        print('DRY RUN: not sending emails. SMTP config shown below:')
        print(smtp_conf)

    for item in queued:
        recipient = item.get('recipient')
        subject = item.get('subject')
        body = item.get('body')
        print('->', recipient, subject)
        if dry_run:
            continue
        try:
            send_via_smtp(recipient, subject, body, smtp_conf)
            # mark as sent in queue if there's a real _id
            if item.get('_id'):
                await email_queue_col.update_one({'_id': item['_id']}, {'$set': {'status': 'sent', 'sent_at': datetime.utcnow()}})
            # log delivery
            await email_delivery_logs_col.insert_one({'recipient': recipient, 'status': 'sent', 'metadata': item.get('metadata', {}), 'created_at': datetime.utcnow()})
            print('SENT', recipient)
        except Exception as e:
            print('FAILED', recipient, str(e))
            # update queue record if exists
            if item.get('_id'):
                await email_queue_col.update_one({'_id': item['_id']}, {'$set': {'status': 'failed', 'last_error': str(e), 'attempts': item.get('attempts', 0) + 1}})
            await email_delivery_logs_col.insert_one({'recipient': recipient, 'status': 'failed', 'error': str(e), 'metadata': item.get('metadata', {}), 'created_at': datetime.utcnow()})


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--event-id', required=True)
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--limit', type=int, default=200)
    args = parser.parse_args()

    asyncio.run(main(args.event_id, dry_run=args.dry_run, limit=args.limit))
