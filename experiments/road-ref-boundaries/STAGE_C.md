# Stage C — selected-road boundaries and directed tariff vectors

29.10.2026 MSK; source local4c5a94869a6be765be6994ef3d1cc8ee8cf16a34, publishedc2f52ee93cd98a81ecd05efa0358fb38c6704124; PR14Draft. Local-only scope authorized; no push/Preview/Production/CI/Android/backup change. A+B acceptance remains separate and is not rerun here.

## C1 — restored current implementation, not a new audit

| Mechanism | Existing implementation and acceptance | Remaining boundary |
|---|---|---|
| Selected trace / paid edges | lib/toll-validator.ts: validateTollEdges, private selected trace, complete/boothEventCoverage, exact geometry signature. | Incomplete/other-route evidence cannot authorize a full total. |
| Maneuver and graph boundaries | lib/toll-engine/road-boundaries.ts and road-trace-boundaries.ts; exact directed node+way transitions and unambiguous chunk overlap; scripts/road-trace-boundaries.test.ts. | Maneuver coordinate is not an operator endpoint. Reentry/discontinuity is rejected, not silently merged. |
| Selected M4 vector | m4-production.ts:resolveSelectedM4Endpoints → experiments/nationwide-tolls/engine/m4-route-adapter.mjs:matrixM4Component; active PVP register plus separate reviewed graph cells. | M4_GRAPH_ENDPOINT_REGISTER.json has pending graph pair, no active graph fare rows. Geometry can be resolved with unknown price. |
| Position / km | road-kilometrage.ts + optional-road-kilometrage.ts; exact transition/node before bounded calibrated projection; switch roadKilometrage. | OSM coordinates do not supply operator km/scope. No arbitrary nearest-booth or polyline-distance kilometre. |
| Other products | M11/M12/CKAD product-boundaries and road-specific adapters; ZSD cash/card/reentry product binding. | Assess only1–2retained cases/road in C4, not the historic whole-corpus totals. |
| Unknown/composition | route-toll-composition.ts and V3 route-leg-pricing.ts; partial/missing/duplicate/overlapping components fail closed, subtotal retained diagnostically. | New diagnostic distinctions need not change publicAPI/UI. |

Previously passed published-tree gates1031PASS/1SKIP,TS/build,18controlledUI and6cancellationtests are retained, not rerun for inventory. Existing selected M4 provider+13trace replay/two-date evidence: docs/checkpoints/2026-10-23-road-ref-exact-graph-DONE.md and checks/2026-10-23-graph/selected-vector.json. Six prior cases represent ONEphysicalpair, not six independent interchanges. B04 coordinates/topology were later independently obtained and must not be described as absent merely because older KILOMETRAGE/BLOCKERS prose predates intake.

Three conceptual outcomes remain separate: boundaries/vector unresolved; physical directed vector resolved but operator tariff crosswalk/price unavailable; reviewed operator vector with price. Existing public unknown/null contract stays intact. A resolved graph vector is not automatically a reviewed operator tariff pair.

## Authorized sequential work / recovery

1. C1 DONE: bounded implementation/evidence inventory; no app change or old audit repeated.
2. C2 STARTED next: one retained Granitnoe→Kazan graphpair4443232947→358467208, inspect savedprovider/13trace and later OSMintake only; produce exact node/way/continuity/coordinate/source evidence. No new capture/price assignment.
3. C3: after C2, characterize any demonstrated general boundary-matching gap with regression first; leave already-correct mechanism unchanged. Optional diagnostic additions must remain isolated and not change publicAPI/prices/route choice.
4. C4: one/two saved cases each M11→M12→CKAD(Golitsyno)→ZSD, exact unresolved facts and source requirements; no broad replay.
5. C5: selected retained combined geometries/components and duplicate/partial-sum guards; no inter-road mega-matrix.
6. C6: bounded regression set; full mandatory gate/build only if runtime changes require it; preserve dates,dual/corridor/fastest/evidence/unknown invariants. Save exact actual results and limits, not whole-stageDONE on synthetic tests.

Each completed part: checkpoint/WORK_STATE/localcommit; this task explicitly forbids push, overriding older remote-save cadence. Historical A+B commits and protected address logs remain untouched. On missing external source record BLOCKED_BY_DATA and continue independent allowed road; never guess km/scope/amount. Final report must distinguish completed review, actual fixes and real evidence gaps.
