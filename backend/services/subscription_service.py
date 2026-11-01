import os
import uuid
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, Optional

from db import hackathon_event_config_col, notifications_col, opportunities_col


SUBSCRIPTION_STATUSES = Enum("SubscriptionStatus", ["PENDING", "ACTIVE", "CANCELLED", "EXPIRED", "FAILED"])


PLAN_ORDER = ["basic", "pack3", "pack7", "enterprise"]


PLAN_FEATURES_LIST = {
    "basic": [
        "2 Jobs/Internship listings",
        "7 days registration window per listing",
        "Upto 30 application views per listing",
        "Access listing upto 15 days after registration ends",
        "10 interviews credits",
    ],
    "pack3": [
        "3 Jobs/Internship listings",
        "30 days registration window per listing",
        "Unlimited application views",
        "Access listing upto 15 days after registration ends",
        "50 interviews credits",
        "100 assessments credits",
    ],
    "pack7": [
        "Up to 7 Jobs/Internship listings",
        "30 days registration window per listing",
        "Unlimited application views",
        "Access listing upto 15 days after registration ends",
        "100 interviews credits",
        "200 assessments credits",
    ],
    "enterprise": [
        "Custom listings",
        "Custom registration window",
        "Unlimited application views",
        "Access listing upto 30 days after registration ends",
        "Custom interview & assessment credits",
        "Download access",
    ],
}


PLAN_RULES: Dict[str, Dict[str, Any]] = {
    "basic": {
        "name": "Basic Plan",
        "max_active_listings": 2,
        "max_registration_days": None,
        "max_app_views": 30,
        "max_interview_credits": 10,
        "max_assessment_credits": 0,
        "access_days_after_deadline": 15,
        "duration_days": 30,
        "features": PLAN_FEATURES_LIST["basic"],
    },
    "pack3": {
        "name": "Pack of 3",
        "max_active_listings": 3,
        "max_registration_days": 30,
        "max_app_views": None,
        "max_interview_credits": 50,
        "max_assessment_credits": 100,
        "access_days_after_deadline": 15,
        "duration_days": 30,
        "features": PLAN_FEATURES_LIST["pack3"],
    },
    "pack7": {
        "name": "Pack of 7",
        "max_active_listings": 7,
        "max_registration_days": 30,
        "max_app_views": None,
        "max_interview_credits": 100,
        "max_assessment_credits": 200,
        "access_days_after_deadline": 15,
        "duration_days": 90,
        "features": PLAN_FEATURES_LIST["pack7"],
    },
    "enterprise": {
        "name": "Enterprise",
        "max_active_listings": None,
        "max_registration_days": None,
        "max_app_views": None,
        "max_interview_credits": None,
        "max_assessment_credits": None,
        "access_days_after_deadline": 30,
        "duration_days": None,
        "features": PLAN_FEATURES_LIST["enterprise"],
    },
}


def _coerce_dt(value: Any) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, datetime):
        dt = value
    elif isinstance(value, str):
        txt = value.strip()
        if not txt:
            return None
        dt = datetime.fromisoformat(txt.replace("Z", "+00:00"))
    else:
        return None

    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


async def get_current_plan_id(institution_id: str) -> str:
    row = await hackathon_event_config_col.find_one(
        {"institution_id": str(institution_id), "key": "subscription_plan_id"}
    )
    plan_id = str((row or {}).get("value") or "basic").strip().lower()
    if plan_id not in PLAN_RULES:
        return "basic"
    return plan_id


async def get_current_plan_rules(institution_id: str) -> Dict[str, Any]:
    plan_id = await get_current_plan_id(institution_id)
    rules = dict(PLAN_RULES.get(plan_id) or PLAN_RULES["basic"])
    rules["id"] = plan_id
    return rules


