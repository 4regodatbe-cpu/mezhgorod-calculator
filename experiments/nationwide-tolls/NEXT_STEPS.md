# Следующие действия

История: [NEXT_STEPS_HISTORY_2026-10-15_2228.md](NEXT_STEPS_HISTORY_2026-10-15_2228.md). Актуальный handoff: [WORK_STATE](../../docs/WORK_STATE.md).

DONE16.10: frozen install; полный build658/658+quote/API/Next/TypeScript/static16/16; ESLint18файлов/diffcheck; offline Гуляйполе→Москва3810/4640 по departure-policy, оба replay complete. Это не новые live маршруты и не независимое подтверждение тарифов.

1. BLOCKED live Бахмут→Казань: получить прямое разрешение текущего чата на передачу координат городов/контрольных точек и маршрутных параметров Valhalla/OSRM/BRouter. [Точный blocker](../../docs/checkpoints/2026-10-16-routing-approval-blocked.md). GitHub разрешение уже получено, не спрашивать заново.
2. После разрешения запустить один `dnr-бахмут-kazan-center` live через `scripts/run-systemic-route-case.mjs`; сохранить capture/result/checkpoint в GitHub, сверить head/tree. Затем same-date иweekend replay, parity, отдельный checkpoint. Отражать unknown без подмены нулём.
3. Обновить corpus/batch/report/inventory после полного случая; stage1 пока8/155,stage2=154 не начат. [План](TWO_STAGE_AUDIT_PLAN.json). Каждый case отдельно сохранять до следующего.

Все тарифы считают по дате/времени отправления; междорожные векторы отложены. Unknown не бесплатно; subtotal не полный итог. Не main/merge/Production/Android без прямого запроса. Сохранение через GitHub connector, CLI credentials отсутствуют. При переносе stdout сохранять CR/LF без нормализации, все blob/tree SHA сверять.
