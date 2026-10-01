# Segment 6A3B2E — M-11 multi-anchor spatial boundary model plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Represent independently verified multi-node spatial evidence for a physical M-11 tariff facility without selecting an arbitrary booth, inventing a centroid, or mixing spatial evidence with monetary pricing.

## Planned changes

1. Extend `M11BoundaryFacility` from one optional spatial coordinate to an ordered `spatialAnchors` collection.
2. Each anchor carries its own stable ID, coordinate, status and source/provenance.
3. Preserve zero anchors for unresolved facilities; no kilometre-to-coordinate inference.
4. Keep the existing official facility identity separate from OSM spatial provenance.
5. Build the 58–679 boundary system from the current ordered-point snapshot when explicitly requested, so current `p593` exists as a tariff point before any binding is accepted.
6. Add deterministic assertions for two distinct km-593 booth anchors and for fail-closed invalid/duplicate anchor evidence.
7. Do not calculate money and do not import this model into `/api/v2/calculate`.

## Success criteria

- `p593` exists only when the current ordered-point snapshot is used;
- the official km-593 facility can retain both observed booth anchors with exact source coordinates;
- no centroid/synthetic coordinate is emitted;
- unresolved facilities remain representable with zero anchors;
- duplicate anchor IDs and invalid coordinates fail hard;
- existing tariff-point order and facility identity invariants remain green;
- production build remains green.

## Stop criteria

Stop and preserve unresolved status if binding the OSM booth nodes to the official km-593 facility requires an unsupported geographic inference beyond the independently verified interchange context. Do not weaken the distinction between official identity evidence and OSM spatial evidence.

## Next

After green 6A3B2E, implement 6A3B3 deterministic boundary resolver over strict M-11 road evidence plus route geometry, returning boundary IDs/evidence/unresolved reasons only; no money.