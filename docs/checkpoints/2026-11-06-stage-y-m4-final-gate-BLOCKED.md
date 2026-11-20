# Stage Y — final gate for M‑4 candidate (BLOCKED)

Date: 2026-11-06 UTC. Worktree: `/workspace/stage-w-m4-tariffs`, branch `codex/stage-w-m4-tariffs`. Push/merge/Preview/Production forbidden. PR #14 remains Draft.

## History and scope

- Published base: `d60e733313860d2412d8be64f4be10ef71f7de28`.
- Stage X before Y: `e95d0af856c986a3480766aaec23aab27a4167b1`.
- Stage V final: `293f4ab225547789466636ae9d2a0907461b131d`, runtime fix `7226a82250c34b0b44733919cd48da3225f6fad1`.
- Stage V and Stage X are independent descendants of d60; Stage X does not include Stage V's exact selected-route `routeSignature` check. No merge or cherry-pick occurred.
- Relative to d60, the Stage X register has no bulk 722-fare rewrite: only four external-only controls become `unknown` and non-runtime-eligible; `TARIFF_SELECTION_REGISTER` has no net change. M‑4 source data changes 17 ordinary prices and 3 mixed-product prices from Order 58. No route geometry/selection or other-road tariff was changed.

## Code change for source validity

Order 58 is effective 2026-03-02. The date-profile resolver previously treated earlier 2026 dates as covered by Order 58. Commit `8688ea0676a4983f487b1b8d5072978cb3edca73` adds a lower-bound guard: dates before the effective day are unknown, the effective day resolves its weekday profile, and 2027 remains unknown. Regression is `experiments/nationwide-tolls/m4-effective-date-boundary.test.mjs`. The dataset is Category I/no-transponder only; it supports passenger-category-I use, not unmodeled vehicle classes. Yalta→Rostov 2,060/2,210 ₽ remains unconfirmed as a complete operator fare.

Price event mapping and no-double safeguards were not changed. OSM toll-booth/trace evidence exists, but exact binding of a saved trace to selected route geometry is in separate Stage V and is not included in this branch. Missing/incomplete components remain unknown.

## Actual checks

- Frozen offline install: lockfile check okay, 429 cached packages reused / 0 downloaded, then `ERR_PNPM_NO_OFFLINE_META` for `@alloc/quick-lru`. Existing `/workspace/.pnpm-store` (491 MB) preserved; partial `node_modules` moved intact to `/workspace/stage-y-partial_node_modules-2026-11-06` (17 MB).
- Current managed environment status: running, fresh observations, network policy `unrestricted/enforced`, no credentials/outbound identities. This does not override process/socket sandbox restrictions; no network or policy bypass was attempted.
- `pnpm test:audit`: exit254 before tests because its wrapper attempted unwritable `/home/agent/.local/share/pnpm/store`.
- Equivalent direct full offline test glob with `PLAYWRIGHT_MODULE` and `CHROME_PATH=/usr/bin/chromium`: **190 pass / 4 fail of 194**. Exact captured summary: `experiments/nationwide-tolls/checks/2026-11-06-stage-y-final-gate/stage-y-full-offline-tests.log`.
  - child output-forwarding suite: sandbox wrapper did not forward child stdout/stderr; wrapper text replaced expected provider stderr.
  - automatic policy replay: nested `spawnSync(process.execPath)` did not run the mock; `.mock-commits.jsonl` `ENOENT` is downstream fixture absence.
  - systemic audit report: `execFileSync` Node child denied with `EPERM`.
  - browser hydration: Chromium crashpad `setsockopt: Operation not permitted`, then SIGTRAP. The earlier CKAD missing-fixture report did not recur.
- 13 focused M‑4/V3/calendar suites PASS; quote/API script PASS; date boundary test PASS; TypeScript PASS/exit0 after Webpack generated `.next/types`; ESLint PASS/exit0 (9 warnings); Next build `--webpack` PASS/exit0; syntax and `git diff --check` PASS.
- The first simultaneous tsc/build invocation had TS6053 because `.next/types` did not yet exist; it is not counted as PASS. Sequential tsc after successful build passed.

## Decision / reproducible next step

Not ready for publication: full gate has four environment-related failures, exact current HTML response/effective continuation beyond saved Order 58 is not preserved, and Stage V route-trace protection has not been integrated. Existing `.github/workflows/special-territory-policy.yml` runs offline test/audit + TypeScript + build; `.github/workflows/calculator-final-gate.yml` runs lint/build and broader gates. They cannot verify this local SHA while it remains unpushed. The one reproducible path is a separately authorized ordinary fast-forward update to the existing PR branch, then checking both existing workflow runs against the exact new SHA. Do not run on `d60e733…` and attribute it to the local candidate. No publication was attempted.

Full detail: [Stage Y report](../../experiments/nationwide-tolls/checks/2026-11-06-stage-y-final-gate/README.md).
