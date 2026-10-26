# B01–B12 work log

2026-10-27: restored all24 definitions from user attachment; credited only1/17 against existing checkpoint evidence,2/24. No tests repeated. Crosswalk in docs/RELIABILITY_24_BLOCK_PLAN.md. Next12/B01.

## 2026-10-27 — unified queue reconciled

Supplement read; baseline396daf20 verified against remote/PR14 Draft; current-head Actions list empty. Linked completed repairs and B directions in `docs/UNIFIED_RELIABILITY_PLAN.md`; no repeated test/audit/capture. Original 24 numbered definitions missing, so technical count UNKNOWN/24. Functional direction statuses:4 ACTIONABLE,7 BLOCKED_BY_DATA,1 BLOCKED_BY_ENVIRONMENT; no broad direction declared fully closed from narrow evidence. Next B01/AUD-GEOCODE-01. Checkpoint `docs/checkpoints/2026-10-27-unified-plan-reconciliation-DONE.md`.

## 26.10.2026 20:07 МСК — B10 Maykop-only selector STARTED after selective CI PASS

Selective CI is verified on hosted run40364820838 (verify/classifier success, live jobs skipped). The branch's existing B10 workflow and capture harness are exact matches to remote files; harness currently preflights/captures both Eisk and Maykop. Introduce a strict case-list parser; preflight uses the first selected case, capture and offline comparison iterate selected cases only. Add four local tests for default/two-case, Maykop-only, subset, and invalid/duplicate selections. All four pass locally; no network requests. Update special verify to run selector tests, hosted-verify with the B10 workflow unchanged, then only set `B10_CAPTURE_CASES=maykop-to-moscow` and run one narrow capture. [STARTED checkpoint](../checkpoints/2026-10-26-2007-b10-maykop-capture-STARTED.md).

## 26.10.2026 20:24 МСК — B10 current-head STARTED saved; no network yet

The selector block DONE is read back. Latest branch head before this STARTED: `6b4b4d75dfbe4d6fa86c04cdeba66db961851421`; PR14 Draft; Actions idle. Existing B10 workflow SHA `6fdb317b…` is unchanged. Safe choreography: `[skip ci]` Maykop-only env update, then a normal docs-only commit proving the pending workflow delta classifies non-runtime without matching B10 push paths, then one normal comment-only B10 workflow update to trigger one capture. Do not start if classifier/verify proof fails. [STARTED](../checkpoints/2026-10-26-2024-b10-maykop-capture-STARTED.md).

## 26.10.2026 20:20 МСК — CI baseline SHA semantics resolved; B10 selector hosted PASS

Run40366544254 returned `head-already-checked` at f63a58d despite compare f2208fdae…→f63a58d… being `ahead` by16. The classifier now uses immutable workflow-run `head_sha` and still requires PR association; uncertainty fails open. Hosted run40367512131 confirms `no-route-runtime-change-in-update`, `verify` PASS (435 project tests + 10 classifier + 4 B10 selector tests, TypeScript/build), and broad live jobs SKIPPED. This run was read back before the separate current-head STARTED; no provider requests. B10 workflow remains unchanged. The staged safe-launch sequence is documented in the STARTED checkpoint.

## 26.10.2026 20:02 МСК — selective live-probe CI implemented and hosted verification PASS

The expected `77b8…` SHA was stale; branch source was `192d2238…`, PR14 Draft. Workflow first saved at `f477eab7…`. Run40363211385 exposed a JSON-to-`$GITHUB_OUTPUT` parser bug after classifier had correctly computed `head-already-checked`; fail-open ran broad jobs and no Action was cancelled. `verify` PASS (435 project tests + 9 classifier tests, TypeScript/build), timing PASS, geometry PASS. Address runtime probe: Ростов PASS with 1 HTTP503; Красн CHECK_FAILED after 5 HTTP503 + 1 cooldown; Донецк SOURCE_UNAVAILABLE after 7 cooldown responses; 3/3 requests completed in 2.572s; later 50-route/Yandex steps skipped. Narrow helper fix emits diagnostics to stderr; it also permits a classifier-failure prior run only if verify succeeded and fail-open live job finished. Model tests now 10/10 PASS. After saving fix, hosted run40364820838 SUCCESS: verify PASS (435 project tests + 10 classifier cases, TypeScript and Next build), classifier PASS `head-already-checked`; broad `live_probe` and timing jobs both SKIPPED. Thus a non-runtime update in the cumulative PR does not repeat broad checks; unknown/API/incomplete/runtime cases still fail open. Current head `f2208fdae88983b5efe1ce69c29d3b9da6845c57`; PR14 remains Draft. Next: Maykop-only B10 scope check, no Eisk recapture.

