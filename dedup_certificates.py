"""Remove duplicate certificate records from event_certificates collection.
Keeps the most recently issued one per (event_id, user_id, achievement_key)."""

import certifi, os
from pymongo import MongoClient
from datetime import datetime

env_path = os.path.join(os.path.dirname(__file__), '.env')
url = None
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line.startswith('MONGO_URL='):
            url = line.split('=', 1)[1].strip()
            break

if not url:
    print("MONGO_URL not found in .env")
    exit(1)

print("Connecting to MongoDB...")
client = MongoClient(url, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=30000)
db = client['studlyf_db']

event = db.events.find_one({'title': {'$regex': 'CodeForge 2026', '$options': 'i'}})
if not event:
    print("Event 'CodeForge 2026' not found")
    client.close()
    exit(1)

eid = str(event['_id'])
print(f"\nEvent: {event['title']} (ID: {eid})")

# Debug: check all collections that might have these certs
from bson import ObjectId

eid_oid = ObjectId(eid)
eid_str = eid

collections_to_check = ['event_certificates', 'certificates', 'certificate_records']

for col_name in collections_to_check:
    col = db[col_name]
    print(f"\n--- Collection: {col_name} ---")
    
    # Check string event_id
    string_count = col.count_documents({"event_id": eid_str})
    print(f"  string event_id '{eid_str}': {string_count} docs")
    
    # Check ObjectId event_id
    oid_count = col.count_documents({"event_id": eid_oid})
    print(f"  ObjectId event_id '{eid}': {oid_count} docs")
    
    # Check any event_id that looks similar
    all_ids = col.distinct("event_id")
    print(f"  all distinct event_ids: {all_ids[:5]}")
    
    if string_count > 0:
        all_certs = list(col.find({"event_id": eid_str}, sort=[("issued_at", -1)]))
        print(f"\n  Certificates ({len(all_certs)} total):")
        for c in all_certs[:25]:
            uid = c.get("user_id", "?")
            name = c.get("participant_name", c.get("recipient_name", "?"))
            ach = c.get("achievement_key", c.get("achievement_type", "?"))
            cert_id = c.get("certificate_id", "?")
            issued = c.get("issued_at", "?")
            print(f"    cert={cert_id} user={uid} name={name} ach={ach} issued={issued}")
    elif oid_count > 0:
        all_certs = list(col.find({"event_id": eid_oid}, sort=[("issued_at", -1)]))
        print(f"\n  Certificates ({len(all_certs)} total):")
        for c in all_certs[:25]:
            uid = c.get("user_id", "?")
            name = c.get("participant_name", c.get("recipient_name", "?"))
            ach = c.get("achievement_key", c.get("achievement_type", "?"))
            cert_id = c.get("certificate_id", "?")
            issued = c.get("issued_at", "?")
            print(f"    cert={cert_id} user={uid} name={name} ach={ach} issued={issued}")

print(f"\n--- Total collection sizes ---")
for col_name in collections_to_check:
    col = db[col_name]
    print(f"  {col_name}: {col.count_documents({})}")

# List all events to understand possible event_ids
print(f"\n--- All events ---")
all_events = list(db.events.find({}, {"_id": 1, "title": 1}))
for ev in all_events:
    print(f"  {ev['_id']}: {ev.get('title', '?')}")

# Also check certificate_jobs details
if db.certificate_jobs.count_documents({}) > 0:
    print(f"\n--- Certificate jobs ---")
    jobs = list(db.certificate_jobs.find())
    for j in jobs:
        print(f"  _id={j['_id']} event_id={j.get('event_id')} status={j.get('status')} achievement={j.get('achievement_type')} issued={j.get('processed')}/{j.get('total')}")

# Find duplicates by (user_id, achievement_key)
pipeline = [
    {"$match": {"event_id": eid}},
    {"$group": {
        "_id": {"user_id": "$user_id", "achievement_key": "$achievement_key"},
        "count": {"$sum": 1},
        "docs": {"$push": {"_id": "$_id", "issued_at": "$issued_at", "certificate_id": "$certificate_id"}}
    }},
    {"$match": {"count": {"$gt": 1}}}
]

dups = list(db.event_certificates.aggregate(pipeline))

if not dups:
    print("\nNo duplicate certificates found by (user_id, achievement_key).")
else:
    print(f"\nFound {len(dups)} groups with duplicates:")
    total_removed = 0
    total_kept = 0

    for group in dups:
        key = group["_id"]
        docs = group["docs"]
        count = group["count"]
        user_id = key.get("user_id", "?")
        ach = key.get("achievement_key", "?")

        docs.sort(key=lambda d: d.get("issued_at") or datetime.min, reverse=True)
        keep = docs[0]
        remove = docs[1:]

        total_removed += len(remove)
        total_kept += 1

        remove_ids = [d["_id"] for d in remove]
        result = db.event_certificates.delete_many({"_id": {"$in": remove_ids}})

        cert_ids = [d.get("certificate_id", "?") for d in remove]
        print(f"  [{ach}] user={user_id}: kept {keep.get('certificate_id')}, "
              f"removed {result.deleted_count} duplicates: {', '.join(cert_ids)}")

    print(f"\nSummary: kept {total_kept}, removed {total_removed} duplicate(s)")

# Also dedup by (participant_name, achievement_key) in case user_id differs
print("\n--- Also checking duplicates by (participant_name, achievement_key) ---")
pipeline2 = [
    {"$match": {"event_id": eid}},
    {"$group": {
        "_id": {"participant_name": "$participant_name", "achievement_key": "$achievement_key"},
        "count": {"$sum": 1},
        "docs": {"$push": {"_id": "$_id", "issued_at": "$issued_at", "certificate_id": "$certificate_id", "user_id": "$user_id"}}
    }},
    {"$match": {"count": {"$gt": 1}}}
]

dups2 = list(db.event_certificates.aggregate(pipeline2))
if not dups2:
    print("No duplicates by participant_name either.")
else:
    print(f"Found {len(dups2)} groups with duplicates by name:")
    for group in dups2:
        key = group["_id"]
        docs = group["docs"]
        name = key.get("participant_name", "?")
        ach = key.get("achievement_key", "?")
        print(f"  [{ach}] name={name} ({group['count']} copies)")
        for d in docs:
            print(f"    cert={d.get('certificate_id')} user={d.get('user_id')} issued={d.get('issued_at')}")

print("\nCreating unique index on (event_id, user_id, achievement_key)...")
try:
    db.event_certificates.create_index(
        [("event_id", 1), ("user_id", 1), ("achievement_key", 1)],
        unique=True
    )
    print("Unique index created.")
except Exception as e:
    print(f"Index creation skipped (may already exist or conflict): {e}")

client.close()
print("\nDone. You can now create a new Achievement Registry.")
