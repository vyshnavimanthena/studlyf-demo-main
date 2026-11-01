"""
Project contributions ("My contribution", Phase 3 P3-P1) - shared by the builder routes,
the Talent API and profile completeness.

Gated by env flag PROJECT_CONTRIBUTIONS (default off). Off: nothing reads or writes the
collection and every existing response is unchanged.

Storage: its own collection `project_contributions`, one doc per (user_id, project_ref), so the
existing project shapes (learner_profiles.projects, sdl_projects) are never touched.
  project_ref  "profile-<sha1(title)[:16]>" for a profile project (keyed by its normalized title),
               "sdl-<project id>" for a STUDLYF team project (sdl_projects).
  role, summary, team_size, skills
  confirmed_user_ids  teammates who confirmed (each once, revocable)

Team of an SDL project = its owner + its active sdl_project_members whose join request the owner
accepted through the authenticated accept route (member doc `accepted_by` == project owner_id).
Members added before that route was authenticated (no `accepted_by`) or accepted by anyone else
(e.g. an admin) are not counted: they can't confirm, and their contributions on that project don't
count. Only teammates (never the author) can confirm, and a confirmation counts only while that
teammate is still on the team.
Editing the role/summary/team size/skills clears the confirmations: teammates confirmed the old text.
"""
import hashlib
import logging
import os
import re
from typing import Optional

from bson import ObjectId

from db import db, sdl_projects_col, sdl_members_col

logger = logging.getLogger("project_contributions")

contributions_col = db["project_contributions"]

MAX_ROLE = 100
MAX_SUMMARY = 1000
MAX_SKILLS = 15
MAX_SKILL = 50
MAX_TEAM_SIZE = 100
MAX_SDL_PROJECTS = 50
CONTENT_FIELDS = ("role", "summary", "team_size", "skills")


def enabled() -> bool:
    return (os.getenv("PROJECT_CONTRIBUTIONS") or "").strip().lower() in {"1", "true", "yes", "on"}


_indexes_ready = False


async def ensure_indexes():
    """Create the contribution indexes once per process (never fatal)."""
    global _indexes_ready
    if _indexes_ready:
        return
    _indexes_ready = True
    specs = [
        ([("contribution_id", 1)], {"unique": True, "name": "uniq_contribution_id"}),
        ([("user_id", 1), ("project_ref", 1)], {"unique": True, "name": "uniq_user_project_ref"}),
        ([("project_ref", 1)], {"name": "project_ref"}),
    ]
    for keys, opts in specs:
        try:
            await contributions_col.create_index(keys, **opts)
        except Exception as e:
            logger.warning("Could not create index %s: %s", opts.get("name"), e)


def profile_ref(title) -> Optional[str]:
    norm = re.sub(r"\s+", " ", str(title or "").strip().lower())
    if not norm:
        return None
    return "profile-" + hashlib.sha1(norm.encode("utf-8")).hexdigest()[:16]


def sdl_ref(project_id) -> str:
    return f"sdl-{project_id}"


def sdl_id(project_ref: str) -> Optional[str]:
    return project_ref[4:] if isinstance(project_ref, str) and project_ref.startswith("sdl-") else None


def _clean_text(value, max_len: int, field: str) -> Optional[str]:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"{field} must be text")
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    value = re.sub(r"[ \t]+", " ", value).strip()
    if len(value) > max_len:
        raise ValueError(f"{field} too long (max {max_len})")
    return value or None


def validate(data: dict) -> dict:
    """{role, summary, team_size, skills} from a request body. Raises ValueError."""
    if not isinstance(data, dict):
        raise ValueError("body must be an object")
    role = _clean_text(data.get("role"), MAX_ROLE, "role")
    if role:
        role = role.replace("\n", " ")
    summary = _clean_text(data.get("summary"), MAX_SUMMARY, "summary")
    team_size = data.get("team_size")
    if team_size in ("", None):
        team_size = None
    elif isinstance(team_size, bool) or not isinstance(team_size, int) or not 1 <= team_size <= MAX_TEAM_SIZE:
        raise ValueError(f"team_size must be an integer 1-{MAX_TEAM_SIZE}")
    raw_skills = data.get("skills") or []
    if not isinstance(raw_skills, list):
        raise ValueError("skills must be a list")
    skills = []
    for s in raw_skills:
        s = _clean_text(s, MAX_SKILL, "skill")
        if s and s.lower() not in {x.lower() for x in skills}:
            skills.append(s.replace("\n", " "))
    if len(skills) > MAX_SKILLS:
        raise ValueError(f"at most {MAX_SKILLS} skills")
    if not (role or summary or skills or team_size):
        raise ValueError("add a role, summary, team size or skill")
    return {"role": role, "summary": summary, "team_size": team_size, "skills": skills}


