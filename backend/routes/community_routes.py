from fastapi import APIRouter, HTTPException, Body, Query, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel
from pymongo import DESCENDING, ASCENDING
import math

from auth_institution import get_auth_user, get_auth_user_optional
from db import db

community_router = APIRouter(prefix="/api/community", tags=["Community Projects"])

# ─── Collections ──────────────────────────────────────────────────────────────
posts_col = db["community_posts"]
votes_col = db["community_votes"]
comments_col = db["community_comments"]
saves_col = db["community_saves"]

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class CommunityPostCreate(BaseModel):
    title: str
    description: str
    category: str
    tags: List[str] = []
    github_link: Optional[str] = None
    website_link: Optional[str] = None
    video_url: Optional[str] = None
    cover_image: Optional[str] = None
    project_type: str = "project"

class CommunityCommentCreate(BaseModel):
    post_id: str
    content: str
    parent_comment_id: Optional[str] = None

class VoteRequest(BaseModel):
    direction: str  # "up" | "down" | "none"

# ─── Helpers ──────────────────────────────────────────────────────────────────

VALID_CATEGORIES = {
    "web", "mobile", "ai-ml", "blockchain", "devtools",
    "gaming", "iot", "fintech", "healthtech", "education", "other"
}

def _serialize_post(post: dict, user_id: Optional[str] = None) -> dict:
    post["id"] = str(post.pop("_id"))
    if "created_at" in post and post["created_at"]:
        post["created_at"] = post["created_at"].isoformat()
    if "updated_at" in post and post["updated_at"]:
        post["updated_at"] = post["updated_at"].isoformat()
    return post

def _calc_trending_score(post: dict) -> float:
    upvotes = post.get("upvotes", 0)
    downvotes = post.get("downvotes", 0)
    comment_count = post.get("comment_count", 0)
    view_count = post.get("view_count", 0)
    created = post.get("created_at")
    if isinstance(created, datetime):
        hours_since = (datetime.utcnow() - created).total_seconds() / 3600
    else:
        hours_since = 0
    return (upvotes - downvotes) + (comment_count * 2) + (view_count * 0.1) - (hours_since * 0.5)

async def _attach_user_status(post: dict, user_id: Optional[str]) -> dict:
    if not user_id:
        post["user_vote"] = None
        post["is_saved"] = False
        return post
    vote = await votes_col.find_one({"user_id": user_id, "post_id": post["id"]})
    post["user_vote"] = vote.get("direction") if vote else None
    post["is_saved"] = (await saves_col.find_one({"user_id": user_id, "post_id": post["id"]})) is not None
    return post

async def _get_author_info(author_id: str) -> dict:
    from db import users_col, user_profiles_col
    user = await users_col.find_one({"user_id": author_id})
    if user:
        name = user.get("full_name") or user.get("name") or "Anonymous"
        return {
            "author_id": author_id,
            "author_name": name,
            "author_avatar": user.get("avatar") or user.get("photo_url"),
        }
    return {"author_id": author_id, "author_name": "Unknown", "author_avatar": None}

# ─── 1. Create Post ──────────────────────────────────────────────────────────

@community_router.post("/posts")
async def create_post(data: CommunityPostCreate, user: dict = Depends(get_auth_user)):
    try:
        if data.category not in VALID_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}")

        author_info = await _get_author_info(user["user_id"])
        now = datetime.utcnow()

        post = {
            "title": data.title.strip(),
            "description": data.description.strip(),
            "category": data.category,
            "tags": [t.strip().lower() for t in data.tags if t.strip()],
            "github_link": data.github_link,
            "website_link": data.website_link,
            "video_url": data.video_url,
            "cover_image": data.cover_image,
            "project_type": data.project_type,
            "upvotes": 0,
            "downvotes": 0,
            "comment_count": 0,
            "view_count": 0,
            "share_count": 0,
            "created_at": now,
            "updated_at": now,
            **author_info,
        }

        result = await posts_col.insert_one(post)
        post["id"] = str(result.inserted_id)
        del post["_id"]
        return {"status": "success", "post": post}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 2. List Posts ────────────────────────────────────────────────────────────

