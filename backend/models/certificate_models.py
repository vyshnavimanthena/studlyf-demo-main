from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class TemplateSource(str, Enum):
    PREBUILT = "prebuilt"
    UPLOADED = "uploaded"
    CUSTOM = "custom"

class TemplateStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Set
from datetime import datetime
from enum import Enum
import re

ALLOWED_TEMPLATE_VARIABLES: Set[str] = {
    "recipient_name", "recipient_email", "event_name", "event_stage",
    "team_name", "rank", "score", "certificate_id", "verification_code",
    "issue_date", "institution_name"
}

class TemplateSource(str, Enum):
    PREBUILT = "prebuilt"
    UPLOADED = "uploaded"
    CUSTOM = "custom"

class TemplateStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class CertificateTemplate(BaseModel):
    template_id: str
    template_name: str
    template_slug: str
    
    template_type: str 
    template_category: str 
    
    template_version: int = 1
    status: TemplateStatus = TemplateStatus.DRAFT
    
    canvas_dimensions: Dict[str, Any]
    background_asset: Optional[str] = None
    thumbnail_image: Optional[str] = None
    branding_enabled: bool = True
    elements_json: Dict[str, Any]
    
    # Automated extraction
    required_variables: List[str] = Field(default_factory=list)
    preview_image: Optional[str] = None
    
    template_source: TemplateSource
    institution_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    
    created_by: str
    updated_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    is_default: bool = False
    usage_count: int = 0
    last_used_at: Optional[datetime] = None
    
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None

    @validator('elements_json')
    def validate_and_extract_variables(cls, v):
        if 'elements' not in v or not isinstance(v['elements'], list):
            raise ValueError("elements_json must contain an 'elements' list")
        
        found_vars = set()
        for element in v['elements']:
            if element.get('type') == 'text' and 'content' in element:
                # Extract {{var_name}}
                matches = re.findall(r'\{\{(.*?)\}\}', element['content'])
                for var in matches:
                    if var not in ALLOWED_TEMPLATE_VARIABLES:
                        raise ValueError(f"Unsupported variable: {var}")
                    found_vars.add(var)
        
        # Note: We can't set required_variables directly here because 'values' doesn't contain it
        return v

