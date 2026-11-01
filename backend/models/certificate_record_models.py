from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CertificateStatus(str, Enum):
    DRAFT = "draft"
    GENERATED = "generated"
    ISSUED = "issued"
    EMAILED = "emailed"
    DOWNLOADED = "downloaded"
    VERIFIED = "verified"
    REVOKED = "revoked"

class AuditEntry(BaseModel):
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actor: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class CertificateRecord(BaseModel):
    certificate_id: str
    verification_code: str
    # QR verification URL is /verify/{certificate_id}
    qr_image_url: str
    
    # Recipient Snapshot
    recipient_user_id: str
    recipient_name: str
    recipient_email: str
    recipient_phone: Optional[str] = None
    
    # Team Snapshot
    team_id: Optional[str] = None
    team_name: Optional[str] = None
    
    # Event Snapshot
    event_id: str
    event_name: str
    stage_id: Optional[str] = None
    stage_name: Optional[str] = None
    
    # Rule/Template References
    rule_id: str
    template_id: str
    template_version: int
    snapshot_id: str # Validation required
    
    # Details
    certificate_type: str
    award_label: str
    certificate_category: str
    render_data: Dict[str, Any]
    
    # Assets
    pdf_url: str
    thumbnail_image: Optional[str] = None
    
    # Lifecycle
    status: CertificateStatus = CertificateStatus.DRAFT
    batch_id: Optional[str] = None
    
    # Reissue Tracking
    reissued_from_certificate_id: Optional[str] = None
    reissue_reason: Optional[str] = None
    reissued_by: Optional[str] = None
    reissued_at: Optional[datetime] = None
    
    # Timestamps
    generated_at: Optional[datetime] = None
    issued_at: Optional[datetime] = None
    emailed_at: Optional[datetime] = None
    first_downloaded_at: Optional[datetime] = None
    last_downloaded_at: Optional[datetime] = None
    first_verified_at: Optional[datetime] = None
    last_verified_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    
    # Analytics
    download_count: int = 0
    verification_count: int = 0
    email_delivery_count: int = 0
    
    # Audit
    audit_history: List[AuditEntry] = Field(default_factory=list)
    
    # Soft Delete
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None