## 26.10.2026 20:30 МСК — selective CI redesign STARTED

Remote SHA `77b8a6b9b919aadfcb64d7fa9b0546414f9c63a4`; allowed branch only; PR #14 Draft. The current `special-territory-policy.yml` scopes the whole PR event with `pull_request.paths`, whose match persists across historical PR changes and reruns `live_probe` for independent follow-up commits. The user authorized a bounded CI configuration change. Planned approach: preserve PR `verify` checks; classify the exact push payload commit range (`before`→`after`) for route-runtime changes; run wide live jobs on matching pushes or explicit manual dispatch; unknown/truncated metadata falls back to live. Model diagnostic, algorithm, test-only, workflow-only, and unknown-payload cases. No existing Action is cancelled. After CI implementation, continue B10 with a Maykop-only capture; preserve and reuse saved Eisk evidence, no duplicate Eisk capture. [STARTED checkpoint](../checkpoints/2026-10-26-2030-special-ci-live-probe-selective-STARTED.md).

## 26.10.2026 19:02 МСК — B10 Ейск V2 capture/replay DONE; Майкоп NOT_RUN

Hosted probes: Valhalla, OSRM, BRouter each valid HTTP200, one request each. Eisk V2 API HTTP200; 32 raw HTTP200 fetch responses (Valhalla route×4, trace_attributes×26, OSRM×1, BRouter×1), capture 560,417 bytes SHA256 `19763eed7da92b505668ed8a9eb528baf77add76ec805d1511101b94e6144ca0`. Both offline replays consumed 32/32, live0, misses0, unused0. V2−V3 outputs: Thu −1m/0s/+580₽; Sat −1m/0s/+1,530₽; proxy comparisons only, no tariff claim. Run40354432433 stopped on a harness bug (assumed exactly 5 requests), not provider/network failure; corrected bounded validation passed offline against artifact. Artifact 12666050121 / SHA256 `69e8c2afb18f789cbc20451f0b45ccdea34e3ce258bca3a19e294a2cdf2de3a2`, expires2027-01-24. [Evidence](../../experiments/nationwide-tolls/checks/2026-10-26-b10-v2-hosted-run-40354432433/README.md) · [PARTIAL checkpoint](../checkpoints/2026-10-26-1902-b10-eisk-capture-PARTIAL.md). Maykop NOT_RUN. The only authorized accompanying special-territory run40354448205 completed: verify/calculation_timing passed; live_probe failed at address probe after Ростов PASS, Красн 4×HTTP503 plus cooldown and Донецк query timeout; broad corpus steps skipped. Do not repeat. Separate CI optimization proposal only: [draft](../CI_LIVE_AUDIT_OPTIMIZATION_PROPOSAL.md).

## 26.10.2026 18:52 МСК — B10 hosted V2 capture STARTED

Base `769d462fe11a07b4ac887ba0b9292dbe0589d320`. Existing run40345807008 completed with real Valhalla/OSRM responses on the GitHub runner; BRouter was not exercised there. Added a narrow push-triggered workflow and run-specific capture output root; it performs one bounded request per required router, then one Eisk capture and only on complete HTTP200/provider data one Maykop capture, offline Thu/Sat replay and V3 comparison. The pre-existing Codex 502 capture is preserved. User allowed one automatically-triggered existing special-territory workflow; no other wide run. [STARTED checkpoint](../checkpoints/2026-10-26-1852-b10-v2-hosted-capture-STARTED.md).

## 26.10.2026 17:55 МСК — B03 hosted browser suite DONE 8/8; V2 swap fix verified

User-requested B03 on GitHub-hosted Chrome; run [40343852094](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40343852094), test SHA `b0fc3deb311d49f9bac3dd0bb7d33345ac58bb0b`. Narrow code fix in `app/v2/page.tsx`: pass `onSwap` that exchanges complete A/B `Place` values (coordinates/source included) and clears calculation result. Harness fixed two test-only issues: count suggestion labels rather than Retry in case06 and wait for initial mocked `/api/collect` effect before interacting (React hydration readiness).

