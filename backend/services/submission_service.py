from db import submissions_col
from bson import ObjectId
from datetime import datetime, timezone

async def create_submission(data: dict):
    # Backend File-Type Validation
    for key, value in data.items():
        if isinstance(value, str) and value.startswith('data:'):
            # Extract MIME type
            mime_type = value.split(';')[0].split(':')[1]
            
            # Allow PDF or Powerpoint MIME types
            allowed_mime_types = [
                'application/pdf', 
                'application/vnd.ms-powerpoint', 
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ]
            
            if mime_type not in allowed_mime_types:
                raise Exception(f"Invalid file type: {mime_type}. Only PDF, PPT, and PPTX are allowed.")

    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["status"] = data.get("status", "Submitted")
    result = await submissions_col.insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data

async def get_all_submissions(filters: dict = None):
    query = filters or {}
    cursor = submissions_col.find(query).sort("created_at", -1)
    submissions = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        submissions.append(doc)
    return submissions

async def get_submission_by_id(submission_id: str):
    doc = await submissions_col.find_one({"_id": ObjectId(submission_id)})
    if doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def update_submission_status(submission_id: str, status: str):
    await submissions_col.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return True
