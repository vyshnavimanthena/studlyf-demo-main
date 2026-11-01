from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel
from pymongo import DESCENDING, ASCENDING
import math

from auth_institution import get_auth_user, get_auth_user_optional
from db import (
    db, course_submissions_col, course_evaluations_col, course_rubrics_col,
    courses_col, enrollments_col, progress_col, users_col,
)

course_projects_router = APIRouter(prefix="/api", tags=["Course Projects"])

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _fix_id(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    if doc and "created_at" in doc and isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    if doc and "updated_at" in doc and isinstance(doc.get("updated_at"), datetime):
        doc["updated_at"] = doc["updated_at"].isoformat()
    if doc and "evaluated_at" in doc and isinstance(doc.get("evaluated_at"), datetime):
        doc["evaluated_at"] = doc["evaluated_at"].isoformat()
    return doc


def _serialize_submission(sub: dict) -> dict:
    return _fix_id(sub)


def _serialize_evaluation(ev: dict) -> dict:
    return _fix_id(ev)


async def _get_author_info(user_id: str) -> dict:
    user = await users_col.find_one({"user_id": user_id})
    if user:
        return {
            "author_name": user.get("full_name") or user.get("name") or user.get("email", "Unknown"),
            "author_avatar": user.get("profilePhoto") or user.get("avatar") or user.get("photo_url"),
        }
    return {"author_name": "Unknown", "author_avatar": None}


VALID_STATUSES = {"submitted", "under_review", "evaluated", "needs_revision", "resubmitted"}
DEFAULT_RUBRIC = [
    {"name": "Code Quality", "max_score": 25, "description": "Clean code, naming conventions, project structure"},
    {"name": "Functionality", "max_score": 25, "description": "Features work as described, no critical bugs"},
    {"name": "UI/UX Design", "max_score": 20, "description": "Design quality, responsiveness, accessibility"},
    {"name": "Documentation", "max_score": 15, "description": "README, code comments, inline documentation"},
    {"name": "Innovation", "max_score": 15, "description": "Creativity, problem-solving approach, uniqueness"},
]


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class ProjectSubmissionCreate(BaseModel):
    title: str
    description: str
    deployed_link: str
    github_link: Optional[str] = None
    video_url: Optional[str] = None
    screenshots: List[str] = []
    tech_stack: List[str] = []

class ProjectEvaluationCreate(BaseModel):
    scores: dict  # {"Code Quality": 20, "Functionality": 22, ...}
    total_score: float
    feedback: str
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    status: str = "evaluated"  # evaluated | needs_revision

class RubricUpdate(BaseModel):
    criteria: List[dict]  # [{"name": "...", "max_score": 25, "description": "..."}]

class StatusUpdate(BaseModel):
    status: str


# ─── 1. Student: Submit Project ───────────────────────────────────────────────

@course_projects_router.post("/courses/{course_id}/submit-project")
async def submit_course_project(course_id: str, data: ProjectSubmissionCreate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        course = await courses_col.find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

        enrollment = await enrollments_col.find_one({"user_id": user["user_id"], "course_id": course_id})
        if not enrollment:
            raise HTTPException(status_code=403, detail="You must be enrolled in this course")

        existing = await course_submissions_col.find_one({
            "user_id": user["user_id"], "course_id": course_id, "title": data.title.strip()
        })
        if existing:
            raise HTTPException(status_code=409, detail="You already submitted a project with this title")

        author_info = await _get_author_info(user["user_id"])
        now = datetime.utcnow()

        submission = {
            "user_id": user["user_id"],
            "course_id": course_id,
            "course_title": course.get("title", "Unknown Course"),
            "title": data.title.strip(),
            "description": data.description.strip(),
            "deployed_link": data.deployed_link.strip(),
            "github_link": data.github_link.strip() if data.github_link else None,
            "video_url": data.video_url.strip() if data.video_url else None,
            "screenshots": data.screenshots,
            "tech_stack": [t.strip() for t in data.tech_stack if t.strip()],
            "status": "submitted",
            "created_at": now,
            "updated_at": now,
            **author_info,
        }

        result = await course_submissions_col.insert_one(submission)
        submission["id"] = str(result.inserted_id)
        del submission["_id"]

        return {"status": "success", "submission": submission}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 2. Student: My Submissions ───────────────────────────────────────────────

@course_projects_router.get("/courses/{course_id}/my-projects")
async def my_course_projects(course_id: str, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        subs = await course_submissions_col.find(
            {"user_id": user["user_id"], "course_id": course_id}
        ).sort("created_at", DESCENDING).to_list(length=100)

        results = []
        for s in subs:
            sub = _serialize_submission(s)
            ev = await course_evaluations_col.find_one({"submission_id": sub["id"]})
            sub["evaluation"] = _serialize_evaluation(ev) if ev else None
            results.append(sub)

        return {"submissions": results, "total": len(results)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 3. Admin/Mentor: List All Submissions (any course) ───────────────────────

@course_projects_router.get("/courses/all/projects")
async def list_all_course_projects(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_auth_user),
):
    try:
        query = {}
        if status:
            query["status"] = status

        skip = (page - 1) * limit
        total = await course_submissions_col.count_documents(query)
        subs = await course_submissions_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit).to_list(length=limit)

        results = []
        for s in subs:
            sub = _serialize_submission(s)
            ev = await course_evaluations_col.find_one({"submission_id": sub["id"]})
            sub["evaluation"] = _serialize_evaluation(ev) if ev else None
            results.append(sub)

        return {
            "submissions": results,
            "total": total,
            "page": page,
            "pages": math.ceil(total / limit) if total else 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 3b. Admin/Mentor: List All Submissions for a Specific Course ─────────────

@course_projects_router.get("/courses/{course_id}/projects")
async def list_course_projects(
    course_id: str,
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_auth_user),
):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        query = {"course_id": course_id}
        if status:
            query["status"] = status

        skip = (page - 1) * limit
        total = await course_submissions_col.count_documents(query)
        subs = await course_submissions_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit).to_list(length=limit)

        results = []
        for s in subs:
            sub = _serialize_submission(s)
            ev = await course_evaluations_col.find_one({"submission_id": sub["id"]})
            sub["evaluation"] = _serialize_evaluation(ev) if ev else None
            results.append(sub)

        return {
            "submissions": results,
            "total": total,
            "page": page,
            "pages": math.ceil(total / limit) if total else 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 4. Get Single Submission ─────────────────────────────────────────────────

@course_projects_router.get("/projects/{submission_id}")
async def get_submission(submission_id: str, user: Optional[dict] = Depends(get_auth_user_optional)):
    try:
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID")

        sub = await course_submissions_col.find_one({"_id": ObjectId(submission_id)})
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")

        sub = _serialize_submission(sub)

        ev = await course_evaluations_col.find_one({"submission_id": sub["id"]})
        sub["evaluation"] = _serialize_evaluation(ev) if ev else None

        return {"submission": sub}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 5. Admin/Mentor: Evaluate Submission ─────────────────────────────────────

@course_projects_router.post("/projects/{submission_id}/evaluate")
async def evaluate_submission(submission_id: str, data: ProjectEvaluationCreate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID")

        sub = await course_submissions_col.find_one({"_id": ObjectId(submission_id)})
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")

        existing = await course_evaluations_col.find_one({"submission_id": submission_id})
        if existing:
            raise HTTPException(status_code=409, detail="Already evaluated. Use PUT to update.")

        now = datetime.utcnow()
        evaluation = {
            "submission_id": submission_id,
            "course_id": str(sub["course_id"]),
            "user_id": sub["user_id"],
            "evaluator_id": user["user_id"],
            "evaluator_name": user.get("email", "Admin"),
            "scores": data.scores,
            "total_score": data.total_score,
            "feedback": data.feedback.strip(),
            "strengths": data.strengths.strip() if data.strengths else None,
            "improvements": data.improvements.strip() if data.improvements else None,
            "status": data.status,
            "created_at": now,
            "updated_at": now,
        }

        result = await course_evaluations_col.insert_one(evaluation)
        evaluation["id"] = str(result.inserted_id)
        del evaluation["_id"]

        new_status = data.status if data.status in VALID_STATUSES else "evaluated"
        await course_submissions_col.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"status": new_status, "updated_at": now}}
        )

        return {"status": "success", "evaluation": evaluation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 6. Admin/Mentor: Update Evaluation ───────────────────────────────────────

@course_projects_router.put("/projects/{submission_id}/evaluate")
async def update_evaluation(submission_id: str, data: ProjectEvaluationCreate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID")

        existing = await course_evaluations_col.find_one({"submission_id": submission_id})
        if not existing:
            raise HTTPException(status_code=404, detail="No evaluation found. Use POST to create.")

        now = datetime.utcnow()
        update = {
            "$set": {
                "scores": data.scores,
                "total_score": data.total_score,
                "feedback": data.feedback.strip(),
                "strengths": data.strengths.strip() if data.strengths else None,
                "improvements": data.improvements.strip() if data.improvements else None,
                "status": data.status,
                "evaluator_id": user["user_id"],
                "evaluator_name": user.get("email", "Admin"),
                "updated_at": now,
            }
        }

        await course_evaluations_col.update_one({"_id": existing["_id"]}, update)
        new_status = data.status if data.status in VALID_STATUSES else "evaluated"
        await course_submissions_col.update_one(
            {"_id": ObjectId(submission_id)},
            {"$set": {"status": new_status, "updated_at": now}}
        )

        ev = await course_evaluations_col.find_one({"_id": existing["_id"]})
        return {"status": "success", "evaluation": _serialize_evaluation(ev)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 7. Delete Submission ─────────────────────────────────────────────────────

@course_projects_router.delete("/projects/{submission_id}")
async def delete_submission(submission_id: str, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(submission_id):
            raise HTTPException(status_code=400, detail="Invalid submission ID")

        sub = await course_submissions_col.find_one({"_id": ObjectId(submission_id)})
        if not sub:
            raise HTTPException(status_code=404, detail="Submission not found")

        is_owner = sub.get("user_id") == user["user_id"]
        is_admin = user.get("role") in ("admin", "super_admin", "institution")
        if not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Not authorized")

        await course_submissions_col.delete_one({"_id": ObjectId(submission_id)})
        await course_evaluations_col.delete_one({"submission_id": submission_id})

        return {"status": "success", "message": "Submission deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 8. Get Rubric for Course ─────────────────────────────────────────────────

@course_projects_router.get("/courses/{course_id}/rubrics")
async def get_rubric(course_id: str):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        rubric = await course_rubrics_col.find_one({"course_id": course_id})
        if rubric:
            return {"rubric": _fix_id(rubric)}

        return {"rubric": {"course_id": course_id, "criteria": DEFAULT_RUBRIC}}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 9. Admin: Create/Update Rubric ───────────────────────────────────────────

@course_projects_router.post("/courses/{course_id}/rubrics")
async def upsert_rubric(course_id: str, data: RubricUpdate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")

        if user.get("role") not in ("admin", "super_admin", "institution"):
            raise HTTPException(status_code=403, detail="Admin access required")

        now = datetime.utcnow()
        rubric = {
            "course_id": course_id,
            "criteria": data.criteria,
            "updated_at": now,
        }

        existing = await course_rubrics_col.find_one({"course_id": course_id})
        if existing:
            await course_rubrics_col.update_one(
                {"_id": existing["_id"]},
                {"$set": {"criteria": data.criteria, "updated_at": now}}
            )
            rubric["id"] = str(existing["_id"])
        else:
            rubric["created_at"] = now
            result = await course_rubrics_col.insert_one(rubric)
            rubric["id"] = str(result.inserted_id)
            del rubric["_id"]

        return {"status": "success", "rubric": rubric}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── 10. Admin: Stats Dashboard ───────────────────────────────────────────────

@course_projects_router.get("/admin/course-projects/stats")
async def course_project_stats(user: dict = Depends(get_auth_user)):
    try:
        total_submissions = await course_submissions_col.count_documents({})
        submitted = await course_submissions_col.count_documents({"status": "submitted"})
        under_review = await course_submissions_col.count_documents({"status": "under_review"})
        evaluated = await course_submissions_col.count_documents({"status": "evaluated"})
        needs_revision = await course_submissions_col.count_documents({"status": "needs_revision"})

        pipeline = [
            {"$addFields": {"_id_str": {"$toString": "$_id"}}},
            {"$lookup": {
                "from": "course_evaluations",
                "localField": "_id_str",
                "foreignField": "submission_id",
                "as": "eval",
            }},
            {"$unwind": {"path": "$eval", "preserveNullAndEmptyArrays": False}},
            {"$group": {
                "_id": None,
                "avg_score": {"$avg": "$eval.total_score"},
                "max_score": {"$max": "$eval.total_score"},
                "min_score": {"$min": "$eval.total_score"},
            }},
        ]
        agg = await course_submissions_col.aggregate(pipeline).to_list(length=1)
        scores = agg[0] if agg else {}

        pipeline_by_course = [
            {"$addFields": {"course_id_str": {"$toString": "$course_id"}}},
            {"$group": {
                "_id": "$course_title",
                "count": {"$sum": 1},
            }},
            {"$sort": {"count": DESCENDING}},
            {"$limit": 10},
        ]
        by_course = await course_submissions_col.aggregate(pipeline_by_course).to_list(length=10)

        return {
            "total_submissions": total_submissions,
            "by_status": {
                "submitted": submitted,
                "under_review": under_review,
                "evaluated": evaluated,
                "needs_revision": needs_revision,
            },
            "score_stats": {
                "average": round(scores.get("avg_score", 0) or 0, 1),
                "highest": scores.get("max_score", 0) or 0,
                "lowest": scores.get("min_score", 0) or 0,
            },
            "by_course": [{"course": c["_id"], "count": c["count"]} for c in by_course],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
