from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models import ProjectStatus


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    abstract: str | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    abstract: str | None = None
    status: ProjectStatus | None = None
    advisor_id: int | None = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    abstract: str | None
    status: ProjectStatus
    student_id: int
    student_name: str
    advisor_id: int | None
    ai_score: int | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
