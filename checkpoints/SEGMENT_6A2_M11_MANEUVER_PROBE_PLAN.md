# Segment 6A2 — M-11 Valhalla maneuver evidence probe plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DIAGNOSTIC ONLY
Production `main`: unchanged.

## Goal

Determine whether the same Valhalla `/route` response already used by the production fast-route request contains enough ordered maneuver evidence to derive strict M-11 traversal boundaries without adding a second full-route request in production.

No M-11 pricing changes are allowed in 6A2.

## Questions to answer

1. Are M-11 maneuvers consistently named as `М-11` / `M-11` in `street_names` or `begin_street_names`?
2. Do matching maneuvers carry stable `begin_shape_index` / `end_shape_index` values?
3. Can consecutive matching maneuvers be grouped into one or more ordered continuous M-11 spans?
4. Can exit/re-entry be detected instead of collapsing all M-11 evidence into one global min/max envelope?
5. Do the resulting route-relative boundaries correspond plausibly to the 15–58, 58–679 and 679–684/Pulkovo tariff systems?
6. Does the evidence work in both directions?
7. Does the same approach remain observable on the mixed Sochi→Saint-Petersburg route without disturbing M-4 evidence?

## Probe corpus

Group A:

- Moscow → Saint Petersburg;
- Saint Petersburg → Moscow;
- Moscow → Tver.

Group B:

- Tver → Saint Petersburg;
- Solnechnogorsk → Saint Petersburg;
- Sochi → Saint Petersburg.

The fixed endpoints are the same control coordinates used in Segment 6A1.

## Method

A standalone Node diagnostic script will call the same public endpoint and equivalent request shape used by `app/api/v2/calculate/route.ts`:

- `https://valhalla1.openstreetmap.de/route`;
- costing `auto`;
- `use_tolls=1`;
- `shape_format=polyline6`;
- Russian maneuver directions enabled.

For every response it will:

1. decode each leg shape;
2. calculate cumulative route distance for shape indices;
3. print every maneuver whose names strictly match M-11;
4. print one neighboring maneuver before and after each M-11 block;
5. group adjacent/overlapping matching maneuvers into ordered spans;
6. record route-relative begin/end km and boundary coordinates;
7. retain separate spans rather than a single min/max envelope.

## Evidence semantics

- A name match is route/maneuver evidence, not tariff evidence by itself.
- Proximity to an official tariff point does not automatically prove that exact entry/exit pair.
- Any missing/malformed indices make that maneuver unusable for exact boundary proof.
- Gaps between M-11 blocks must be preserved, not silently bridged.
- 6A2 can establish that a future production parser is feasible; it cannot establish the monetary tariff without 6A3 official tariff-point mapping.

## Runtime safety

- standalone diagnostic files only;
- no modification to `app/api/v2/calculate`, `lib/tolls.ts`, verified-route data, M-4 or M-12;
- two small workflow jobs;
- each job timeout <=20 minutes;
- per Valhalla request timeout 30 seconds;
- no paid API and no API key.

## Success criteria

6A2 is successful if the probe shows, for the control routes, enough deterministic ordered maneuver/index evidence to define route-relative M-11 spans from the already existing `/route` response.

If names/indices are inconsistent or ambiguous, record the limitation and do not add an M-11 production parser based on this evidence alone.

## Next after 6A2

If the evidence is sufficient, implement only a pure `m11-valhalla-span` parser with deterministic fixtures/tests, then proceed to versioned official tariff-point/matrix data (6A3). Pricing integration remains out of scope until both layers are proven.
