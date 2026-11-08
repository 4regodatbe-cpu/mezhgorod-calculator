# Stage AJ — source-backed city snapshot candidate

- Status: DONE LOCAL; HOSTED B03/Actions/Preview acceptance PENDING.
- Date/time (UTC): 2026-11-07 23:32–23:50 (candidate reviewed before expiry).
- Local worktree: `/workspace/stage-ae-gate-proposal`, branch `codex/stage-ae-gate-proposal`.
- Base commit: `89eca232d8787788153daf5b2356f7f7fe76e822`.
- GitHub working branch head read immediately before candidate implementation: `89eca232d8787788153daf5b2356f7f7fe76e822`; recheck before write.
- PR #14: last project readback says OPEN/Draft; verify again before push and do not change its state.
- Production at task start: `a6bea89dd4b481a1352dc492969004e6cd1e6e38`, unchanged.

## Objective and decision

B03 `address-ui` had stopped before Playwright because the previous OSM snapshot expired at `2026-11-07T14:50:17.541Z`. Its expiry was not edited or extended. Photon’s earlier Donetsk live probe had HTTP 503/cooldown, while GeoNames Web Service demo had official quota error 18; neither endpoint was retried. The approved search architecture allows GeoNames for settlement selection, so the retained current official GeoNames daily `cities15000.zip` was used to refresh only the four already-reviewed settlement records. This does not add street lookup, bulk indexing, route/toll data, or a new V3 provider.

## Source and reproducible capture

Official source URL: `https://download.geonames.org/export/dump/cities15000.zip`.

- GET: HTTP 200; response `Date` / actual retrieval: `2026-11-07T23:18:22Z`.
- `Last-Modified`: `2026-11-07T02:54:40Z`.
- ETag: `"335ce4-65fa6d9a37351"`.
- Size: 3,366,116 bytes; ZIP integrity verified.
- Archive SHA-256: `37d3b39e88167155539dc4aaf93886527c5037b6a822087e48fe530baf8436b7`.
- Headers, manifest, source archive and CC BY 4.0 attribution are preserved under `experiments/address-search/stage-i-2026-11-07/source/`.
- `experiments/address-search/stage-i-2026-11-07/read-geonames-archive.mjs` extracts only the named ZIP member with Node built-ins; `build-captures.mjs` pins URL, source archive SHA and Last-Modified, validates all targeted rows, and regenerates four capture JSONs plus `data/address-city-snapshot.json`.
- Capture `sourceCommit` points to `89eca232…`, which contains the exact source archive. Record row `modificationDate` remains the original GeoNames value and is not overwritten with archive retrieval time.

Verified record identities:

| GeoNames ID | Official source name / localized alias | Country/admin codes | Coordinates `[lat, lng]` | Raw source-row SHA-256 | Product display policy |
|---|---|---|---|---|---|
| 709717 | `Donetsk` / `Донецк` | UA / 05 / 1408 | 48.023, 37.80224 | `b6b5ef07de9f0858a7e2a136e8a69a311e95683f1a54cac1c914febd988561d4` | Existing DNR label; GeoNames upstream codes are preserved. Coordinate classifies as `dnr` against retained OCHA ADM1 geometry. |
| 565348 | `Donetsk` / `Донецк` | RU / 61 / (empty) | 48.33711, 39.95229 | `923a9db30fe7e9642e2b724b1b2bc49fa8d7a7bba4d60cfb100dbd97724638a0` | Existing Rostov-region disambiguation. |
| 542420 | `Krasnodar` / `Краснодар` | RU / 38 / (empty) | 45.04534, 38.98178 | `6da2f3167fcfc8734a6b020a1dfe329873490632a3bf7d4f14b0f89b5f46ca42` | Established Krasnodar Krai label. |
| 501175 | `Rostov-on-Don` / `Ростов-на-Дону` | RU / 61 / (empty) | 47.21997, 39.70769 | `b8e68df254ac702afae7a3d3f559bc650149b38caf87efa2681e6d8ed550fb04` | Established full name/region; alias `Ростов` remains usable. |

