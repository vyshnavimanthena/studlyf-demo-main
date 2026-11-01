"""
Quiz Visibility Routes
Handles quiz visibility management based on stage configuration
"""
from fastapi import APIRouter, HTTPException, Body, Depends, Query
from typing import List, Optional
from auth_institution import get_auth_user, assert_institution_scope, assert_institution_owns_event
from quiz_visibility_service import quiz_visibility_service

router = APIRouter(prefix="/api/quiz-visibility", tags=["Quiz Visibility"])

# Quiz Visibility Management
@router.get("/events/{event_id}/quizzes/visible")
async def get_visible_quizzes(
    event_id: str,
    user: dict = Depends(get_auth_user)
):
    """Get all quizzes visible to current user for an event"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        visible_quizzes = await quiz_visibility_service.get_visible_quizzes(event_id, user_id)
        
        # Format response
        formatted_quizzes = []
        for quiz in visible_quizzes:
            formatted_quiz = {
                "_id": str(quiz["_id"]),
                "title": quiz.get("title", "Untitled Quiz"),
                "description": quiz.get("description", ""),
                "visibility": quiz.get("visibility", "public"),
                "duration": quiz.get("duration", 0),
                "deadline": quiz.get("deadline", ""),
                "created_at": quiz.get("created_at", ""),
                "question_count": len(quiz.get("questions", []))
            }
            formatted_quizzes.append(formatted_quiz)
        
        return {
            "event_id": event_id,
            "visible_quizzes": formatted_quizzes,
            "total_count": len(formatted_quizzes)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get visible quizzes")

@router.get("/events/{event_id}/quizzes/{quiz_id}/access-info")
async def get_quiz_access_info(
    event_id: str,
    quiz_id: str,
    user: dict = Depends(get_auth_user)
):
    """Get detailed access information for a quiz"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        access_info = await quiz_visibility_service.get_quiz_access_info(event_id, quiz_id, user_id)
        return access_info
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get quiz access info")

@router.put("/events/{event_id}/quizzes/{quiz_id}/visibility")
async def update_quiz_visibility(
    event_id: str,
    quiz_id: str,
    visibility: str = Body(...),
    user: dict = Depends(get_auth_user)
):
    """Update quiz visibility settings (institution admin only)"""
    
    try:
        result = await quiz_visibility_service.update_quiz_visibility(
            event_id, quiz_id, visibility, user
        )
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update quiz visibility")

# Quiz Access Control for Existing Routes
@router.get("/events/{event_id}/quizzes/{quiz_id}/check-access")
async def check_quiz_access(
    event_id: str,
    quiz_id: str,
    user: dict = Depends(get_auth_user)
):
    """Check if user can access a specific quiz"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        await quiz_visibility_service.check_quiz_visibility(event_id, quiz_id, user_id)
        
        return {
            "can_access": True,
            "message": "Quiz access granted"
        }
        
    except ValueError as e:
        return {
            "can_access": False,
            "message": str(e)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to check quiz access")
