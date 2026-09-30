# M-12 Segment 5B2B-2 — partial-route maneuver-span stability

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Test the normal-Valhalla maneuver-span method from 5B2B-1 on partial M-12 journeys with different entry/exit contexts before using it in any pricing logic.

## Controls

Bidirectional route pairs:

1. Vladimir <-> Kazan
2. Murom <-> Kazan
3. Arzamas <-> Kazan
4. Moscow <-> Arzamas
5. Moscow <-> Kazan (full control)

Coordinates are fixed diagnostic city-centre controls; no geocoding dependency is introduced.

## Method

For every direction:

- request normal Valhalla `/route` with `costing=auto` and `use_tolls=1`;
- enable normal directions/maneuvers;
- decode the polyline and convert maneuver shape indexes to chainage;
- identify strict `M-12` / `М-12` street-name maneuvers;
- derive first/last labeled M-12 chainage;
- save the surrounding transition maneuvers for diagnosis.

For every route pair:

- both directions must agree on presence/absence of an M-12 span;
- when present, normalized span boundaries must mirror within 3% of total route length;
- route-distance forward/reverse spread must stay <= 3%;
- at least 4 of the 5 controls must expose an M-12 span in both directions.

## Important limitation

The maneuver label boundary is road-identity evidence, not yet a tariff boundary. Free-flow RVP charging may happen on connectors just before/after the named-road transition. This segment must not convert span boundaries directly into money.

## Safety

- no Overpass;
- no `trace_attributes`;
- no pricing;
- no `/api/v2/calculate` change;
- timeout <= 10 minutes.

## Next

If green, 5B2B-3 will combine the maneuver span with the official-km calibration / RVP event evidence and determine which official RVPs are actually crossed, explicitly handling RVPs near entry/exit connectors.
