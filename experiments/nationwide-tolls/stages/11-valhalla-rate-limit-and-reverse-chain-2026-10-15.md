# Этап 11 — устойчивость длинной проверки Valhalla и обратная цепочка, 2026-10-15

## Причина

Fresh live SPb→Krasnodar via Moscow (stage 10) выбрал корректную OSRM geometry и распознал M-4/M-11, но toll map-matching проверил лишь 14/15 частей. Один запрос `trace_attributes` на участке у lat 57.373874, lon 34.605995 получил HTTP 429 на первой попытке и повторе. Из-за неполной проверки component ZSD и `unknown-paid-road` корректно блокировали полную сумму. Это ограничение доступного Valhalla endpoint, не тарифный пробел М-11.

## Изменения

- В `lib/toll-validator.ts` ограничена per-route параллельность trace chunks: 3→2. Long-chain audit ранее запрашивал много chunks одновременно, а фактический Valhalla capture содержал 429.
- На каждый HTTP 429 теперь разрешено максимум две повторные попытки. При наличии `Retry-After` значение соблюдается; слишком длинный срок или исчерпанный request deadline оставляет часть непроверенной. Если заголовка нет/он некорректен — используется bounded backoff 1s затем 2s. Persistent 429 остаётся unknown; не объявляется free.
- В `scripts/v3-long-chain-audit.mjs` capture сохраняет заголовок `Retry-After`, чтобы будущие сбои можно было отличать от случайного rate limiting без предположений.
- `scripts/toll-trace-rate-limit.test.ts`: 4 сценария проверяют единичный 429, два временных 429 с восстановлением paid edge, persistent 429 и длинный Retry-After.

## Результат проверки

- Focused rate-limit suite: 4/4 PASS.
- Targeted ESLint: PASS; `git diff --check`: PASS.
- Full `pnpm build`: audit tests **646/646 PASS**, quote tests PASS, API contract PASS, TypeScript and Next.js build PASS, static generation **16/16 PASS**, exit 0.
- Повторно запущен тот же live выбранный маршрут SPb→Краснодар через Москву. Route length 2,051,990m; M-11 и M-4 ожидаемые family найдены. Map-match вернул complete=true, все chunks проверены; в capture зафиксировано 16 запросов trace_attributes и все с HTTP 200, без 429. Audit status `priced`, missing components пусты. Компонент хвоста М-11 `m11-679-684` =94 ₽, weekday и weekend. Полный рассчитанный route total 10,464 ₽ weekday / 12,334 ₽ weekend.
- Сумма остаётся с `priceConfirmation: unconfirmed` и отображаемой пометкой «Стоимость не подтверждена». Этот live audit доказывает полноту карты трассировки в данном прогоне и применение сохранённых tariff components, но не является независимой receipt-проверкой каждой тарифной строки.

Evidence: `source-snapshots/long-chain-2026-10-15/spb-krasnodar-moscow-2026-10-15T04-45-39-137Z/{live.json,capture.json.gz}`. SHA-256 `live.json`: `7b4d761d61d5f8f7f676b19b70aa156db59c893431de2db388609add4a4dce8a`; capture gzip: `e53aa3828c3e81b66ddc3cf5586685a0c8f1b1ac1a4d1d3579fff214aedeb37f`.

## GitHub and next action

Implementation/evidence commit `e87b7b5057984efbdd1688d56e5ee69e93997445` is published in PR14 on `fix/v3-missing-route-prices-2026-10-15`; PR open/draft/mergeable. Its `verify` Actions job completed successfully. Live provider geometry job in run `38683370889` is in progress. Vercel deployment is READY; authenticated `/api/version` returned the exact e87b7b SHA with `environment=preview`, and `/v3` returned HTTP 200. No production deploy or merge occurred.

Next investigate ZSD complete selected-route scope beyond reviewed zone1 and reconcile the official fare source/date rows. The repository records an older user exclusion and a later scoped zone1 adapter; do not broaden beyond already reviewed product scope or select among conflicting official schedule artifacts by guess. No main merge, Production, or Android change.
