# B03 mocked address UI scenarios — STARTED

26.10.2026 17:11 МСК; execution-config update 26.10.2026 17:22 МСК. Parent at start: allowed branch `fix/v3-missing-route-prices-2026-10-15`, head `0895948e294b9f17efa00cb8a9a52c14bf9eef27`; PR #14 Draft. Before this config save, branch readback showed `9cb39fcd59507ac0b562edd5fe5d4a2412d9374c`, PR #14 remained Draft, and no runs were queued/in progress. Chromium prerequisite passed in run `40336150199`, Chrome `156.0.8078.47`.

## Scope and limits

Implement eight browser scenarios listed in [ADDRESS_CITY_SNAPSHOT.md](../../experiments/road-ref-boundaries/ADDRESS_CITY_SNAPSHOT.md) and B03 brief, using the real local V2 app and Playwright on GitHub-hosted Chrome. Intercept only `/r` with deterministic response fixtures based on the exact reviewed records and `fallback.source=reviewed_city_snapshot`. Abort all browser requests to non-local origins. This verifies UI behavior under mocked responses only; it is not real Photon availability or a complete UI→API→Photon test. Do not change app logic unless a scenario exposes a proven defect; if so, stop at that boundary, record the exact failure, and preserve existing flags/data guards.

The source expiry was last confirmed from current remote JSON as `2026-10-31T08:24:54Z`; re-read it from the current remote branch immediately before scenario execution and fail closed if expired. No snapshot record may be used after expiry without new capture/review. Leave `addressCitySnapshot=false`; do not change Production, Android, main, backup, PR state, routes or tariffs.

## Planned cases and evidence

1. Two distinct Donetsk results in A, no automatic selection, notice, credit and exact OSM copyright href.
2. Select fallback items in A and B, preserving selected label/position/source metadata and notice.
3. Swap A/B and verify values plus source metadata move together and prior calculation result resets.
4. Clear B, enter another city, verify old items/position/source cleared and new request selectable.
5. Delay an old response, edit/clear, then verify abort cannot restore stale data/notice or replace new input.
6. Normal response with no fallback, empty success, 502 and retry; no stale selectable items.
7. Repeated fallback query causes a fresh `/r`; ordinary positive cache remains intact.
8. Narrow viewport and keyboard operation; capture screenshot, viewport dimensions and request count.

Save a per-scenario JSON outcome, expected/actual summary, request count, viewport and evidence SHA; retain browser stdout/stderr, environment versions and screenshots where relevant. Do not launch external services. Do not claim the original B-only phone issue is fixed solely from mocked results.

## Execution plan

Use a narrowly scoped workflow and test harness. Install only frozen project dependencies plus a pinned, temporary browser test runner; start local `pnpm dev`; test Chromium against loopback with network egress blocked at the browser request layer. The test runner itself must assert no unexpected external request. Save a separate DONE/FAILED/BLOCKED checkpoint and read back all changed files before proceeding further.

## Prepared isolated workflow (not yet run)

At 17:22 МСК the current remote snapshot was fetched again from the allowed branch: `expiresAt=2026-10-31T08:24:54Z` (31.10.2026 11:24:54 МСК), `recordsSha256=98f0b3aff117d77525bcba9d65c4d507b1a29d540e0c9fdf553e5fb9494b2933`; exact record-set hash recomputation passed. The eight-case harness is `experiments/road-ref-boundaries/scripts/b03-address-ui-scenarios.mjs`; isolated push-only workflow is `.github/workflows/b03-address-ui-browser.yml`, scoped to these files and the permitted branch, Node 24, Chrome 156.0.8078.47, and Playwright 1.56.0. It intercepts `/r` with snapshot-derived fixtures and mocks `/api/v2/classify`, `/api/v2/calculate`, and `/api/collect`; browser requests to non-loopback origins are blocked and counted. It saves per-case actuals, request counts, viewport, stdout/stderr, versions, screenshots and their SHA-256. It fails closed after snapshot expiry or hash mismatch.

Static checks before save: `node --check experiments/road-ref-boundaries/scripts/b03-address-ui-scenarios.mjs` passed; PyYAML parsed the workflow; local snapshot expiry and records hash check passed. These are not browser scenario results. First attempt [40339480704](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40339480704) failed at `actions/setup-node` because pnpm was installed afterward; no browser or scenario ran and no artifact exists. Exact outcome: [bootstrap FAILED](2026-10-26-1726-b03-ui-runner-bootstrap-FAILED.md). The workflow was corrected by ordering pnpm setup first, then Node setup with pnpm cache; app code/assertions are unchanged. Retry inputs are separately saved at [retry STARTED](2026-10-26-1727-b03-address-ui-retry-STARTED.md). First expected UI observation remains that `CalculatorForm` supports optional `onSwap`, but `app/v2/page.tsx` does not pass it; do not preemptively change app code or claim the original B-only bug fixed.