async def validate_new_listing_against_plan(
    institution_id: str,
    deadline_value: Any = None,
    deadline_label: str = "deadline",
    start_date_value: Any = None,
    ignore_limits: bool = False,
) -> Dict[str, Any]:
    rules = await get_current_plan_rules(institution_id)

    if ignore_limits:
        return rules

    max_active = rules.get("max_active_listings")
    if max_active is not None:
        active_count = await opportunities_col.count_documents(
            {
                "institution_id": str(institution_id),
                "status": {"$in": ["active", "ACTIVE", "live", "LIVE"]},
            }
        )
        if active_count >= int(max_active):
            raise ValueError(
                f"{rules['name']} allows up to {max_active} active listings. "
                f"Deactivate an existing listing or upgrade your subscription."
            )

    now = datetime.now(timezone.utc)

    # Start date validation — must not be in the past
    if start_date_value:
        start_dt = _coerce_dt(start_date_value)
        if start_dt:
            if start_dt < now - timedelta(hours=1):
                raise ValueError(
                    f"Registration start date ({start_dt.strftime('%b %d, %Y')}) is in the past. "
                    f"Please set a future date."
                )

    max_days = rules.get("max_registration_days")
    if max_days is not None and deadline_value:
        deadline_dt = _coerce_dt(deadline_value)
        if deadline_dt:
            delta_days = (deadline_dt - now).total_seconds() / 86400.0
            if delta_days > float(max_days):
                raise ValueError(
                    f"Your {rules['name']} supports a maximum {max_days}-day {deadline_label}."
                )
            # Deadline must be after start date
            if start_date_value:
                start_dt = _coerce_dt(start_date_value)
                if start_dt and deadline_dt <= start_dt:
                    raise ValueError(
                        f"Registration deadline must be after the start date."
                    )

    return rules


def is_upgrade(current_plan_id: str, new_plan_id: str) -> bool:
    if current_plan_id not in PLAN_ORDER or new_plan_id not in PLAN_ORDER:
        return False
    return PLAN_ORDER.index(new_plan_id) > PLAN_ORDER.index(current_plan_id)


def is_downgrade(current_plan_id: str, new_plan_id: str) -> bool:
    if current_plan_id not in PLAN_ORDER or new_plan_id not in PLAN_ORDER:
        return False
    return PLAN_ORDER.index(new_plan_id) < PLAN_ORDER.index(current_plan_id)


async def get_subscription_status(institution_id: str) -> str:
    row = await hackathon_event_config_col.find_one(
        {"institution_id": str(institution_id), "key": "subscription_status"}
    )
    val = str((row or {}).get("value") or "").strip().lower()
    return val if val else "active"


async def get_pending_plan(institution_id: str) -> Optional[dict]:
    """Returns pending plan info if user has initiated a plan change but not confirmed."""
    pending = await hackathon_event_config_col.find_one(
        {"institution_id": str(institution_id), "key": "pending_plan_id"}
    )
    if not pending:
        return None
    plan_id = str(pending.get("value") or "")
    if plan_id not in PLAN_RULES:
        return None
    return {
        "plan_id": plan_id,
        "plan_name": PLAN_RULES[plan_id]["name"],
        "queued_at": pending.get("updated_at"),
    }


async def set_pending_plan(institution_id: str, new_plan_id: str) -> dict:
    """Stores a pending plan change (pre-confirmation). Returns upgrade/downgrade info."""
    current_id = await get_current_plan_id(institution_id)
    now_iso = datetime.now(timezone.utc).isoformat()

    await hackathon_event_config_col.update_one(
        {"institution_id": institution_id, "key": "pending_plan_id"},
        {"$set": {"value": new_plan_id, "updated_at": now_iso}},
        upsert=True,
    )

    is_up = is_upgrade(current_id, new_plan_id)
    is_down = is_downgrade(current_id, new_plan_id)

    return {
        "current_plan_id": current_id,
        "current_plan_name": PLAN_RULES.get(current_id, {}).get("name", current_id),
        "pending_plan_id": new_plan_id,
        "pending_plan_name": PLAN_RULES.get(new_plan_id, {}).get("name", new_plan_id),
        "is_upgrade": is_up,
        "is_downgrade": is_down,
        "status": "pending",
        "message": "Plan change is pending confirmation.",
    }


async def cancel_pending_plan(institution_id: str):
    await hackathon_event_config_col.delete_one(
        {"institution_id": institution_id, "key": "pending_plan_id"}
    )


