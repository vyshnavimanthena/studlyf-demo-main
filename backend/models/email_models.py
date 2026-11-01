from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EmailStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"
    COMPLAINED = "complained"
    FAILED = "failed"

class EmailDeliveryRecord(BaseModel):
    email_id: str
    certificate_id: str
    batch_id: Optional[str] = None # Added for analytics
    recipient_email: str
    subject: str
    provider: str
    status: EmailStatus = EmailStatus.QUEUED

    # Metadata
    error_message: Optional[str] = None
    retry_count: int = 0

    # ... (rest of fields)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    bounced_at: Optional[datetime] = None
    complained_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    
    # Context
    metadata: Dict[str, Any] = Field(default_factory=dict)
