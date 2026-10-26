# Codebase audit fixes — work log

## 26.10.2026 23:14 МСК — AUD-DATE-01 DONE

- Исходная разрешённая ветка / parent: `fix/v3-missing-route-prices-2026-10-15` / `fd41d4aaa817f8904be7e141b5bd6e5c0aca0ede`; PR #14 Draft. Рабочая копия создана отдельно из проверенного remote HEAD.
- Подтверждён дефект: V2 использовал только успешность `new Date(value)`, нормализуя, например, `2026-02-30`; дата с временем без TZ не отклонялась. Тарифный выбор и маршрутизация не менялись.
- Добавлены V2 request-level cases: невозможный календарь, не leap-year 29 Feb, locale date, timestamp без TZ, 24:00 — 400 до внешнего запроса; leap-day, date-only и timestamp с TZ принимаются.
- RED: до исправления `2026-02-30T09:00:00+03:00` дал 502 и дошёл до stub provider вместо 400; 8 остальных тестов файла прошли. GREEN: `scripts/special-territory-api.test.ts` 9/9; `npx tsc --noEmit` exit 0; `git diff --check` PASS.
- Ограничение: полная PR Actions verify не запускалась, поскольку её текущая runtime-классификация может включить широкий live-probe с 50-route corpus без связи с валидацией даты. Точечные/offline проверки выполнены; не утверждается PASS полного CI.
- Пути: `app/api/v2/calculate/route.ts`, `scripts/special-territory-api.test.ts`, текущий state, этот журнал/план и checkpoint.
- Следующий блок: AUD-ERROR-01; никакие тарифные суммы, effectiveFrom или recovery policy не менялись.

## 26.10.2026 23:17 МСК — AUD-ERROR-01 DONE

- Исходный parent: `725b78916da2f51c8861f8c02cfed67b7f0ea3a8`; разрешённая ветка; PR #14 Draft.
- До исправления неизвестное исключение `Error("private-provider-host.example/token")` возвращало HTTP 400. Проверка воспроизведена для обоих API handlers.
- Добавлен общий typed classifier `lib/calculate-api-error.ts`: allowlist известных клиентских (400) и upstream (502) codes; все остальные исключения получают категорию `internal` и HTTP500. Тексты клиентских ответов остаются whitelist-only и не включают `error.message`. Существующие специальные error messages сохранены.
- Добавлены endpoint contract tests для V2 и V3: адрес не найден→400, известная ошибка geocoding 503→502, неожиданное исключение→500; приватная строка отсутствует в body. RED: V2 unexpected exception был 400 (ожидался500). GREEN: новый mapping test 1/1; `special-territory-api.test.ts` 9/9; `v3-api-audit.test.ts` PASS; `npx tsc --noEmit` exit0; diff check PASS.
- Изменены оба API route handler, один общий classifier и focused test. Live providers не вызывались; fetch полностью mock.
- Полный Actions/широкий live-probe не запускался: unrelated 50-route corpus не нужен для mapping. Не заявляем hosted CI.
- Следующий блок: AUD-CI-01. Тарифы, геометрия и восстановления не менялись.

## 26.10.2026 23:21 МСК — AUD-CI-01 STARTED

