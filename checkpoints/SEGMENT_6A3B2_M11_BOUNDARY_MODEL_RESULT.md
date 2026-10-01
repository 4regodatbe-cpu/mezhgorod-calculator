# Segment 6A3B2 — M-11 pure tariff-boundary model result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN
Production `main`: unchanged.

## Implementation

Added:

- `lib/toll-engine/m11-boundaries.ts`;
- `scripts/segment6a3b2-m11-boundary-model-test.ts`;
- `.github/workflows/segment6a3b2-m11-boundary-model.yml`.

The model is built from the already persisted official point inventories. It does not introduce a second monetary tariff source.

## Data semantics

The pure model exposes only:

- tariff-system ID;
- official point ID;
- label;
- deterministic order;
- route-km/PVP-km metadata where already present in the official snapshot;
- explicit spatial evidence object.

For Segment 6A3B2 every official point deliberately has:

- `spatial.status = "unresolved"`;
- `spatial.coordinate = null`;
- `spatial.source = null`.

No legacy M-11 coordinate and no Valhalla/OSRM route-span coordinate was copied into the official boundary model.

## Deterministic controls

The assertion script proves:

- exactly 2 M-11 boundary systems;
- exactly 7 points for `m11-15-58-ossp`;
- exactly 21 points for `m11-58-679-avtodor`;
- stable point order in both systems;
- no duplicate IDs;
- contiguous zero-based order;
- all 28 coordinates remain null;
- all 28 spatial statuses remain unresolved;
- 15–58 route/PVP km values are not fabricated;
- known route/PVP-km differences are preserved for `p147`, `p209`, `p330`, `p545`, `p647`;
- the boundary model exposes no monetary tariff fields.

## Workflow

Workflow: `Segment 6A3B2 M11 boundary model`
Run: `36799631209`
Head: `5a4019d7ed88efb96dcd588dc1daa2d5cd16f0f8`
Result: SUCCESS.

Green steps:

1. dependency install;
2. deterministic M-11 boundary-model assertions;
3. explicit assertion that `/api/v2/calculate/route.ts` does not import `m11-boundaries`;
4. production `pnpm build`.

The job stayed inside the 20-minute project limit.

## What is proven

1. Official tariff-point identity/order is now represented independently from provider-specific road spans.
2. Missing spatial truth remains machine-visible as unresolved rather than being replaced by legacy coordinates.
3. The model can later accept trusted coordinates without changing official point identity/order semantics.
4. No M-11 monetary result or user-facing API behavior changed.

## What remains unresolved

The repository still has zero official-coordinate-backed M-11 boundary anchors. Therefore an exact route-geometry → tariff-point resolver cannot yet honestly emit official point IDs from proximity alone.

## Next

Before Segment 6A3B3 can become an exact resolver, run a dedicated spatial-anchor acquisition/validation subsegment:

- search authoritative operator/official road sources first;
- where an official coordinate is unavailable, use independently verifiable road-infrastructure evidence only with explicit provenance and confidence;
- never derive coordinates from route kilometre numbers or city centres;
- never silently promote legacy/provider road-span coordinates to official tariff boundaries;
- unresolved points must stay unresolved.
