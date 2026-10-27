# Unified reliability queue — 27.10.2026

Latest validation: focused regression PARTIAL for block23 —18/18 targeted suites plus application TypeScript, scoped ESLint and diff PASS; no network/full build. [Checkpoint](checkpoints/2026-10-27-0408-block-23-focused-regression-PARTIAL.md). Does not count as block23 DONE. Overall technical progress21/24 (87.5%); next block21 type remediation.

Latest block20 DONE for bounded offline profiling: both saved Eisk/Maykop provider JSON responses were profiled through route parse/decode/validation/evidence derivation (0 network), matching saved geometry SHA/count. Four computation-stage result hashes also match across saved route profiles. Microbenchmark and scope limitations recorded. [Checkpoint](checkpoints/2026-10-27-0445-block-20-offline-profile-DONE.md). Progress21/24 (87.5%).

Latest block18 DONE: three scoped offline composition/route-boundary test files PASS for M4/A289, M11, M12 and CKAD unknown/duplicate/direction/date boundaries; mocked provider fetch only, no live route claims. [Checkpoint](checkpoints/2026-10-27-0430-block-18-road-composition-DONE.md). Progress21/24 (87.5%); block21 not adopted,23 partial,24 open.

Block21 IN PROGRESS / not adopted: strict noEmit started at57 diagnostics/24 files; three test-typing groups removed16 diagnostics, leaving41/21. App TypeScript passes. Temporary config removed; no CI gate or weakened check was committed. [Initial evidence](checkpoints/2026-10-27-0352-block-21-typecheck-BLOCKED.md) · [groups1–3](codebase-audit/NEXT_STEPS.md#unified-24-block-reliability-sprint--current-status). Progress21/24 (87.5%). Next fix remaining independent groups.

Latest block16 DONE: audited app-side diagnostics and corrected a production V2 error boundary that exposed raw exception/digest despite “test-only” label. Production hides details; browser console gets only structured digest. Development retains troubleshooting copy. Focused test-first render2/2, TypeScript, scoped ESLint and diff PASS. [Checkpoint](checkpoints/2026-10-27-0340-block-16-diagnostics-privacy-DONE.md). Technical19/24 (79.17%):1–17,19,22. Next block21 scripts/tests typecheck review; blocks18/20 remain open/partial.

Latest block15 DONE: route fetch cache URLs vary by coordinates/provider options, TTL21600s. Photon uses exact-URL singleflight/cache, positive-only5min LRU128, per-origin cooldown and subscriber-safe cancellation; address cache normalizes query with5min LRU128. Three mocked cache/fetch suites PASS; no defect or code change. [Checkpoint](checkpoints/2026-10-27-0322-block-15-cache-review-DONE.md). Technical18/24 (75%):1–15,17,19,22. Next block16 structured diagnostics/privacy review. Block20 remains PARTIAL.

Latest block14 DONE: a mocked Valhalla transport timeout does not suppress a valid faster OSRM route; asserts selected ETA/provider. Existing cases cover invalid candidates, equal ETA, unknown pricing and incomplete geometry. Route-selection + pipeline suites, TypeScript, scoped ESLint and diff PASS; no network. [Checkpoint](checkpoints/2026-10-27-0314-block-14-provider-fallback-DONE.md). Technical17/24 (70.83%):1–14,17,19,22. Next block15 cache key/TTL/isolation review. Block20 remains PARTIAL.

Latest block13 DONE: current V2 source plus saved B10 fetch logs show no unnecessary exact duplicate requests: Eisk32/32 and Maykop36/36 unique `(method,URL,body)` keys; candidate routing fan-out and conditional Valhalla fallback are intentional. No code changed or network rerun. [Checkpoint](checkpoints/2026-10-27-0301-block-13-provider-request-counts-DONE.md). Technical16/24 (66.67%):1–13,17,19,22. Next block14 fallback/candidate correctness with existing mocks. Block20 remains PARTIAL.

Latest block11 DONE: Valhalla/OSRM/BRouter responses are streamed and capped at8MiB; empty, malformed, interrupted, or oversized bodies fail as sanitized upstream errors. Empty/invalid route geometry is rejected. Cap is >12x largest retained B10 body (652,899 bytes). New focused tests, API error mapping, tsc, scoped ESLint and diff PASS. No live calls. [Checkpoint](checkpoints/2026-10-27-0252-block-11-provider-response-bounds-DONE.md). Technical15/24 (62.5%):1–12,17,19,22. Next block20 offline profiling follow-up; it remains PARTIAL.

Latest block10 DONE: `/api/collect` webhook POST has an8s abort deadline and no retry. Mocked timeout confirms one call, abort, safe502 message and no provider details. Webhook/bounds suite3/3, tsc, ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0245-block-10-webhook-deadline-DONE.md). Technical14/24 (58.33%):1–10,12,17,19,22. Next11 router response size handling; real response evidence only.

