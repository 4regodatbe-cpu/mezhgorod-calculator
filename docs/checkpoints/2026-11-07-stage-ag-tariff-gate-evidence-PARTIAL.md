# Stage AG — tariff gate evidence completion attempt

- Status: PARTIAL / BLOCKED on M‑1 primary artifact; proposed gate remains non-production and unapproved.
- Date: 2026-11-07 (UTC); isolated worktree `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`.
- Starting commit: `35b4ae98cedd7ac8f89dd2b1be7de76b10ee0041` (Stage AF continuation).
- PR14 remains Draft. No push, merge, Production, main, Android, registry/runtime changes, or tariff amount edits.

## Sources and evidence

### M‑1 Order54 retrieval

Official URL: `https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf`. One normal read-only HTTPS request returned HTTP403 with anti-bot HTML, 2026-11-07 16:51:11Z. No PDF bytes were received; no retry, alternate identity, endpoint, or bypass was attempted. Workspace search found no local Order54 PDF. No SHA256 can be stated.

Owner-provided reading is recorded in `experiments/tariff-gate-proposal/stage-ag-evidence-2026-11-07.json` as `NOT_INDEPENDENTLY_VERIFIED`: PVP46, M‑1 km33–66, Category I–IV `[230,250,320,500] RUB`, Monday–Sunday, effective 2026-03-02 00:00 MSK, listed payment methods including cash/card/transponders. It conflicts with the Stage AF-derived snapshot which labels 250 RUB as Category-I no-transponder. Neither interpretation was promoted or rewritten. Required next fact: primary PDF bytes and visual confirmation of table headings, vehicle categories, payment scope and effective clause.

### M‑11

Retained Order274 PDF path `experiments/nationwide-tolls/source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf`, SHA256 `6b52ca130ee7e8a7948c2b39982c00d82174e4e45ec5dcd3983355238c403b91`; linked official document URL is recorded in evidence. Matrix manifest path `experiments/nationwide-tolls/source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json`, SHA256 `354068911158c267256cb17982a93b719ba8b6b7788c2d6e4668757c83c8f14b`. Category I. One matrix for cash/card/listed APD, OSSP, MSS, NKD transponders. Effective 2026-09-04 00:00 MSK. Profiles: Mon–Thu excluding weekends/non-working holidays/pre-holidays; Fri–Sun including weekend/holiday/pre-holiday. Numeric metadata/structure checked: 22 nodes and 462 ordered non-self cells per profile, zero remaining. Saved JSON has an older nested `extractionStatus` sentence (“only p58 row”) that conflicts with its current matrix/extraction fields; documented and preserved, not silently repaired. Tariff matrix evidence does not prove physical route traversal or trip total.

### M‑12

Retained Order302 PDF `experiments/nationwide-tolls/source-documents/m12-order302-effective-2026-10-08.pdf`, SHA256 `25226467bed5d36691085e03ce706e49bb15b6e67607d0ebd4df420a9b07d213`; matrix `experiments/nationwide-tolls/source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json`, SHA256 `46beac44bd56e8493665134fdaf328a8ff2951d36ccf9743cbf2d2cf98687dda`. Order No.302 dated 2026-10-02, effective 2026-10-08 00:00 MSK; Category I; postpay and listed transponders use one direct-pair matrix, no weekday split. Coverage: 20 mainline nodes, 380 ordered non-self cells. Regional toll products in the same order are explicitly outside the M‑12 Moscow–Shali registry row. Source confirms direct tariff cells, not route traversal.

## Proposal changes and test results

Added M‑11 and M‑12 source-reviewed records plus a provenance-limited M‑1 owner claim to `stage-ag-evidence-2026-11-07.json`. Added verified evidence `applicability.effectiveFrom` validation to the isolated proposal evaluator `experiments/tariff-gate-proposal/gate.mjs`: malformed/future dates block; a `verified` status without an exact effective date blocks. `approval.patch` was not edited and remains for owner review; it was applied only in temporary copy `/tmp/stage-ag-gate.*`. Active mandatory CI script, workflow, tariff registry and runtime were not changed.

Actual temporary combined strict run (`TARIFF_AS_OF=2026-11-07`, `TARIFF_STALE_STRICT=1`) exited 2 as expected. M‑11/M‑12 had no row errors; two aggregate rows received stale/effective-date warnings and were blocked for missing verified primary source/fare, incomplete M‑1 coverage, unresolved conflict/product mapping and double-charge risk. This is a proposal integration result, not a current CI result.

- `node scripts/tariff-gate-approval.test.mjs`: 8/8 PASS.
- `node scripts/stage-ag-tariff-evidence.test.mjs`: 5/5 PASS.
- `node --test scripts/tariff-gate-approval.test.mjs scripts/tariff-freshness-proposal.test.mjs scripts/check-tariff-freshness.test.mjs scripts/stage-ag-tariff-evidence.test.mjs`: 4/4 file suites PASS.
- JS syntax, evidence JSON parse, saved source hashes, M‑11/M‑12 matrix counts, `git apply --check`, `git diff --check`: PASS.
- Combined proposed gate: expected strict exit2, not PASS. Negative controls: invalid date, future date, missing source, tariff conflict and double-charge risk each BLOCKED.
- Full CI/build not run; runtime and mandatory gate were intentionally untouched.

## Next step

Obtain the already identified original Order54 PDF through a permitted source. Verify it and reconcile the Cat I vs Cat II/payment-mode conflict, then update only the new reviewed evidence records. Do not refresh the snapshot observation date and do not activate `approval.patch` without owner approval.
