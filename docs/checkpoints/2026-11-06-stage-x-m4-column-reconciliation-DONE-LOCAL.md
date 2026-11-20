# Stage X — M‑4 source-column reconciliation (DONE LOCAL)

**Date:** 2026-11-06 UTC

**Status:** Completed locally; **not release-ready**. Push and publication prohibited.

## Baseline and isolation

- Worktree: `/workspace/stage-w-m4-tariffs`
- Branch: `codex/stage-w-m4-tariffs`
- Starting Stage X HEAD: `b1733ceda10dc3e0577be803900fe6116f856c1f`
- Published development base reviewed: `d60e733313860d2412d8be64f4be10ef71f7de28`
- Protected primary worktree/history, remote branch, PR #14, Production and Android were not modified.
- Stage W's original checkpoint/report and source snapshot were retained unchanged. This checkpoint supersedes their Stage W fare-correctness conclusion, not their historical record.

## Finding and correction

The saved Order 58 scan (PDF SHA256 `25fdb9a430934f47617c8cc1563f95e49c6ebe41c6303e9bd67465b3c568662d`) is effective 2026-03-02. It presents Category I in two period columns (Mon–Thu / Fri–Sun) and categories I–IV as separate rows. Stage W treated the neighboring category rows/payment-method header as four Category I payment/transponder columns. This explains the reported 38/42 comparison as a category/column interpretation error, not evidence of a newer tariff schedule. The saved Stage W normalized JSON is available, but its original HTML body, response headers/hash and actual retrieval timestamp are not. The repository does not establish which exact HTML response was fetched; a newer official tariff document has not been found in the saved materials, which is not proof that none exists online.

Source-backed Category I values were restored in `lib/toll-engine/m4-data.ts`, 722 vector amounts were restored in the active M‑4 register (719 changed from the invalid Stage W result; three had coincidentally matched), both PVP 355 rows were reconciled, and the 36 selected M‑4 south/DZOK rows were restored from the saved d60 source. Four external-only controls remain `unknown`. No geometry or route-selection policy changed. The data compiler was replaced by a deterministic restoration tool using the saved original vectors; it does not consume the invalid four-column Stage W snapshot.

Saved offline Yalta→Rostov replay is 2,060 ₽ weekday / 2,210 ₽ weekend rather than Stage W 2,210 / 3,000 ₽. These totals remain unconfirmed as exact route prices; they are derived from the saved source components, not assigned as a new universal fare. Replay used only saved responses (0 network calls, 0 misses).

Detailed sources, row-level examples and SHA256 readback are in the [Stage X report](../../experiments/nationwide-tolls/checks/2026-11-06-stage-x-m4-reconciliation/README.md). Stage W files remain historical and must not be used as current fare evidence.

## Verification

- 17 focused M‑4/V3 test files: PASS; source-correction suite 6/6 PASS; quote/API adapter: PASS.
- Restoration generator: deterministic; both output JSON SHA256 values unchanged on rerun. JSON parse, `node --check`, `git diff --check`: PASS.
- TypeScript: exit 0 PASS.
- ESLint: exit 0 PASS, 9 warnings / 0 errors.
- Next.js Webpack production build: exit 0 PASS.
- Full offline gate: **not passed**. pnpm wrapper could not create its store outside the permitted workspace (exit 254); an equivalent direct run yielded 189 PASS / 4 FAIL in 193 files. Failures are sandbox/harness (child-process output forwarding, two `spawnSync` EPERM paths including a downstream missing fixture, Chromium SIGTRAP/setsockopt EPERM). A previously reported CKAD fixture issue did not reproduce with the available dependency tree. No checks were weakened.
- Existing 491 MB pnpm store was not deleted. Offline install metadata/policy check failed; partial installation was preserved separately. Existing dependency tree was reused only after package and lockfile hashes matched.

Exact commands/results are recorded in the report's logs. Successful individual gates do not imply full offline gate success.

## Decision / next step

The 38/42 Stage W comparison is rejected as a basis for new fares. No later effective official tariff table or raw HTML capture is available in the workspace. The candidate is **not ready to publish** until a dated reproducible official current tariff publication/effective date is established and the full offline gate passes in a dependency-complete runner without sandbox restrictions. No push, Preview or Production action was performed.