Latest block9 DONE: `/api/collect` now shares a16KiB bounded streamed object parser and returns400/413 before webhook on bad input. Fixed Cyrillic street/house filter that leaked street names into webhook regions; coarse city/region retained. Unknown toll accepted only as null and never forwarded as a tariff. Privacy/API tests2/2, body-limit tests2/2, tsc/lint/diff PASS. [Checkpoint](checkpoints/2026-10-27-0244-block-9-collect-DONE.md). Technical13/24 (54.17%):1–9,12,17,19,22. Next10 webhook deadline. Webhook timeout not yet changed.

Latest block8 DONE: shared V2/V3 endpoint validation caps route labels at256 Unicode code points. Oversized label returns400 before any provider request; exact256 including emoji boundary passes. Focused label/API tests, tsc, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0242-block-8-label-bounds-DONE.md). Technical12/24 (50%):1–8,12,17,19,22. Next9 `/api/collect` bounds. No route/business semantics or normalization changed.

Latest block7 DONE: V2/V3 request body parsing capped at16KiB using streamed byte counting (not only `Content-Length`). Oversized declared/actual bodies return413 before provider calls; malformed JSON and non-object JSON return400. Focused body tests2/2; V2/V3 API, safe error and trace integration suites PASS; tsc, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0240-block-7-request-size-DONE.md). Technical11/24 (45.83%):1–7,12,17,19,22. Next8 string bounds. No broad audit/build/Actions.

Latest block6 DONE: focused mocked V2/V3 integration suites confirm input/output contracts, V2 special/ordinary route shapes, V3 single-fast-route schema, sanitized 400/502/500 mapping, and partial-trace unknown/null propagation. Four suites PASS; no contract defect reproduced and engines remain separate. [Checkpoint](checkpoints/2026-10-27-0237-block-6-api-contracts-DONE.md). Technical10/24 (41.67%):1–6,12,17,19,22. Next7 body-size bounds. No broad audit/network/build/Actions.

Latest block5 DONE: V2 reset now clears errors and manual input; late route response/copy completions cannot overwrite newer/reset state, and clipboard rejection is handled safely. V2 lifecycle suite9/9, V3 hook suite8/8, TypeScript PASS; ESLint0 errors/1 existing warning. [Checkpoint](checkpoints/2026-10-27-0236-block-5-v2-races-DONE.md). Technical9/24 (37.5%):1–5,12,17,19,22. Next6 API request/response contracts. No hosted B03 rerun, full build or Actions.

Latest block4 DONE: V2/V3 request UIs no longer show arbitrary network/internal exception strings. New shared tagged error helper preserves safe HTTP 400/500/502/504 and invalid-response messages; unexpected errors use a generic retry message. Mocked retry, malformed JSON, abort/unmount and stale response checks pass. V2 hook5/5; V3 hook8/8; API contract suite, tsc, scoped ESLint (0 errors, 1 existing `analyticsVersion` warning) and diff check pass. [Checkpoint](checkpoints/2026-10-27-0234-block-4-ui-errors-DONE.md). Technical8/24 (33.33%):1–4,12,17,19,22. Next block5 cancellation/races. No full build/Actions.