Results 8/8 PASS: two Donetsk options/notice/credit; A/B source+coordinates through calculate; swap+metadata+result reset; B clear/replacement; stale delayed response race; normal/empty/502/retry; fallback non-cache vs ordinary positive cache; 320px keyboard/credit/clear/swap and no overflow. `/r` request counts 1,2,2,2,2,4,3,1; blocked external requests 0; page/route errors 0; exit0. Ubuntu24.04.5, Node24.21.0, Chrome156.0.8078.47, Playwright1.56. Snapshot freshness/hash verified at 2026-10-26T14:53:49.870Z; snapshot expires 2026-10-31T08:24:54Z. Artifact ID12660732224, SHA256 `41525a99b7889c574c107dd450c3cef052792b1d7a7c6e74cd0e2f49751f5662`; per-case JSON/logs and metadata at `experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40343852094/`. Existing verify workflow run40343863068 completed successfully, including focused unit test scripts, `tsc --noEmit`, `next build`, and the separate `live_probe`; branch Actions were idle before this documentation save. This does not prove live Photon or the original B-only external incident fixed; flag remains false. [DONE checkpoint](../checkpoints/2026-10-26-1755-b03-v2-swap-fix-DONE.md).

## 26.10.2026 17:48 МСК — B03 run2 partial; confirmed swap defect

Hosted run [40342429468](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40342429468), Chrome156/Node24/Ubuntu24: 5/8 PASS (01,02,04,05,07). Case03 after successful calculation found no swap button; `CalculatorForm` has optional `onSwap`, omitted by V2 page. Case06 false failure counted the valid retry action as a selectable suggestion; harness assertion will query suggestion labels only. Case08 got no `/r` and remained on placeholder; because harness only waited for DOMContentLoaded, hydration race is likely, so case08 is inconclusive. Snapshot freshness/hash verified by workflow; no network calls, no external browser requests, no page errors. Artifact `12658779947`, SHA-256 `717eab487c8dfdef3a71018b3d124543ef93328021fcbf39620413c06e2922a2`, text outputs in `experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40342429468/`. [Partial checkpoint](../checkpoints/2026-10-26-1748-b03-ui-run2-PARTIAL.md). Focused V2 swap fix and corrected run are STARTED: [checkpoint](../checkpoints/2026-10-26-1748-b03-v2-swap-fix-STARTED.md).

## 26.10.2026 17:39 МСК — B03 first browser suite ran; harness correction needed

Run [40340623345](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40340623345), Node24.21.0, Chrome156.0.8078.47, Playwright1.56.0, Ubuntu24.04. Snapshot was rechecked in runner immediately before app start; records hash matched and expiry was future. Outcome 1/8 PASS, 7/8 test failures. Case01 passed. Cases02–03 used a nonexistent result heading label; the UI showed `Основной маршрут`. Cases04–07 had test callbacks wired as unused properties; ordinary city fixtures were therefore wrong. Case08 passed all mobile layout/keyboard checks before detecting `swapVisible=false`. `CalculatorForm` supports optional `onSwap`, but V2 page does not supply it; treat as a concrete candidate defect pending the corrected run. No app change or flag activation. The 1.62MB Actions artifact (SHA-256 `5663d8424c49f326863783de88d24958010cdd887bf75bfac005c3dd1beaf7c9`) includes all screenshots; extracted text results/logs and per-case outcomes are preserved in `experiments/road-ref-boundaries/checks/2026-10-26-b03-address-ui-run-40340623345/`. See [FAILED](../checkpoints/2026-10-26-1739-b03-ui-harness-run-FAILED.md). Corrected harness rerun has a separate [STARTED checkpoint](../checkpoints/2026-10-26-1740-b03-ui-harness-correction-STARTED.md).

## 26.10.2026 17:26 МСК — B03 workflow setup failure; retry prepared

Hosted run [40339480704](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40339480704) checked out `685685bcc5b31f05ecf2cc46f2f95a0ecc5184d9` and Node 24.21.0, then failed at setup-node: `Unable to locate executable file: pnpm`. `pnpm/action-setup` was ordered afterward, so no Chrome/app/scenario ran and no artifact exists. Reorder setup to install pnpm before setup-node's pnpm cache resolution; no test/application logic changed. Exact record: [FAILED](../checkpoints/2026-10-26-1726-b03-ui-runner-bootstrap-FAILED.md); retry inputs: [STARTED](../checkpoints/2026-10-26-1727-b03-address-ui-retry-STARTED.md). At diagnosis time, unrelated Actions run 40339494194 remained active; wait for idle before saving.

## 26.10.2026 17:22 МСК — B03 mocked address UI harness prepared

