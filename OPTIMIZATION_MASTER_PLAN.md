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
6. never treat `unknown`/timeout/incomplete evidence as `0 ₽` or as proof of a free route.

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
Status: FINAL REGRESSION IN PROGRESS
Goal: user `/api/v2/calculate` uses proven local M-4 PVP validation/pricing while preserving safe fallbacks and mixed-road totals.

Implemented so far:
- production-safe M-4 adapter added and wired into `/api/v2/calculate` before legacy recovery;
- exact amount accepted only for complete M-4 validation, `status=priced`, no unresolved context and confidence >= medium;
- generic/legacy fallbacks remain when exact result is unavailable;
- CI builds the branch locally and POSTs to the real user endpoint, avoiding Vercel preview authentication;
- superseded branch regressions are automatically cancelled with workflow `concurrency`;
- differential regression compares protected routes against current production.

Exact M-4 control targets already observed through the user endpoint:
- Ейск ↔ Москва: 5240 / 7240 ₽;
- Майкоп ↔ Москва: 6090 / 8400 ₽;
- Краснодар ↔ Москва: 6090 / 8400 ₽;
- Сочи ↔ Москва: 6090 / 8400 ₽.

#### A-289 finding pulled forward into Segment 1
Yalta↔Moscow exposed a mixed-road issue. Old production returned `5840 ₽` from the verified-route database (`Яндекс Карты — через Краснодар`) rather than fresh road-event evidence.

OSM inventory and route audit established A-289 free-flow gantries:
- RVP 23: route Yalta↔Moscow does NOT cross it (about 13.5 km away);
- RVP 82: route crosses it within roughly 0–12 m;
- RVP 103: route crosses it within roughly 0–12 m.

Official current category-I tariff matrix gives:
- Славянск-на-Кубани → Варениковская: 205 ₽;
- Варениковская → Темрюк: 180 ₽;
- therefore actual A-289 component on this route = 385 ₽.

Added `lib/toll-engine/a289-engine.ts` using exact OSM free-flow gantry anchors. For M-4+A-289 composition the evidence-based targets are now:
- Ялта ↔ Москва weekday: 5240 + 385 = 5625 ₽;
- Ялта ↔ Москва weekend M-4 period: 7240 + 385 = 7625 ₽.

This does NOT yet promote A-289 as a standalone universal production engine; in Segment 1 it is composed only when M-4 itself is exact.

#### Mixed M-4 + M-11 protection
Found that legacy complete-route label `М-4 + М-11: ...` could be mistaken for pure M-4 by a prefix check. Fixed the classifier: only labels beginning exactly `М-4:` or `А-289:` are considered covered components. Composite M-4+M-11 routes remain on the legacy combined fallback until an exact M-11 engine exists. Differential guards now include Sochi↔Saint-Petersburg.

#### Remaining known defects not hidden by Segment 1
- Moscow→Kazan currently produces about 1238 ₽ because the legacy M-12 recognizer sees only several sections; official 2026 category-I Moscow→Kazan target is 5847 ₽.
- verified-route toll values can be stale/manual and currently have a minimum tolerance wide enough to override live geometry; they need demotion from pricing truth to QA/fallback evidence.
- free-route truth model can still expose `unknown` candidates too optimistically; fixed later in Segment 3.

Segment 1 regression gate before DONE:
- branch build green;
- 8 pure M-4 user-API exact directions green;
- 2 Yalta↔Moscow M-4+A-289 exact directions green at 5625/7625;
- M-4+M-11 mixed routes are not reduced to M-4-only totals;
- non-M-4 distance controls do not regress.

### Segment 2 — unify diagnostic and production M-4 calculation core
Status: NOT STARTED
Goal: remove duplicate M-4 validation/pricing orchestration so debug endpoint and user endpoint exercise the same reusable core.
Regression gate: same M-4 evidence/pricing outputs for known controls; Segment 1 user regression remains green.

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
Status: RESEARCH STARTED, IMPLEMENTATION NOT STARTED
Goal: replace current geometry corridor heuristic with a free-flow entry/exit model using official tariffs.
Confirmed official 2026 control: Moscow→Kazan (P239), category I = `5847 ₽`.
Confirmed system model: M-12 is barrier-free “Свободный поток”; official tariff is an entry/exit matrix, so the engine should identify ordered entry/exit context rather than merely sum approximate road pieces.
Rules:
- model free-flow gantries/entry-exit context separately from M-4 toll booths;
- infer traversal from ordered route evidence;
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

Finish Segment 1 regression on the latest branch SHA. If green, create a dedicated Segment 1 checkpoint and begin Segment 2 shared-core refactor. If red, fix only the failing invariant and rerun before moving on.