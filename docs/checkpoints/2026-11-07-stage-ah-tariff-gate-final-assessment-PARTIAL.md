# Stage AH — M‑1 tariff discrepancy and final tariff-gate assessment

- Status: PARTIAL; M‑1 primary artifact unavailable, mandatory gate and runtime unchanged.
- Date: 2026-11-07 UTC.
- Starting HEAD: `7201d28d410e48d58f1d91bfb4d0b19d50582792`.
- Worktree: `/workspace/stage-ae-gate-proposal`; branch `codex/stage-ae-gate-proposal`.
- PR14: remains Draft; no remote, main, Production, Android, merge or push operations.

## M‑1 source retrieval and category finding

Official URL supplied by owner: <https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf>.

The prior normal HTTPS retrieval is recorded in the Stage AG checkpoint as HTTP403 with anti-bot HTML. This stage tried the ordinary web preview for that exact URL; it also returned `403 Forbidden`. Search results did not provide the original Order54 PDF bytes/page. No alternate identity, endpoint workaround, mirror bypass or retry was attempted. There are no Order54 PDF/image bytes in this worktree. SHA-256 is unavailable and is intentionally not guessed. Source status: `ORIGINAL_PDF_BYTES_UNAVAILABLE`.

Owner-reported visual reading of the official PDF page: Order54 (2026-02-27), M‑1 33–66 km/PVP46, Cat I–IV `230/250/320/500 RUB`, Monday–Sunday; cash, bank card and listed transponders share one fare table; effective 2026-03-02 00:00 MSK. This is recorded as owner-reported visual evidence, not independently re-opened or hashed here. See `experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json`.

Existing records affirmatively store Cat-I/no-transponder 250 and Cat-I/transponder 230 in `data/tolls/2026-10-01-avtodor-other-roads-category1.json` and `experiments/nationwide-tolls/national-registry.json`; tests expect 250 in `experiments/nationwide-tolls/national-price.test.mjs` and `experiments/nationwide-tolls/m1-m3-shadow-quote.test.mjs`. If the reported Order54 reading is correct, the 250 value is a category-column misread, not a no-transponder premium. The currently used strict V3 quote path is diagnostic-only for M‑1 and requires a physical gate match; M‑1’s physical mapping is currently absent, so a customer-facing 250 charge was not demonstrated. `other-road-current-tariffs` can return the snapshot if invoked for M‑1. North Odintsovo is a distinct product; no North Odintsovo file or model is included in the candidate.

Prepared `experiments/tariff-gate-proposal/m1-category-payment-fix.patch`, not applied to this worktree. It changes candidate Cat-I no-transponder 250→230 in the derived category-I data and the nationwide experimental registry, and updates regression expectations while preserving diagnostic-only assertions. It does not change `observedAt`, `effectiveFrom`, route geometry, payment semantics or any unrelated road. The patch text explicitly marks the visual read owner-reported and the original bytes/hash unavailable. Because source bytes were not obtained and the user requested no runtime change absent separate approval, this remains a review-only patch.

## Aggregate records and proposed product-level gate

The two existing registry rows are category-I payment views aggregating independent products: M‑1 (Order54/PVP46), M‑3 (Order53/PVP86, PVP136, PVP168), CKAD/A‑113 (Order56 direct entry/exit matrix), and A‑289 (Order55 direct OD pairs). One row represents the transponder view and one the no-transponder/postpay view. The existing `coverageComplete:false` is therefore justified at the aggregate level while M‑1 has no retained primary artifact/payment-column proof. It is also too coarse for available partial evidence: the other independently evidenced products need not be blocked individually. A partial M‑3/CKAD/A‑289 proof must not turn the aggregate row green.

Experimental product evidence is in `experiments/tariff-gate-proposal/stage-ah-product-evidence-2026-11-07.json` (14 records). M‑3’s three PVPs are split by two payment views; CKAD and A‑289 have one row per supported payment view; M‑11 and M‑12 are distinct records; M‑1 has two separate payment-view rows. Saved primary document and matrix hashes are verified for non-M1 records. M‑1 retains `fareKnown:false`, `coverageComplete:false`, absent source, unresolved payment binding/contradiction and unresolved double-charge risk.

`experiments/tariff-gate-proposal/product-gate.mjs` and `product-gate-approval.patch` propose evidence validation by product × edition × category × payment mode. `coverageComplete`, official source+SHA, fare, effective date, payment/product binding, contradictions and double-charge risk are checked at product level. Old observations are warnings only; invalid/future dates and missing material evidence remain blocking. Aggregated registry assessment stays BLOCKED if any linked product is blocked. The existing mandatory `approval.patch`, its workflow, and runtime files were not changed.

## Exact checks

- Official PDF web-preview exact URL: `403 Forbidden`; no bytes/SHA; no bypass.
- `node scripts/stage-ah-product-gate.test.mjs`: 5/5 PASS. Checks source/table hashes, individual product status, aggregate remains BLOCKED, stale observation warning-only behavior, invalid/future date, missing source, unknown fare, contradiction and double-charge blockers, and malformed evidence handling.
- Temporary clean M‑1 patch candidate: `git apply --check` PASS; patched `node --test experiments/nationwide-tolls/national-price.test.mjs experiments/nationwide-tolls/m1-m3-shadow-quote.test.mjs`: 2/2 test files PASS. This does not independently confirm the Order54 bytes and is not a runtime/release result.
- Temporary product-gate integration using saved official evidence: process exit 2, expected. Both M‑1 product rows are BLOCKED; M‑3/CKAD/A‑289/M‑11/M‑12 are individually PASS. Aggregate transponder/no-transponder rows remain BLOCKED. Warning codes include stale observation and unknown effective date; they do not cause the exit. Blocking M‑1 codes: official source missing/unverified, official fare unproven, product coverage incomplete, payment mode unproven, material/unresolved contradiction, double-charge risk unresolved.
- A synthetic test fixture with injected source verification passed only as a logic control and emitted age warnings; it is not primary-source verification, a tariff approval or CI.
- Mandatory gate was not changed/run as a candidate CI; no TypeScript, ESLint or application build was needed for the isolated tests/evidence/docs-only proposal. Do not call experimental PASS hosted CI.

## Files and approval boundary

Added/updated: `experiments/tariff-gate-proposal/product-gate.mjs`, `run-stage-ah-product-gate.mjs`, `stage-ah-product-evidence-2026-11-07.json`, `product-gate-approval.patch`, `m1-category-payment-fix.patch`, `scripts/stage-ah-product-gate.test.mjs`, `docs/WORK_STATE.md`, `docs/WORK_LOG.md`, `docs/NEXT_STEPS.md`, this checkpoint.

Not modified: runtime, `scripts/check-tariff-freshness.mjs`, mandatory CI/workflows, tariff registry/current pricing snapshot, route geometry, North Odintsovo, main, Production, Android, PR14. The tariff candidate patch is stored but unapplied.

Owner review required before applying either proposal: (1) provide or accept a retained original Order54 PDF/page with exact bytes/hash to resolve the 250 category conflict; (2) approve the isolated product-level gate schema/integration before changing mandatory CI; (3) separately authorize applying M‑1 fare correction to active/runtime data. Until then no production-usable M‑1 correction is claimed.

## Durable state

Work to be committed locally on the current isolated branch. Bundle verification/readback will be recorded after the local commit. Push remains forbidden.
