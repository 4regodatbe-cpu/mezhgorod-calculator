# Restored reliability plan: 24 blocks

### Группа А. Правильность расчётов и интерфейс

**Блок 1. Проверка исходного состояния.**

Сверить HEAD, PR, действующие правила и закрытые дефекты. Создать карту текущих модулей и план работ. Не повторять ранее завершённый комплексный аудит.

**Блок 2. Представление unknown в V2.**

Проверить отображение `pricingStatus:"unknown"` и денежных значений `null`. Не допускать вывода «0 ₽» при неизвестной стоимости. Исправлять только воспроизведённые проблемы.

**Блок 3. Представление unknown в V3.**

Проверить контракт V3 при неизвестной, частичной и полной стоимости. Не изменять тарифы и правила тарификации.

**Блок 4. Ошибки расчёта в интерфейсе.**

Проверить обработку HTTP 400, 500, 502, тайм-аутов и отменённых запросов. Пользователь должен видеть корректное сообщение и возможность повтора там, где это допустимо.

**Блок 5. Отмена и замена запросов.**

Проверить изменение адреса при активном запросе, очистку, обмен A↔B и уход со страницы. Не повторять закрытые восемь B03-сценариев.

**Блок 6. Контракты API V2/V3.**

Проверить совместимость входных и выходных данных после изменений даты, обработки ошибок и corridor recovery. Не объединять движки расчётов автоматически.

### Группа Б. Защита от перегрузок

**Блок 7. Размер запросов расчёта.**

Проверить server-side ограничения JSON body для V2/V3. Добавить обоснованные лимиты и регрессионные тесты при отсутствии защиты.

**Блок 8. Длина входных строк.**

Проверить серверные ограничения длины адресов, населённых пунктов и меток. Проверять некорректные и чрезмерно длинные значения.

**Блок 9. Защита `/api/collect`.**

Проверить размер входящих данных и ресурсные ограничения статистики и обратной связи. Сохранить действующее обезличенное поведение.

**Блок 10. Deadline webhook.**

Проверить тайм-ауты, отмену и обработку ошибок внешних webhook-запросов. Устранить доказанную возможность зависания.

**Блок 11. Размер ответов маршрутизаторов.**

Проверить безопасную обработку крупных JSON-ответов Valhalla, OSRM и BRouter. Обосновывать пределы размерами сохранённых реальных ответов, не отбрасывая законные длинные маршруты.

**Блок 12. Deadline прямого геокодирования.**

Проверить прямой geocode без локального ограничения времени. Добавить ограниченный тайм-аут и тест отмены запроса. Не менять порядок выбора адресов и координаты.

### Группа В. Устойчивость внешних сервисов

**Блок 13. Повторные запросы.**

Выявить необоснованно повторяющиеся обращения к внешним сервисам. Использовать mock-ответы и сохранённые fixtures.

**Блок 14. Fallback маршрутизаторов.**

Проверить, что переключение провайдеров сохраняет выбор самого быстрого допустимого маршрута и не подставляет неподтверждённую стоимость.

**Блок 15. Кэширование.**

Проверить размеры кэшей, сроки хранения, изоляцию запросов, устаревание данных и отмену. Не переписывать работающие механизмы без доказанного дефекта.

**Блок 16. Диагностика ошибок.**

Проверить структурированные коды ошибок, этапы выполнения и достаточность журналов. Не сохранять лишние персональные данные.

### Группа Г. Точность тарифного движка

**Блок 17. Полный и частичный тариф.**

Проверить полный подтверждённый расчёт, неизвестный платный участок, recovery subtotal, неполную trace и независимо подтверждённую композицию. Учитывать уже завершённое AUD-TRACE-RECOVERY-01, не повторять его без новой причины.

**Блок 18. Сочетания дорог.**

На сохранённых данных проверить граничные условия комбинаций M4, M11, M12, ЦКАД и А289. Не повторять массовый дорожный аудит.

