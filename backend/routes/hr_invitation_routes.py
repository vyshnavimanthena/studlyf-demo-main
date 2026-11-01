"""
Builder-side HR invitations - list and respond to invitations sent via the Talent API,
message recruiters on accepted invitations, and manage what recruiters see.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException

from auth_institution import get_auth_user
from db import db, users_col, sdl_projects_col, event_certificates_col
from routes.talent_routes import is_builder_role, _profile_projects, _sdl_project, _skill_names, MAX_MESSAGE_BODY
from services import talent_service as ts

router = APIRouter(prefix="/api/v1/me", tags=["HR Invitations"])

hr_invitations_col = ts.hr_invitations_col
hr_messages_col = ts.hr_messages_col

RESPONSE_STATUS = {"accept": "accepted", "decline": "declined"}


def _format(inv: dict) -> dict:
    return {
        "invitation_id": inv.get("invitation_id"),
        "hr_org": inv.get("hr_org", ""),
        "hr_name": inv.get("hr_name", ""),
        "role_title": inv.get("role_title", ""),
        "message": inv.get("message", ""),
        "status": ts.invitation_status(inv),
        "created_at": inv.get("created_at"),
        "responded_at": inv.get("responded_at"),
        "expires_at": ts.invitation_expires_at(inv),
        "share_contact": inv.get("share_contact") is True,
    }


def _user_id(user: dict) -> str:
    user_id = str(user.get("user_id", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return user_id


async def _own_invitation(invitation_id: str, user_id: str) -> dict:
    inv = await hr_invitations_col.find_one({"invitation_id": invitation_id, "user_id": user_id})
    if not inv:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return inv


@router.get("/hr-invitations")
async def my_hr_invitations(user: dict = Depends(get_auth_user)):
    """Invitations HR sent to the current user, newest first."""
    user_id = _user_id(user)
    items = []
    async for inv in hr_invitations_col.find({"user_id": user_id}).sort("created_at", -1).limit(200):
        items.append(_format(inv))
    return {"invitations": items}


@router.post("/hr-invitations/{invitation_id}/respond")
async def respond_to_hr_invitation(
    invitation_id: str,
    data: dict = Body(...),
    user: dict = Depends(get_auth_user),
):
    """Accept or decline an invitation. Only the invited user, only while it is still "sent" and not expired.

    Optional share_contact (accept only): lets the recruiter see the builder's email.
    """
    user_id = _user_id(user)
    new_status = RESPONSE_STATUS.get(str(data.get("response", "")).lower())
    if not new_status:
        raise HTTPException(status_code=400, detail="response must be 'accept' or 'decline'")
    share_contact = data.get("share_contact", False)
    if not isinstance(share_contact, bool):
        raise HTTPException(status_code=400, detail="share_contact must be true or false")

    inv = await _own_invitation(invitation_id, user_id)
    current = ts.invitation_status(inv)
    if current != "sent":
        raise HTTPException(status_code=409, detail=f"Invitation already {current}")

    responded_at = datetime.now(timezone.utc).isoformat()
    update = {"status": new_status, "responded_at": responded_at,
              "share_contact": new_status == "accepted" and share_contact}
    result = await hr_invitations_col.update_one(
        {"invitation_id": invitation_id, "user_id": user_id, "status": "sent"},
        {"$set": update},
    )
    if result.modified_count == 0:
        latest = await _own_invitation(invitation_id, user_id)
        raise HTTPException(status_code=409, detail=f"Invitation already {ts.invitation_status(latest)}")

    return _format({**inv, **update})


@router.get("/hr-invitations/{invitation_id}/messages")
async def my_hr_messages(invitation_id: str, user: dict = Depends(get_auth_user)):
    user_id = _user_id(user)
    await _own_invitation(invitation_id, user_id)
    return {"messages": await ts.list_messages(invitation_id)}


@router.post("/hr-invitations/{invitation_id}/messages")
async def send_hr_message(invitation_id: str, data: dict = Body(...), user: dict = Depends(get_auth_user)):
    """Builder -> recruiter text message, only on an accepted invitation."""
    user_id = _user_id(user)
    inv = await _own_invitation(invitation_id, user_id)
    body = "" if data.get("body") is None else str(data.get("body")).strip()
    if not body:
        raise HTTPException(status_code=400, detail="body required")
    if len(body) > MAX_MESSAGE_BODY:
        raise HTTPException(status_code=400, detail=f"body too long (max {MAX_MESSAGE_BODY})")
    if ts.invitation_status(inv) != "accepted":
        raise HTTPException(status_code=409, detail="You can message the recruiter after accepting the invitation")
    await ts.ensure_indexes()
    doc = {
        "message_id": str(uuid.uuid4()),
        "invitation_id": invitation_id,
        "user_id": user_id,
        "from": "builder",
        "kind": "text",
        "body": body,
        "meeting": None,
        "sender_name": "",
        "external_ref": "",
        "created_at": ts.now_iso(),
    }
    await hr_messages_col.insert_one(doc)
    return ts.format_message(doc)


@router.get("/talent-visibility")
async def my_talent_visibility(user: dict = Depends(get_auth_user)):
    """Current user's recruiter-discovery opt-in."""
    user_id = _user_id(user)
    profile = await db["learner_profiles"].find_one({"user_id": user_id}, {"hrDiscoverable": 1})
    return {"hrDiscoverable": bool((profile or {}).get("hrDiscoverable", False))}


