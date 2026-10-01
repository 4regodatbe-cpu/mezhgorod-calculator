# Segment 6A3B2D — M-11 OSM spatial evidence result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / DIAGNOSTIC-ONLY
Production `main`: unchanged.

## Goal

Acquire independently verifiable spatial evidence for unresolved current M-11 facilities without deriving coordinates from tariff kilometre labels or route-provider spans.

## Observed evidence

GitHub Actions workflow `Segment 6A3B2D M11 OSM toll object inventory`, run `36850096015`, queried the direct OpenStreetMap API 0.6 and returned two `barrier=toll_booth` nodes associated with the new km-593 interchange infrastructure:

- node `13249401006`: `59.1976987, 31.2534812`, parent way `1443881665` (`secondary_link`);
- node `14162143275`: `59.2039200, 31.2595577`, parent way `1443881666` (`secondary_link`).

Both node versions were timestamped 2026-09-08, before the independently documented 2026-09-18 opening of the km-593 interchange/PVP.

A follow-up direct OSM graph-connectivity probe, workflow run `36850264904`, proved that the two link ways are connected into the local interchange road graph rather than isolated map objects:

- way `1443881665` connects through link ways `1443881662/1443881663` and regional road `41A-004`;
- way `1443881666` connects through the local roundabout/link graph (`1443881670`, `1443881667`, `1443881668`, `1557291422`).

The same direct-API diagnostic also observed km-679 toll-booth objects, including node `2492861243` directly on a way tagged `ref=М-11`, `name=«Нева»`, `toll=yes`, but this segment does not promote that observation into the boundary model yet.

## Decision

The km-593 spatial gap is no longer a simple “no coordinate evidence exists” gap. There is independently verifiable OSM infrastructure evidence for two physical toll-booth nodes associated with the interchange.

However, a single `coordinate` field on the current `M11BoundaryFacility` cannot faithfully represent a physical tariff facility that has multiple directional booth anchors. Selecting one booth or inventing a centroid would discard evidence or create a derived coordinate not present in the source.

Therefore no coordinate is written into the existing facility object in this subsegment.

## Safety conclusions

- OSM evidence is classified as `independently_verified_infrastructure`, not `official_coordinate_backed`.
- The official current tariff snapshot separately proves `p593` as a current tariff point; OSM does not prove money.
- No tariff amount is inferred from spatial evidence.
- No `/api/v2/calculate` integration is introduced.
- No March tariff amount is promoted to current pricing.

## Next

6A3B2E: extend the pure boundary model to preserve multiple spatial anchors per physical facility (with provenance/status per anchor), then bind the officially current `p593` tariff point to the independently verified km-593 booth anchors using the current ordered-point snapshot. The model must remain money-free and fail closed when spatial evidence is ambiguous.