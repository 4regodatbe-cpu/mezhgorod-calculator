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

Do not modify production `main` until the working branch passes the required regression gates.

## Global invariants

1. `0 ₽` means only one of:
   - route is independently proven toll-free; or
   - route-specific toll engine is complete and finds no charged event.
2. `unknown`, provider error, timeout, rate limit, missing geometry, incomplete matching, unresolved mixed-zone context => exact toll amount must be unavailable, not zero.
3. A route candidate marked `Без платных дорог` must be independently validated before it is presented as confirmed free.
4. Route geometry evidence and tariff data are separate domains:
   - routing/OSM/Valhalla answer where the vehicle travels;
   - official operator data answer what that traversal costs.
5. Toll logic is road-system-specific. Do not force M-4 open/mixed logic onto M-12/ЦКАД/A-289 free-flow systems.
6. Existing working fallback mechanisms remain available until a replacement has passed regression.
7. Every exact tariff snapshot carries an effective date/source and can be versioned.
8. Do not use one long `trace_attributes` call as the primary detector for long-haul M-4 routes.
9. User API and diagnostic API must share the same road-specific calculation core where applicable.
10. A new exact engine for one road must never silently erase tolls from another road on a mixed route.
11. Avoid-toll routing preferences are candidate generators, not proof of toll-free travel.

## Segments

### Segment 0 — recovery and safety checkpoint
Status: DONE
Result:
- branch `optimize-calculator-2` created from `d9caf0e`;
- master plan persisted;
- production behavior unchanged.

### Segment 1 — integrate proven M-4 engine into user calculation core
Status: DONE
Checkpoint: `checkpoints/SEGMENT_1_COMPLETE.md`
Validated head: `5bafe9dd34ef441f6e05e0e0c74b77ad163fccc0`
Workflow run `36677462903`: SUCCESS.

Completed:
- production-safe M-4 adapter wired into `/api/v2/calculate` before legacy recovery;
- exact result requires complete validation, priced status, no unresolved context and confidence >= medium;
- fallback remains available when exact result is unavailable;
- regression runs the real local production build and user endpoint;
- whole regression attempt is capped at 20 minutes;
- production-baseline outages are diagnostic only and no longer masquerade as candidate failures;
- mixed M-4+M-11 routes are protected from M-4-only replacement;
- A-289 RVP 82/103 evidence is composed with exact M-4 for Yalta↔Moscow.

Exact controls:
- Ейск ↔ Москва: 5240 / 7240 ₽;
- Майкоп ↔ Москва: 6090 / 8400 ₽;
- Краснодар ↔ Москва: 6090 / 8400 ₽;
- Сочи ↔ Москва: 6090 / 8400 ₽;
- Ялта ↔ Москва: 5625 / 7625 ₽, with RVP 82 + RVP 103 and without RVP 23.

Protected controls:
- Москва → Санкт-Петербург: 710.3 km, 4580 ₽ retained;
- Сочи ↔ Санкт-Петербург: about 2338–2339 km, 9620 ₽ retained, M-4+M-11 composite not replaced;
- Москва → Казань: about 820.2 km distance retained; M-12 toll underpricing remains a later-segment defect.

### Segment 2 — unify diagnostic and production M-4 calculation core
Status: DONE
Checkpoint: `checkpoints/SEGMENT_2_COMPLETE.md`
Workflow run `36678855536`: SUCCESS.

Completed:
- shared M-4 core owns local PVP validation, route-context pricing, normalized validation response and exactness decision;
- `/api/v2/debug-m4` and production M-4 adapter use that same core;
- A-289 composition, mixed-road protection and fallbacks remain production-wrapper concerns;
- regression trigger includes the diagnostic endpoint so debug-only refactors cannot bypass build validation.

### Segment 3 — make free-route truth model strict
Status: DONE
Checkpoint: `checkpoints/SEGMENT_3_COMPLETE.md`
Final UI/truth workflow run `36699567088`: SUCCESS.

Completed:
- public Valhalla hard-exclusion capability was probed before implementation;
- server returned warning `208 — Hard exclusions are not allowed on this server, ignoring hard excludes`;
- therefore `exclude_tolls:true` is not used as proof of toll-free routing;
- `use_tolls:0` and BRouter avoid-toll results are only candidate generators;
- API returns confirmed alternatives in `free` only when independent validation status is `free`;
- unresolved alternatives are returned separately as `freeCandidate`;
- `freeCandidate` is excluded from toll-difference evidence, optimal-route selection, dual-tariff calculation and `Бесплатный` analytics;
- UI renders unverified alternatives in an amber warning card, never as green `Без платных дорог`.

Dedicated API controls:
- Москва → Краснодар: `free=null`, `freeCandidate=1450.0 km`, validation `unknown`;
- Москва → Сочи: `free=null`, `freeCandidate=1740.0 km`, validation `unknown`.

### Segment 4 — reduce dependence on public Valhalla / M-4 latency
Status: IN PROGRESS — 4A DONE, 4B REJECTED+ROLLED BACK, 4C RUNNING.

Current safe M-4 validator:
- `shape_match=walk_or_snap`;
- PVP candidate radius 1.5 km;
- local window ±4 km, sampled to at most 120 points;
- exact proof requires the expected concrete OSM `toll_booth` node;
- request timeout 4.5 s with one retry;
- global validation budget 24 s;
- safe concurrency baseline = 3.

#### Segment 4A — geometry/evidence benchmark
Status: DONE
Checkpoint: `checkpoints/SEGMENT_4A_GEOMETRY_PROBE.md`
Baseline workflow run: `36700119800`.
Rollback confirmation run after 4B: `36717998885`.

