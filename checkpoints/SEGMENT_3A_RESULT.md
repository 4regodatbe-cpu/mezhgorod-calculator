# Segment 3A — RESULT

Date: 2026-09-30
Workflow run: `36679986139`
Artifact: `valhalla-hard-tolls-probe`, id `11081306622`
Result: capability measured successfully.

## Public Valhalla probe — Moscow → Krasnodar

- fast (`use_tolls:1`): HTTP 200, 1347.330 km, no warnings;
- avoid preference (`use_tolls:0`): HTTP 200, 1631.244 km, no warnings;
- hard-exclusion request (`exclude_tolls:true`): HTTP 200, 1649.104 km, warning code 208:
  `Hard exclusions are not allowed on this server, ignoring hard excludes`.

## Decision

`exclude_tolls:true` MUST NOT be used as proof of a toll-free route on `valhalla1.openstreetmap.de`. The concrete public server explicitly states that hard exclusions are disabled.

The surprising hard-exclusion route length difference does not override the explicit server warning; its semantics are not reliable enough for a truth guarantee.

## Consequence for Segment 3B

- Valhalla `use_tolls:0` and BRouter avoid-toll output remain candidate generators only.
- A candidate may be labelled confirmed free only after independent validation returns `status=free` with complete coverage.
- `status=unknown` becomes an explicit unverified candidate state.
- candidates with confirmed toll are rejected as free alternatives.
- if no candidate can be trusted, the API/UI must say so rather than using `0 ₽`/“без платных дорог” as a guarantee.
