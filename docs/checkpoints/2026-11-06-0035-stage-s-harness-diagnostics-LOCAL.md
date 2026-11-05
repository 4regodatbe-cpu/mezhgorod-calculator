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

## Post-push live result

- Exactly one ordinary fast-forward push was performed after the owner authorized it. GitHub readback and PR #14 confirmed head `7d5caee6602ae0431906566ab2ec074fd89b8540`; PR remains OPEN / Draft. Production was not changed; `/api/version` reports `a6bea89dd4b481a1352dc492969004e6cd1e6e38`.
- Live workflow [42116523393](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/42116523393) completed FAILURE in 2m31s on the live test step; static contract step passed and artifact upload passed. Artifact `13456406844` digest is `sha256:111e7de41e63894bcf0184bea8821ac16363c188a11322262c053671d85f380c`.
- Eight outcomes: 3 PASS (#05 Donetsk→Volnovakha, #07 Krasnodar→Rostov-на-Дону, #08 analytics isolation), 2 FAIL (#01 Yalta→St Petersburg, #06 Donetsk→Melitopol), 3 BLOCKED (#02–04); no API_PASS/UI_FAIL.
- #01 and #06 both timed out after 30 seconds waiting for suggestion buttons. In both cases the runner recorded `requestSent:false`, no `/r` HTTP status/latency/items, no visible error/loading/empty/results state, and zero page errors. Failure screenshots show the input blank. The evidence localizes failure before the search HTTP request; it does not establish Photon failure, empty response or a delayed response. This may be an automation/client-hydration input-readiness race, but current evidence cannot prove that over a runtime interaction defect.
- #05: `/api/v3/calculate` HTTP 200 in 3599 ms; 58.301 km / 4325 s; toll status `free`; DOM showed 58.3 km, 1 h 12 min, four fare totals; no page errors. #07 (mobile): HTTP 200 in 3511 ms; 273.894 km / 14627 s; toll status `priced`; DOM showed 273.9 km, 4 h 4 min and 1,000 ₽ tolls (Fri–Sun); no page errors. #08: one analytics request observed, one abort succeeded, zero abort errors, based on successful #07 API+DOM result.
- Artifact contains screenshots for #01, #05, #06 and #07 only; blocked steps and derived #08 have no separate screenshots. All available screenshots were inspected.

## Next step

Do not perform another push without separate authorization. The smallest diagnostic follow-up is to capture the actual input value immediately after fill and after a short control-stability check, then wait for the client component to be interactive before issuing city searches. Re-run the existing acceptance to distinguish input/hydration timing from a runtime search defect. Do not change GeoNames, Photon or production code until a repeatable user-level failure or `/r` response supports it. The original 91 local-only commits remain untouched.
