# Segment 6A3D — production-safe M-11 wrapper result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / NOT YET WIRED TO USER API
Production `main`: unchanged.

Added `lib/toll-engine/m11-production.ts` and deterministic wrapper controls.

The wrapper:
- consumes existing route geometry and strict M-11 evidence only;
- adds zero network requests;
- resolves current verified spatial boundaries;
- performs separate current weekday/weekend lookups;
- emits exact production-shaped tolls only for directly verified current directed cells;
- blocks exact replacement when any non-M-11 legacy paid-road family is present;
- leaves reverse/interior/unsupported/unresolved cases without a replacement.

Workflow `Segment 6A3D M11 production wrapper`, run `36874557342`, head `8f2f35fe9b73dfac5cee8be9d0af74c62caad4be`, completed SUCCESS including deterministic controls, explicit no-user-API-import assertion and full production build.

## M-11 promotion decision

Do not wire the partial wrapper into `/api/v2/calculate` yet. The authoritative complete current A2 matrix remains unavailable through deterministic automated acquisition, and current exact monetary coverage is intentionally only two directed controls. The wrapper is production-shaped and regression-proven, but broad promotion would create an asymmetric partial behavior that is not yet justified by coverage.

This is a safe stop, not a failed engine: unknown remains unknown, legacy/fallback behavior remains available, and no false zero/current tariff is introduced.

## Next road family

Proceed within Segment 6 to ЦКАД baseline/evidence/tariff audit, while preserving the completed M-11 core for later promotion when current authoritative tariff coverage expands.