@router.put("/talent-visibility")
async def set_my_talent_visibility(data: dict = Body(...), user: dict = Depends(get_auth_user)):
    """Set only learner_profiles.hrDiscoverable for the current user."""
    user_id = _user_id(user)
    value = data.get("hrDiscoverable")
    if not isinstance(value, bool):
        raise HTTPException(status_code=400, detail="hrDiscoverable must be true or false")
    if value:
        account = await users_col.find_one({"user_id": user_id}, {"role": 1})
        if not account:
            raise HTTPException(status_code=403, detail="Your account could not be found. Please sign in again.")
        if not is_builder_role(account.get("role")):
            raise HTTPException(status_code=403, detail="Recruiter visibility is only available for learner accounts, not staff or organisation accounts.")
    await db["learner_profiles"].update_one(
        {"user_id": user_id},
        {"$set": {"hrDiscoverable": value}},
        upsert=True,
    )
    return {"hrDiscoverable": value}


async def _talent_profile_view(user_id: str) -> dict:
    profile = await db["learner_profiles"].find_one(
        {"user_id": user_id},
        {"_id": 0, "skills": 1, "projects": 1, "experienceList": 1, "experience": 1, "searchStatus": 1,
         "openToOpportunities": 1, "availability": 1, "preferredRole": 1, "skillEvidence": 1},
    ) or {}
    sdl_docs = [d async for d in sdl_projects_col.find({"owner_id": user_id}).sort("created_at", -1).limit(50)]
    projects = _profile_projects(profile) + [_sdl_project(d) for d in sdl_docs]
    experience = ts.experience_entries(profile)
    items = ts.linkable_items(projects, experience)
    skills = _skill_names(profile.get("skills"))
    certs = [d async for d in event_certificates_col.find({"user_id": user_id, "status": {"$ne": "revoked"}}).limit(50)]
    _, evaluated = await ts.published_evaluations([user_id], {user_id: certs})
    links = ts.explicit_links(profile, items)
    return {
        "open_to_opportunities": ts.open_to_opportunities(profile),
        "availability": profile.get("availability") if profile.get("availability") in ts.AVAILABILITY_VALUES else None,
        "preferred_role": profile.get("preferredRole") or None,
        "availability_options": list(ts.AVAILABILITY_VALUES),
        "linkable": [{"type": t, "ref_id": r, "title": title} for (t, r), title in items.items()],
        "skills_detailed": ts.skills_detailed(skills, links, evaluated.get(user_id, {})),
        "_profile": profile, "_items": items, "_skills": skills,
    }


def _public(view: dict) -> dict:
    return {k: v for k, v in view.items() if not k.startswith("_")}


@router.get("/talent-profile")
async def my_talent_profile(user: dict = Depends(get_auth_user)):
    """What recruiters see beyond the regular profile: availability, preferred role, skill evidence levels."""
    return _public(await _talent_profile_view(_user_id(user)))


@router.put("/talent-profile")
async def set_my_talent_profile(data: dict = Body(...), user: dict = Depends(get_auth_user)):
    """Update open_to_opportunities / availability / preferred_role / skill_evidence (each optional).

    skill_evidence: [{skill, links: [{type: "project"|"experience", ref_id}]}] replaces the stored list.
    Only the builder's own listed skills and their own projects/experience can be linked.
    """
    user_id = _user_id(user)
    view = await _talent_profile_view(user_id)
    try:
        update = ts.validate_talent_profile(data, view["_items"], view["_skills"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if update:
        await db["learner_profiles"].update_one({"user_id": user_id}, {"$set": update}, upsert=True)
    return _public(await _talent_profile_view(user_id))
