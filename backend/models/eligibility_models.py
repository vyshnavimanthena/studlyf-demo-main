from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class RuleCategory(str, Enum):
    ACHIEVEMENT = "achievement"
    PARTICIPATION = "participation"

class RuleType(str, Enum):
    RANK = "rank"
    RANK_RANGE = "rank_range"
    TOP_N = "top_n"
    SCORE_THRESHOLD = "score_threshold"
    SUBMISSION_COMPLETED = "submission_completed"
    STAGE_COMPLETED = "stage_completed"
    REGISTRATION_COMPLETED = "registration_completed"
    ATTENDANCE_COMPLETED = "attendance_completed"
    CUSTOM = "custom"

class RuleStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"

class SnapshotType(str, Enum):
    LEADERBOARD = "leaderboard"
    EVALUATION = "evaluation"
    SUBMISSION = "submission"
    REGISTRATION = "registration"

class EligibilityRule(BaseModel):
    rule_id: str
    rule_name: str
    rule_description: Optional[str] = None
    rule_category: RuleCategory
    rule_type: RuleType
    
    event_id: str
    stage_id: Optional[str] = None
    certificate_type: str
    template_id: str
    template_version: int
    
    status: RuleStatus = RuleStatus.DRAFT
    priority: int = Field(default=0, ge=0)
    
    rule_configuration: Dict[str, Any]
    
    snapshot_required: bool = True
    snapshot_type: Optional[SnapshotType] = None
    
    created_by: str
    updated_by: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    activated_at: Optional[datetime] = None
    activated_by: Optional[str] = None
    archived_at: Optional[datetime] = None
    archived_by: Optional[str] = None
    
    is_deleted: bool = False
    deleted_at: Optional[datetime] = None
    deleted_by: Optional[str] = None

    @validator('rule_configuration')
    def validate_config(cls, v, values):
        rt = values.get('rule_type')
        if not rt: return v
        
        if rt == RuleType.RANK:
            if "rank" not in v: raise ValueError("RANK requires 'rank'")
        elif rt == RuleType.RANK_RANGE:
            if v.get('rank_start', 0) > v.get('rank_end', 0): raise ValueError("rank_start must be <= rank_end")
        elif rt == RuleType.TOP_N:
            if "top_n" not in v: raise ValueError("TOP_N requires 'top_n'")
        elif rt == RuleType.SCORE_THRESHOLD:
            if v.get('minimum_score', 0) < 0: raise ValueError("minimum_score cannot be negative")
        elif rt == RuleType.SUBMISSION_COMPLETED:
            if "required_stage" not in v: raise ValueError("SUBMISSION_COMPLETED requires 'required_stage'")
        elif rt == RuleType.STAGE_COMPLETED:
            if "stage_id" not in v: raise ValueError("STAGE_COMPLETED requires 'stage_id'")
        return v

class EligibilityResult(BaseModel):
    eligible: bool
    rule_id: str
    certificate_type: str
    team_ids: List[str]
    evaluation_reason: str
