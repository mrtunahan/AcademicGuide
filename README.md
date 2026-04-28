# AcademicGuide

Akıllı 2209-Mentor Portalı — TÜBİTAK 2209-A/B başvurularında öğrenci raporlarını analiz eden ve danışman süreçlerini dijitalleştiren, RAG tabanlı yapay zeka destekli mentorluk platformu.

## Mimari Özet

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────┐
│  React +     │ ───► │  FastAPI         │ ───► │  PostgreSQL  │
│  Tailwind    │      │  (RAG Engine)    │      └──────────────┘
│  (Vite)      │ ◄─── │  LangChain       │ ◄──► ┌──────────────┐
└──────────────┘      └──────────────────┘      │  ChromaDB    │
                                                 └──────────────┘
```

- **backend/** — FastAPI uygulaması, RAG boru hattı, ingest/query endpoint'leri.
- **frontend/** — React + Tailwind (Vite) öğrenci ve danışman panelleri.
- **docs/** — İş paketi notları (İP1–İP5) ve mimari kararlar.

## Hızlı Başlangıç

```bash
cp .env.example .env
# .env içinde OPENAI_API_KEY ve POSTGRES_PASSWORD değerlerini güncelleyin
docker compose up --build
```

Servisler:
- Backend API: http://localhost:8000  (Swagger: `/docs`)
- Frontend: http://localhost:5173
- PostgreSQL: `localhost:5432`
- ChromaDB: http://localhost:8001

## Yerel Geliştirme (Docker'sız)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Uç Noktaları (özet)

| Method | Path                    | Açıklama                                         |
| :----- | :---------------------- | :----------------------------------------------- |
| GET    | `/health`               | Servis sağlık kontrolü                           |
| POST   | `/api/rag/ingest`       | Bilgi tabanına döküman ekler                     |
| POST   | `/api/rag/query`        | Semantik sorgu — TÜBİTAK rehberinden yanıt üretir|
| POST   | `/api/analysis/review`  | Öğrenci metnini kriter bazlı değerlendirir       |

## Yol Haritası
İş paketleri için bkz. [`docs/work-packages.md`](docs/work-packages.md).
