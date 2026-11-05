# Stage S — CI harness repair and Yalta diagnostics (LOCAL)

- Status: **DONE LOCAL / NOT PUSHED / LIVE RETEST REQUIRED**.
- Timestamp: 2026-11-06 00:35 MSK.
- Source/remote/PR #14 head at start: `700b3ce5d1e22bb1c02da67bf17e4c8d42875653`.
- Worktree: isolated detached candidate, separate from the main development worktree and its 91 local-only commits.
- PR #14: OPEN / Draft. No push, Production, main, Android, tariff, routing, address-provider or 2GIS changes.

## Prior run evidence and diagnosis

Reviewed run [42106439910](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/42106439910), its job log, `results.json`, and all four failure screenshots in artifact `13451892536` (digest `sha256:66083418daa56d39e73c357f740df7508c5a1ad7bd6f901a2d57a5278df64b65`). `/api/version` identified Production source `a6bea89dd4b481a1352dc492969004e6cd1e6e38`.

The prior runner queried `article.filter({hasText: /^...$/})`. The regular expression was anchored as if the entire article contained only its heading, but actual `RouteCard` renders an `h3` alongside route metrics, pricing and copy controls. Consequently cases 05–07 displayed real route results in screenshots but were recorded as FAIL when the article locator timed out. The API had returned an `ok` response and positive meters/seconds before this UI failure, but the runner did not persist the HTTP status/metrics into the JSON observation. Scenario 01 timed out waiting 30 seconds for suggestions; its artifact did not record whether `/r` was sent or what it returned, so cause remains unknown. Scenarios 02–04 were blocked by that failed initial selection; analytics was not independently verified by the old summary.

## Changes

- `scripts/v3-live-browser-acceptance.mjs`: result lookup now targets the actual level-3 heading and its nearest ancestor `article`. DOM checks are separate for heading, distance, duration, and tariff evidence appropriate to API toll state (`priced`, `free`, `unknown`). The clear-result check uses the same actual heading contract.
- API observation is saved immediately after the real `/api/v3/calculate` response, before DOM assertions: exact HTTP code, elapsed time, JSON validity, any independently valid distance/duration, toll pricing state, pricing-table presence and deployed SHA. A DOM failure preserves both records and is classified `API_PASS / UI_FAIL`; malformed pricing or HTTP errors do not erase valid route metrics.
- `/r` remains live and unmocked. Request diagnostics record whether a POST was sent, the fixed query text, HTTP status, elapsed time, result count, `partial`, fallback source, a bounded UI-state enum and JavaScript errors. Raw response bodies, geometries, coordinates and provider payloads are not retained. The original 30-second suggestion timeout is unchanged.
- Analytics interception records request count, successful `route.abort('blockedbyclient')` count and abort errors. Scenario 08 passes only if at least one request was intercepted, all intercepted requests were successfully aborted, there were no abort errors, and a real calculation and its DOM result passed in the same browser context; otherwise it is `NOT_VERIFIED`.
- `scripts/v3-live-browser-acceptance-contract.mjs` and tests cover API/DOM separation, h3/article contract, bounded search diagnostics, and honest analytics classification.
- The separate workflow path filter includes the helper module. Existing B03 workflow was not altered.

## Checks actually run

- `node --check scripts/v3-live-browser-acceptance.mjs` — PASS.
- `node --check scripts/v3-live-browser-acceptance-contract.mjs` — PASS.
- `node scripts/v3-live-browser-workflow.test.mjs` — 7/7 PASS.
- `node --test scripts/v3-live-browser-workflow.test.mjs` — exit 0.
- PyYAML parse plus timeout assertion for `.github/workflows/v3-live-browser-acceptance.yml` — PASS.
- `git diff --check` — PASS.
- No live browser rerun, app test/build, or GitHub Actions run was performed in this local-only stage. Production’s previous real-browser outcomes remain as above; no new route status is claimed.

## Next step

Local checkpoint commit has parent `700b3ce5d1e22bb1c02da67bf17e4c8d42875653`. Incremental bundle: `/workspace/v3-live-browser-acceptance-stage-s-2026-11-06.bundle`; `git bundle verify` passed and reports that it requires the parent commit as a prerequisite.

The candidate is prepared for one separately authorized ordinary fast-forward push from parent `700b3ce…`. Push is explicitly not authorized in this stage. After authorization, run the existing workflow and inspect its new `results.json`, HTTP evidence, failure evidence and screenshots. Do not claim seven route calculations passed until those new outputs establish it.
