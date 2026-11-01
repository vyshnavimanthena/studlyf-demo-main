"""
Talent service - shared logic for the Talent API (HR side) and the builder's own
recruiter settings / HR invitations (builder side).

Evidence rules (PRD section 4, step 3):
- "self_reported": the builder listed the skill.
- "evidence_backed": the builder EXPLICITLY linked the skill to one of their own projects
  or experience entries (learner_profiles.skillEvidence). Never inferred from text.
- "evaluated": a finalized + published evaluation of that builder exists AND the organizer
  named the skill, either as an event skill tag (events.skills) or as a judging criterion
  name (events.judging_criteria[].name). Exact, case-insensitive name match only.

"Finalized + published" (mapping of the existing judging collections):
- Events are finalized by POST /api/v1/institution/finalize-event/{id} (integration_routes)
  or POST /api/events/{id}/finalize (main.py). Both rank submissions and set
  events.status = "ENDED"; the first also writes results.final_rankings and issues
  certificates. The lifecycle service additionally knows RESULTS_READY / ARCHIVED.
  => an event's results are published iff events.status is ENDED, RESULTS_READY or ARCHIVED
     AND a finalization artifact exists: events.finalized_at, a results doc, or issued certificates.
     (Status alone is not enough: organizers can $set it freely and legacy events may be ENDED.)
- Per-user ranked result: results.final_rankings[] of a published event, or leaderboard rows only
  when the event has finalized_at (leaderboard rows are rewritten live during judging). Matched by
  user_id, participant_id (user_id or participants._id) or team_id (teams.members[].user_id).
  These are kind "evaluation" with final_status "ranked" and result "Rank N of M"; award labels are
  never derived from rank and come only from certificates.
- Certificates (event_certificates, status != "revoked") are issued to the participant
  and are therefore published: participation -> "participation", ranked keys -> "award".
- Raw judge data (scores, submission_scores, submission_data, hackathon_submissions,
  event_judges) is never read directly: it is draft/in-progress until finalized.
- Per-criterion scores are disclosed only if the organizer set
  events.disclose_scores_to_recruiters == True (no UI sets it today, so scores are null).
"""
import logging
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

from bson import ObjectId

from db import (
    db, events_col, event_certificates_col, results_col, leaderboard_col, submissions_col, teams_col, participants_col,
)

PUBLISHED_EVENT_STATUSES = {"ended", "results_ready", "archived"}
AWARD_KEYS = {"winner", "runner_up", "second_runner_up", "finalist", "top_performer"}
PARTICIPATION_KEYS = {"participation"}
INVITATION_TTL = timedelta(days=30)
AVAILABILITY_VALUES = ("immediately", "within_1_month", "within_3_months", "not_available")
MAX_EVIDENCE_LINKS = 10
MAX_SKILL_EVIDENCE = 50

logger = logging.getLogger("talent_service")

hr_invitations_col = db["hr_invitations"]
hr_messages_col = db["hr_messages"]

_indexes_ready = False


async def ensure_indexes():
    """Create the hr_invitations / hr_messages indexes once per process (never fatal)."""
    global _indexes_ready
    if _indexes_ready:
        return
    _indexes_ready = True
    non_empty_ref = {"external_ref": {"$gt": ""}}
    specs = [
        (hr_invitations_col, [("invitation_id", 1)], {"unique": True, "name": "uniq_invitation_id"}),
        (hr_invitations_col, [("user_id", 1), ("external_ref", 1)],
         {"unique": True, "partialFilterExpression": non_empty_ref, "name": "uniq_user_external_ref"}),
        (hr_invitations_col, [("user_id", 1), ("created_at", -1)], {"name": "user_created"}),
        (hr_messages_col, [("message_id", 1)], {"unique": True, "name": "uniq_message_id"}),
        (hr_messages_col, [("invitation_id", 1), ("external_ref", 1)],
         {"unique": True, "partialFilterExpression": non_empty_ref, "name": "uniq_invitation_external_ref"}),
        (hr_messages_col, [("invitation_id", 1), ("created_at", 1)], {"name": "invitation_created"}),
    ]
    for col, keys, opts in specs:
        try:
            if opts.get("unique") and not await _index_exists(col, opts["name"]):
                dupes = await _duplicate_keys(col, keys, opts.get("partialFilterExpression"))
                if dupes:
                    # Never crash or delete data: leave the index off until the duplicates are cleaned up
                    logger.warning("[TALENT] Not creating unique index %s on %s: %d duplicate key group(s), e.g. %s",
                                   opts["name"], col.name, len(dupes), dupes[:3])
                    continue
            await col.create_index(keys, **opts)
        except Exception as e:
            logger.warning("[TALENT] Could not create index %s: %s", opts.get("name"), e)


