from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models import Project, Review, User, UserRole
from app.db.session import get_db
from app.schemas.analysis import (
    LintRequest,
    LintResponse,
    ReviewHistoryItem,
    ReviewRequest,
    ReviewResponse,
)
from app.services.analysis import AnalysisService, get_analysis_service

router = APIRouter()


@router.post("/review", response_model=ReviewResponse)
def review(
    payload: ReviewRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    service: AnalysisService = get_analysis_service()
    try:
        result = service.review(section=payload.section, text=payload.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if payload.project_id is not None:
        project = db.get(Project, payload.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Proje bulunamadı")
        if user.role == UserRole.student and project.student_id != user.id:
            raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")

        review_row = Review(
            project_id=project.id,
            section=payload.section.value,
            text=payload.text,
            score=result["score"],
            summary=result["summary"],
            findings=[f for f in result["findings"]],
            citations=result["citations"],
        )
        db.add(review_row)

        if project.ai_score is None or result["score"] > project.ai_score:
            project.ai_score = result["score"]
        db.commit()

    return ReviewResponse(**result)


@router.post("/lint", response_model=LintResponse)
def lint(
    payload: LintRequest,
    _: User = Depends(get_current_user),
) -> LintResponse:
    service: AnalysisService = get_analysis_service()
    try:
        result = service.lint(text=payload.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return LintResponse(**result)


@router.get("/projects/{project_id}/reviews", response_model=list[ReviewHistoryItem])
def list_reviews(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ReviewHistoryItem]:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    if user.role == UserRole.student and project.student_id != user.id:
        raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")

    reviews = (
        db.query(Review)
        .filter(Review.project_id == project_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [ReviewHistoryItem.model_validate(r) for r in reviews]
