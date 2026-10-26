# Технический аудит репозитория «Из А в Б»

Статус: IN_PROGRESS; новый план — 18 блоков. Источник — remote branch `fix/v3-missing-route-prices-2026-10-15`, исходный SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Read-only; бизнес-логика, тарифы и настройки не менялись. Процент относится только к этому аудиту.

## План и прогресс

18 блоков: 1 архитектура; 2 адресный поиск; 3 кэш/очередь/отмена; 4 API входы/поток; 5 адаптеры; 6 выбор fastest; 7 V2/V3 и сохранённые Eisk/Maykop evidence; 8 геометрия/границы без повтора аудита дорог; 9 тарифная композиция; 10 V2 UI; 11 V3 UI; 12 API outputs/errors; 13 безопасность; 14 производительность; 15 зависимости/build; 16 тесты; 17 CI; 18 docs/data governance и синтез. Завершено 5/18 (27.8%); [checkpoint B5](checkpoints/2026-10-26-2124-codebase-audit-block-05-DONE.md). Широкие, сетевые и браузерные тесты не запускались.

## Предварительная оценка

Есть явные defensive controls: bounded address suggestion pool и 25s deadlines у route adapters. Выявлен риск разной строгости admission между V2/V3; его окончательная классификация ожидает B6 cross-check. API ограничения ресурсов и route provider behavior ещё будут проверены.

## Предварительные находки

### P1 — вероятный риск, ожидает B6 подтверждения

**AUD-ROUTE-01 — V2 может тарифицировать endpoint straight-line вместо provider geometry.** В `lib/v2-calculation/route-leg.ts` fulfilled candidates после анализа маршрута передаются в `selectLiveRouteCandidates`; `lib/route-quality.ts` сравнивает расстояние/согласие, без проверки координат. Пустая geometry заменяется двумя endpoint координатами и передаётся в `calculateLegTolls` (`lib/v2-calculation/route-leg-pricing.ts`). V3 использует `isUsableRoute` (`lib/v3-calculation/route-candidate.ts`); `scripts/v3-route-selection-audit.test.ts` содержит regression “incomplete geometry never becomes a straight line priced as a real road”. Кодовой путь доказан статически, неправильная цена не воспроизводилась. Возможное последствие — tariff/road detection по несуществующему пути. Рекомендация: B6 проверить все варианты V2, затем отдельный fail-closed admission guard и regression. Средний риск изменения; высокая потенциальная польза; изолируется в V2 candidate gate.

### P2 — вероятный риск надёжности

**AUD-GEOCODE-01 — direct label geocoding не имеет локального timeout.** `lib/route-providers.ts` `geocode` делает Photon fetch без AbortSignal; V2/V3 принимают точки без position и параллельно вызывают geocode. Route adapters имеют 25s timeout, отдельный suggestion-service ограничен иначе, но этот путь его не использует. Долгая задержка/отказ не воспроизводились. Рекомендация: bounded transport + abort regression без изменения ranking; низкий–средний риск, улучшает предсказуемость ресурсов, модульно.

**AUD-API-01 — нет явных app-level max bytes/label длины в calculate endpoints.** B4 checkpoint фиксирует статическое наблюдение; возможный лимит платформы не проверялся, DoS не доказан. Рекомендуется отдельная валидация request limits; низкий/средний риск, изолируемо.

**AUD-PROVIDER-01 — JSON body провайдеров читается без явного app-level byte cap.** Valhalla/OSRM/BRouter адаптеры имеют timeout и revalidation, но вызывают `response.json()` напрямую. Последствие/эксплуатируемость зависят от upstream/platform caps и не проверены; считать это доказанным дефектом нельзя. Рекомендация — определить разумные пределы и ограниченное чтение только при подтверждении платформенной модели; риск низкий/средний.

## Непроверенное

Тесты в этом сеансе не запускались; провайдеры не вызывались; live pricing, пограничные случаи тарифов, browsers и build не перепроверялись. Текущая точность/влияние AUD-ROUTE-01 ждёт B6. Итоговые P0–P3, план исправлений и список «не менять» будут после блоков 6–18.

## Следующее действие

B6: проверить candidate admission в V2/V3, fastest-only и special path, тесты пустой/невалидной geometry. Не выполнять сетевые запросы.
