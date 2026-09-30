# Segment 4D — one-call Valhalla route evidence probe

Date: 2026-09-30
Status: PLANNED / research only until Segment 4C is checkpointed

## Goal
Determine whether the original Valhalla `/route` response can provide enough edge/node evidence to prove traversal of known M-4 toll-booth OSM nodes, eliminating the second `trace_attributes` network layer.

## Why this is worth testing
The current M-4 hot path first obtains route geometry from Valhalla and then performs many local `trace_attributes` calls to prove concrete PVP nodes. Segment 4C reduced local matching latency by safe concurrency tuning, but validator latency remains material (~15 s average in the accepted concurrency=4 probe).

Valhalla supports Protocol Buffer output for route operations. Current documentation/discussions indicate PBF contains TripLeg edge data, while `trace_attributes` explicitly exposes `edge.begin_osm_node_id`, `edge.end_osm_node_id` and `node.type`. The critical unknown is whether the public route PBF on `valhalla1.openstreetmap.de` exposes the same OSM-node identity/type needed by our proof model.

## Probe steps
1. Do not change production/user calculation code.
2. Create a diagnostic-only workflow with a <=10 minute timeout.
3. Request a short known M-4 route crossing one or more already-proven PVP nodes from the same public Valhalla server.
4. Request route PBF and decode only the fields needed to inspect TripLeg edges/nodes.
5. Check whether the response contains:
   - traversed edge list in route order;
   - OSM end/begin node IDs, not merely Valhalla internal GraphIds;
   - node type sufficient to distinguish `toll_booth`;
   - stable IDs matching the exact known PVP OSM node IDs used by the existing M-4 validator.
6. Compare the PBF evidence to the current `walk_or_snap` local validator on the exact same route.
7. Persist raw/normalized diagnostic report as workflow artifact.

## Acceptance criteria for further work
Proceed to an implementation experiment only if route PBF itself reproduces the exact expected OSM toll-booth node set without a second map-matching request.

## Reject conditions
Reject one-call PBF evidence if any of these are true:
- route PBF exposes only Valhalla internal edge/node IDs;
- OSM node IDs are absent or server tiles were built without them;
- node type does not identify toll booths;
- expected known PVP nodes are missing or unstable;
- decoding requires a heavyweight/native runtime unsuitable for the current serverless application and offers no practical deployment advantage.

## Fallback after rejection
Keep the proven `walk_or_snap` local validator with concurrency=4. The next optimization candidate would be provenance-aware exact unsampled shape / edge-walk or caching of deterministic road-specific evidence, each as separate isolated experiments.

## Invariants
No approximate geometry threshold may replace concrete PVP proof. Any new path must preserve 10/10 M-4 controls, 192-candidate classification and zero unknown on the regression corpus before adoption.
