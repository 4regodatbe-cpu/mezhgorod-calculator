# Stage AA — V3 final-gate repair and bounded live diagnosis (DONE LOCAL)

Date: 2026-11-07 UTC  
Base: published `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`  
Isolated worktree/branch: `/workspace/final-gate-v3`, `codex/final-gate-v3-repair`  
Implementation commit: `da4e362013ddbe2e2fb7ed9e3ed44d1ea4f3ab2f`  
Published branch read at start: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`  
PR #14: OPEN / Draft. No push, merge, PR/base change, main, Production, Android, V2 runtime, tariff or geometry changes.

## Result

The final-gate scripts and workflow now test the current V3 product contracts while retaining explicit legacy V2 safety checks. No runtime or tariff-data defect was established by this diagnostic, so none was changed. `unknown/null` is retained for undetermined toll totals.

The previous three live scripts (`segment3-free-truth.mjs`, `live-user-route-audit.mjs`, `route-monitor.mjs`) called `/api/v2/calculate`; therefore their nine route-monitor case failures were not V3 acceptance evidence. The saved checks had unsupported “must find a free alternative” expectations for seven cases. Moscow→Kazan and Yalta→Krasnodar were classified as toll routes, not free; the Yalta→Krasnodar assertion incorrectly demanded a positive exact price despite `unknown/null`. No source-backed free corridor or exact toll amount was available to turn those assertions into expected truths. Confirmed V3 P0/P1 defects from those nine cases: **0**.

## Changes

- `.github/workflows/calculator-final-gate.yml`: added a scoped push trigger on the authorized working branch (read-only `contents` permission); aligned PR base trigger with the observed PR #14 base; root/current product smoke now checks `/v3`, verifies `/v2` remains HTTP 200, and uses `/api/v3/calculate`. Live and strict freshness outcomes are evaluated separately by a final aggregate step. No `workflow_dispatch` was added because this workflow is absent from `main`; a push to the feature branch is the reliable supported trigger without changing `main` or PR base.
- Replaced deleted-script references with actual checks: the maintained 61-row offline Yandex benchmark integrity (`pnpm test:route-benchmark`), V3 pipeline/final-price/unpriced-coverage integrity tests, and the strict existing tariff freshness checker. These are executable checks, not success stubs. Strict freshness can correctly fail and remains a release gate.
- `scripts/api-contract-smoke.mjs`: 16 invalid/contract requests cover legacy V2, current V3, suggestions and telemetry. No successful route-calculation request is made, so this smoke does not spend provider routing calls.
- `scripts/segment10-production-readiness.mjs`: corrected static expectations to current V3/shared truth contract while keeping V2 legacy safety assertions.
- Added `scripts/v3-production-readiness.mjs`, `scripts/v3-live-route-contract.mjs`, `scripts/v3-live-route-audit.mjs`, and six tests in `scripts/calculator-final-gate-workflow.test.mjs`. The live audit is one pass across six fixed controls, with no retries; the saved report contains only sanitized route summary fields, never provider bodies or route geometry.

## Bounded V3 route results

Inputs used the fixed city coordinates and standard vehicle, with departure `2026-10-02T09:00:00+03:00`; endpoint `/api/v3/calculate`.

| Route | HTTP | Distance / duration | Toll result | Assessment |
|---|---:|---:|---|---|
| Ялта→Краснодар | 200 | 501.2 km / 416 min | `priced`, 800 ₽; one A‑289 component | API route and toll component returned. This is not an independently confirmed full-route operator quote. |
| Ялта→Москва | 200 | 1817.8 km / 1476.8 min | weekday 4725 ₽ / weekend 5625 ₽; M‑4 + A‑289 | API route and its currently composed components returned; not a blanket independent quote for every tariff product. |
| Донецк→Казань | 200 | 1534.9 km / 1424.4 min | `unknown/null`; M‑12 detected but no direct proven current tariff pair | Fail-closed tariff-data/boundary gap. Transfer pricing is separate from toll charge. |
| Москва→Казань | 200 | 820.2 km / 687.9 min | `unknown/null`; M‑12 direct pair not proven | Do not infer zero or use a nearby tariff pair. |
| Тверь→Адлер | 502 | no route | not available | Geocoding succeeded; the API recorded failures from Valhalla, OSRM and BRouter but returned no provider-level status/exception. External/provider chain is the observed failure; root cause is undetermined. |
| Голубицкая→Санкт-Петербург | 502 | no route | not available | Same observed provider-chain failure; no route or toll result can be claimed. |

Only four routes returned a complete route result. The two HTTP 502 cases are blocked, not successful routes and not evidence of wrong geometry. No additional live request is needed in this block.

## Free-alternative and freshness findings

Saved free-truth checks expected uncertain candidate alternatives for Moscow→Krasnodar and Moscow→Sochi. Current contract kept `free=null` and an explanatory `freeError`, rather than claim unverified routes free. Moscow→Kazan had a confirmed toll classification, so “free” was false. Yalta→Moscow and Moscow→Saint Petersburg passed their saved assertions. This does not prove there is no free route; it proves the old assertions lacked the evidence required to claim one.

Strict freshness remains BLOCKED for these two rows (as of 2026-11-07):

- `avtodor-other-roads-2026-10-01-category1-transponder`
- `avtodor-other-roads-2026-10-01-category1-no-transponder`

Both snapshots are 37 days old against a 30-day limit; `effectiveFrom` remains UNKNOWN. No later first-party tariff evidence was present in the reviewed saved evidence. The `observedAt`/`verifiedThrough` date and threshold were not altered. These are a genuine final-gate freshness blocker, not a test-harness failure.

## Checks actually completed

- `pnpm build`: **1142 PASS, 0 FAIL, 1 skipped**; standard Next/Turbopack production build completed successfully, including TypeScript/build checks.
- `pnpm lint`: exit 0; 9 existing warnings, 0 errors.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm exec next build --webpack`: PASS.
- `node scripts/calculator-final-gate-workflow.test.mjs`: **6/6 PASS**.
- `node scripts/api-contract-smoke.mjs` against local built server: **16/16 PASS**; no route-provider-success requests.
- `node scripts/segment10-production-readiness.mjs`: PASS.
- `node scripts/v3-production-readiness.mjs`: PASS.
- `pnpm test:route-benchmark`: PASS, 61 records / 60 Yandex / 9 toll-period rows.
- Relevant JavaScript syntax, workflow YAML parse and `git diff --check`: PASS.
- Existing local production server returned root 307 to `/v3`, `/v2` 200, `/v3` 200, `/api/version` 200. Its commit metadata was null because it was an already-running local process without `GITHUB_SHA`; this is not a hosted SHA verification.
- One earlier normal-sandbox direct test-glob attempt showed 3 subprocess `EPERM` failures. The final current-tree `pnpm build` was run with supported execution permission and completed 1142/0/1; no tests were weakened. This does not substitute for hosted Actions on the local commit.

## Readiness and next action

Local code/tests are ready for a controlled hosted run, but release is **BLOCKED**: strict freshness has two stale rows, two live routes had HTTP 502, and no GitHub Actions run exists for implementation commit `da4e362…`. The candidate is not ready for Production. The workflow now runs from a push to the working branch; publishing it requires a separate owner authorization for a normal non-force fast-forward push. After that authorization, inspect the exact-SHA Actions run and sanitized route report; address the two stale official tariff snapshots only from new first-party evidence. See [`docs/NEXT_STEPS.md`](../NEXT_STEPS.md).

The previous STARTED checkpoint is retained unchanged: [Stage AA STARTED](2026-11-07-v3-final-gate-repair-STARTED.md).
