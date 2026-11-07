# Next steps

## Stage AF — next evidence step

1. Recover the official M‑1 Order54 PDF from its already recorded URL `https://avtodor-tr.ru/upload/iblock/8c4/835txjvncev45htfd0x1ws6fjq1wjckl.pdf`, or preserve a byte-exact original official tariff-page response. Verify the M‑1 33–66 category-I fare, payment basis and effective clause; do not alter the observation date just because it is old.
2. Prepare reviewed M‑11 and M‑12 rows from retained official files. M‑11 source: `experiments/nationwide-tolls/source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf` plus `experiments/nationwide-tolls/source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json`; M‑12 source: `experiments/nationwide-tolls/source-documents/m12-order302-effective-2026-10-08.pdf` plus `experiments/nationwide-tolls/source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json`. The proposed strict contract needs exactly one evidence record per all four registry IDs; the two other-roads records cannot make it pass alone.
3. Keep the two aggregate records blocked until primary-source coverage is complete. Then present `experiments/tariff-gate-proposal/approval.patch` and the reviewed evidence package for owner approval. Do not apply it to mandatory CI before approval.

## Stage AE — superseded by Stage AF (historical next-step record)

## Stage AE — next review

1. Owner reviews exact `experiments/tariff-gate-proposal/approval.patch` and contract README. Applying mandatory gate change is not yet authorized.
2. Before activation prepare reviewed evidence for each registry row from existing official files (actual paths/checksums, source cells, period/product basis and conflict assessment). Do not invent defaults; patch without evidence intentionally remains blocked.
3. After separate approval apply patch and run its strict integration/full CI preparation. No push authorized. Runtime acceptance evidence StageAD remains applicable; no AA–AD rerun needed for this isolated proposal.

## Stage AD — current handoff

1. Review final local runtime candidate e4e070c8 and [freshness proposal](TARIFF_FRESHNESS_GATE_PROPOSAL.md). Applying the proposed warning/evidence separation to mandatory CI requires explicit owner permission; current strict freshness remains blocked. No push is authorized.
2. After owner decision, authorize an ordinary controlled push of a reviewed exact candidate and inspect hosted mandatory CI/Preview on its exact SHA. Local28 browser checks used controlled API and do not certify hosted/live acceptance.
3. Revisit Donetsk Artyoma/Yalta Kirova street coverage only with new independent source/provider evidence; current city fallback is usable but not street coverage. No repeated city audit or blind Photon retries.

## Stage AC remaining acceptance

1. Finish deterministic overall-budget, genuinely stalled-provider, corridor-rejection and timeout-during-body cases; distinguish synthetic provider timeout injections from real expiry. Do not infer historical 502 causes.
2. Run actual desktop/mobile A/B browser acceptance on this candidate, using existing harness and accessible app. Current VM hook/unit tests are not browser evidence. Confirm four street controls live without inventing street coverage.
3. Obtain normal dependency installation inside worktree to run standard Turbopack build (current symlink points outside root); Webpack build already passed. No push authorized. Separate tariff freshness blocker remains Stage AB.

Priority-ordered actions for the next owner/agent. No publication is currently authorized.

## Stage AB — current blockers

1. Obtain a current first-party Autodor tariff page/document or operator response for the shared `2026-10-01-avtodor-other-roads-category1.json` snapshot. Preserve source, retrieval time, effective date, exact table and checksum. Do not change `observedAt` or freshness thresholds based on a stale search crawl.
2. Once owner authorizes publication, run the exact candidate `9ac745c35500e4bfcb04cf3411806be8a4887d44` (or documented descendant) through ordinary hosted Actions. Push is currently prohibited; no Actions result exists for this local candidate.
3. Inspect hosted provider-level diagnostics, if available, for the already recorded Tver→Adler and Golubitskaya→Saint Petersburg 502. Current evidence identifies only aggregate all-provider `ROUTE_UNAVAILABLE`; do not repeat live requests merely to reproduce it.

The all-provider outage contract has a deterministic regression and returns no fabricated route. See [Stage AB checkpoint](checkpoints/2026-11-07-stage-ab-blocker-closure-DONE-LOCAL.md). Do not alter route selection, toll data, Production, main, Android, or PR #14.

1. **Obtain new first-party tariff evidence** for `avtodor-other-roads-2026-10-01-category1-transponder` and `avtodor-other-roads-2026-10-01-category1-no-transponder`. Verify the exact effective date and applicable products/categories, update only supported source rows, then rerun strict freshness. Do not extend freshness dates or thresholds without verification.
2. **After separate owner authorization, publish the isolated final-gate candidate by ordinary non-force fast-forward push** to `fix/v3-missing-route-prices-2026-10-15`. At preparation time remote head was `8fae15c7…`; recheck remote SHA and ancestry immediately before any write. Push is currently forbidden.
3. Inspect the GitHub Actions run triggered by that push on its exact SHA: offline checks, TypeScript, lint, production build, API smoke, V3 live route report and strict freshness. The route report is sanitized; distinguish HTTP 502/provider outage from application assertions. Do not call the gate green if either live or freshness step failed.
4. For Tver→Adler and Golubitskaya→Saint Petersburg, obtain provider-level logs/status from the hosted run or a reproducible provider diagnostic before deciding whether there is an application routing defect. No automatic retries or repeated live requests.
5. Leave Donetsk→Kazan and Moscow→Kazan toll status `unknown/null` until an independently proven directed M‑12 tariff boundary and current matching tariff pair exist.
6. Preserve PR #14 as Draft and do not change Production, main, Android, V2 runtime, or the protected primary local history as part of this stage.
