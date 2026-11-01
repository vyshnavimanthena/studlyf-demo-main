from fastapi import APIRouter, HTTPException, Depends, Response
from db import db
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/v1/certificates", tags=["Certificates"])

@router.get("/{certificate_id}/download")
async def download_certificate(certificate_id: str):
    res = await db.certificate_records.find_one({"certificate_id": certificate_id, "is_deleted": False})
    if not res: raise HTTPException(status_code=404, detail="Not found")
    
    # Track analytics
    now = datetime.utcnow()
    update = {"$inc": {"download_count": 1}, "$set": {"last_downloaded_at": now}}
    if res.get("download_count", 0) == 0: update["$set"]["first_downloaded_at"] = now
    await db.certificate_records.update_one({"_id": res["_id"]}, update)
    
    # In real impl, fetch the actual PDF from S3/Storage
    # return Response(content=pdf_bytes, media_type="application/pdf")
    return {"status": "success", "message": "Downloading certificate..."}
