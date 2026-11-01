"""
Builder dashboard (PRD 4.6-4.7): profile completeness, next actions and opportunity matching.

Completeness formula (weights sum to 100; a section scores its full weight only when it holds
useful information - filler text, empty entries and placeholder links score nothing):

A "real word" has >= 3 letters, contains a vowel and is not filler; text must also be mostly
distinct words (repeated short-token runs are rejected).

  basic       15  name + a real headline/about: bio with >= 8 real words (>= 5 distinct)
                  OR career goal with >= 4 real words (>= 3 distinct)
  skills      10  >= 3 distinct real skills (a vowel and >= 2 letters, or a known short skill: SQL, C, Go...)
  evidence    20  >= min(2, real skills) real skills whose evidence is a published evaluation or a
                  link to a REAL project/experience (explicit links only)
  projects    20  >= 1 project (profile or SDL) with a real description (>= 8 real words) AND a repo
                  or demo URL with a real-looking host (label >= 3 chars, or a path)
  background  15  education with a real institution + degree (or a known short degree: BSc, MBA...),
                  OR an experience with a real role + organization
  links       10  linkedin.com/<path>, github.com/<path> or a GitHub username, or a portfolio URL with a
                  real-looking host
  preferences 10  a real preferred role AND availability (set in Preferences)

score = sum of weights of completed sections. An empty profile scores 0; a profile with every
optional field filled with filler scores at most 10 (skills).

Bonus (only with PROJECT_CONTRIBUTIONS on, contributions passed in):
  contribution +5  "My contribution" on >= 1 project with a real role AND a real summary
                   (>= 8 real words, >= 5 distinct). The score is capped at 100.
"""
import re
from datetime import datetime, timezone
from typing import Optional

FILLER_WORDS = {
    "test", "testing", "lorem", "ipsum", "dolor", "asdf", "qwerty", "na", "none", "nil", "abc", "xyz",
    "dummy", "sample", "hello", "hi", "todo", "tbd", "xxx", "aaa", "blah", "demo", "placeholder", "foo", "bar",
}
VOWEL_RE = re.compile(r"[aeiouy]", re.IGNORECASE)
URL_RE = re.compile(r"^(?:https?://)?(?:www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(/\S*)?$", re.IGNORECASE)
GITHUB_HANDLE_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$")
# Real skills/degrees that are short or vowel-less; anything else needs a vowel and >= 2 letters
SHORT_SKILLS = {
    "c", "r", "go", "c#", "c++", "f#", "js", "ts", "ui", "ux", "ai", "ml", "qa", "ar", "vr", "db", "cv", "ci", "cd", "bi",
    "sql", "css", "html", "php", "nlp", "gcp", "aws", "k8s", "dsa", "rpa", "tdd", "mvc", "xml", "nlu", "gpu", "llm", "scss",
}
SHORT_DEGREES = {"ba", "bs", "ma", "ms", "be", "me", "bsc", "msc", "mba", "phd", "bba", "bca", "mca", "btech", "mtech", "bcom", "mcom"}


def _words(text) -> list:
    """Real-looking words: >= 3 letters, containing a vowel, not on the filler list."""
    words = [w.lower() for w in re.findall(r"[A-Za-z]{3,}", str(text or ""))]
    return [w for w in words if VOWEL_RE.search(w) and w not in FILLER_WORDS]


SECTIONS = [
    # key, label, weight, hint (shown when not done)
    ("basic", "Headline & about", 15, "Write a short about section (at least 8 words) or career goal."),
    ("skills", "Skills", 10, "List at least 3 skills you actually use."),
    ("evidence", "Skills with evidence", 20, "Link your skills to the projects or experience that prove them."),
    ("projects", "Projects", 20, "Add a project with a real description and a repo or demo link."),
    ("background", "Education or experience", 15, "Add your education (institution and degree) or a work experience."),
    ("links", "Professional links", 10, "Add a LinkedIn, GitHub or portfolio link."),
    ("preferences", "Career preferences", 10, "Set your preferred role and availability."),
]
BONUS_SECTION = ("contribution", "Project contribution", 5, "Describe your role and contribution on a project.")
SECTION_MODULE = {
    "contribution": "projects",
    "basic": "about", "skills": "skills", "evidence": "preferences", "projects": "projects",
    "background": "education", "links": "social", "preferences": "preferences",
}


def meaningful(text, min_words: int, min_distinct: int) -> bool:
    """Enough real words, and mostly distinct (rejects repeated short-token runs)."""
    words = _words(text)
    return len(words) >= min_words and len(set(words)) >= min_distinct and len(set(words)) * 2 >= len(words)