async def _index_exists(col, name: str) -> bool:
    try:
        return name in await col.index_information()
    except Exception:
        return False


async def _duplicate_keys(col, keys: list, partial: Optional[dict]) -> list:
    """Key groups that would violate a unique index (max 20 reported)."""
    group_id = {k.replace(".", "_"): f"${k}" for k, _ in keys}
    pipeline = ([{"$match": partial}] if partial else []) + [
        {"$group": {"_id": group_id, "n": {"$sum": 1}}},
        {"$match": {"n": {"$gt": 1}}},
        {"$limit": 20},
    ]
    return [{**d["_id"], "count": d["n"]} async for d in col.aggregate(pipeline, allowDiskUse=True)]


def now_iso() -> str:
    """Fixed-width UTC timestamp so string comparison == time comparison."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f+00:00")


def normalize_iso(value: str) -> Optional[str]:
    """Parse an ISO-8601 string (Z or offset; naive = UTC) into now_iso() format, or None."""
    # A literal "+" in a query string arrives as a space: "...T10:00:00 05:30"
    value = re.sub(r" (\d{2}:?\d{2})$", r"+\1", str(value).strip())
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f+00:00")


def _to_datetime(value) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if value:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            return None
    return None


def _iso(value) -> Optional[str]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return (value if value.tzinfo else value.replace(tzinfo=timezone.utc)).isoformat()
    return str(value)


def _str_or_none(value) -> Optional[str]:
    if value is None:
        return None
    value = str(value).strip()
    return value or None


# ─── Invitations ─────────────────────────────────────────────────────────────

def invitation_expires_at(inv: dict) -> Optional[str]:
    if inv.get("expires_at"):
        return inv["expires_at"]
    created = _to_datetime(inv.get("created_at"))
    return (created + INVITATION_TTL).isoformat() if created else None


def invitation_status(inv: dict) -> str:
    """Stored status, except a still-"sent" invitation past expires_at reports "expired"."""
    status = inv.get("status", "sent")
    if status == "sent":
        expires = _to_datetime(invitation_expires_at(inv))
        if expires and datetime.now(timezone.utc) > expires:
            return "expired"
    return status


def format_message(msg: dict) -> dict:
    return {
        "message_id": msg.get("message_id"),
        "from": msg.get("from"),
        "kind": msg.get("kind", "text"),
        "body": msg.get("body", ""),
        "meeting": msg.get("meeting"),
        "created_at": msg.get("created_at"),
    }


async def list_messages(invitation_id: str, since: Optional[str] = None) -> list:
    query = {"invitation_id": invitation_id}
    if since:
        query["created_at"] = {"$gt": since}
    cursor = hr_messages_col.find(query, {"_id": 0}).sort("created_at", 1).limit(500)
    return [format_message(m) async for m in cursor]


# ─── Builder profile extensions ──────────────────────────────────────────────

def experience_entries(profile: dict) -> list:
    """learner_profiles.experienceList (or the legacy single `experience`) as contract objects with stable-ish ids."""
    raw = profile.get("experienceList") if isinstance(profile.get("experienceList"), list) else []
    if not raw and isinstance(profile.get("experience"), dict) and (profile["experience"].get("company") or profile["experience"].get("role")):
        raw = [profile["experience"]]
    entries = []
    for i, e in enumerate(raw):
        if not isinstance(e, dict):
            continue
        title, org = _str_or_none(e.get("role")), _str_or_none(e.get("company"))
        if not title and not org:
            continue
        entries.append({
            "id": f"exp-{i}",
            "title": title or "",
            "organization": org or "",
            "type": _str_or_none(e.get("type")),
            "start": _str_or_none(e.get("start") or e.get("startDate") or e.get("start_date")),
            "end": _str_or_none(e.get("end") or e.get("endDate") or e.get("end_date")),
            "description": _str_or_none(e.get("responsibilities") or e.get("description")) or "",
        })
    return entries


def experience_label(entry: dict) -> str:
    return " at ".join(p for p in (entry.get("title"), entry.get("organization")) if p)


def open_to_opportunities(profile: dict) -> bool:
    value = profile.get("openToOpportunities")
    if isinstance(value, bool):
        return value
    return (profile.get("searchStatus") or "active") in ("active", "open")


def linkable_items(projects: list, experience: list) -> dict:
    """(type, ref_id) -> current title, for validating the builder's explicit skill links."""
    items = {("project", p["id"]): p.get("title") or "" for p in projects}
    items.update({("experience", e["id"]): experience_label(e) for e in experience})
    return items


