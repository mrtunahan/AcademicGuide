from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import analysis, health, rag

settings = get_settings()

app = FastAPI(
    title="AcademicGuide API",
    description="Akıllı 2209-Mentor Portalı — RAG tabanlı analiz servisi.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
