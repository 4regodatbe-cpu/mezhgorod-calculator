# Toll OD/PVP experiment — execution backlog and resume instructions

Updated 2026-10-09. This file is the **actionable queue**, not a list of completed claims.
Read `AGENTS.md`, `docs/WORK_STATE.md`, `README.md`, `DECISIONS.md` and `WORK_LOG.md` before proceeding.

## Project boundaries

Repository `4regodatbe-cpu/mezhgorod-calculator`, branch `experiment/toll-od-matrix-2026-10-08`.
Active M-4 prototype: `m4-pvp-corridor.mjs`, `m4-pvp-evidence-adapter.mjs`, `matrix/m4-pvp-corridors.json`; backup originals under `sources/`.
Old M-11 and ramp-based experiments remain untouched. No M4 full-price tariff entries yet.

## Execution queue

- [ ] **P0 — tariff source compiler**: Build offline input validation and compaction of independently verified complete M-4 PVP corridor tariff records; preserve source URL/document, category, payment scheme, effective date range, directional exact event sequence, and mixed-zone conditions. Reject missing/overlapping/ambiguous evidence; do not infer from partial PVP charges.
- [ ] **P0 — regression and versioning**: Support nonoverlapping successive tariff effective dates for a single directional corridor; reject overlapping versions; test weekday/weekend, direction, missing or extra PVP, 339/355, 545, mixed zones, date boundary. Run Node tests and record exact results.
- [ ] **P1 — official operator tariff verification**: Acquire real verified current complete-corridor tariff documentation; save exact provenance and acceptance evidence (matching PVP sequence, date, category). Only then allow a cell into `matrix/m4-pvp-corridors.json`.
- [ ] **P1 — actual geometry parity**: Independently verify paid road edge/node identities, contiguous M-4 passage, booth crossing order and same selected route; validate bidirectional test routes. No mere proximity inference.
- [ ] **P1 — calendar**: Ensure tariff period takes the real traversal date/time in Moscow timezone, including official holidays and advance-day rules; unknown date rules remain unknown.
- [ ] **P2 — compare against baseline**: Run same-route golden regressions against current M-4 engine and trusted operator source; record mismatches rather than adjust prices blindly.
- [ ] **P2 — integration only after approval**: Preserve current fallback and total multi-road composition; gate PR, preview, production separately. Never publish from the experimental branch by default.

## Development checkpoints
- Create a dated entry in `WORK_LOG.md` for the completed implementation, failing attempts and tests.
- In the same branch refresh the top of `docs/WORK_STATE.md` and this checklist.
- Record actual `git`/GitHub commit SHA and observed test evidence. Distinguish authored tests from executed tests.
- Before editing check branch head for concurrent changes; do not force-update or clobber an unrelated developer.
