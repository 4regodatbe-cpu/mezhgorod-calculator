# Segment 6A3A2C — M-11 current partial tariff coverage core result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / NON-PRODUCTION
Production `main`: unchanged.

## Accepted implementation

Added:

- `lib/toll-engine/m11-current-tariffs.ts`;
- `scripts/segment6a3a2c-m11-partial-tariff-core-test.ts`;
- `.github/workflows/segment6a3a2c-m11-partial-tariff-core.yml`.

Source of truth remains only:

`data/tolls/m11/2026-10-01-58-679-category1-a1-current.json`.

## Pricing semantics

The pure core prices only directly verified **directed** current controls.

Exact current Category-I controls:

- `p58 -> p593`: 3600 RUB Mon–Thu / 4390 RUB Fri–Sun;
- `p58 -> p679`: 4200 RUB Mon–Thu / 4940 RUB Fri–Sun.

Everything else remains unavailable unless explicitly covered by the current snapshot.

The core therefore returns `status="unknown"` and `amountRub=null` for, among others:

- `p593 -> p58` and `p679 -> p58` — reverse direction not verified;
- `p593 -> p679` — subtraction is forbidden;
- `p67 -> p89` — arbitrary current pair not verified;
- `p58 -> p58` — no fabricated zero;
- unknown point IDs;
- unsupported tariff profiles.

## Fail-closed validation

The builder rejects:

- unexpected system/snapshot/currency;
- a snapshot that claims to be a complete matrix;
- point-count mismatch;
- duplicate point IDs;
- missing `p58`;
- control-count mismatch;
- controls referencing unknown points;
- negative, non-finite or non-integer monetary values.

Historical March values are not imported by this module.

## Workflow

Workflow: `Segment 6A3A2C M11 partial current tariff core`
Run: `36844756652`
Head: `390ce7c9cf0dcdaacdb2475604d924d4452fced1`
Result: SUCCESS

Green steps:

1. dependency install;
2. deterministic partial-current tariff assertions;
3. explicit no-production-import assertion;
4. full `pnpm build`.

The job stayed inside the 20-minute project limit.

## What this closes

The project now has a machine-enforced representation of **current known vs unknown** M-11 58–679 monetary truth. Missing current matrix coverage can no longer justify silently reusing March values, reversing a known pair, subtracting two controls, or returning zero.

## What remains blocked

This is not the complete current A2 matrix. Arbitrary-pair current 58–679 pricing and a full production M-11 resolver remain gated on:

- complete current tariff coverage from an authoritative source; and
- sufficient trusted/independently verified spatial boundary evidence.

## Next safe action

Continue M-11 spatial-anchor acquisition independently of the blocked monetary A2 source. Search authoritative infrastructure sources first, then independently verifiable road-infrastructure evidence with explicit provenance. Do not derive coordinates from kilometre labels, city centres, or provider route spans alone.
