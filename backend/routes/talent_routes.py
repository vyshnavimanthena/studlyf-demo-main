"""
Talent API - read-only builder discovery + invitations for the STUDLYF HR platform.

Service-to-service only: every route requires the `X-Talent-Key` header to match
the `TALENT_API_KEY` env var. With the env var unset, every route returns 503, so
deploying this file changes nothing until it is configured.

Only builders who opted in (`learner_profiles.hrDiscoverable == True`), are not
"Not Looking" (`searchStatus != "closed"`) and have a users row whose role is not in
NON_BUILDER_ROLES are ever returned. Email/phone are never included.
"""
import functools
import hmac
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, Header, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from db import db, users_col, sdl_projects_col, event_certificates_col
from notification_service import notification_service
from services import talent_service as ts
from services import project_contribution_service as pc

logger = logging.getLogger("talent_routes")

router = APIRouter(prefix="/api/v1/talent", tags=["Talent API"])

hr_invitations_col = ts.hr_invitations_col
hr_messages_col = ts.hr_messages_col

MAX_LIMIT = 50
MAX_TEXT = {"hr_org": 200, "hr_name": 200, "role_title": 200, "message": 5000, "external_ref": 200}
MAX_NOTIFICATION_TEXT = 100
MAX_AVATAR_URL = 2048
MAX_MESSAGE_BODY = 2000
MAX_BATCH_IDS = 200

# Only what the Builder shape needs; profilePhoto (often an inline data: URI), resume etc. are never loaded
BUILDER_PROJECTION = {
    "_id": 0, "user_id": 1, "firstName": 1, "lastName": 1, "careerGoal": 1, "domain": 1, "bio": 1,
    "skills": 1, "location": 1, "searchStatus": 1, "education": 1, "projects": 1,
    "linkedin": 1, "github": 1, "portfolio": 1, "updated_at": 1,
    "experienceList": 1, "experience": 1, "openToOpportunities": 1, "availability": 1, "preferredRole": 1,
    "skillEvidence": 1,
}
USER_PROJECTION = {"_id": 0, "user_id": 1, "full_name": 1, "college_name": 1, "graduation_year": 1, "role": 1}
# Staff/organisation accounts that must never be listed as builders, even if opted in.
# Denylist on purpose: builder roles vary (student, learner, participant, fresher, professional, unset).
# Compared trimmed and case-insensitive.
NON_BUILDER_ROLES = frozenset({
    "institution", "admin", "super_admin", "judge", "mentor", "partner", "hiring_partner", "hr", "recruiter",
})
NON_BUILDER_ROLE_RE = re.compile(r"^\s*(" + "|".join(sorted(NON_BUILDER_ROLES)) + r")\s*$", re.IGNORECASE)


@router.on_event("startup")
async def _talent_indexes():
    """Create the invitation/message indexes at startup (never fatal; see ts.ensure_indexes)."""
    try:
        await ts.ensure_indexes()
    except Exception:
        logger.exception("Talent API index setup failed")


def _safe(handler):
    """Never let an unexpected error reach the app-wide handler, which echoes exception text."""
    @functools.wraps(handler)
    async def wrapper(*args, **kwargs):
        try:
            return await handler(*args, **kwargs)
        except HTTPException:
            raise
        except Exception:
            logger.exception("Talent API error in %s", handler.__name__)
            raise HTTPException(status_code=500, detail="internal error")
    return wrapper


