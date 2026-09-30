# Calculator 2.0 — master optimization plan

Updated: 2026-09-30
Working branch: `optimize-calculator-2`
Base checkpoint: `d9caf0edb50590c246745e6c50c801907a866c04`
Production `main`: intentionally unchanged until branch regression gates pass.

## Working rule

Work only in small segments. Every segment must:
1. state exact goal and invariants before code changes;
2. change the minimum possible surface;
3. run targeted validation and, where applicable, build/regression;
4. save the observed result in a dedicated checkpoint file;
5. update this file with current state and next segment;
6. never treat `unknown`/timeout/incomplete evidence as `0 ₽` or as proof of a free route;
7. hard-bound each execution attempt to no more than 20 minutes; after a timeout inspect evidence, split/revise the approach, then retry rather than repeating the same attempt.

Do not modify production `main` until the working branch passes the required regression gates. The branch may be merged only after user-facing `/api/v2/calculate` passes the same invariants currently proven in the diagnostic contour.

## Current architecture recovered from repository

### Existing user path
- `/api/v2/calculate` builds fast and free variants from multiple routing providers.
- Before this optimization, fast-route toll pricing used legacy layers: verified route data, corridor recovery, generic full-route Valhalla `trace_attributes`, and geometry heuristics.
- Free-route verification uses generic full-route Valhalla map matching and may return `unknown` under rate limits/timeouts.

### New M-4 diagnostic path already built before this optimization branch
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
10. A new exact engine for one road must never silently erase tolls from another road on a mixed route.

## Segments

### Segment 0 — recovery and safety checkpoint
Status: DONE
Result:
- branch `optimize-calculator-2` created from `d9caf0e`;
- this master plan persisted;
- production behavior unchanged.

### Segment 1 — integrate proven M-4 engine into user calculation core
Status: DONE
Checkpoint: `checkpoints/SEGMENT_1_COMPLETE.md`
Validated branch head: `5bafe9dd34ef441f6e05e0e0c74b77ad163fccc0`
Workflow run: `36677462903` — SUCCESS.

Completed:
- production-safe M-4 adapter wired into `/api/v2/calculate` before legacy recovery;
- exact amount accepted only for complete M-4 validation, `status=priced`, no unresolved context and confidence >= medium;
- generic/legacy fallbacks remain when exact result is unavailable;
- CI builds the branch locally and POSTs to the real user endpoint;
- workflow `concurrency` cancels superseded regressions;
- whole regression attempt is capped at 20 minutes;
- production baseline outages are recorded separately and no longer masquerade as candidate failures;
- mixed M-4+M-11 routes are protected from M-4-only replacement;
- A-289 RVP 82/103 evidence is composed with exact M-4 for Yalta↔Moscow.

Final exact controls:
- Ейск ↔ Москва: 5240 / 7240 ₽;
- Майкоп ↔ Москва: 6090 / 8400 ₽;
- Краснодар ↔ Москва: 6090 / 8400 ₽;
- Сочи ↔ Москва: 6090 / 8400 ₽;
- Ялта ↔ Москва: 5625 / 7625 ₽, with RVP 82 + RVP 103 and without RVP 23.

Protected controls:
- Москва → Санкт-Петербург: 710.3 km, 4580 ₽ retained;
- Сочи ↔ Санкт-Петербург: about 2338–2339 km, 9620 ₽ retained, M-4+M-11 composite not replaced;
- Москва → Казань: 820.2 km distance retained; toll underpricing remains a later-segment defect.

### Segment 2 — unify diagnostic and production M-4 calculation core
Status: STARTING
Goal: remove duplicate M-4 validation/pricing orchestration so debug endpoint and user endpoint exercise the same reusable core.
Scope: pure refactor only; no tariff mathematics, route selection, M-4 evidence thresholds, A-289 composition or fallback behavior may change.
Regression gate: build green; diagnostic outputs unchanged for known controls; Segment 1 user regression remains green within the 20-minute cap.

### Segment 3 — make free-route truth model strict
Status: NOT STARTED
Goal: distinguish `confirmed_free`, `candidate_unverified`, `toll_detected`, `unavailable`.
Research finding to test first: Valhalla supports hard `exclude_tolls`, but the concrete public instance must be probed because hard exclusions can be disabled server-side.
Rules:
- route-provider “avoid tolls” preference is not proof of free route;
- `unknown` cannot be displayed as confirmed free;
- iterate over independent candidates; reject a candidate if toll is confirmed;
- if all candidates are unknown, expose an explicitly unverified alternative rather than a false guarantee.
Regression gate: known M-4/M-11/M-12 cases plus deliberately ambiguous/provider-failure cases.

### Segment 4 — reduce dependence on public Valhalla availability
Status: NOT STARTED
Goal: avoid expensive full-route or unnecessary repeated map matching in normal long-haul requests.
Research candidates:
- because the route geometry itself comes from Valhalla, test `edge_walk`/equivalent exact-walk matching instead of `walk_or_snap` where valid;
- test a very tight route-shape crossing against known PVP nodes as a first-level deterministic check;
- remote map matching only for ambiguous cases;
- cache deterministic local evidence where safe;
- generic full-route validation retained as fallback/QA, not universal hot-path dependency.
Current M-4 validator has a 24-second global external-validation budget, so latency improvement is material.

### Segment 5 — M-12 / free-flow toll engine
Status: RESEARCH STARTED, IMPLEMENTATION NOT STARTED
Goal: replace current geometry corridor heuristic with a free-flow ordered-traversal model using official tariffs.
Confirmed official 2026 control: Moscow→Kazan, category I = `5847 ₽`.
Confirmed system model: M-12 is barrier-free “Свободный поток”; exact calculation must use ordered gantry/entry-exit context, not approximate nearby sections.
Existing inventory workflow found 138 broad-corridor toll objects; this dataset is intentionally noisy and must be filtered by actual route traversal before use.
Rules:
- model free-flow gantries/entry-exit context separately from M-4 toll booths;
- infer traversal from ordered route evidence and guard re-entry/exit cases;
- exact amount requires complete entry/exit context;
- never hard-code one OD pair as the calculation algorithm.

### Segment 6 — other paid road families
Status: NOT STARTED
Order after M-4 and M-12 stabilization:
1. M-11;
2. ЦКАД;
3. finish standalone/general A-289 integration (core already partially implemented in Segment 1);
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

### Segment 10 — UX truthfulness and final regression / production readiness
Status: NOT STARTED
Required before claiming optimization complete:
- remove/update obsolete Yandex-API copy that claims monetary toll calculation would become maximally accurate;
- UI must distinguish confirmed free, unverified avoid-toll candidate, toll detected but unpriced, and priced toll;
- build/lint clean;
- user `/api/v2/calculate` regression suite green;
- targeted road-engine suites green;
- no known test where provider failure becomes `0 ₽`;
- no known test where an unverified avoid-toll candidate is labelled confirmed free;
- documented remaining limitations are caused by unavailable source data rather than a known better algorithmic option.

## Current next action

Execute Segment 2 as a small pure-refactor segment: persist its plan, create one shared M-4 calculation core used by diagnostic and production wrappers, then rerun targeted build/regression. If the run cannot finish within 20 minutes, split diagnostic and user regression gates before retrying.
