from __future__ import annotations
"""
Quiz Visibility Service
Handles quiz visibility based on stage visibility (Public/Private/Shortlisted Only)
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
from db import events_col, participants_col, quizzes_col, rounds_col, users_col

class QuizVisibilityService:
    """Service for managing quiz visibility based on stage configuration"""
    
    async def check_quiz_visibility(self, event_id: str, quiz_id: str, user_id: str, event: dict = None):
        """Check if user can access quiz based on stage visibility"""
        
        if not event:
            event = await events_col.find_one({"_id": ObjectId(event_id)})
            if not event:
                raise ValueError("Event not found")
        
        # Get quiz
        quiz = await quizzes_col.find_one({"_id": ObjectId(quiz_id), "event_id": event_id})
        if not quiz:
            raise ValueError("Quiz not found")
        
        # Get quiz visibility settings
        quiz_visibility = quiz.get("visibility", "public")  # public, private, shortlisted_only
        
        # Get participant status
        participant = await participants_col.find_one({"event_id": event_id, "user_id": user_id})
        if not participant:
            raise ValueError("User must be registered for the event")
        
        # Check visibility rules
        if quiz_visibility == "public":
            # Anyone registered can access
            return True
        
        elif quiz_visibility == "private":
            # Only invited participants can access
            if participant.get("status") != "accepted":
                raise ValueError("This quiz is only available to accepted participants")
            return True
        
        elif quiz_visibility == "shortlisted_only":
            # Only shortlisted participants can access
            if participant.get("status") != "shortlisted":
                raise ValueError("This quiz is only available to shortlisted participants")
            return True
        
        else:
            raise ValueError(f"Invalid quiz visibility setting: {quiz_visibility}")
    
    async def get_visible_quizzes(self, event_id: str, user_id: str):
        """Get all quizzes visible to a user for an event"""
        
        # Get event
        event = await events_col.find_one({"_id": ObjectId(event_id)})
        if not event:
            raise ValueError("Event not found")
        
        # Get participant status
        participant = await participants_col.find_one({"event_id": event_id, "user_id": user_id})
        if not participant:
            return []  # User not registered, no quizzes visible
        
        # Get all quizzes for event
        all_quizzes = []
        async for quiz in quizzes_col.find({"event_id": event_id}):
            all_quizzes.append(quiz)
        
        # Filter based on visibility
        visible_quizzes = []
        for quiz in all_quizzes:
            try:
                await self.check_quiz_visibility(event_id, str(quiz["_id"]), user_id, event)
                visible_quizzes.append(quiz)
            except ValueError:
                # Quiz not visible to this user, skip
                continue
        
        return visible_quizzes
    
    async def update_quiz_visibility(self, event_id: str, quiz_id: str, visibility: str, user: dict):
        """Update quiz visibility settings"""
        
        # Validate visibility value
        valid_visibilities = ["public", "private", "shortlisted_only"]
        if visibility not in valid_visibilities:
            raise ValueError(f"Invalid visibility. Must be one of: {valid_visibilities}")
        
        # Validate user has institution access
        from auth_institution import assert_institution_owns_event
        await assert_institution_owns_event(event_id, user)
        
        # Update quiz visibility
        result = await quizzes_col.update_one(
            {"_id": ObjectId(quiz_id), "event_id": event_id},
            {
                "$set": {
                    "visibility": visibility,
                    "visibility_updated_at": datetime.now(timezone.utc).isoformat(),
                    "visibility_updated_by": user.get("user_id")
                }
            }
        )
        
        if result.matched_count == 0:
            raise ValueError("Quiz not found")
        
        return {"status": "success", "visibility": visibility}
    
    async def get_quiz_access_info(self, event_id: str, quiz_id: str, user_id: str):
        """Get detailed access information for a quiz"""
        
        # Get event and quiz
        event = await events_col.find_one({"_id": ObjectId(event_id)})
        quiz = await quizzes_col.find_one({"_id": ObjectId(quiz_id), "event_id": event_id})
        
        if not event or not quiz:
            raise ValueError("Event or quiz not found")
        
        # Get participant
        participant = await participants_col.find_one({"event_id": event_id, "user_id": user_id})
        
        # Build access info
        access_info = {
            "quiz_id": quiz_id,
            "quiz_title": quiz.get("title", "Untitled Quiz"),
            "quiz_visibility": quiz.get("visibility", "public"),
            "can_access": False,
            "access_reason": "",
            "participant_status": participant.get("status", "not_registered") if participant else "not_registered",
            "requirements_met": []
        }
        
        if not participant:
            access_info["access_reason"] = "You must register for the event to access this quiz"
            return access_info
        
        # Check access based on visibility
        quiz_visibility = quiz.get("visibility", "public")
        
        if quiz_visibility == "public":
            access_info["can_access"] = True
            access_info["access_reason"] = "Quiz is publicly available to all registered participants"
            access_info["requirements_met"].append("Event registration")
        
        elif quiz_visibility == "private":
            if participant.get("status") == "accepted":
                access_info["can_access"] = True
                access_info["access_reason"] = "Quiz is available to accepted participants"
                access_info["requirements_met"].append("Event registration")
                access_info["requirements_met"].append("Accepted status")
            else:
                access_info["access_reason"] = "This quiz is only available to accepted participants"
        
        elif quiz_visibility == "shortlisted_only":
            if participant.get("status") == "shortlisted":
                access_info["can_access"] = True
                access_info["access_reason"] = "Quiz is available to shortlisted participants"
                access_info["requirements_met"].append("Event registration")
                access_info["requirements_met"].append("Shortlisted status")
            else:
                access_info["access_reason"] = "This quiz is only available to shortlisted participants"
        
        # Check additional requirements
        if quiz.get("deadline"):
            deadline = datetime.fromisoformat(quiz["deadline"].replace('Z', '+00:00'))
            if deadline <= datetime.now(timezone.utc):
                access_info["can_access"] = False
                access_info["access_reason"] = "Quiz deadline has passed"
        
        if quiz.get("prerequisite_quiz_id"):
            # Check if prerequisite quiz is completed
            prereq_quiz_id = quiz["prerequisite_quiz_id"]
            prereq_completed = await self._check_prerequisite_completion(prereq_quiz_id, user_id)
            if not prereq_completed:
                access_info["can_access"] = False
                access_info["access_reason"] = "You must complete the prerequisite quiz first"
                access_info["requirements_met"].append("Prerequisite quiz completion")
        
        return access_info
    
    async def _check_prerequisite_completion(self, prerequisite_quiz_id: str, user_id: str):
        """Check if user has completed a prerequisite quiz"""
        
        quiz = await quizzes_col.find_one({"_id": ObjectId(prerequisite_quiz_id)})
        if not quiz:
            return False
        
        # Check if user has a passing attempt
        attempts = quiz.get("attempts", [])
        for attempt in attempts:
            if attempt.get("user_id") == user_id:
                if attempt.get("passed", False):
                    return True
        
        return False

# Global instance
quiz_visibility_service = QuizVisibilityService()

# Helper function for integration
async def _check_quiz_visibility(event_id: str, quiz_id: str, user_id: str, event: dict = None):
    """Helper function to check quiz visibility"""
    await quiz_visibility_service.check_quiz_visibility(event_id, quiz_id, user_id, event)
