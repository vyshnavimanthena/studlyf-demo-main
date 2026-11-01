"""
"My contribution" on projects (Phase 3 P3-P1): the builder describes their role/summary/team
size/skills per project; teammates on the same STUDLYF team project confirm it (once each, revocable).

Flag PROJECT_CONTRIBUTIONS (default off): every route here returns 404 while it is off.
Rules and storage: services/project_contribution_service.py.
"""
import logging
import uuid

from fastapi import APIRouter, Body, Depends, HTTPException

from auth_institution import get_auth_user
from db import db, users_col
from notification_service import notification_service
from routes.talent_routes import _plain, is_builder_role
from services import project_contribution_service as pc
from services import talent_service as ts

logger = logging.getLogger("project_contribution_routes")

router = APIRouter(tags=["Project Contributions"])

MAX_NOTIFIED_TEAMMATES = 20


async def require_enabled():
    if not pc.enabled():
        raise HTTPException(status_code=404, detail="Not found")


@router.on_event("startup")
async def _contribution_indexes():
    if pc.enabled():
        await pc.ensure_indexes()


def _user_id(user: dict) -> str:
    user_id = str(user.get("user_id", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return user_id


async def _names(user_ids) -> dict:
    """user_id -> display name (profile first/last name, else users.full_name)."""
    user_ids = [u for u in set(user_ids) if u]
    names = {}
    if not user_ids:
        return names
    async for u in users_col.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "full_name": 1}):
        names[u["user_id"]] = (u.get("full_name") or "").strip()
    async for p in db["learner_profiles"].find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "firstName": 1, "lastName": 1}):
        full = f"{p.get('firstName') or ''} {p.get('lastName') or ''}".strip()
        if full:
            names[p["user_id"]] = full
    return {uid: names.get(uid) or "A teammate" for uid in user_ids}


async def _my_projects(user_id: str) -> list:
    """Projects this user may describe: profile projects (with a title), owned and joined team projects.
    -> [{project_ref, title, source, project_id, is_owner}]"""
    profile = await db["learner_profiles"].find_one({"user_id": user_id}, {"_id": 0, "projects": 1}) or {}
    projects, seen = [], set()
    for p in profile.get("projects") or []:
        title = (p if isinstance(p, str) else (p.get("title") if isinstance(p, dict) else None)) or ""
        ref = pc.profile_ref(title)
        if ref and ref not in seen:
            seen.add(ref)
            projects.append({"project_ref": ref, "title": title.strip(), "source": "profile", "project_id": None, "is_owner": True})
    ids = await pc.joined_sdl_project_ids(user_id)
    teams = await pc.sdl_teams(ids)
    for pid, team in teams.items():
        if user_id in team["members"]:
            projects.append({"project_ref": pc.sdl_ref(pid), "title": team["title"] or "Team project", "source": "sdl",
                             "project_id": pid, "is_owner": team["owner"] == user_id, "_team": team})
    return projects


def _own_shape(doc: dict, team, names: dict) -> dict:
    confirmers = sorted(set(doc.get("confirmed_user_ids") or []) & (team["members"] if team else set()) - {doc.get("user_id")})
    return {
        "contribution_id": doc.get("contribution_id"),
        **pc.public_shape(doc, team),
        "confirmers": [{"user_id": uid, "name": names.get(uid, "A teammate")} for uid in confirmers],
        "updated_at": doc.get("updated_at"),
    }


