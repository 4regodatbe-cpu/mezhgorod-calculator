# M-12 Segment 5A2c — production-parity traversal from frozen fixture

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Why this segment exists

Segment 5A2 produced a useful OSM toll-object inventory and route-relative projections, but its Valhalla request did not exactly match the production fast-route semantics. Segment 5A2b corrected Valhalla to `costing_options.auto.use_tolls = 1`, but the run failed before routing evidence could be evaluated because all configured Overpass endpoints failed for corridor box 3.

That failure is an external inventory-acquisition failure, not evidence that M-12 routing/traversal is wrong. Repeating the same live Overpass query would make the diagnostic non-reproducible.

## Input fixture

Use the successful Segment 5A2 artifact as a frozen, deliberately limited fixture:

- workflow run: `36728141365`
- artifact id: `11102648908`
- artifact name: `segment5a2-m12-traversal`
- source generated at: `2026-09-30T14:19:39.687Z`
- source raw candidate count: `138`
- fixture extraction: union of `routes[].accepted` and `routes[].nearbyRejected`, deduplicated by OSM node id
- expected frozen fixture size: `68` objects

Important: this fixture is **not** a complete M-12 corridor inventory. It contains only objects that were within 5 km of at least one route in the successful 5A2 run. It is valid for parity/reprojection diagnostics only, not as an authoritative tariff or coverage database.

## Planned algorithm

1. Commit the compact frozen fixture with provenance and an explicit LIMITED warning.
2. Build Москва → Казань and Казань → Москва using the same Valhalla fast-route semantics as `/api/v2/calculate`:
   - `costing = auto`
   - `costing_options.auto.use_tolls = 1`
   - kilometres
   - decoded Valhalla route geometry
3. Reproject every fixture object onto each live route and calculate:
   - nearest lateral distance;
   - chainage along route;
   - whether it is within the strict 1 km evidence radius.
4. Exclude from passenger M-12 evidence:
   - known `Платон` / HGV gantries already classified in the fixture;
   - physical `toll_booth` objects (not M-12 free-flow gantry evidence).
5. Cluster eligible gantry nodes by route chainage into physical traversal events (initial diagnostic cluster distance 0.25 km).
6. Compare forward/reverse route corridor geometry independently of OSM node IDs.
7. Save a JSON report with:
   - fixture provenance;
   - production-parity route metrics;
   - all reprojections;
   - eligible gantry events;
   - excluded near-route objects;
   - coverage assessment.
8. Do **not** calculate toll money and do **not** alter `/api/v2/calculate` in this segment.

## Success criteria

- No Overpass/network inventory request occurs.
- Both Valhalla production-parity routes are valid.
- Fixture provenance and count are exact (`68`).
- Platon/HGV objects are never classified as passenger M-12 evidence.
- A deterministic JSON report is produced for both directions.
- The diagnostic explicitly reports whether the LIMITED fixture is sufficient for the next clustering experiment; insufficiency is a result, not converted into false success.
- Workflow timeout <= 20 minutes.

## Non-goals / rollback conditions

Do not widen the route radius to force matches. Do not promote raw OSM-ID mirror equality to an invariant. Do not touch M-12 tariff arithmetic, M-4 logic, `main`, or production.

If Valhalla itself is unavailable, stop the attempt and diagnose that external dependency rather than changing traversal logic.

## Next segment

If 5A2c provides usable bidirectional physical-event evidence: Segment 5A3 clusters physical RVP/gantry events and tests mirrored event order. If the limited fixture is insufficient, first build a cached/versioned full inventory source, then repeat 5A2c against that immutable source.
