"""
Organizer (institution) approval — P3-O1.

Flag REQUIRE_ORGANIZER_APPROVAL (default off):
- off: signups are not marked pending and nobody is blocked. The status/admin endpoints still work,
  so admins can review accounts before the flag is switched on.
- on: new institution signups get users.approval_status = "pending" (main.py signup). Pending or
  rejected organizers can still log in, but `organizer_write_guard` answers 403 on every write to the
  organizer routers except auth, profile/settings and notifications.

Accounts without approval_status (everything created before this change) count as approved.
"""
from __future__ import annotations

import logging
import os
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request

from auth_institution import extract_request_token, get_auth_user
from auth_utils import decode_access_token
from db import audit_logs_col, institutions_col, users_col

logger = logging.getLogger("organizer_approval")

router = APIRouter(tags=["Organizer approval"])

APPROVED, PENDING, REJECTED = "approved", "pending", "rejected"
STATUSES = (PENDING, APPROVED, REJECTED)


def approval_required() -> bool:
    return os.getenv("REQUIRE_ORGANIZER_APPROVAL", "").strip().lower() in ("1", "true", "on", "yes")


def effective_status(user: Optional[dict]) -> str:
    status = str((user or {}).get("approval_status") or "").strip().lower()
    return status if status in STATUSES else APPROVED


def _is_admin(role) -> bool:
    return str(role or "").lower() in ("admin", "super_admin")


def _is_organizer(role) -> bool:
    return str(role or "").lower() == "institution"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def blocked_message(status: str) -> str:
    if status == REJECTED:
        return ("Your organizer account was not approved, so you can't create or edit events. "
                "Contact the STUDLYF team if you think this is a mistake.")
    return ("Your organizer account is waiting for approval by the STUDLYF team. "
            "You can create and edit events once it is approved.")


# Writes a pending or rejected organizer may still make on the guarded routers: auth, profile/settings,
# notifications and the approval status itself. Everything else (POST/PUT/PATCH/DELETE) is refused.
# The guard is attached to the integration (/api/v1/institution), hackathon (/api/v1/institution/hackathon),
# event (/api/v1/events) and opportunity (/api/opportunities) routers in main.py; publish-results checks
# assert_organizer_approved itself.
_ALLOWED_WRITE_PREFIXES = (
    "/api/auth/",
    "/api/v1/organizer/approval-status",
    "/api/v1/institution/profile",
    "/api/v1/institution/notifications/",
    "/api/opportunities/me/notifications/",
    "/api/notifications",
    "/api/v1/notifications",
)
_ALLOWED_WRITE_EXACT = (
    "/api/v1/institution/upload-media",  # settings page logo/banner upload
)
_WRITE_METHODS = ("POST", "PUT", "PATCH", "DELETE")


def _write_allowed_while_pending(path: str) -> bool:
    return path in _ALLOWED_WRITE_EXACT or path.startswith(_ALLOWED_WRITE_PREFIXES)


async def organizer_write_guard(request: Request) -> None:
    """Router-level dependency (main.py include_router). A no-op unless REQUIRE_ORGANIZER_APPROVAL is on."""
    if not approval_required() or request.method.upper() not in _WRITE_METHODS:
        return
    path = request.url.path
    if _write_allowed_while_pending(path):
        return
    # Same token the endpoint's get_auth_user will see, so a malformed header can't split the two.
    token = extract_request_token(request)
    if not token:
        return  # the endpoint's own auth decides
    payload = decode_access_token(token) or {}
    uid = payload.get("user_id")
    if not uid:
        # Fail closed: a token we can't decode must not slip past the guard on a write.
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = await users_col.find_one({"user_id": uid}, {"role": 1, "approval_status": 1})
    if not user or not _is_organizer(user.get("role")):
        return
    status = effective_status(user)
    if status != APPROVED:
        raise HTTPException(status_code=403, detail=blocked_message(status), headers={"X-Organizer-Approval": status})


