
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

import asyncio
from bson import ObjectId
from db import events_col

async def repair_dependencies():
    event_id = "6a19874db3a0be28194e208a"
    
    event = await events_col.find_one({"_id": ObjectId(event_id)})
    if not event:
        print("Event not found")
        return

    stages = event.get("stages", [])
    stage_ids = {s.get("id") for s in stages if s.get("id")}
    
    print(f"Repairing event: {event.get('title')}")
    print(f"Valid stage IDs: {stage_ids}")
    
    modified = False
    for stage in stages:
        deps = stage.get("depends_on", [])
        if not isinstance(deps, list): continue
        
        valid_deps = []
        for d in deps:
            if d in stage_ids:
                valid_deps.append(d)
            else:
                print(f"Removing orphan dependency {d} from stage {stage.get('name')}")
                modified = True
        
        # If no valid deps but stage is "Final Submission", maybe it should depend on "Idea Submission"?
        if stage.get("name") == "Final Submission" and not valid_deps:
            idea_stage = next((s for s in stages if "Idea Submission" in s.get("name")), None)
            if idea_stage:
                print(f"Auto-repairing: Mapping Final Submission to depend on {idea_stage.get('name')}")
                valid_deps = [idea_stage.get("id")]
                modified = True
        
        # If no valid deps but stage is "Results", maybe it should depend on "Final Submission"?
        if "Results" in stage.get("name") and not valid_deps:
            final_stage = next((s for s in stages if "Final Submission" in s.get("name")), None)
            if final_stage:
                print(f"Auto-repairing: Mapping Results to depend on {final_stage.get('name')}")
                valid_deps = [final_stage.get("id")]
                modified = True
        
        stage["depends_on"] = valid_deps

    if modified:
        await events_col.update_one(
            {"_id": ObjectId(event_id)},
            {"$set": {"stages": stages}}
        )
        print("Event dependencies repaired successfully.")
    else:
        print("No orphan dependencies found (or already clean).")

if __name__ == "__main__":
    asyncio.run(repair_dependencies())