Rechecked actual remote branch head `9cb39fcd59507ac0b562edd5fe5d4a2412d9374c`, PR #14 Draft, and no active/queued Actions. Re-fetched the allowed-branch address snapshot: expires `2026-10-31T08:24:54Z`, reviewed-record hash matches. Added an isolated Node 24 / Chrome 156 / Playwright 1.56 push workflow and eight mocked UI cases. `/r`, classification, calculation and telemetry are controlled; browser requests to non-loopback origins fail closed. Syntax and YAML parsing passed; no browser scenarios have run. Code inspection indicates the swap prop is not wired by the V2 page; preserve as an expected test observation, with no pre-emptive app change. [STARTED checkpoint](../checkpoints/2026-10-26-1711-b03-address-ui-STARTED.md).

## 26.10.2026 17:11 МСК — B03 Chromium smoke DONE; UI scenarios STARTED

Run [40336150199](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40336150199) passed on Chrome 156.0.8078.47: headless `about:blank`, exit 0, exact HTML DOM. Evidence ZIP hash verified and retained. Smoke does not cover UI or B-only behavior. Eight mocked `/r` browser scenarios are now a separate STARTED block; snapshot expiry recheck is required at execution. [Smoke DONE](../checkpoints/2026-10-26-1711-b03-chromium-dom-smoke-DONE.md) · [UI STARTED](../checkpoints/2026-10-26-1711-b03-address-ui-STARTED.md).

## 26.10.2026 17:01 МСК — B03 hosted Chromium DOM smoke STARTED

Remote SHA `1ac7776dea54139554cfce39b20d11b7a04125a2`, PR #14 Draft. Added isolated Chrome runner targeting only `about:blank`; no application `/r`, external address service, or eight UI scenarios in this block. Snapshot expiry is 31.10.2026 11:24:54 МСК; currently fresh, but must be checked again before any scenario use. [STARTED](../checkpoints/2026-10-26-1701-b03-chrome-smoke-STARTED.md).

## 26.10.2026 16:51 МСК — three nationwide tests environment diagnosis DONE

GitHub Actions run [40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721) on allowed head `2907a409305834c4cb9b25bc717978f049bb22f9`, Node 24.21.0: child-process tests 3/3, automatic policy replay integration 3/3, systemic report 1/1; total 7/7 PASS, 0 FAIL. Artifact/log streams fetched and archived with zero exit codes/empty stderr; see [evidence](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md). Earlier local `spawnSync ... EPERM` failures are confirmed Codex child-process sandbox restriction, not product failures. Do not rerun absent a new cause. [Checkpoint](../checkpoints/2026-10-26-1651-nationwide-three-tests-CODEX-ENVIRONMENT-DIAGNOSIS-DONE.md).

## 25.10.2026 07:46 МСК — nationwide three-test infrastructure blocker

Уточнение после readback remote SHA `77658f4bffe872e2db29bd796f4993befa4529c6`: connector ref update не породил GitHub Actions run, а доступного workflow-dispatch API нет. Hosted tests NOT_RUN; sandbox-only classification не сделана. Следующий запуск требует обычного authenticated push event по разрешённой ветке. Подробности: [checkpoint](../checkpoints/2026-10-25-nationwide-three-tests-CODEX-ENVIRONMENT-BLOCKED.md).

Три файла имеют общий наблюдаемый локальный блокер: при попытке запуска `node --test <file>` parent Node получил `Error: spawnSync /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node EPERM`; stdout/stderr дочернего процесса пусты. Assertion-level причины неизвестны. Для отделения sandbox от тестов добавлен узкий Node 24 workflow только в разрешённой ветке; он сохраняет каждый stdout/stderr/exit code артефактом. Результат GitHub Actions пока не подтверждён. [Checkpoint](../checkpoints/2026-10-25-nationwide-three-tests-CODEX-ENVIRONMENT-BLOCKED.md).

## 24.10.2026 21:54 МСК — автономная работа начата

По прямому поручению владельца создана отдельная чистая копия разрешённой ветки на exact remote/PR head `70ab6b840862fa40f090b960ee650b058e83b768`; исходная локальная ветка `work` не изменялась. Обязательные инструкции и полный brief B01–B12 прочитаны. Четыре параллельных исполнителя назначены только на read-only исследование; writer один.

