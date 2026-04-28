#!/usr/bin/env bash
set -e

echo "[entrypoint] running database migrations..."
alembic upgrade head || echo "[entrypoint] migrations failed (continuing)"

echo "[entrypoint] starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
