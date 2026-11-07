# DONE MODULE / BLOCKED DATA — локальный километраж, 24.10.2026 09:14 МСК

Выполнен следующий разрешённый этап из [STARTED](2026-10-24-road-kilometrage-STARTED.md). Source50d36ae2b8a7ac7dc38600fac23323530250702d, tree3c8a381c0e8ca9ee0db34b02e25ab5562edd9e69; PR14open/draft; единственная ветка fix/v3-missing-route-prices-2026-10-15. STARTED remote tree/head прочитан и совпал до разработки. Предыдущие worktrees/node_modules symlink не изменялись.

## Сделано

- lib/toll-engine/road-kilometrage.ts: отдельный локальный resolver, одноразовый индекс точных directed transition/node IDs, fallback projection на небольшие reviewed sections с двумя официальными километровыми опорами; scale/branch/access-road guards, интервалы неопределённости, increasing/decreasing-km по порядку полного выбранного проезда. Ничего не выводится из номера OSM node/way или ближайшего ПВП. Неопределённость/дубли/лимиты не разрешаются выбором ближайшего кандидата.
- optional-road-kilometrage.ts: адаптер реестра и старого named inventory; data/toll-feature-switches.json: один roadKilometrage switch. JSON формат явно проверяется resolver; данные можно дополнять без изменения его алгоритма. Действующие14 named PVP groups/81 lane nodes дают номинальные км, приложение использует±1км консервативного допуска, не заявляя геодезическую точность. Непроверенные spatial matches/centroids не импортируются как участки дороги.
- data/road-kilometrage.json: reviewed дополнительных anchors/sections0, pending2 направленных перехода с km:null. Никаких синтетических километров в runtime.
- Единственная интеграция в m4-production.ts: после прежней проверки completeness/route signature дополнительный m4PvpPreview.roadKilometrage. V3 уже сохраняет этот preview в fast-ответе. Ошибки необязательного resolver возвращаются как stop/unknown. Основная тарификация, выбор маршрута и тарифный вектор не менялись.
- Структурированные stops сообщают недостающую границу/координату, mismatch/ambiguity/budget/config error. Неполные trace не повышаются до resolved. Нет fetch, новых таймаутов, сетевых логов или синхронной записи каждого пользовательского ответа. Диагностика остаётся в ответе/capture; постоянный список известных пробелов — BLOCKERS.md.
- docs/OPTIONAL_MODULES.md, AGENTS.md и PROJECT_DECISIONS сохраняют решение пользователя: независимые новые модули, пропуск проблемной независимой части с журналом, продолжение выполнимого. Не считать failing mandatory gate успехом. Существующие движки целиком не рефакторились.

Схема и инструкция выключения/удаления: [KILOMETRAGE.md](../../experiments/road-ref-boundaries/KILOMETRAGE.md). Выключение — roadKilometrage:false и обычная сборка; цены не зависят от switch. Limits:5000 anchors/256sections/20000stored segments/4096lookup segments per boundary; section≤20км, segment≤5км. Локальная проекция без экстраполяции за концы. Позиционная погрешность нескольких км не разрешает автоматически выбирать тариф через несколько разных границ.

## Проверено фактически

Evidence: [checks/2026-10-24-kilometrage](../../experiments/road-ref-boundaries/checks/2026-10-24-kilometrage/verification.json), полные byte hashes там же.

1. Focused node --import ./scripts/register-ts-paths.mjs --test scripts/road-kilometrage.test.ts scripts/road-trace-boundaries.test.ts:18/18PASS на первоначальной версии. Финальные изменения также покрыты полным gate.
2. Финальный полный audit: node --import ./scripts/register-ts-paths.mjs --test scripts/*test.ts scripts/*.test.mjs lib/v3-calculation/*.test.ts experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs experiments/nationwide-tolls/engine/*.test.mjs:851/851PASS,0fail/skip. Затем node experiments/nationwide-tolls/scripts/quote.test.cjs:quote/API adapter contractsPASS. Запуск pnpm через /opt/codex/.../fallback/pnpm однажды вернул0 с одним заголовком без test summary; этот неполный вывод не принят как gate, выполнены прямые эквивалентные команды и проверен итог851. Это не code/test suppression.
3. Финальный ESLint9 шести изменённых TS/MJS файлов:exit0, пустой log.
4. Финальный node node_modules/next/dist/bin/next build --webpack:exit0, compile/TypeScriptPASS, static16/16.
5. Полный сохранённый Granitnoe→Kazan provider+13trace replay в двух профилях проверен внутри gate: graph resolved, kilometre unknown, stop присутствует, tariffVector/amount unknown сохранены, live0. Новые synthetic тесты: прямое/обратное движение, calibrated/reverse projection, доступ по фактически пройденной дороге, duplicates/parallel branches, scales, overlap, partial/foreign route, range/segment budgets, disabled mode, реальные pending node IDs. Новых real interchange captures0.
6. Benchmark финального модуля:21000 вызовов, live0. Actual named-index p95≈0.0041мс; pending p95≈0.0032мс. Synthetic projection на4096segments для каждой из двух границ:p95≈0.6595мс, first call≈2.18мс, index init≈2.84мс. Измерено только локальное CPU, не холодный server/module load и не E2E. Первая серия измерений до финальных защитных правок была заменена повторным финальным performance.json, а не выдана как финальная версия.
7. Parent CI40068908259completed/success:verifyPASS, live geometryPASS, PhotonFAIL,50settlement/YandexSKIPPED (continue-on-error). Перед финальным сохранением убедились, что active job больше нет. Новый code commit будет иметь отдельный CI — не объявлять его успешным заранее.

## Незакрытые ограничения и следующий шаг

KM-001/KM-002BLOCKED_BY_DATA: пара4443232947→358467208 не получила выдуманный км, reviewedsections0; настоящая устойчивость к сдвигу карты на этих съездах ещё не подтверждена. Ядро поддерживает её при наличии калиброванных локальных данных. Этот этап не выбирает тариф исключительно по приблизительному километру: scope/цена и соответствие тарифной границе требуют отдельного подтверждения.

PERF-001UNVERIFIED: цель всего расчёта≈10с не проверена живым E2E и не обеспечена одним быстрым модулем. ADDRESS-001 остаётся отдельно, TARIFF-001 цены/scope неизвестны. Проблемы не блокировали независимую реализацию; никакого broad re-audit нет. Все известные стопы с последующим действием сохранены в BLOCKERS.md; попытка получить log работающего CI дала404BlobNotFound и не трактовалась как route failure.

Следующий конкретный независимый шаг после exact remote readback — ограниченный offline анализ ADDRESS-001 fan-out/fallback, не ожидая отсутствующих тарифов/километров. При появлении проверенных kilometre anchors пополнить JSON отдельно с source/reviewed/scale/branch и regression, без переписывания ядра. Долгосрочная своя картаDEFERRED. Backup c7048e0 не изменён. Main/merge/Production/Android не затронуты. Сохранение этой записи подтверждается последующим exact remote tree/head readback, SHA собственного commit в текст не встраивается.
