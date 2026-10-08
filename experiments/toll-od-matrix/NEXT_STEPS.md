# Toll OD/PVP experiment — execution backlog and resume instructions

Updated 2026-10-09. This file is the **actionable queue**, not a list of completed claims.
Read `AGENTS.md`, `docs/WORK_STATE.md`, `README.md`, `DECISIONS.md` and `WORK_LOG.md` before proceeding.

## Project boundaries

Repository `4regodatbe-cpu/mezhgorod-calculator`, branch `experiment/toll-od-matrix-2026-10-08`.
Active M-4 prototype: `m4-pvp-corridor.mjs`, `m4-pvp-evidence-adapter.mjs`, `matrix/m4-pvp-corridors.json`; backup originals under `sources/`.
Old M-11 and ramp-based experiments remain untouched. No M4 full-price tariff entries yet.

## Execution queue

- [x] **P0 — tariff source compiler code (DONE, not source-populated)**: `m4-pvp-compiler.mjs` and empty `matrix/m4-verified-source-intake.json` added. Validates official document fields, same-route/whole-corridor evidence, charge ledger vs independent operator total, directional 339/355, 545 and mixed zones; produces offline matrix only. 14 synchronous function assertions passed; Node file tests not yet run.
- [x] **P0 — versioned price code (DONE)**: Nonoverlapping time intervals supported; same-signature overlap rejected; corrected date-regex escape in commit `7ae532c`. 4 new Node versioning scenarios authored, not yet run.
- [ ] **P0 — execute exact Node tests (BLOCKED / NOT RUN)**: `node --test experiments/toll-od-matrix/engine.test.mjs experiments/toll-od-matrix/od-geometry.test.mjs experiments/toll-od-matrix/od-sandbox-quote.test.mjs experiments/toll-od-matrix/m4-pvp-corridor.test.mjs experiments/toll-od-matrix/m4-pvp-evidence-adapter.test.mjs experiments/toll-od-matrix/m4-pvp-compiler.test.mjs`. Record actual pass/fail and fix any failures before claiming them.
- [ ] **P1 — official operator tariff verification (IN PROGRESS)**: Official 27.02.2026 note provides 5 040 ₽ full Moscow→Krasnodar weekday control effective 02.03.2026 (source recorded in `SOURCE_RESEARCH_2026-10-09.md`); exact PVP sequence and full directed pair tariff still unverified, so **0 cells added**. Acquire independently verified current operator complete-corridor fare(s) tied to exact same PVP sequence, direction, date and payment scheme. Populate `matrix/m4-verified-source-intake.json` only after strict acceptance protocol.
- [ ] **P1 — actual geometry parity**: Independently verify paid road edge/node identities, contiguous M-4 passage, booth crossing order and same selected route; validate bidirectional test routes. No mere proximity inference.
- [ ] **P1 — calendar**: Ensure tariff period takes the real traversal date/time in Moscow timezone, including official holidays and advance-day rules; unknown date rules remain unknown.
- [ ] **P2 — compare against baseline**: Run same-route golden regressions against current M-4 engine and trusted operator source; record mismatches rather than adjust prices blindly.
- [ ] **P2 — integration only after approval**: Preserve current fallback and total multi-road composition; gate PR, preview, production separately. Never publish from the experimental branch by default.

## Development checkpoints
- Create a dated entry in `WORK_LOG.md` for the completed implementation, failing attempts and tests.
- In the same branch refresh the top of `docs/WORK_STATE.md` and this checklist.
- Record actual `git`/GitHub commit SHA and observed test evidence. Distinguish authored tests from executed tests.
- Before editing check branch head for concurrent changes; do not force-update or clobber an unrelated developer.
