# Stage AI — product-evidence tariff gate applied to local candidate

- Status: DONE LOCAL; hosted Actions/Preview/Production are pending.
- Time: 2026-11-07 22:44 UTC.
- Repository: `/workspace/stage-ae-gate-proposal`; branch `codex/stage-ae-gate-proposal`.
- Source HEAD: `0bfb15a96575cec810c0eb5786cf447799c389e9`.
- Remote checked before this block through GitHub PR readback: feature head `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; `8fae15c…` is an ancestor of source HEAD; 34 commits ahead, 0 behind. PR #14 OPEN/Draft. The primary local 91-commit history was not changed.
- Owner directly authorized applying the reviewed product-evidence policy to the actual mandatory gate and proceeding toward release if all gates pass.

## Changes

Applied the intended Stage AE–AH product evidence policy to the actual mandatory check rather than only a temporary copy:

- `scripts/check-tariff-freshness.mjs` still reports snapshot age and effective-date metadata; strict exit now comes from the product-level assessor using the configured evidence file. Missing/malformed evidence fails closed.
- `.github/workflows/calculator-final-gate.yml` supplies the retained Stage AH evidence manifest to the strict tariff step; the existing mandatory step and final aggregate failure handling remain in place.
- `experiments/tariff-gate-proposal/product-gate.mjs` now requires a reviewed edition binding. It checks category, actual effective calendar date, source artifact digest binding and the M‑1 Category-I base fare against the retained official-page extract. It still blocks missing sources/fare, incomplete applicable coverage, material contradiction and double-charge risk.
- `experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json` includes reviewed edition/category/date/source digest assertions for Orders 54, 53, 56, 55, 274 and 302. It contains no fabricated source hash for the unavailable original Order54 PDF.
- Regressions cover stale-as-warning, absent evidence, malformed/future/source-mismatched date, wrong category, M‑1 250-versus-230 mismatch, missing source, conflict, double-charge, source-digest mismatch and isolation of unlisted experimental records.
- Updated `scripts/tariff-gate-approval.test.mjs`, the workflow contract, current `docs/WORK_STATE.md` and `docs/NEXT_STEPS.md`. Earlier checkpoints are retained as historical records.

No active toll runtime, route geometry, tariff amount, V2 behavior, Android, main or Production code was changed. M‑1 source caveat remains explicit: the official release independently states passenger base 230 RUB and distinguishes loyalty 195.50; the formal category/payment mapping also relies partly on the owner's visual read of Order54, whose original bytes are unavailable.

## Verification actually run

- Target gate command with `TARIFF_AS_OF=2026-11-08`, strict mode and the Stage AH evidence manifest: exit 0, 0 errors, 21 warnings (old observation, unknown aggregate date, unavailable original page bytes, and owner-attested mappings). The warnings do not change toll sums or physical bindings.
- Product-gate targeted suite: 6/6 PASS; workflow contract and tariff approval targeted suites PASS.
- Initial unprivileged `pnpm test:audit`: 205 pass, 3 subprocess-only fail, 1 skip. The failures were child-process output loss/EPERM and missing child-produced `/tmp` mock log, not product assertions. The same command was rerun with approved normal child-process permissions: 1176 PASS, 0 FAIL, 1 SKIP; quote and API adapters PASS.
- `pnpm exec tsc --noEmit`: PASS.
- `pnpm lint`: exit 0, 0 errors, 9 existing warnings.
- Standard `pnpm build`: PASS. It reran audit (1176 PASS/0 FAIL/1 SKIP), compiled with Next.js 16.3.4 Turbopack, completed TypeScript, static-page generation and route manifest.
- `pnpm test:route-benchmark`: PASS, 61 records.
- Remaining workflow gates: `v3-production-readiness`, `segment10-production-readiness`, route corridor policy (4/4), route pricing, Segment 9 (32 cases), Segment 8, systemic toll composition, CKAD, M‑4 traversal, M‑11 Moscow and route-quality majority: all PASS.
- Local production server on port 3187: API contract smoke 16/16 PASS; `/` 307, `/v2` 200, `/v3` 200, `/api/version` 200. Local `/api/version` has `commit:null` because no CI SHA is set in this manual local run.
- `git diff --check`: PASS.
- Earlier live local route audit remains 0/6; the six requests returned HTTP 502 with all provider HTTP statuses null/network failure. No repeated request was made. Per the current owner instruction, this sandbox-only egress result does not block push; hosted live diagnostic must be inspected on Preview.

## Publication state and next operation

- At checkpoint creation, code/docs are local and uncommitted; exact final candidate SHA will be recorded after commit.
- Immediately before pushing, recheck remote feature HEAD and verify it still equals `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb` and remains an ancestor. Use one ordinary non-force fast-forward push only. Stop on any remote divergence or platform safety refusal.
- After push verify readback and PR #14 Draft; inspect every Actions result and the sanitized V3 live-route artifact for the exact pushed SHA. Verify exact-SHA Vercel Preview. Any required CI failure or confirmed P0/P1 blocks Production.
- Production SHA before this work: `a6bea89dd4b481a1352dc492969004e6cd1e6e38`; Production has not been changed by this block.