def explicit_links(profile: dict, items: dict) -> dict:
    """skill (lowercase) -> [evidence] from learner_profiles.skillEvidence.

    A link only counts while the referenced project/experience still exists with the title the
    builder linked (ids are positional, so a reorder or delete silently invalidates it).
    """
    links = {}
    for entry in profile.get("skillEvidence") or []:
        if not isinstance(entry, dict):
            continue
        skill = _str_or_none(entry.get("skill"))
        if not skill:
            continue
        for link in entry.get("links") or []:
            if not isinstance(link, dict):
                continue
            key = (link.get("type"), link.get("ref_id"))
            current = items.get(key)
            if current is None or current.strip().lower() != str(link.get("title") or "").strip().lower():
                continue
            links.setdefault(skill.lower(), []).append({"type": key[0], "ref_id": key[1], "title": current})
    return links


def skills_detailed(skill_names: list, links: dict, evaluated: dict) -> list:
    """evaluated: skill (lowercase) -> [evaluation evidence]."""
    detailed = []
    for name in skill_names:
        key = name.lower()
        eval_evidence = evaluated.get(key, [])
        link_evidence = links.get(key, [])
        level = "evaluated" if eval_evidence else "evidence_backed" if link_evidence else "self_reported"
        detailed.append({"name": name, "level": level, "evidence": eval_evidence + link_evidence})
    return detailed


# ─── Published evaluations ──────────────────────────────────────────────────

def _event_tags(event: dict) -> set:
    """Skill names the organizer attached to the event: skills tags + judging criteria names."""
    tags = set()
    skills = event.get("skills")
    if isinstance(skills, str):
        skills = skills.split(",")
    for s in skills or []:
        if isinstance(s, str) and s.strip():
            tags.add(s.strip().lower())
    for c in event.get("judging_criteria") or []:
        if isinstance(c, dict) and _str_or_none(c.get("name")):
            tags.add(c["name"].strip().lower())
    return tags


def _is_published(event: Optional[dict], has_artifact: bool) -> bool:
    """Ended-like status alone is not enough: organizers can $set status freely and legacy events may
    be ENDED without ever being finalized. Require a finalization artifact as well: events.finalized_at
    (set by finalize-event), a results doc, or issued (non-revoked) certificates for the event."""
    if not event or str(event.get("status") or "").strip().lower() not in PUBLISHED_EVENT_STATUSES:
        return False
    return bool(event.get("finalized_at")) or has_artifact


