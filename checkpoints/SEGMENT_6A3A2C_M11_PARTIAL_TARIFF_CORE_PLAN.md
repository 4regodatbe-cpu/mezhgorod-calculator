# Segment 6A3A2C — M-11 current partial tariff coverage core plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLAN
Production `main`: unchanged.

## Goal

Create a pure deterministic tariff-coverage core for the current incomplete 58–679 snapshot so confirmed directed controls can be represented exactly while all uncovered pairs remain machine-visible as `unknown`.

This segment does **not** replace the missing complete A2 matrix and does **not** integrate M-11 pricing into `/api/v2/calculate`.

## Source of truth

Only:

`data/tolls/m11/2026-10-01-58-679-category1-a1-current.json`

No March monetary value may be used for a current result unless independently present in the current snapshot.

## Required semantics

1. Model system ID must be `m11-58-679-avtodor`.
2. Point order must remain exactly the current 22-point order including `p593`.
3. Supported profiles are only the snapshot's explicit monetary profiles:
   - `monThu`;
   - `friSun`.
4. A lookup is `priced` only when the exact **directed** pair and requested profile are explicitly present in current verified controls.
5. Reverse direction must not be inferred.
6. Interior pairs must not be derived by subtraction.
7. Historical March values must not fill current gaps.
8. Same-point lookups do not automatically become `0 RUB`; without an explicit pricing fact they remain unavailable.
9. Every unavailable lookup returns `status="unknown"` and `amountRub=null` with a machine-readable reason.
10. No code in this segment may be imported by `/api/v2/calculate`.

## Initial exact controls

Expected exact current coverage from A1:

- `p58 -> p593`: 3600 / 4390 RUB;
- `p58 -> p679`: 4200 / 4940 RUB.

Expected unknown controls:

- `p593 -> p58` — reverse direction not verified;
- `p679 -> p58` — reverse direction not verified;
- `p593 -> p679` — subtraction forbidden;
- `p67 -> p89` — current arbitrary pair not verified;
- `p58 -> p58` — no fabricated zero.

## Implementation surface

Add only:

- `lib/toll-engine/m11-current-tariffs.ts` — pure builder/lookup core;
- `scripts/segment6a3a2c-m11-partial-tariff-core-test.ts` — deterministic assertions;
- `.github/workflows/segment6a3a2c-m11-partial-tariff-core.yml` — <=20 minute gate.

## Validation gate

The workflow must prove:

- exact point-order validation;
- exact directed control pricing;
- reverse-direction remains unknown;
- no subtraction/interpolation;
- unknown always carries null money;
- malformed control references fail closed;
- negative/non-integer monetary values fail closed;
- production API does not import the new module;
- `pnpm build` succeeds.

If any invariant fails, do not promote or update the master plan as complete.
