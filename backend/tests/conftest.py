from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.deps import get_current_user
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.routers import analysis as analysis_router
from app.routers import documents as documents_router


class FakeAnalysisService:
    def review(self, section, text):
        return {
            "section": section,
            "score": 75,
            "summary": "Stubbed review",
            "findings": [
                {
                    "severity": "low",
                    "message": "Stub finding",
                    "suggestion": "Stub suggestion",
                }
            ],
            "citations": ["stub.pdf"],
        }

    def lint(self, text):
        return {
            "issues": [
                {
                    "type": "passive_voice",
                    "original": "yapıldı",
                    "suggestion": "yapılmıştır",
                    "explanation": "Akademik üslup",
                }
            ],
            "rewritten": text,
        }


class FakeRAGService:
    def ingest(self, documents):
        total = sum(max(1, len(d.content) // 500) for d in documents)
        return total

    def query(self, question, top_k=4):
        return {
            "answer": "Stub answer",
            "chunks": [{"content": "stub", "source": "stub.pdf", "score": 0.1}],
        }


@pytest.fixture()
def db_session() -> Iterator[Session]:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.fixture()
def client(db_session: Session) -> Iterator[TestClient]:
    def _get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _get_db

    fake_analysis = FakeAnalysisService()
    fake_rag = FakeRAGService()
    analysis_router.get_analysis_service = lambda: fake_analysis
    documents_router.get_rag_service = lambda: fake_rag

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides.pop(get_current_user, None)


def auth_headers(client: TestClient, email: str, password: str, role: str, full_name: str) -> dict:
    res = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "role": role,
            "full_name": full_name,
        },
    )
    assert res.status_code == 201, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
