# API Referansı (v0.1)

Tüm endpoint'ler `application/json` ile çalışır.

## `GET /health`

Servis sağlık kontrolü.

```json
{ "status": "ok" }
```

## `POST /api/rag/ingest`

Bilgi tabanına bir veya birden fazla döküman ekler.

### Request
```json
{
  "documents": [
    {
      "content": "TÜBİTAK 2209-A başvurularında özgün değer...",
      "source": "rehber-2025.pdf",
      "metadata": { "category": "rehber" }
    }
  ]
}
```

### Response
```json
{ "chunks_added": 12, "collection": "tubitak_2209" }
```

## `POST /api/rag/query`

Bilgi tabanına semantik sorgu yapar, LLM ile yanıt üretir.

### Request
```json
{ "question": "Yaygın etki bölümünde neler beklenir?", "top_k": 4 }
```

### Response
```json
{
  "answer": "Yaygın etki bölümünde...",
  "chunks": [
    { "content": "...", "source": "rehber-2025.pdf", "score": 0.18 }
  ]
}
```

## `POST /api/analysis/review`

Öğrenci metnini bölüm bazlı kriterlere göre değerlendirir.

### Request
```json
{
  "section": "ozgun_deger",
  "text": "Bu çalışmada önerdiğimiz yöntem..."
}
```

### Geçerli `section` değerleri
`ozgun_deger`, `yontem`, `is_paketleri`, `yaygin_etki`, `risk_yonetimi`

### Response
```json
{
  "section": "ozgun_deger",
  "score": 72,
  "summary": "Metin özgün bir bakış açısı sunuyor ancak literatür referansları zayıf.",
  "findings": [
    {
      "severity": "medium",
      "message": "Literatür karşılaştırması yetersiz.",
      "suggestion": "Son 3 yılda yayınlanmış 2-3 referansla farkı vurgulayın."
    }
  ],
  "citations": ["rehber-2025.pdf"]
}
```
