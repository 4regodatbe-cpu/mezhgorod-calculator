# Calculator 2.0 — handoff to new chat

Date: 2026-10-01
Repository: `4regodatbe-cpu/mezhgorod-calculator`
Working branch: `optimize-calculator-2`
Branch head before this handoff file: `b715d44112215b64798b46fe37234a80d4791262`
Production `main`: intentionally unchanged.

## Mandatory working rules from the user

1. Work only in small segments; split a segment again if it contains multiple independent risks/tasks.
2. Before each segment persist: goal, planned algorithm, files/surface to change, success criteria, rollback/stop criteria, and the next expected step.
3. After each segment persist the result/checkpoint, give the user a short report, and immediately continue to the next segment without waiting for confirmation.
4. A single execution attempt must not run/wait indefinitely. Hard-limit each attempt to <=20 minutes. If it does not complete, stop/cancel waiting, inspect logs/evidence, revise or split the approach, then retry. Do not repeat the same failed attempt without new diagnostic information.
5. Do not use Work unless truly necessary. Normal GitHub/CI/web tooling is preferred.
6. Do not modify production `main` until the working branch passes the required regression gates.
7. `unknown`, timeout, provider failure, incomplete evidence, or unresolved context must never become exact `0 ₽` or proof of a free route.
8. Continue autonomously through the optimization program. Stop only for an objective blocker that requires irreversible/unsafe action, production/main risk, or genuinely unavailable required data/access.

## Global architecture/invariants

Read first: `OPTIMIZATION_MASTER_PLAN.md`.

Core rules already adopted:
- routing/OSM/provider evidence answers **where the vehicle travels**;
- official operator snapshots answer **what that proven traversal costs**;
- road-system-specific engines are required (M-4 != M-12 != M-11, etc.);
- avoid-toll routing is candidate generation, not proof of toll-free travel;
- exact monetary result requires complete evidence and complete tariff coverage;
- mixed-road routes must not lose tolls from another road family when one engine produces an exact partial result.

## Completed work

### Segments 0–4: DONE
See `OPTIMIZATION_MASTER_PLAN.md` and checkpoints.
Key outcomes:
- proven M-4 engine is integrated into the user calculation path on this branch;
- diagnostic and production M-4 share one calculation core;
- strict `free` vs `freeCandidate` truth model is implemented in API/UI;
- M-4 validator optimized safely to concurrency 4; geometry-only and sampled `edge_walk` shortcuts were rejected; one-call PBF route evidence was also rejected for the current public Valhalla server.

### Segment 5 — M-12: DONE / stabilized
Final checkpoint: `checkpoints/M12_SEGMENT_5B2D_4D2_RESULT.md`.
Validated promoted head recorded there: `ed7bf089cb62f258b542afa413dbfb6f37909f1b`.
Final promotion workflow: `36783522336` SUCCESS.

Key outcomes:
- versioned official M-12 model and deterministic route core;
- no blind full-route tariff substitution;
- exact pricing only with sufficient calibrated route/RVP evidence and full tariff coverage;
- unresolved M-12 pricing serializes as `pricingStatus=unknown`, money nullable, never false `0 ₽`;
- pricing truth propagated through API/UI/analytics;
- `freeCandidate` remains separate from confirmed `free`.

## Current work — Segment 6 / M-11

Segment 6 is diagnostic/data-first. No new M-11 exact pricing has been wired into `/api/v2/calculate` yet.

### 6A1 baseline: DONE
Result: `checkpoints/SEGMENT_6A1_M11_BASELINE_RESULT.md`.

### 6A2 provider evidence investigation: DONE
Relevant files:
- `checkpoints/SEGMENT_6A2A_M11_VALHALLA_RESULT.md`
- `checkpoints/SEGMENT_6A2B_M11_OSRM_STEPS_PLAN.md`
- `checkpoints/SEGMENT_6A2B_M11_OSRM_STEPS_RESULT.md`
- `checkpoints/SEGMENT_6A2C_M11_EVIDENCE_PARSER_PLAN.md`
- `checkpoints/SEGMENT_6A2C_M11_EVIDENCE_PARSER_RESULT.md`

Validated parser run: `36786170033` SUCCESS at head `55dcba2fa02e7d60d41404da8dec443641186641`.

Implemented provider-neutral road evidence:
- `lib/toll-engine/m11-road-evidence.ts`
- deterministic fixtures and CI gate.