**Блок 19. Ейск—Москва.**

Разобрать по сохранённым V2/V3 данным расхождение +580 ₽ в четверг и +1 530 ₽ в субботу. Выявить конкретные компоненты, породившие разницу. Не менять тарифы ради совпадения.

### Группа Д. Производительность и инфраструктура

**Блок 20. Офлайн-профилирование.**

Измерить затратные вычисления и повторы на идентичных сохранённых входных данных. Оптимизировать только при измеримой пользе и сохранении результата.

**Блок 21. TypeScript для scripts/tests.**

Рассмотреть отдельный noEmit typecheck скриптов и тестовой инфраструктуры, не нарушая рабочий tsconfig приложения.

**Блок 22. GitHub Actions.**

Проверить сохранение обязательных проверок и корректность выборочного CI. Особое внимание уделить ранее обнаруженной проблеме устаревшего baseline. Не запускать массовый live_probe без необходимости.

**Блок 23. Итоговые тесты и сборка.**

Провести необходимые регрессионные тесты, TypeScript и Next build после изменений. При ограничении Codex sandbox использовать подходящий GitHub-hosted runner. Не считать EPERM дефектом приложения.

**Блок 24. Консолидация результатов.**

Подготовить итоговый отчёт: исправленные дефекты, проверенные оптимизации, добавленные тесты, PASS/FAIL/BLOCKED, нерешённые проблемы, ограничения и рекомендации следующего этапа.


## Status reconciliation

Block21 IN PROGRESS, not DONE: strict scripts/tests noEmit trial found57 existing diagnostics across24 files; root application typecheck passes. The knowingly failing config was not kept. Details/paths: `2026-10-27-0352-block-21-typecheck-BLOCKED.md`. Do not add to CI until resolved without weakening checks.

Latest block16 DONE: app-side suggestion/timing diagnostics contain bounded metadata only. RED confirmed V2 production error boundary exposed raw exception/digest; now details are dev/test-only and console logs digest only. Focused render2/2, tsc, scoped ESLint and diff PASS. Checkpoint `2026-10-27-0340-block-16-diagnostics-privacy-DONE.md`. Technical DONE19/24 (79.17%):1–17,19,22. Next block21 scripts/tests typecheck feasibility; blocks18/20 remain.

Latest block15 DONE: route provider fetch keys vary by coordinates and provider options; six-hour fetch revalidation retained. Photon uses exact-URL positive-only five-minute LRU128, shared request pool and subscriber-safe cancellation; suggestion cache normalizes Russian query and is also five-minute LRU128. Three mock suites PASS. Next runtime framework cache remains unverified. Checkpoint `2026-10-27-0322-block-15-cache-review-DONE.md`. Technical DONE18/24 (75%):1–15,17,19,22. Next block16 diagnostics/privacy.

Latest block14 DONE: mocked Valhalla transport rejection does not suppress valid faster OSRM; own ETA/geometry are retained. Existing route-selection and pipeline cases cover invalid candidates, tie order and unknown/null toll evidence. Focused suites, TypeScript, scoped ESLint and diff PASS. Checkpoint `2026-10-27-0314-block-14-provider-fallback-DONE.md`. Technical DONE17/24 (70.83%):1–14,17,19,22. Next block15 cache key/lifetime/isolation.

Latest block13 DONE: current V2 route flow and B10 logs reviewed offline. Eisk32/32 and Maykop36/36 exact method+URL+body request keys were unique; 4 Valhalla route requests, OSRM/BRouter candidates and trace chunks are distinct; no unnecessary exact duplicate reproduced. No behavior change. Checkpoint `2026-10-27-0301-block-13-provider-request-counts-DONE.md`. Technical DONE16/24 (66.67%):1–13,17,19,22. Next block14 fallback/candidate correctness with mocks.