- Parent `28c48f1e89ea5cd8b0907b221f97a6c0f045050e`, allowed branch only, PR14 Draft, no active Actions at preflight.
- Test-first RED: the new config regression reports Node22.13.0 in both `.github/workflows/route-quality.yml` and `.github/workflows/systemic-toll-composition.yml` while `package.json` requires24.x. Updated only those `node-version` scalars to `'24'`; workflow triggers/jobs/commands and toll/geometry assertions are unchanged.
- Local checks: `scripts/audit-ci-node-version.test.mjs` 2/2 PASS; PyYAML syntax parse2/2 PASS; existing live-scope classifier10/10 PASS; exact changed-path model returns `no-route-runtime-change-in-update`; systemic composition command PASS under Node24.19; `tsc --noEmit` exit0.
- `pnpm build` could not start because managed environment lacks `/home/agent/.local/share/pnpm`. Equivalent `npm run build` started the repository’s broad offline `test:audit`; the two already-known spawnSync-dependent nationwide suites failed in this Codex sandbox, so the run was interrupted (exit130) and Next build stage did not run. No retry planned here. Running Next build directly also stopped with Turbopack `creating new process/binding to a port: Operation not permitted` (exit1). These are environment limitations, not evidence of a Node24 workflow regression.
- The scoped PR verify is started by this test/workflow update. Expected classifier outcome is skip live jobs; if metadata is incomplete, current fail-open may choose live, which is a CI limitation to report accurately. Await Actions completion before declaring DONE; no files may be written during the run.

## 26.10.2026 23:28 МСК — AUD-CI-01 DONE; hosted verify PASS

- Readback source/Actions commit `0cff630ba12547e9c9f9261aca123a67ec80d2aa`, PR14 still Draft. No active runs remain.
- Hosted run [40394972858](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40394972858) on GitHub-hosted Ubuntu24 and Node24.21.0: `verify` PASS (438/438 project tests, existing classifier10/10, issue capture4/4, TypeScript, Next build); `calculation_timing` PASS; overall run SUCCESS.
- Contrary to local classification model, hosted classifier output `route-runtime-changed` because its last verified baseline predates earlier skipped commits. Consequently `live_probe` ran. Its route geometry probe PASS; address runtime probe completed3/3 in2.427s: Ростов PASS (103 features), Красн PASS (20), Донецк SOURCE_UNAVAILABLE (HTTP503/cooldown, 0 features). 50-settlement and Yandex jobs SKIPPED. Job conclusion failure is tolerated (`continue-on-error`); overall workflow SUCCESS. This unplanned live probe is logged; do not repeat it. No B03 browser or B10 capture ran.
- Local isolated version/YAML checks PASS; exact systemic composition workflow command PASS on Node24.19. Local `npm run build` could not complete because nationwide child-process tests are blocked by known Codex `spawnSync EPERM`; direct Turbopack build also hit `Operation not permitted`. Hosted verification resolves the Node24/build regression question; the local failures remain environment-specific.
- Only setup-node versions changed; triggers, jobs, pricing and geometry checks/assertions untouched. Next block: AUD-UI-01.

## 26.10.2026 23:30 МСК — AUD-UI-01 DONE

- Parent: `3f5f751898554cde144cbf67c6eff1d61bcc2f36`; allowed branch and PR14 Draft; Actions idle after run40394972858.
- Regression test first: new `scripts/v2-hook-unmount-abort.test.mjs` failed because the request AbortSignal remained `aborted:false` after simulated component cleanup. The deferred response is released, and late result remains uncommitted after the fix.
- Minimal fix in `app/v2/components/use-v2-calculation.ts`: `useEffect` cleanup aborts `pending.current` and clears the ref. No fetch semantics, result behavior, or business logic changed.
- GREEN: focused V2 lifecycle1/1, existing V3 lifecycle/race6/6, ESLint focused files (0 errors; existing `analyticsVersion` unused warning), `npx tsc --noEmit` exit0, diff check PASS.
- No browser/B03 or external services. Full hosted verify not triggered because this V2 runtime path makes special live classifier run unrelated provider corpus; it is not required to verify the abort contract. No CI run active before save.
- Next block: AUD-DATA-01 read-only evidence/recommendation; do not edit tariff values or effective dates.

## 26.10.2026 23:31 МСК — AUD-DATA-01 evidence DONE; tariff provenance BLOCKED_BY_DATA

