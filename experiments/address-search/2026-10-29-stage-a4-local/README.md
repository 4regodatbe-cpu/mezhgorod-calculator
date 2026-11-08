# Stage A4 — local acceptance evidence, 29.10.2026

This directory preserves completed checks, not a new live-audit instruction.
No push, deployment, share link, CI edit or Production change was performed.

## Source boundary

- Published source remains `a1c169d3c7dce49b7d1d3747b9698e7aee4b581a`, PR14 Draft.
- The owner reports successful city/display checks of that Preview in the Stage A request. This is owner-reported evidence, not a new agent browser capture.
- Actual local API and browser captures here exercised the built core address fix at `c962fb730c42fd42f192ee55bbba9de20341bbbc` (tree `5c64fbc94587b2195c2d56c61b94c0b1fe989fdb`).
- Subsequent numeric-locality/administrative-city-slot guards at `00e9983cf2669fad38f36681401e7ac6f5bd1e6a` (tree `8bbc1e712e6eb8c11fa91d7485d35f624789dda8`) passed final isolated tests, offline gate, TypeScript, scoped ESLint and webpack production build. These guards were not claimed as another live browser run.
- Adding this evidence and its checkpoint does not change runtime source. Corrected A2 code is **not deployed** to the published Preview.

## Actual local requests, no response mocks

`compound-api-response.json` is the actual `/api/suggest?q=Красная 100 Краснодар` response: HTTP200, 4.939040s, first result `W-109771669`, authentic building name and `Красная улица, 100, Краснодар`. Other-city choices remain present. It is not a certificate of all Photon address coverage.

`city-browser-review.json` contains actual POST `/r` responses and one actual POST `/api/v3/calculate` response. Chromium154.0.8037.57, desktop1280×900 and mobile390×844/touch: Moscow/SPb selection, A↔B twice with refocus, clear A→Volnovakha preserving B, clear B→Sevastopol preserving A all PASS. City responses identify GeoNames. No route interception or mocked address response was used.

The **single** Moscow→SPb control calculation returned HTTP200 in4229ms, 711430m/24889s. It verifies end-to-end coordinate/API compatibility, not independent certification of toll amounts or every provider. Server telemetry records one BRouter error while the request succeeds with a selected Valhalla route; no route/tariff fix or repeated route audit was attempted.

`detail-browser-review.json`: desktop/mobile actual `/r` for `Красная 100 Краснодар`, exact requested city/street/house first, selection value equals the returned label, HTTP200 both. Requests may use the server cache; the report does not certify outgoing-request counts. Screenshots preserve final selected state, not a screenshot of the open dropdown.

The original scripts are archived as `*-browser-runner.mjs`. They depend on this environment's `/opt/codex/cua_node` Playwright, `/usr/bin/chromium`, local port3193 and `/tmp` outputs. They are execution records, not portable CI tests, and must not be blindly rerun: the city runner makes one real calculation. Actual invocation was `node /tmp/stage-a4-browser.mjs` and `node /tmp/stage-a4-detail-ui.mjs` with the standard additional permissions required by this environment. Browser subprocesses were closed after each run.

## Reproducible contracts / final gates

Node24.19.0; existing registration via `node --import ./scripts/register-ts-paths.mjs --test` and normal per-file isolation. The new `scripts/compound-address.test.ts` replays saved actual Photon windows plus explicitly synthetic edge cases; six regressions failed before the relevant correction and passed after it. Final `logs/targeted.log` preserves81PASS/0FAIL across compound queries, language/region priorities, admitted GeoNames API, pool, cancellation,503/cooldown and remaining-budget contracts. Controlled full-Photon-outage tests are simulations, not an induced hosted outage.

- `npm run test:audit`:1013PASS/0FAIL/1SKIP, plus quote/API checks PASS, exit0 (`logs/audit.log`). No new mass live audit.
- `node_modules/.bin/tsc --noEmit`:exit0 (`logs/tsc.log`, intentionally empty).
- Scoped ESLint of the changed runtime/test files:exit0, one unchanged unused-key warning (`logs/eslint.log`).
- `node_modules/.bin/next build --webpack`:exit0, Next16.3.4, existing preferredRegion deprecation (`logs/build.log`).
- `logs/earlier-shared-isolation-failure.log` preserves an earlier diagnostic combination with `--test-isolation=none`:two fetch-count failures from shared Photon cache. The normal isolated suite passed without weakening assertions or changing the cache.

## Measured local resources, not Vercel

Local server: `GEONAMES_LOCAL_PILOT=1 GEONAMES_LOCAL_TEST=1 NODE_OPTIONS=--use-env-proxy node_modules/.bin/next start --hostname 127.0.0.1 --port 3193`.

`logs/server.log` shows startup Ready124ms. This is process readiness, **not a measured first-request cold latency**. One `ps` sample at process elapsed06:24 showed RSS197028KiB (Next/app/data/cache together, not GeoNames alone or peak RAM). The detailed HTTP request was4.939040s; the actual full calculation4.229s. These are individual observations, not p95/SLA estimates, and no cloud resource figure is inferred.

## Remaining limits

Exact Moscow/Tverskaya/house1 was not present in either bounded saved RU window; absence from Photon globally is not proved. Returned real partial matches are not converted into an invented exact house. Two global Photon503 responses are retained in the separate A2 capture directory, with no manual retry of those failed URLs.

No admitted operational independent free street/house reserve exists yet; the existing Geoapify research adapter is city-only, disabled and unreviewed. GeoNames city independence remains covered; excluded52081 records were not imported. Full GeoNames semantic/coverage certification remains PARTIAL.

Fresh local mobile runs PASS; they neither reproduce nor explain the historical resized-page/mobile timeout. Its cause remains UNKNOWN. Newly normalized priority-area administration is contract-tested with source-backed Russian fields, not independently confirmed on a new hosted sample. Real hosted acceptance of the corrected A2 source requires separately authorized publication and access. No further live calls are needed to preserve this result.

Photon/OSM responses retain original IDs/coordinates; data attribution: © OpenStreetMap contributors, ODbL, https://www.openstreetmap.org/copyright ; GeoNames CC BY4.0/source attribution is included in each localSource response and the UI.
