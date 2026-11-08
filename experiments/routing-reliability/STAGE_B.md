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

## B4 — measured obsolete-work reduction, not normal-request speedup

One optimization: caller cancellation stops obsolete main V3 work, implemented in B2. Matched diagnostic provider starts3→1, two subsequent starts prevented, first in-flight signal aborted. Six regressions cover active main phases. Full noncancelled saved API body/requests EXACT MATCH,12responses/run/0misses. `2026-10-29/cancelled-work-summary.json` pins source hashes. Normal-request latency gain remains null; warm paired timing is not a speedup benchmark and no10s SLA is claimed. Auxiliary/legacy cancellation remains limited as stated in B2. Ordinary repeated analysis is not counted fixed or reprofiled.

## B5

Five controls assessed, see `2026-10-29/control-summary.json`: retained Moscow→SPb200/711430m/24889s/4.229s; ONE new actual Krasnodar→Moscow200/Valhalla1346445m/64394s/8.597s,14upstream; exact current Krasnodar→SPb offline replay200/OSRM2061460m/94846s/19storedrequests/0misses; current Donetsk→Moscow offline parity200/OSRM1122972m/58268s/12responses/0misses. Offline times are not network/user latency. Historical Yalta→SPb502/5.869s remains BLOCKED_BY_DATA, no invented distance/time or route/provider cause. No Domodedovo substitution, wide audit, deployment or tariff recertification.

The one live gap capture is explicitly authorized by the Stage B pinpoint-source clause and separately checkpointed before execution. Raw source/HTTP/SHA and matched-source fastest admission check retained. Valhalla64394s beats admissible OSRM65630s; BRouter400 `target island detected for section 0`, a different body from earlier no-track. Do not guess physical island/road/access cause or move endpoints. It does not suppress valid candidates.

New actual timing:handler8592.250/routing2317.528/trace4995.622/tollpricing638.260/response162.990ms. Main trace is network-inclusive and the largest span; no bypass/10s SLA/normal-speedup claim. Published source remains old; A+new cancellation ready only for a separately authorized working-branch/CI/Preview check.

## Final B1–B5 boundaries

| Block | Result | Remaining limitation |
|---|---|---|
| B1 | Specific current BRouter error bodies and saved native/proxy difference classified. | Exact historic Yalta cause and deeper BRouter graph reason unknown. |
| B2 | Main V3 geocode/routing/special/trace/backoff cancellation fixed; failover/geometry/unknown tests PASS. | Legacy V2, deeper auxiliary pricing I/O, body-stream abort and hosted caller-signal delivery not fully verified. |
| B3 | Saved/network-inclusive stages and existing CPU profiles separated; new single real8.6s sample retained. | Geometry/fastest/serialization not separately instrumented; no10s guarantee. |
| B4 | Matched obsolete-work reduction3→1provider starts, normal body/requests exact parity. | No demonstrated normal-request latency improvement. |
| B5 | Four positive retained/current control evidence sets, scopes explicit. | Yalta current valid-route outcome BLOCKED_BY_DATA; new-source Preview pending. |

Exact preserved evidence/source SHA: [manifest](2026-10-29/manifest.json). New runtime source is180e7caa; later commits only record results. Source/data checks confirm unchanged tariffs, road matrix, fastest policy, geography/control rules, V2 and Stage A source. Temporary dependency link removed; original worktrees retained. A verified incremental recovery bundle is kept outside the repository. No new-source GitHub Actions or Preview result is implied by local gates.
