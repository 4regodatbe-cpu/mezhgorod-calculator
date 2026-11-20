# Stage Y — final gate и готовность кандидата М‑4

Дата: 2026-11-06. Статус: **BLOCKED / не готово к push**. Push, merge, Preview и Production не выполнялись.

## История и diff

- Stage X: `e95d0af856c986a3480766aaec23aab27a4167b1` (до Stage Y), branch `codex/stage-w-m4-tariffs`.
- Stage V: `293f4ab225547789466636ae9d2a0907461b131d`; runtime trace-fix `7226a82250c34b0b44733919cd48da3225f6fad1`.
- Оба кандидата — отдельные потомки `d60e733313860d2412d8be64f4be10ef71f7de28`; ни один не является предком другого. Stage X **не включает** Stage V `routeSignature` protection. Ничего автоматически не объединялось.
- Net diff Stage X vs `d60e733…` не содержит bulk-переписывания 722 сумм: `M4_ACTIVE_ENDPOINT_REGISTER.json` имеет лишь четыре внешних контроля, переведённых из `unconfirmed/runtimeEligible` в `unknown/runtime-ineligible`; `TARIFF_SELECTION_REGISTER.json` не имеет net diff. Основные runtime/data изменения — `lib/toll-engine/m4-data.ts` (17 тарифных строк + 3 mixed-product значения восстановлены из приказа №58) и календарный guard ниже. Остальной diff — изолированные source snapshots, tests и docs/logs. M‑4 geometry, route choice, M‑11/M‑12/ЦКАД и Android не менялись.

## Проверка тарифной применимости

1. **Источник ставки:** Category I значения `M4_DATA` совпадают с сохранённым сканом официального приказа №58; сам приказ вступил в силу 02.03.2026. Source reconciliation tests проверяют весь сохранённый перечень. Точный current HTML response Stage W не сохранён, поэтому последующее продление/замена ставки не подтверждены одним локальным raw capture.
2. **Период/дата:** профиль выбирается календарём `m4TariffPeriodAt` по московской дате поездки; расписание известно только для 2026. Обнаружен и исправлен пробел: до effective date приказа №58 календарь раньше возвращал профиль 2026. Теперь дата раньше 2026-03-02 даёт `unknown/tariff_not_effective_on_travel_date`; 2026-03-02 разрешает профиль, 2027 остаётся `unknown`. Добавлен `m4-effective-date-boundary.test.mjs`.
3. **Категория ТС:** сохранённый тариф — категория I, наличная/карточная оплата без транспондера. V3 M‑4 dataset фиксирован на категории I, отдельного выбора классов II–IV в этом адаптере нет; подтверждение ограничено сценарием легкового автомобиля категории I.
4. **Фактически пересечённый ПВП:** OSM toll-booth node и Valhalla traversal/trace используются для событий; одна геометрическая близость не тарифицируется. Но точная защита от повторного использования trace другой геометрии находится в Stage V `7226a822…`, а Stage X её не содержит. Без отдельного решения о безопасном включении этого independent fix нельзя объявить route binding полностью принятым.
5. **Двойное начисление:** направление пары ПВП 355→339 выбирает один продукт; правила для mixed 416–460 и 633–741 представлены одним entry/full product, а общий composer отклоняет пересекающиеся M‑4/A‑289 начисления. Stage X не менял эту логику; целевые тесты прошли.
6. **Неизвестный итог:** четыре external-only endpoint controls теперь unknown и runtime-ineligible. Missing/partial component блокирует общую сумму в `composeRouteTolls`; unknown не превращается в 0. Полнота выбранного O‑D тарифа при этом не подтверждена.

Ялта → Ростов остаётся **unconfirmed estimate**, не операторской стоимостью: 2 060 ₽ будни / 2 210 ₽ выходные по сохранённому replay.

## Среда и результаты gates

Окружение: Node `v24.19.0`, pnpm `11.25.0`, Chromium `/usr/bin/chromium`, существующий store `/workspace/.pnpm-store` — 491 MB; store не удалялся.

