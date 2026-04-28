# E2E Tests

Playwright tabanlı uçtan uca testler. Backend ve frontend ayakta olmalı.

## Çalıştırma

```bash
# 1) Yığını ayağa kaldır (başka bir terminalde)
docker compose up

# 2) Bağımlılıkları kur
cd e2e
npm install
npm run install-browsers

# 3) Testleri çalıştır
npm test
# headed mode için:
npm run test:headed
```

## CI

`.github/workflows/ci.yml` içindeki `e2e` job'u backend + frontend'i Docker ile başlatır, sonra Playwright'ı çalıştırır.

> Not: E2E testleri OpenAI API'sine erişmez — sadece kayıt/giriş, proje oluşturma, navigasyon gibi LLM gerektirmeyen akışları doğrular. Daha derin analiz/lint testleri pytest'in stub'lı `client` fixture'ı altında yapılır.
