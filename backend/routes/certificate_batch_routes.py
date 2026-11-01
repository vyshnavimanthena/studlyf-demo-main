from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import db
from models.certificate_batch_models import CertificateBatch, BatchStatus, AuditEntry
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/certificates/batches", tags=["Certificate Batches"])

@router.post("/", response_model=CertificateBatch)
async def create_batch(batch: CertificateBatch, user: dict = Depends(get_auth_user)):
    # Ownership: Verify institution
    if batch.institution_id != user.get("institution_id"):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # Audit log entry
    batch.audit_history.append(AuditEntry(action="created", actor=user["user_id"]))
    
    await db.certificate_batches.insert_one(batch.dict())
    return batch

@router.get("/{batch_id}", response_model=CertificateBatch)
async def get_batch(batch_id: str):
    res = await db.certificate_batches.find_one({"batch_id": batch_id})
    if not res: raise HTTPException(status_code=404, detail="Batch not found")
    res["_id"] = str(res["_id"])
    return res

@router.get("/event/{event_id}", response_model=List[CertificateBatch])
async def get_batches_by_event(event_id: str):
    cursor = db.certificate_batches.find({"event_id": event_id})
    batches = await cursor.to_list(length=100)
    for b in batches: b["_id"] = str(b["_id"])
    return batches

@router.patch("/{batch_id}/status")
async def update_batch_status(batch_id: str, status: BatchStatus, user: dict = Depends(get_auth_user)):
    res = await db.certificate_batches.update_one(
        {"batch_id": batch_id},
        {
            "$set": {"status": status},
            "$push": {"audit_history": AuditEntry(action=f"status_{status}", actor=user["user_id"]).dict()}
        }
    )
    if res.matched_count == 0: raise HTTPException(status_code=404, detail="Batch not found")
    return {"status": "success"}

@router.get("/{batch_id}/progress", response_model=dict)
async def get_batch_progress(batch_id: str):
    res = await db.certificate_batches.find_one({"batch_id": batch_id})
    if not res: raise HTTPException(status_code=404, detail="Batch not found")
    
    return {
        "eligible_count": res["counts"]["eligible"],
        "generated_count": res["counts"]["generated"],
        "failed_count": res["counts"]["failed"],
        "progress_percentage": res.get("progress_percentage", 0.0)
    }

@router.patch("/{batch_id}/cancel")
async def cancel_batch(batch_id: str, user: dict = Depends(get_auth_user)):
    # Cancellation Safety: Only cancel if NOT completed/failed
    res = await db.certificate_batches.update_one(
        {"batch_id": batch_id, "status": {"$in": [BatchStatus.QUEUED, BatchStatus.PROCESSING]}},
        {"$set": {"status": BatchStatus.CANCELLED, "cancelled_at": datetime.utcnow()}}
    )
    if res.matched_count == 0: raise HTTPException(status_code=400, detail="Cannot cancel batch in current state")
    return {"status": "success"}
