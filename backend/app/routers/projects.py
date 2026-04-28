from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models import Project, ProjectStatus, User, UserRole
from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter()


def _to_response(project: Project) -> ProjectResponse:
    return ProjectResponse(
        id=project.id,
        title=project.title,
        abstract=project.abstract,
        status=project.status,
        student_id=project.student_id,
        student_name=project.student.full_name if project.student else "",
        advisor_id=project.advisor_id,
        ai_score=project.ai_score,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProjectResponse]:
    query = db.query(Project)
    if user.role == UserRole.student:
        query = query.filter(Project.student_id == user.id)
    projects = query.order_by(Project.updated_at.desc()).all()
    return [_to_response(p) for p in projects]


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    payload: ProjectCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    if user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sadece öğrenciler proje oluşturabilir",
        )
    project = Project(
        title=payload.title,
        abstract=payload.abstract,
        student_id=user.id,
        status=ProjectStatus.draft,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _to_response(project)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    if user.role == UserRole.student and project.student_id != user.id:
        raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")
    return _to_response(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")

    is_owner = project.student_id == user.id
    is_advisor = user.role == UserRole.advisor
    if not (is_owner or is_advisor):
        raise HTTPException(status_code=403, detail="Bu projeyi düzenleyemezsiniz")

    if payload.title is not None:
        project.title = payload.title
    if payload.abstract is not None:
        project.abstract = payload.abstract
    if payload.status is not None:
        project.status = payload.status
    if payload.advisor_id is not None and is_advisor:
        project.advisor_id = payload.advisor_id

    db.commit()
    db.refresh(project)
    return _to_response(project)


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    if project.student_id != user.id:
        raise HTTPException(status_code=403, detail="Bu projeyi silemezsiniz")
    db.delete(project)
    db.commit()