def _oid(project_id):
    try:
        return ObjectId(project_id)
    except Exception:
        return project_id


async def sdl_teams(project_ids) -> dict:
    """project id -> {"owner": user_id, "members": set(user_ids incl. owner), "title": str}."""
    project_ids = [p for p in {str(p) for p in project_ids if p}]
    teams = {}
    if not project_ids:
        return teams
    async for doc in sdl_projects_col.find({"_id": {"$in": [_oid(p) for p in project_ids]}},
                                           {"owner_id": 1, "title": 1}):
        pid = str(doc["_id"])
        teams[pid] = {"owner": doc.get("owner_id"), "title": doc.get("title") or "",
                      "members": {doc.get("owner_id")} - {None}}
    async for m in sdl_members_col.find({"project_id": {"$in": list(teams)}, "status": "active"},
                                        {"project_id": 1, "user_id": 1, "accepted_by": 1}):
        team = teams[m["project_id"]]
        if m.get("user_id") and team["owner"] and str(m.get("accepted_by") or "") == str(team["owner"]):
            team["members"].add(m["user_id"])
    return teams


async def joined_sdl_project_ids(user_id: str) -> list:
    """SDL projects the user is an active, owner-accepted member of (owned ones included).
    Candidates only: sdl_teams() checks that accepted_by is the project's owner."""
    ids = [m["project_id"] async for m in sdl_members_col.find(
        {"user_id": user_id, "status": "active", "accepted_by": {"$nin": [None, ""]}},
        {"project_id": 1}).limit(200) if m.get("project_id")]
    ids += [str(d["_id"]) async for d in sdl_projects_col.find({"owner_id": user_id}, {"_id": 1}).limit(200)]
    return list(dict.fromkeys(ids))


def confirmed_by(doc: dict, team: Optional[dict]) -> int:
    """Distinct confirmers still on the team, never the author."""
    if not team:
        return 0
    return len(set(doc.get("confirmed_user_ids") or []) & team["members"] - {doc.get("user_id")})


def is_valid(doc: dict, team: Optional[dict]) -> bool:
    """A team-project contribution only counts while its author is still on that team."""
    if sdl_id(doc.get("project_ref")) is None:
        return True
    return bool(team) and doc.get("user_id") in team["members"]


def public_shape(doc: dict, team: Optional[dict]) -> dict:
    """Contract v2.6 Contribution."""
    return {
        "role": doc.get("role"),
        "summary": doc.get("summary"),
        "team_size": doc.get("team_size"),
        "skills": list(doc.get("skills") or []),
        "confirmed_by": confirmed_by(doc, team),
    }


async def for_users(user_ids: list) -> tuple:
    """-> ({user_id: {project_ref: doc}}, {sdl project id: team}) for valid contributions only."""
    by_user, sdl_ids = {}, set()
    if not user_ids:
        return by_user, {}
    docs = [d async for d in contributions_col.find({"user_id": {"$in": user_ids}}, {"_id": 0}).limit(5000)]
    for d in docs:
        pid = sdl_id(d.get("project_ref"))
        if pid:
            sdl_ids.add(pid)
    teams = await sdl_teams(sdl_ids)
    for d in docs:
        team = teams.get(sdl_id(d.get("project_ref")) or "")
        if is_valid(d, team):
            by_user.setdefault(d["user_id"], {})[d["project_ref"]] = d
    return by_user, teams


async def joined_projects(user_id: str, contributions: dict, owned_ids: set, teams: dict) -> list:
    """SDL docs of team projects the user joined (not owns) and wrote a contribution for."""
    ids = [sdl_id(ref) for ref in contributions if sdl_id(ref)]
    ids = [pid for pid in ids if pid not in owned_ids and pid in teams and teams[pid]["owner"] != user_id]
    if not ids:
        return []
    return [d async for d in sdl_projects_col.find({"_id": {"$in": [_oid(p) for p in ids]}}).limit(MAX_SDL_PROJECTS)]


def project_ref_for(project: dict) -> Optional[str]:
    """Ref of a Talent-API-shaped project ({id, title, source})."""
    if project.get("source") == "sdl":
        return sdl_ref(project.get("id"))
    if project.get("source") == "profile":
        return profile_ref(project.get("title"))
    return None


async def completeness_contributions(user_id: str, profile: dict) -> Optional[list]:
    """None when the feature is off; else the user's contributions on projects they still have."""
    if not enabled():
        return None
    by_user, _ = await for_users([user_id])
    titles = [(p if isinstance(p, str) else (p.get("title") if isinstance(p, dict) else None)) for p in profile.get("projects") or []]
    profile_refs = {profile_ref(t) for t in titles} - {None}
    return [d for ref, d in by_user.get(user_id, {}).items() if sdl_id(ref) or ref in profile_refs]