async def _events_by_ids(event_ids: set) -> dict:
    """event id string (ObjectId hex or custom event_id) -> event doc."""
    ids = {str(e) for e in event_ids if e}
    if not ids:
        return {}
    oids = [ObjectId(e) for e in ids if ObjectId.is_valid(e)]
    projection = {"title": 1, "name": 1, "organisation": 1, "organization": 1, "status": 1, "skills": 1,
                  "judging_criteria": 1, "finalized_at": 1, "updated_at": 1, "event_id": 1,
                  "disclose_scores_to_recruiters": 1}
    events = {}
    async for ev in events_col.find({"$or": [{"_id": {"$in": oids}}, {"event_id": {"$in": list(ids)}}]}, projection):
        events[str(ev["_id"])] = ev
        if ev.get("event_id"):
            events[str(ev["event_id"])] = ev
    return events


def _disclosed_scores(event: dict, criteria_scores) -> Optional[list]:
    if event.get("disclose_scores_to_recruiters") is not True or not isinstance(criteria_scores, dict):
        return None
    max_by_name = {}
    for c in event.get("judging_criteria") or []:
        if isinstance(c, dict) and c.get("name"):
            max_by_name[c["name"].strip().lower()] = c.get("max_points")
    return [
        {"criterion": str(name), "score": score, "max": max_by_name.get(str(name).strip().lower())}
        for name, score in criteria_scores.items()
        if isinstance(score, (int, float))
    ]


