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

- **backend/** — FastAPI uygulaması, JWT auth, RAG boru hattı, PDF döküman ingest.
- **frontend/** — React + Tailwind (Vite), öğrenci ve danışman panelleri.
- **docs/** — Mimari, API ve iş paketi dokümanları (İP1–İP5).

## Özellikler

- 🔐 JWT tabanlı kayıt / giriş, rol bazlı erişim (`student`, `advisor`)
- 📄 PDF / TXT döküman yükleme → ChromaDB'ye otomatik ingest
- 🧠 RAG `query` + bölüm bazlı `analysis/review` (5 TÜBİTAK kriteri)
- 📊 Öğrenci proje listesi + revizyon geçmişi (PostgreSQL)
- 🗂️ Danışman Kanban (`draft → review → approved`) — gerçek API'ye bağlı

## Hızlı Başlangıç (Docker)

Lokalde tek komutla ayağa kaldırma:

```bash
git clone <repo-url> AcademicGuide
cd AcademicGuide
cp .env.example .env
# .env içinde POSTGRES_PASSWORD'ü değiştirin, OPENAI_API_KEY'inizi ekleyin
docker compose up --build
```

İlk açılışta backend container'ı `alembic upgrade head` çalıştırır ve şemayı hazırlar.

Servisler:
- Frontend: <http://localhost:5173>
- Backend API + Swagger: <http://localhost:8000/docs>
- PostgreSQL: `localhost:5432` (kullanıcı `academicguide`)
- ChromaDB: <http://localhost:8001>

### Hesap Oluşturma

`/register` sayfasından:
1. Bir öğrenci hesabı açın → proje oluşturup taslak metin gönderin.
2. Bir danışman hesabı açın → Kanban üzerinde projelerin durumunu yönetin.

> Not: `/api/analysis/review` ve `/api/rag/query` çağrıları için `.env`'de geçerli bir `OPENAI_API_KEY` olmalı. Aksi durumda 500 dönecektir.

## Yerel Geliştirme (Docker'sız)

İki ayrı terminalde çalıştırın.

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Postgres + Chroma için yine docker compose'u kullanmak en kolayı:
docker compose up postgres chroma -d

# Migration:
export $(grep -v '^#' ../.env | xargs)   # .env'i yükle
alembic upgrade head

# API'yi başlat:
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak `VITE_API_BASE_URL=http://localhost:8000` ile çalışır.

## API Uç Noktaları (özet)

| Method | Path                                  | Açıklama                                          |
| :----- | :------------------------------------ | :------------------------------------------------ |
| GET    | `/health`                             | Servis sağlık kontrolü                            |
| POST   | `/api/auth/register`                  | Hesap aç (öğrenci/danışman)                       |
| POST   | `/api/auth/login`                     | Giriş yap, JWT al                                 |
| GET    | `/api/auth/me`                        | Aktif kullanıcıyı döner                           |
| GET    | `/api/projects`                       | Projeleri listele (rol bazlı filtre)              |
| POST   | `/api/projects`                       | Yeni proje oluştur (öğrenci)                      |
| PATCH  | `/api/projects/{id}`                  | Proje güncelle (status, advisor_id, vb.)          |
| POST   | `/api/documents`                      | PDF/TXT yükle → RAG'a ekle (multipart)            |
| GET    | `/api/documents`                      | Dökümanları listele                               |
| POST   | `/api/rag/ingest`                     | Düz metin döküman ekle                            |
| POST   | `/api/rag/query`                      | Bilgi tabanına semantik sorgu                     |
| POST   | `/api/analysis/review`                | Bölüm bazlı kriter değerlendirmesi                |
| GET    | `/api/analysis/projects/{id}/reviews` | Proje için revizyon geçmişi                       |

Detaylar için bkz. [`docs/api.md`](docs/api.md).

## Sorun Giderme

| Belirti                                    | Çözüm                                                                |
| :----------------------------------------- | :------------------------------------------------------------------- |
| `bcrypt` hatası                            | `passlib` 1.7.4 + `bcrypt` 4.0.1 sabitlenmiş, requirements'tan emin olun |
| Backend `connection refused` Chroma        | İlk açılışta Chroma yavaş başlar → 5–10 sn bekleyin / yeniden deneyin |
| Migration "table already exists"           | `docker compose down -v` ile volume'ları temizleyin                  |
| `OPENAI_API_KEY` boş → 500                 | `.env`'e geçerli anahtar koyup container'ı yeniden başlatın          |

## Yol Haritası
İş paketleri için bkz. [`docs/work-packages.md`](docs/work-packages.md).
