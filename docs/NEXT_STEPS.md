# Next steps

## FINAL V3 release — blocked after exact-SHA CI/Preview checks

1. Do not publish Production now: B03 run `42422534580` failed pre-browser because the 7-day address snapshot expired at `2026-11-07T14:50:17.541Z`; live browser steps never ran. Do not edit `expiresAt` or weaken its gate.
2. Obtain genuine refreshed captures for the existing four address-snapshot rows with preserved source responses, capture times, exact result IDs/positions and SHA256; renew validity only from the earliest verified capture, maximum seven days. If any exact ID cannot be re-established, keep that row unavailable and keep B03 blocked.
3. The exact-SHA Preview is READY and serves `/v3`, `/v2` (both 200), and `/api/version` with SHA `76a39da28a5fefa7aa7ec0f2c954114297d84b06`. Read-only autocomplete returned 200 for the targeted settlements, but this does not replace selecting addresses and submitting a route. Use a browser driver that supports actual input/clicks or wait for the B03 workflow after valid captures.
4. External live probe run `42422534610` reports Photon HTTP 503/cooldown for Donetsk; do not make repeated blind retries. The hosted calculation smoke did return Donetsk→Moscow 200 with 1123.249 km, 58,337 s and `unknown/null` tolls.
5. After B03 and remaining required hosted checks pass and Preview calculation is verified without P0/P1, recheck remote ancestry/current SHA and Production version before using the already-granted release authorization. Keep PR #14 Draft; do not touch main, Android or reserve refs.

The push/readback and blocking results are recorded in [FINAL V3 blocked checkpoint](checkpoints/2026-11-07-final-v3-release-BLOCKED-AFTER-PREVIEW.md). Historical Stage AI and earlier handoffs below remain preserved.

See the current [WORK_STATE](WORK_STATE.md) and [Final V3 release BLOCKED checkpoint](checkpoints/2026-11-07-final-v3-release-BLOCKED-LOCAL.md).

## Historical records below — current Stage AI authorization supersedes old blockers

## Stage AH — final review and mandatory-gate blocker

1. **Done locally:** M‑1 Cat-I base 250→230 correction is applied only in the isolated candidate (`data/tolls/...`, experimental `national-registry.json`, focused tests). Official page excerpt and provenance are in `m1-official-news-extract-2026-11-07.json`; its SHA is for the local extract only. Do not claim or invent a SHA for inaccessible Order54 PDF bytes.
2. Owner reviews `experiments/tariff-gate-proposal/product-gate-approval.patch`, product evidence and source limitation: official page proves passenger base 230 and separates T-pass loyalty price 195.50; formal category and payment-mode binding additionally rely on owner’s visual Order54 reading.
3. Proposed product gate: 14/14 products PASS, overall PASS_WITH_WARNINGS. **Current mandatory gate still exits 2** because the two aggregate snapshots are 37 days old against the 30-day strict threshold. Do not alter `observedAt` to force PASS.
4. Owner approval is required before integrating the product-level warning/error policy into mandatory CI or applying the candidate tariff data to active runtime. Keep invalid/future dates, absent material sources, contradictions, incomplete scope and double-charge risk blocking. No push/publication authorized.

## Stage AG — superseded next evidence step (history)

1. **Blocked:** obtain the exact official Order54 PDF bytes via an allowed source. Its saved official URL returned HTTP403 anti-bot once; do not retry/bypass. Verify PVP46 table headings, Cat I–IV 230/250/320/500, period/payment clause and effective 2026-03-02. Reconcile the conflict with the AF-derived M‑1 interpretation; never change `observedAt` to hide age.
2. Re-evaluate the two aggregate records after Order54 verification; add a saved source path/SHA, source-backed category and payment mapping for M‑1, mark complete only if all four declared road systems and both payment views are covered. Keep transponder/no-transponder alternatives non-additive.
3. Review the Stage AG M‑11/M‑12 evidence and its noted M‑11 stale metadata caveat. The proposed strict evaluator currently accepts their saved document/date/matrix rows; it does not certify an individual route crossing or complete journey price.
4. The combined temporary strict run should be repeated only after M‑1 is resolved. Then present the unchanged `experiments/tariff-gate-proposal/approval.patch` and complete evidence package for owner approval. Do not apply it to mandatory CI before approval.

## Stage AF — historical next evidence step

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
