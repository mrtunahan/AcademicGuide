# AcademicGuide

Akıllı 2209-Mentor Portalı — TÜBİTAK 2209-A/B başvurularında öğrenci raporlarını analiz eden ve danışman süreçlerini dijitalleştiren, **tamamen yerel çalışan** RAG tabanlı yapay zeka destekli mentorluk platformu.

> **Tasarım kararı:** Hiçbir bulut API'sine bağımlı değil. LLM (Ollama), embedding (BGE-M3) ve veritabanı (PostgreSQL + pgvector) — hepsi makinenizde çalışır.

## Mimari Özet

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│  React +     │ ───► │  FastAPI         │ ───► │  PostgreSQL + pgvector │
│  Tailwind    │      │  (RAG Engine)    │      │  (ilişkisel + vektör)  │
│  (Vite)      │ ◄─── │  LangChain       │      └────────────────────────┘
└──────────────┘      │                  │ ───► ┌────────────┐
                      │                  │      │  Ollama    │  (yerel LLM)
                      │                  │      └────────────┘
                      │                  │ ───► ┌────────────┐
                      │                  │      │  BGE-M3    │  (yerel embedding)
                      └──────────────────┘      └────────────┘
```

- **backend/** — FastAPI uygulaması, JWT auth, RAG boru hattı, PDF döküman ingest.
- **frontend/** — React + Tailwind (Vite), öğrenci ve danışman panelleri.
- **docs/** — Mimari, API ve iş paketi dokümanları (İP1–İP5).

## Özellikler

- 🔐 JWT tabanlı kayıt / giriş, rol bazlı erişim (`student`, `advisor`)
- 🧠 RAG `query` + bölüm bazlı `analysis/review` (5 TÜBİTAK kriteri)
- 🤖 Yerel **Ollama LLM** (varsayılan `qwen2.5:7b-instruct` — Türkçe destekli)
- 🌐 Yerel **BGE-M3** çok-dilli embedding (Türkçe dahil 100+ dil)
- 🗄️ Tek veri katmanı: PostgreSQL + pgvector
- 📄 PDF / TXT döküman yükleme → pgvector'a otomatik ingest
- ✍️ Akademik dil linter'ı (pasif yapı, 1. şahıs, gayri-resmi ton, tekrar)
- 💬 Yorumlar + danışman→öğrenci için **SSE canlı bildirim**
- 📊 Öğrenci proje listesi + revizyon geçmişi
- 🗂️ Danışman Kanban (`draft → review → approved`)

## Gereksinimler

| | Sürüm | Neden? |
|:---|:---|:---|
| **Python** | 3.11+ | Backend |
| **Node.js** | 20+ | Frontend |
| **PostgreSQL** | 16 | İlişkisel + vektör veri |
| **pgvector** | 0.5+ | PostgreSQL extension |
| **Ollama** | son sürüm | Yerel LLM runtime |
| **Disk** | ~10 GB | Modeller (BGE-M3 ~2.3 GB + Qwen2.5-7B ~4.7 GB) + Postgres veri |
| **RAM** | ≥ 8 GB | BGE-M3 ~2.5 GB + Qwen2.5-7B ~5 GB runtime |

## 1) Postgres + pgvector kurulumu

### macOS
```bash
brew install postgresql@16 pgvector
brew services start postgresql@16
createdb academicguide
psql academicguide -c "CREATE EXTENSION vector;"
```

### Ubuntu / Debian
```bash
sudo apt install -y postgresql-16 postgresql-16-pgvector
sudo -u postgres createuser -s "$USER"
createdb academicguide
psql academicguide -c "CREATE EXTENSION vector;"
```

### Windows
1. <https://www.postgresql.org/download/windows/> üzerinden Postgres 16'yı kurun.
2. <https://github.com/pgvector/pgvector#windows> talimatlarını izleyerek pgvector'u derleyin.
3. `psql -U postgres -d academicguide -c "CREATE EXTENSION vector;"`

### Şifre ayarlama
```bash
psql -d academicguide -c "ALTER USER academicguide WITH PASSWORD 'change_me';"
# veya kendi kullanıcı adınızla:
psql postgres -c "CREATE USER academicguide WITH PASSWORD 'change_me' SUPERUSER;"
psql postgres -c "GRANT ALL ON DATABASE academicguide TO academicguide;"
```

## 2) Ollama kurulumu

```bash
# Kurulum: https://ollama.com/download
# macOS/Linux tek komut:
curl -fsSL https://ollama.com/install.sh | sh

# Servisi başlat (genelde otomatik başlar)
ollama serve &

# Modeli indir (~4.7 GB, bir kerelik)
ollama pull qwen2.5:7b-instruct

# Test:
ollama run qwen2.5:7b-instruct "Merhaba, Türkçe bir cümle yaz."
```

> **Daha küçük model isterseniz:** `qwen2.5:3b-instruct` (~1.9 GB, ~3 GB RAM). `.env`'de `OLLAMA_MODEL`'i değiştirin.

## 3) Projeyi klonla + .env hazırla

```bash
git clone https://github.com/mrtunahan/AcademicGuide.git
cd AcademicGuide
cp .env.example .env
```

`.env` içinde **mutlaka** değiştirin:
```
POSTGRES_PASSWORD=guclu-bir-sifre
JWT_SECRET=en-az-32-karakter-rastgele-string
DATABASE_URL=postgresql+psycopg://academicguide:guclu-bir-sifre@localhost:5432/academicguide
```

## 4) Backend

```bash
cd backend

