"""
Evaluation Criteria Routes
Handles CRUD operations for evaluation criteria
"""
from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any
from auth_institution import get_auth_user, assert_institution_scope, assert_institution_owns_event
from evaluation_criteria_service import evaluation_criteria_service

router = APIRouter(prefix="/api/evaluation-criteria", tags=["Evaluation Criteria"])

# CRUD Operations
@router.post("/events/{event_id}")
async def create_evaluation_criteria(
    event_id: str,
    criteria_data: List[dict] = Body(...),
    user: dict = Depends(get_auth_user)
):
    """Create evaluation criteria for an event"""
    
    try:
        result = await evaluation_criteria_service.create_evaluation_criteria(
            event_id, criteria_data, user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create evaluation criteria")

@router.get("/events/{event_id}")
async def get_evaluation_criteria(
    event_id: str,
    user: dict = Depends(get_auth_user)
):
    """Get evaluation criteria for an event"""
    
    try:
        result = await evaluation_criteria_service.get_evaluation_criteria(event_id, user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get evaluation criteria")

@router.put("/events/{event_id}")
async def update_evaluation_criteria(
    event_id: str,
    criteria_updates: List[dict] = Body(...),
    user: dict = Depends(get_auth_user)
):
    """Update evaluation criteria for an event"""
    
    try:
        result = await evaluation_criteria_service.update_evaluation_criteria(
            event_id, criteria_updates, user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update evaluation criteria")

@router.delete("/events/{event_id}/criteria/{criterion_id}")
async def delete_evaluation_criterion(
    event_id: str,
    criterion_id: str,
    user: dict = Depends(get_auth_user)
):
    """Delete a specific evaluation criterion"""
    
    try:
        result = await evaluation_criteria_service.delete_evaluation_criterion(
            event_id, criterion_id, user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete evaluation criterion")

# Templates
@router.get("/templates/{institution_id}")
async def get_criteria_templates(
    institution_id: str,
    user: dict = Depends(get_auth_user)
):
    """Get predefined criteria templates"""
    
    try:
        assert_institution_scope(institution_id, user)
        templates = await evaluation_criteria_service.get_criteria_templates(institution_id, user)
        return templates
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get criteria templates")

@router.post("/events/{event_id}/clone/{template_name}")
async def clone_criteria_from_template(
    event_id: str,
    template_name: str,
    user: dict = Depends(get_auth_user)
):
    """Clone criteria from a template to an event"""
    
    try:
        await assert_institution_owns_event(event_id, user)
        result = await evaluation_criteria_service.clone_criteria_from_template(
            event_id, template_name, user
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to clone criteria from template")
