from fastapi import APIRouter, HTTPException

from app.schemas.analysis import ReviewRequest, ReviewResponse
from app.services.analysis import AnalysisService, get_analysis_service

router = APIRouter()


@router.post("/review", response_model=ReviewResponse)
async def review(payload: ReviewRequest) -> ReviewResponse:
    service: AnalysisService = get_analysis_service()
    try:
        result = service.review(section=payload.section, text=payload.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return ReviewResponse(**result)