@router.get("/api/v1/me/contributions", dependencies=[Depends(require_enabled)])
async def my_contributions(user: dict = Depends(get_auth_user)):
    """My projects with my contribution on each, plus teammates' contributions I can confirm."""
    user_id = _user_id(user)
    projects = await _my_projects(user_id)
    refs = [p["project_ref"] for p in projects]
    mine = {d["project_ref"]: d async for d in pc.contributions_col.find({"user_id": user_id, "project_ref": {"$in": refs}}, {"_id": 0})}

    team_refs = {p["project_ref"]: p for p in projects if p["source"] == "sdl"}
    others = [d async for d in pc.contributions_col.find(
        {"project_ref": {"$in": list(team_refs)}, "user_id": {"$ne": user_id}}, {"_id": 0}).limit(500)]
    others = [d for d in others if pc.is_valid(d, team_refs[d["project_ref"]]["_team"])]

    name_ids = {uid for d in list(mine.values()) + others for uid in (d.get("confirmed_user_ids") or [])}
    name_ids |= {d["user_id"] for d in others}
    names = await _names(name_ids)

    items = []
    for p in projects:
        team = p.get("_team")
        doc = mine.get(p["project_ref"])
        items.append({
            "project_ref": p["project_ref"],
            "title": p["title"],
            "source": p["source"],
            "is_owner": p["is_owner"],
            "teammates": len(team["members"] - {user_id}) if team else 0,
            "contribution": _own_shape(doc, team, names) if doc else None,
        })
    to_confirm = []
    for d in others:
        p = team_refs[d["project_ref"]]
        to_confirm.append({
            "contribution_id": d["contribution_id"],
            "project_ref": d["project_ref"],
            "project_title": p["title"],
            "author": {"user_id": d["user_id"], "name": names.get(d["user_id"], "A teammate")},
            **pc.public_shape(d, p["_team"]),
            "confirmed_by_me": user_id in (d.get("confirmed_user_ids") or []),
            "updated_at": d.get("updated_at"),
        })
    to_confirm.sort(key=lambda c: (c["confirmed_by_me"], c["project_title"].lower()))
    return {"projects": items, "to_confirm": to_confirm}


async def _my_project(user_id: str, project_ref: str) -> dict:
    for p in await _my_projects(user_id):
        if p["project_ref"] == project_ref:
            return p
    raise HTTPException(status_code=404, detail="Project not found")


async def _notify_teammates(user_id: str, project: dict, contribution_id: str):
    team = project.get("_team")
    if not team:
        return
    teammates = sorted(team["members"] - {user_id})[:MAX_NOTIFIED_TEAMMATES]
    if not teammates:
        return
    author = _plain((await _names([user_id])).get(user_id, "")) or "A teammate"
    title = _plain(project["title"]) or "your team project"
    for uid in teammates:
        try:
            await notification_service.create_notification(
                uid, "project_contribution", "Confirm a teammate's contribution",
                f"{author} described their contribution to {title}. Confirm it under Profile > Projects.",
                metadata={"contribution_id": contribution_id},
            )
        except Exception as e:
            logger.warning("contribution notification failed: %s", e)