Latest block11 DONE: B10 retained artifacts (no new provider requests) bound router response sizes: largest captured individual payload652,899 B, so a generous8MiB stream cap (>12x) is applied to Valhalla/OSRM/BRouter. Empty/malformed/interrupted JSON and invalid/empty geometry fail closed. Focused tests, API error mapping, tsc, scoped ESLint and diff PASS. Checkpoint `2026-10-27-0252-block-11-provider-response-bounds-DONE.md`. Technical DONE15/24 (62.5%):1–12,17,19,22. Next block20 offline profiling follow-up; block20 remains PARTIAL.

Latest block10 DONE: collection webhook POST now uses an8s `AbortSignal.timeout`; timeout/transport failures return the existing generic502 response, and there are no retries. Mocked RED confirmed no signal existed before the change; GREEN verifies8s signal, abort path, exactly1 fetch and no leaked provider/timeout text. Collection privacy/bounds and TypeScript/scoped ESLint/diff pass. Checkpoint `2026-10-27-0245-block-10-webhook-deadline-DONE.md`. Technical DONE14/24 (58.33%):1–10,12,17,19,22. Next11 router response size limits.

Latest block9 DONE (`/api/collect` protection). RED showed the 16KiB cap was absent and the ASCII `\b` address filter leaked Cyrillic `ул. Секретная`/`ул. Частная` into webhook `fromRegion`/`toRegion`. Reused the bounded JSON-object reader; malformed/non-object returns400, oversize413 before webhook. Unicode-aware address-token filtering now strips street/house components while preserving coarse city/region labels. Unknown toll requires null and is not forwarded as a price. Privacy/validation tests2/2, reused body-limit tests2/2, tsc/lint/diff PASS. Checkpoint `2026-10-27-0244-block-9-collect-DONE.md`. Technical DONE13/24 (54.17%):1–9,12,17,19,22. Next10 webhook deadline.

Latest block8 DONE: V2/V3 now share a server-side route-label validator capped at256 Unicode code points. Test-first route requests with257-character labels reached mocked providers (502); both APIs now return400 before any provider request. Exact256 and supplementary Unicode boundary cases pass. Existing ordinary/special API contracts, TypeScript, scoped ESLint and diff check pass. No label normalization, address ranking or route logic changed. Checkpoint `2026-10-27-0242-block-8-label-bounds-DONE.md`. Technical DONE12/24 (50%):1–8,12,17,19,22. Next9 `/api/collect` resource limits.

Latest block7 DONE: V2/V3 calculation bodies use a shared streaming JSON-object reader capped at16KiB. It rejects oversized declared `Content-Length` before reading, counts actual bytes when the header is absent/underreported, cancels oversized streams, and maps malformed/non-object JSON to400. Regression checks prove oversized payloads cause0 provider calls. Normal V2/V3 integration, error mapping and trace recovery remain PASS. No business/route behavior changed; checkpoint `2026-10-27-0240-block-7-request-size-DONE.md`. Technical DONE11/24 (45.83%):1–7,12,17,19,22. Next8 input string bounds.

Latest block6 DONE (V2/V3 API contract compatibility after date/error/trace changes). Existing mocked integration suites verify V2 ordinary/special response shape and unknown toll nulls, V3 single-fast-route contract/validator, sanitized input/upstream/internal error mapping, and V2 partial trace unknown totals/diagnostics. Four focused suites PASS; no contract defect reproduced and no engines merged. Payload size and string bounds remain separate blocks7–8. Checkpoint `2026-10-27-0237-block-6-api-contracts-DONE.md`. Technical DONE10/24 (41.67%):1–6,12,17,19,22. Next7 request-body limits.

Latest block5 DONE (V2 cancellation and races; no hosted B03 rerun). Reproduced two defects: `clearResult()` left the prior error visible, and delayed clipboard completion could mark an obsolete route as copied. V2 now clears error/manual/copy state, aborts and detaches active requests, protects async clipboard completion against stale route state, catches clipboard failures safely, and clears copy timers on new calculation/reset/unmount. Concurrent V2 calculation, reset, unmount, and V3 race regression checks PASS. TypeScript PASS; scoped ESLint0 errors/1 existing `analyticsVersion` warning; checkpoint `2026-10-27-0236-block-5-v2-races-DONE.md`. Technical DONE9/24 (37.5%):1–5,12,17,19,22. Next6 API contracts.

