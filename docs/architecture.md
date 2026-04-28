# Mimari

## Katmanlar

### 1. Veri ve Bilgi Tabanı (RAG Engine)
- **Bilgi Kaynağı:** TÜBİTAK 2209 çağrı rehberleri, form şablonları, etik kurul yönergeleri, anonimleştirilmiş başarılı proje örnekleri.
- **Vektör DB:** **PostgreSQL + pgvector** — ilişkisel veriyle aynı instance üzerinde çalışır. Ayrı bir Chroma süreci yoktur; backup, replikasyon, transaction yönetimi tek noktadan yapılır.
  - Schema: `langchain-postgres` paketi `langchain_pg_collection` ve `langchain_pg_embedding` tablolarını yönetir; embedding'ler `vector` tipi sütunda durur.
  - Extension `0003_pgvector` migration'ında `CREATE EXTENSION IF NOT EXISTS vector` ile etkinleştirilir.
  - Koleksiyon adı `VECTOR_COLLECTION` env değişkeni ile (varsayılan `tubitak_2209`).
- **Embedding:** `BAAI/bge-m3` (HuggingFace, varsayılan) — Türkçe dahil 100+ dilde yüksek kaliteli, 1024 boyutlu çok-dilli embedding modeli. Yerel olarak çalışır, dış API çağrısı yapmaz.
  - Alternatif: `EMBEDDING_PROVIDER=openai` ile `text-embedding-3-small` (API maliyeti var, daha hızlı cold start).
  - Donanım: CPU'da çalışır (~1-3 sn / chunk); GPU varsa `EMBEDDING_DEVICE=cuda` ile 10-50x hızlanır.
  - Model boyutu ~2.3 GB, ilk indirme `hf_cache` named volume'una düşer; sonraki başlatmalar anlık.
- **Chunking:** `RecursiveCharacterTextSplitter` (chunk=800, overlap=120).

### 2. Analiz ve Mentorluk Modülü (AI Agent)
- **Semantik Denetleyici:** `Özgün Değer` metnini retrieval ile literatüre göre puanlar.
- **Kriter Bazlı Değerlendirme:** Bölüm bazında JSON çıktı üreten LLM çağrısı (`/api/analysis/review`).
- **Akademik Dil Düzeltici:** Pasif yapı, 1. şahıs, gayri-resmi ton, tekrar ve belirsizlik için `/api/analysis/lint`.
- **LLM:** Yerel **Ollama** (`qwen2.5:7b-instruct`, varsayılan). `LLM_PROVIDER=openai` ile bulut LLM'e geçilebilir. `app/services/llm.py` içindeki `build_llm()` fabrikası iki provider arasındaki seçimi yönetir; lazy import sayesinde kullanılmayan stack'in import maliyeti yoktur.

### 3. Uygulama ve Arayüz
- **Öğrenci Paneli:** Bölüm seçimi + metin gönderimi + skor & findings görüntüleme; PDF/TXT yükleme; SSE bildirimleri.
- **Danışman Paneli:** Kanban ilerleme görünümü, AI ön değerlendirme skorları, yorum gönderme.

## Servisler arası iletişim

```
React (Vite) ──HTTP──> FastAPI ──> PostgreSQL + pgvector (psycopg)
                            ├──> Ollama (yerel LLM, HTTP)
                            └──> HuggingFace (BGE-M3 embedding, in-process)
```

## Teknoloji Yığını

| Bileşen        | Seçim                                  |
| :------------- | :------------------------------------- |
| Backend        | Python 3.11 / FastAPI                  |
| Frontend       | React 18 + Tailwind (Vite)             |
| Orchestration  | LangChain (`langchain-postgres`)       |
| RDBMS + Vector | PostgreSQL 16 + pgvector               |
| Embedding      | BAAI/bge-m3 (HF) veya OpenAI           |
| LLM            | Ollama (qwen2.5:7b-instruct) veya OpenAI |
| Geliştirme     | Yerel — Docker yok                     |

## Tek veri katmanına geçişin neden faydası var?

- **Tek backup, tek restore.** Ilişkisel veri ve vektörler aynı `pg_dump` içinde.
- **Transaction tutarlılığı.** Bir döküman silindiğinde embedding'leri de aynı transaction'da silinebilir.
- **Daha az bağımlı servis.** Önceki yapıda Chroma 0.5 sürekli kendi storage'ını yönetiyordu; artık tek bir ops yüzeyi.
- **Düşük kaynak.** Geliştirme ortamında ayrı bir process daha az.
- **Filtre + benzerlik birlikte.** SQL `WHERE project_id = ... ORDER BY embedding <=> $1` gibi sorgular doğal.
