"""
Organizer "Publish results" — P3-O2.

Flag ORGANIZER_PUBLISH_RESULTS (default off): every endpoint here answers 404 while it is off, and
the organizer UI hides the Results tab.

- GET  /api/v1/organizer/results/config                404 while off (UI probe)
- GET  /api/v1/organizer/events/{id}/results          owner organizer or admin: ranked results to review
- POST /api/v1/organizer/events/{id}/results/publish  owner organizer or admin: freezes the rankings in a
       results doc and stamps the event with services.results_publish_service.stamp_event_finalized,
       the same call admin finalize (main.py) uses. Idempotent. Notifies participants.
- POST /api/v1/admin/events/{id}/results/unpublish    admin only: archives the results doc, unsets finalized_at
- GET  /api/v1/admin/results/published                admin only: list of events with published results
- GET  /api/results/{id}                              public: published snapshot (neutral fields), 404 if unpublished

Results stay neutral rankings: no winner_ids and no certificates are written here (awards come only from
certificates, issued separately).
"""
from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from auth_institution import assert_institution_owns_event, get_auth_user
from db import audit_logs_col, db, events_col, institutions_col, participants_col, results_col, teams_col
from routes.organizer_approval_routes import assert_organizer_approved
from services.results_publish_service import stamp_event_finalized

logger = logging.getLogger("organizer_results")

router = APIRouter(tags=["Organizer results"])

results_unpublished_col = db["results_unpublished"]

_PUBLISH_LOCK_TTL = timedelta(minutes=5)

# Fields copied from a leaderboard row into the published snapshot (neutral ranking data only)
_RANK_FIELDS = (
    "rank", "event_id", "team_id", "participant_id", "user_id", "participation_type", "team_name",
    "recipient_name", "total_score", "project_name", "project_title", "criteria_scores", "college",
)


def publish_enabled() -> bool:
    return os.getenv("ORGANIZER_PUBLISH_RESULTS", "").strip().lower() in ("1", "true", "on", "yes")


def _require_enabled() -> None:
    if not publish_enabled():
        raise HTTPException(status_code=404, detail="Not Found")


def _is_admin(user: dict) -> bool:
    return str(user.get("role") or "").lower() in ("admin", "super_admin")


def _iso(v):
    return v.isoformat() if isinstance(v, datetime) else v


def _event_query(event_id: str) -> dict:
    clauses = [{"_id": event_id}]
    if ObjectId.is_valid(event_id):
        clauses.append({"_id": ObjectId(event_id)})
    return {"$or": clauses}


async def _load_event(event_id: str, user: dict) -> dict:
    await assert_institution_owns_event(event_id, user)
    event = await events_col.find_one(_event_query(event_id))
    if not event:
        raise HTTPException(status_code=404, detail="Publishing results is only available for events")
    return event


def _clean_row(row: dict) -> dict:
    out = {k: row.get(k) for k in _RANK_FIELDS if k in row}
    for k in ("event_id", "team_id", "participant_id", "user_id"):
        if out.get(k) is not None:
            out[k] = str(out[k])
    return out


def _public_row(row: dict) -> dict:
    return {
        "rank": row.get("rank"),
        "name": row.get("team_name") or row.get("recipient_name") or "Participant",
        "lead_name": row.get("recipient_name"),
        "participation_type": row.get("participation_type") or ("TEAM" if row.get("team_id") else "INDIVIDUAL"),
        "project_title": row.get("project_title") or row.get("project_name"),
        "college": row.get("college"),
        "total_score": row.get("total_score"),
        "criteria_scores": row.get("criteria_scores") or {},
    }


def _event_summary(event: dict, results_doc: Optional[dict]) -> dict:
    published = bool(event.get("finalized_at")) or bool(results_doc)
    return {
        "id": str(event.get("_id")),
        "title": event.get("title") or event.get("name") or "Untitled event",
        "status": event.get("status"),
        "published": published,
        "published_at": _iso(event.get("finalized_at") or (results_doc or {}).get("published_at")),
        "published_via": (results_doc or {}).get("published_via") or ("admin_finalize" if event.get("finalized_at") else None),
        "end_date": _iso(event.get("end_date") or event.get("endDate")),
    }