async def assert_organizer_approved(user: dict) -> None:
    """For handlers that already resolved the caller (get_auth_user payload)."""
    if not approval_required() or not _is_organizer(user.get("role")):
        return
    doc = await users_col.find_one({"user_id": user.get("user_id")}, {"approval_status": 1})
    status = effective_status(doc)
    if status != APPROVED:
        raise HTTPException(status_code=403, detail=blocked_message(status), headers={"X-Organizer-Approval": status})


def _require_admin(user: dict) -> dict:
    if not _is_admin(user.get("role")):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/api/v1/organizer/approval-status")
async def get_my_approval_status(user: dict = Depends(get_auth_user)):
    doc = await users_col.find_one({"user_id": user.get("user_id")}) or {}
    is_org = _is_organizer(doc.get("role") or user.get("role"))
    status = effective_status(doc) if is_org else APPROVED
    return {
        "required": approval_required(),
        "is_organizer": is_org,
        "status": status,
        "blocked": bool(approval_required() and is_org and status != APPROVED),
        "rejection_reason": doc.get("approval_reason") if status == REJECTED else None,
        "requested_at": doc.get("approval_requested_at") or doc.get("created_at"),
        "decided_at": doc.get("approval_decided_at"),
        "institution_name": doc.get("institution_name"),
        "email": doc.get("email"),
    }


def _status_query(status: str) -> dict:
    if status == APPROVED:
        return {"$or": [{"approval_status": APPROVED}, {"approval_status": {"$exists": False}},
                        {"approval_status": None}, {"approval_status": {"$nin": list(STATUSES)}}]}
    return {"approval_status": status}


def _serialize(u: dict) -> dict:
    return {
        "user_id": u.get("user_id"),
        "full_name": u.get("full_name") or "",
        "email": u.get("email") or "",
        "institution_id": u.get("institution_id"),
        "institution_name": u.get("institution_name") or "",
        "approval_status": effective_status(u),
        "requested_at": u.get("approval_requested_at") or u.get("created_at"),
        "decided_at": u.get("approval_decided_at"),
        "decided_by": u.get("approval_decided_by"),
        "rejection_reason": u.get("approval_reason") if effective_status(u) == REJECTED else None,
        "email_verified": bool(u.get("email_verified")),
        "last_login_at": u.get("last_login_at"),
    }


@router.get("/api/v1/admin/organizers")
async def list_organizers(
    status: str = Query(PENDING),
    q: Optional[str] = Query(None, max_length=120),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    user: dict = Depends(get_auth_user),
):
    _require_admin(user)
    status = status.strip().lower()
    if status not in STATUSES:
        raise HTTPException(status_code=400, detail="status must be pending, approved or rejected")
    base = {"role": "institution"}
    query = {"$and": [base, _status_query(status)]}
    if q and q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$and"].append({"$or": [{"email": rx}, {"full_name": rx}, {"institution_name": rx}]})
    total = await users_col.count_documents(query)
    sort_field = "approval_requested_at" if status == PENDING else "approval_decided_at"
    cursor = users_col.find(query, {"password": 0}).sort([(sort_field, -1), ("created_at", -1)]).skip((page - 1) * limit).limit(limit)
    items = [_serialize(u) async for u in cursor]
    for item in items:
        item["joins_existing_institution"] = await _existing_institution_info(item)
    counts = {s: await users_col.count_documents({"$and": [base, _status_query(s)]}) for s in STATUSES}
    return {"items": items, "total": total, "page": page, "limit": limit, "counts": counts, "required": approval_required()}


