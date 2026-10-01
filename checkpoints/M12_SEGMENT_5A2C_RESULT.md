# M-12 Segment 5A2c — result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5A2c M12 parity fixture`
- run id: `36756312249`
- head: `87e28cc84a289636e0a7028c2c6318cdf7c60fba`
- artifact id: `11117325186`
- result: success
- diagnostic wall time: `844 ms`
- Overpass requests: `0`

## Frozen input

The diagnostic uses `data/fixtures/m12-osm-5a2-limited.json`:

- 68 deduplicated objects;
- provenance: successful 5A2 run `36728141365`, artifact `11102648908`;
- deliberately LIMITED: objects within 5 km of at least one successful-5A2 route only;
- not an authoritative M-12 coverage/tariff database.

## Production-parity route result

Москва → Казань:

- Valhalla: `820.2 km`
- route points: `6195`
- eligible non-Platon free-flow gantries: `22`
- physical chainage clusters: `11`
- excluded near-route objects: `12`

Казань → Москва:

- Valhalla: `821.4 km`
- route points: `6131`
- eligible non-Platon free-flow gantries: `22`
- physical chainage clusters: `11`
- excluded near-route objects: `10`

Bidirectional route-corridor parity:

- forward → reverse median: `0.103 km`, p95: `0.569 km`, max: `1.431 km`
- reverse → forward median: `0.094 km`, p95: `0.537 km`, max: `1.563 km`

Coverage assessment: `informative_limited_fixture`.

## Confirmed conclusions

1. Segment 5A2b's red result was an Overpass acquisition failure, not a Valhalla/traversal failure.
2. Exact production fast-route semantics (`use_tolls=1`) produce the same M-12 corridor in both directions within sub-kilometre p95 carriageway differences.
3. After excluding Platon/HGV and physical toll booths, the frozen fixture produces exactly 11 gantry clusters in each direction.
4. Raw OSM node identity is not the correct invariant; the next invariant is physical-event identity/order by geographic cluster.
5. Overpass is no longer needed in the critical path of the next diagnostic.

## Next

Segment 5A3: pair forward events with reverse events by physical geographic cluster, require mirrored order and bounded normalized-chainage residual. Do not calculate toll money yet.
