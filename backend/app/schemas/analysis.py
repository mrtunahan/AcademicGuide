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