async def _existing_institution_info(item: dict) -> Optional[dict]:
    """When this account joined an institution someone else created (signup matches the name), say which one
    and how many other organizers it already has. None when the account created the institution itself."""
    inst_id, uid = item.get("institution_id"), item.get("user_id")
    if not inst_id:
        return None
    inst = await institutions_col.find_one({"institution_id": inst_id}, {"name": 1, "email": 1, "created_by": 1})
    others_q = {"role": "institution", "institution_id": inst_id, "user_id": {"$ne": uid}}
    others = await users_col.count_documents(others_q)
    if not others:
        return None
    email = str(item.get("email") or "").lower()
    if inst and (inst.get("created_by") or inst.get("email")):
        creator = inst.get("created_by") == uid or str(inst.get("email") or "").lower() == email
    else:
        # No creator recorded: the earliest organizer on this institution is treated as its creator
        first = await users_col.find_one({"role": "institution", "institution_id": inst_id},
                                         {"user_id": 1}, sort=[("created_at", 1)])
        creator = bool(first and first.get("user_id") == uid)
    if creator:
        return None
    return {"institution_name": (inst or {}).get("name") or item.get("institution_name") or "", "organizers": others}


async def _notify_decision(target: dict, status: str, reason: Optional[str]) -> None:
    try:
        from notification_service import notification_service
        if status == APPROVED:
            title = "Your organizer account is approved"
            message = "You can now create and publish events on STUDLYF."
        else:
            title = "Your organizer account was not approved"
            message = f"Reason: {reason}" if reason else "Contact the STUDLYF team for details."
        # create_notification also emails the user through the existing email helper (when SMTP is configured)
        await notification_service.create_notification(
            user_id=target["user_id"],
            notification_type="organizer_approval",
            title=title,
            message=message,
            metadata={"approval_status": status, "action_url": "/institution-dashboard"},
        )
    except Exception as e:  # a failed notification must not undo the decision
        logger.error(f"organizer approval notification failed for {target.get('user_id')}: {e}")


async def _decide(user_id: str, status: str, admin: dict, reason: Optional[str]) -> dict:
    target = await users_col.find_one({"user_id": user_id})
    if not target or not _is_organizer(target.get("role")):
        raise HTTPException(status_code=404, detail="Organizer not found")
    previous = effective_status(target)
    if previous == status and (status == APPROVED or (target.get("approval_reason") or None) == reason):
        return {"status": "unchanged", "organizer": _serialize(target)}
    now = _now_iso()
    update = {
        "approval_status": status,
        "approval_decided_at": now,
        "approval_decided_by": admin.get("email") or admin.get("user_id"),
        "approval_reason": reason if status == REJECTED else None,
    }
    await users_col.update_one({"user_id": user_id}, {"$set": update})
    if target.get("institution_id"):
        await institutions_col.update_one(
            {"institution_id": target["institution_id"], "approval_status": {"$exists": True}},
            {"$set": {"approval_status": status, "approval_decided_at": now}},
        )
    try:
        await audit_logs_col.insert_one({
            "action": "ORGANIZER_APPROVED" if status == APPROVED else "ORGANIZER_REJECTED",
            "user": admin.get("email") or admin.get("user_id"),
            "details": f"{target.get('email')} ({target.get('institution_name') or 'no institution'}): {previous} -> {status}"
                       + (f"; reason: {reason}" if reason else ""),
            "timestamp": datetime.utcnow().isoformat(),
        })
    except Exception as e:
        logger.error(f"audit log failed: {e}")
    await _notify_decision(target, status, reason)
    target.update(update)
    return {"status": "success", "organizer": _serialize(target)}


@router.post("/api/v1/admin/organizers/{user_id}/approve")
async def approve_organizer(user_id: str, user: dict = Depends(get_auth_user)):
    _require_admin(user)
    return await _decide(user_id, APPROVED, user, None)


@router.post("/api/v1/admin/organizers/{user_id}/reject")
async def reject_organizer(user_id: str, payload: dict = Body(default_factory=dict), user: dict = Depends(get_auth_user)):
    _require_admin(user)
    reason = str((payload or {}).get("reason") or "").strip()
    if len(reason) < 3:
        raise HTTPException(status_code=400, detail="Please give a reason (at least 3 characters).")
    if len(reason) > 500:
        raise HTTPException(status_code=400, detail="Reason is too long (500 characters max).")
    return await _decide(user_id, REJECTED, user, reason)
