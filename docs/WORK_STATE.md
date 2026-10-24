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