Управляемое cloud-environment status прочитан с актуальными observations: `running`, network policy `unrestricted/enforced`, ни credentials, ни outbound identities не подключены. Это не устраняет sandbox запреты на `spawnSync`/crashpad socket и не разрешает менять policy. Установка выполнялась offline; диагностические отказы ниже связаны с local path/process/browser, не с отказом HTTP к официальному тарифному источнику.

- `pnpm install --frozen-lockfile --offline --store-dir /workspace/.pnpm-store`: frozen lockfile актуален, 429 пакетов из cache и 0 download, но команда завершилась `ERR_PNPM_NO_OFFLINE_META` для `@alloc/quick-lru` после supply-chain policy check. Созданные 17 MB partial `node_modules` перемещены в `/workspace/stage-y-partial_node_modules-2026-11-06`, не удалялись.
- `pnpm test:audit`: exit 254 **до тестов**, pnpm wrapper пытался создать `/home/agent/.local/share/pnpm/store`, запись вне sandbox-разрешений.
- Скрипт-эквивалент test glob, выполненный напрямую из совпадающей dependency tree (SHA `package.json` и lockfile совпали с `/workspace/mezhgorod-reorganization`), с `PLAYWRIGHT_MODULE` и `/usr/bin/chromium`: **190 PASS / 4 FAIL из 194 suites**. Полный gate — **FAIL**, не PASS. Log: `stage-y-full-offline-tests.log`.
  - `audit-child-process`: две проверки провалены, потому что sandbox child-process wrapper не передал stdout/stderr; сообщение ошибки — wrapper `Command failed...`, а не `provider failed`. Это environment/harness, не маршрутная/runtime ошибка.
  - `automatic-policy-replay-integration`: дочерний `spawnSync(process.execPath,...)` не запускает mock Git/replay в этой sandbox; `.mock-commits.jsonl` отсутствует как вторичный симптом. Тест и fixture не менялись.
  - `systemic-audit-report`: подтверждённое `spawnSync … EPERM` при `execFileSync` Node.
  - `v3-live-browser-hydration`: с корректным `PLAYWRIGHT_MODULE` Chromium запустился, но crashpad получил `setsockopt: Operation not permitted`, затем `SIGTRAP`. Не ошибка fixture/hydration logic.
  - Ранее отмеченное отсутствие CKAD fixture в текущем полном прогоне не воспроизвелось: boundary suite PASS.
- Целевые M‑4/V3/time-calendar suites: **13 PASS, 0 FAIL**; quote/API script PASS; новый effective-date boundary test PASS; `node --check` и `git diff --check` PASS.
- TypeScript `tsc --noEmit`: PASS, exit 0 (после завершения Webpack генерации `.next/types`; первая параллельная попытка завершилась TS6053 из-за незавершённой сборки и не считается).
- ESLint `eslint . --ignore-pattern .next`: PASS, exit 0, 9 warnings / 0 errors.
- Next.js `next build --webpack`: PASS, exit 0.
- Изменения тестов для формального PASS не делались.

## Подготовка штатного runner и решение

Кандидат нельзя проверить на GitHub Actions без отправки нового commit. Новый workflow не добавлялся: существующие `.github/workflows/special-territory-policy.yml` выполняет `pnpm test:audit`, TypeScript и Next build; `.github/workflows/calculator-final-gate.yml` — полный сборочный/линтерный набор. Они запускаются на PR update/dispatch, но нынешний commit локальный; запуск workflow на `d60e733…` проверил бы другую ревизию. Для проверки именно этого кандидата нужен отдельный non-force push-разрешённый PR update, после чего проверять только run на точном SHA; до этого не публиковать.

**Текущий релизный кандидат не готов к push:** full gate имеет четыре environment failures, trace identity fix Stage V не включён, а exact current operator HTML/effective-period evidence за пределом сохранённого приказа не подтверждено. Единственный следующий шаг: при отдельном разрешении выполнить обычный fast-forward update этой ветки и дождаться уже имеющихся обязательных PR workflows на точном commit. Если push останется запрещён, финальный gate здесь завершить нельзя без обхода запрета.
