# Current project decisions

Updated: 2026-10-02. This note records the current boundary between the standalone Calculator 2.0, the public platform, and route benchmarks.

## Product boundary

- This repository remains the standalone Calculator 2.0 site/application used by dispatchers and taxi drivers.
- It is independent from `izavb-platform`. Keep its internal pricing rules/configuration separate; the platform will implement a similar but independent algorithm and may diverge.
- The benchmark route set is for offline tests only. It must not serve routes, provide runtime toll fallbacks, or set passenger fares.
- Calculator 3.0 UI/API/runtime has been removed on the work branch after preserving the available routes as offline benchmark fixtures. Calculator 1.0/APK remains unchanged.

## Benchmark snapshot

- A dated data-only snapshot is stored in `benchmarks/routes/yandex-2026-10-02/`; it is also present on the separate work branch `work/remove-v3-runtime-2026-10-02`.
- It preserves the 61 records currently present in the published JSON/CSV: 60 Yandex-sourced rows and one `Контрольная база` row, retaining original provenance; the available JSON/CSV includes no geometry.
- Snapshot contents: four small JSON packages, compact route index, original CSV export, manifest, and the captured weekday/weekend toll table for nine route pairs.
- Use offline snapshots for tests. Confirmed regressions block release; ambiguous differences are classified and reviewed. Add a new dated snapshot rather than changing this one.

## Implementation status

- The work branch removes `app/v3`, `app/api/v3/calculate`, the obsolete V3 runtime integrity checks, and the old runtime route-table helper/data copies.
- `scripts/yandex-route-benchmark-integrity.mjs` checks the archived benchmark. Run it with `pnpm test:route-benchmark`.
- V2 UI was split into `app/v2/page.tsx` and `app/v2/components.tsx`. Routing provider adapters were moved from the API handler to `lib/route-providers.ts`.
- V2 no longer imports the archived route table for live route selection or toll fallback. Its live results come from routing providers and toll engines; benchmark data is accessed only by offline integrity checks.
- The work branch is not merged. PR #6 `fix-systemic-toll-composition` remains open and should not be merged until its status and the updated boundary are reconciled.

## Internal pricing

The standalone V2 calculator keeps its own internal tariffs, including special-segment rates Standard 70, Comfort 80, Comfort+ 90, Minivan 110 RUB/km. Do not source these values from the public platform configuration.


## 2026-10-20 — долгосрочная локальная дорожная сеть (DEFERRED)

Пользователь поручил сохранить [долгосрочный план](LONG_TERM_ROAD_NETWORK_PLAN.md) собственной дорожной сети без зданий/POI и исследования упрощения городов для междугородних расчётов. Сейчас реализацию не начинать; даты/автоматического запуска нет. Сохранить ПВП, точные соединения и платные участки; прямые линии из центра — предложение для оценки, не готовая routing policy. Оценки размеров не измерены. Это решение не меняет активный алгоритм, тарифы, аудит или опубликованную версию.


## 2026-10-23 — снимок алгоритма и отложенная привязка тарифных границ

По прямому запросу пользователя создана резервная ветка `backup/algorithm-before-road-ref-2026-10-23` от `c7048e0a7c0fc6b471c333292f01bcfa213abad4`. Сохранить существующую тарифную матрицу/векторы; будущая идея — распознавать конкретную направленную развязку по фактически пройденным дорожным переходам, особенно на М4 для новых территорий. Сейчас реализацию не начинать; пользователь готовит недостающие тарифы. Возврат только по отдельному поручению. Это гипотеза решения неоднозначности границ, не подтверждённое исправление всех маршрутов. [Checkpoint](checkpoints/2026-10-23-algorithm-backup-road-ref-DEFERRED.md).


## 2026-10-23 — тарифные пробелы не блокируют разработку границ

Последнее уточнение пользователя отменяет ожидание тарифов как условие доработки. Распознавание конкретного направленного въезда/съезда и существующего тарифного вектора проверять независимо от суммы; неизвестную цену заполнить позднее. Unknown не0, частичная сумма не полная. Прежнее указание пока не начинать реализацию остаётся в силе до отдельного поручения. [Checkpoint](checkpoints/2026-10-23-tariff-data-not-implementation-blocker.md).


## 2026-10-23 — разрешено начать привязку границ

Прямая команда пользователя «Начинай» разрешает реализацию в рабочей ветке/PR14. Сохранить существующую матрицу; выбирать направленные дорожные переходы по реальному выбранному маршруту, держать распознавание границ отдельно от наличия цены. Незаполненная ценаunknown; никакого угадывания0/тарифа. Резервную ветку не изменять. Production/main/merge не разрешены этим поручением.


## 2026-10-23 — инженерное уточнение доказательства съезда

Сохранённый raw trace показал, что инструкция начинается до фактического въезда на М4. Для новых тарифных векторов требуется точный OSM node и направленная пара way IDs из complete selected-route trace; точки route-maneuver остаются диагностикой. Координаты при отсутствии output shape не угадывать. Одна физическая пара может использоваться многими маршрутами, но операторский scope/цена подтверждаются отдельно. M4 graph register расширяет существующий quote engine; pending не начисляется. Решение принято в рамках разрешённой реализации по фактическому evidence.


## 24.10.2026 — локальный километраж и независимые модули

Разрешена локальная привязка к километрам как следующий этап: без новых сетевых запросов при расчёте, с источниками/шкалой/веткой/направлением и единым переключателем. Выполнимые части продолжать при пробелах других частей; все стопы/ошибки фиксировать в журнале. Unknown/неполный итог не выдавать за0/полную цену. Цель до10с измерять отдельно для всей системы. См. OPTIONAL_MODULES.md и checkpoint2026-10-24-road-kilometrage-STARTED.


## 24.10.2026 — километраж как позиционное обогащение

В рабочей ветке отдельный отключаемый модуль добавляет километры/диапазоны и направление в M4 preview, без новой сети и без самостоятельного назначения тарифа по приблизительному километру. Пока нет подтверждённых привязок к tariff scope, неизвестная цена/граница остаётся неизвестной.14старыхnamedPVPgroups дают81nodeanchor с номинальным км, дополнительные sections0. Это выполнимая часть этапа; пробелы отдельно в BLOCKERS.md, общий расчёт10с остаётся целевым ориентиром. Подробности: checkpoints/2026-10-24-road-kilometrage-DONE.md.


## 24.10.2026 — серия малых блоков в одном ответе

Уточнено пользователем: большую задачу заранее делить на небольшие законченные блоки, выполнять их последовательно в одном ответе/сеансе; после проверки и durable checkpoint автоматически переходить дальше без команды пользователя. После сбоя продолжать с первого незавершённого. Локальные блокеры записывать и продолжать независимую работу. Подробный порядок в WORKFLOW_RULES.md; существующие safety/CI/checkpoint правила сохраняются.
