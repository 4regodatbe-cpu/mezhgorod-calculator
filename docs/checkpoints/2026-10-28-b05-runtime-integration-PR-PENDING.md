# B05 runtime integration — PR verification checkpoint

Base: `229097474a4fdded682d2ab4daf4221e026f11b6`; branch: `fix/v3-missing-route-prices-2026-10-15`; PR #14 remains Draft.

## Implementation contract

- V3 keeps raw map-matched edges private in a `WeakMap`, bound to the exact `TollValidation` object and route signature. Raw trace data is not added to the API/validation DTO.
- The accepted northbound M4-545 working component requires the retained directed gate + successor witness and a complete trace.
- The component is split from an existing M4 endpoint quote only when its product vector contains `m4-545-a` and `m4-545-b` exactly once, in order, and the matrix and working quote use the same tariff period. No additive 320/410 ₽ is applied to the old aggregate.
- Missing, partial, duplicate, reversed or inconsistent coverage leaves complete M4/API price `unknown/null`; the accepted component remains diagnostic. Other unknown road products continue to block the route total.
- Tariffs, route selection, Production and other APIs are unchanged. No B01–B09 sources/captures or broad route corpus were repeated.

## Evidence before PR update

- Saved Taman→Voronezh trace replay used 8 archived chunks, no provider calls: Thursday M4-545 component 320 ₽; the remaining M4 vector is unknown, and public projection is `unknown/null`.
- Saturday component 410 ₽ and exact 650/830 → (330/420) + (320/410) non-duplicating split are covered by focused tests.
- Five focused B05 test files PASS; `tsc --noEmit`, scoped ESLint (0 warnings) and `git diff --check` PASS.
- Local full `test:audit` was 161/164; the 3 previously identified `spawnSync` EPERM tests are environment-limited. Local Node 24.19.0 `next build` hit sandbox EPERM while creating/binding a child process. The associated GitHub-hosted PR run is the verification authority for these gates.

## One authorized PR run

The current classifier treats these runtime files as `route-runtime-changed`; the owner authorized one ordinary PR update and its normal `live_probe` and `calculation_timing` jobs. No classifier/workflow exception is added. This checkpoint is created with the source commit; its final gate state is exactly the GitHub Actions run associated with that commit SHA. Do not publish another commit or rerun any jobs without authorization. On any failed application/test gate, keep the branch Draft and Production unchanged.