Latest block3 DONE: V3 unknown/null. Added contracts: `unknown` requires null amounts; contradictions such as `pricingStatus: unknown` with a zero amount are rejected; explicitly free remains separate. Shared fastest-route SSR stays base-only and copied quote preserves unknown status. No application defect reproduced. Focused response/copy/render tests, TypeScript, scoped ESLint and diff check PASS. [Checkpoint](checkpoints/2026-10-27-0231-block-3-v3-unknown-DONE.md). Technical7/24 (29.17%):1,2,3,12,17,19,22. Next block4 UI errors. Block20 profile PARTIAL. No full build/Actions.

Latest block2 DONE: V2 unknown/null SSR and helper checks. Manual toll with unknown provider amount now displays the calculated manually labeled total without the contradictory “full total not calculated” notice; provider status remains explicitly unknown. Focused render2/2, presentation+unmount suites PASS; `npx tsc --noEmit`, scoped ESLint, `git diff --check` PASS. [Checkpoint](checkpoints/2026-10-27-0228-block-2-v2-unknown-DONE.md). Technical6/24 (25%):1,2,12,17,19,22. Next block3 V3 contract. Block20 profile still PARTIAL. No full build/Actions.

Latest practical sprint result: call-local recovery endpoint cache, long-fixture median30.72→17.17ms; all16 measured operation hashes unchanged, positive/partial recovery regression files+tsc+ESLint PASS. Checkpoint2026-10-27-recovery-endpoint-cache-DONE.md. Block20 profiling remains PARTIAL (missing stage/fixture coverage), technical5/24. Next2/V2 unknown presentation; then3/V3, UI errors/API guards. No broad CI/build run.

Sprint block20 PARTIAL: reproducible offline profile and baseline saved (scripts/offline-computation-profile.mjs, docs/codebase-audit/computation-baseline.json). Technical remains5/24. Saved9433point route: recognition median61.28ms,recovery30.72ms. Next test call-local recovery endpoint memoization with output parity; coverage gaps explicit in baseline/checkpoint.

Latest technical5/24 (20.83%): block22 selective-CI review saved, classifier10/10 PASS. Cumulative runtime changes since last checked baseline explain docs-triggered live jobs; pending-runtime accounting remains necessary before safely narrowing this further. No CI config changed, no live run started. Next20 offline profiling.

Latest DONE4/24 (16.67%):1,12,17,19. Eisk delta explained exactly by13-PVP sum4920/6770 versus V3 endpoint-cell4340/5240; no tariff changes. Evidence docs/codebase-audit/EISK_COMPONENT_ANALYSIS.md. Next22 CI saved metadata.

Latest: technical DONE3/24 (1,12,17). Block12 geocode deadline25s implemented; timeout maps to GEOCODE_UNAVAILABLE, first-feature selection and supplied coordinates preserved. Two mocked tests, TypeScript/scoped ESLint PASS. [Checkpoint](checkpoints/2026-10-27-geocode-deadline-DONE.md). Next19/B10 saved Eisk component attribution. B01 remains partial.

Original 24 definitions restored: [plan](RELIABILITY_24_BLOCK_PLAN.md), DONE2/24 (1,17); exact B crosswalk recorded. Missing-plan blocker resolved. Next block12/B01 deadline. Earlier UNKNOWN/24 notes below are historical.

[Unified work order](UNIFIED_RELIABILITY_PLAN.md): B01–B12 reconciled with completed fixes; 4 actionable directions, 7 data blockers, 1 environment blocker, 0 broadly fully closed directions. The original numbered 24 technical blocks are absent from available context/repository; technical count UNKNOWN/24, awaiting source definitions. Next concrete work: B01/AUD-GEOCODE-01 direct geocoder deadline. [Checkpoint](checkpoints/2026-10-27-unified-plan-reconciliation-DONE.md). Previous completed stages below remain historical evidence.

