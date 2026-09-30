# Segment 5A — M-12 route-evidence diagnostic

Date: 2026-09-30
Status: PLANNED / diagnostic only

## Goal
Explain the Moscow↔Kazan `0 ₽` defect with route-level evidence before replacing the legacy M-12 recovery algorithm.

## Confirmed facts before implementation
- Official Avtodor category-I tariff effective 2026-02-27 gives Moscow (MKAD) → M-12 end at Kazan (R239) = 5,847 ₽.
- Existing `M12_RECOVERY` adjacent amounts already reproduce the official cumulative tariff through Kazan; the core tariff arithmetic is therefore not the primary defect.
- M-12 uses barrier-free `Свободный поток`. Pricing is based on the formed route between crossed RVP/control points, not on approximate distance to nearby toll features.
- Current recovery uses broad corridor anchors, radius matching and a longest-consecutive-run heuristic. That is only a fallback heuristic, not a final free-flow evidence model.
- One legacy point currently labelled `Иннополис` corresponds in the current official tariff matrix to `Ивановское (Р241)` and must be corrected in the new versioned data model.

## Diagnostic steps
1. No user-facing calculation changes in 5A.
2. Build actual Valhalla fast-route geometry for:
   - Москва → Казань;
   - Казань → Москва;
   - optionally Москва → Шали as an eastward control.
3. Reproduce current legacy M-12 recovery internals without modifying them:
   - nearest distance from every existing M12 recovery anchor to route geometry;
   - route index/order for each matched anchor;
   - path-distance/direct-distance ratio used by `matchedRuns`;
   - each section considered matched/rejected;
   - every consecutive run and the run selected by the longest-run heuristic;
   - amount the old recovery would infer and why it is or is not accepted.
4. Overlay route-relative OSM toll evidence rather than using only a broad bbox inventory:
   - `highway=toll_gantry`;
   - `barrier=toll_booth` where relevant;
   - useful M-12 toll/road identifiers.
5. For each route-near toll object record:
   - OSM ID/type/tags;
   - nearest distance to route;
   - order along route;
   - candidate association to an official M-12 tariff/RVP point.
6. Compare forward and reverse ordering and identify stable evidence points.
7. Persist normalized JSON artifact and a checkpoint explaining the exact failure mechanism.

## Required output
A diagnostic table/report that can answer, without guessing:
- why current Moscow→Kazan returns 0 or fails to price despite correct tariff arithmetic;
- which official points are actually traversed;
- which OSM objects can prove those traversals;
- whether first/last evidence is sufficient for an exact official matrix lookup;
- where ambiguity remains and must stay `unknown`.

## Timeout
Dedicated diagnostic workflow <=10 minutes. If Overpass/public routing blocks completion, split route geometry and OSM inventory into separate subsegments rather than repeatedly retrying a monolithic workflow.

## Next only after 5A
- 5B: versioned official M-12 tariff-point/matrix data model.
- 5C: ordered free-flow traversal detector and exact pricing core.
- 5D: integrate into `/api/v2/calculate` behind existing safe fallbacks and regression gate.

## Invariants
No OD-specific hard-coded answer is allowed as the algorithm. No missing/ambiguous traversal evidence becomes `0 ₽`. Old fallback remains available until the new engine passes forward/reverse and partial-route regressions.