До начала изменений подтверждено отсутствие queued/in-progress/waiting/requested/pending Actions. Широкие тесты и маршруты не запускались. Новая среда содержит Chromium 154, поэтому первым техническим кандидатом после сохранения recovery выбран ограниченный B03 browser block по уже утверждённым восьми mocked `/r` сценариям. Подробности и ограничения: [checkpoint](../checkpoints/2026-10-24-215401-b01-b12-autonomous-recovery-DONE.md).

Следующий шаг: отдельный STARTED для B03, frozen dependency install, фактические PASS/FAIL/SKIPPED/NOT_RUN без включения fallback-флага и без Production.

## 24.10.2026 21:56 МСК — B03 browser preflight BLOCKED

Chromium 154 теперь присутствует, но bounded headless `about:blank` smoke упал до DOM: crashpad `setsockopt: Operation not permitted`, SIGTRAP/exit133. Поэтому dependencies не устанавливались и восемь UI-сценариев не запускались. Статус уточнён с «binary отсутствует» на `BLOCKED_BY_ENVIRONMENT_BROWSER_RUNTIME`; это не дефект приложения и не PASS. Evidence: [README](../../experiments/road-ref-boundaries/checks/2026-10-24-b03-browser-preflight/README.md) · [checkpoint](../checkpoints/2026-10-24-215649-b03-browser-runtime-BLOCKED.md).

Следующий независимый шаг: B04 exact-coordinate/topology intake; официальный км/scope/цена остаются unknown.

## 24.10.2026 21:59 МСК — B04 exact OSM intake STARTED

После durable B03 blocker начат отдельный bounded source intake ровно двух nodes и четырёх ways уже доказанной pending-пары М-4. Лимиты, fail-closed поля и recovery: [STARTED](../checkpoints/2026-10-24-215900-b04-osm-coordinate-intake-STARTED.md). Route replay, тарифные изменения и широкий аудит запрещены.

## 24.10.2026 22:01 МСК — B04 OSM identity/topology DONE; km/scope/fare BLOCKED

Шесть exact OSM API объектов получены HTTP200 и сохранены с metadata/SHA/ODbL. Entry `4443232947` подтверждён как directed `447135768 → 1182567076`, exit `358467208` как `1211606940 → 28835034`; координаты сохранены. Offline verifier PASS15/15, live0. Reviewed manifest остаётся `runtimeEligible:false`, `officialKilometre:null`, `operatorScope:null`, `fare:null`. Runtime/data/tariffs не менялись, route replay/full audit/build NOT_RUN. [DONE](../checkpoints/2026-10-24-220143-b04-osm-coordinate-intake-DONE.md).

Следующий независимый блок: B10 точечное восстановление незавершённого V2 compare Ейск/Майкоп; B05–B09 ждут новых первичных документов.

## 24.10.2026 22:05 МСК — B10 V2 compare recovery STARTED

Сверён старый незавершённый STARTED: V2 evidence/DONE отсутствуют, V3 captures/replay уже сохранены и повторяться не будут. Текущий блок ограничен frozen install и подготовкой двухслучайного V2 harness с no-network preflight; live capture начнётся только после следующего durable STARTED. [План и recovery](../checkpoints/2026-10-24-220525-b10-v2-compare-recovery-STARTED.md).


## 26.10.2026 20:28 МСК — B10 Maykop-only workflow scope staged; docs-only classifier proof next

Rechecked remote branch HEAD `f85955f4d3596617cad3d399a4b593524dd733f6`, PR #14 Draft, and Actions (no queued/in-progress runs). B10 workflow env now selects only `maykop-to-moscow`, saved/read back in `f85955f4d3596617cad3d399a4b593524dd733f6`; `[skip ci]` prevented an incidental run. No provider traffic and no Eisk recapture. The next normal update contains docs/checkpoint only; wait for special verify and classifier result. Trigger exactly one Maykop capture only if required verify passes and wide jobs skip. [Checkpoint](../checkpoints/2026-10-26-2028-b10-maykop-workflow-scope-DONE.md).


## 26.10.2026 20:31 МСК — Maykop workflow-change CI proof — PASS

Run40369124628 for docs-only head `c65db6d026d5fb2b42d62986efa75a675da92a7b`: overall SUCCESS; classifier `no-route-runtime-change-in-update`; required verify (tests, selector, TypeScript, build) SUCCESS; `live_probe` and `calculation_timing` SKIPPED. No actions cancelled and no provider traffic. This proves the pending B10 workflow-only delta does not activate the broad live jobs. Next, after checking idle state, one comment-only B10 workflow update triggers the selected Maykop case; never recapture Eisk. [Checkpoint](../checkpoints/2026-10-26-2031-b10-maykop-selective-ci-proof-DONE.md).


