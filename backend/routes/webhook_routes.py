from fastapi import APIRouter, HTTPException, Request
from db import db
from models.email_models import EmailStatus
from datetime import datetime

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

@router.post("/sendgrid")
async def sendgrid_webhook(request: Request):
    events = await request.json()
    for event in events:
        email_id = event.get("custom_args", {}).get("email_id")
        status = event.get("event") # e.g., 'delivered', 'open', 'click'
        
        # Map SendGrid event to EmailStatus
        status_map = {
            "delivered": EmailStatus.DELIVERED,
            "open": EmailStatus.OPENED,
            "click": EmailStatus.CLICKED,
            "bounce": EmailStatus.BOUNCED
        }
        
        if status in status_map:
            update = {"$set": {"status": status_map[status]}}
            if status == "delivered": update["$set"]["delivered_at"] = datetime.utcnow()
            elif status == "open": update["$set"]["opened_at"] = datetime.utcnow()
            elif status == "click": update["$set"]["clicked_at"] = datetime.utcnow()
                
            await db.email_deliveries.update_one({"email_id": email_id}, update)
            
    return {"status": "ok"}
