from datetime import datetime

from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=4000)


class CommentResponse(BaseModel):
    id: int
    project_id: int
    author_id: int
    author_name: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True
