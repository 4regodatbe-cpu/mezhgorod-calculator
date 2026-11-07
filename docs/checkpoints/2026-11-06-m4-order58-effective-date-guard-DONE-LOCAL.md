# M‑4 Order 58 effective-date guard (DONE LOCAL)

**Date:** 2026-11-06 UTC. **No push/publication.**

Review of the Stage X Category I source found a date-coverage defect: Order 58 is effective starting 2026-03-02, but `m4TariffPeriodAt` previously returned a 2026 weekday/weekend profile for January and 2026-03-01. Those dates are outside this saved tariff's validity, and no older schedule was available in this bounded task. The safe result is `unknown`, not applying Order 58 early.

Added a lower-bound check in `experiments/toll-od-matrix/m4-fare-calendar-2026.mjs`: Moscow-local travel dates before `2026-03-02` now return `unknown/tariff_not_effective_on_travel_date`. The effective date itself still resolves its weekday profile; unsupported 2027 dates remain unknown. No rates, other-road rules, route geometry or route selection changed.

Regression: `experiments/nationwide-tolls/m4-effective-date-boundary.test.mjs` checks January, the instant before effective date, and the first effective date. `node --test` PASS; `node --check` and `git diff --check` PASS. The broader exact results and sandbox limitations are in the [Stage Y report](../../experiments/nationwide-tolls/checks/2026-11-06-stage-y-final-gate/README.md).