## 26.10.2026 20:35 МСК — B10 Maykop hosted capture + Thu/Sat offline replay + V2/V3 — DONE

Run40369626668 SUCCESS on Ubuntu24.04/Node24.21.0; only Maykop selected. Valhalla, OSRM, BRouter preflight all HTTP200/valid; capture response HTTP200, 36/36 calls HTTP200, capture SHA256 `bd103585f4456c1e3e7b9d45e484a7c630a4d555472f7cefaddc7f97799f6552`. Raw responses and replay/comparison files verified in artifact12671872287 (ZIP SHA256 `586930587557644424dc6ff36107c48e74f4fdd3df0a22cd4f70e54c9e9f472e`, 90-day retention). Thu/Sat offline replays HTTP200, all36 calls consumed, live0/missing0/unused0. V2/V3 each: −1m, 0s, 0₽ delta; Thu5040₽/Sat6090₽ in both; no fare edit. Companion CI40369636065 SUCCESS, mandatory verify PASS, broad jobs skipped. [Evidence](../../experiments/nationwide-tolls/checks/2026-10-26-b10-maykop-hosted-run-40369626668/README.md) · [Checkpoint](../checkpoints/2026-10-26-2035-b10-maykop-capture-DONE.md).


## 26.10.2026 21:00 МСК — comprehensive codebase audit STARTED

User requested a read-only technical audit and `docs/CODEBASE_AUDIT.md`, with no automatic fixes. Verified remote branch `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`, PR14 Draft and Actions idle. Local checkout `82faf1b7bf6634271563dc01dbf504ec889e4b59` is 89 commits behind and dirty, so current code is inspected through GitHub reads. Recursive remote tree has 7,240 entries, dominated by docs/evidence. Defined 18 bounded blocks; no prior routes, mass audit, browser, network or broad tests repeated. [STARTED](../checkpoints/2026-10-26-2100-codebase-audit-STARTED.md).


## 26.10.2026 21:03 МСК — codebase audit block 1/18 DONE: repo inventory/dependency map

Remote tree 7,240 entries; app38/lib119/data25/scripts166. Mapped Next V2/V3 endpoints to shared provider/pricing/policy layers; found static config excludes scripts (tsconfig line53) while Node test command executes them. Tagged as P2 validation gap pending CI confirmation. Provider facade imports M11/M12/M4 toll-specific evidence; V3 UI hook imports V2 utilities/types, tagged architectural coupling risks P2/P3, no behavior defect proven. No tests/build/live calls. [Checkpoint](../checkpoints/2026-10-26-2103-codebase-audit-block-01-DONE.md).


## 26.10.2026 21:06 МСК — codebase audit block 2/18 DONE: address/geocoding

Reviewed remote suggest route, Photon query/rank, timeout/error handling, snapshot fallback, existing tests and saved verification. No provider calls/tests. No confirmed user-visible defect. Candidate risk: label dedupe can hide same-label distinct OSM localities (not reproduced); per-query/pool bounds are not necessarily global rate limits (security block pending). Existing historical focused records 54/48 PASS, 40 mocks peak2 cite older source SHAs and are not claimed as current-head proof. [Checkpoint](../checkpoints/2026-10-26-2106-codebase-audit-block-02-DONE.md).


## 26.10.2026 21:08 МСК — codebase audit block 3/18 DONE: pool/cache/cancel

Reviewed process-local Photon pool, query cache, AddressField cache use, and focused tests. No test execution. No defect confirmed: same-URL singleflight, per-subscriber cancel, last-subscriber abort, queue removal, timeout, positive LRU/TTL and cooldown/reset are implemented/tested. Per-warm-process (not global) scope remains for security assessment. [Checkpoint](../checkpoints/2026-10-26-2108-codebase-audit-block-03-DONE.md).


## 26.10.2026 21:12 МСК — codebase audit block 4/18 DONE: route API inputs/call graph

Reviewed legacy, V2/V3 calculate, classify, version and debug routes at remote source. No requests/tests executed. V2/V3 validate enums/rates/date/coords and isolate route engines. Candidate P2: body/label lack application-level size limits; UI/provider constraints do not protect direct API callers. Legacy /api/calculate has direct Photon/OSRM fetch without local timeout; root UI redirects to /v2, so relevance unknown. Risks, not demonstrated incidents. [Checkpoint](../checkpoints/2026-10-26-2112-codebase-audit-block-04-DONE.md).
