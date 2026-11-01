from fastapi import APIRouter, HTTPException, Depends
from typing import List
from db import db
from routes.auth import get_current_user as get_auth_user
from models.certificate_models import CertificateTemplate, TemplateSource, TemplateStatus, ALLOWED_TEMPLATE_VARIABLES
from bson import ObjectId
from datetime import datetime
import re

router = APIRouter(prefix="/api/v1/certificates/templates", tags=["Certificate Templates"])

# Helper to validate ownership
async def get_template_or_404(template_id: str, user: dict):
    query = {"template_id": template_id, "is_deleted": False}
    # Security: Isolation check
    query["$or"] = [
        {"template_source": TemplateSource.PREBUILT},
        {"institution_id": user.get("institution_id")}
    ]
    res = await db.certificate_templates.find_one(query, sort=[("template_version", -1)])
    if not res:
        raise HTTPException(status_code=404, detail="Template not found or forbidden")
    return res

@router.post("/", response_model=CertificateTemplate)
async def create_template(template: CertificateTemplate, user: dict = Depends(get_auth_user)):
    # Security: Prevent unauthorized prebuilt creation
    if template.template_source == TemplateSource.PREBUILT:
        # Check for admin role here if needed
        raise HTTPException(status_code=403, detail="Unauthorized to create prebuilt templates")
    
    template.institution_id = user.get("institution_id")
    
    # Auto-extract required variables
    required = set()
    for element in template.elements_json.get('elements', []):
        if element.get('type') == 'text' and 'content' in element:
            matches = re.findall(r'\{\{(.*?)\}\}', element['content'])
            required.update(matches)
    template.required_variables = list(required)
    
    template_dict = template.dict()
    await db.certificate_templates.insert_one(template_dict)
    return template

@router.get("/", response_model=List[CertificateTemplate])
async def list_templates(user: dict = Depends(get_auth_user)):
    institution_id = user.get("institution_id")
    if not institution_id:
        raise HTTPException(status_code=400, detail="Institution ID required")
    
    # Fetch prebuilt templates OR templates owned by this institution
    cursor = db.certificate_templates.find({
        "is_deleted": False,
        "$or": [
            {"template_source": TemplateSource.PREBUILT},
            {"institution_id": institution_id}
        ]
    })
    
    templates = await cursor.to_list(length=100)
    return templates


@router.patch("/{template_id}/status")
async def update_status(template_id: str, status: TemplateStatus, user: dict = Depends(get_auth_user)):
    tmpl = await get_template_or_404(template_id, user)
    
    # Controlled Transitions
    current = tmpl["status"]
    if current == TemplateStatus.DRAFT and status != TemplateStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Invalid transition")
    if current == TemplateStatus.PUBLISHED and status != TemplateStatus.ARCHIVED:
        raise HTTPException(status_code=400, detail="Invalid transition")
    if current == TemplateStatus.ARCHIVED and status != TemplateStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Invalid transition")
    
    await db.certificate_templates.update_one(
        {"_id": tmpl["_id"]},
        {"$set": {"status": status}}
    )
    return {"status": "success"}

@router.delete("/{template_id}")
async def delete_template(template_id: str, user: dict = Depends(get_auth_user)):
    tmpl = await get_template_or_404(template_id, user)
    await db.certificate_templates.update_one(
        {"_id": tmpl["_id"]},
        {"$set": {"is_deleted": True, "deleted_at": datetime.utcnow(), "deleted_by": user["user_id"]}}
    )
    return {"status": "success"}
