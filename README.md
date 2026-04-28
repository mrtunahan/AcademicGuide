# AcademicGuide

Akıllı 2209-Mentor Portalı — TÜBİTAK 2209-A/B başvurularında öğrenci raporlarını analiz eden ve danışman süreçlerini dijitalleştiren, RAG tabanlı yapay zeka destekli mentorluk platformu.

## Mimari Özet

```
┌──────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│  React +     │ ───► │  FastAPI         │ ───► │  PostgreSQL + pgvector │
│  Tailwind    │      │  (RAG Engine)    │      │  (ilişkisel + vektör)  │
│  (Vite)      │ ◄─── │  LangChain       │ ◄──► │                        │
└──────────────┘      └──────────────────┘      └────────────────────────┘
```

Tek bir Postgres instance hem ilişkisel veriyi (kullanıcı, proje, yorum, döküman) hem de embedding vektörlerini (`vector` extension'ı ile) barındırır.

- **backend/** — FastAPI uygulaması, JWT auth, RAG boru hattı, PDF döküman ingest.
- **frontend/** — React + Tailwind (Vite), öğrenci ve danışman panelleri.
- **docs/** — Mimari, API ve iş paketi dokümanları (İP1–İP5).

## Özellikler

- 🔐 JWT tabanlı kayıt / giriş, rol bazlı erişim (`student`, `advisor`)
- 📄 PDF / TXT döküman yükleme → pgvector'a otomatik ingest
- 🧠 RAG `query` + bölüm bazlı `analysis/review` (5 TÜBİTAK kriteri)
- 🗄️ Tek veri katmanı: PostgreSQL + pgvector (Chroma yok)
- 🌐 Yerel **BGE-M3** çok-dilli embedding (Türkçe dahil 100+ dil, dış API'siz)
- ✍️ Akademik dil linter'ı (pasif yapı, 1. şahıs, gayri-resmi ton, tekrar)
- 💬 Yorumlar + danışman→öğrenci için **SSE canlı bildirim**
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
- PostgreSQL + pgvector: `localhost:5432` (kullanıcı `academicguide`)

### Hesap Oluşturma

`/register` sayfasından:
1. Bir öğrenci hesabı açın → proje oluşturup taslak metin gönderin.
2. Bir danışman hesabı açın → Kanban üzerinde projelerin durumunu yönetin.

> Not: LLM çağrıları (review, query, lint) için `.env`'de geçerli bir `OPENAI_API_KEY` olmalı. **Embedding** tarafı varsayılan olarak BGE-M3 ile yerelde çalışır, internet bağlantısı yalnızca ilk model indirmesinde gerekir (~2.3 GB).
>
> İsterseniz embedding'i de OpenAI'a çevirebilirsiniz: `.env`'de
> ```
> EMBEDDING_PROVIDER=openai
> EMBEDDING_MODEL=text-embedding-3-small
> ```

## Yerel Geliştirme (Docker'sız)

İki ayrı terminalde çalıştırın.

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate

# CPU-only torch wheel (BGE-M3 için)
pip install --extra-index-url https://download.pytorch.org/whl/cpu \
  torch==2.5.1
pip install -r requirements.txt

# Postgres (pgvector image) için docker compose'u kullanmak en kolayı:
docker compose up postgres -d

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
| `extension "vector" does not exist`        | `pgvector/pgvector:pg16` imajının çalıştığını doğrulayın; eski `postgres:16-alpine` volume'unu silin (`docker compose down -v`) |
| Migration "table already exists"           | `docker compose down -v` ile volume'ları temizleyin                  |
| `OPENAI_API_KEY` boş → 500                 | `.env`'e geçerli anahtar koyup container'ı yeniden başlatın          |
| İlk ingest çok yavaş                       | İlk çağrıda BGE-M3 (~2.3 GB) indirilir; `hf_cache` volume'u sayesinde sonrakiler anlık |
| BGE-M3 belleği aşıyor                      | `.env`'de `EMBEDDING_PROVIDER=openai` veya küçük bir alternatif (`intfloat/multilingual-e5-small`) deneyin |
| GPU kullanmak                              | `.env`'de `EMBEDDING_DEVICE=cuda`; Dockerfile'ı CUDA torch wheel ile yeniden build edin (`TORCH_INDEX_URL`) |
| Embedding boyutu değişti (model swap)      | pgvector koleksiyonunu sıfırlayın: `docker compose down -v` ya da Postgres'te `langchain_pg_*` tablolarını drop edin |

## Yol Haritası
İş paketleri için bkz. [`docs/work-packages.md`](docs/work-packages.md).
