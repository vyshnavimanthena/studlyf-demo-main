from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone


class QuestionResult(BaseModel):
    questionId:         int
    questionType:       str
    topic:              str
    score:              int
    verdict:            str
    answer:             str
    strengths:          List[str] = []
    gaps:               List[str] = []
    idealApproach:      Optional[str] = None
    interviewReadiness: Optional[int] = None


class MistakeAnalysis(BaseModel):
    questionId:            int
    questionNumber:        int
    topic:                 str
    questionType:          str
    score:                 int
    mistake:               str
    expectedApproach:      str
    improvementSuggestion: str


class SaveAssessmentRequest(BaseModel):
    userId:             str
    skillId:            str
    skillName:          str
    score:              int
    interviewReadiness: int
    level:              str
    strengths:          List[str]
    weaknesses:         List[str]
    weakAreas:          List[str] = []
    questionResults:    List[QuestionResult]
    mistakeAnalysis:    List[MistakeAnalysis] = []
    completedAt:        datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class AssessmentResponse(BaseModel):
    assessmentId:       str
    userId:             str
    skillId:            str
    skillName:          str
    icon:               Optional[str] = None
    score:              int
    interviewReadiness: int
    level:              str
    strengths:          List[str]
    weaknesses:         List[str]
    weakAreas:          List[str] = []
    questionResults:    List[QuestionResult]
    mistakeAnalysis:    List[MistakeAnalysis] = []
    completedAt:        datetime
    createdAt:          Optional[datetime] = None