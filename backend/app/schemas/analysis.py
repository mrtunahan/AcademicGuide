from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class SectionType(str, Enum):
    ozgun_deger = "ozgun_deger"
    yontem = "yontem"
    is_paketleri = "is_paketleri"
    yaygin_etki = "yaygin_etki"
    risk_yonetimi = "risk_yonetimi"


class ReviewRequest(BaseModel):
    section: SectionType
    text: str = Field(..., min_length=20)
    project_id: int | None = None


class Finding(BaseModel):
    severity: str
    message: str
    suggestion: str | None = None


class ReviewResponse(BaseModel):
    section: SectionType
    score: int = Field(..., ge=0, le=100)
    summary: str
    findings: list[Finding]
    citations: list[str] = Field(default_factory=list)


class ReviewHistoryItem(BaseModel):
    id: int
    section: SectionType
    score: int
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True