# CODEBASE AUDIT FIXES — FOLLOW-UP DONE — 27.10.2026 00:54 МСК

Follow-up 4/4 complete. По одобрению пользователя исправлен V2 corridor recovery: приблизительный subtotal больше не публикуется как полная стоимость; без независимого route-wide тарифа итог `null`/`unknown`, recovery subtotal и участки доступны в `fast.tollDiagnostics.corridorRecovery` при diagnostics mode. Неполная trace не получает мягкие matched thresholds; числовые M4/M12 пороги не менялись. Независимо составленная полная route price остаётся `priced` при partial trace. Подтверждённые продуктовые расчёты, тарифные значения, геометрия и выбор быстрейшего маршрута не менялись. Focused tests (5 файлов), TypeScript, scoped ESLint и diff check PASS. Полный build/массовый audit и hosted CI не запускались по узкой задаче/ограничению не повторять аудит. Три effectiveFrom остаются UNKNOWN до первичных документов: [перечень](codebase-audit/AUD-DATA-01-UNKNOWN-EFFECTIVE-DATES.md). [Решение](codebase-audit/AUD-TRACE-RECOVERY-DECISION.md), [checkpoint](checkpoints/2026-10-27-0054-aud-trace-recovery-fix-DONE.md), [WORK_LOG](codebase-audit/WORK_LOG.md), [NEXT_STEPS](codebase-audit/NEXT_STEPS.md). Branch fix/v3-missing-route-prices-2026-10-15, PR14 Draft; проверять exact remote readback после commit.

Все четыре P2 code-fix блока завершены (4/4, 100% нового плана исправлений); обе evidence-проверки завершены (2/2). AUD-DATA-01 остаётся BLOCKED_BY_DATA по датам тарифов; AUD-TRACE-RECOVERY-01 выявил риск V2 при неполной trace, но recovery/business rules не менялись. Неплановые run40394972858 и40396491540 из-за stale cumulative CI baseline запускали live geometry/address checks; address probe завершился SOURCE_UNAVAILABLE, 50-settlement/Yandex jobs skipped. Не повторять. [Trace evidence](codebase-audit/AUD-TRACE-RECOVERY-01.md). Не менялись суммы/effectiveFrom или правила восстановления. PR14 Draft. Последний checkpoint [AUD-TRACE-RECOVERY-01](checkpoints/2026-10-26-233224-aud-trace-recovery-01-DONE.md); журнал [WORK_LOG](codebase-audit/WORK_LOG.md), план [NEXT_STEPS](codebase-audit/NEXT_STEPS.md).

# CODEBASE AUDIT — DONE — 26.10.2026 21:39 МСК

**New audit plan: 18/18 blocks (100%).** This is completion of the bounded static audit only, not project readiness. No application/business/tariff/CI code changed; no tests/build/browser/live calls run. Final audit report: [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md). Final checkpoint: [B18](checkpoints/2026-10-26-2139-codebase-audit-block-18-DONE.md). [Timestamp correction](checkpoints/2026-10-26-2139-codebase-audit-timestamp-correction.md) clarifies B7–B17 timestamps; exact individual completion times were not captured. PR14 remains Draft; required branch-protection checks unverified (GitHub connector 403).

## Historical state log (superseded by the current summary above)

The following append-only entries describe earlier progress and are retained for context; they predate the completed Maykop capture in run40369626668.

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


Исторический выпуск выполнялся по отдельному прямому поручению владельца; подробности и первичные доказательства сохранены без изменений в [release checkpoint](checkpoints/2026-10-24-production-release-DONE.md) и [evidence](../experiments/road-ref-boundaries/checks/2026-10-24-production-release/result.json). Эта краткая ссылка заменяет повторение операционных deployment-метаданных в текущей сводке.
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
