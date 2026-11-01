import json
from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from db import (
    events_col,
    institutions_col,
    participants_col,
    hackathon_problems_col,
    hackathon_selections_col,
    hackathon_event_config_col,
    opportunities_col,
    users_col,
)
from routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/hackathons", tags=["Hackathon Public"])


def _as_object_id(value: str):
    try:
        return ObjectId(value)
    except Exception:
        return None


async def _resolve_event(event_id: str) -> dict:
    event = None
    obj_id = _as_object_id(event_id)
    if obj_id:
        event = await events_col.find_one({"_id": obj_id})
    if not event:
        event = await events_col.find_one({"_id": event_id})
    if not event and obj_id:
        opp = await opportunities_col.find_one({"event_link_id": event_id})
        if not opp:
            opp = await opportunities_col.find_one({"event_link_id": obj_id})
        if opp and opp.get("event_link_id"):
            event = await events_col.find_one({"_id": opp.get("event_link_id")})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


async def _resolve_institution_id(event: dict) -> str:
    institution_id = event.get("institution_id")
    if not institution_id:
        raise HTTPException(status_code=400, detail="Event is missing institution_id")
    return institution_id


def _serialize(doc: dict) -> dict:
    if not doc:
        return doc
    payload = dict(doc)
    if "_id" in payload:
        payload["id"] = str(payload.pop("_id"))
    return payload


async def _load_event_config(institution_id: str) -> dict:
    configs = await hackathon_event_config_col.find({"institution_id": institution_id}).to_list(length=100)
    config: dict = {}
    for row in configs:
        config[row.get("key")] = row.get("value")
    # best-effort parse for JSON-ish values
    for key in ("sponsors", "event_packages"):
        value = config.get(key)
        if isinstance(value, str):
            try:
                config[key] = json.loads(value)
            except Exception:
                pass
    return config


async def _build_participant(event_id: str, user: dict, institution_id: str) -> dict:
    now = datetime.now(timezone.utc)
    participant = await participants_col.find_one({"event_id": event_id, "user_id": user.get("user_id")})
    if not participant and user.get("email"):
        participant = await participants_col.find_one({"event_id": event_id, "email": user.get("email")})
    if participant:
        return _serialize(participant)

    profile = await users_col.find_one({"user_id": user.get("user_id")})
    doc = {
        "event_id": event_id,
        "institution_id": institution_id,
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "name": user.get("full_name") or user.get("name") or (profile or {}).get("full_name") or (profile or {}).get("name") or "Participant",
        "registration_status": "Registered",
        "status": "Active",
        "registered_at": now,
        "updated_at": now,
        "reg_id": (participant or {}).get("reg_id", ""),
        "bullet_points": (participant or {}).get("bullet_points", []),
        "linkedin_post": (participant or {}).get("linkedin_post", ""),
    }
    result = await participants_col.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.get("/events/{event_id}/problems")
async def list_problems(
    event_id: str,
    search: Optional[str] = None,
    domain: Optional[str] = None,
    availability: str = Query("all", pattern="^(all|open|full)$"),
    user: dict = Depends(get_current_user),
):
    event = await _resolve_event(event_id)
    institution_id = await _resolve_institution_id(event)
    await _build_participant(event_id, user, institution_id)

    query: dict = {"institution_id": institution_id, "status": "active"}
    if domain and domain != "All":
        query["domain"] = domain

    pipeline = [
        {"$match": query},
        {"$lookup": {"from": "hackathon_selections", "localField": "problem_id", "foreignField": "problem_id", "as": "selections"}},
        {"$addFields": {
            "team_count": {"$size": "$selections"},
            "slots_left": {"$subtract": ["$max_teams", {"$size": "$selections"}]},
            "is_full": {"$gte": [{"$size": "$selections"}, "$max_teams"]},
        }},
        {"$sort": {"domain": 1, "ps_code": 1}},
        {"$project": {"selections": 0}},
    ]
    problems = await hackathon_problems_col.aggregate(pipeline).to_list(length=500)
    if search:
        needle = search.lower().strip()
        problems = [
            p for p in problems
            if needle in " ".join(str(p.get(k, "")) for k in ["title", "description", "brief", "domain", "tech_stack", "ps_code"]).lower()
        ]
    if availability == "open":
        problems = [p for p in problems if not p.get("is_full")]
    elif availability == "full":
        problems = [p for p in problems if p.get("is_full")]
    return {"problems": [_serialize(p) for p in problems]}


