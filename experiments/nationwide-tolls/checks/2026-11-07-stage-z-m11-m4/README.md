# Stage Z — M‑11 15–58 current tariff integration

Status: local implementation block complete; broader combined acceptance is still in progress. Candidate branch `codex/stage-z-stabilization`, based on Stage Z candidate `0dc9560450128f73590c6ca521ef5f176bb62db1`; no push, merge, Preview, Production, main, Android or V2 change. PR #14 remains Draft.

## What changed

- Added the verified current official Category I/no-transponder M‑11 15–58 matrix at `data/tolls/m11/2026-11-02-15-58-category1-no-transponder.json`. SHA-256: `b801eb896b4a29848e49164498d4b25041adda54950dbb708c1c23185c519279`. The source PDF is the operator's Appendix 3, URL and document code recorded in the JSON; PDF SHA from source manifest: `543bf97c5ab7900897440c3432b735db86e5707b21417f3f8e35b3a8764bc835`.
- Updated `experiments/nationwide-tolls/engine/m11-head-route-adapter.mjs` to select between the existing April 24 edition and November 2 edition by exact instant, then choose an exact directed `from → to` matrix cell and one of night/Mon–Thu/Fri/Sat/Sun profiles. No nearest-point fallback. The April source file and all previous matrix values are unchanged; M‑11 58–679's register and adapter are unchanged.
- Added `m11-head-route-adapter.test.mjs`: complete matrix metadata and 210 cells; exact `2026-11-02 01:00 MSK` effective boundary; all five profiles and Nov 3/4 special profiles; forward/reverse differences; unsupported `p214 → p58` and missing/same point unknown; prior effective lower bound; unbounded future year unknown; explicit departure-time estimate limitation.
- Extended M‑11 composition regressions to assert the separately identified head/mainline products compose once and duplicate head or overlapping legacy M‑11 aggregate fail closed.

## Current model limitation

M‑11 closed-system rules set the actual tariff using the exit-PVP passage time. Current V3 freezes tariff estimates at trip departure and no independently validated exit-time predictor was found. This implementation preserves that existing behavior and explicitly labels the amount as an estimate by departure profile; it does not claim the operator's exact eventual charge. Profile calendar uses the operator's 01:00 tariff-day boundary. At `2026-11-02T00:59:59+03:00`, the applicable estimator edition is still April (tariff day Nov 1, Sunday profile); at `01:00:00` and `01:00:01`, the new November edition/night profile applies. Unsupported/unresolvable direction or physical tariff point remains `null`.

## Control outputs

| Directed pair / departure | Edition/profile | M‑11 15–58 estimate | Result |
|---|---|---:|---|
| Moscow → Solnechnogorsk, 2026‑11‑02 00:59:59 MSK | April / Sun | 1,260 ₽ | historical cell retained |
| Moscow → Solnechnogorsk, 2026‑11‑02 01:00:00 MSK | Nov 2 / night | 850 ₽ | current edition boundary |
| Moscow → Solnechnogorsk, 2026‑11‑02 01:00:01 MSK | Nov 2 / night | 850 ₽ | boundary +1 s |
| Moscow → Solnechnogorsk, 2026‑11‑03 12:00 MSK | Nov / special Friday | 1,500 ₽ | special profile |
| Moscow → Solnechnogorsk, 2026‑11‑04 12:00 MSK | Nov / special Saturday | 1,500 ₽ | special profile |
| Solnechnogorsk → Moscow, 2026‑11‑06 12:00 MSK | Nov / Friday | 1,260 ₽ | reverse directed cell |
| P214 → P58, 2026‑11‑06 12:00 MSK | no published tariff point pair | `null` | unsupported mapping stays unknown |

For an unchanged cell, Moscow → Solnechnogorsk on 2026‑11‑05 Mon–Thu remains 1,130 ₽, the same value as the April matrix. No M‑4, M‑12 or CKAD tariff is added by this block.

## Verification so far

- All 6 handoff source/evidence checks pass: source hashes; 42 directed pairs / 210 cells / 60 changed cells; M‑4 PVP545 geometry with 0 tariff assignments; saved M‑4 route remains `fare=null`; M‑12 labels are not auto-matched; redacted OSM hashes pass.
- New M‑11 head adapter tests: **6/6 PASS**.
- Saved selected-route M‑11 geometry/boundary tests: **7/7 PASS**.
- Existing M‑11/CKAD route adapter suites (M‑11 independent sections plus duplicate/overlap guard): **2/2 PASS**.
- `git diff --check` passes for the code/data block before this report commit.
- M‑4 runtime/data were not edited. The dedicated M‑4 62/71, selected-trace, A‑289/API contract suite and general TypeScript/ESLint/Webpack/full offline gate remain pending and must be recorded separately. No browser/Production check is repeated.

See also [handoff evidence checkpoint](../../../../docs/checkpoints/2026-11-07-stage-z-handoff-evidence-DONE.md), [M‑11 implementation checkpoint](../../../../docs/checkpoints/2026-11-07-stage-z-m11-head-DONE.md), and the current [NEXT_STEPS](../../NEXT_STEPS.md). Final bundle and verification status will be recorded after the remaining gates.
