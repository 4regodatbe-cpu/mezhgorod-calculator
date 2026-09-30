# Calculator 2.0 — master optimization plan

Updated: 2026-10-01
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
- Москва → Казань: about 820.2 km distance retained; M-12 toll underpricing was addressed in Segment 5.

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
Status: DONE — safe public-server optimum established for current evidence model.

Current safe M-4 validator:
- `shape_match=walk_or_snap`;
- PVP candidate radius 1.5 km;
- local window ±4 km, sampled to at most 120 points;
- exact proof requires the expected concrete OSM `toll_booth` node;
- request timeout 4.5 s with one retry;
- global validation budget 24 s;
- promoted concurrency = 4.

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
- rollback confirmation average: 16,363 ms, max 17,852 ms.

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

#### Segment 4C — concurrency tuning with unchanged evidence semantics
Status: DONE
Plan: `checkpoints/SEGMENT_4C_CONCURRENCY_PLAN.md`
Checkpoint: `checkpoints/SEGMENT_4C_COMPLETE.md`
Probe run: `36718699421` — SUCCESS.
Promoted source commit: `ffbab1338af6d8762a03a28beba546b1f3e1ab23`.
Final normal branch regression: `36720431413` — SUCCESS.

Result:
- concurrency increased from 3 to 4 with `walk_or_snap` and all evidence rules unchanged;
- probe preserved 10/10 complete routes, 192 candidates, 162 confirmed, 30 rejected, 0 unknown;
- average validator time: 14,916 ms; max: 16,913 ms;
- roughly 9% faster than the latest 16,363 ms baseline and roughly 19% faster than the first 18,371 ms baseline;
- actual committed source change passed the normal branch regression successfully.

#### Segment 4D — one-call `/route` PBF evidence probe
Status: REJECTED FOR CURRENT PUBLIC SERVER
Plan: `checkpoints/SEGMENT_4D_ROUTE_PBF_PLAN.md`
Result: `checkpoints/SEGMENT_4D_ROUTE_PBF_RESULT.md`
Workflow run: `36722406803`.
Artifact: `11102570130`.

Observed public-server result for Moscow→Voronezh:
- valid PBF response decoded successfully;
- `directions` present;
- `trip` absent despite `trip=true` field selector;
- zero Trip nodes and zero useful toll-booth/toll-gantry OSM node evidence.

Decision:
- current public HTTP `/route` cannot replace the second exact-evidence layer;
- retain local `trace_attributes` + exact expected-node proof + concurrency 4;
- further substantial M-4 latency reduction requires a different/self-hosted Valhalla configuration/runtime or another exact edge-evidence provider.

### Segment 5 — M-12 / free-flow toll engine
Status: DONE — current M-12 stabilization checkpoint complete.
Final checkpoint: `checkpoints/M12_SEGMENT_5B2D_4D2_RESULT.md`
Validated branch head after gated UI/analytics promotion: `ed7bf089cb62f258b542afa413dbfb6f37909f1b`.
Final promotion workflow run `36783522336`: SUCCESS.

Completed:
- reproduced the legacy M-12 failure against current route geometry instead of assuming the official full-route tariff always applies;
- built a versioned official M-12 tariff-point/matrix model;
- established strict route-relative M-12 span/RVP evidence and a deterministic pure route core;
- persisted a deterministic 10-route projection fixture for core regression without network requests;
- exact route-core pricing requires sufficient direct calibrated evidence, continuous official RVP reconstruction, proven entry/exit bounds, and complete tariff coverage;
- incomplete evidence returns `status=unknown`, `amountRub=null`;
- integrated the core into `/api/v2/calculate` using the existing fast Valhalla route response; no second full-route request was introduced;
- preserved M-4/A-289/mixed-road composition protections;
- fixed the generic API boundary so unresolved toll pricing is serialized as `pricingStatus=unknown` with nullable money rather than false numeric zero;
- propagated `priced | free | unknown` semantics through the V2 UI, clipboard, dual-route presentation and route analytics;
- `freeCandidate` remains separate from independently proven `free`.

Key checkpoints:
- `checkpoints/M12_SEGMENT_5B2C_RESULT.md` — deterministic reusable core;
- `checkpoints/M12_SEGMENT_5B2D_4D1_RESULT.md` — API pricing truth;
- `checkpoints/M12_SEGMENT_5B2D_4D2_RESULT.md` — UI/analytics pricing truth and final promotion gate.

Current observed control behavior:
- the pure core's current Moscow↔Kazan same-corridor route geometry prices the actually traversed M-12 RVP chain, rather than blindly substituting the full official Moscow→Kazan tariff;
- a control routed by Valhalla through M-7/E22 remains outside M-12 ownership and therefore cannot be forced into an M-12 price;
- unknown/incomplete pricing cannot be represented as exact `0 ₽` at the covered API/client boundaries.

Production `main` remains intentionally unchanged.

### Segment 6 — other paid road families
Status: STARTING WITH M-11 DIAGNOSTIC
Order after M-4 and M-12 stabilization:
1. M-11;
2. ЦКАД;
3. finish standalone/general A-289 integration;
4. M-3 / M-1 and other common operator systems.

Each system gets an explicit tariff model, evidence model and regression corpus. No road-family pricing is promoted from a legacy heuristic until a diagnostic checkpoint documents current behavior and proves the replacement rules.

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

Start Segment 6A as diagnostic-only M-11 work. First inventory the existing M-11 logic and current user-API controls, identify exactly what evidence currently determines M-11 traversal and pricing, and document the official tariff model needed for exact calculation. Do not change M-11 user pricing until the diagnostic plan and baseline regression evidence are persisted.