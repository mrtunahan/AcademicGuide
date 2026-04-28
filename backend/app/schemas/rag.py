from pydantic import BaseModel, Field


class DocumentInput(BaseModel):
    content: str = Field(..., description="Düz metin döküman içeriği.")
    source: str = Field(..., description="Kaynak adı veya dosya yolu.")
    metadata: dict[str, str] = Field(default_factory=dict)


class IngestRequest(BaseModel):
    documents: list[DocumentInput]


class IngestResponse(BaseModel):
    chunks_added: int
    collection: str


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=4, ge=1, le=20)


class RetrievedChunk(BaseModel):
    content: str
    source: str
    score: float | None = None


class QueryResponse(BaseModel):
    answer: str
    chunks: list[RetrievedChunk]