Latest block4 DONE (V2/V3 UI/API error handling). RED tests reproduced both hooks exposing a raw unexpected rejection message (`provider.internal.example/private-token`). Added a shared tagged safe-message error: allowlisted API/user-facing and malformed-response messages remain visible; untagged fetch/internal exceptions use a generic retry message. Mocked 400/500/502/504, malformed successful JSON, network exception, retry, abort and stale-response checks PASS; API error contracts and tsc PASS. Scoped ESLint had zero errors and one pre-existing `analyticsVersion` unused warning. Checkpoint `2026-10-27-0234-block-4-ui-errors-DONE.md`. Technical DONE8/24 (33.33%):1–4,12,17,19,22. Next5 cancellation/races.

Latest block3 DONE (V3 unknown/null response and display contract): `validV3Response` accepts unknown only when actual/weekday/weekend amounts are all `null`, rejects contradictory zero values, and preserves a separately confirmed free state; shared V3 fastest-route card renders base-only and no full-trip zero. Existing clipboard test also verifies unknown status in copied quote. No application defect reproduced; tests added. Focused render3 checks, response/copy tests, TypeScript, scoped ESLint and diff check PASS; checkpoint `2026-10-27-0231-block-3-v3-unknown-DONE.md`. Technical DONE7/24 (29.17%): 1,2,3,12,17,19,22. Next4 UI error cases.

Latest block2 DONE (V2 unknown/null presentation). Real SSR rendering and helper tests confirmed `unknown/null` remains base-only and never becomes zero. A manual user-entered amount correctly computes a labeled total, but exposed a contradictory stale warning; `RouteCard` now hides only the “full total is not calculated” notice while manual input is present. Unknown provider status remains visible. Focused tests, TypeScript, scoped ESLint and diff check PASS; checkpoint `2026-10-27-0228-block-2-v2-unknown-DONE.md`. Technical DONE6/24 (25%): 1,2,12,17,19,22. Next3 V3 unknown contract.

Latest22 review DONE with residual cumulative-baseline limitation; checkpoint2026-10-27-block22-DONE.md. DONE5/24 (1,12,17,19,22),20.83%. Next20 offline profiling.

Latest block19 DONE: docs/codebase-audit/EISK_COMPONENT_ANALYSIS.md and EISK_COMPONENT_EVIDENCE.json. DONE4/24 (1,12,17,19),16.67%. No live queries. Next22.

Latest: block12 DONE, checkpoint2026-10-27-geocode-deadline-DONE.md. Confirmed DONE3/24:1,12,17. Below reconciliation records the initial restoration snapshot. Next19/B10 offline Eisk component attribution.

DONE: 1,17. Evidence: docs/UNIFIED_RELIABILITY_PLAN.md and checkpoint 2026-10-27-0054-aud-trace-recovery-fix-DONE.md. Block1 uses existing module map in CODEBASE_AUDIT.md; static audit was not repeated. Block17 uses the five focused regression files recorded in that checkpoint. Other definitions exceed the prior narrow checks and are not credited automatically.

ACTIONABLE: 2–16,18–22. PENDING:23,24 (final gates/consolidation follow implementation). Confirmed progress:2/24.

Crosswalk: 1→B12;2→B10/B03;3→B10;4–5→B03;6→B10/B12;7–10→B12;11→B10/B11;12→B01;13–15→B01/B11;16→B12;17–18→B04–B10;19→B10;20→B11;21–24→B12.

Sources: docs/CODEBASE_AUDIT.md; docs/contractor-brief/BRIEF.md; docs/codebase-audit/NEXT_STEPS.md; docs/PROJECT_DECISIONS.md.