async def confirm_plan_change(institution_id: str, actor_email: Optional[str] = None) -> dict:
    """Confirms a pending plan change and activates the new plan."""
    pending = await get_pending_plan(institution_id)
    if not pending or not pending.get("plan_id"):
        raise ValueError("No pending plan change to confirm.")
    new_plan_id = pending["plan_id"]

    current_plan_id = await get_current_plan_id(institution_id)
    is_down = is_downgrade(current_plan_id, new_plan_id)

    now_iso = datetime.now(timezone.utc).isoformat()
    now = datetime.now(timezone.utc)

    # Log plan change to history
    from db import payments_col
    await payments_col.insert_one({
        "institution_id": institution_id,
        "type": "plan_change",
        "from_plan": current_plan_id,
        "to_plan": new_plan_id,
        "status": "confirmed",
        "is_downgrade": is_down,
        "email": actor_email,
        "created_at": now_iso,
    })

    # For downgrade: schedule for next cycle
    current_end = await get_stored_plan_end_date(institution_id)
    if is_down and current_end and current_end > now:
        # Store pending_activated_at for when current plan expires
        await hackathon_event_config_col.update_one(
            {"institution_id": institution_id, "key": "next_plan_id"},
            {"$set": {"value": new_plan_id, "updated_at": now_iso}},
            upsert=True,
        )
        await cancel_pending_plan(institution_id)
        return {
            "success": True,
            "message": f"Downgrade to {PLAN_RULES[new_plan_id]['name']} scheduled for {current_end.strftime('%B %d, %Y')}.",
            "effective_date": current_end.isoformat(),
            "is_scheduled": True,
        }

    # For upgrade or no current end: activate immediately
    from hackathon_integration_routes import _activate_subscription as _do_activate
    await _do_activate(
        institution_id=institution_id,
        plan_id=new_plan_id,
        payment_status="free",
        provider="manual",
        payment_id=f"plan_change_{uuid.uuid4().hex[:10]}",
        amount=0,
        currency="INR",
        actor_email=actor_email,
    )
    await cancel_pending_plan(institution_id)

    return {
        "success": True,
        "message": f"Plan changed to {PLAN_RULES[new_plan_id]['name']} successfully.",
        "effective_date": now_iso,
        "is_scheduled": False,
    }


async def check_entitlement(institution_id: str, feature: str) -> bool:
    """Check if an institution has access to a specific feature based on their plan."""
    rules = await get_current_plan_rules(institution_id)
    if feature == "hackathon_package":
        row = await hackathon_event_config_col.find_one(
            {"institution_id": institution_id, "key": "hackathon_package_enabled"}
        )
        return str((row or {}).get("value", "false")).lower() == "true"
    if feature == "unlimited_listings":
        return rules.get("max_active_listings") is None
    if feature == "unlimited_app_views":
        return rules.get("max_app_views") is None
    if feature == "unlimited_registration_days":
        return rules.get("max_registration_days") is None
    if feature == "assessments":
        max_assess = rules.get("max_assessment_credits")
        return max_assess is None or max_assess > 0
    if feature == "interviews":
        max_int = rules.get("max_interview_credits")
        return max_int is None or max_int > 0
    return True


async def get_used_interview_credits(institution_id: str) -> int:
    from db import interviews_col
    count = await interviews_col.count_documents({"institution_id": str(institution_id)})
    return count


async def get_used_assessment_credits(institution_id: str) -> int:
    from db import quizzes_col
    count = await quizzes_col.count_documents({"institution_id": str(institution_id)})
    return count


def get_plan_duration_days(plan_id: str) -> Optional[int]:
    rules = PLAN_RULES.get(plan_id) or PLAN_RULES["basic"]
    return rules.get("duration_days")


async def get_stored_plan_end_date(institution_id: str) -> Optional[datetime]:
    row = await hackathon_event_config_col.find_one(
        {"institution_id": str(institution_id), "key": "subscription_end"}
    )
    raw = (row or {}).get("value")
    if raw:
        try:
            return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        except Exception:
            try:
                return datetime.fromtimestamp(float(raw), tz=timezone.utc)
            except Exception:
                pass
    return None


