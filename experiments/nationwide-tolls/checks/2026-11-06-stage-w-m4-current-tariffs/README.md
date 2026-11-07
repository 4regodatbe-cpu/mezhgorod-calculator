# Stage W — M‑4 current tariff reconciliation — DONE LOCAL

Status: **DONE LOCAL / PUSH FORBIDDEN**. Isolated worktree/branch `codex/stage-w-m4-tariffs`, source commit `0c9e44efb0e2acf38558fe2e9d83a0832f30ce7c` from published development SHA `d60e733313860d2412d8be64f4be10ef71f7de28`; PR #14 remains Draft. Stage V's separate worktree was not changed. Main, Production, V2, Android, and the protected 91-commit primary clone were not changed.

## W1 — source and runtime path

Historic Order 58 PDF `source-documents/m4-order58-effective-2026-03-02.pdf` (SHA256 `25fdb9a430934f47617c8cc1563f95e49c6ebe41c6303e9bd67465b3c568662d`) is effective from 2026-03-02. It is not the current posted schedule. The official Avtodor tariff page [`https://avtodor-tr.ru/road/tariffs/`](https://avtodor-tr.ru/road/tariffs/) retrieved on 2026-11-06 has four category-I columns: Mon–Thu with/without transponder and Fri–Sun with/without transponder, with special-day calendar rules. Its no-transponder values agree with `lib/toll-engine/m4-data.ts`'s 2026-09-29 verification, not with Order 58: **38 of 42 comparable cells differ; 4 agree**. The page points to a detailed PDF for legal effective date; direct access returned HTTP 403. Therefore the snapshot records `observedAt=2026-09-29`, `tariffEffectiveFrom=null`; it does not invent an effective date or claim confirmed operator price validity for every departure date.

The current full posted table is retained in `source-snapshots/m4-posted-category1-tariffs-2026-09-29.json`. It includes all 21 products and all four columns. Important current no-transponder examples: PVP 62 = 220/260; 71 = 400/500; 133 = 500/600; combined 416+460 = 360/480 as one product; full mixed PVP 636 = 640/770; separate partial PVP 672 = 440/500; DZOK 46 = 410/770. These are current-page rows, not Order 58 prices. Existing M‑4 calendar tests preserve Mon–Thu vs Fri–Sun, official 2026 holiday/preholiday rules and unknown unsupported year.

V3 does not price M‑4 from `m4-data.ts`. `route-leg-pricing.ts` calls `matrixM4Component`, which reads `M4_ACTIVE_ENDPOINT_REGISTER.json`; M‑4 south/DZOK rows also enter through `TARIFF_SELECTION_REGISTER.json`. Thus the source-file display values were current while the active V3 matrix still used historical Order 58 values. No geometry, tariff algorithm, route choice or V2 logic was changed.

## W2 — local candidate

- Added a deterministic generator `scripts/build-m4-current-endpoint-register.cjs`; it compiles from immutable original matrices each run, so repeated generation is byte-stable and does not overwrite historical `previousFare` provenance.
- Repriced only saved complete M‑4 product vectors against the current no-transponder table: 722 endpoint rows and two PVP 355 receipt-rule rows; all are `priceConfirmation=unconfirmed`, start no earlier than observation date, and remain estimates rather than exact OD fare certification.
- Four external/Yandex-only control rows without a reproducible product vector are quarantined as `unknown` (not priced from aggregate external totals).
- Updated 32 M‑4 south rows from the immutable source rows in `source-snapshots/m4-order58-v3-selected-rows-from-d60.json` and four DZOK rows. DZOK is shown only as an unconfirmed current-posted estimate from observation date; `runtimeApproved=false` is retained and no tariff-effective date is invented. The quote test requires an unresolved separate bypass price to keep the complete total null.
- Combined 416+460 stays one tariff product. PVP 355 receipt rule charges one entry fare only; 339 is not added. PVP 636 full and 672 partial products are not automatically added together. Direction, calendar profile, endpoint uniqueness, date bounds and existing family-level duplicate guards remain in force.
- `lib/toll-engine/m4-data.ts`, route geometries, strict route selection, M‑12/other-road rates and V2 were not changed.

Retained Yalta→Rostov replay still consumes exactly two saved trace responses, zero network/misses. Revised current-posted estimates are 2,210 ₽ for 2026-10-20 (M‑4 1,000 + A‑289 800 + DZOK 410) and 3,000 ₽ for 2026-10-24 (M‑4 1,430 + A‑289 800 + DZOK 770). They are **unconfirmed estimates**, not operator-confirmed full trip fares. The test was updated to describe the new current table and preserve duplicate guards.

## W3 — Stage V five failures

The Stage V full gate result remains **188/193 PASS; 5 FAIL**, not a PASS. Failures and diagnoses:

1. `audit-child-process.test.mjs`: the test expects child stdout `started/finished` and raw stderr `provider failed`. In this sandbox, `execFile` produced only `WAIT` heartbeat lines; child output was absent and the failure surfaced as generic `Command failed`. A direct reproduction this turn confirmed nested child output did not arrive. This is a subprocess harness/runtime limitation or contract mismatch, not an M‑4 regression; do not weaken the assertions.
2. `automatic-policy-replay-integration.test.mjs`: the isolated fixture depends on `spawnSync(process.execPath, ...)`; a direct reproduction returned `EPERM`, so the mock child never wrote `.mock-commits.jsonl` and the test then hit `ENOENT`. The source/test should be rerun in a normal CI subprocess environment; no production algorithm change is justified.
3. `systemic-audit-report.test.mjs`: same `spawnSync` `EPERM` prevents the isolated report-builder subprocess from executing. Keep the expected report assertions; run in CI.
4. `v3-ckad-m11-m12-boundary.test.ts`: Stage V documented that the expected route fixture exists only in the protected local history, not in published base `d60e733`. This turn's clean-base direct attempt stopped earlier because `next/server` dependency is unavailable. Do not fabricate fixture evidence or silently transfer Stage V implementation; choose a deliberate later decision on sourcing the fixture or split the test's availability behavior.
5. `v3-live-browser-hydration.test.mjs`: Stage V recorded Chromium `SIGTRAP`/`setsockopt: Operation not permitted`; invoking with `PLAYWRIGHT_MODULE` and `CHROME_PATH` here also failed. This is environment/browser sandbox, not application failure.

The exact full gate could not complete in this worktree: `pnpm run test:audit` stopped before tests with exit 254 trying to create `/home/agent/.local/share/pnpm/store`; direct execution of the gate command then encountered missing `next`, `typescript`, and `eslint` packages because there is no `node_modules`. No tests were removed or relaxed. TypeScript, ESLint and Webpack build were attempted and were BLOCKED (`tsc/eslint` binaries absent; Next package absent). These are not reported as PASS.

## W4 — checks and status

The focused M‑4/route/cost suites passed: 71 Node test cases across endpoint integration (6), verified source (4), endpoint registry (6), current tariff transcription (5), M‑4 route adapter (17), tariff calendar (14), Crimea bypass geometry/replay (6), southern product composition (7), and time/calendar integration (6), plus the quote/API adapter script. Static checks passed: `node --check` on changed JS/CJS harness files, JSON parse on all four generated/source JSON files, `git diff --check`, deterministic double generation (identical SHA256 for both generated registers).

The source and route-estimate candidate are useful locally, but **not release-ready** until the linked current tariff PDF/effective date is independently available and required CI/TypeScript/ESLint/build gates run in an environment with dependencies and supported subprocess/browser permissions. Push, Preview and Production were not used. Full detailed handoff is in `docs/checkpoints/2026-11-06-stage-w-m4-current-tariffs-DONE-LOCAL.md`; next steps are in `experiments/nationwide-tolls/NEXT_STEPS.md`.
