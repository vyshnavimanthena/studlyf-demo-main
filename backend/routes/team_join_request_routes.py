"""
Team Join Request Routes - REST API for team join request workflow
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from services.team_join_request_service import (
    send_join_request,
    send_join_request_by_code,
    approve_join_request,
    reject_join_request,
    withdraw_join_request,
    get_team_join_requests,
    get_user_sent_requests,
)
from routes.auth import get_current_user as get_auth_user
from stage_access_control import check_stage_deadline

router = APIRouter(prefix="/api/v1/teams/requests", tags=["Team Join Requests"])

# ─────────────────────────────────────────────────────────────────────────────
# SEND JOIN REQUEST
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/send")
async def send_request(
    data: dict = Body(...),
    user: dict = Depends(get_auth_user)
):
    """
    Send join request to a team.
    Student can add a message (optional).
    """
    event_id = data.get("event_id")
    team_id = data.get("team_id")
    message = data.get("message", "")
    
    if not event_id or not team_id:
        raise HTTPException(status_code=400, detail="event_id and team_id required")
    
    result = await send_join_request(
        event_id=event_id,
        team_id=team_id,
        requester_user_id=user["user_id"],
        message=message
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# ─────────────────────────────────────────────────────────────────────────────
# SEND JOIN REQUEST BY INVITE CODE
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/send-by-code")
async def send_request_by_code(
    data: dict = Body(...),
    user: dict = Depends(get_auth_user)
):
    """
    Send join request to a team using an invite code.
    Looks up the team by invite code and event_id, sends request to team lead.
    """
    event_id = data.get("event_id")
    invite_code = data.get("invite_code")
    message = data.get("message", "")

    if not event_id or not invite_code:
        raise HTTPException(status_code=400, detail="event_id and invite_code required")

    # Only allow joining during team formation stage
    await check_stage_deadline(event_id=event_id, stage_name="Team Formation")

    result = await send_join_request_by_code(
        event_id=event_id,
        invite_code=invite_code,
        requester_user_id=user["user_id"],
        message=message
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result

# ─────────────────────────────────────────────────────────────────────────────
# APPROVE/REJECT JOIN REQUEST (Team Lead)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{request_id}/approve")
async def approve_request(
    request_id: str,
    data: dict = Body(...),
    user: dict = Depends(get_auth_user)
):
    """
    Team lead approves a join request.
    Student is added to team.
    """
    message = data.get("message", "")
    
    result = await approve_join_request(
        request_id=request_id,
        approver_user_id=user["user_id"],
        message=message
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@router.post("/{request_id}/reject")
async def reject_request(
    request_id: str,
    data: dict = Body(...),
    user: dict = Depends(get_auth_user)
):
    """
    Team lead rejects a join request.
    Requester gets notified with reason.
    """
    reason = data.get("reason", "")
    
    result = await reject_join_request(
        request_id=request_id,
        rejector_user_id=user["user_id"],
        reason=reason
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# ─────────────────────────────────────────────────────────────────────────────
# WITHDRAW REQUEST
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{request_id}/withdraw")
async def withdraw_request(
    request_id: str,
    user: dict = Depends(get_auth_user)
):
    """
    Requester withdraws their join request.
    """
    result = await withdraw_join_request(
        request_id=request_id,
        requester_user_id=user["user_id"]
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

# ─────────────────────────────────────────────────────────────────────────────
# GET REQUESTS FOR TEAM (Team Lead Dashboard)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/teams/{team_id}/requests")
async def get_team_requests(
    team_id: str,
    status: str = None,
    user: dict = Depends(get_auth_user)
):
    """
    Get all join requests for a team (team lead only).
    Shows: requester name, email, college, skills, request date
    Allows: approve, reject, message
    """
    result = await get_team_join_requests(
        team_id=team_id,
        user_id=user["user_id"],
        status=status
    )
    
    if "error" in result:
        raise HTTPException(status_code=403, detail=result["error"])
    
    return result

# ─────────────────────────────────────────────────────────────────────────────
# GET MY SENT REQUESTS (Student Dashboard)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/my-requests")
async def get_my_requests(
    event_id: str = None,
    user: dict = Depends(get_auth_user)
):
    """
    Get all join requests sent by the current user.
    Shows: team name, status, sent date, response
    """
    result = await get_user_sent_requests(
        user_id=user["user_id"],
        event_id=event_id
    )
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result
