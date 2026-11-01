from db import scores_col, submissions_col
from bson import ObjectId
from datetime import datetime, timezone

async def submit_score(submission_id: str, judge_id: str, scores: dict, comments: str, team_id: str = "", event_id: str = ""):
    # Calculate total (sum of rubric scores) and average
    rubric_sum = sum(scores.values())
    avg_score = rubric_sum / len(scores) if scores else 0
    now = datetime.now(timezone.utc).isoformat()
    
    # Upsert: one score per judge per submission (unique compound index on submission_id + judge_id)
    set_fields = {
        "scores": scores,
        "comments": comments,
        "total_avg": avg_score,
        "total_score": rubric_sum,
        "updated_at": now,
        "event_id": event_id,
    }
    if team_id:
        set_fields["team_id"] = team_id
    result = await scores_col.update_one(
        {"submission_id": submission_id, "judge_id": judge_id},
        {"$set": set_fields, "$setOnInsert": {
            "created_at": now
        }},
        upsert=True
    )
    
    # Update submission_data_col with the score
    from db import submission_data_col, events_col
    recommendation = "hold"
    classified_status = "Scored"
    try:
        event = await events_col.find_one({"_id": ObjectId(event_id)}) if event_id else None
        if event:
            thresholds = event.get("evaluation_thresholds") or {}
            criteria = event.get("judging_criteria") or []
            max_possible = sum(float(c.get("max_points") or 10) for c in criteria) or 100.0
            pct = (rubric_sum / max_possible * 100) if max_possible > 0 else 0
            shortlist_min = float(thresholds.get("shortlist_min", 80))
            waitlist_min = float(thresholds.get("waitlist_min", 65))
            reject_below = float(thresholds.get("reject_below", 40))
            if pct >= shortlist_min:
                recommendation = "shortlist"
                classified_status = "Shortlisted"
            elif pct >= waitlist_min:
                recommendation = "waitlist"
                classified_status = "Waitlisted"
            elif pct < reject_below:
                recommendation = "reject"
                classified_status = "Rejected"
        await submission_data_col.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"total_score": rubric_sum, "status": classified_status, "evaluation_score": rubric_sum, "evaluation_status": "completed", "evaluation_recommendation": recommendation}},
        )
    except Exception:
        pass

    # Always update legacy submissions_col too (for EventHub + legacy endpoints)
    try:
        await submissions_col.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"status": "Reviewed", "total_score": rubric_sum, "assigned_judge_id": judge_id}},
        )
    except Exception:
        pass

    # Also update hackathon_submissions_col if this submission exists there
    try:
        from db import hackathon_submissions_col
        await hackathon_submissions_col.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {
                "totalScore": rubric_sum,
                "rubricScores": scores,
                "status": "Evaluated",
                "updatedAt": now,
            }},
        )
    except Exception:
        pass
    
    # Retrieve the document to return the _id
    score_doc = await scores_col.find_one(
        {"submission_id": submission_id, "judge_id": judge_id}
    )
    if score_doc:
        score_doc["_id"] = str(score_doc["_id"])
    else:
        score_doc = {
            "submission_id": submission_id,
            "judge_id": judge_id,
            "scores": scores,
            "comments": comments,
            "total_avg": avg_score,
            "total_score": rubric_sum,
            "event_id": event_id,
            "team_id": team_id,
            "created_at": now,
            "updated_at": now,
            "_id": str(result.upserted_id) if result.upserted_id else ""
        }
    return score_doc

async def get_scores_for_submission(submission_id: str):
    cursor = scores_col.find({"submission_id": submission_id})
    scores = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        scores.append(doc)
    return scores
