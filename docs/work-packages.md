# İş Paketleri (12 Ay)

## İP1 — Gereksinim Analizi & Bilgi Tabanı (1–2. Ay)
- TÜBİTAK 2209 dokümanlarının derlenmesi
- Vektör veritabanına ingest edilmesi (`/api/rag/ingest`)
- Prompt mühendisliği stratejilerinin belirlenmesi
- **Çıktı:** Doldurulmuş ChromaDB koleksiyonu, `prompts/` rehberi.

## İP2 — AI Analiz Motoru (3–5. Ay)
- RAG boru hattının kurulması (✅ iskeleti hazır)
- Semantik denetim algoritmaları
- Bölüm bazlı rubric'lerin genişletilmesi
- (Opsiyonel) Açık kaynaklı modellerle fine-tuning testi
- **Çıktı:** `app/services/analysis.py` üzerinde 5 bölüm için doğrulanmış değerlendirme.

## İP3 — Web Portalı & Dashboard (6–8. Ay)
- Öğrenci taslak yükleme + revizyon geçmişi (PostgreSQL)
- Danışman Kanban (✅ mock hazır)
- Gerçek zamanlı bildirim (WebSocket veya SSE)
- Kimlik doğrulama (üniversite SSO / e-Devlet entegrasyon değerlendirmesi)
- **Çıktı:** Üretim ready frontend + auth.

## İP4 — Pilot & Doğrulama (9–10. Ay)
- Bir fakültede aktif test
- Akademisyenlerin AI geri bildirimini puanlaması
- A/B karşılaştırma: AI'lı vs. AI'sız taslakların elenme oranı
- **Çıktı:** Pilot raporu, doğruluk metrikleri.

## İP5 — Optimizasyon & Kapanış (11–12. Ay)
- Performans iyileştirmeleri (cache, batch embedding)
- Hata düzeltme
- TÜBİTAK sonuç raporu
- **Çıktı:** v1.0 sürüm + sonuç raporu.