@router.get("/events/{event_id}/stats")
async def get_stats(event_id: str, user: dict = Depends(get_current_user)):
    event = await _resolve_event(event_id)
    institution_id = await _resolve_institution_id(event)
    await _build_participant(event_id, user, institution_id)

    active = await hackathon_problems_col.count_documents({"institution_id": institution_id, "status": "active"})
    picks = await hackathon_selections_col.count_documents({"institution_id": institution_id})
    return {"activeStatements": active, "totalPicks": picks}


@router.get("/events/{event_id}/my-selection")
async def my_selection(event_id: str, user: dict = Depends(get_current_user)):
    event = await _resolve_event(event_id)
    institution_id = await _resolve_institution_id(event)
    participant = await _build_participant(event_id, user, institution_id)
    email = (user.get("email") or "").strip().lower()
    query = {"event_id": event_id, "$or": [{"team_lead_email": email}, {"user_id": user.get("user_id")}, {"email": email}]}
    selection = await hackathon_selections_col.find_one(query)
    if not selection:
        return None
    problem = await hackathon_problems_col.find_one({"problem_id": selection.get("problem_id")})
    payload = _serialize(selection)
    if problem:
        payload["problem_title"] = problem.get("title")
        payload["domain"] = problem.get("domain")
        payload["ps_code"] = problem.get("ps_code")
    payload["participant"] = participant
    return payload


@router.post("/events/{event_id}/select")
async def select_problem(event_id: str, body: dict, user: dict = Depends(get_current_user)):
    event = await _resolve_event(event_id)
    institution_id = await _resolve_institution_id(event)
    await _build_participant(event_id, user, institution_id)

    problem_id = body.get("problem_id")
    team_name = (body.get("team_name") or "").strip()
    team_size_raw = body.get("team_size")
    if team_size_raw is None or str(team_size_raw).strip() == "":
        raise HTTPException(status_code=400, detail="team_size is required")
    team_size = int(team_size_raw)
    if not problem_id:
        raise HTTPException(status_code=400, detail="problem_id is required")
    if not team_name:
        raise HTTPException(status_code=400, detail="team_name is required")

    problem = await hackathon_problems_col.find_one({"problem_id": str(problem_id), "institution_id": institution_id, "status": "active"})
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found or inactive")

    team_count = await hackathon_selections_col.count_documents({"problem_id": str(problem_id)})
    max_teams_raw = problem.get("max_teams")
    if max_teams_raw is None:
        raise HTTPException(status_code=400, detail="max_teams is not configured for this problem")
    if team_count >= int(max_teams_raw):
        raise HTTPException(status_code=400, detail="This problem has reached its maximum team capacity")

    email = (user.get("email") or "").strip().lower()
    existing = await hackathon_selections_col.find_one({"event_id": event_id, "$or": [{"team_lead_email": email}, {"user_id": user.get("user_id")}, {"email": email}]})
    if existing:
        raise HTTPException(status_code=409, detail="You have already selected a problem for this event")

    now = datetime.now(timezone.utc)
    selection = {
        "event_id": event_id,
        "institution_id": institution_id,
        "problem_id": str(problem_id),
        "team_name": team_name,
        "team_lead_name": user.get("full_name") or user.get("name") or "Participant",
        "team_lead_email": email,
        "user_id": user.get("user_id"),
        "email": email,
        "team_size": team_size,
        "selected_at": now,
    }
    result = await hackathon_selections_col.insert_one(selection)
    selection["_id"] = result.inserted_id
    return {"success": True, "selection_id": str(result.inserted_id), "problem_title": problem.get("title")}


@router.get("/events/{event_id}/portal")
async def get_portal(event_id: str, user: dict = Depends(get_current_user)):
    event = await _resolve_event(event_id)
    institution_id = await _resolve_institution_id(event)
    participant = await _build_participant(event_id, user, institution_id)
    config = await _load_event_config(institution_id)
    stats = {
        "activeStatements": await hackathon_problems_col.count_documents({"institution_id": institution_id, "status": "active"}),
        "totalPicks": await hackathon_selections_col.count_documents({"institution_id": institution_id}),
    }
    problems = await list_problems(event_id, None, None, "all", user)
    selection = await my_selection(event_id, user)
    config_with_sponsors = {**config, "sponsors": event.get("sponsors", [])}
    return {
        "event": _serialize(event),
        "participant": participant,
        "config": config_with_sponsors,
        "stats": stats,
        "problems": problems["problems"],
        "mySelection": selection,
    }