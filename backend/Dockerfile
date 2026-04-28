FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/data/hf \
    TRANSFORMERS_CACHE=/app/data/hf

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only torch wheel first to avoid pulling the large CUDA build.
# Override TORCH_INDEX_URL at build time to install a different wheel
# (e.g. a CUDA build for GPU deployments).
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install --extra-index-url "${TORCH_INDEX_URL}" torch==2.5.1

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["/app/entrypoint.sh"]