async def published_evaluations(user_ids: list, cert_docs_by_user: dict) -> tuple:
    """Returns (evaluations_by_user, evaluated_skills_by_user).

    evaluations_by_user: user_id -> [evaluation objects], newest first.
    evaluated_skills_by_user: user_id -> {skill lowercase: [evidence]} from "evaluation"/"award" kinds.
    """
    uids = [u for u in user_ids if u]
    evaluations = {u: [] for u in uids}
    evaluated = {u: {} for u in uids}
    if not uids:
        return evaluations, evaluated

    # Identity maps: participants._id -> user_id, team_id -> member user_ids
    pid_to_uid = {}
    async for p in participants_col.find({"user_id": {"$in": uids}}, {"_id": 1, "user_id": 1}):
        pid_to_uid[str(p["_id"])] = p["user_id"]
    team_to_uids = {}
    async for t in teams_col.find({"members.user_id": {"$in": uids}}, {"_id": 1, "members": 1}):
        members = {str(m.get("user_id")) for m in t.get("members") or [] if isinstance(m, dict)}
        team_to_uids[str(t["_id"])] = [u for u in uids if u in members]
    team_ids = list(team_to_uids)

    def owners(entry: dict) -> list:
        found = set()
        for key in ("user_id", "participant_id"):
            v = str(entry.get(key) or "")
            if v in evaluations:
                found.add(v)
            if v in pid_to_uid:
                found.add(pid_to_uid[v])
        found.update(team_to_uids.get(str(entry.get("team_id") or ""), []))
        return list(found)

    ident = list(uids) + list(pid_to_uid)
    ranked = {}  # (event_id, uid) -> (entry, field_count, source)
    async for r in results_col.find(
        {"$or": [{"final_rankings.user_id": {"$in": uids}}, {"final_rankings.participant_id": {"$in": ident}},
                 {"final_rankings.team_id": {"$in": team_ids}}]},
        {"event_id": 1, "final_rankings": 1},
    ):
        total = len(r.get("final_rankings") or [])
        for entry in r.get("final_rankings") or []:
            if isinstance(entry, dict):
                for uid in owners(entry):
                    ranked[(str(r.get("event_id")), uid)] = (entry, total, "results")
    async for lb in leaderboard_col.find(
        {"$or": [{"participant_id": {"$in": ident}}, {"team_id": {"$in": team_ids}}, {"user_id": {"$in": uids}}]},
    ):
        for uid in owners(lb):
            ranked.setdefault((str(lb.get("event_id")), uid), (lb, None, "leaderboard"))

    submitted = {}  # (event_id, uid) -> submission
    async for s in submissions_col.find(
        {"$or": [{"user_id": {"$in": uids}}, {"participant_id": {"$in": ident}}, {"team_id": {"$in": team_ids}}]},
        {"event_id": 1, "user_id": 1, "participant_id": 1, "team_id": 1, "project_title": 1, "project_name": 1, "submitted_at": 1, "created_at": 1},
    ):
        for uid in owners(s):
            submitted.setdefault((str(s.get("event_id")), uid), s)

    cert_event_ids = {str(c.get("event_id")) for docs in cert_docs_by_user.values() for c in docs if c.get("event_id")}
    event_ids = {k[0] for k in ranked} | {k[0] for k in submitted} | cert_event_ids
    events = await _events_by_ids(event_ids)
    # Events whose finalization wrote results.final_rankings (integration finalize-event)
    # Finalization artifacts: results docs (finalize-event) and issued certificates
    artifact_events = set()
    if event_ids:
        id_list = list(event_ids)
        artifact_events = {str(e) for e in await results_col.distinct("event_id", {"event_id": {"$in": id_list}})}
        artifact_events |= {str(e) for e in await event_certificates_col.distinct(
            "event_id", {"event_id": {"$in": id_list}, "status": {"$ne": "revoked"}})}

    def published(event_id, event) -> bool:
        ids = {event_id, str((event or {}).get("_id") or ""), str((event or {}).get("event_id") or "")}
        return _is_published(event, bool(ids & artifact_events))

    seen_evidence = {}  # uid -> {(skill, event key)}: one evidence item per event per skill

    def add_evaluated(uid, event, evidence, event_key):
        for tag in _event_tags(event or {}):
            key = (tag, event_key)
            if key in seen_evidence.setdefault(uid, set()):
                continue
            seen_evidence[uid].add(key)
            evaluated[uid].setdefault(tag, []).append(evidence)

    for (event_id, uid), (entry, total, source) in ranked.items():
        event = events.get(event_id)
        if not published(event_id, event):
            continue
        # Leaderboard rows are rewritten live while judging; trust them only for events finalized with finalized_at
        if source == "leaderboard" and not event.get("finalized_at"):
            continue
        rank = entry.get("rank")
        item = {
            "evaluation_id": f"res:{event_id}:{uid}",
            "kind": "evaluation",
            "opportunity_title": event.get("title") or event.get("name") or "",
            "organization_name": event.get("organisation") or event.get("organization") or None,
            "project_title": _str_or_none(entry.get("project_title") or entry.get("project_name")),
            "evaluated_at": _iso(event.get("finalized_at") or entry.get("finalized_at") or entry.get("created_at") or event.get("updated_at")),
            # Neutral: ranking rows carry code-derived labels (main.py marks rank <= 3 "Winner"), so award
            # labels come only from certificates (kind "award", final_status = achievement_key)
            "final_status": "ranked",
            "result": (f"Rank {rank} of {total}" if total else f"Rank {rank}") if rank else None,
            "scores": _disclosed_scores(event, entry.get("criteria_scores")),
        }
        evaluations[uid].append(item)
        add_evaluated(uid, event, {"type": "evaluation", "ref_id": item["evaluation_id"], "title": item["opportunity_title"]}, event_id)

    for (event_id, uid), sub in submitted.items():
        event = events.get(event_id)
        if not published(event_id, event):
            continue
        evaluations[uid].append({
            "evaluation_id": f"sub:{sub['_id']}:{uid}",
            "kind": "submission",
            "opportunity_title": event.get("title") or event.get("name") or "",
            "organization_name": event.get("organisation") or event.get("organization") or None,
            "project_title": _str_or_none(sub.get("project_title") or sub.get("project_name")),
            "evaluated_at": _iso(event.get("finalized_at") or event.get("updated_at")),
            "final_status": "submitted",
            "result": None,
            "scores": None,
        })

    for uid, docs in cert_docs_by_user.items():
        if uid not in evaluations:
            continue
        for c in docs:
            key = str(c.get("achievement_key") or "").lower()
            if key in AWARD_KEYS:
                kind = "award"
            elif key in PARTICIPATION_KEYS:
                kind = "participation"
            else:
                continue  # organizer / mentor certificates are not builder results
            event = events.get(str(c.get("event_id"))) or {}
            item = {
                "evaluation_id": f"cert:{c.get('certificate_id')}",
                "kind": kind,
                "opportunity_title": c.get("event_title") or event.get("title") or "",
                "organization_name": c.get("organization_name") or event.get("organisation") or None,
                "project_title": None,
                "evaluated_at": _iso(c.get("issued_date")),
                "final_status": key,
                "result": f"Rank {c['rank']}" if c.get("rank") else None,
                "scores": None,
            }
            evaluations[uid].append(item)
            if kind == "award":
                add_evaluated(uid, event, {"type": "evaluation", "ref_id": item["evaluation_id"], "title": item["opportunity_title"]},
                              str(c.get("event_id") or item["evaluation_id"]))

    for uid in evaluations:
        evaluations[uid].sort(key=lambda e: e.get("evaluated_at") or "", reverse=True)
    return evaluations, evaluated


