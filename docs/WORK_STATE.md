# B01–B12 / B10 Maykop-only capture — IN_PROGRESS — 26.10.2026 20:07 МСК

Selective CI DONE: hosted run40364820838 SUCCESS; see accurate [checkpoint](checkpoints/2026-10-26-2002-selective-CI-live-probe-DONE.md). B10 selector change is underway: strict `B10_CAPTURE_CASES` parser, first-selected-case provider preflight, selected-only V2/V3 comparison. Local no-network tests 4/4 PASS; no capture or network request yet. Eisk is already captured and must not be repeated. [B10 STARTED checkpoint](checkpoints/2026-10-26-2007-b10-maykop-capture-STARTED.md).

# B10 hosted V2 capture — partial — 26.10.2026 19:10 МСК

Valhalla, OSRM, and BRouter each passed one bounded hosted probe HTTP200. Eisk→Moscow V2 API captured successfully: 32/32 raw fetch responses HTTP200; SHA `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0`. Thu/Sat offline replay integrity PASS; V2/V3 differences are recorded, not authoritative tariffs. Run40354432433 stopped before Maykop because an initial exact-five-call gate rejected valid Valhalla trace evidence; the corrected bounded validator passed offline against the retained artifact. Maykop remains NOT_RUN. Evidence: [capture report](../experiments/nationwide-tolls/checks/2026-10-26-b10-v2-hosted-run-40354432433/README.md), [checkpoint](checkpoints/2026-10-26-1902-b10-eisk-capture-PARTIAL.md). The single authorized special-territory run40354448205 completed: verify and calculation_timing passed; live_probe failed on address runtime query timeout after four HTTP503 and one cooldown result; broad route-audit steps were skipped. Do not repeat it. [CI optimization proposal](CI_LIVE_AUDIT_OPTIMIZATION_PROPOSAL.md) is proposal only; no workflow changes.

# B10 bounded hosted V2 capture — STARTED — 26.10.2026 18:52 МСК

Base `769d462fe11a07b4ac887ba0b9292dbe0589d320`; PR #14 Draft. Run40345807008 proves Valhalla/OSRM returned route data on GitHub-hosted runner; BRouter remains untested. Single isolated workflow limits probes to one/provider, then sequential Eisk and Maykop V2 captures only if all required responses are complete; followed only by offline Thu/Sat replay and saved V3 comparison. Existing failed Codex capture remains preserved; new output root is run-specific. One companion existing special-territory workflow is authorized. [STARTED checkpoint](checkpoints/2026-10-26-1852-b10-v2-hosted-capture-STARTED.md).

# B03 hosted UI suite + V2 swap fix — DONE 8/8 — 26.10.2026 17:55 МСК

Chrome smoke DONE: run 40336150199. B03 hosted UI suite run [40343852094](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40343852094) passed 8/8 on Chrome156/Node24; app swap callback now exchanges full Place metadata and resets the result. Scenario/per-case logs and artifact digest are recorded [here](../experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40343852094/README.md); [DONE checkpoint](checkpoints/2026-10-26-1755-b03-v2-swap-fix-DONE.md). Run40343863068 completed successfully, including focused tests, TypeScript, Next build, and live_probe. Actions were idle before this save. `addressCitySnapshot=false`; original real-service B-only failure is not proven fixed.

# B01–B12 — 26.10.2026 16:51 МСК

Разрешённая ветка и PR #14 подтверждены на `2907a409305834c4cb9b25bc717978f049bb22f9`; PR остаётся Draft. Nationwide test environment diagnosis DONE: GitHub Actions run 40332405721, Node 24.21.0, 7/7 PASS. Сохранены stdout/stderr/exit codes и ZIP артефакт с SHA256; локальный `spawnSync ... EPERM` классифицирован как ограничение Codex sandbox. Тесты не повторять без новой причины. См. [checkpoint](checkpoints/2026-10-26-1651-nationwide-three-tests-CODEX-ENVIRONMENT-DIAGNOSIS-DONE.md), [evidence](../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md), [WORK_LOG](contractor-brief/WORK_LOG.md), [NEXT_STEPS](contractor-brief/NEXT_STEPS.md).

# B01–B12 IN PROGRESS — 24.10.2026 21:54 МСК

По прямому поручению владельца автономная работа начата из отдельной чистой копии exact remote/PR head `70ab6b840862fa40f090b960ee650b058e83b768`; исходная локальная ветка `work` не изменялась. Четыре исполнителя выполняют только read-only исследование, writer один. Recovery: [DONE](checkpoints/2026-10-24-215401-b01-b12-autonomous-recovery-DONE.md) · [WORK_LOG](contractor-brief/WORK_LOG.md) · [NEXT_STEPS](contractor-brief/NEXT_STEPS.md).

