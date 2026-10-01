# Segment 2 — COMPLETE

Date: 2026-09-30
Branch: `optimize-calculator-2`
Validated head: `44b0b8d1a6e1d2bb7d316fc0d51df85efd8cead7`
Workflow run: `36678855536`
Result: SUCCESS

## Goal completed

Diagnostic `/api/v2/debug-m4` and production M-4 integration now share one reusable calculation core: `lib/toll-engine/m4-core.ts`.

## Shared core owns

- `validateKnownM4Plazas()` execution;
- `priceM4RoutePlazaValidation()` execution;
- conversion to normal `TollValidation`;
- the exactness predicate: complete validation + priced result + non-null amount + zero unresolved + confidence medium/high.

## Production wrapper still owns

- detection of legacy toll systems outside M-4/A-289;
- mixed-road protection;
- A-289 composition;
- fallback decision outside the exact M-4 result.

Therefore the refactor did not move unrelated road logic into the pure M-4 core.

## Validation

- Next/TypeScript build: PASS.
- Segment 1 real user API regression: PASS.
- Differential protected-route comparison: PASS.
- M-4 diagnostic endpoint is now included in the branch regression trigger so future edits cannot bypass the build gate.
- Whole attempt remained below the 20-minute hard cap.

## Result

No tariff, node, confidence, route-selection or fallback arithmetic changed. Segment 1 exact controls remain green after the refactor.

## Next action

Segment 3A: probe whether the concrete public Valhalla instance actually enables hard `exclude_tolls`. Do not change free-route semantics until this capability is measured.
