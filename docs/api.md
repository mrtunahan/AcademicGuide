# API Referansı (v0.2)

Tüm endpoint'ler `application/json` ile çalışır. Auth gerektiren endpoint'ler `Authorization: Bearer <token>` başlığı bekler.

## Sağlık

### `GET /health`
```json
{ "status": "ok" }
```

## Auth

### `POST /api/auth/register`
```json
{
  "email": "ogrenci@uni.edu.tr",
  "full_name": "Ayşe Yılmaz",
  "password": "guclu-sifre",
  "role": "student"
}
```
**201**:
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": { "id": 1, "email": "...", "full_name": "...", "role": "student" }
}
```

### `POST /api/auth/login`
```json
{ "email": "...", "password": "..." }
```
Response: `register` ile aynı şema.

### `GET /api/auth/me`
Aktif kullanıcı bilgisi (`User` şeması).

## Projeler

> Öğrenciler sadece kendi projelerini görür/düzenler. Danışmanlar tüm projeleri görür ve `status`/`advisor_id` günceller.

### `GET /api/projects`
Projeler dizisi. Boş array dönerse yetki bağlamına göre proje yok demektir.

### `POST /api/projects` (öğrenci)
```json
{ "title": "Proje başlığı", "abstract": "Kısa özet" }
```

### `PATCH /api/projects/{id}`
```json
{ "status": "review" }
```
Geçerli alanlar: `title`, `abstract`, `status` (`draft|review|approved`), `advisor_id` (sadece danışman).

### `DELETE /api/projects/{id}` (proje sahibi)
204 döner.

## Dökümanlar

### `POST /api/documents` (multipart/form-data)
Alanlar:
- `file`: `.pdf`, `.txt` veya `.md` (varsayılan max 25MB)
- `project_id` (opsiyonel): hangi projeye bağlanacak

**201**:
```json
{
  "id": 12,
  "source": "rehber-2025.pdf",
  "chunks_added": 18,
  "project_id": 3,
  "created_at": "2026-04-28T10:00:00Z"
}
```

### `GET /api/documents?project_id=3`
Filtreli liste; `project_id` verilmezse erişim yetkisi olan tüm dökümanlar.

## RAG

### `POST /api/rag/ingest`
```json
{
  "documents": [
    { "content": "...", "source": "rehber.pdf", "metadata": {} }
  ]
}
```

### `POST /api/rag/query`
```json
{ "question": "Yaygın etki bölümünde neler beklenir?", "top_k": 4 }
```
**200**:
```json
{
  "answer": "Yaygın etki bölümünde...",
  "chunks": [
    { "content": "...", "source": "rehber-2025.pdf", "score": 0.18 }
  ]
}
```

## Analiz

### `POST /api/analysis/review`
```json
{
  "section": "ozgun_deger",
  "text": "...",
  "project_id": 3
}
```

`section` ∈ `ozgun_deger | yontem | is_paketleri | yaygin_etki | risk_yonetimi`

`project_id` verilirse review DB'ye kaydedilir ve projenin `ai_score`'u güncellenir.

**200**:
```json
{
  "section": "ozgun_deger",
  "score": 72,
  "summary": "...",
  "findings": [
    { "severity": "medium", "message": "...", "suggestion": "..." }
  ],
  "citations": ["rehber-2025.pdf"]
}
```

### `GET /api/analysis/projects/{id}/reviews`
Bir proje için review geçmişi (en yeniden eskiye).
