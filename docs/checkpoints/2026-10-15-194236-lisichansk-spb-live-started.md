# Лисичанск → Санкт-Петербург, новый live case

STARTED. Parentb4d6f9e81709637b2a07fcbec8af4d48a9306792, local/PR14head совпадают; PRopen/draft. Ветка fix/v3-missing-route-prices-2026-10-15, checkout чистый.

Case lnr-лисичанск-saint-petersburg-center, исходные координаты/правила из corpus.json. Утрачен предыдущий raw; повторный live запрос необходим. План: run-systemic-route-case --live на2026-10-15T09:00:00+03:00; сохранить raw/live, затем same-date и2026-10-17T09:00:00+03:00 offline replays; проверить complete/parity/SHA и фактические road components. Не выбирать цену вручную.

До запуска сохранён STARTED; в случае failure сохранить весь failure capture. Следующий независимый case не запускать до GitHub checkpoint и remote read-back. Не считать новый маршрут выполненным до фактического ответа. После успешного case добавить отдельный batch manifest (не переписывать исторический), актуализировать corpus auditEvidence/availability/report. Тарифы/app/lib/Production не менять.
