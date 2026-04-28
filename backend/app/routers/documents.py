from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.deps import get_current_user
from app.db.models import Document, Project, User, UserRole
from app.db.session import get_db
from app.schemas.document import DocumentResponse
from app.schemas.rag import DocumentInput
from app.services.extraction import extract_text
from app.services.rag import get_rag_service

router = APIRouter()


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    project_id: int | None = Form(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    settings = get_settings()
    data = await file.read()
    if len(data) > settings.upload_max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Dosya boyutu {settings.upload_max_mb} MB sınırını aşıyor",
        )

    if project_id is not None:
        project = db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Proje bulunamadı")
        if user.role == UserRole.student and project.student_id != user.id:
            raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")

    try:
        text = extract_text(file.filename or "upload", data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="Dosyadan metin çıkarılamadı")

    rag = get_rag_service()
    chunks_added = rag.ingest(
        documents=[
            DocumentInput(
                content=text,
                source=file.filename or "upload",
                metadata={
                    "project_id": str(project_id) if project_id else "",
                    "uploaded_by": str(user.id),
                },
            )
        ]
    )

    doc = Document(
        project_id=project_id,
        source=file.filename or "upload",
        chunks_added=chunks_added,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse.model_validate(doc)


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    project_id: int | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[DocumentResponse]:
    query = db.query(Document)
    if project_id is not None:
        project = db.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Proje bulunamadı")
        if user.role == UserRole.student and project.student_id != user.id:
            raise HTTPException(status_code=403, detail="Bu projeye erişim yetkiniz yok")
        query = query.filter(Document.project_id == project_id)
    elif user.role == UserRole.student:
        student_project_ids = [p.id for p in user.projects]
        query = query.filter(Document.project_id.in_(student_project_ids))

    docs = query.order_by(Document.created_at.desc()).all()
    return [DocumentResponse.model_validate(d) for d in docs]
