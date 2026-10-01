# M-12 Segment 5B2B-3B — direction-aware corridor classifier

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Correct the invalid endpoint-reversal symmetry assumption found in 5B2B-3A.

The same endpoints in reverse order may cause Valhalla to choose a materially different corridor. Toll equality is required only when the route geometries are themselves proven to be the same corridor.

## Method

For each bidirectional control pair:

1. request production-style `use_tolls=1` Valhalla geometry in both directions;
2. classify geometry parity using bidirectional sampled route-to-route nearest-distance p95;
3. `same_corridor` when the maximum p95 is <= 2 km;
4. run the RVP-first detector independently for each direction;
5. each direction receives one of:
   - `priced_supported`: >=2 direct calibrated RVP crossings and all internal kilometre-continuity intervals pass;
   - `unknown_no_supported_rvp`: no calibrated RVP crossing;
   - `unknown_incomplete`: partial/inconsistent evidence.
6. for `same_corridor` pairs require identical final RVP set and amount;
7. for `different_corridor` pairs do NOT require equal RVP sets/amounts; only require that unsupported evidence remains `unknown` rather than zero.

## Controls

- Moscow <-> Kazan
- Vladimir <-> Kazan
- Murom <-> Kazan
- Arzamas <-> Kazan
- Moscow <-> Arzamas

## Hard control

The current Moscow<->Kazan route must remain same-corridor and produce the official-snapshot charge sequence:
`184,281,314,392,420,485,591,635,722,764`.

The amount is calculated from the official snapshot and must remain `3513 RUB` for the current route geometry in both directions.

## Safety

- diagnostic only;
- no Overpass;
- no `trace_attributes`;
- no user API change;
- no route with insufficient evidence may return exact 0 RUB;
- timeout <= 10 minutes.

## Next

If green, Segment 5B2C extracts the proven detector into reusable TypeScript core with `priced/unknown` semantics and adds deterministic regression fixtures before integrating it into `/api/v2/calculate`.
