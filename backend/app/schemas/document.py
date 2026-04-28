from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    source: str
    chunks_added: int
    project_id: int | None
    created_at: datetime

    class Config:
        from_attributes = True
