from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class BatchStatus(str, Enum):
    DRAFT = "draft"
    PROCESSING = "processing"
    COMPLETED = "completed"
    PARTIALLY_COMPLETED = "partially_completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BatchType(str, Enum):
    ACHIEVEMENT = "achievement"
    PARTICIPATION = "participation"
    CUSTOM = "custom"

class AuditEntry(BaseModel):
    action: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    actor: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class BatchCounts(BaseModel):
    eligible: int = 0
    class BatchStatus(str, Enum):
        QUEUED = "queued"
        PROCESSING = "processing"
        COMPLETED = "completed"
        PARTIALLY_COMPLETED = "partially_completed"
        FAILED = "failed"
        CANCELLED = "cancelled"

    class CertificateBatch(BaseModel):
        batch_id: str
        batch_name: str
        batch_description: Optional[str] = None
        batch_type: BatchType

        event_id: str
        event_name: str
        stage_id: Optional[str] = None
        stage_name: Optional[str] = None

        rule_ids: List[str]
        template_ids: List[str]
        template_versions: Dict[str, int]

        # Immutable Snapshots
        eligibility_snapshot: List[Dict[str, Any]] # Pre-calculated recipient set
        preview_snapshot: Dict[str, Any]

        counts: BatchCounts = Field(default_factory=BatchCounts)
        progress_percentage: float = 0.0
        status: BatchStatus = BatchStatus.QUEUED

        # Locking for Worker
        locked_by: Optional[str] = None # worker_id
        locked_at: Optional[datetime] = None

        # Retry/Error
        error_summary: Optional[str] = None
        failed_certificate_ids: List[str] = Field(default_factory=list)
        failure_reasons: List[Dict[str, Any]] = Field(default_factory=list)
        max_retry_count: int = 3
        retry_count: int = 0
        last_retry_at: Optional[datetime] = None

        audit_history: List[AuditEntry] = Field(default_factory=list)

        created_at: datetime = Field(default_factory=datetime.utcnow)
        started_at: Optional[datetime] = None
        completed_at: Optional[datetime] = None
        cancelled_at: Optional[datetime] = None

        created_by: str
        institution_id: str