async def require_talent_key(x_talent_key: Optional[str] = Header(None)):
    expected = (os.getenv("TALENT_API_KEY") or "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="Talent API is not configured")
    if not x_talent_key or not hmac.compare_digest(x_talent_key.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid talent API key")


def _eligibility_filter() -> dict:
    return {"hrDiscoverable": True, "searchStatus": {"$ne": "closed"}}


def is_builder_role(role) -> bool:
    return role is None or str(role).strip().lower() not in NON_BUILDER_ROLES


def _is_builder(user: Optional[dict]) -> bool:
    """Requires an existing users row (deleted accounts stay hidden) whose role is not a staff/org role."""
    return bool(user) and is_builder_role(user.get("role"))


async def _eligible_user_ids() -> list:
    """Opted-in profiles whose users row exists with a builder role."""
    opted_in = await db["learner_profiles"].distinct("user_id", _eligibility_filter())
    if not opted_in:
        return []
    return await users_col.distinct("user_id", {"user_id": {"$in": opted_in}, "role": {"$not": NON_BUILDER_ROLE_RE}})


def _plain(text: str, max_len: int = MAX_NOTIFICATION_TEXT) -> str:
    """Single-line plain text: no markup characters or control chars, length-capped."""
    text = re.sub(r"[<>&\"'`]", "", text or "")
    text = re.sub(r"[\x00-\x1f\x7f]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_len].rstrip()


def _contains(text: str):
    return {"$regex": re.escape(text), "$options": "i"}


def _iso(value):
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.isoformat()
    return str(value)


def _str_or_none(value):
    if value is None:
        return None
    value = str(value).strip()
    return value or None


def _skill_names(skills) -> list:
    names = []
    for s in skills or []:
        name = s.get("name") if isinstance(s, dict) else s
        name = _str_or_none(name)
        if name and name.lower() not in {n.lower() for n in names}:
            names.append(name)
    return names


def _str_list(values) -> list:
    if not isinstance(values, list):
        return []
    return [v.strip() for v in values if isinstance(v, str) and v.strip()]


def _profile_projects(profile: dict) -> list:
    projects = []
    for i, p in enumerate(profile.get("projects") or []):
        if isinstance(p, str):
            p = {"title": p}
        if not isinstance(p, dict):
            continue
        title = _str_or_none(p.get("title"))
        description = _str_or_none(p.get("description"))
        if not title and not description:
            continue
        link = _str_or_none(p.get("link"))
        is_repo = bool(link) and "github.com" in link.lower()
        projects.append({
            "id": f"profile-{i}",
            "title": title or "",
            "description": description or "",
            "tech": _str_list(p.get("tags")),
            "repo_url": link if is_repo else None,
            "demo_url": link if link and not is_repo else None,
            "source": "profile",
        })
    return projects


def _sdl_project(doc: dict) -> dict:
    return {
        "id": str(doc.get("_id")),
        "title": doc.get("title") or "",
        "description": doc.get("overview") or doc.get("problem_statement") or "",
        "tech": _str_list((doc.get("skills_required") or []) + (doc.get("tags") or [])),
        "repo_url": _str_or_none(doc.get("github_link")),
        "demo_url": None,
        "source": "sdl",
    }


def _achievement(doc: dict) -> dict:
    return {
        "certificate_id": doc.get("certificate_id"),
        "event_title": doc.get("event_title"),
        "organization_name": doc.get("organization_name"),
        "achievement_key": doc.get("achievement_key"),
        "rank": doc.get("rank"),
        "issued_date": _iso(doc.get("issued_date")),
        "verification_url": doc.get("verification_url"),
    }


async def _avatar_urls(user_ids: list) -> dict:
    """Hosted profile photos only; inline data: URIs can be megabytes and are never loaded."""
    urls = {}
    if user_ids:
        cursor = db["learner_profiles"].find(
            {"user_id": {"$in": user_ids}, "profilePhoto": {"$regex": "^https?://", "$options": "i"}},
            {"_id": 0, "user_id": 1, "profilePhoto": 1},
        )
        async for doc in cursor:
            photo = doc.get("profilePhoto")
            if isinstance(photo, str) and len(photo) <= MAX_AVATAR_URL:
                urls[doc.get("user_id")] = photo
    return urls


def _builder(profile: dict, user: dict, avatar_url: Optional[str], sdl_docs: list, cert_docs: list,
             evaluations: list, evaluated_skills: dict) -> dict:
    name = f"{profile.get('firstName') or ''} {profile.get('lastName') or ''}".strip() or (user.get("full_name") or "").strip()
    edu = profile.get("education") if isinstance(profile.get("education"), dict) else {}
    institution = _str_or_none(edu.get("institution")) or _str_or_none(user.get("college_name"))
    degree = _str_or_none(edu.get("degree"))
    end_year = _str_or_none(edu.get("endYear")) or _str_or_none(user.get("graduation_year"))
    education = {"institution": institution, "degree": degree, "end_year": end_year} if (institution or degree or end_year) else None
    skills = _skill_names(profile.get("skills"))
    projects = _profile_projects(profile) + [_sdl_project(d) for d in sdl_docs]
    experience = ts.experience_entries(profile)
    links = ts.explicit_links(profile, ts.linkable_items(projects, experience))

    return {
        "user_id": profile.get("user_id"),
        "name": name,
        "headline": profile.get("careerGoal") or profile.get("domain") or "",
        "bio": profile.get("bio") or "",
        "skills": skills,
        "location": profile.get("location") or "",
        "avatar_url": avatar_url,
        "search_status": profile.get("searchStatus") or "active",
        "education": education,
        "links": {
            "linkedin": _str_or_none(profile.get("linkedin")),
            "github": _str_or_none(profile.get("github")),
            "portfolio": _str_or_none(profile.get("portfolio")),
        },
        "projects": projects,
        "achievements": [_achievement(d) for d in cert_docs],
        "updated_at": _iso(profile.get("updated_at")),
        # Contract v2 (all additive)
        "skills_detailed": ts.skills_detailed(skills, links, evaluated_skills),
        "evaluations": evaluations,
        "experience": [{k: e[k] for k in ("title", "organization", "type", "start", "end", "description")} for e in experience],
        "preferred_role": _str_or_none(profile.get("preferredRole")),
        "availability": profile.get("availability") if profile.get("availability") in ts.AVAILABILITY_VALUES else None,
        "open_to_opportunities": ts.open_to_opportunities(profile),
        "graduation_year": end_year,
    }


async def _build_many(rows: list) -> list:
    """rows: [(profile, user)] -> Builder dicts, batching the photo/project/certificate lookups."""
    user_ids = [p.get("user_id") for p, _ in rows]
    avatars = await _avatar_urls(user_ids)
    sdl_by_user, certs_by_user = {}, {}
    if user_ids:
        async for doc in sdl_projects_col.find({"owner_id": {"$in": user_ids}}).sort("created_at", -1):
            sdl_by_user.setdefault(doc.get("owner_id"), []).append(doc)
        async for doc in event_certificates_col.find({"user_id": {"$in": user_ids}, "status": {"$ne": "revoked"}}).sort("issued_date", -1):
            certs_by_user.setdefault(doc.get("user_id"), []).append(doc)
    certs_by_user = {uid: docs[:50] for uid, docs in certs_by_user.items()}
    evaluations, evaluated = await ts.published_evaluations(user_ids, certs_by_user)
    contributions, teams, sdl_cap = {}, {}, 50
    if pc.enabled():
        sdl_cap = 50 + pc.MAX_SDL_PROJECTS
        contributions, teams = await pc.for_users(user_ids)
        for uid in user_ids:
            owned = {str(d.get("_id")) for d in sdl_by_user.get(uid, [])[:50]}
            joined = await pc.joined_projects(uid, contributions.get(uid, {}), owned, teams)
            sdl_by_user[uid] = sdl_by_user.get(uid, [])[:50] + joined
    builders = [
        _builder(p, u, avatars.get(p.get("user_id")), sdl_by_user.get(p.get("user_id"), [])[:sdl_cap],
                 certs_by_user.get(p.get("user_id"), []), evaluations.get(p.get("user_id"), [])[:50],
                 evaluated.get(p.get("user_id"), {}))
        for p, u in rows
    ]
    if pc.enabled():
        # Contract v2.6: every project carries `contribution` (null when none); absent while the flag is off
        for b in builders:
            mine = contributions.get(b["user_id"], {})
            for project in b["projects"]:
                ref = pc.project_ref_for(project)
                doc = mine.get(ref) if ref else None
                project["contribution"] = pc.public_shape(doc, teams.get(pc.sdl_id(ref) or "")) if doc else None
    return builders


async def _eligible_profile(user_id: str):
    """Returns (profile, user) for an eligible builder, or None."""
    profile = await db["learner_profiles"].find_one({"user_id": user_id, **_eligibility_filter()}, BUILDER_PROJECTION)
    if not profile:
        return None
    user = await users_col.find_one({"user_id": user_id}, USER_PROJECTION)
    if not _is_builder(user):
        return None
    return profile, user


@router.get("/builders", dependencies=[Depends(require_talent_key)])
@_safe
async def list_builders(
    q: Optional[str] = Query(None),
    skills: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1),
    limit: int = Query(20),
    after: Optional[str] = Query(None),
):
    """Builders who opted in to recruiter discovery, ordered by user_id.

    Offset paging via page/limit, or keyset paging via after=<last user_id> (page is then
    ignored and the response adds next_after, null on the last page).
    """
    page = max(1, page)
    limit = max(1, min(limit, MAX_LIMIT))

    eligible = await _eligible_user_ids()
    and_clauses = [{"user_id": {"$in": eligible}}]
    if after is not None:
        and_clauses.append({"user_id": {"$gt": after}})
    for skill in [s.strip() for s in (skills or "").split(",") if s.strip()]:
        and_clauses.append({"$or": [{"skills": _contains(skill)}, {"skills.name": _contains(skill)}]})
    if location and location.strip():
        and_clauses.append({"location": _contains(location.strip())})
    if q and q.strip():
        rx = _contains(q.strip())
        name_matches = await users_col.distinct("user_id", {"user_id": {"$in": eligible}, "full_name": rx})
        and_clauses.append({"$or": [
            {"firstName": rx}, {"lastName": rx}, {"user_id": {"$in": name_matches}},
            {"bio": rx}, {"careerGoal": rx}, {"domain": rx},
            {"skills": rx}, {"skills.name": rx}, {"projects.title": rx},
        ]})
    query = {**_eligibility_filter(), "$and": and_clauses}

    total = await db["learner_profiles"].count_documents(query)
    cursor = db["learner_profiles"].find(query, BUILDER_PROJECTION).sort("user_id", 1)
    if after is None:
        cursor = cursor.skip((page - 1) * limit)
    profiles = await cursor.limit(limit).to_list(length=limit)
    users = {}
    if profiles:
        async for u in users_col.find({"user_id": {"$in": [p.get("user_id") for p in profiles]}}, USER_PROJECTION):
            users[u.get("user_id")] = u
    rows = [(p, users.get(p.get("user_id")) or {}) for p in profiles]

    response = {"results": await _build_many(rows), "total": total, "page": page, "limit": limit}
    if after is not None:
        response["next_after"] = profiles[-1].get("user_id") if len(profiles) == limit else None
    return response


@router.get("/builders/{user_id}", dependencies=[Depends(require_talent_key)])
@_safe
async def get_builder(user_id: str):
    found = await _eligible_profile(user_id)
    if not found:
        raise HTTPException(status_code=404, detail="Builder not found")
    return (await _build_many([found]))[0]


@router.post("/invitations", dependencies=[Depends(require_talent_key)])
@_safe
async def create_invitation(data: dict = Body(...)):
    """HR invites an eligible builder. Creates an in-app notification for the builder."""
    user_id = str(data.get("user_id") or "").strip()
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")
    fields = {}
    for key, max_len in MAX_TEXT.items():
        value = data.get(key)
        value = "" if value is None else str(value).strip()
        if len(value) > max_len:
            raise HTTPException(status_code=400, detail=f"{key} too long (max {max_len})")
        fields[key] = value
    # HR may not know its company name yet; never reject an invite for it
    fields["hr_org"] = fields["hr_org"] or fields["hr_name"] or "A recruiter on STUDLYF"

    if not await _eligible_profile(user_id):
        raise HTTPException(status_code=404, detail="Builder not found")

    await ts.ensure_indexes()

    # Idempotent retries from HR: same builder + same external_ref returns the existing invitation
    async def existing_response():
        existing = await hr_invitations_col.find_one({"user_id": user_id, "external_ref": fields["external_ref"]})
        if existing:
            return {"invitation_id": existing["invitation_id"], "status": ts.invitation_status(existing),
                    "expires_at": ts.invitation_expires_at(existing)}
        return None

    if fields["external_ref"]:
        existing = await existing_response()
        if existing:
            return existing

    invitation_id = str(uuid.uuid4())
    created = datetime.now(timezone.utc)
    expires_at = (created + ts.INVITATION_TTL).isoformat()
    try:
        await hr_invitations_col.insert_one({
            "invitation_id": invitation_id,
            "user_id": user_id,
            **fields,
            "status": "sent",
            "created_at": created.isoformat(),
            "expires_at": expires_at,
            "responded_at": None,
        })
    except DuplicateKeyError:
        # Concurrent retry with the same external_ref won the race
        existing = await existing_response()
        if existing:
            return existing
        raise

    try:
        # The org is HR-supplied and unverified: keep it out of the title, and plain/capped in the body
        # (the notification email template interpolates title/message as HTML)
        org = _plain(fields["hr_org"]) or "A recruiter on STUDLYF"
        role = _plain(fields["role_title"])
        about = f" about the {role} role" if role else ""
        await notification_service.create_notification(
            user_id,
            "hr_invitation",
            "New recruiter invitation",
            f"{org} invited you to connect{about}. View it under Opportunities > Invitations.",
            metadata={"invitation_id": invitation_id},
        )
    except Exception as e:
        print(f"[TALENT] Failed to create hr_invitation notification: {e}")

    return {"invitation_id": invitation_id, "status": "sent", "expires_at": expires_at}


async def _find_invitation(invitation_id: str) -> dict:
    inv = await hr_invitations_col.find_one({"invitation_id": invitation_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return inv


async def _notify_builder(inv: dict, notification_type: str, title: str, message: str):
    try:
        await notification_service.create_notification(
            inv["user_id"], notification_type, title, message,
            metadata={"invitation_id": inv["invitation_id"]},
        )
    except Exception as e:
        print(f"[TALENT] Failed to create {notification_type} notification: {e}")


def _shares_contact(inv: dict) -> bool:
    return ts.invitation_status(inv) == "accepted" and inv.get("share_contact") is True


def _invitation_status_body(inv: dict, email: Optional[str]) -> dict:
    return {
        "invitation_id": inv["invitation_id"],
        "status": ts.invitation_status(inv),
        "responded_at": inv.get("responded_at"),
        "expires_at": ts.invitation_expires_at(inv),
        "contact": {"email": email} if email and _shares_contact(inv) else None,
    }


@router.get("/invitations", dependencies=[Depends(require_talent_key)])
@_safe
async def get_invitations_batch(ids: Optional[str] = Query(None)):
    """Contract v2.6: status of up to MAX_BATCH_IDS invitations in one call.
    -> {results: [same shape as GET /invitations/{id}, in ids order], missing: [ids not found]}"""
    wanted = list(dict.fromkeys(i.strip() for i in (ids or "").split(",") if i.strip()))
    if not wanted:
        raise HTTPException(status_code=400, detail="ids required (comma-separated invitation ids)")
    if len(wanted) > MAX_BATCH_IDS:
        raise HTTPException(status_code=400, detail=f"too many ids (max {MAX_BATCH_IDS})")
    found = {inv["invitation_id"]: inv async for inv in hr_invitations_col.find({"invitation_id": {"$in": wanted}})}
    contact_users = list({inv["user_id"] for inv in found.values() if _shares_contact(inv)})
    emails = {}
    if contact_users:
        async for u in users_col.find({"user_id": {"$in": contact_users}}, {"_id": 0, "user_id": 1, "email": 1}):
            emails[u["user_id"]] = u.get("email")
    return {
        "results": [_invitation_status_body(found[i], emails.get(found[i]["user_id"])) for i in wanted if i in found],
        "missing": [i for i in wanted if i not in found],
    }


@router.get("/invitations/{invitation_id}", dependencies=[Depends(require_talent_key)])
@_safe
async def get_invitation(invitation_id: str):
    inv = await _find_invitation(invitation_id)
    email = None
    if _shares_contact(inv):
        user = await users_col.find_one({"user_id": inv["user_id"]}, {"email": 1})
        email = (user or {}).get("email")
    return _invitation_status_body(inv, email)


@router.post("/invitations/{invitation_id}/withdraw", dependencies=[Depends(require_talent_key)])
@_safe
async def withdraw_invitation(invitation_id: str):
    """HR withdraws an invitation that is still open (sent/expired) or accepted. Idempotent."""
    inv = await _find_invitation(invitation_id)
    if inv.get("status") == "withdrawn":
        return {"status": "withdrawn"}
    if inv.get("status") not in ("sent", "accepted"):
        raise HTTPException(status_code=409, detail=f"Invitation already {inv.get('status')}")
    result = await hr_invitations_col.update_one(
        {"invitation_id": invitation_id, "status": inv.get("status")},
        {"$set": {"status": "withdrawn", "withdrawn_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.modified_count == 0:
        current = await _find_invitation(invitation_id)
        if current.get("status") != "withdrawn":
            raise HTTPException(status_code=409, detail=f"Invitation already {current.get('status')}")
        return {"status": "withdrawn"}
    org = _plain(inv.get("hr_org", "")) or "A recruiter on STUDLYF"
    await _notify_builder(inv, "hr_invitation_withdrawn", "Recruiter invitation withdrawn",
                          f"{org} withdrew their invitation. View it under Opportunities > Invitations.")
    return {"status": "withdrawn"}


def _validate_meeting(meeting) -> dict:
    if not isinstance(meeting, dict):
        raise HTTPException(status_code=400, detail="meeting is required for kind 'meeting'")
    title = str(meeting.get("title") or "").strip()
    starts_at = ts.normalize_iso(meeting.get("starts_at") or "")
    url = str(meeting.get("meeting_url") or "").strip()
    duration = meeting.get("duration_min")
    if not title or len(title) > 200:
        raise HTTPException(status_code=400, detail="meeting.title required (max 200)")
    if not starts_at:
        raise HTTPException(status_code=400, detail="meeting.starts_at must be an ISO-8601 datetime")
    if not isinstance(duration, int) or isinstance(duration, bool) or not 1 <= duration <= 1440:
        raise HTTPException(status_code=400, detail="meeting.duration_min must be an integer 1-1440")
    if url and (len(url) > 500 or not re.match(r"^https?://", url, re.IGNORECASE)):
        raise HTTPException(status_code=400, detail="meeting.meeting_url must be an http(s) URL (max 500)")
    return {"title": title, "starts_at": starts_at, "duration_min": duration, "meeting_url": url or None}


@router.post("/invitations/{invitation_id}/messages", dependencies=[Depends(require_talent_key)])
@_safe
async def post_hr_message(invitation_id: str, data: dict = Body(...)):
    """HR -> builder message or meeting. Only once the builder accepted. Idempotent on external_ref."""
    await ts.ensure_indexes()
    inv = await _find_invitation(invitation_id)
    kind = data.get("kind") or "text"
    if kind not in ("text", "meeting"):
        raise HTTPException(status_code=400, detail="kind must be 'text' or 'meeting'")
    body = "" if data.get("body") is None else str(data.get("body")).strip()
    if len(body) > MAX_MESSAGE_BODY:
        raise HTTPException(status_code=400, detail=f"body too long (max {MAX_MESSAGE_BODY})")
    meeting = _validate_meeting(data.get("meeting")) if kind == "meeting" else None
    if kind == "text" and not body:
        raise HTTPException(status_code=400, detail="body required")
    sender_name = str(data.get("sender_name") or "").strip()[:200]
    external_ref = str(data.get("external_ref") or "").strip()[:200]

    async def existing_response():
        if external_ref:
            existing = await hr_messages_col.find_one({"invitation_id": invitation_id, "external_ref": external_ref})
            if existing:
                return {"message_id": existing["message_id"], "created_at": existing["created_at"]}
        return None

    existing = await existing_response()
    if existing:
        return existing
    if ts.invitation_status(inv) != "accepted":
        raise HTTPException(status_code=409, detail="Candidate must accept the invitation first")

    doc = {
        "message_id": str(uuid.uuid4()),
        "invitation_id": invitation_id,
        "user_id": inv["user_id"],
        "from": "hr",
        "kind": kind,
        "body": body,
        "meeting": meeting,
        "sender_name": sender_name,
        "external_ref": external_ref,
        "created_at": ts.now_iso(),
    }
    try:
        await hr_messages_col.insert_one(doc)
    except DuplicateKeyError:
        existing = await existing_response()
        if existing:
            return existing
        raise
    org = _plain(inv.get("hr_org", "")) or "A recruiter on STUDLYF"
    if kind == "meeting":
        await _notify_builder(inv, "hr_message", "Recruiter scheduled a meeting",
                              f"{org} scheduled a meeting with you. View it under Opportunities > Invitations.")
    else:
        await _notify_builder(inv, "hr_message", "New message from a recruiter",
                              f"{org} sent you a message. View it under Opportunities > Invitations.")
    return {"message_id": doc["message_id"], "created_at": doc["created_at"]}


@router.get("/invitations/{invitation_id}/messages", dependencies=[Depends(require_talent_key)])
@_safe
async def get_hr_messages(invitation_id: str, since: Optional[str] = Query(None)):
    await _find_invitation(invitation_id)
    since_norm = None
    if since:
        since_norm = ts.normalize_iso(since)
        if not since_norm:
            raise HTTPException(status_code=400, detail="since must be an ISO-8601 datetime")
    return {"messages": await ts.list_messages(invitation_id, since_norm)}
