from fastapi import APIRouter, HTTPException, Request, Depends
from db import db
from models.verification_models import VerificationAudit
from models.certificate_record_models import CertificateStatus
from datetime import datetime
import hashlib
import uuid

router = APIRouter(prefix="/api/v1/certificates/verify", tags=["Public Verification"])

from fastapi import APIRouter, HTTPException, Request, Depends, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from db import db
from models.verification_models import VerificationAudit
from models.certificate_record_models import CertificateStatus
from datetime import datetime
import hashlib
import uuid

# Rate limiter: 30 requests/minute per IP
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/v1/certificates/verify", tags=["Public Verification"])

ALLOWED_PUBLIC_STATUSES = {
    CertificateStatus.ISSUED,
    CertificateStatus.EMAILED,
    CertificateStatus.DOWNLOADED,
    CertificateStatus.VERIFIED
}

@router.get("/{certificate_id}")
@limiter.limit("30/minute")
async def public_verify_certificate(request: Request, certificate_id: str):
    # 1. Lookup
    record = await db.certificate_records.find_one({"certificate_id": certificate_id, "is_deleted": False})
    
    # Audit info
    client_ip = get_remote_address(request)
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()
    
    # 2. Revoked Check
    if record and record["status"] == CertificateStatus.REVOKED:
        await log_verification(certificate_id, "revoked", ip_hash, request)
        return {
            "valid": False, "revoked": True, "certificate_id": certificate_id,
            "recipient_name": record["recipient_name"], "award_label": record["award_label"],
            "revoked_at": record.get("revoked_at"), "revocation_reason": record.get("reissue_reason", "Not specified"),
            "institution_name": record.get("institution_name", "Studlyf Institution")
        }

    # 3. Not Found/Invalid
    if not record or record["status"] not in ALLOWED_PUBLIC_STATUSES:
        await log_verification(certificate_id, "invalid", ip_hash, request)
        raise HTTPException(status_code=404, detail="Certificate not found or invalid")

    # 4. Update Analytics (First/Last Verified)
    now = datetime.utcnow()
    update = {"$inc": {"verification_count": 1}, "$set": {"last_verified_at": now}}
    if record.get("verification_count", 0) == 0: update["$set"]["first_verified_at"] = now
    
    await db.certificate_records.update_one({"_id": record["_id"]}, update)
    await log_verification(certificate_id, "success", ip_hash, request)

    # 5. Sanitized Public Response
    return {
        "valid": True,
        "certificate_id": record["certificate_id"],
        "recipient_name": record["recipient_name"],
        "event_name": record["event_name"],
        "award_label": record["award_label"],
        "certificate_type": record["certificate_type"],
        "institution_name": record.get("institution_name", "Studlyf Institution"),
        "issued_at": record["issued_at"],
        "verification_status": record["status"]
    }

async def log_verification(cert_id: str, result: str, ip_hash: str, request: Request):
    audit = VerificationAudit(
        verification_id=str(uuid.uuid4()),
        certificate_id=cert_id,
        ip_hash=ip_hash,
        verification_result=result,
        device=request.headers.get("User-Agent", "unknown"),
        referrer=request.headers.get("Referer", "direct")
    )
    await db.verification_audits.insert_one(audit.dict())


async def log_verification(cert_id: str, result: str, ip_hash: str, request: Request):
    audit = VerificationAudit(
        verification_id=str(uuid.uuid4()),
        certificate_id=cert_id,
        ip_hash=ip_hash,
        verification_result=result,
        device=request.headers.get("User-Agent"),
        referrer=request.headers.get("Referer")
    )
    await db.verification_audits.insert_one(audit.dict())
