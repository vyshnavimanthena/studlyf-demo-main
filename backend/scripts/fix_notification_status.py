import asyncio
from datetime import datetime, timezone
import sys
import os

# Ensure backend directory is in path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import registrations_col

async def fix_notified_status(event_id, emails_to_fix):
    now = datetime.now(timezone.utc)
    for email in emails_to_fix:
        # Update records for approved participants with the given email
        result = await registrations_col.update_many(
            {
                "event_id": event_id, 
                "profile_snapshot.email": email, 
                "status": "APPROVED",
                "notified_at": None
            },
            {"$set": {"notified_at": now}}
        )
        print(f"Updated {result.modified_count} records for {email}")

if __name__ == "__main__":
    # --- CONFIGURATION ---
    # 1. Replace with your actual Event ID
    EVENT_ID = "YOUR_EVENT_ID_HERE"
    
    # 2. Add the emails of the 2 participants who were already notified
    EMAILS = ["email1@example.com", "email2@example.com"]
    # ---------------------

    if EVENT_ID == "YOUR_EVENT_ID_HERE":
        print("Please edit the script and set EVENT_ID and EMAILS.")
    else:
        asyncio.run(fix_notified_status(EVENT_ID, EMAILS))
