# M-12 Segment 5B2C — deterministic reusable core result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Runs and evidence

### 5B2C-1 route capture

- workflow: `Segment 5B2C-1 capture M12 routes`
- run id: `36764772325`
- artifact id: `11119902055`
- result: success
- 10 current production-style Valhalla control directions captured once.

Compact deterministic regression input persisted as:

- `data/fixtures/m12-route-projections-2026-09-30.json`

It contains route-relative calibrated-RVP projections + strict M-12 span + expected route-core result for the 10 controls. It is regression evidence, not a production route database.

### 5B2C-2 pure core

- workflow: `Segment 5B2C-2 M12 pure core`
- run id: `36765673542`
- head: `4d8c10342a2d7a883204aae9621bd9f8b709cb3e`
- artifact id: `11121280412`
- result: success
- timeout bound: 10 minutes

## Gates

- official M-12 tariff assertions: `96/96` passed;
- standalone TypeScript typecheck of `m12-route-core.ts`: passed;
- deterministic route-core assertions: `18/18` passed;
- deterministic fixture: 10 routes / 9 priced / 1 unknown;
- network requests in route-core assertions: `0`;
- full `pnpm build`: passed.

## Core invariants now encoded

1. Direct calibrated RVP crossing requires route distance <= `0.08 km`.
2. Missing official RVPs can be reconstructed only strictly inside two proven direct bounds.
3. Internal reconstruction requires route-chainage delta to agree with official-km delta within `max(3 km, 2.5%)`.
4. Entry and exit are independently bounded by strict M-12 road span evidence with a `2.5 km` calibration safety margin.
5. Exact pricing requires:
   - at least two direct calibrated RVP crossings;
   - complete internal continuity;
   - proven entry/exit boundaries;
   - official tariff for every final RVP marker.
6. Any incomplete condition => `status=unknown`, `amountRub=null`.
7. Missing M-12 evidence never means `0 RUB`.
8. Monetary amounts are read from the versioned official tariff snapshot, not hard-coded.

## Mutation proofs

Assertions explicitly prove the core becomes unknown/null when:

- strict M-12 span is missing;
- only one direct RVP remains;
- no direct RVP remains;
- RVP-chain continuity is artificially broken;
- entry span expands far enough that the previous official RVP can no longer be excluded;
- exit span expands far enough that the next official RVP can no longer be excluded.

## Current control result

The current Moscow<->Kazan fast route remains:

- final RVPs: `184,281,314,392,420,485,591,635,722,764`;
- amount: `3513 RUB` each direction for the current same-corridor geometry.

This is intentionally different from the full official Moscow->Kazan all-M12 tariff (`5847 RUB`) because the current Valhalla fast route enters M-12 later and exits before the final RVPs.

## Next

Segment 5B2D: integrate the proven core into `/api/v2/calculate` conservatively:

- reuse the existing fast Valhalla route request; no second full-route request;
- expose strict M-12 maneuver span from that same route response;
- feed fast route geometry + span into the pure M-12 core;
- exact M-12 result may replace legacy M-12 recovery only when the core returns `priced`;
- unknown falls back without becoming false zero;
- preserve M-4/A-289/mixed-road logic;
- require build + M-4 regression + M-12 user-API regression before checkpoint.
