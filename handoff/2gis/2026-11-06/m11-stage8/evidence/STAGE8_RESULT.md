# Stage 8 — official tariff mapping and isolated M-11 correction

Date: 2026-11-06. Branch: `codex/2gis-diagnostics`.

## Proven M-11 rule and correction

The operator's current Category-I no-transponder Appendix 3 took effect at 01:00 Moscow time on 2 November 2026. It contains 42 directed PVP pairs and separate weekday, Friday, Saturday, Sunday, and night profiles. The rules for Section 15–58 define a closed toll system: identify the entry PVP, charge at the exit PVP, use the actual entry/exit pair, and apply the fixed fare current at the exit PVP passage time.

The legacy full-route M-11 calculator used the prior April tariff file with no date boundary. The direct Moscow→Solnechnogorsk cells changed as follows:

| Profile | Through 2026-11-02 01:00 | From 2026-11-02 01:00 |
|---|---:|---:|
| Night | 880 ₽ | 850 ₽ |
| Mon–Thu, 06:00–01:00 | 1,130 ₽ | 1,130 ₽ |
| Friday, 06:00–01:00 | 1,650 ₽ | 1,500 ₽ |
| Saturday, 06:00–01:00 | 1,650 ₽ | 1,500 ₽ |
| Sunday, 06:00–01:00 | 1,260 ₽ | 1,260 ₽ |

Added the dated November matrix and exact-instant edition selection to the V3 PVP-pair adapter, covering all 210 directed/profile cells. Sixty cells differ from the April edition. PVP18→Solnechnogorsk changed Friday/Saturday/Sunday from 320/320/310 ₽ to 300/300/300 ₽; reverse Solnechnogorsk→PVP18 changed from 220/240/320 ₽ to 210/230/300 ₽. Tests compare all 210 new cells against the official extracted matrix. The legacy full-route calculator also selects the dated November snapshot while retaining April data for historical dates; its direct Moscow→Solnechnogorsk values changed in the night and Friday/Saturday profiles. The prior 06:00–01:00 day's tariff carries through 00:59, then the new night value begins at 01:00. In the full-route fixture, weekday total stays 5,330 ₽ and weekend maximum changes from 6,590 ₽ to 6,440 ₽.

The existing V3 policy freezes an estimate's tariff calendar at the trip departure instant. The operator's actual rule selects the fare at exit-PVP passage. A trip that starts before a tariff effective-time or profile transition and reaches the PVP after it can still differ from the actual charge; this patch versions the correct edition at departure and does not change that pre-existing estimate policy.

The Stage 7 PVP18 request cannot be retrospectively priced: its 6,369 m response geometry was not retained for directed boundary matching, and aggregate payment fields do not identify the fare product. No current charge is inferred from that response.

## Other operator evidence reviewed

**M-4 PVP545:** The three requested Avtodor URLs returned HTTP 403 anti-bot challenge pages in this session. Existing local historical material says PVP545 serves tariff sections 517–544 and 544–589 and has route-conditioned examples, but does not establish the current lane-to-product rule or a currently effective fare edition. The calculator's existing PVP545 guard remains fail-closed. No price was copied and no code changed.

**ZSD:** Retained operator sources confirm a zonal fare model, directed definitions of zones 1–6, a Category-I base fare table for ordinary cash/card payment, and current usage rules effective 1 October 2026. Rule 6.2.17 permits no second barrier payment for the special Automobile Street↔Blagodatnaya Street passage only if the first cash receipt is retained and presented at the next barrier within 60 minutes (or the period printed on that receipt). This is not a general exemption for a road re-entry. Existing isolated code handles only source-proven ZSD coverage; no physical traversal with the required receipt evidence was available for another patch.

**M-12 and CKAD:** No new tariff claim or API request was needed for this fix. CKAD `outcome_unknown` remains no-retry.

## Verification

- M-11 production regression: PASS; includes old/new rate boundary, holiday overrides, and full-route totals.
- M-11 V3 product suite: PASS; compares all 210 current cells, all 210 historical cells, both PVP18↔Solnechnogorsk directions, and the 01:00 tariff boundary.
- V3 time-calendar suite: 1/1 PASS.
- TypeScript: `pnpm exec tsc --noEmit` PASS.
- Scoped ESLint: PASS.
- `next build --webpack`: PASS.
- Standard Turbopack build: blocked by sandbox bind-port `EPERM` while processing CSS.
- Full `pnpm run test:audit`: 187/190 PASS. The three failures are unrelated tests requiring child processes (`audit-child-process`, `automatic-policy-replay-integration`, `systemic-audit-report`); a direct probe in this environment returns `spawnSync` error `EPERM`. The changed M-11 and V3 calendar tests pass.
- 2GIS API calls in Stage 8: 0. New quota debit: 0. Prior Stage 7 actual post-call quota remains unread.

## Primary source files

- Current M-11 Appendix 3 PDF: `https://m11-neva.ru/upload/iblock/418/q6jhzdwnwegcud7xfjcsutj7ssa081m6.pdf` (HTTP 200, SHA-256 `543bf97c5ab7900897440c3432b735db86e5707b21417f3f8e35b3a8764bc835`).
- Extracted current 42-pair/210-cell matrix: `experiments/nationwide-tolls/source-snapshots/2026-11-02-15-58-category1.json`, SHA-256 `b801eb896b4a29848e49164498d4b25041adda54950dbb708c1c23185c519279`.
- M-11 Section 15–58 rules Appendix 2: `https://m11-neva.ru/upload/iblock/9df/hy1rclk2b7jx0sa8p18s8lgtnyhxy4d8.pdf` (HTTP 200, SHA-256 `b710fe6e194efb9c9d1cff6f8a7328e02dbfac2df3f3b3cf9b399833837f7d9e`).
- Avtodor requested pages: 2016 article, tariffs, and current rules returned HTTP 403; no new primary-source conclusion admitted.
- ZSD raw snapshots and hashes are in `experiments/nationwide-tolls/source-snapshots/zsd/2026-10-17-kad-ekateringofka/source-manifest.json` and `experiments/nationwide-tolls/source-snapshots/zsd/2026-10-18-rvp64-current-rules/current-rules-Pravila0926.pdf.metadata.json`.

Checkpoint: [Stage 8 M-11 tariff correction](../../docs/checkpoints/2026-11-06-2gis-stage8-m11-tariff-fix-DONE-LOCAL.md).
