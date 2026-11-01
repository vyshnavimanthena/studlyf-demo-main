"""
Builder dashboard - read-only aggregation for the learner dashboard (PRD 4.6-4.7).
Reuses existing collections and services; writes nothing.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException

from auth_institution import get_auth_user
from db import db, users_col, sdl_projects_col, event_certificates_col
from routes.talent_routes import _profile_projects, _sdl_project, _skill_names
from services import talent_service as ts
from services import builder_dashboard_service as bd
from services import project_contribution_service as pc
from services.opportunity_service import get_all_opportunities, get_learner_opportunity_overview, get_user_applications

logger = logging.getLogger("builder_dashboard")

router = APIRouter(prefix="/api/v1/me", tags=["Builder Dashboard"])

PROFILE_PROJECTION = {
    "_id": 0, "user_id": 1, "firstName": 1, "lastName": 1, "bio": 1, "careerGoal": 1, "skills": 1,
    "projects": 1, "experienceList": 1, "experience": 1, "education": 1, "educationList": 1,
    "linkedin": 1, "github": 1, "portfolio": 1, "preferredRole": 1, "availability": 1,
    "openToOpportunities": 1, "searchStatus": 1, "skillEvidence": 1, "hrDiscoverable": 1,
}
CLOSED_APPLICATION_STATUSES = {"rejected", "withdrawn", "declined", "not_selected", "cancelled"}


def _user_id(user: dict) -> str:
    user_id = str(user.get("user_id", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID required")
    return user_id


async def _profile_state(user_id: str) -> dict:
    """Everything completeness needs, computed with the same rules as the Talent API."""
    profile = await db["learner_profiles"].find_one({"user_id": user_id}, PROFILE_PROJECTION) or {}
    user = await users_col.find_one({"user_id": user_id}, {"_id": 0, "full_name": 1}) or {}
    sdl_docs = [d async for d in sdl_projects_col.find({"owner_id": user_id}).sort("created_at", -1).limit(50)]
    projects = _profile_projects(profile) + [_sdl_project(d) for d in sdl_docs]
    experience = ts.experience_entries(profile)
    items = ts.linkable_items(projects, experience)
    certs = [d async for d in event_certificates_col.find({"user_id": user_id, "status": {"$ne": "revoked"}}).sort("issued_date", -1).limit(50)]
    evaluations, evaluated = await ts.published_evaluations([user_id], {user_id: certs})
    skills = _skill_names(profile.get("skills"))
    skills_detailed = ts.skills_detailed(skills, ts.explicit_links(profile, items), evaluated.get(user_id, {}))
    return {
        "profile": profile,
        "skills": skills,
        "skills_detailed": skills_detailed,
        "has_linkables": bool(items),
        "evaluations": evaluations.get(user_id, []),
        "completeness": bd.compute_completeness(profile, user, projects, experience, skills_detailed,
                                                await pc.completeness_contributions(user_id, profile)),
    }


@router.get("/profile-completeness")
async def my_profile_completeness(user: dict = Depends(get_auth_user)):
    """Completeness only (used by the MyProfile header)."""
    try:
        return (await _profile_state(_user_id(user)))["completeness"]
    except HTTPException:
        raise
    except Exception:
        logger.exception("profile-completeness failed")
        raise HTTPException(status_code=500, detail="Could not load profile completeness")


@router.get("/dashboard")
async def my_dashboard(user: dict = Depends(get_auth_user)):
    user_id = _user_id(user)
    try:
        state = await _profile_state(user_id)

        applications = await get_user_applications(user_id)
        overview = await get_learner_opportunity_overview(user_id, limit=8)
        upcoming = [
            {k: u.get(k) for k in ("opportunity_id", "title", "organization", "type", "status", "next_deadline", "next_label", "days_left")}
            for u in overview.get("upcoming", [])
            if str(u.get("status") or "pending").lower() not in CLOSED_APPLICATION_STATUSES
        ][:5]
        applied_ids = {str(a.get("opportunity_id")) for a in applications if a.get("opportunity_id")}
        active = [
            {
                "application_id": a.get("_id"),
                "opportunity_id": a.get("opportunity_id"),
                "title": a.get("opportunity_title") or "Opportunity",
                "organization": a.get("institution_name"),
                "type": a.get("opportunity_type"),
                "status": str(a.get("status") or "pending").lower(),
                "current_stage": a.get("current_stage"),
                "applied_at": ts._iso(a.get("applied_at")),
            }
            for a in applications
            if str(a.get("status") or "pending").lower() not in CLOSED_APPLICATION_STATUSES
        ]

        try:
            opportunities = await get_all_opportunities({})
        except Exception:
            logger.exception("dashboard: opportunity listing failed")
            opportunities = []
        recommended = bd.recommend_opportunities(opportunities, state["skills"], applied_ids)

        invitations = [i async for i in ts.hr_invitations_col.find({"user_id": user_id}, {"_id": 0, "status": 1, "created_at": 1, "expires_at": 1})]
        statuses = [ts.invitation_status(i) for i in invitations]
        discovery = {
            "recruiter_visible": state["profile"].get("hrDiscoverable") is True,
            "hr_invitations_total": len(invitations),
            "hr_invitations_pending": statuses.count("sent"),
            "hr_invitations_accepted": statuses.count("accepted"),
            "last_invitation_at": max((i.get("created_at") or "" for i in invitations), default=None) or None,
        }

        return {
            "completeness": state["completeness"],
            "next_actions": bd.build_next_actions(
                state["completeness"], state["skills_detailed"], state["has_linkables"],
                discovery["hr_invitations_pending"], upcoming, discovery["recruiter_visible"],
            ),
            "recommended_opportunities": recommended,
            "active_applications": active[:6],
            "applications_total": len(applications),
            "upcoming_deadlines": upcoming,
            "recent_evaluations_achievements": state["evaluations"][:5],
            "discovery": discovery,
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("dashboard failed")
        raise HTTPException(status_code=500, detail="Could not load your dashboard")
