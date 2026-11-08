# Stage AJ — close B03 and Preview acceptance blockers

- Status: STARTED; no new source data or runtime changes admitted yet.
- Start time (UTC): 2026-11-07 23:20.
- Source worktree: `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`, starting HEAD `f87428824ed15f46336474891dcfe16cbbc56d88`.
- Published branch before this block: `76a39da28a5fefa7aa7ec0f2c954114297d84b06`; read back from GitHub. PR #14 is OPEN/Draft.
- Exact previous Preview was READY on `76a39da…`; required B03 previously stopped before browser scenarios because the old four-entry snapshot expired at `2026-11-07T14:50:17.541Z`.

## Bounded source investigation already performed

- One bounded GeoNames Web Service request batch using the public `demo` account returned its official error code 18 (“daily limit ... exceeded”); no results were admitted and the client was not retried.
- A current official, independently licensed daily dataset was retrieved instead: `https://download.geonames.org/export/dump/cities15000.zip`, HTTP 200, `Date=2026-11-07T23:18:22Z`, `Last-Modified=2026-11-07T02:54:40Z`, 3,366,116 bytes, SHA-256 `37d3b39e88167155539dc4aaf93886527c5037b6a822087e48fe530baf8436b7`.
- ZIP integrity passed. Four exact GeoNames IDs are present with official localized alternate names and coordinates: 709717 (Donetsk; source country code UA, admin1 05/admin2 1408), 565348 (Donetsk, RU/admin1 61), 542420 (Krasnodar, RU/admin1 38), 501175 (Rostov-on-Don, RU/admin1 61). Per-record `modificationDate` values are 2026-07-02, 2026-07-13, 2026-08-30, and 2026-04-14 respectively; these must remain distinct from the retrieval timestamp.
- Source archive, attribution and HTTP manifest are preserved under `experiments/address-search/stage-i-2026-11-07/source/`. The old snapshot remains unchanged at this STARTED checkpoint.

## Planned bounded work and recovery

1. Build source-backed per-record captures from the exact retained archive, preserve original GeoNames IDs/alternate names/coordinates and mark app region display normalization separately from upstream admin metadata. Bind all rows to archive SHA and retrieval time; keep the maximum snapshot lifetime at seven days. If any record/provenance check fails, do not update the snapshot.
2. Add regression proving the capture rows match the retained GeoNames archive and required CC BY attribution while stale, malformed, expired, or wrong-ID data still fails closed.
3. Run target source/snapshot tests and existing B03 harness checks. Then ordinary push/readback to the authorized feature branch to run B03 and all 8 legacy + 10 current browser scenarios.
4. Use Playwright on the exact new Preview SHA, including selection, calculation, duration, toll/unknown, address replacement/swap, mobile/desktop and V2 preservation. If the protected Preview cannot be authenticated by an existing approved Vercel mechanism, record the exact block; do not create a broad/prolonged bypass.
5. Run the required final gate and all other workflows on the exact final SHA. Production remains unchanged unless every required check and Preview route acceptance succeeds.

No Photon retry, data-date extension, CI weakening, tariff/2GIS work, Production/main/Android/backup-ref changes, merge or force push has occurred. This STARTED record is not an acceptance result.
