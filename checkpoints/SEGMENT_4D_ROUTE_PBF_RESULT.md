# Segment 4D — one-call Valhalla route PBF evidence — REJECTED

Date: 2026-09-30
Workflow run: `36722406803`
Artifact: `11102570130`

## Goal
Test whether one public Valhalla `/route` PBF response can include both directions and TripLeg edge/node evidence, allowing M-4 PVP proof without the second `trace_attributes` layer.

## External basis
Valhalla's current protobuf schema has `TripLeg.Edge.begin_osm_node_id`, `TripLeg.Edge.end_osm_node_id`, and `TripLeg.Node.type` values including `kTollBooth` and `kTollGantry`. A March 2026 Valhalla maintainer discussion recommends selecting both `directions` and `trip` in a PBF route response to obtain route and edge information in one call.

## Actual public-server probe
Request:
- server: `https://valhalla1.openstreetmap.de/route`;
- route: Moscow → Voronezh;
- output format: PBF;
- requested selector: `trip=true`, `directions=true`;
- PBF decoded against the current Valhalla protobuf descriptors.

Observed decoded response:
- `hasTrip: false`;
- `hasDirections: true`;
- Trip node blocks: 0;
- toll-booth node types: 0;
- toll-gantry node types: 0;
- begin OSM node IDs: 0;
- end OSM node IDs: 0;
- known M-4 plazas reproduced by exact OSM ID: none.

The PBF response itself was valid (21,566 bytes) and decoded successfully. Therefore this is not a decoder/request transport failure: the public `/route` response simply did not populate the `trip` field even though it was requested.

## Decision
Reject the one-call route-PBF replacement on the current public Valhalla server. It cannot preserve the existing exact-PVP proof model.

Do not weaken proof to route geometry or internal graph IDs. Keep the proven local `trace_attributes` validator.

## Segment 4 final safe state
- `shape_match=walk_or_snap`;
- expected concrete OSM `toll_booth` node required;
- local windows only, not one huge long-haul trace;
- concurrency promoted to 4;
- 10/10 M-4 controls complete;
- 192 labelled candidate checks = 162 confirmed + 30 rejected + 0 unknown;
- observed accepted concurrency-4 average validator time: 14,916 ms.

No known additional public-server M-4 optimization has been demonstrated that improves latency without sacrificing the exact evidence model. Future improvement would require a different/self-hosted Valhalla configuration/runtime or another exact road-evidence source.

## Next
Proceed to Segment 5A: diagnose the M-12 Moscow↔Kazan route-evidence failure and build a road-specific free-flow model around official tariff/RVP data.
