# Серверный HTML-контракт — 24.10.2026

`verification.json` содержит точные команды и SHA256 raw logs. В scripts/v3-calculator-form-ui.test.mjs добавлены 3 теста реального React renderToStaticMarkup: selected fallback credit/notice в A и B после передачи переставленных props; две отдельные подписи для двух fallback; отсутствие stale notice при clear/edit/ordinary props. Данные из reviewed snapshot, не benchmark.

Focused 5/5, full 898/898, quote/API, ESLint 0 ошибок / 5 прежних warnings, webpack/TypeScript/static16 PASS. Exit codes процессов 0. Продуктовый код/данные/флаг не менялись. Браузер не запускался: SSR не проверяет события, эффекты, гонки, запросы и видимость на экране. Live запросов 0; snapshot false.
