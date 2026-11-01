from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class VerificationAudit(BaseModel):
    verification_id: str
    certificate_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    country: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    referrer: Optional[str] = None
    ip_hash: str # Hashed IP to protect privacy
    verification_result: str # 'success', 'invalid', 'revoked'