Первый технический блок B03 завершён статусом [BLOCKED](checkpoints/2026-10-24-215649-b03-browser-runtime-BLOCKED.md): Chromium154 существует, но bounded headless smoke падает до DOM (`setsockopt: Operation not permitted`, exit133). Восемь browser-сценариев NOT_RUN, зависимости не устанавливались, SSR/API не повторялись, snapshot остаётся false.

B04 exact OSM identity/topology [DONE](checkpoints/2026-10-24-220143-b04-osm-coordinate-intake-DONE.md): 2 nodes + 4 ways HTTP200/raw/SHA/ODbL, directed entry/exit и координаты подтверждены; focused verifier PASS15/15, live0. Официальный km/operator scope/fare остаются null, runtime inactive, никакая цена/zero не назначена.

B10 V2 compare recovery начат отдельным [STARTED](checkpoints/2026-10-24-220525-b10-v2-compare-recovery-STARTED.md): frozen install и bounded two-case harness/no-network preflight; сохранённые V3 captures не повторять, live V2 только после следующего STARTED. Production/main/merge/Android/backup запрещены.

# Production DONE — 24.10.2026 МСК

По прямой команде «Публикуй» выпущен exact source `da77f96f4f9185017938ed07022557611f3ea9bf`. [Release DONE](checkpoints/2026-10-24-production-release-DONE.md) · [evidence](../experiments/road-ref-boundaries/checks/2026-10-24-production-release/result.json). Production `dpl_YgtZ6Ky2HU7gvFg7YzcqVd6JXvCk` READY; оба основных aliases переключены, version200 подтверждает commit/production. /,/v3,/v2 HTTP200 через authenticated connector, browser/anonymous E2E не подтверждены. Snapshot false; V2 сохранена. PR14 draft, main/Android/backup не менялись. Предыдущий Production `dpl_DGhwwdXRTKwbbEMR127M5AbDMAoP` — rollback reference. Это разовый разрешённый выпуск, не постоянное разрешение следующих публикаций.

## Задание для внешнего исполнителя готово

[Текст и воспроизведение Word](contractor-brief/README.md) · [DONE](checkpoints/2026-10-24-external-blocker-brief-DONE.md).16страниц/12пакетов/62ссылки, sourcec959bc2. Отдельно описаны актуальные blockers и исторические data gaps, роли/материалы/критерии приёмки. Алгоритм и Production этим документом не менялись.

# Калькулятор «Из А в Б» — текущее состояние, 24.10.2026 МСК

Источник истины — код и checkpoints в этой ветке. Репозиторий `4regodatbe-cpu/mezhgorod-calculator`; разрешена только `fix/v3-missing-route-prices-2026-10-15`. PR №14 — draft, без merge. Не менять main, Android, backup/algorithm-before-road-ref-2026-10-23 (backup c7048e0a7c0fc6b471c333292f01bcfa213abad4).

Исторический parent компактного handoff: `be8720a244fdc246e52554ac766be81a5c9455ac`, tree `e8ebe05715d868bff9f1222005013eb8b049383a`. После сохранения этого документа сверять actual ref/PR, не считать записанный parent текущим head. CI перед записью completed; не писать при active/queued и не отменять jobs.

## Выполнено

- M4 crossings: exact OSM node + directed way pair полного выбранного trace. Шесть сохранённых маршрутов новых территорий → Казань связаны с одной физической pending-парой: въезд node4443232947 way447135768→1182567076; съезд node358467208 way1211606940→28835034 (М4→Р260). Цена неизвестна, активных новых строк0/pending1.
- Отключаемые модули: [реестр](OPTIONAL_MODULES.md). RoadKilometrage имеет14групп/81узел inventory, но проверенных km pending-пары и дополнительных sections нет. Address pool: concurrency2/process, queue64, singleflight/independent cancel, positive128URL/5мин, budget20с; cooldown3отказа503/429за15с без success, success reset. Timing диагностирует обычную и special ветки без изменения маршрута/цены.
- Ограниченный [addressCitySnapshot](../experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md) реализован, **addressCitySnapshot:false**. Четыре точные реальные Photon Suggestion (два Донецка, Краснодар, Ростов-на-Дону), полный outage only, budget/cancel/hash/provenance/7day expiry. Это не общий каталог и не улицы/дома; GeoNames в runtime не включён. Истекает31.10.2026 11:24:54МСК; не продлевать дату без нового capture/review.
- [GeoNames pilot](../experiments/road-ref-boundaries/SETTLEMENT_PILOT_ACCEPTANCE.md): country+alias ZIP доставлены/структурно проверены;237006P/93кандидата, ru92/93city. Exact admin joins выполнены, 19label-collision groups остаются. Повтор скачиваний/joins не нужен.
- LINT-001 закрыт: scopedCommonJS и const tuple, исполняемые CJS тела сохранены; [checkpoint](checkpoints/2026-10-24-eslint-baseline-DONE.md). [SSR-контракт](checkpoints/2026-10-24-city-snapshot-render-DONE.md) проверяет notice/credit и selected/swap-props/clear-props, не браузерные события.

