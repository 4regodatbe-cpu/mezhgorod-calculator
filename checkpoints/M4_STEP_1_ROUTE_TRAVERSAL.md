# M4 Step 1 — route_traversal evidence

Date: 2026-09-29

Status: code changes complete; verify Vercel build before Step 2.

## Done

- Added `route_traversal` to `PlazaNodeVerification`.
- PVP 803 moved from `spatial_local` to `route_traversal`.
  - northbound OSM node: `75715767`
  - southbound OSM node: `11838757138`
  - evidence: live Valhalla traversal in both directions + official Avtodor PVP 803 evidence.
- PVP 911 moved from `spatial_local` to `route_traversal`.
  - northbound OSM node: `11838466120`
  - southbound OSM node: `11838466121`
  - evidence: live Valhalla traversal in both directions + official Avtodor PVP 911 evidence.
- In `m4-local-pricing.ts`, `route_traversal` is ranked together with `operator_local` as confidence rank 2, so a fully resolved route containing these PVPs can report `medium` confidence instead of `low`.

## Commits

- `c647e6ffa6acc36572cdac86a15e89b80b5b609b` — classify PVP 803/911 as `route_traversal`.
- `41cd39253e21ad5aa38acdfe89c0ed1d1a580f85` — rank `route_traversal` as medium confidence in local M4 pricing.

## Next step

Step 2 only: add hard regression assertions for the already verified 10 directions. Do not integrate the new M4 engine into production V2 yet.

Before starting Step 2, confirm Vercel build for `41cd39253e21ad5aa38acdfe89c0ed1d1a580f85` is successful. At checkpoint creation the Vercel status was still `pending`.
