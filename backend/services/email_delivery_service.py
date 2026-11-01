import logging
import asyncio
import uuid
from datetime import datetime, timedelta
from typing import List
from db import db
from models.email_models import EmailDeliveryRecord, EmailStatus
from services.email_provider import EmailProvider

logger = logging.getLogger("email_service")

RETRY_SCHEDULE = [1, 5, 15, 60, 1440] # minutes

class EmailDeliveryService:
    def __init__(self, provider: EmailProvider):
        self.provider = provider

    async def worker(self):
        """Polls for queued emails and processes them."""
        worker_id = f"worker-{uuid.uuid4().hex[:6]}"
        while True:
            # Atomic lock
            now = datetime.utcnow()
            email_job = await db.email_deliveries.find_one_and_update(
                {"status": EmailStatus.QUEUED, "$or": [{"next_retry_at": None}, {"next_retry_at": {"$lte": now}}]},
                {"$set": {"status": EmailStatus.PROCESSING, "locked_at": now, "locked_by": worker_id}}
            )
            
            if email_job:
                await self.process_email(email_job)
            else:
                await asyncio.sleep(5)

    async def process_email(self, email_job: dict):
        # Render template
        from services.email_template_service import render_email_template
        body = render_email_template(email_job["template_type"], email_job["metadata"])
        
        attachments = []
        if email_job.get("include_pdf"):
            # Fetch PDF from path
            attachments.append({"filename": "cert.pdf", "path": email_job["pdf_path"]})

        try:
            success = await self.provider.send(email_job["recipient_email"], email_job["subject"], body, attachments=attachments)
            
            if success:
                await db.email_deliveries.update_one(
                    {"email_id": email_job["email_id"]}, 
                    {"$set": {"status": EmailStatus.SENT, "sent_at": datetime.utcnow()}}
                )
                # 3. Update Record/Batch metrics
                await self.update_analytics(email_job["certificate_id"], email_job["email_id"])
            else:
                raise Exception("Provider failed")
                
        except Exception as e:
            await self.handle_failure(email_job, str(e))



    async def handle_failure(self, email_job: dict, error: str):
        retry_count = email_job.get("retry_count", 0)
        if retry_count < 5:
            next_retry = datetime.utcnow() + timedelta(minutes=RETRY_SCHEDULE[retry_count])
            await db.email_deliveries.update_one(
                {"email_id": email_job["email_id"]},
                {"$set": {"status": EmailStatus.QUEUED, "error_message": error, "next_retry_at": next_retry}, "$inc": {"retry_count": 1}}
            )
        else:
            await db.email_deliveries.update_one(
                {"email_id": email_job["email_id"]},
                {"$set": {"status": EmailStatus.FAILED, "error_message": error}}
            )

    async def update_analytics(self, cert_id: str, email_id: str):
        # Update CertificateRecord and Batch metrics
        await db.certificate_records.update_one({"certificate_id": cert_id}, {"$inc": {"email_delivery_count": 1}})