def plausible_url(value, host: Optional[str] = None) -> bool:
    """A URL-ish value whose host looks real: the registrable label has >= 3 chars, or it has a path.
    With host given (e.g. linkedin.com), it must be that site and have a path."""
    value = str(value or "").strip()
    m = URL_RE.match(value) if value and " " not in value else None
    if not m:
        return False
    domain, path = m.group(1).lower(), (m.group(2) or "").strip("/")
    if host:
        return (domain == host or domain.endswith("." + host)) and len(path) >= 2
    label = domain.split(".")[-2]
    return len(label) >= 3 or len(path) >= 2


def _real_value(value) -> bool:
    """A short label (name, institution, role...) that is not empty, filler or keyboard noise."""
    return bool(_words(value)) or bool(re.fullmatch(r"[A-Z]{3,6}( [A-Za-z]+)*", str(value or "").strip()))


def _real_name(value) -> bool:
    value = str(value or "").strip()
    return len(re.sub(r"[^A-Za-z]", "", value)) >= 2 and value.lower() not in FILLER_WORDS


def _real_degree(value) -> bool:
    return _real_value(value) or re.sub(r"[^a-z]", "", str(value or "").lower()) in SHORT_DEGREES


def _real_skill(name) -> bool:
    name = str(name or "").strip().lower()
    letters = re.sub(r"[^a-z]", "", name)
    return name in SHORT_SKILLS or (len(letters) >= 2 and bool(VOWEL_RE.search(letters)) and name not in FILLER_WORDS)


def _github_handle(value) -> bool:
    value = str(value or "").strip()
    return len(value) >= 3 and bool(re.search(r"[A-Za-z]", value)) and value.lower() not in FILLER_WORDS and bool(GITHUB_HANDLE_RE.match(value))


def _real_project(p: dict) -> bool:
    return meaningful(p.get("description"), 8, 5) and (plausible_url(p.get("repo_url")) or plausible_url(p.get("demo_url")))


def compute_completeness(profile: dict, user: dict, projects: list, experience: list, skills_detailed: list,
                         contributions: Optional[list] = None) -> dict:
    """contributions: None = feature off (no bonus section, response unchanged)."""
    name = f"{profile.get('firstName') or ''} {profile.get('lastName') or ''}".strip() or (user or {}).get("full_name") or ""
    real_skills = [s for s in skills_detailed if _real_skill(s["name"])]
    # Evidence only counts when it points at something real: a published evaluation, a real project or a real experience
    real_refs = {("project", p["id"]) for p in projects if _real_project(p)}
    real_refs |= {("experience", e["id"]) for e in experience if _real_value(e.get("title")) and _real_value(e.get("organization"))}
    backed = [
        s for s in real_skills
        if any(e["type"] == "evaluation" or (e["type"], e["ref_id"]) in real_refs for e in s["evidence"])
    ]
    edu = profile.get("education") if isinstance(profile.get("education"), dict) else {}
    edu_entries = [edu] + [e for e in profile.get("educationList") or [] if isinstance(e, dict)]

    done = {
        "basic": _real_name(name) and (meaningful(profile.get("bio"), 8, 5) or meaningful(profile.get("careerGoal"), 4, 3)),
        "skills": len({s["name"].lower() for s in real_skills}) >= 3,
        "evidence": bool(real_skills) and len(backed) >= min(2, len(real_skills)),
        "projects": any(_real_project(p) for p in projects),
        "background": any(_real_value(e.get("institution")) and _real_degree(e.get("degree")) for e in edu_entries)
        or any(_real_value(e.get("title")) and _real_value(e.get("organization")) for e in experience),
        "links": plausible_url(profile.get("linkedin"), "linkedin.com") or plausible_url(profile.get("github"), "github.com")
        or _github_handle(profile.get("github")) or plausible_url(profile.get("portfolio")),
        "preferences": meaningful(profile.get("preferredRole"), 1, 1) and bool(profile.get("availability")),
    }
    sections = [
        {"key": key, "label": label, "done": bool(done[key]), "weight": weight, "hint": hint,
         "module": SECTION_MODULE[key]}
        for key, label, weight, hint in SECTIONS
    ]
    if contributions is not None:
        key, label, weight, hint = BONUS_SECTION
        done_bonus = any(_real_value(c.get("role")) and meaningful(c.get("summary"), 8, 5) for c in contributions)
        sections.append({"key": key, "label": label, "done": done_bonus, "weight": weight, "hint": hint,
                         "module": SECTION_MODULE[key], "bonus": True})
    return {"score": min(100, sum(s["weight"] for s in sections if s["done"])), "sections": sections}