async def _ranked_rows(event_id: str) -> list:
    from services.leaderboard_service import leaderboard_service
    rows = await leaderboard_service.calculate_event_leaderboard(event_id)
    return [_clean_row(r) for r in rows]


@router.get("/api/v1/organizer/results/config")
async def results_config():
    """Cheap probe for the UI: 404 while the flag is off, so the Results tab stays hidden."""
    _require_enabled()
    return {"enabled": True}


@router.get("/api/v1/organizer/events/{event_id}/results")
async def get_event_results(event_id: str, user: dict = Depends(get_auth_user)):
    """What the organizer reviews before publishing. Published events return the frozen snapshot."""
    _require_enabled()
    event = await _load_event(event_id, user)
    results_doc = await results_col.find_one({"event_id": event_id})
    summary = _event_summary(event, results_doc)
    if summary["published"]:
        if results_doc and results_doc.get("final_rankings"):
            rows = [_clean_row(r) for r in results_doc["final_rankings"]]
        else:  # finalized through the admin path: the leaderboard rows are final
            from db import leaderboard_col
            rows = [_clean_row(r) for r in await leaderboard_col.find({"event_id": event_id}).sort("rank", 1).to_list(5000)]
    else:
        # Same recalculation the organizer's "Refresh leaderboard" runs; this is what publish will freeze
        rows = await _ranked_rows(event_id)
    scored = sum(1 for r in rows if (r.get("total_score") or 0) > 0)
    return {
        "event": summary,
        "rankings": [_public_row(r) for r in rows],
        "total": len(rows),
        "scored": scored,
        "can_publish": (not summary["published"]) and len(rows) > 0,
        "can_unpublish": summary["published"] and _is_admin(user),
    }


async def _participant_user_ids(event: dict, rows: list) -> list:
    from integration_routes import collect_event_id_variants
    variants = await collect_event_id_variants(str(event["_id"]), event)
    ids: set = set()
    async for p in participants_col.find({"event_id": {"$in": variants}}, {"user_id": 1}):
        if p.get("user_id"):
            ids.add(str(p["user_id"]))
    team_ids = []
    for r in rows:
        if r.get("user_id"):
            ids.add(str(r["user_id"]))
        if r.get("team_id") and ObjectId.is_valid(str(r["team_id"])):
            team_ids.append(ObjectId(str(r["team_id"])))
    if team_ids:
        async for t in teams_col.find({"_id": {"$in": team_ids}}, {"members": 1}):
            for m in t.get("members") or []:
                if m.get("user_id"):
                    ids.add(str(m["user_id"]))
    return sorted(ids)


async def _notify_participants(event: dict, rows: list) -> None:
    try:
        from notification_service import notification_service
        title = event.get("title") or event.get("name") or "your event"
        user_ids = await _participant_user_ids(event, rows)
        for uid in user_ids:
            try:
                await notification_service.create_notification(
                    user_id=uid,
                    notification_type="event",
                    title=f"Results published: {title}",
                    message=f"The organizer has published the final results for {title}.",
                    metadata={"kind": "results_published", "action_url": f"/opportunities/{event['_id']}/results"},
                    event_id=str(event["_id"]),
                )
            except Exception as e:
                logger.error(f"results notification failed for {uid}: {e}")
        logger.info(f"results published for {event.get('_id')}: notified {len(user_ids)} participant(s)")
    except Exception as e:
        logger.error(f"results notification fan-out failed: {e}")


