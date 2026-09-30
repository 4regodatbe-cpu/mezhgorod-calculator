# M-12 Segment 5A3 — physical-event mirror proof result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5A3 M12 physical events`
- run id: `36756667549`
- head: `5028fc55a0305d6343eacb08a890441151ff61c4`
- artifact id: `11117665067`
- core proof step: success

## Proof result

- forward physical events: `11`
- reverse physical events: `11`
- mirrored pairs: `11`
- failed pairs: `0`
- maximum geographic centre distance: `0 km`
- maximum normalized-chainage residual: `0.001575` (~0.16% of route length)
- allowed normalized residual: `0.005` (0.5%)

The proof re-ran Segment 5A2c as its evidence producer, therefore:

- exact production-style Valhalla `use_tolls=1` semantics were used;
- Overpass requests remained `0`;
- Platon/HGV gantries were excluded;
- the frozen LIMITED fixture/provenance was preserved.

## Confirmed conclusions

1. Raw OSM node-id symmetry is not required and must not be used as the invariant.
2. The 11 observed passenger M-12 gantry clusters are the same physical events in opposite traversal order.
3. Ordered physical-event traversal is stable enough to become the road-specific M-12 detection primitive.
4. This proof is still based on a LIMITED fixture. It proves the traversal mechanism, not full official RVP coverage.
5. No toll price was calculated and `/api/v2/calculate` was not changed in Segment 5A.

## Segment 5A status

5A1 legacy replay: complete — legacy geometry/anchors are the root problem.
5A2c production-parity fixture traversal: complete — 11 events each direction.
5A3 physical mirror proof: complete — 11/11 paired.

Segment 5A is complete as the traversal research/proof stage.

## Next

Segment 5B: create a versioned official Avtodor M-12 tariff/RVP snapshot and a road-specific pricing core. Official tariff evidence must be separated from OSM traversal evidence. No production integration until pricing assertions are green.
