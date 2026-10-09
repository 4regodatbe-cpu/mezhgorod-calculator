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
- [x] **P0 — execute exact full Node suite (DONE IN VERCEL PREVIEW BUILD: 165/165 native Node checks PASS, 0 FAIL at commit 2b64461)**: `node --test experiments/toll-od-matrix/engine.test.mjs experiments/toll-od-matrix/od-geometry.test.mjs experiments/toll-od-matrix/od-sandbox-quote.test.mjs experiments/toll-od-matrix/m4-pvp-corridor.test.mjs experiments/toll-od-matrix/m4-pvp-evidence-adapter.test.mjs experiments/toll-od-matrix/m4-pvp-compiler.test.mjs`. Also include newly added `m4-fare-calendar-2026.test.mjs`, `m4-pvp-timed-quote.test.mjs`, and `m4-mixed-time-policy.test.mjs`. Recommended all-source command: `node --test experiments/toll-od-matrix/*.test.mjs`. Actual Vercel build logs (deployment dpl_4xj5wm9mLPY3QkYtkd4FAyVeZAxx) confirm 165/165 PASS; Next compile, TypeScript and prerender also PASS.
- [ ] **P1 — official operator tariff verification (IN PROGRESS: exact current M-4 PDF link now identified, body HTTP 403)**: Official 27.02.2026 note provides 5 040 ₽ full Moscow→Krasnodar weekday control effective 02.03.2026 (source recorded in `SOURCE_RESEARCH_2026-10-09.md`); exact PVP sequence and full directed pair tariff still unverified, so **0 cells added**. Official PDF link now identified: https://avtodor-tr.ru/upload/iblock/a2d/9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf (content inaccessible; see `inventory/m4-operator-source-discovery.json`). Acquire independently verified current operator complete-corridor fare(s) tied to exact same PVP sequence, direction, date and payment scheme. Populate `matrix/m4-verified-source-intake.json` only after strict acceptance protocol.
- [ ] **P1 — actual geometry parity**: Independently verify paid road edge/node identities, contiguous M-4 passage, booth crossing order and same selected route; validate bidirectional test routes. No mere proximity inference.
- [x] **P1 — 2026 calendar proof-of-concept (DONE ONLY IN SANDBOX)**: `m4-fare-calendar-2026.mjs` + `m4-pvp-timed-quote.mjs` use Moscow timezone, official 2026 weekday exceptions and per-PVP timestamps. Fail-closed for holiday/weekday transitions, missing timestamps, unknown 2027+ schedules and effective-version crossing. **Not** integrated into route ETA; not tested with live selected-route geometry.
- [x] **P1 — mixed-zone conservative policy (DONE ONLY IN SANDBOX)**: `m4-mixed-time-policy.mjs` derives 401–464 <=12h, >=12h+ overcharge context; 633–672 conflicting official rules => <=60min known within, >120min known over, 60–120min unknown. See `SOURCE_RESEARCH_2026-10-09.md`.
- [ ] **P1 — reconcile official 60 vs 120 minute rule (OPEN)**: Obtain dated/current signed or dated operator document and authoritative tariff-effective date for 633–672. Two active operator pages disagree. Do not guess at 61–120 minutes.
- [ ] **P1 — same-route PVP event timestamps (OPEN)**: Derive gate passage timestamps from the chosen route, drive departure in Moscow timezone and verified route leg progress; don't synthesize an unsupported precision or use timestamp from unrelated route geometry.
- [ ] **P2 — compare against baseline**: Run same-route golden regressions against current M-4 engine and trusted operator source; record mismatches rather than adjust prices blindly.
- [ ] **P2 — integration only after approval**: Preserve current fallback and total multi-road composition; gate PR, preview, production separately. Never publish from the experimental branch by default.

- [x] **P1 — provisional PVP signature enumeration (DONE, UNPRICED)**: `m4-pvp-corridor-inventory.mjs` generates 420 monotonic contiguous candidate signatures from 20 PVP positions, flags special sections, assigns no prices, claims no real-route existence. 11/11 native Node tests pass with matching Git SHA.

- [x] **P1 — wire safe PVP-first diagnostics into V2 API/UI (DONE, not fare cutover)**: selected live route M-4 strict map-matching proof goes to `m4-pvp-preview.mjs` and user-visible result details. Matrix is still empty; legacy M4 money kept intact.
- [x] **P1 — Vercel Preview deployment (DONE)**: deployment `dpl_4xj5wm9mLPY3QkYtkd4FAyVeZAxx` at `https://mezhgorod-calculator-p1k0ywj71-4regodatbe-5310.vercel.app/v2` READY, GET /v2 HTTP 200. Guest access share URLs expire and must be reissued, never commit tokens.
- [ ] **P0 — verify real-world end-to-end M4 route diagnostics (NOT DONE)**: submit at least 2 representative live routes in both directions, inspect returned M4 `confirmedPvps`, map-matching and diagnostic error reason, compare against identical Valhalla route and actual operator receipts. No invented pricing.
- [ ] **P1 — independently prove uninterrupted M4 corridor (NOT DONE)**: current audit deliberately does not invent full `continuityEvidence`. Design strict full-road graph/OSM proof and attach only when obtained from selected geometry.
- [ ] **P1 — first officially verified whole-corridor price cell + runtime fare cutover (BLOCKED BY SOURCE/GEOMETRY)**: do not replace legacy amount until complete exact PVP fingerprint + current price + date/mixed rules; then add feature gate and run side-by-side same-route regressions.

## Development checkpoints
- Create a dated entry in `WORK_LOG.md` for the completed implementation, failing attempts and tests.
- In the same branch refresh the top of `docs/WORK_STATE.md` and this checklist.
- Record actual `git`/GitHub commit SHA and observed test evidence. Distinguish authored tests from executed tests.
- Before editing check branch head for concurrent changes; do not force-update or clobber an unrelated developer.
