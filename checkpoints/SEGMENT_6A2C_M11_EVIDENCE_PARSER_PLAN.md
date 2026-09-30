# Segment 6A2C — provider-neutral M-11 road-evidence parser plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED
Production `main`: unchanged.

## Goal

Convert the proven diagnostic evidence from Segments 6A2A/6A2B into a deterministic pure parsing layer, without changing any M-11 monetary calculation or user API behavior.

The parser must normalize provider-specific route metadata into the same conservative representation:

- ordered strict M-11 blocks;
- explicit weak/candidate clues;
- malformed/unusable evidence count;
- no automatic gap bridging.

## Provider adapters

### Valhalla

Strict M-11 identity may come only from `street_names` / `begin_street_names` on maneuvers.

Requirements:

- validate `begin_shape_index` / `end_shape_index`;
- preserve leg order and route-relative order;
- group only consecutive strict M-11 maneuvers;
- malformed matching maneuvers break continuity rather than being skipped as if continuous;
- derive boundary coordinates from decoded leg shape;
- multiple blocks remain multiple blocks.

### OSRM

Strict M-11 identity may come only from step road `name` or `ref`.

Requirements:

- `destinations` mentioning M-11 is a candidate clue only;
- `Нева` without strict M-11 road identity is a candidate clue only;
- group only consecutive strict steps;
- preserve the observed 0.301 km unlabeled northern gap as a gap;
- preserve the observed reverse 1.960 km `destinations=M-11` entry as a weak clue, not strict road ownership;
- derive route-relative distance from ordered step distance and boundary coordinates from step geometry/maneuver location.

## Provider-neutral output

A strict block must expose at minimum:

- provider;
- leg/source index range;
- begin/end route km when measurable;
- length;
- begin/end coordinates;
- source labels/refs sufficient for diagnostics.

A candidate clue must expose:

- provider;
- source index;
- reason (`destination_m11`, `neva_without_strict_ref`, etc.);
- route-relative distance/coordinates where measurable.

The parser itself does not decide tariffs, tariff systems, toll/free status, or money.

## Deterministic fixtures

Persist compact fixtures based on the observed controls rather than re-querying public providers during unit assertions:

1. Valhalla Moscow→Saint-Petersburg style continuous strict block;
2. OSRM Moscow→Saint-Petersburg / Sochi→Saint-Petersburg style two strict blocks separated by an unlabeled gap;
3. OSRM Saint-Petersburg→Sochi style weak destination clue followed by a strict block;
4. malformed Valhalla shape-index control;
5. non-M-11 control.

## Assertions

- exact expected block count;
- exact strict/candidate classification;
- gaps are not bridged;
- weak `destinations` evidence is not strict;
- malformed strict evidence is counted and cannot create a block;
- non-M-11 input yields zero strict blocks;
- provider-neutral output is deterministic.

## Gates

1. runtime fixture assertions green;
2. production `pnpm build` green;
3. no imports/wiring into `/api/v2/calculate` yet;
4. no edits to `lib/tolls.ts`, verified route amounts, M-4 or M-12 pricing;
5. job <=20 minutes.

## Next

After the pure parser is green, start Segment 6A3: versioned official M-11 tariff systems and official tariff-point mapping. Monetary integration remains blocked until that tariff layer is complete and tested.