- Parent `7769f0b0840962ac7289acdb04f08e57e9a6e8a8`; no active Actions, PR14 Draft.
- Inspected only existing source/workflow/script; no network or tariff source requests. At `lib/toll-engine/tariff-registry.ts` rows M11 58–679 and Avtodor-other-roads transponder/no-transponder explicitly state effective-from not established; three rows keep `effectiveFrom:null`.
- `.github/workflows/calculator-final-gate.yml:55-59` pins `TARIFF_AS_OF=2026-10-02` and strict stale mode. `scripts/check-tariff-freshness.mjs:3,12-19` computes age from `observedAt`; it counts missing effectiveFrom but only prints it. Exit2 is set only for stale rows.
- Reproducible offline runs: current `asOf=2026-10-26`: 4 rows, stale0, effectiveDateUnknown3, ages24/25d; pinned `asOf=2026-10-02`: stale0, unknown3, ages0/1d; simulated `asOf=2026-11-20` + strict: 4 stale, unknown3, exit2. The workflow's frozen date means that simulated future staleness would not advance in its actual run.
- Evidence proves gate drift and metadata incompleteness; it does not prove any displayed fare amount wrong. Recommendation: derive freshness date from CI run UTC date (with deterministic test override), and separately surface UNKNOWN effective date as unresolved provenance. Obtain exact applicability dates from operator primary documents before editing any tariff metadata or fare values.
- No data/code/tariff changes. Next: AUD-TRACE-RECOVERY-01 static/offline evidence only.

## 26.10.2026 23:32 МСК — AUD-TRACE-RECOVERY-01 evidence DONE; policy unchanged

- Parent ee8d14bdcb869eeb74041c728167337765ea137f; allowed branch; PR14 Draft; no active Actions.
- Static chain: lib/toll-validator.ts:317-338 returns status "toll" whenever any toll edge was seen, even with complete:false and partial booth-event coverage. lib/toll-recovery.ts:117 sets mapMatched from status alone; :101-103 therefore selects the more permissive thresholds in lib/toll-recovery-data.ts:62-63 (M4 2 vs4, M12 2 vs5 adjacent sections).
- Offline synthetic control using the existing M12 geometry from scripts/v3-unpriced-coverage-audit.test.ts and explicit validation complete:false, checkedChunkCount=1/2, boothEventCoverage=partial returned recovery helper amount 995 for two approximate M12 sections; passing it to tollsForApi yields pricingStatus=priced. This amount is an internal fixture/output, not an independently established current fare or route quote.
- V2 call path (lib/v2-calculation/route-leg-pricing.ts:144-148; lib/v2-calculation/route-leg.ts:137) passes remote recovery to tollsForApi, whose positive-amount branch (free-route-selection.ts:48-58) marks it priced without checking trace completeness. This is a reproducible helper/serialization behavior and a P2 risk; no live or actual user route was tested.
- V3 currently converts recovered corridor fragments to unknown/diagnostic-only at lib/v3-calculation/route-leg-pricing.ts:241-247. Existing coverage test uses validation complete:true; no dedicated partial-trace recovery regression was found. No routes, captures, or external providers were revisited.
- Recommendation: before altering recovery thresholds, add an isolated incomplete-trace regression and decide explicitly whether partial trace may support diagnostic fragments only. Do not let incomplete geometry/map-match evidence become a known full numeric fare; preserve V3 fail-closed output and unknown semantics. Any threshold/policy change requires separate authorization and evidence.
- No code, amounts, effective dates, or recovery rules changed. Four requested code fixes are done; this was the sixth of six plan blocks.
- CI side effect during this docs-only analysis: run40396491540 (commit ee8d14bdcb869eeb74041c728167337765ea137f) also ran despite the local path model: live geometry step PASS; address runtime step failed SOURCE_UNAVAILABLE after Ростов PASS106, Красн PASS20, Донецк 503/cooldown with0 results; 50-settlement and Yandex steps SKIPPED; overall workflow SUCCESS. This was not a new authorized route audit; do not repeat. Another intervening docs run40396071858 completed verify/classifier successfully with live jobs SKIPPED.
