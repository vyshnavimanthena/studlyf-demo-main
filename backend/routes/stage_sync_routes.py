"""
Stage Synchronization Routes - Sync stages between events and opportunities
"""
from fastapi import APIRouter, HTTPException
from services.stage_sync_service import sync_stages_to_opportunities, sync_opportunity_to_event

router = APIRouter(prefix="/api/stage-sync", tags=["Stage Sync"])

@router.post("/event/{event_id}/sync-to-opportunities")
async def sync_event_stages_to_opportunities(event_id: str):
    """Sync stages from event to all related opportunities"""
    result = await sync_stages_to_opportunities(event_id)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result

@router.post("/opportunity/{opportunity_id}/sync-to-event")
async def sync_opportunity_stages_to_event(opportunity_id: str):
    """Sync stages from opportunity back to event"""
    result = await sync_opportunity_to_event(opportunity_id)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["message"])
    
    return result