## Реально выполненные проверки

Последний полный локальный gate: **898/898**, quote/API PASS, ESLint0ошибок/5прежнихwarnings, webpack/TypeScript/static16/16 PASS. [Raw/команды/SHA](../experiments/road-ref-boundaries/checks/2026-10-24-city-snapshot-render/verification.json). Последующие изменения — документы; эти проверки не объявляются browser E2E.

Последний обычный CI40094656564 предшествует новым snapshot/SSR правкам: verify/geometry/timing PASS, address FAIL из-за503,50-settlement/Yandex SKIPPED. Overall success не равен всем live PASS. Новые skip-ci commits не имеют нового ordinary CI proof.

Сохранённые одиночные real-network handler замеры: Анапа→Краснодар165.009км/620₽/2.225с; Донецк→Москва special/dual/mainland/fastestOSRM1123.25км/3050₽/7.318с. Второй тариф — существующая матрица, отдельно с оператором не пересверен. Это CI-host POST handler, не браузер/Vercel E2E и не общий SLA10с. [Обычный](../experiments/road-ref-boundaries/checks/2026-10-24-calculation-runtime-live/) · [special](../experiments/road-ref-boundaries/checks/2026-10-24-special-runtime-live/). Не расширять однотипный performance-корпус.

## Нерешённое и следующий шаг

1. **Browser UI BLOCKED_BY_ENVIRONMENT_BROWSER.** Playwright есть, Chromium отсутствует; сервер/браузер не запускались. [8сценариев приёмки](../experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md) готовы, NOT_RUN. При доступном браузере: отдельный STARTED, локальный UI с exact mocked/r и network isolation, evidence по каждому сценарию. Не искать снова бинарник/не повторять SSR при прежней среде. Исходный phone B-only дефект не доказан исправленным. Preview auth также отдельный blocker; не повторять login/извлечение credentials.
2. **Широкий city fallback BLOCKED_BY_DATA.** Нужен иной первичный источник точных ru admin labels для19групп и независимое подтверждение координат будущих selectable ID; Крым/полнота UNKNOWN. Не выдавать диапазон WGS84/alias join за точность, не активировать сомнительные точки. Имена-only RuWiki и offline benchmark не геокодер. Новый source intake — bounded, со свежей причиной/источником; не повтор прежних запросов.
3. **KM-001/KM-002/TARIFF-001 BLOCKED_BY_DATA.** Для exact pending graph pair нужны операторские scope/цена/даты и exact node км/калиброванная section.1038км другой развязки не присваивать. Новый надёжный источник можно разбирать независимо; unknown не0. Полную собственную roadnetwork не строить.

Доступные без новой среды/источника code-блоки этой серии завершены. Не создавать повторные тесты/документальные этапы ради счётчика. При неизменных предпосылках сообщить конкретный blocker; при новом доступном входе выполнить следующий ограниченный блок, сохранить и продолжить независимые части.

## Продолжение и история

Сначала [AGENTS](../AGENTS.md), [правила](WORKFLOW_RULES.md), [checkpoint protocol](CHECKPOINT_PROTOCOL.md), [решения](PROJECT_DECISIONS.md), [road-ref NEXT](../experiments/road-ref-boundaries/NEXT_STEPS.md), [блокеры](../experiments/road-ref-boundaries/BLOCKERS.md). Не повторять выполненный route audit. Только самый быстрый допустимый маршрут, unknown не free/0, partial не полный итог, обязательные toll checks не сокращать ради скорости.

Git push CLI без авторизации: использовать существующий GitHub connector, non-force expected_sha и exact tree readback. Секреты/credentials не извлекать. Для UTF-8 log tree entries читать bytes.decode, не read_text (CR/CRLF); workflow вне sparse — git add --sparse, exact path/blob check. Сохранять каждый малый завершённый блок до следующего; STARTED перед долгим run; не требовать «дальше» после каждого блока.

[Предыдущий handoff целиком, точные исходные байты](WORK_STATE_HISTORY_2026-10-24.md) — история, не текущие NEXT. [Подробный append-only журнал](../experiments/road-ref-boundaries/WORK_LOG.md). [Сверка статусов](checkpoints/2026-10-24-settlement-status-reconciliation-DONE.md).
