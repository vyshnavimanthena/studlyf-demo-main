"""
Notification Routes - Comprehensive notification system
"""
from fastapi import APIRouter, HTTPException, Body, Depends, Query
from typing import List, Optional
from auth_institution import get_auth_user, assert_institution_scope
from notification_service import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

# User Notifications
@router.get("/my")
async def get_my_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    category: Optional[str] = Query(None),
    user: dict = Depends(get_auth_user)
):
    """Get notifications for current user"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        result = await notification_service.get_user_notifications(
            user_id, limit, offset, unread_only, category
        )
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get notifications")

@router.get("/my/stats")
async def get_my_notification_stats(user: dict = Depends(get_auth_user)):
    """Get notification statistics for current user"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        stats = await notification_service.get_notification_stats(user_id)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get notification stats")

@router.post("/my/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: dict = Depends(get_auth_user)
):
    """Mark a notification as read"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        result = await notification_service.mark_notification_read(notification_id, user_id)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to mark notification as read")

@router.post("/my/mark-all-read")
async def mark_all_notifications_read(
    category: Optional[str] = Query(None),
    user: dict = Depends(get_auth_user)
):
    """Mark all notifications as read"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        result = await notification_service.mark_all_notifications_read(user_id, category)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to mark all notifications as read")

@router.delete("/my/{notification_id}")
async def delete_notification(
    notification_id: str,
    user: dict = Depends(get_auth_user)
):
    """Delete a notification"""
    
    try:
        user_id = str(user.get("user_id", ""))
        if not user_id:
            raise HTTPException(status_code=401, detail="User ID required")
        
        result = await notification_service.delete_notification(notification_id, user_id)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete notification")

# Create Notifications (for internal use)
@router.post("/create")
async def create_notification(
    user_id: str = Body(...),
    notification_type: str = Body(...),
    title: str = Body(...),
    message: str = Body(...),
    metadata: Optional[dict] = Body(None),
    institution_id: Optional[str] = Body(None),
    event_id: Optional[str] = Body(None),
    user: dict = Depends(get_auth_user)
):
    """Create a notification (admin only)"""
    
    try:
        # Verify user has admin privileges
        role = user.get("role", "").lower()
        if role not in ["admin", "super_admin", "institution"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await notification_service.create_notification(
            user_id, notification_type, title, message, metadata, institution_id, event_id
        )
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create notification")

# Judge Notifications
@router.post("/judge")
async def create_judge_notification(
    judge_email: str = Body(...),
    notification_type: str = Body(...),
    title: str = Body(...),
    message: str = Body(...),
    event_id: str = Body(...),
    metadata: Optional[dict] = Body(None),
    user: dict = Depends(get_auth_user)
):
    """Create notification for a judge (institution admin only)"""
    
    try:
        # Verify institution admin
        role = user.get("role", "").lower()
        if role not in ["admin", "super_admin", "institution"]:
            raise HTTPException(status_code=403, detail="Institution admin access required")
        
        result = await notification_service.create_judge_notification(
            judge_email, notification_type, title, message, event_id, metadata
        )
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create judge notification")

# Institution Notifications
@router.post("/institution/{institution_id}")
async def create_institution_notification(
    institution_id: str,
    notification_type: str = Body(...),
    title: str = Body(...),
    message: str = Body(...),
    metadata: Optional[dict] = Body(None),
    event_id: Optional[str] = Body(None),
    user: dict = Depends(get_auth_user)
):
    """Create notifications for all institution admins"""
    
    try:
        # Verify institution access
        assert_institution_scope(institution_id, user)
        
        result = await notification_service.create_institution_notification(
            institution_id, notification_type, title, message, metadata, event_id
        )
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create institution notification")

# Notification Cleanup (Admin)
@router.post("/cleanup")
async def cleanup_old_notifications(
    days_old: int = Query(30, ge=1, le=365),
    user: dict = Depends(get_auth_user)
):
    """Clean up old read notifications (admin only)"""
    
    try:
        # Verify admin privileges
        role = user.get("role", "").lower()
        if role not in ["admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = await notification_service.cleanup_old_notifications(days_old)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to cleanup notifications")
