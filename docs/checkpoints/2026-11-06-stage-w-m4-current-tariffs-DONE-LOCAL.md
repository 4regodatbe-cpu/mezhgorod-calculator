# Stage W — M‑4 current tariff reconciliation — DONE LOCAL

Date: 2026-11-06 UTC. Isolated branch `codex/stage-w-m4-tariffs`; source base `d60e733313860d2412d8be64f4be10ef71f7de28`; task STARTED commit `0c9e44efb0e2acf38558fe2e9d83a0832f30ce7c`; implementation commit `014b3838cd0565b1efb1c64a6370f264ea2a11e7`. PR #14 remains Draft. Push/merge/Preview/Production prohibited. No `main`, V2, Android, tariff algorithm, route geometry, Stage V worktree, or protected primary clone changes.

## Finding: current source vs historical Order 58 vs V3 runtime

- Preserved primary Order58 PDF: `experiments/nationwide-tolls/source-documents/m4-order58-effective-2026-03-02.pdf`, SHA256 `25fdb9a430934f47617c8cc1563f95e49c6ebe41c6303e9bd67465b3c568662d`, legal start 2026-03-02; historical transcription unchanged.
- Current official Avtodor tariff page: [`https://avtodor-tr.ru/road/tariffs/`](https://avtodor-tr.ru/road/tariffs/), observed from official page/search 2026-11-06. It publishes category-I columns Mon–Thu with/without transponder and Fri–Sun with/without transponder plus holiday/preholiday calendar rules. Current posted no-transponder entries agree with `lib/toll-engine/m4-data.ts` (verification date 2026-09-29), not Order58: 38/42 comparable no-transponder cells differ, 4 match.
- The current page specifies that the detailed linked PDF contains the legal effective date. Direct access to page/PDF returned HTTP403; no such date was inferred. Snapshot sets `observedAt=2026-09-29`, `tariffEffectiveFrom=null`.
- Real V3 runtime does not take M‑4 endpoint prices from `m4-data.ts`: `lib/v3-calculation/route-leg-pricing.ts` uses `matrixM4Component`, which reads `M4_ACTIVE_ENDPOINT_REGISTER.json`; south/DZOK rows also originate in `TARIFF_SELECTION_REGISTER.json`. The active V3 values primarily cited historic Order58. This was the staleness source.

Full posted current table is at `experiments/nationwide-tolls/source-snapshots/m4-posted-category1-tariffs-2026-09-29.json` (21 products × 4 columns). Current no-transponder values include: 62 220/260; 71 400/500; 133 500/600; 416+460 mixed product 360/480 (one combined product); 636 full mixed product 640/770; 672 partial product 440/500; DZOK46 410/770. Never add 636 and 672 simply because both rows exist; keep them separate, non-additive without distinct proven traversal. The source does not establish every selected route's exact product applicability.

## Implementation

Added a reproducible builder `experiments/nationwide-tolls/scripts/build-m4-current-endpoint-register.cjs`. It recompiles from original immutable source matrices, rather than transformed output, so repeated runs are idempotent and preserve historic `previousFare` provenance.

The candidate changes only M‑4 data/registers and related tests/snapshot:

- 722 current official posted product-vector estimates and 2 saved PVP355 entry/receipt-rule estimates in the active endpoint register.
- 4 Yandex-derived control rows without a reproducible product vector set `runtimeEligible=false`, `priceConfirmation=unknown`; no aggregate external total is converted into a segment fare.
- Repriced from immutable published-d60 rows: 32 M‑4 south rows and 4 DZOK rows. Current rows have `validFrom=observedAt`, `tariffEffectiveFrom=null`, explicit candidate/current-page verification text and `priceConfirmation=unconfirmed`; DZOK preserves `runtimeApproved=false`.
- Current estimates are not exact operator-confirmed O-D fares. Historical source is retained in `previousFare`; pre-observation dates are not covered by the new row.
- Product identities remain guarded: combined 416+460 stays one product; PVP355 receipt charges the supported entry fare once, not the 339 row again; separate M‑4/other product family and duplicate protection is unchanged.
- The shared current calendar remains the existing M‑4 calendar; no changes to its holiday rules. No route geometry, route-choice policy, `m4-data.ts`, M‑12 or any other road data changed.

Using existing saved Yalta→Rostov route/traces only (2 saved responses, zero network/misses), the revised **unconfirmed** result is 2,210 ₽ on 2026-10-20: M‑4 1,000 + A‑289 800 + bypass 410; 3,000 ₽ on 2026-10-24: M‑4 1,430 + A‑289 800 + bypass 770. Tests keep the complete result unconfirmed and assert one bypass component only. This is a current table estimate, not independent full-route operator confirmation.

## Checks actually run

Focused checked suites: **71/71 PASS** across M‑4 endpoint product integration 6, quote/API adapter script PASS, historic-source verification 4, endpoint registry 6, current source transcription 5, M‑4 adapter 17, M‑4 tariff calendar 14, Crimea M‑4 bypass 5, saved Yalta→Rostov replay 1, V3 southern product composition 7, time/calendar integration 6. The retained Yalta→Rostov replay consumed 2/2 saved trace responses with 0 network and 0 misses.

Static checks PASS: `node --check` on changed JS/CJS; JSON parse on all four relevant/generated JSON files; `git diff --check`; generator run twice yielded identical SHA256 for both generated register files. `previousFare`/registry reproducibility tests passed.

Required gates are **not PASS**:

- `pnpm run test:audit` exited 254 before tests because pnpm attempted to create `/home/agent/.local/share/pnpm/store`; this is outside the writable workspace.
- The exact direct Node offline-test command was attempted. It ran a subset; many tests could not load `next`, `typescript`, or `eslint` because this isolated checkout has no `node_modules`. It is not a full-gate result and no meaningful overall PASS count is claimed.
- TypeScript command exited 127 (`./node_modules/.bin/tsc` absent); scoped ESLint exited 127 (binary absent); Webpack build exited 1 (`next` package absent). No dependencies were installed.

## Diagnosis of Stage V's five prior full-gate failures

Stage V saved 188/193 PASS and 5 FAIL; that result remains unchanged, not upgraded to PASS:

1. `audit-child-process.test.mjs`: test expects streamed child stdout and raw provider stderr. This sandbox run emitted only WAIT heartbeats/no nested output; failure returned generic command error. Direct `execFile` reproduction showed nested stdout was not delivered. Leave strict assertions; rerun on supported CI runner.
2. `automatic-policy-replay-integration.test.mjs`: isolated fixture's nested `spawnSync(process.execPath,...)` is blocked by sandbox EPERM. Direct reproduction reports `error.code=EPERM`; mock child never writes `.mock-commits.jsonl`, and the following fixture read becomes ENOENT. CI subprocess environment required.
3. `systemic-audit-report.test.mjs`: same `spawnSync` EPERM prevents report-builder subprocess execution. Keep report assertions, rerun on supported CI.
4. `v3-ckad-m11-m12-boundary.test.ts`: Stage V evidence says the fixture expected by that local-history test is not present on published base d60. A clean-d60 attempt in this environment stopped earlier at missing `next/server`; no synthetic fixture was added and no Stage V patch imported.
5. `v3-live-browser-hydration.test.mjs`: Stage V recorded Chromium SIGTRAP / `setsockopt: Operation not permitted`; this turn's attempted run also could not launch browser. Not an application PASS or failure diagnosis about hydration.

## Result and next action

The current posted M‑4 table is now represented in the actual local V3 matrix as unconfirmed estimate rows. No exact price claims are made from the tariff table alone; unvectorized external controls remain unknown. This block is **not ready to publish**: retrieve the operator-linked detailed current PDF/effective date through an allowed source, then run required CI, TypeScript, ESLint and build in a dependency-complete environment. No further route audit, 2GIS query, push, Preview, or Production action is warranted for this block.

Detailed index: `experiments/nationwide-tolls/checks/2026-11-06-stage-w-m4-current-tariffs/README.md`; next step: `experiments/nationwide-tolls/NEXT_STEPS.md`.

## Git preservation

The branch ancestry is `d60e7333` → STARTED `0c9e44ef` → implementation `014b3838cd0565b1efb1c64a6370f264ea2a11e7` → handoff and bundle-limit records. The local tree is clean at the last saved HEAD. A standalone bundle is impossible from this partial clone: `GIT_NO_LAZY_FETCH=1 git rev-list --objects HEAD` finds 26 reachable promised blobs absent locally. No fetch workaround was attempted. An incremental bundle was created and verified; it requires prerequisite `d60e733313860d2412d8be64f4be10ef71f7de28`. A subsequent docs-only commit may advance its ref; the final artifact is recreated after the last documentation commit and readback-verified against that branch tip. It is a valid incremental transfer, **not** a self-contained archive. Its exact final path/SHA256 are reported in the handoff.
