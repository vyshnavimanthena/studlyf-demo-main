
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import asyncio
from bson import ObjectId
from db import events_col, participants_col, teams_col
import json

async def audit():
    event_id = "6a19874db3a0be28194e208a"
    
    # 1. Fetch Event
    try:
        event = await events_col.find_one({"_id": ObjectId(event_id)})
    except Exception as e:
        print(f"Error fetching event: {e}")
        return

    if not event:
        print(f"Event {event_id} not found")
        return

    print("=== EVENT DOCUMENT ===")
    stages = event.get("stages", [])
    print(json.dumps({
        "event_id": str(event["_id"]),
        "title": event.get("title"),
        "participationType": event.get("participationType")
    }, indent=2))
    
    print("\n=== STAGES ===")
    for s in stages:
        print(json.dumps({
            "id": s.get("id"),
            "name": s.get("name"),
            "type": s.get("type"),
            "order": s.get("order"),
            "visibility": s.get("visibility"),
            "depends_on": s.get("depends_on"),
            "team_required": s.get("team_required"),
            "start_date": s.get("start_date"),
            "end_date": s.get("end_date")
        }, indent=2))

    # 2. Fetch Participants for this event
    participant = await participants_col.find_one({"event_id": str(event_id)})
    
    if participant:
        print("\n=== PARTICIPANT DOCUMENT ===")
        print(json.dumps({
            "participant_id": str(participant["_id"]),
            "user_id": str(participant.get("user_id")),
            "status": participant.get("status"),
            "registration_status": participant.get("registration_status"),
            "current_stage": participant.get("current_stage"),
            "last_stage_submitted": participant.get("last_stage_submitted"),
            "team_id": participant.get("team_id"),
            "team_name": participant.get("team_name")
        }, indent=2))
        
        if participant.get("team_id"):
            try:
                team = await teams_col.find_one({"_id": ObjectId(str(participant["team_id"]))})
                if team:
                    print("\n=== TEAM DOCUMENT ===")
                    print(json.dumps({
                        "team_id": str(team["_id"]),
                        "team_name": team.get("team_name"),
                        "team_status": team.get("status")
                    }, indent=2))
            except:
                pass
    else:
        print("\nNo participant found for this event.")

if __name__ == "__main__":
    asyncio.run(audit())
