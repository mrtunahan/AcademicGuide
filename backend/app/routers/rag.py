from fastapi import APIRouter, HTTPException

from app.schemas.rag import (
    IngestRequest,
    IngestResponse,
    QueryRequest,
    QueryResponse,
)
from app.services.rag import RAGService, get_rag_service

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
async def ingest(payload: IngestRequest) -> IngestResponse:
    service: RAGService = get_rag_service()
    try:
        added = service.ingest(documents=payload.documents)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return IngestResponse(chunks_added=added, collection=service.collection_name)


@router.post("/query", response_model=QueryResponse)
async def query(payload: QueryRequest) -> QueryResponse:
    service: RAGService = get_rag_service()
    try:
        result = service.query(question=payload.question, top_k=payload.top_k)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return QueryResponse(**result)