@router.put("/api/v1/me/contributions/{project_ref}", dependencies=[Depends(require_enabled)])
async def set_my_contribution(project_ref: str, data: dict = Body(...), user: dict = Depends(get_auth_user)):
    """Create or replace my contribution on one of my projects. Changing it clears teammates' confirmations."""
    user_id = _user_id(user)
    try:
        fields = pc.validate(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    project = await _my_project(user_id, project_ref)
    await pc.ensure_indexes()

    now = ts.now_iso()
    existing = await pc.contributions_col.find_one({"user_id": user_id, "project_ref": project_ref})
    if existing:
        update = {**fields, "updated_at": now}
        if any(existing.get(k) != fields[k] for k in pc.CONTENT_FIELDS):
            update["confirmed_user_ids"] = []
        await pc.contributions_col.update_one({"_id": existing["_id"]}, {"$set": update})
        contribution_id = existing["contribution_id"]
    else:
        contribution_id = str(uuid.uuid4())
        result = await pc.contributions_col.update_one(
            {"user_id": user_id, "project_ref": project_ref},
            {"$set": {**fields, "updated_at": now},
             "$setOnInsert": {"contribution_id": contribution_id, "user_id": user_id, "project_ref": project_ref,
                              "confirmed_user_ids": [], "created_at": now}},
            upsert=True,
        )
        if result.upserted_id is not None:
            await _notify_teammates(user_id, project, contribution_id)
        else:
            # A concurrent request created it first
            contribution_id = (await pc.contributions_col.find_one({"user_id": user_id, "project_ref": project_ref}))["contribution_id"]

    doc = await pc.contributions_col.find_one({"contribution_id": contribution_id}, {"_id": 0})
    team = project.get("_team")
    names = await _names(doc.get("confirmed_user_ids") or [])
    return _own_shape(doc, team, names)


@router.delete("/api/v1/me/contributions/{project_ref}", dependencies=[Depends(require_enabled)])
async def delete_my_contribution(project_ref: str, user: dict = Depends(get_auth_user)):
    user_id = _user_id(user)
    result = await pc.contributions_col.delete_one({"user_id": user_id, "project_ref": project_ref})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return {"deleted": True}


async def _confirmable(contribution_id: str, user_id: str) -> tuple:
    """The contribution and its team, if user_id is a teammate (not the author) on that team project."""
    doc = await pc.contributions_col.find_one({"contribution_id": contribution_id}, {"_id": 0})
    pid = pc.sdl_id((doc or {}).get("project_ref"))
    team = (await pc.sdl_teams([pid])).get(pid) if pid else None
    # Same 404 for "no such contribution" and "not your team" so ids can't be probed
    if not doc or not team or user_id not in team["members"] or not pc.is_valid(doc, team):
        raise HTTPException(status_code=404, detail="Contribution not found")
    if doc["user_id"] == user_id:
        raise HTTPException(status_code=403, detail="You can't confirm your own contribution")
    return doc, team


@router.post("/api/v1/me/contributions/{contribution_id}/confirm", dependencies=[Depends(require_enabled)])
async def confirm_contribution(contribution_id: str, user: dict = Depends(get_auth_user)):
    """Teammate confirms. Idempotent: a teammate counts once."""
    user_id = _user_id(user)
    await _confirmable(contribution_id, user_id)
    await pc.contributions_col.update_one({"contribution_id": contribution_id}, {"$addToSet": {"confirmed_user_ids": user_id}})
    doc, team = await _confirmable(contribution_id, user_id)
    return {"contribution_id": contribution_id, "confirmed_by": pc.confirmed_by(doc, team), "confirmed_by_me": True}


@router.delete("/api/v1/me/contributions/{contribution_id}/confirm", dependencies=[Depends(require_enabled)])
async def revoke_confirmation(contribution_id: str, user: dict = Depends(get_auth_user)):
    """Teammate withdraws their confirmation. Idempotent."""
    user_id = _user_id(user)
    await _confirmable(contribution_id, user_id)
    await pc.contributions_col.update_one({"contribution_id": contribution_id}, {"$pull": {"confirmed_user_ids": user_id}})
    doc, team = await _confirmable(contribution_id, user_id)
    return {"contribution_id": contribution_id, "confirmed_by": pc.confirmed_by(doc, team), "confirmed_by_me": False}


@router.get("/api/v1/contributions/users/{user_id}", dependencies=[Depends(require_enabled)])
async def public_contributions(user_id: str):
    """Contributions shown on a public profile: builders only, hidden when the profile is not visible.
    Only projects that still exist on the profile (or team projects the user is still on)."""
    account = await users_col.find_one({"user_id": user_id}, {"_id": 0, "role": 1})
    profile = await db["learner_profiles"].find_one({"user_id": user_id}, {"_id": 0, "profileVisible": 1})
    if not account or not is_builder_role(account.get("role")) or (profile or {}).get("profileVisible") is False:
        return {"contributions": []}
    projects = {p["project_ref"]: p for p in await _my_projects(user_id)}
    out = []
    async for d in pc.contributions_col.find({"user_id": user_id, "project_ref": {"$in": list(projects)}}, {"_id": 0}).sort("updated_at", -1):
        p = projects[d["project_ref"]]
        out.append({"project_ref": d["project_ref"], "project_title": p["title"], "source": p["source"],
                    **pc.public_shape(d, p.get("_team"))})
    return {"contributions": out}
