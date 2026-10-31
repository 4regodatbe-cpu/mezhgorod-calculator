# AUD-DATA-01 technical freshness gate — DONE

- Status: DONE; parent `a2d592a29bc83d1653a80bb838ac97aec77dab03`; allowed branch only; PR #14 Draft.
- Removed the frozen `TARIFF_AS_OF: 2026-10-02` from `.github/workflows/calculator-final-gate.yml`; the strict gate now uses its actual UTC run date by default. `TARIFF_AS_OF` remains a supported deterministic override.
- Refactored `scripts/check-tariff-freshness.mjs` into testable date resolution, row parsing, and evaluation functions. Calendar dates are validated strictly. Effective-date provenance is emitted separately as `KNOWN`, `UNKNOWN`, or `INVALID`; null dates remain null. Strict mode still fails on stale snapshots and now also fails invalid observation/effective dates. `UNKNOWN` remains separately counted and is not assigned a guessed date.
- Added `scripts/check-tariff-freshness.test.mjs`: fixed-clock/default and override behavior; invalid calendar override; three `UNKNOWN` rows; stale, malformed observation, and malformed effective-date failures. Focused test command PASS.
- Runtime checks: without override at current CI date 2026-10-26, 4 snapshots, stale0, invalid0, effectiveDateUnknown3; fixed override 2026-10-02, stale0, invalid0, unknown3. Both strict invocations exited 0. `git diff --check` PASS.
- No registry values, `effectiveFrom`, tariff amounts, or business rules changed. Broad project audit/build/Actions was not run; commit uses `[skip ci]` because the cumulative PR filter can trigger unrelated live audits. This records local focused verification, not hosted CI.
- Next: independently document the exact primary evidence required for the three unknown-date tariff rows; do not edit those rows without evidence.
