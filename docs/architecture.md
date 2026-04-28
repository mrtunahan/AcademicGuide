# Mimari

## Katmanlar

### 1. Veri ve Bilgi Tabanı (RAG Engine)
- **Bilgi Kaynağı:** TÜBİTAK 2209 çağrı rehberleri, form şablonları, etik kurul yönergeleri, anonimleştirilmiş başarılı proje örnekleri.
- **Vektör DB:** ChromaDB (varsayılan), gerekirse Pinecone'a taşınabilir.
- **Embedding:** `text-embedding-3-small` (OpenAI) — alternatif olarak `BAAI/bge-m3` (HuggingFace).
- **Chunking:** `RecursiveCharacterTextSplitter` (chunk=800, overlap=120).

### 2. Analiz ve Mentorluk Modülü (AI Agent)
- **Semantik Denetleyici:** `Özgün Değer` metnini retrieval ile literatüre göre puanlar.
- **Kriter Bazlı Değerlendirme:** Bölüm bazında JSON çıktı üreten LLM çağrısı (`/api/analysis/review`).
- **Akademik Dil Düzeltici:** (yol haritasında) pasif yapı, nesnellik kontrolü.

### 3. Uygulama ve Arayüz
- **Öğrenci Paneli:** Bölüm seçimi + metin gönderimi + skor & findings görüntüleme.
- **Danışman Paneli:** Kanban ilerleme görünümü, AI ön değerlendirme skorları.

## Servisler arası iletişim

```
React (Vite) ──HTTP──> FastAPI ──> ChromaDB (HTTP)
                            └──> PostgreSQL (psycopg)
                            └──> OpenAI / HuggingFace
```

## Teknoloji Yığını

| Bileşen        | Seçim              |
| :------------- | :----------------- |
| Backend        | Python / FastAPI   |
| Frontend       | React + Tailwind   |
| Orchestration  | LangChain          |
| RDBMS          | PostgreSQL 16      |
| Vector Store   | ChromaDB 0.5       |
| Container      | Docker Compose     |
