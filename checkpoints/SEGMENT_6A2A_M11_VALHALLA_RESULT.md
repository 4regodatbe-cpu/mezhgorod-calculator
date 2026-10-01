# Segment 6A2A — M-11 Valhalla maneuver evidence result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PARTIAL SUCCESS / METHOD LIMIT IDENTIFIED
Production `main`: unchanged.

## Run

Workflow: `Segment 6A2 M11 maneuver evidence probe`
Run: `36785334603`
Head: `46bb690c54c4820f37c5b145ac6a7238d5fdb1fa`

- group A: SUCCESS;
- group B: intentionally not rerun after a deterministic provider limit was identified.

The failure was not a parser/code failure. Public Valhalla rejected the long Sochi→Saint-Petersburg request with:

`400 / error_code 154 / Path distance exceeds the max distance limit: 1500000 meters`.

Per project rules the same attempt is not repeated unchanged.

## Evidence obtained

### Moscow → Saint Petersburg

Valhalla route: 710.287 km / 410 min.

Strict M-11 evidence:

- 1 continuous M-11 block;
- 7 consecutive M-11 maneuvers;
- 0 malformed M-11 maneuvers;
- route-relative block: 19.831 → 692.925 km;
- block length: 673.094 km;
- start coordinate: `[37.467541, 55.883302]`;
- end coordinate: `[30.283506, 59.832743]`;
- preceding maneuver is an E22 exit instruction toward M-11/A-104;
- following maneuver exits toward ZSD.

All matching maneuvers had valid `begin_shape_index` / `end_shape_index`.

### Saint Petersburg → Moscow

Valhalla route: 718.340 km / 416 min.

Strict M-11 evidence:

- 1 continuous block;
- 4 consecutive M-11 maneuvers;
- 0 malformed;
- route-relative block: 27.611 → 697.523 km;
- start coordinate: `[30.310918, 59.816499]`;
- end coordinate: `[37.481044, 55.885579]`;
- preceding maneuver is A-118/KAD;
- following maneuver leaves toward Bibliotechnyy proezd/Businovo.

This confirms the same evidence model works in reverse, although maneuver subdivision is direction-dependent and therefore must not itself be treated as tariff-point segmentation.

### Moscow → Tver

Valhalla route: 181.389 km / 152 min.

Strict M-11 evidence:

- 1 continuous block;
- 5 consecutive M-11 maneuvers;
- 0 malformed;
- route-relative block: 19.831 → 152.931 km;
- following maneuver leaves M-11 to M-10 toward Tver.

This is direct evidence that a partial M-11 trip can expose its actual exit boundary rather than requiring a Moscow↔Saint-Petersburg city-pair assumption.

### Tver → Saint Petersburg

Valhalla route: 540.013 km / 293 min.

Strict M-11 evidence before the later group-B provider-limit failure:

- 1 continuous block;
- 2 consecutive M-11 maneuvers;
- 0 malformed;
- route-relative block: 11.969 → 522.836 km;
- preceding maneuver is an entry ramp;
- following maneuver exits toward ZSD.

### Solnechnogorsk → Saint Petersburg

Valhalla route: 642.911 km / 342 min.

Strict M-11 evidence:

- 1 continuous block;
- 4 consecutive M-11 maneuvers;
- 0 malformed;
- route-relative block: 4.688 → 625.613 km;
- preceding maneuver is local road 46K-0011;
- following maneuver exits toward ZSD.

## What is proven

For M-11 routes within the public Valhalla distance limit, the existing production-style `/route` response contains strong ordered road evidence:

- road names/refs identify M-11 consistently;
- shape indices are valid on all observed matching maneuvers;
- consecutive maneuver grouping can preserve separate blocks rather than a global min/max envelope;
- partial routes expose real entry/exit boundaries;
- both directions work;
- no second full-route request is needed for these routes.

This is sufficient to justify a future pure M-11 span parser for Valhalla-backed fast routes.

## What is NOT proven

1. Individual Valhalla maneuver boundaries are not tariff-point boundaries. The number and placement of maneuvers differ by direction.
2. Exact 15–58 / 58–679 / 679–684 pricing still requires mapping official tariff points against the route geometry.
3. Long mixed routes such as Sochi↔Saint-Petersburg cannot rely on a full-route public Valhalla response because of the 1,500 km server limit.
4. Therefore a Valhalla-only M-11 production engine would leave an important mixed-route blind spot.

## Revised next step — Segment 6A2B

Probe the already-existing OSRM fast-route provider with `steps=true`.

The production calculator already calls OSRM for every leg, including long routes when Valhalla fails. If OSRM step `name`/`ref` plus step geometry can identify ordered M-11 blocks, production can later request this metadata in the same OSRM call rather than adding another network request.

Controls:

- Moscow → Saint Petersburg, as cross-provider comparison;
- Sochi → Saint Petersburg;
- Saint Petersburg → Sochi.

No user pricing change is allowed in 6A2B.
