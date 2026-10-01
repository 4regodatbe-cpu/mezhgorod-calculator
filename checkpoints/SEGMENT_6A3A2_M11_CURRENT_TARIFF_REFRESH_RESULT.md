# Segment 6A3A2 — current M-11 58–679 tariff refresh result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / DATA ONLY
Production `main`: unchanged.

## Accepted workflow

- Workflow: `Segment 6A3A2 M11 current tariff refresh`
- Run: `36835594443`
- Head: `6173010983d4b0c8e0843cc59c0ed32cf278c3a9`
- Result: SUCCESS
- Deterministic assertions: SUCCESS
- Production API non-integration gate: SUCCESS
- `pnpm build`: SUCCESS

## Persisted current A1 snapshot

`data/tolls/m11/2026-10-01-58-679-category1-a1-current.json`

The historical March snapshot remains unchanged.

Current A1 records:

- 22 ordered tariff points;
- new `p593` inserted between `p545` and `p647`;
- `p593` is linked to authoritative physical facility evidence `pvp593` and opening date 2026-09-18;
- current directly observed controls only:
  - p58→p593: 3600 RUB Mon–Thu / 4390 RUB Fri–Sun;
  - p58→p679: 4200 RUB Mon–Thu / 4940 RUB Fri–Sun.

## Truth constraints preserved

- `completeMatrix=false`;
- current A1 is diagnostic only and cannot price arbitrary pairs;
- no historical monetary cells were copied into the current snapshot unless independently observed;
- 593→679 is not derived by subtraction;
- the March 21-point snapshot remains historical evidence and does not gain p593;
- no current M-11 tariff data is imported into `/api/v2/calculate`;
- no unresolved amount becomes 0 RUB.

## Next action

Proceed to current A2 acquisition/transcription for the two complete Category-I matrices of the 58–679 system. Require structural validation, exact 22-point order including p593, direct source coverage for every cell, and independent cross-checks. Any unreadable or ambiguous cell blocks A2 completion; do not interpolate, subtract or reuse an older matrix silently.