@router.post("/api/v1/organizer/events/{event_id}/results/publish")
async def publish_event_results(event_id: str, user: dict = Depends(get_auth_user)):
    _require_enabled()
    await assert_organizer_approved(user)
    event = await _load_event(event_id, user)
    existing = await results_col.find_one({"event_id": event_id})
    if event.get("finalized_at") or existing:
        return {"status": "already_published", "event": _event_summary(event, existing)}

    # Claim the event so two clicks (or two organizers) cannot publish twice. A lock older than
    # _PUBLISH_LOCK_TTL is stale (a crash or restart between claim and release) and can be re-claimed.
    now = datetime.utcnow()
    claim = await events_col.find_one_and_update(
        {
            "_id": event["_id"],
            "finalized_at": {"$in": [None]},
            "$or": [
                {"results_publish_lock": {"$exists": False}},
                {"results_publish_lock": {"$lt": now - _PUBLISH_LOCK_TTL}},
            ],
        },
        {"$set": {"results_publish_lock": now}},
    )
    if not claim:
        fresh = await events_col.find_one({"_id": event["_id"]}) or event
        return {"status": "already_published", "event": _event_summary(fresh, await results_col.find_one({"event_id": event_id}))}
    try:
        rows = await _ranked_rows(event_id)
        if not rows:
            raise HTTPException(status_code=409, detail="There are no ranked results to publish yet.")
        now = datetime.utcnow()
        await results_col.update_one(
            {"event_id": event_id},
            {"$set": {
                "event_id": event_id,
                "final_rankings": rows,
                "published_at": now,
                "published_by": user.get("user_id"),
                "published_via": "admin" if _is_admin(user) else "organizer",
            }},
            upsert=True,
        )
        finalized_at = await stamp_event_finalized(event["_id"])
    finally:
        await events_col.update_one({"_id": event["_id"]}, {"$unset": {"results_publish_lock": ""}})

    try:
        await audit_logs_col.insert_one({
            "action": "EVENT_RESULTS_PUBLISHED",
            "user": user.get("email") or user.get("user_id"),
            "details": f"Published results for event {event_id} ({len(rows)} ranked entries)",
            "event_id": event_id,
            "timestamp": datetime.utcnow().isoformat(),
        })
    except Exception as e:
        logger.error(f"audit log failed: {e}")
    asyncio.create_task(_notify_participants(event, rows))

    event["finalized_at"] = finalized_at
    event["status"] = "ENDED"
    return {
        "status": "success",
        "event": _event_summary(event, {"published_via": "admin" if _is_admin(user) else "organizer", "published_at": finalized_at}),
        "ranked_entries": len(rows),
    }


@router.post("/api/v1/admin/events/{event_id}/results/unpublish")
async def unpublish_event_results(event_id: str, user: dict = Depends(get_auth_user)):
    _require_enabled()
    if not _is_admin(user):
        raise HTTPException(status_code=403, detail="Only an admin can unpublish results")
    event = await events_col.find_one(_event_query(event_id))
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    results_doc = await results_col.find_one({"event_id": event_id})
    if not event.get("finalized_at") and not results_doc:
        return {"status": "not_published", "event": _event_summary(event, None)}
    now = datetime.utcnow()
    if results_doc:
        archived = {k: v for k, v in results_doc.items() if k != "_id"}
        archived.update({"original_id": results_doc["_id"], "unpublished_at": now, "unpublished_by": user.get("user_id")})
        await results_unpublished_col.insert_one(archived)
        await results_col.delete_one({"_id": results_doc["_id"]})
    await events_col.update_one(
        {"_id": event["_id"]},
        {"$unset": {"finalized_at": ""}, "$set": {"updated_at": now, "results_unpublished_at": now}},
    )
    try:
        await audit_logs_col.insert_one({
            "action": "EVENT_RESULTS_UNPUBLISHED",
            "user": user.get("email") or user.get("user_id"),
            "details": f"Unpublished results for event {event_id}",
            "event_id": event_id,
            "timestamp": now.isoformat(),
        })
    except Exception as e:
        logger.error(f"audit log failed: {e}")
    event.pop("finalized_at", None)
    return {"status": "success", "event": _event_summary(event, None)}


