# M-12 Segment 5B2B-3B — direction-aware RVP detector result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5B2B-3B M12 direction-aware RVP`
- run id: `36764403662`
- head: `03c0b111a37758e2bc282c2b4e71eb5a0c105304`
- artifact id: `11120461013`
- result: success

## Corridor classification

- Moscow <-> Kazan: `same_corridor`, p95 `0.078696 km`;
- Vladimir <-> Kazan: `different_corridor`, p95 `80.265706 km`;
- Murom <-> Kazan: `same_corridor`, p95 `0.053513 km`;
- Arzamas <-> Kazan: `same_corridor`, p95 `0.469024 km`;
- Moscow <-> Arzamas: `same_corridor`, p95 `0.467848 km`.

## Route-dependent M-12 results

Current route geometry produces:

- Moscow <-> Kazan: `3513 RUB` in both directions;
- Vladimir -> Kazan: `3348 RUB`;
- Kazan -> Vladimir: `unknown_no_supported_rvp`, amount `null` because Valhalla selects a materially different corridor;
- Murom <-> Kazan: `2621 RUB`;
- Arzamas <-> Kazan: `1800 RUB`;
- Moscow <-> Arzamas: `1713 RUB`.

## Moscow <-> Kazan proof

Final charge-RVP sequence:

`184, 281, 314, 392, 420, 485, 591, 635, 722, 764`

- direct calibrated crossings prove all except 722;
- RVP 722 is filled only inside the strongly continuous 635–764 official-km interval;
- exploratory RVP 769 candidate is excluded because it is not an exact route crossing under the 80 m rule;
- amount is derived from the official tariff snapshot, not hard-coded into the detector.

## Correct semantics

1. Endpoints reversed do NOT imply the same route.
2. Toll equality is required only when geometry parity proves the same corridor.
3. Different route corridors are priced independently.
4. Insufficient M-12 evidence remains `unknown` with `amount=null`; never automatic `0 RUB`.
5. Road-name maneuvers are supporting context only, not primary traversal proof.

## Next

Segment 5B2C: extract the proven RVP crossing / continuity / official tariff composition logic into a pure reusable TypeScript M-12 core. Add deterministic regression fixtures and application build gate. No user API integration until the pure core is green.
