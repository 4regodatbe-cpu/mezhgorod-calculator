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
