# Технический аудит репозитория «Из А в Б»

Статус IN_PROGRESS; план этого аудита — 18 блоков. Источник — текущая удалённая ветка `fix/v3-missing-route-prices-2026-10-15`, исходный SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Только статический код/evidence review. Изменения касаются только документов/checkpoints; тарифы и продуктовая логика не менялись. Процент — только новый план.

## Прогресс

18 блоков: 1 architecture; 2 address lookup; 3 cache/pool/cancel; 4 API inputs; 5 providers; 6 selection; 7 saved V2/V3 comparison; 8 geometry/boundaries; 9 tariff composition; 10 V2 UI; 11 V3 UI; 12 API output/errors; 13 security; 14 performance; 15 dependencies/build; 16 tests; 17 CI; 18 docs/data governance/synthesis. Завершено 9/18 (50.0%). Последний [B9 checkpoint](checkpoints/2026-10-26-2201-codebase-audit-block-09-DONE.md). Тесты/build/live/browser не запускались.

## Оценка состояния

Текущие pricing/geometry paths содержат заметные fail-closed проверки: неполное road-system composition не становится полным total; unknown-ноль сериализуется как null; trace coverage явно учитывается. Подтверждённых P0/P1 пока нет. Есть несколько вероятных P2, каждый требует изолированной проверки/уточнения.

## Сохранённое V2/V3 evidence (не запускалось повторно)

| Направление/день | V2 | V3 | V2−V3 |
|---|---|---|---|
| Ейск—Москва Thu | 1,271,780 м; 59,629 с; 4,920 ₽ | 1,271,781 м; 59,629 с; 4,340 ₽ | −1 м; 0 с; +580 ₽ |
| Ейск—Москва Sat | same route/time; 6,770 ₽ | same route/time; 5,240 ₽ | −1 м; 0 с; +1,530 ₽ |
| Майкоп—Москва Thu | 1,404,673 м; 65,838 с; 5,040 ₽ | 1,404,674 м; 65,838 с; 5,040 ₽ | −1 м; 0 с; 0 ₽ |
| Майкоп—Москва Sat | same route/time; 6,090 ₽ | same route/time; 6,090 ₽ | −1 м; 0 с; 0 ₽ |

Это proxy/API outputs, не независимая проверка тарифов; тарифы не менять.

## Находки

### P2 — вероятные риски, дефект не воспроизведён

**AUD-GEOCODE-01 — локальный deadline отсутствует у direct label geocode.** `lib/route-providers.ts`, `geocode`: Photon fetch без AbortSignal; V2/V3 разрешают label-only точки. Возможное удержание запроса до platform timeout. Исправление: bounded adapter + abort regression, не менять ranking. Риск низкий/средний; изолируемо. Доказательств runtime-отказа нет.

**AUD-API-01 — calculate handlers без явного app-level лимита body bytes/label длины.** [B4](checkpoints/2026-10-26-2112-codebase-audit-block-04-DONE.md); platform caps и exploitability не проверены. Предложение — общий validator на границе API; низкий/средний риск, независимо.

**AUD-PROVIDER-01 — отсутствует явный byte cap для JSON route provider responses.** `lib/route-providers.ts` использует `response.json()`; platform/upstream ограничения не установлены. Это resource-risk, не доказанная уязвимость. Сначала выяснить реальные пределы.

**AUD-TEST-01 — V2-specific regression для invalid geometry не найден.** В просмотренном V3 есть `isUsableRoute` и тест empty geometry; публичный V2 path пустую геометрию отклоняет через `followsPlan`, поэтому неправильная цена не доказана. Добавить точечный contract test до guard-refactor; низкий риск.

**AUD-TRACE-RECOVERY-01 — неполный платный map trace влияет на пониженный порог corridor recovery.** В `lib/toll-validator.ts:317–325` неуспешная часть возвращает `complete:false`, но `status:"toll"`, если хотя бы один успешный chunk содержит toll edge. `lib/toll-recovery.ts:101–104,117` трактует любой `status:"toll"` как map-matched evidence и использует `minRunWithMapMatch`: M4 — 2 вместо 4 подряд recovery segments, M12 — 2 вместо 5. При совпадении только короткого отрезка recovery выдаёт сумму по найденным сегментам с `confidence:"matched"`; caller затем может её отдать как priced. Это статический потенциальный риск неполного коридорного расчёта, не воспроизведённый результат: сама recovery требует независимого геометрического совпадения, а неизвестно, сможет ли частичная геометрия выдать неполный subtotal на реальном маршруте. Рекомендация: отдельные контролируемые fixtures с частичным/полным trace, route traversing short/long corridor, затем определить — запрещать понижение порога при `complete:false` или обосновать комбинацию геометрии и partial evidence. Риск исправления средний: может вернуть unknown на легитимной трассе; польза — исключить неполный total; отдельный validator/recovery contract test. Тарифы менять нельзя.

### Подтверждённые defects

На блоках 1–9 P0/P1 не подтверждены. Начальное предположение о V2 empty geometry P1 снято после B6: route controls отклоняют пустые координаты до выбора.

## Не проверено

Блоки 10–18: V2/V3 frontend state, API response contracts, security/privacy, perf/memory, dependency/build configuration, test quality (без полного запуска), CI and documentation/data governance. Нет runtime проверок, сетевых запросов или повторных route/fare audits.

## Следующий шаг

B10 — статически проверить V2 frontend state/address input/request lifecycle/error rendering. Только связанные файлы; не запускать browser.
