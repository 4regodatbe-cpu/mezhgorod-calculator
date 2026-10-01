# M-12 Segment 5B2B-1 — Valhalla maneuver-span probe result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5B2B-1 M12 maneuver span probe`
- run id: `36762495689`
- head: `3b433b75699732f24f15094eaeb725ab392180bb`
- artifact id: `11119048166`
- result: success
- timeout bound: 10 minutes

## Result

Moscow -> Kazan:
- route: `820.243 km`;
- maneuvers: `29`;
- strict M-12-labeled maneuvers: `3`;
- derived strict M-12 span: `169.905–751.981 km` route chainage.

Kazan -> Moscow:
- route: `821.351 km`;
- maneuvers: `31`;
- strict M-12-labeled maneuvers: `3`;
- derived strict M-12 span: `66.743–649.096 km` route chainage.

Mirror proof:
- normalized span-boundary maximum residual: `0.001477` (~0.15% of route length);
- capability: `promising`;
- Overpass requests: `0`;
- `trace_attributes` requests: `0`.

## Conclusions

1. The normal public Valhalla `/route` response can expose usable M-12 road identity through maneuver names and shape indexes.
2. A broad M-12 contiguous span can be derived without a second full-route map-matching call.
3. Forward/reverse span boundaries are strongly mirrored on the Moscow↔Kazan control.
4. One full-route pair is not enough to promote the method into pricing; partial-entry/exit routes must be tested next.
5. `/api/v2/calculate` remains unchanged.

## Next

Segment 5B2B-2: extract the maneuver-span logic into a reusable diagnostic helper and validate it on partial M-12 routes that start/end near different official RVP regions. Require stable road labeling, valid shape indexes, plausible span boundaries, and reverse-direction consistency before any pricing integration.