Important semantics:
- strict M-11 road blocks are accepted only from strong road identity evidence;
- `destinations=M-11` is candidate-only;
- `Нева` without strict M-11 ref/name is candidate-only;
- unlabeled gaps are not silently bridged;
- malformed strict evidence breaks continuity;
- this layer proves road identity only, not tariff entry/exit and not money.

### 6A3A official tariff snapshots: PARTIALLY DONE / data-only
Plan: `checkpoints/SEGMENT_6A3A_M11_OFFICIAL_TARIFF_SNAPSHOT_PLAN.md`.

Already persisted:
- `data/tolls/m11/2026-04-24-15-58-category1.json` — complete Category I/Group 1 directional matrix for the 15–58 km concession section;
- `data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json` — official ordered point controls / A1 control snapshot for 58–679 km; intentionally not a complete arbitrary-pair matrix.

Recent commits:
- `8c85bc6fbfc1335891bc17e915812394ff593a5d` — Add official M11 15-58 Category I tariff snapshot;
- `3990db6ba5752460ede085cd57dc7e3b6e16a522` — Add official M11 58-679 A1 control snapshot.

Do NOT use incomplete 58–679 A1 controls for arbitrary pricing. No interpolation/guessing of missing tariff cells.

## Exact stop point

Current pre-handoff head: `b715d44112215b64798b46fe37234a80d4791262`
Commit message: `Plan Segment 6A3B M11 boundary mapping`.

Current plan file:
`checkpoints/SEGMENT_6A3B_M11_BOUNDARY_MAPPING_PLAN.md`

Status: **6A3B STARTED, implementation not yet performed.**

### Next exact action: 6A3B1

Inventory existing M-11 tariff-boundary anchors/evidence before writing any resolver:
1. locate existing M-11 PVP/entry/exit anchors in legacy toll code, diagnostics, and data;
2. compare each anchor against official named tariff points/order in the 15–58 and 58–679 snapshots;
3. classify every anchor as one of:
   - official-coordinate-backed;
   - legacy-only;
   - route-provider-derived;
   - missing/unresolved;
4. persist the inventory result as a checkpoint before moving to 6A3B2.

Do not calculate money in 6A3B.
Do not change `/api/v2/calculate` in 6A3B.
Do not infer coordinates from tariff kilometre values alone.
If authoritative spatial coordinates are missing, preserve the point order model but mark spatial mapping unresolved and split a new official/OSM diagnostic subsegment.

### 6A3B2 after green 6A3B1
Create a pure boundary data model:
- stable tariff-system IDs and tariff-point IDs;
- trusted coordinates optional and separate from order/km metadata;
- missing coordinates remain missing.

### 6A3B3 after green 6A3B2
Deterministic resolver:
- input: `M11RoadEvidence` + route geometry when available;
- output: resolved entry/exit point IDs per tariff system + confidence/evidence/unresolved reasons;
- no money.

### 6A3B4 after green 6A3B3
Fixture gate covering:
- full Moscow↔Saint-Petersburg strict M-11 traversal;
- entry/exit within 15–58;
- crossing 15–58 -> 58–679;
- 58–679-only traversal;
- unlabeled/candidate-only gap;
- non-M-11 control;
- deliberately ambiguous boundary => unresolved.

After 6A3B is green, next is **6A3C pure tariff-selection core**, still before production integration.

## Later program after M-11

Per master plan:
- other paid road families: ЦКАД, standalone/general A-289, M-3/M-1 and other common systems;
- tariff snapshot versioning/staleness checks;
- route-distance/time quality and multi-provider disagreement QA;
- external toll-provider benchmark (HERE/TollGuru etc.) against official controls, never blind trust;
- final UX truthfulness + full regression + production-readiness audit;
- obsolete Yandex copy implying Yandex supplies exact toll money must be removed in final UX segment.

## Restart instruction for the next chat

In the new chat, first read:
1. this file;
2. `OPTIMIZATION_MASTER_PLAN.md`;
3. `checkpoints/SEGMENT_6A3B_M11_BOUNDARY_MAPPING_PLAN.md`;
4. `checkpoints/SEGMENT_6A2C_M11_EVIDENCE_PARSER_RESULT.md`;
5. `checkpoints/SEGMENT_6A3A_M11_OFFICIAL_TARIFF_SNAPSHOT_PLAN.md`.

Then verify branch HEAD and any workflow status. Do not redo completed segments. Continue immediately from **6A3B1 anchor inventory** under the <=20-minute attempt rule.
