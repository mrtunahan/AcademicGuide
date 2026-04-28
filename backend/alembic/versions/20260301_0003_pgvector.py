"""enable pgvector extension

Revision ID: 0003_pgvector
Revises: 0002_comments
Create Date: 2026-03-01 00:00:00

"""
from collections.abc import Sequence

from alembic import op

revision: str = "0003_pgvector"
down_revision: str | None = "0002_comments"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS vector")