@router.get("/api/results/{event_id}")
async def public_event_results(event_id: str):
    """Public results page (opened from the "Results published" notification). Neutral fields only:
    rank, team/participant name, project and college. 404 while the event is unpublished."""
    _require_enabled()
    from db import opportunities_col
    event = await events_col.find_one(_event_query(event_id))
    opp = await opportunities_col.find_one({"$or": _event_query(event_id)["$or"] + [{"event_link_id": event_id}]})
    if not event and opp and opp.get("event_link_id"):  # opened with the mirrored opportunity id
        event = await events_col.find_one(_event_query(str(opp["event_link_id"])))
    if not event:
        raise HTTPException(status_code=404, detail="Results not published yet")
    eid = str(event["_id"])
    opp = opp or {}
    results_doc = await results_col.find_one({"event_id": eid})
    if not event.get("finalized_at") and not results_doc:
        raise HTTPException(status_code=404, detail="Results not published yet")
    if results_doc and results_doc.get("final_rankings"):
        rows = results_doc["final_rankings"]
    else:  # finalized through the admin path: the leaderboard rows are final
        from db import leaderboard_col
        rows = await leaderboard_col.find({"event_id": eid}).sort("rank", 1).to_list(5000)
    results = []
    for i, r in enumerate(rows):
        name = r.get("team_name") or r.get("recipient_name") or "Participant"
        results.append({
            "rank": r.get("rank") or i + 1,
            "team_id": f"entry-{i + 1}",  # opaque row key only: no team, participant or user ids leave this endpoint
            "team_name": name,
            "lead_name": r.get("recipient_name") if r.get("recipient_name") not in (None, "", name) else "",
            "organization": r.get("college") or "",
            "project_name": r.get("project_title") or r.get("project_name") or "",
            "participation_type": r.get("participation_type") or ("TEAM" if r.get("team_id") else "INDIVIDUAL"),
            "members": [],
        })
    return {
        "event": {
            "id": eid,
            "title": event.get("title") or event.get("name") or "Event results",
            "logo_url": event.get("logo_url") or opp.get("logo_url") or opp.get("image_url") or "",
            "banner_url": event.get("banner_url") or opp.get("banner_url") or "",
            "published_at": _iso(event.get("finalized_at") or (results_doc or {}).get("published_at")),
        },
        "results": results,
    }


@router.get("/api/v1/admin/results/published")
async def list_published_results(
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(get_auth_user),
):
    _require_enabled()
    if not _is_admin(user):
        raise HTTPException(status_code=403, detail="Admin access required")
    events = await events_col.find(
        {"finalized_at": {"$nin": [None]}},
        {"title": 1, "name": 1, "status": 1, "finalized_at": 1, "institution_id": 1, "end_date": 1},
    ).sort("finalized_at", -1).limit(limit).to_list(limit)
    ids = [str(e["_id"]) for e in events]
    docs = {d["event_id"]: d async for d in results_col.find({"event_id": {"$in": ids}}, {"final_rankings": 0})}
    counts = {}
    async for d in results_col.aggregate([
        {"$match": {"event_id": {"$in": ids}}},
        {"$project": {"event_id": 1, "n": {"$size": {"$ifNull": ["$final_rankings", []]}}}},
    ]):
        counts[d["event_id"]] = d["n"]
    inst_ids = list({e.get("institution_id") for e in events if e.get("institution_id")})
    inst_names = {i["institution_id"]: i.get("name") async for i in institutions_col.find({"institution_id": {"$in": inst_ids}}, {"institution_id": 1, "name": 1})}
    items = []
    for e in events:
        eid = str(e["_id"])
        s = _event_summary(e, docs.get(eid))
        s["institution_name"] = inst_names.get(e.get("institution_id")) or ""
        s["ranked_entries"] = counts.get(eid)
        items.append(s)
    return {"items": items}