Per-capture JSON hashes are in the generated manifest output and validated again by the test. Snapshot `reviewedAt` is the actual local review time (`2026-11-07T23:33:29.752Z` in this candidate); `expiresAt=2026-11-14T23:18:22.000Z`, exactly seven days from the actual HTTP retrieval timestamp, not the cities’ modification dates. Re-running the generator does not move this expiry forward.

## Code and test changes

- `data/address-city-snapshot.json`: four source-backed GeoNames settlements; CC BY 4.0 license; seven-day bound; stable exact records hash.
- `lib/address-city-snapshot.ts`: recognizes only exact ODbL-1.0/OpenStreetMap or CC BY 4.0/GeoNames attribution tuples; permits the bounded `geonames-<id>` source ID and preserves strict expiry/hash/coordinate/search checks.
- `app/v2/components/address-field.tsx`, `app/v2/components/types.ts`: carry the endpoint’s exact attribution and license through result selection and A↔B; only recognized license tuples render a credit. A fallback response with missing/unrecognized attribution fails closed into UI error rather than guessing a credit. The legacy calculation request and tariff logic are unchanged.
- `experiments/address-search/stage-i-2026-11-07/build-captures.mjs`, `read-geonames-archive.mjs`, `captures/*.json`: reproducible source extraction, immutable per-row provenance and distinct product display normalization.
- Snapshot, endpoint, Rostov identity, V2/V3 SSR, and B03 harness contract tests updated. The legacy eight-case browser harness fixture now returns the exact API fallback metadata (license name, URL, attribution, snapshot ID/scope/expiry) and checks the dynamic source link. Existing ten current input-flow scenarios and B03 mandatory workflow steps are not weakened.
- No route, tariff, calculation, Android, main, backup-ref, or 2GIS change.

## Checks actually run

- Candidate source generator: PASS; archive identity and four row hashes recorded above.
- Five focused suites: `scripts/address-city-snapshot.test.ts`, `scripts/address-city-snapshot-endpoint.test.ts`, `scripts/rostov-local-search.test.ts`, `scripts/v3-calculator-form-ui.test.mjs`, `scripts/b03-browser-workflow.test.mjs` — **32/32 PASS**.
- Full `pnpm test:audit` in subprocess-capable approved execution context — **1177 PASS / 0 FAIL / 1 SKIP**. The single existing skip is explicitly gated by `GEONAMES_TEST_DIR`; it is not a failure or a claimed live test.
- `pnpm exec tsc --noEmit`: exit 0.
- `pnpm lint`: exit 0, 9 warnings (all outside changed files; no lint errors).
- `node node_modules/next/dist/bin/next build`: exit 0; Next.js 16.3.4 Turbopack compiled, typechecked and generated 16/16 static pages. Existing deprecation warning for `preferredRegion` remains.
- `git diff --check`: clean at review time.
- An initial run of the full audit in the restrictive sandbox reported three child-process-suite failures; no assertions/tests were changed. Re-running the unchanged full gate with the available process permissions passed 1177/0/1. This is recorded as environment-dependent, not a code workaround.

## Not yet performed / release guard

- Candidate is not committed/pushed yet; new commit SHA must be recorded after commit.
- B03 Actions, including the actual legacy 8 + current 10 browser cases, have not run on this candidate yet. A valid snapshot freshness preflight alone is not acceptance.
- Exact-SHA Vercel Preview, protected browser authorization, Playwright route calculations, and desktop/mobile/V2 checks are pending.
- No Production deployment has been made. Previous Production SHA is unchanged. Do not publish until every required workflow and exact-Preview P0/P1 check passes. Keep PR #14 Draft; do not change `main`, Android, or backup refs.

## Next action

Recheck that the current remote feature SHA is the base `89eca232…` and PR #14 remains Draft; confirm local diff contains only the listed snapshot/address/B03/doc files; create a local candidate commit and push it using one ordinary non-force fast-forward. Verify GitHub readback, then inspect all Actions and the 8+10 B03 browser artifact before Preview acceptance.