def opportunity_skills(opp: dict) -> list:
    raw = []
    for field in ("skills", "tags"):
        value = opp.get(field)
        if isinstance(value, str):
            raw.extend(value.split(","))
        elif isinstance(value, list):
            raw.extend(v for v in value if isinstance(v, str))
    seen, out = set(), []
    for v in raw:
        v = v.strip()
        if v and v.lower() not in seen:
            seen.add(v.lower())
            out.append(v)
    return out


def _parse_dt(value) -> Optional[datetime]:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if value:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            return None
    return None


def days_until(value) -> Optional[int]:
    dt = _parse_dt(value)
    if not dt:
        return None
    seconds = (dt - datetime.now(timezone.utc)).total_seconds()
    return None if seconds < 0 else int((seconds + 86399) // 86400)


def recommend_opportunities(opportunities: list, skill_names: list, applied_ids: set, limit: int = 4) -> list:
    """Open opportunities sharing at least one skill with the builder (exact, case-insensitive)."""
    mine = {s.lower(): s for s in skill_names}
    scored = []
    for opp in opportunities:
        oid = str(opp.get("_id"))
        if oid in applied_ids:
            continue
        deadline = opp.get("deadline")
        days_left = days_until(deadline)
        if deadline and _parse_dt(deadline) and days_left is None:
            continue  # deadline passed (public listing may still show it during an extension)
        matched = [mine[s.lower()] for s in opportunity_skills(opp) if s.lower() in mine]
        if not matched:
            continue
        reason = f"Matches your skill{'s' if len(matched) > 1 else ''}: {', '.join(matched[:3])}"
        if days_left is not None:
            reason += f" · closes in {days_left} day{'s' if days_left != 1 else ''}" if days_left else " · closes today"
        scored.append((-len(matched), days_left if days_left is not None else 10 ** 6, {
            "opportunity_id": oid,
            "title": opp.get("title") or "",
            "organization": opp.get("organization") or opp.get("institution_profile_name") or None,
            "type": opp.get("type") or None,
            "deadline": _parse_dt(deadline).isoformat() if _parse_dt(deadline) else None,
            "days_left": days_left,
            "matched_skills": matched,
            "reason": reason,
        }))
    scored.sort(key=lambda x: (x[0], x[1]))
    return [item for _, _, item in scored[:limit]]


def build_next_actions(completeness: dict, skills_detailed: list, has_linkables: bool, pending_invitations: int,
                       upcoming: list, recruiter_visible: bool, limit: int = 3) -> list:
    actions = []
    if pending_invitations:
        actions.append({
            "key": "invitations", "kind": "invitation",
            "title": f"Respond to {pending_invitations} recruiter invitation{'s' if pending_invitations > 1 else ''}",
            "detail": "Recruiters are waiting for your reply. Invitations expire after 30 days.",
            "href": "/opportunities/invitations",
        })
    soon = [u for u in upcoming if u.get("days_left") is not None and u["days_left"] <= 7]
    if soon:
        u = soon[0]
        when = "today" if u["days_left"] == 0 else f"in {u['days_left']} day{'s' if u['days_left'] != 1 else ''}"
        actions.append({
            "key": f"deadline:{u.get('opportunity_id')}", "kind": "deadline",
            "title": f"Deadline {when} for {u.get('title') or 'an opportunity'}",
            "detail": u.get("next_label") or "Registration deadline",
            "href": f"/opportunities/{u.get('opportunity_id')}",
        })
    unbacked = [s["name"] for s in skills_detailed if s["level"] == "self_reported"]
    if unbacked and has_linkables:
        actions.append({
            "key": "evidence", "kind": "profile",
            "title": f"Link evidence to {unbacked[0]}",
            "detail": "Recruiters trust skills that point to your own projects or experience.",
            "href": "/dashboard/profile?view=profile&section=preferences",
        })
    if not recruiter_visible and completeness["score"] >= 60:
        actions.append({
            "key": "visibility", "kind": "profile",
            "title": "Turn on recruiter visibility",
            "detail": "Your profile is strong enough for recruiters on STUDLYF to find you.",
            "href": "/dashboard/profile?view=profile&section=preferences",
        })
    covered = {"evidence"} if any(a["key"] == "evidence" for a in actions) else set()
    for section in sorted(completeness["sections"], key=lambda s: -s["weight"]):
        if section["done"] or section["key"] in covered:
            continue
        actions.append({
            "key": f"complete:{section['key']}", "kind": "profile",
            "title": section["hint"].rstrip("."),
            "detail": f"{section['label']} · +{section['weight']} completeness",
            "href": f"/dashboard/profile?view=profile&section={section['module']}",
        })
    return actions[:limit]