# Sanal ortam + bağımlılıklar (CPU torch wheel'i)
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install --extra-index-url https://download.pytorch.org/whl/cpu torch==2.5.1
pip install -r requirements.txt

# Migration'ları çalıştır
alembic upgrade head

# API'yi başlat
./scripts/dev.sh
# veya: uvicorn app.main:app --reload
```

API: <http://localhost:8000/docs>

## 5) Frontend

Yeni terminal:
```bash
cd frontend
npm install
npm run dev
```

Uygulama: <http://localhost:5173>

## 6) Makefile kısayolları

Proje kökünden:
```bash
make help             # tüm komutlar
make backend-install  # venv + bağımlılıklar
make backend-migrate  # alembic upgrade head
make backend-dev      # uvicorn --reload
make backend-test     # pytest
make frontend-install
make frontend-dev
make ollama-pull      # qwen2.5:7b-instruct indir
```

## İlk kullanım

1. <http://localhost:5173/register> → **öğrenci** hesabı
2. "Projelerim" → bir proje oluştur → projeye tıkla
3. Bölüm metni yapıştır → "Kriter Analizi"

> İlk analiz çağrısı 10–60 sn sürer (BGE-M3 ilk kez yüklenir + Ollama ilk model load yapıyor). Sonraki çağrılar saniyeler.

4. Ayrı bir tarayıcı (incognito) → **danışman** hesabı aç
5. Kanban'da projelerin status'unu değiştir, projelere yorum yaz
6. Öğrenci tarayıcısında 🔔 zilinde anlık bildirim (SSE)

## Sağlık kontrolü

```bash
# Backend
curl http://localhost:8000/health

# Postgres + pgvector
psql -d academicguide -c "SELECT extname, extversion FROM pg_extension WHERE extname='vector';"

# Ollama
curl http://localhost:11434/api/tags
```

## Test

```bash
# Backend (SQLite + LLM stub, Ollama gerektirmez)
cd backend && pytest -q

# E2E (yığın ayakta olmalı)
cd e2e && npm install && npm run install-browsers && npm test
```

## API Uç Noktaları (özet)

| Method | Path                                  | Açıklama                                   |
| :----- | :------------------------------------ | :----------------------------------------- |
| GET    | `/health`                             | Servis sağlık kontrolü                     |
| POST   | `/api/auth/register`                  | Hesap aç (öğrenci/danışman)                |
| POST   | `/api/auth/login`                     | Giriş yap                                  |
| GET    | `/api/projects`                       | Projeleri listele                          |
| POST   | `/api/projects`                       | Yeni proje oluştur (öğrenci)               |
| POST   | `/api/documents`                      | PDF/TXT yükle → RAG'a ekle                 |
| POST   | `/api/rag/query`                      | Bilgi tabanına semantik sorgu              |
| POST   | `/api/analysis/review`                | Bölüm bazlı kriter değerlendirmesi         |
| POST   | `/api/analysis/lint`                  | Akademik dil kontrolü                      |
| POST   | `/api/projects/{id}/comments`         | Yorum ekle                                 |
| GET    | `/api/notifications/stream?token=...` | SSE bildirim akışı                         |

Detaylar için bkz. [`docs/api.md`](docs/api.md).

## Sorun Giderme

| Belirti | Çözüm |
|:---|:---|
| `extension "vector" does not exist` | `psql -d academicguide -c "CREATE EXTENSION vector;"` |
| `connection refused` localhost:11434 | Ollama servisi durmuş — `ollama serve` çalıştırın |
| `model not found: qwen2.5:7b-instruct` | `ollama pull qwen2.5:7b-instruct` çalıştırın |
| Ollama yanıt çok yavaş | RAM yetersiz — `OLLAMA_MODEL=qwen2.5:3b-instruct` deneyin (~3 GB RAM) |
| BGE-M3 RAM aşıyor | `EMBEDDING_MODEL=intfloat/multilingual-e5-small` (~120 MB) |
| `bcrypt` hatası | `passlib` 1.7.4 + `bcrypt` 4.0.1 sabitlenmiş, requirements'tan emin olun |
| Migration "table already exists" | `psql -d academicguide -c "DROP TABLE alembic_version;"` ya da DB'yi sıfırlayın |
| Embedding boyutu değişti (model swap) | pgvector koleksiyonu sıfırla: `psql -d academicguide -c "DROP TABLE langchain_pg_collection CASCADE;"` |
| GPU kullanmak | `.env`'de `EMBEDDING_DEVICE=cuda`; Ollama otomatik GPU kullanır (CUDA / Metal / ROCm) |

## OpenAI'a geri dönmek (isteğe bağlı)

Eğer Ollama kurmak istemezseniz `.env`'de:
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

## Yol Haritası
İş paketleri için bkz. [`docs/work-packages.md`](docs/work-packages.md).
