# Segment 6A3B2E — M-11 multi-anchor spatial boundary model result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / NON-PRODUCTION
Production `main`: unchanged.

## Result

Added a pure multi-anchor spatial evidence layer that keeps official tariff-point identity separate from independently verified OSM coordinates.

Accepted current spatial controls:

- `p58`: four exact OSM booth anchors spanning the two independently documented km-58 physical facility groups;
- `p593`: two exact OSM booth anchors on the newly opened interchange link graph;
- `p679`: one directly M-11-bound toll-booth anchor retained as the strongest narrow control.

No centroid or kilometre-derived coordinate is created.

## Implementation

- `data/tolls/m11/2026-10-01-58-679-spatial-anchors.json`;
- `lib/toll-engine/m11-spatial-anchors.ts`;
- `scripts/segment6a3b2e-m11-spatial-anchor-model-test.ts`;
- `.github/workflows/segment6a3b2e-m11-spatial-anchor-model.yml`.

The builder fails closed on unknown tariff-point IDs, duplicate facility/anchor IDs, empty anchor sets, invalid coordinates, invalid OSM node IDs and unsupported evidence classification.

## Validation

Workflow: `Segment 6A3B2E M11 multi-anchor spatial model`
Run: `36873273176`
Validated head: `ed7ed38885cc0e8c466bd7bf61cb45e013809aec`
Result: SUCCESS.

The gate includes deterministic assertions, explicit no-production-import protection and full `pnpm build`.

## Safety

- spatial evidence contains no money;
- current tariff-point existence comes from the current ordered-point snapshot, not OSM;
- OSM coordinates are classified `independently_verified_infrastructure`, never official coordinates;
- `/api/v2/calculate` remains unchanged.

## Next

6A3B3: deterministic M-11 boundary resolver over strict M-11 road evidence plus route geometry. It may emit only boundary IDs, evidence/confidence and unresolved reasons; candidate-only road clues cannot resolve a tariff boundary and no monetary calculation is allowed.