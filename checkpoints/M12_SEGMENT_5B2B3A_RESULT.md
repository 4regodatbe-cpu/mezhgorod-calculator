# M-12 Segment 5B2B-3A — RVP-first detector first gate result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / PAIR-SYMMETRY INVARIANT REJECTED

## Run

- workflow: `Segment 5B2B-3 M12 RVP crossings`
- run id: `36763958045`
- head: `7235b3c6fd5f85c7b084976b6e7467049a4a1bac`
- artifact id: `11120335533`
- result: diagnostic failure caused by one invalid pair-level invariant

## Strong positive result

Moscow -> Kazan current Valhalla route:

- direct official RVP crossings: `184, 281, 314, 392, 420, 485, 591, 635, 764`;
- internal missing official RVP inferred by kilometre continuity: `722`;
- final charge sequence: `184, 281, 314, 392, 420, 485, 591, 635, 722, 764`;
- rejected RVP 769 candidate is not crossed under the 80 m rule;
- official category-I sum from the tariff snapshot: `3513 RUB`.

Kazan -> Moscow returns the same charge sequence and `3513 RUB` because the full control route geometries are mirrored.

Other green partial controls:

- Murom <-> Kazan: `2621 RUB` both directions;
- Arzamas <-> Kazan: `1800 RUB` both directions;
- Moscow <-> Arzamas: `1713 RUB` both directions.

## Counterexample and root cause

Vladimir -> Kazan:

- route length `642.446 km`;
- direct M-12 evidence at RVPs 281, 314, 392, 420, 485, 591, 635, 764;
- route lies only ~5–17 m from those calibrated anchors.

Kazan -> Vladimir:

- route length `635.515 km`;
- direct calibrated RVP crossings: none;
- distances from the same M-12 anchors are approximately 20–78 km for most anchors (RVP 184 still ~13 km away).

Therefore Valhalla selected materially different corridors in the two directions. Requiring equal toll sets merely because endpoints are reversed is invalid.

## Corrected invariant

- Price the actual route geometry independently in each direction.
- Require forward/reverse toll equality only when geometry parity proves that both directions use the same corridor.
- When corridors differ, different toll results are legitimate.
- `no detected supported M-12 RVP` must remain unknown/not-applicable for the M-12 component until negative coverage is proven; it must not automatically become 0 RUB.

## Next

Segment 5B2B-3B adds a route-geometry parity classifier. Same-corridor pairs must have mirrored RVP sets and amounts; different-corridor pairs are validated independently and are not forced to be symmetric.
