.PHONY: help backend-install backend-migrate backend-dev backend-test backend-lint frontend-install frontend-dev frontend-build e2e-install e2e-test ollama-pull

help:
	@echo "AcademicGuide — yerel geliştirme komutları"
	@echo ""
	@echo "  make backend-install   — venv kur ve bağımlılıkları yükle (CPU torch)"
	@echo "  make backend-migrate   — alembic upgrade head"
	@echo "  make backend-dev       — uvicorn --reload"
	@echo "  make backend-test      — pytest"
	@echo "  make backend-lint      — ruff check"
	@echo ""
	@echo "  make frontend-install  — npm install"
	@echo "  make frontend-dev      — vite dev server"
	@echo "  make frontend-build    — production build + tsc"
	@echo ""
	@echo "  make ollama-pull       — varsayılan modeli (qwen2.5:7b-instruct) indir"
	@echo ""
	@echo "  make e2e-install       — Playwright + chromium kur"
	@echo "  make e2e-test          — Playwright testleri (yığın ayakta olmalı)"

backend-install:
	cd backend && python -m venv .venv && \
	  .venv/bin/pip install --upgrade pip && \
	  .venv/bin/pip install --extra-index-url https://download.pytorch.org/whl/cpu torch==2.5.1 && \
	  .venv/bin/pip install -r requirements.txt

backend-migrate:
	cd backend && set -a && [ -f ../.env ] && . ../.env; set +a && \
	  .venv/bin/alembic upgrade head

backend-dev:
	cd backend && ./scripts/dev.sh

backend-test:
	cd backend && .venv/bin/pytest -q

backend-lint:
	cd backend && .venv/bin/ruff check .

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

ollama-pull:
	@command -v ollama >/dev/null 2>&1 || { \
	  echo "Ollama yüklü değil. https://ollama.com/download adresinden kurun"; exit 1; }
	ollama pull qwen2.5:7b-instruct

e2e-install:
	cd e2e && npm install && npx playwright install --with-deps chromium

e2e-test:
	cd e2e && npm test
