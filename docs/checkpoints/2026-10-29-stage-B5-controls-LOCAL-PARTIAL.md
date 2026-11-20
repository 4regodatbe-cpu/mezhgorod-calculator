# B5 — five-control acceptance LOCAL / four positive evidence sets, one data blocker

29.10.2026 MSK; runtime180e7caad4381a92057035827ba1be88113e2bc1, prior B5STARTEDcf45e4b7. No runtime edits after fullgate1031PASS/1SKIP, TS/scopedlint/webpackPASS. Stage A and all old commits retained. No push/Preview/CI/Production/main/Android/backup/merge/force operation.

## Controls and exact evidence scope

| Direction | Provider/status | Distance m | Travel seconds | Calculation time | Toll output / limit |
|---|---|---:|---:|---|---|
| Moscow→SPb |Valhalla/200|711430|24889|4229ms, retained earlier actual browser/handler|priced; old source, not rerun or recertified |
| Krasnodar→Moscow |Valhalla/200|1346445|64394|8597.233ms, ONE new actual current handler with real external services|priced; actual output, no independent tariff recertification |
| Krasnodar→SPb |OSRM/200|2061460|94846|775.576ms, current offline replay|priced;19storedrequests/0misses/0network, NOT live latency |
| Donetsk→Moscow |OSRM/200|1122972|58268|2358.654ms, current offline parity run|priced;12storedresponses/0misses, fullbody/requests EXACT before/current |
| Yalta→SPb |none/502|unknown|unknown|5869ms, retained actual old failure|unknown/null; exact per-provider historical cause/raw/current success BLOCKED_BY_DATA |

`control-summary.json` pins each source/SHA, scopes, errors and amounts. No neighbouring Domodedovo, reversed chain or invented coordinates substituted for Moscow. Yalta was not retried unchanged; prior Moscow native/proxy cause was not assigned retroactively. Four positive evidence sets are not four fresh deployments or a universal route/tariff certificate.

## One justified new live calculation

`node --use-env-proxy --import ./scripts/register-ts-paths.mjs experiments/routing-reliability/capture-krasnodar-moscow.mjs`:actual V3 POST handler invoked locally, real route and trace HTTP. Admitted Stage A GeoNames endpoints, fixed15.10.2026 09:00MSK, no fresh address lookup. Caller deadline35s/max20upstream not exceeded;14calls, no caller abort. Process import/cold start, browser/network and cloud deployment overhead are NOT included in8597.233ms. Raw capture282519bytes/SHA2568edfb11ae0da2f014d7b98989fc292114bb98b6ae77bd1fa3cb88d7a3491679a, all response bodies/statuses/hashes retained. Exactly one live calculation plus the earlier one standalone BRouter probe, not another route audit.

Actual source comparison, offline only: Valhalla1346445m/64394s and OSRM1348582m/65630s both pass existing geometry/endpoints/controls/admission; chosen Valhalla is the stable ETA minimum. BRouter400 body this time is **`target island detected for section 0`**, distinct from Moscow→SPb `no track found at pass=0`; do not classify all400 identically or silently shift the selected GeoNames point. The BRouter failure did not suppress the two valid providers. Provider driving profiles and routing/tariff rules unchanged.

New calculationTiming:handler8592.250ms; routing2317.528ms; trace4995.622ms; tollpricing638.260ms; responsepricing162.990ms. Trace is the largest network-inclusive span here; no CPU/network subtraction or sum of overlapping providers. Eleven trace HTTP responses200 were retained. One under10s result is not an SLA or measured before/after normal-request speedup.

Krasnodar→SPb current replay uses exact retained endpoint/control coordinates and source trace shapes, all I/O intercepted. Its provider result and19matchingrequests contain0missingstoredresponses. No new network; `replay-krasnodar-spb.mjs`/report preserve the actual public body. Dates/unknown/null/selected-geometry/dual-pricing invariants are covered by the unchanged existing gates and full Donetsk body parity, not by making new tariff assumptions.

## Final status / remaining work

B1 causes classified with specific bodies and historical gaps; B2 main V3 cancellation corrected/tested; B3 saved stages analyzed with unmeasured geometry/selection/serialization boundaries explicit; B4 stale provider starts3→1, not a normal-latency improvement; B5 four positive controls/one historical data blocker. Legacy V2 and deeper auxiliary pricing I/O/body-stream cancellation are not universally certified; actual Vercel delivery of caller-abort signal is not verified by controlled Node tests. No claim all functional blocks closed.

Ready technically for **separately authorized** publication of prepared A+main V3 cancellation to the working branch with mandatory existing CI, then exact new-source Preview. No additional source/road audit, live retry or Production release is implied. Preserve local recovery bundle/manifest, clean the stage-created dependency symlink only. New experimental runners receive syntax/data/hash/link checks, not another unchanged full build. Raw logs/captures remain immutable; final commit/LOCAL readback only.
