from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import db
from models.certificate_record_models import CertificateRecord, CertificateStatus, AuditEntry
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/certificates", tags=["Certificates"])

import uuid
import random
import string
from fastapi import APIRouter, HTTPException, Depends
from db import db
from models.certificate_record_models import CertificateRecord, CertificateStatus, AuditEntry
from datetime import datetime

router = APIRouter(prefix="/api/v1/certificates", tags=["Certificates"])

def generate_certificate_id(cert_type: str) -> str:
    # Format: CERT-CF26-TYPE-000001
    prefix = f"CERT-CF26-{cert_type[:3].upper()}"
    return f"{prefix}-{uuid.uuid4().hex[:6].upper()}"

def generate_verification_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

@router.post("/generate", response_model=CertificateRecord)
async def generate_certificate(record: CertificateRecord, user: dict = Depends(get_auth_user)):
    # Duplicate Prevention Index enforcement
    exists = await db.certificate_records.find_one({
        "recipient_user_id": record.recipient_user_id,
        "event_id": record.event_id,
        "stage_id": record.stage_id,
        "certificate_type": record.certificate_type,
        "is_deleted": False
    })
    if exists and not record.reissued_from_certificate_id:
        raise HTTPException(status_code=400, detail="Certificate already exists")
    
    # Audit log entry
    record.audit_history.append(AuditEntry(action="generated", actor=user["user_id"]))
    
    await db.certificate_records.insert_one(record.dict())
    return record

@router.patch("/{certificate_id}/status")
async def update_status(certificate_id: str, status: CertificateStatus, user: dict = Depends(get_auth_user)):
    rule = await db.certificate_records.find_one({"certificate_id": certificate_id})
    if not rule: raise HTTPException(status_code=404, detail="Not found")

    # Status Transition Validation
    current = rule["status"]
    allowed = {
        CertificateStatus.DRAFT: [CertificateStatus.GENERATED],
        CertificateStatus.GENERATED: [CertificateStatus.ISSUED],
        CertificateStatus.ISSUED: [CertificateStatus.EMAILED, CertificateStatus.REVOKED],
        CertificateStatus.EMAILED: [CertificateStatus.DOWNLOADED, CertificateStatus.REVOKED],
        CertificateStatus.DOWNLOADED: [CertificateStatus.VERIFIED, CertificateStatus.REVOKED],
        CertificateStatus.VERIFIED: [CertificateStatus.REVOKED]
    }
    if status not in allowed.get(current, []):
        raise HTTPException(status_code=400, detail=f"Invalid transition from {current} to {status}")

    update = {"$set": {"status": status}, "$push": {"audit_history": AuditEntry(action=f"status_{status}", actor=user["user_id"]).dict()}}
    if status == CertificateStatus.ISSUED: update["$set"]["issued_at"] = datetime.utcnow()
    elif status == CertificateStatus.REVOKED: update["$set"]["revoked_at"] = datetime.utcnow()

    await db.certificate_records.update_one({"certificate_id": certificate_id}, update)
    return {"status": "success"}

@router.patch("/{certificate_id}/download")
async def track_download(certificate_id: str, user: dict = Depends(get_auth_user)):
    res = await db.certificate_records.find_one({"certificate_id": certificate_id})
    if not res: raise HTTPException(status_code=404, detail="Not found")
    
    now = datetime.utcnow()
    update = {"$inc": {"download_count": 1}, "$set": {"last_downloaded_at": now}}
    if res.get("download_count", 0) == 0: update["$set"]["first_downloaded_at"] = now
    
    await db.certificate_records.update_one({"certificate_id": certificate_id}, update)
    return {"status": "success"}

@router.get("/verify/{certificate_id}")
async def verify_certificate(certificate_id: str):
    res = await db.certificate_records.find_one({"certificate_id": certificate_id, "is_deleted": False})
    if not res: raise HTTPException(status_code=404, detail="Invalid certificate")
    
    # Analytics
    now = datetime.utcnow()
    update = {"$inc": {"verification_count": 1}, "$set": {"last_verified_at": now}}
    if res.get("verification_count", 0) == 0: update["$set"]["first_verified_at"] = now
    await db.certificate_records.update_one({"_id": res["_id"]}, update)
    
    return {
        "certificate_id": res["certificate_id"],
        "recipient": res["recipient_name"],
        "event": res["event_name"],
        "award": res["award_label"],
        "issue_date": res["issued_at"],
        "status": res["status"],
        "certificate_type": res["certificate_type"],
        "institution_name": "...", # Derived from event
        "qr_valid": True
    }