def validate_talent_profile(data: dict, items: dict, skill_names: list) -> dict:
    """Validate the builder's PUT /talent-profile body -> learner_profiles $set fields. Raises ValueError."""
    update = {}
    if "open_to_opportunities" in data:
        if not isinstance(data["open_to_opportunities"], bool):
            raise ValueError("open_to_opportunities must be true or false")
        update["openToOpportunities"] = data["open_to_opportunities"]
    if "availability" in data:
        value = data["availability"]
        if value not in AVAILABILITY_VALUES and value is not None:
            raise ValueError(f"availability must be one of {', '.join(AVAILABILITY_VALUES)} or null")
        update["availability"] = value
    if "preferred_role" in data:
        value = data["preferred_role"]
        if value is not None and not isinstance(value, str):
            raise ValueError("preferred_role must be a string")
        value = (value or "").strip()
        if len(value) > 120:
            raise ValueError("preferred_role too long (max 120)")
        update["preferredRole"] = value or None
    if "skill_evidence" in data:
        raw = data["skill_evidence"]
        if not isinstance(raw, list) or len(raw) > MAX_SKILL_EVIDENCE:
            raise ValueError(f"skill_evidence must be a list of at most {MAX_SKILL_EVIDENCE} entries")
        known = {s.lower(): s for s in skill_names}
        cleaned = []
        for entry in raw:
            if not isinstance(entry, dict):
                raise ValueError("skill_evidence entries must be objects")
            skill = known.get(str(entry.get("skill") or "").strip().lower())
            if not skill:
                raise ValueError(f"Unknown skill '{entry.get('skill')}': add it to your skills first")
            links = entry.get("links") or []
            if not isinstance(links, list) or len(links) > MAX_EVIDENCE_LINKS:
                raise ValueError(f"Each skill can link at most {MAX_EVIDENCE_LINKS} items")
            clean_links = []
            for link in links:
                if not isinstance(link, dict):
                    raise ValueError("links must be objects")
                key = (link.get("type"), link.get("ref_id"))
                if key not in items:
                    raise ValueError(f"Unknown {key[0] or 'item'} '{key[1]}'")
                if key not in {(l["type"], l["ref_id"]) for l in clean_links}:
                    clean_links.append({"type": key[0], "ref_id": key[1], "title": items[key]})
            if clean_links:
                cleaned = [e for e in cleaned if e["skill"] != skill] + [{"skill": skill, "links": clean_links}]
        update["skillEvidence"] = cleaned
    return update
