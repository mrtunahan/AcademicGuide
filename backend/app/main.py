from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import analysis, auth, documents, health, projects, rag

settings = get_settings()

app = FastAPI(
    title="AcademicGuide API",
    description="Akıllı 2209-Mentor Portalı — RAG tabanlı analiz servisi.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
