# Calculator 2.0 — master optimization plan

Updated: 2026-09-30
Working branch: `optimize-calculator-2`
Base checkpoint: `d9caf0edb50590c246745e6c50c801907a866c04`

## Working rule

Work only in small segments. Every segment must:
1. state exact goal and invariants before code changes;
2. change the minimum possible surface;
3. run targeted validation and, where applicable, build/lint/regression;
4. save the observed result in a dedicated checkpoint file;
5. update this file with current state and next segment;
6. never treat `unknown`/timeout/incomplete evidence as `0 ₽` or as proof of a free route.

Do not modify production `main` until the working branch passes the required regression gates. The branch may be merged only after user-facing `/api/v2/calculate` passes the same invariants currently proven in the diagnostic contour.

## Current architecture recovered from repository

### Existing user path
- `/api/v2/calculate` builds fast and free variants from multiple routing providers.
- Fast-route toll pricing still uses legacy layers: verified route data, corridor recovery, generic full-route Valhalla `trace_attributes`, and heuristics.
- Free-route verification uses generic full-route Valhalla map matching and may return `unknown` under rate limits/timeouts.

### New M-4 diagnostic path already built
- `/api/v2/debug-m4` uses `validateKnownM4Plazas()` and `priceM4RoutePlazaValidation()`.
- Candidate PVP detection uses geometry only to find a small local candidate zone.
- Actual crossing requires local map matching to a known OSM `toll_booth` node.
- Mixed/open toll systems are priced by route context and official tariff snapshot.
- Incomplete validation blocks the exact amount.
- Ten south↔Moscow regression directions have hard assertions.

## Global invariants

1. `0 ₽` means only one of:
   - route is independently proven toll-free; or
   - route-specific toll engine is complete and finds no charged event.
2. `unknown`, provider error, timeout, rate limit, missing geometry, incomplete matching, unresolved mixed-zone context => exact toll amount must be unavailable, not zero.
3. A route candidate marked “без платных” must be independently validated before it is presented as confirmed free.
4. Route geometry evidence and tariff data are separate domains:
   - routing/OSM/Valhalla answer *where the vehicle travels*;
   - official operator data answer *what that traversal costs*.
5. Toll logic is road-system-specific. Do not force M-4 open/mixed logic onto M-12/ЦКАД/A-289 free-flow systems.
6. Existing working fallback mechanisms remain available until a replacement has passed regression.
7. Every exact tariff snapshot carries an effective date/source and can be versioned.
8. Do not use one long `trace_attributes` call as the primary detector for long-haul M-4 routes.
9. User API and diagnostic API must eventually share one calculation core so tests cannot validate a different algorithm from production.

## Segments

### Segment 0 — recovery and safety checkpoint
Status: IN PROGRESS
Goal: persist this plan, isolate work on a branch, identify exact integration boundary and regression gates.
Success criteria:
- branch created from `d9caf0e`;
- master plan committed;
- no production behavior changed.
Next: Segment 1.

### Segment 1 — integrate proven M-4 engine into calculation core behind narrow selection logic
Status: NOT STARTED
Goal: user `/api/v2/calculate` should use the proven M-4 local validator/pricer when the fast route actually intersects the M-4 PVP candidate system.
Rules:
- use already built route geometry;
- call new M-4 validator/pricer before legacy M-4 recovery only when M-4 is a credible candidate;
- accept exact M-4 amount only when validation is complete, pricing status=`priced`, unresolved is empty and confidence >= medium;
- if new engine is incomplete/unresolved, preserve legacy fallback but never convert lack of evidence to zero;
- do not modify free-route generation in this segment.
Regression gate:
- ten existing M-4 diagnostic assertions still pass;
- equivalent user `/api/v2/calculate` assertions for the same ten routes pass toll amounts;
- non-M-4 controls do not regress.

### Segment 2 — unify diagnostic and production M-4 calculation core
Status: NOT STARTED
Goal: remove duplicate route/pricing orchestration so debug endpoint and user endpoint exercise the same reusable core.
Regression gate: same exact outputs for known M-4 controls.

### Segment 3 — make free-route truth model strict
Status: NOT STARTED
Goal: distinguish `confirmed_free`, `candidate_unverified`, `toll_detected`, `unavailable`.
Rules:
- route-provider “avoid tolls” preference is not proof of free route;
- `unknown` cannot be displayed as confirmed free;
- iterate over independent candidates; reject a candidate if toll is confirmed;
- if all candidates are unknown, expose an explicitly unverified alternative rather than a false guarantee.
Regression gate: known M-4/M-11/M-12 cases plus deliberately ambiguous/provider-failure cases.

### Segment 4 — reduce dependence on public Valhalla availability
Status: NOT STARTED
Goal: avoid expensive full-route map matching in normal long-haul requests.
Approach:
- road-specific targeted validators for known paid systems;
- cache deterministic local evidence where safe;
- generic full-route validation retained as fallback/QA, not universal hot-path dependency.

### Segment 5 — M-12 / free-flow toll engine
Status: NOT STARTED
Goal: replace current geometry corridor heuristic with a free-flow section/entry-exit model using official tariffs.
Known control: current official 2026 snapshot has Moscow→Kazan total `5847 ₽` for category I; this is a validation target, not a hard-coded route answer.
Rules:
- model free-flow gantries/sections separately from M-4 toll booths;
- infer traversal from ordered route intersections with section boundaries/gantries;
- exact amount requires complete entry/exit/section context.

### Segment 6 — other paid road families
Status: NOT STARTED
Order after M-4 and M-12 stabilization:
1. M-11;
2. ЦКАД;
3. A-289;
4. M-3 / M-1 and other operator systems used by common intercity routes.
Each system gets an explicit tariff model, evidence model and regression corpus.

### Segment 7 — tariff data versioning and updater checks
Status: NOT STARTED
Goal: prevent silently stale toll amounts.
- effective date/source metadata;
- automated stale-data warning;
- deterministic historical/current tariff selection by departure date where official data permit it.

### Segment 8 — route-distance quality
Status: NOT STARTED
Goal: improve distance/time reliability independently of toll pricing.
- compare multiple route providers;
- use known-route controls only as QA/reference, not as hidden replacement for live routing;
- classify source disagreement;
- add a growing golden-route dataset with expected corridor and acceptable distance bands.

### Segment 9 — external toll-provider benchmark
Status: NOT STARTED
Goal: test, not trust, HERE/TollGuru or another provider against official Russian controls.
- at least 20–30 routes across M-4/M-12/M-11/ЦКАД;
- compare route geometry compatibility, toll coverage, amount and failure modes;
- external provider may become an independent validator/fallback, not the sole source of truth, unless evidence proves otherwise.

### Segment 10 — final regression and production readiness
Status: NOT STARTED
Required before claiming optimization complete:
- build/lint clean;
- user `/api/v2/calculate` regression suite green;
- targeted road-engine suites green;
- no known test where provider failure becomes `0 ₽`;
- no known test where an unverified avoid-toll candidate is labelled confirmed free;
- documented remaining limitations are caused by unavailable source data rather than a known better algorithmic option.

## Current next action

Start Segment 1. First inspect `/api/v2/calculate` in full and isolate the toll-pricing block. Add the narrow M-4 engine integration without changing the route builder or free-route selection.