async def get_plan_expiry_status(institution_id: str) -> dict:
    end_date = await get_stored_plan_end_date(institution_id)
    if not end_date:
        plan_id = await get_current_plan_id(institution_id)
        dur = get_plan_duration_days(plan_id)
        if dur:
            end_date = datetime.now(timezone.utc) + timedelta(days=int(dur))
    if not end_date:
        return {"expires_at": None, "days_remaining": None, "is_expired": False}
    now = datetime.now(timezone.utc)
    remaining = (end_date - now).total_seconds() / 86400.0
    return {
        "expires_at": end_date.isoformat(),
        "days_remaining": round(remaining, 1) if remaining > 0 else 0,
        "is_expired": remaining <= 0,
    }


async def check_and_notify_expiring_plan(institution_id: str):
    """Checks if plan is expiring soon and sends notifications."""
    end_date = await get_stored_plan_end_date(institution_id)
    if not end_date:
        return
    now = datetime.now(timezone.utc)
    remaining = (end_date - now).total_seconds() / 86400.0

    def _reminder_key(label: str) -> str:
        return f"plan_expiry_reminder_{label}"

    async def _already_sent(label: str) -> bool:
        row = await hackathon_event_config_col.find_one(
            {"institution_id": str(institution_id), "key": _reminder_key(label)}
        )
        return str((row or {}).get("value") or "false").lower() == "true"

    async def _mark_sent(label: str):
        await hackathon_event_config_col.update_one(
            {"institution_id": str(institution_id), "key": _reminder_key(label)},
            {"$set": {"value": "true", "updated_at": now.isoformat()}},
            upsert=True,
        )

    if 5 < remaining <= 7:
        if not await _already_sent("7d"):
            await _send_expiry_notification(institution_id, end_date, "7 days", "Your plan will expire in 7 days. Renew now to avoid interruption.")
            await _mark_sent("7d")
    elif 2 < remaining <= 3:
        if not await _already_sent("3d"):
            await _send_expiry_notification(institution_id, end_date, "3 days", "Your plan will expire in 3 days. Renew now to avoid interruption.")
            await _mark_sent("3d")
    elif 0 < remaining <= 1:
        if not await _already_sent("1d"):
            await _send_expiry_notification(institution_id, end_date, "1 day", "Your plan will expire tomorrow. Renew now to avoid interruption.")
            await _mark_sent("1d")
    elif remaining <= 0:
        if not await _already_sent("expired"):
            await _send_expiry_notification(institution_id, end_date, "Expired", "Your plan has expired. Renew now to continue using hackathon features.")
            await _mark_sent("expired")


async def _send_expiry_notification(institution_id: str, end_date: datetime, label: str, message: str):
    from db import institutions_col
    from services.email_template_service import send_template_email

    inst = await institutions_col.find_one({"institution_id": institution_id})
    if not inst:
        return
    recipient = inst.get("admin_email") or inst.get("email") or inst.get("contact_email")
    if not recipient:
        return

    frontend_url = os.getenv('FRONTEND_URL', 'https://studlyf.in')
    is_expired = "expired" in label.lower()

    await send_template_email(
        template_type="plan_expiry",
        recipient=recipient,
        context={
            "user_name": inst.get("admin_name") or inst.get("name") or "Administrator",
            "plan_name": "Current Plan",
            "expiry_date": end_date.strftime("%B %d, %Y"),
            "expiry_label": label,
            "renew_url": f"{frontend_url}/institution/settings?tab=plan",
            "message": message,
            "frontend_url": frontend_url,
            "renew_section": (
                f'<div style="text-align:center;margin-bottom:18px">'
                f'<a href="{frontend_url}/institution/settings?tab=plan" '
                f'style="display:inline-block;padding:12px 24px;background:#6c3bff;color:#fff;'
                f'border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">'
                f'{"Renew Now" if is_expired else "View Plans"}'
                f'</a></div>'
            ),
        },
        subject_override=f"Action Required: Your Hackathon Plan — {label}",
    )

    await notifications_col.insert_one({
        "institution_id": institution_id,
        "type": "plan_expiry",
        "title": f"Plan {label}",
        "message": message,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "priority": "high",
        "category": "system",
    })
