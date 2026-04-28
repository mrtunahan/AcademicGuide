# E2E Tests

Playwright tabanlı uçtan uca testler. Backend ve frontend ayakta olmalı.

## Çalıştırma

```bash
# 1) Backend ve frontend'i ayrı terminallerde başlatın (kök README'ye bkz)
make backend-dev    # ya da: cd backend && ./scripts/dev.sh
make frontend-dev   # ya da: cd frontend && npm run dev

# 2) E2E bağımlılıklarını kurun
cd e2e
npm install
npm run install-browsers

# 3) Testleri çalıştırın
npm test
# headed mode:
npm run test:headed
```

## CI

`.github/workflows/ci.yml` içindeki `e2e` job'u GitHub Actions `services` ile pgvector Postgres ayağa kaldırır, backend'i `uvicorn` ile başlatır, frontend'i `vite` ile başlatır, sonra Playwright çalıştırır. Docker Compose kullanılmaz.

> Not: E2E testleri LLM çağırmaz — sadece kayıt/giriş, proje oluşturma, navigasyon gibi akışları doğrular. Daha derin analiz/lint testleri pytest'in stub'lı `client` fixture'ı altında yapılır.
