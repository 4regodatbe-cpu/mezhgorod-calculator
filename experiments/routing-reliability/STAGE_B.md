# Stage B — routing reliability and full-calculation performance

29.10.2026; LOCAL ONLY, working-branch ancestry. Stage A preserved, no push/Preview/Production/CI changes. New street/house work is out of this stage; route choice remains fastest **admissible** geometry with required special corridor, not cheapest/shortest. Tariffs/matrix/unknown guards unchanged.

## B1 — concrete causes, no wide route audit

| Case | Proven classification / evidence | Action / limit |
|---|---|---|
| Current BRouter Moscow→SPb400 | One exact historic URL repeated only to obtain missing body. HTTP400, `no track found at pass=0`,25bytes,941ms. Raw `2026-10-29/brouter-current.body`, URL/status/SHA in review. HTTP response proves current transport reached a responder; message indicates the routing engine found no track for these inputs/profile. | Treat as unavailable candidate, not proof all roads absent or app request malformed. Do not guess a different driving profile or retry. Underlying provider coverage/profile reason still unproved. |
| Historic Moscow→SPb all-provider502 | Saved `../address-search/local-gazetteer-evidence-2026-10-29-route-transport/`: native Node ECONNREFUSED before HTTP; exact OSRM URL via sanctioned proxy200; supported `--use-env-proxy` full API200/3454ms. | Confirmed environment transport distinction, independent from GeoNames. No app network/security workaround or repeated check. |
| Earlier Yalta→SPb502 | GeoNames succeeded, all three routing stages failed; exact per-socket/HTTP cause not captured. See `../address-search/GEONAMES_V3_LOCAL_INTEGRATION.md` historical evidence. | Exact historic cause BLOCKED_BY_DATA, not retroactively assigned the Moscow socket cause. Preserve no-admissible-route failure; no invented geometry. |
| Differences across providers | Saved valid route distances/ETAs differ; `route-candidate.ts`, `route-leg.ts`, `special-options.ts` validate geometry/controls before fastest selector. | A disagreement alone is not a defect or a licence to change tariffs. Check deterministic fastest valid selection and exact selected geometry ownership in B2. |
| Mandatory special corridor absent | `special-options.ts` selects only eligible preferred-corridor candidates; PREFERRED_ROUTE_UNAVAILABLE remains safe502. | Required fail-closed behavior, not arbitrary alternative-corridor fallback. |
| Request cancellation | Route adapters use independent25s timeout signals; V3 API does not forward incoming request.signal to provider/trace calls. | Concrete unpropagated-cancellation boundary to characterize in B2; no claim already fixed. |

Only one new external request in B1. Existing BRouter400 body was missing; new body does not establish that every historical400 had the same cause. No Valhalla/OSRM network replay or corpus/tariff audit run.

## B2 — failover and bounded cancellation correction

31targetedPASS,1031offlinePASS/1SKIP/0FAIL, TypeScript/scoped lint/webpackPASS. Existing tests retain fastest admissible geometry, selected-route toll evidence, strict corridor behavior, unknown/null, finite totals and no forbidden reentry. Six new cancellation tests cover already-aborted requests, all pending route providers, selected trace, special corridors, geocoding and429backoff. Main V3 signal propagation is now LOCAL implemented; provider25s/trace18s deadlines unchanged.

Full retained Donetsk→Moscow before/current API replay:12storedresponses each,0misses/0network, fullbody/outboundrequests EXACT MATCH. This confirms noncancelled optional-signal compatibility, not all historical-source binary equivalence. A paired timing difference is not claimed as speedup. Evidence in2026-10-29/uncancelled-parity.json and cancellation JSON/logs. Main V3 cancellation fixed; legacyV2, auxiliary pricing evidence abort and body-stream cancellation remain unverified, not universally DONE.

## B3 — saved timing breakdown

`2026-10-29/timing-summary.json` pins3historical handler observations and3existing CPU profiles. Ordinary CI2225.425ms: routing1437.258/trace659.430/pricing48.794/response10.387. Special CI7318.419ms: routing1115.330/trace3267.508/pricing891.989/response590.168. Local Moscow→SPb4085.855ms: routing2064.693/trace1830.996/pricing119.838/response15.394. Routing/trace are network-inclusive; provider/parent stages overlap and cannot be added. Geometry admission/fastest selection/final JSON serialization remain unseparated. Prior decode6–9ms CPU fixture is not an exact network subtraction; no new profiling audit or normal-request speed claim.

## B4–B5

IN PROGRESS. Next measured cancelled-work reduction, then five bounded saved-control assessments. No10s/SLA claim.
