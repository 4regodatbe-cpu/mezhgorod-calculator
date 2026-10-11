# M-4 sandbox reassessment against the original vector-price concept — 2026-10-11

Repository: 4regodatbe-cpu/mezhgorod-calculator
Branch: experiment/toll-od-matrix-2026-10-08
Scope of review: isolated M-4 algorithm, its tariff data contract, current calculator integration and project handoff. No code/runtime or Production change was made in this review block.

## Product concept restated

For one fastest selected route that traverses a continuous M-4 corridor, detect the exact ordered PVP sequence actually crossed. The sequence identifies a reusable price block. Each block exposes exactly two fare values to the runtime: Mon–Thu and Fri–Sun, for the fixed passenger-car / category-I / no-transponder profile. Those values are prepared ahead of time from the applicable PVP charge rows; runtime performs one exact sequence lookup and returns one of the two values. Runtime must not add individual PVP tariffs.

No exhaustive ramp/entry/exit OD table is needed for this M-4 use case. Route geometry is still necessary to determine which PVP vector applies and ensure the sequence belongs to the selected route. A different start/exit that crosses a different vector uses a different cell. An extra PVP (e.g. 1046) cannot reuse a shorter vector's cell. If evidence or a matching cell is missing, price is unknown, not a partial sum or zero.

## Audit findings

### Already aligned in the isolated algorithm

- `m4-pvp-evidence-adapter.mjs` takes strict same-route matched PVP events, orders them by progress and checks direction/continuity.
- `m4-pvp-corridor.mjs` keys by the exact ordered sequence and selects one stored period value; it does not sum PVP fares at quote time.
- The tests already prohibit reusing a three-PVP fare when an extra PVP is present, and prohibit treating a skipped intermediate gate as the same vector.
- `m4-pvp-compiler.mjs` sums its documented per-PVP charge ledger when building a matrix cell offline. That is the intended place for aggregation; the runtime cell contains two aggregate prices.

### Mismatches / unfinished work

1. `matrix/m4-pvp-corridors.json` has `priceCells: []`. Thus the vector lookup is implemented but cannot return an M-4 fare.
2. The customer-facing route path still calls `calculateProductionM4` → `calculateM4Core` → `priceM4RoutePlazaValidation`, which sums independently confirmed PVP rows during a request. The vector lookup remains diagnostic/shadow and has not replaced that amount. This is the key reason the wrong 1,000/1,430 values can still appear.
3. Current saved per-PVP rows and the user's Yandex controls do not agree. User-reported benchmarks for 2026-10-11 are: vector [1223,1184] = 700/850 ₽; vector [1223,1184,1093] = 850/1,000 ₽. The saved legacy rows produce 850/1,160 ₽ for [1223,1184] and 1,000/1,430 ₽ for [1223,1184,1093]. These are incompatible source snapshots/semantics until reconciled; do not silently choose either set.
4. The experimental compiler additionally requires an independent official whole-corridor total to equal the per-PVP ledger. Retain this as a valuable cross-check when available, but it must not be confused with needing an OD/ramp price table. The source protocol should distinguish primary per-PVP tariff inputs from independent route-level/Yandex controls.
5. The branch documentation accurately says M-4 ramp enumeration is deferred, but stale task/backlog language still mentions ramp pairs and describes the matrix as an official complete-corridor tariff catalog. Future work should consistently say exact PVP vector, precomputed pair of period prices and no runtime sum.
6. The branch contains a V2 diagnostic-shadow UI/API integration while preserving its old monetary path. User reiterates that V2 is to remain untouched while this algorithm is developed in the separate sandbox. Do not expand that integration; before any further preview/integration, isolate/remove V2-specific experimental edits or prove they are already outside the intended V2 code path. Production/main were not changed by this review.

## Updated implementation order

1. Keep the M-4 work in the separate sandbox; make the vector model the only target and remove contradictory ramp-to-ramp M-4 tasks.
2. Reconcile the date/profile for the user's two-/three-PVP examples against the exact fastest Yandex route and current operator rate rows. Record each amount's provenance/date and the exact vector.
3. Add only price cells whose vector sequence is confirmed on a selected route and whose two period totals are independently checked. A vector including PVP 1046 is a separate row and must not inherit the three-PVP fare.
4. Add explicit regression fixtures for the reported examples (700/850 and 850/1,000) and for missing/extra-PVP vectors; keep source provenance synthetic/user-reported until independently confirmed.
5. Switch the isolated V3 route result to exact vector lookup only after a matching price cell exists; otherwise surface unknown. Do not use per-PVP additive legacy money as the new algorithm's answer.
6. Run the full experiment tests, build and browser route checks against a short vector, the reported three-PVP vector and a longer vector. Verify that only one fastest route is shown and the toll result uses that same geometry.
7. Leave V2, main and Production unchanged pending a separately authorized release decision.

## Verification record

This was a repository/code review based on branch files: `START_HERE.md`, `DECISIONS.md`, `m4-pvp-corridor.mjs`, its tests, `m4-pvp-evidence-adapter.mjs`, the offline compiler/tests, the empty matrix and `NEXT_STEPS.md`, plus the V3 route-pricing path previously inspected. The branch already records 165/165 native experiment checks in an earlier Vercel build. This review did not run tests/build, recalculate Yandex routes or fetch new operator tariff receipts. No claim is made that the amounts are independently verified or that code behavior changed.