@community_router.get("/posts")
async def list_posts(
    sort: str = Query("trending"),
    category: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: Optional[dict] = Depends(get_auth_user_optional),
):
    try:
        query = {}
        if category:
            query["category"] = category
        if tag:
            query["tags"] = tag.strip().lower()
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        skip = (page - 1) * limit

        if sort == "newest":
            cursor = posts_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
            posts = [_serialize_post(p) for p in await cursor.to_list(length=limit)]
        elif sort == "top":
            cursor = posts_col.find(query).sort("upvotes", DESCENDING).skip(skip).limit(limit)
            posts = [_serialize_post(p) for p in await cursor.to_list(length=limit)]
        else:
            # trending - fetch more candidates then sort by score in Python
            all_posts = await posts_col.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit * 3).to_list(length=limit * 3)
            posts = [_serialize_post(p) for p in all_posts]
            posts.sort(key=_calc_trending_score, reverse=True)
            posts = posts[:limit]

        total = await posts_col.count_documents(query)
        user_id = user.get("user_id") if user else None
        for p in posts:
            await _attach_user_status(p, user_id)

        return {
            "posts": posts,
            "total": total,
            "page": page,
            "pages": math.ceil(total / limit) if total else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 3. Get Single Post ──────────────────────────────────────────────────────

@community_router.get("/posts/{post_id}")
async def get_post(post_id: str, user: Optional[dict] = Depends(get_auth_user_optional)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        await posts_col.update_one({"_id": ObjectId(post_id)}, {"$inc": {"view_count": 1}})
        post["view_count"] = post.get("view_count", 0) + 1

        post = _serialize_post(post)

        # Fetch threaded comments
        raw_comments = await comments_col.find({"post_id": post_id}).sort("created_at", ASCENDING).to_list(length=500)
        for c in raw_comments:
            c["id"] = str(c.pop("_id"))
            if "created_at" in c and c["created_at"]:
                c["created_at"] = c["created_at"].isoformat()
            c["replies"] = []

        by_id = {c["id"]: c for c in raw_comments}
        top_level = []
        for c in raw_comments:
            parent = c.get("parent_comment_id")
            if parent and parent in by_id:
                by_id[parent]["replies"].append(c)
            else:
                top_level.append(c)
        post["comments"] = top_level

        user_id = user.get("user_id") if user else None
        await _attach_user_status(post, user_id)

        return {"post": post}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 4. Update Post ──────────────────────────────────────────────────────────

@community_router.put("/posts/{post_id}")
async def update_post(post_id: str, data: CommunityPostCreate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.get("author_id") != user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only edit your own posts")
        if data.category not in VALID_CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(sorted(VALID_CATEGORIES))}")

        update = {
            "$set": {
                "title": data.title.strip(),
                "description": data.description.strip(),
                "category": data.category,
                "tags": [t.strip().lower() for t in data.tags if t.strip()],
                "github_link": data.github_link,
                "website_link": data.website_link,
                "video_url": data.video_url,
                "cover_image": data.cover_image,
                "project_type": data.project_type,
                "updated_at": datetime.utcnow(),
            }
        }
        await posts_col.update_one({"_id": ObjectId(post_id)}, update)
        updated = await posts_col.find_one({"_id": ObjectId(post_id)})
        return {"status": "success", "post": _serialize_post(updated)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 5. Delete Post ──────────────────────────────────────────────────────────

@community_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.get("author_id") != user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only delete your own posts")

        await posts_col.delete_one({"_id": ObjectId(post_id)})
        await votes_col.delete_many({"post_id": post_id})
        await comments_col.delete_many({"post_id": post_id})
        await saves_col.delete_many({"post_id": post_id})

        return {"status": "success", "message": "Post deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 6. Vote ─────────────────────────────────────────────────────────────────

@community_router.post("/posts/{post_id}/vote")
async def vote_post(post_id: str, body: VoteRequest, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")
        if body.direction not in ("up", "down", "none"):
            raise HTTPException(status_code=400, detail="direction must be 'up', 'down', or 'none'")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        user_id = user["user_id"]
        existing = await votes_col.find_one({"user_id": user_id, "post_id": post_id})

        if body.direction == "none":
            if existing:
                await votes_col.delete_one({"_id": existing["_id"]})
        else:
            if existing:
                if existing["direction"] == body.direction:
                    await votes_col.delete_one({"_id": existing["_id"]})
                else:
                    await votes_col.update_one({"_id": existing["_id"]}, {"$set": {"direction": body.direction}})
            else:
                await votes_col.insert_one({
                    "user_id": user_id,
                    "post_id": post_id,
                    "direction": body.direction,
                    "created_at": datetime.utcnow(),
                })

        up = await votes_col.count_documents({"post_id": post_id, "direction": "up"})
        down = await votes_col.count_documents({"post_id": post_id, "direction": "down"})
        await posts_col.update_one({"_id": ObjectId(post_id)}, {"$set": {"upvotes": up, "downvotes": down}})

        vote_record = await votes_col.find_one({"user_id": user_id, "post_id": post_id})
        return {
            "status": "success",
            "user_vote": vote_record["direction"] if vote_record else None,
            "upvotes": up,
            "downvotes": down,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 7. Toggle Save ──────────────────────────────────────────────────────────

@community_router.post("/posts/{post_id}/save")
async def toggle_save(post_id: str, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        user_id = user["user_id"]
        existing = await saves_col.find_one({"user_id": user_id, "post_id": post_id})

        if existing:
            await saves_col.delete_one({"_id": existing["_id"]})
            saved = False
        else:
            await saves_col.insert_one({
                "user_id": user_id,
                "post_id": post_id,
                "created_at": datetime.utcnow(),
            })
            saved = True

        return {"status": "success", "is_saved": saved}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 8. Track Share ──────────────────────────────────────────────────────────

@community_router.post("/posts/{post_id}/share")
async def track_share(post_id: str):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        await posts_col.update_one({"_id": ObjectId(post_id)}, {"$inc": {"share_count": 1}})
        return {"status": "success", "share_count": (post.get("share_count", 0) or 0) + 1}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 9. Add Comment ──────────────────────────────────────────────────────────

@community_router.post("/comments")
async def add_comment(data: CommunityCommentCreate, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(data.post_id):
            raise HTTPException(status_code=400, detail="Invalid post ID")

        post = await posts_col.find_one({"_id": ObjectId(data.post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if data.parent_comment_id:
            if not ObjectId.is_valid(data.parent_comment_id):
                raise HTTPException(status_code=400, detail="Invalid parent comment ID")
            parent = await comments_col.find_one({"_id": ObjectId(data.parent_comment_id)})
            if not parent:
                raise HTTPException(status_code=404, detail="Parent comment not found")
            if parent.get("post_id") != data.post_id:
                raise HTTPException(status_code=400, detail="Parent comment does not belong to this post")

        author_info = await _get_author_info(user["user_id"])
        now = datetime.utcnow()

        comment = {
            "post_id": data.post_id,
            "content": data.content.strip(),
            "parent_comment_id": data.parent_comment_id,
            "created_at": now,
            **author_info,
        }

        result = await comments_col.insert_one(comment)
        await posts_col.update_one({"_id": ObjectId(data.post_id)}, {"$inc": {"comment_count": 1}})

        comment["id"] = str(result.inserted_id)
        del comment["_id"]
        comment["created_at"] = now.isoformat()
        comment["replies"] = []

        return {"status": "success", "comment": comment}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 10. Delete Comment ──────────────────────────────────────────────────────

@community_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, user: dict = Depends(get_auth_user)):
    try:
        if not ObjectId.is_valid(comment_id):
            raise HTTPException(status_code=400, detail="Invalid comment ID")

        comment = await comments_col.find_one({"_id": ObjectId(comment_id)})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if comment.get("author_id") != user["user_id"]:
            raise HTTPException(status_code=403, detail="You can only delete your own comments")

        await comments_col.delete_one({"_id": ObjectId(comment_id)})
        # Recursively find and delete all descendant comments
        to_delete = [comment_id]
        deleted_count = 0
        while to_delete:
            current_parent = to_delete.pop(0)
            children = await comments_col.find({"parent_comment_id": current_parent}).to_list(length=500)
            for child in children:
                to_delete.append(str(child["_id"]))
            if children:
                child_ids = [str(c["_id"]) for c in children]
                result = await comments_col.delete_many({"_id": {"$in": [ObjectId(cid) for cid in child_ids]}})
                deleted_count += result.deleted_count
        await posts_col.update_one({"_id": ObjectId(comment["post_id"])}, {"$inc": {"comment_count": -(1 + deleted_count)}})

        return {"status": "success", "message": "Comment deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 11. Top Builders ────────────────────────────────────────────────────────

@community_router.get("/top-builders")
async def top_builders():
    try:
        pipeline = [
            {"$group": {
                "_id": "$author_id",
                "author_name": {"$first": "$author_name"},
                "author_avatar": {"$first": "$author_avatar"},
                "total_upvotes": {"$sum": "$upvotes"},
                "post_count": {"$sum": 1},
            }},
            {"$sort": {"total_upvotes": DESCENDING}},
            {"$limit": 20},
        ]
        results = await posts_col.aggregate(pipeline).to_list(length=20)
        builders = []
        for r in results:
            builders.append({
                "user_id": r["_id"],
                "author_name": r.get("author_name", "Unknown"),
                "author_avatar": r.get("author_avatar"),
                "total_upvotes": r.get("total_upvotes", 0),
                "post_count": r.get("post_count", 0),
            })
        return {"builders": builders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 12. Category Counts ─────────────────────────────────────────────────────

@community_router.get("/categories")
async def category_counts():
    try:
        pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}},
            {"$sort": {"count": DESCENDING}},
        ]
        results = await posts_col.aggregate(pipeline).to_list(length=50)
        categories = [{"category": r["_id"], "count": r["count"]} for r in results]
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 13. Popular Tags ────────────────────────────────────────────────────────

@community_router.get("/tags")
async def popular_tags():
    try:
        pipeline = [
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
            {"$sort": {"count": DESCENDING}},
            {"$limit": 30},
        ]
        results = await posts_col.aggregate(pipeline).to_list(length=30)
        tags = [{"tag": r["_id"], "count": r["count"]} for r in results]
        return {"tags": tags}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── 14. Saved Posts ─────────────────────────────────────────────────────────

@community_router.get("/saved")
async def saved_posts(user: dict = Depends(get_auth_user)):
    try:
        user_id = user["user_id"]
        saved = await saves_col.find({"user_id": user_id}).sort("created_at", DESCENDING).to_list(length=200)
        post_ids = [ObjectId(s["post_id"]) for s in saved if ObjectId.is_valid(s.get("post_id", ""))]
        if not post_ids:
            return {"posts": []}

        cursor = posts_col.find({"_id": {"$in": post_ids}}).sort("created_at", DESCENDING)
        posts = [_serialize_post(p) for p in await cursor.to_list(length=200)]
        for p in posts:
            await _attach_user_status(p, user_id)
            p["is_saved"] = True

        return {"posts": posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
