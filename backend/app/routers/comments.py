from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models import Comment, Project, User, UserRole
from app.db.session import get_db
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.notifications import get_hub

router = APIRouter()


def _to_response(c: Comment) -> CommentResponse:
    return CommentResponse(
        id=c.id,
        project_id=c.project_id,
        author_id=c.author_id,
        author_name=c.author.full_name if c.author else "",
        body=c.body,
        created_at=c.created_at,
    )


def _assert_access(project: Project, user: User) -> None:
    if user.role == UserRole.student and project.student_id != user.id:
        raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")


@router.get("/projects/{project_id}/comments", response_model=list[CommentResponse])
def list_comments(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CommentResponse]:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    _assert_access(project, user)

    comments = (
        db.query(Comment)
        .filter(Comment.project_id == project_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [_to_response(c) for c in comments]


@router.post(
    "/projects/{project_id}/comments",
    response_model=CommentResponse,
    status_code=201,
)
async def create_comment(
    project_id: int,
    payload: CommentCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CommentResponse:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    _assert_access(project, user)

    comment = Comment(project_id=project_id, author_id=user.id, body=payload.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    response = _to_response(comment)

    recipient_id = (
        project.student_id if user.id != project.student_id else project.advisor_id
    )
    if recipient_id is not None:
        await get_hub().publish(
            recipient_id,
            event="comment.created",
            payload={
                "project_id": project_id,
                "project_title": project.title,
                "author_name": response.author_name,
                "body": response.body,
                "comment_id": response.id,
                "created_at": response.created_at.isoformat(),
            },
        )

    return response