Corpus result:
- 10/10 M-4 control directions complete;
- 192 labelled candidate checks;
- 162 confirmed / 30 rejected / 0 unknown.

Observed latency:
- first recorded baseline average validator time: 18,371 ms, max 19,741 ms;
- rollback confirmation average: 16,363 ms, max 17,852 ms;
- therefore public-service latency varies, but the second remote local-matching layer is materially expensive.

Geometry-only decision:
- confirmed PVP anchors were 4–53 m from the route shape;
- rejected candidates were 3–345 m from the route shape;
- no useful geometric distance threshold achieved zero false positives;
- examples: PVP 62 can be rejected at 3 m, PVP 355 rejected at 13 m, while valid PVP 545 can be 47–53 m away.

Decision: geometry proximity remains candidate evidence only and must not prove a toll crossing.

#### Segment 4B — `edge_walk` on sampled local windows
Status: REJECTED AND ROLLED BACK
Checkpoint: `checkpoints/SEGMENT_4B_EDGE_WALK_RESULT.md`
Experimental commit: `51e4050b62d7cfb5599b55269cc2997e87a95276`
Experiment workflow run: `36701053276`.
Rollback commit: `b876322bf54465ac4f6f874ce55a08f0347aab04`.

Result:
- all 10 routes became incomplete;
- PVP 515 and, in several directions, PVP 545 became `unknown`;
- no safe material latency gain was demonstrated;
- the one-line experiment was immediately reverted;
- rollback probe restored 10/10 complete and 0 unknown.

Interpretation:
- Valhalla documents `edge_walk` for exact shapes originating from a prior Valhalla route;
- current local windows are sampled, so this test does not justify using `edge_walk` on the current representation;
- a future exact-unsampled-shape experiment may be tested separately, with provenance-aware fallback to `walk_or_snap`.

#### Segment 4C — concurrency tuning with unchanged evidence semantics
Status: RUNNING
Plan: `checkpoints/SEGMENT_4C_CONCURRENCY_PLAN.md`
Probe workflow: `.github/workflows/segment4c-concurrency-probe.yml`
Probe commit: `0bd1175ab0d8c778034e772e8af216403ac55d42`.

Method:
- branch source remains at safe `CONCURRENCY=3`;
- workflow changes only its ephemeral runner copy to `CONCURRENCY=4`;
- same 10-direction M-4 corpus is run;
- acceptance requires 10 complete routes, exactly 192 labelled checks, 162 confirmed, 30 rejected, 0 unknown, and average validator time <=15,000 ms;
- if accepted, source change will still require a full Segment 1 user API regression before being checkpointed;
- if rejected, branch source remains unchanged and the next experiment is exact-unsampled Valhalla shape or another request-reduction strategy.

### Segment 5 — M-12 / free-flow toll engine
Status: RESEARCH STARTED, IMPLEMENTATION NOT STARTED
Goal: replace current geometry corridor heuristic with a free-flow ordered-traversal model using official tariffs.

Confirmed control:
- Москва → Казань, category I, 2026: `5847 ₽`.

Confirmed model:
- M-12 is barrier-free `Свободный поток`;
- exact calculation must use ordered gantry/entry-exit context, not approximate nearby sections;
- broad OSM inventory found 138 toll-related objects and is intentionally noisy;
- route traversal must filter unrelated booths/gantries and guard exit/re-entry cases.

### Segment 6 — other paid road families
Status: NOT STARTED
Order after M-4 and M-12 stabilization:
1. M-11;
2. ЦКАД;
3. finish standalone/general A-289 integration;
4. M-3 / M-1 and other common operator systems.

Each system gets an explicit tariff model, evidence model and regression corpus.

### Segment 7 — tariff data versioning and updater checks
Status: NOT STARTED
Goal: prevent silently stale toll amounts.
- effective date/source metadata;
- automated stale-data warning;
- deterministic historical/current tariff selection where official data permit it.

### Segment 8 — route-distance quality
Status: NOT STARTED
Goal: improve distance/time reliability independently of toll pricing.
- compare multiple route providers;
- use known-route controls as QA/reference, not hidden replacement for live routing;
- classify source disagreement;
- grow a golden-route dataset with expected corridor and acceptable distance bands.

### Segment 9 — external toll-provider benchmark
Status: NOT STARTED
Goal: test, not trust, HERE/TollGuru or another provider against official Russian controls.
- at least 20–30 routes across M-4/M-12/M-11/ЦКАД;
- compare route geometry compatibility, toll coverage, amount and failure modes;
- an external provider may be an independent validator/fallback, not the sole source of truth unless evidence proves otherwise.

### Segment 10 — UX truthfulness and final regression / production readiness
Status: NOT STARTED
Required before claiming optimization complete:
- replace obsolete Yandex-API copy that implies Yandex itself supplies exact monetary toll pricing;
- UI distinguishes confirmed free, unverified alternative, toll detected but unpriced, and priced toll;
- build/lint clean;
- user `/api/v2/calculate` regression suite green;
- targeted road-engine suites green;
- no known provider failure becomes `0 ₽`;
- no unverified avoid-toll candidate is labelled confirmed free;
- remaining limitations are documented and caused by unavailable source data rather than a known better algorithmic option.

## Current next action

Finish Segment 4C concurrency=4 probe. If and only if it preserves the exact 192-candidate classification with 0 unknown and improves average validation to <=15 s, promote concurrency=4 on the working branch and rerun full user regression. Otherwise document rejection and move to an isolated exact-unsampled-shape experiment while retaining safe `walk_or_snap` + concurrency=3 in branch code.