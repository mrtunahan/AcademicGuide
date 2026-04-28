#!/usr/bin/env bash
set -euo pipefail

# Backend dev helper: load .env, run migrations, start uvicorn with --reload.
#
# Usage:
#   cd backend
#   ./scripts/dev.sh

cd "$(dirname "$0")/.."

if [[ ! -d .venv ]]; then
  echo "[dev] .venv not found. Run:"
  echo "  python -m venv .venv && source .venv/bin/activate"
  echo "  pip install --extra-index-url https://download.pytorch.org/whl/cpu torch==2.5.1"
  echo "  pip install -r requirements.txt"
  exit 1
fi

# shellcheck disable=SC1091
source .venv/bin/activate

if [[ -f ../.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ../.env
  set +a
fi

echo "[dev] running migrations..."
alembic upgrade head

echo "[dev] starting uvicorn..."
exec uvicorn app.main:app --reload --host "${APP_HOST:-0.0.0.0}" --port "${APP_PORT:-8000}"
