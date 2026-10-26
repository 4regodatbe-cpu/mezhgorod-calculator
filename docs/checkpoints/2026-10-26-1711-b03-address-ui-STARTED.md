# B03 mocked address UI scenarios — STARTED

26.10.2026 17:11 МСК. Parent: allowed branch `fix/v3-missing-route-prices-2026-10-15`, remote head `0895948e294b9f17efa00cb8a9a52c14bf9eef27`; PR #14 Draft. Chromium prerequisite passed in run `40336150199`, Chrome `156.0.8078.47`; no active Actions at block start.

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
