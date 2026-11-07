# Stage AH follow-up — official M‑1 tariff corroboration

- Status: DONE LOCAL for isolated M‑1 candidate/evidence; official PDF bytes remain unavailable; mandatory CI gate remains blocked and unchanged.
- Date: 2026-11-07 UTC.
- Starting HEAD: `0e1a1e1d5e08ba1faaf1b0fbef27581f58d14a2c`.
- Branch/worktree: `codex/stage-ae-gate-proposal`, `/workspace/stage-ae-gate-proposal`.
- No push, merge, Production, main, Android or unrelated tariff changes.

## Official sources and provenance

1. Order54 PDF: <https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf>. It was opened through the available web preview and returned HTTP403. No PDF bytes, image bytes or PDF SHA-256 are available. This is recorded as `ORIGINAL_PDF_BYTES_UNAVAILABLE`; no fabricated digest.
2. Official Russian Highways/Avtodor announcement: <https://russianhighways.ru/press/news/141463/>. The page was accessible through the web reader on 2026-11-07. Its table (rendered lines 114–118) identifies M‑1 km33–66/PVP46, passenger tariff 230 RUB, maximum T‑pass loyalty-discount price 195.50 RUB, freight tariff 500 RUB and its discounted price 425 RUB, with tariff effective from 2026-03-02. The announcement is an official primary source for the base passenger-car tariff and clearly separates the optional loyalty discount. It labels the category “passenger cars,” not the Roman numeral; Category-I mapping and the common cash/card/listed-transponder base column are additionally recorded as the owner’s visual Order54 reading.

Saved derived extract: `experiments/tariff-gate-proposal/m1-official-news-extract-2026-11-07.json`, SHA-256 `01f746e761b4aeb5d62a2bd26e2604f953a5ed23460175537b1b19288c40e74d`. This digest is only for the locally written structured extract, not the official page or PDF bytes. Original page bytes and source SHA are explicitly null.

## Isolated candidate correction

The earlier Cat-I/no-transponder 250 RUB reading is contradicted by the official announcement’s 230 RUB passenger base tariff and owner-reported Order54 category reading. Corrected only the local candidate:

- `data/tolls/2026-10-01-avtodor-other-roads-category1.json`: M‑1 no-transponder base 250→230; transponder base remains 230. Note now distinguishes the 195.50 RUB optional loyalty price and preserves the source-byte limitation.
- `experiments/nationwide-tolls/national-registry.json`: experimental Cat-I M‑1 no-transponder value 250→230.
- `experiments/nationwide-tolls/national-price.test.mjs`, `m1-m3-shadow-quote.test.mjs`: expected Cat-I value changed to 230; diagnostic-only, physical PVP, date, duplicate passage and fail-closed rules remain intact.
- `stage-ah-product-evidence-2026-11-07.json`: M‑1 base fare and source fields now bind to the official announcement extract. Payment-mode equivalence uses owner-reported Order54 visual reading as `accepted_working_calculation`; raw PDF remains unavailable. Loyalty-discount price is not assigned as a base fare.

No route/runtime calculation code or geometry changed; the experimental product-gate verifier was updated to validate an official rendered-page extract separately from original source bytes. No M‑1 fare was deployed. North Odintsovo and all other toll systems are unchanged. The prepared M‑1 patch from the prior checkpoint was applied to this isolated candidate only.

## Product gate and remaining blockers

The full product-level proposal evaluates 14 products; all 14 now PASS, including the two M‑1 views. The two aggregate `avtodor-other-roads` views each show six products and PASS because every represented product is individually evidenced or accepted as a working model. Overall candidate result: `PASS_WITH_WARNINGS`, exit 0, 15 warnings. Warnings concern old observations and aggregate effective-date metadata; they are not errors under the proposed gate. It does not certify selected-route traversal or a complete journey price.

The current mandatory freshness gate was deliberately not changed and still exits 2 under strict mode: two aggregate snapshots are 37 days old against a 30-day threshold. Its `observedAt` was not rewritten. Thus the M‑1 evidence gap is resolved for this product-gate candidate’s base tariff, but mandatory CI/release remains blocked until the owner approves the gate policy/integration and it is implemented without weakening source/date/conflict/double-charge controls.

The remaining Order54 limitation is narrow: local raw PDF/hash cannot independently substantiate the exact category numeral or full payment-mode clause. The official announcement independently establishes the passenger base amount and separate T‑pass discount; the remaining payment/category binding is explicitly owner-attested, not mislabeled as a locally verified PDF.

## Checks actually run

- `node scripts/stage-ah-product-gate.test.mjs`: 5/5 PASS, including official excerpt hash and content, M‑1/aggregate status, stale-warning behavior, invalid/future dates, missing source, unknown fare, tariff conflict, double-charge risk and malformed input.
- `node --test experiments/nationwide-tolls/national-price.test.mjs experiments/nationwide-tolls/m1-m3-shadow-quote.test.mjs`: 2/2 test files PASS after candidate correction.
- `node scripts/run-stage-ah-product-gate.mjs`: `PASS_WITH_WARNINGS`, exit 0; 14/14 products, both aggregates PASS, zero errors, 15 warnings.
- Unchanged mandatory command `TARIFF_AS_OF=2026-11-07 TARIFF_STALE_STRICT=1 node scripts/check-tariff-freshness.mjs`: exit 2, `stale=2`, `invalid=0`, `effectiveDateUnknown=3`. This remains the actual CI blocker because both 2026-10-01 aggregates exceed the 30-day strict threshold; `observedAt` was not rewritten.
- `node --check` for gate/CLI/tests, JSON parse for all changed JSON, extract SHA-256 verification and `git diff --check`: PASS.
- No TypeScript, ESLint or application build was needed because runtime/build files and route geometry are unchanged. No hosted CI was run or claimed.

## Decision needed before publication

Owner review/approval of the exact isolated product-gate integration and M‑1 base correction is required before applying them to mandatory CI or the active runtime. Preserve the current mandatory gate exit 2 until the stale-observation warning policy is approved and implemented with all fail-closed blockers intact. No push or release is authorized.

Code/evidence/test candidate commit: `8fc8ff329946c2dd33c5ccdb4f3869624df5d4a8`. The documentation closeout commit and final incremental bundle readback are recorded in the final handoff; bundle prerequisite is `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`.
