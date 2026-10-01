# Segment 6A3B2 — M-11 pure tariff-boundary model plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED
Production `main`: unchanged.

## Goal

Create a deterministic, provider-neutral M-11 tariff-boundary data model from the already persisted official point inventories, without assigning unproven coordinates and without calculating money.

This segment converts the 6A3B1 inventory result into a reusable typed model only.

## Inputs

- `data/tolls/m11/2026-04-24-15-58-category1.json`;
- `data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json`;
- `checkpoints/SEGMENT_6A3B1_M11_ANCHOR_INVENTORY_RESULT.md`.

## Model requirements

Each boundary point must expose:

- stable tariff-system ID;
- stable official point ID;
- official label;
- deterministic order within its tariff system;
- route-km/PVP-km metadata when the official snapshot supplies it;
- `coordinate` as optional/null;
- explicit spatial-evidence status.

Initial 6A3B2 spatial state must be conservative:

- every official point coordinate = `null`;
- every official point spatial status = `unresolved`;
- legacy/provider coordinates are **not** copied into the official boundary model.

## Systems

### 15–58

System ID: `m11-15-58-ossp`.

Official point order is the persisted snapshot order:

`moscow → sheremetyevo2 → sheremetyevo1 → zelenograd → tskad → mmk_a107 → solnechnogorsk`.

No route/PVP km value will be fabricated where the snapshot does not provide one.

### 58–679

System ID: `m11-58-679-avtodor`.

Use the exact persisted 21-point A1 order from `p58` through `p679`, preserving separate `routeKm` and `pvpKm` values where they differ.

## Validation gates

A deterministic assertion script must prove:

1. exactly two supported M-11 boundary systems;
2. 7 points in 15–58 and 21 points in 58–679;
3. no duplicate point IDs within a system;
4. order is stable and contiguous;
5. all coordinates remain null in 6A3B2;
6. all spatial statuses remain `unresolved`;
7. `p147`, `p209`, `p330`, `p545`, `p647` preserve their official route/PVP-km differences;
8. no monetary tariff field is exposed by the boundary model;
9. `pnpm build` remains green;
10. no `/api/v2/calculate` change/import is introduced.

The workflow/job must remain hard-bounded to <=20 minutes.

## Non-goals

- no coordinate acquisition;
- no nearest-point matching;
- no route-to-boundary resolver;
- no tariff selection or money;
- no change to legacy M-11 fallback behavior;
- no production API integration.

## Stop condition

If the implementation requires inventing a coordinate or inferring a boundary from route km/city centre/legacy five-chunk geometry, stop and keep that point unresolved.

## Next after green

Run a dedicated spatial-anchor acquisition/validation subsegment before enabling any coordinate-based exact resolver. The subsequent resolver may emit exact tariff-point IDs only for boundaries with sufficient trusted spatial evidence; otherwise it must return unresolved.
