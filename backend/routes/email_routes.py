from fastapi import APIRouter, HTTPException, Depends
from db import db
from models.email_models import EmailDeliveryRecord, EmailStatus
from datetime import datetime

router = APIRouter(prefix="/api/v1/email", tags=["Email Delivery"])

@router.post("/send")
async def send_email(record: EmailDeliveryRecord, user: dict = Depends(get_auth_user)):
    # Basic validation
    record.created_at = datetime.utcnow()
    await db.email_deliveries.insert_one(record.dict())
    return {"email_id": record.email_id}

@router.get("/status/{email_id}")
async def get_email_status(email_id: str):
    res = await db.email_deliveries.find_one({"email_id": email_id})
    if not res: raise HTTPException(status_code=404, detail="Email not found")
    res["_id"] = str(res["_id"])
    return res

@router.post("/retry/{email_id}")
async def retry_email(email_id: str, user: dict = Depends(get_auth_user)):
    # Manual retry trigger
    await db.email_deliveries.update_one(
        {"email_id": email_id},
        {"$set": {"status": EmailStatus.QUEUED, "error_message": None}, "$inc": {"retry_count": 1}}
    )
    return {"status": "queued"}
