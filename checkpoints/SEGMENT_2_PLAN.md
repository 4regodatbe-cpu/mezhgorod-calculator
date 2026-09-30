# Segment 2 — shared M-4 calculation core

Date: 2026-09-30
Branch: `optimize-calculator-2`
Starting state: Segment 1 regression SUCCESS at `5bafe9dd34ef441f6e05e0e0c74b77ad163fccc0`.

## Goal

Make diagnostic `/api/v2/debug-m4` and production `/api/v2/calculate` call the same reusable M-4 validation+pricing orchestration, so a diagnostic success cannot validate a different calculation path from the user API.

## Scope

Pure refactor only.

Allowed:
- introduce one shared M-4 core module;
- move the common `validateKnownM4Plazas()` + `priceM4RoutePlazaValidation()` orchestration into it;
- centralize conversion from route-plaza validation to normal `TollValidation` if useful;
- make debug and production wrappers consume that core.

Forbidden in this segment:
- tariff changes;
- PVP/node changes;
- confidence-threshold changes;
- candidate-radius/window/time-budget changes;
- route-provider changes;
- A-289 pricing changes;
- fallback changes;
- free-route changes.

## Invariants

1. Shared core returns the same raw M-4 validation and pricing objects currently produced by the diagnostic path.
2. Production exactness remains: validation complete + pricing priced + amount non-null + no unresolved + confidence medium/high.
3. Mixed-road legacy protection remains unchanged.
4. A-289 composition remains in the production wrapper, not inside the pure M-4 core.
5. Diagnostic response fields remain semantically unchanged.
6. Segment 1 user API regression must remain green.
7. No run may exceed 20 minutes; if the monolithic regression hits the cap, split diagnostic and user gates before retrying.

## Planned files

- new `lib/toll-engine/m4-core.ts`
- update `lib/toll-engine/m4-production.ts`
- update `app/api/v2/debug-m4/route.ts`

## Validation

1. TypeScript/Next build.
2. Existing Segment 1 user API gate.
3. Existing hard M-4 diagnostic invariants where they are runnable from the branch.
4. Compare representative debug output structure before/after by code invariants; no arithmetic change is permitted.

## Rollback criterion

Any changed amount, changed validation completeness, mixed-road regression, or inability to keep Segment 1 green means revert/refine this refactor before moving to Segment 3.
