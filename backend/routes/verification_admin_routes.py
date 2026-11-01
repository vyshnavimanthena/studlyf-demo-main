from fastapi import APIRouter, HTTPException, Request, Depends
from db import db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/certificates/admin", tags=["Verification Admin"])

@router.get("/metrics")
async def get_verification_metrics(user: dict = Depends(get_auth_user)):
    # 1. Total Verifications
    total = await db.verification_audits.count_documents({})
    
    # 2. Verifications Today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await db.verification_audits.count_documents({"timestamp": {"$gte": today}})
    
    # 3. Unique Verifiers
    unique = await db.verification_audits.distinct("ip_hash")
    
    # 4. Top Verified Certificates
    top_certs = await db.verification_audits.aggregate([
        {"$group": {"_id": "$certificate_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]).to_list(10)
    
    return {
        "total_verifications": total,
        "verifications_today": today_count,
        "unique_verifiers": len(unique),
        "top_verified": top_certs
    }
