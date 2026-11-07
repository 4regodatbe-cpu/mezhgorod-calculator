# FINAL V3 release preflight — BLOCKED (2026-11-07)

## Status and scope

**BLOCKED / LOCAL ONLY; no push, Preview, or Production deployment.** The final release cannot honestly be declared ready because the mandatory strict tariff gate exits 2, and a single bounded local live route audit received HTTP 502 for all six cases after all three route providers failed at the network layer. The repository's primary local history was not modified.

- Repository: `4regodatbe-cpu/mezhgorod-calculator`
- Isolated worktree: `/workspace/stage-ae-gate-proposal`
- Branch: `codex/stage-ae-gate-proposal`
- Candidate code SHA tested: `cf8dde540156ce9bef649ef88453f0195b366bae`
- Local closeout commits: `4edb654b25bb3df1e0c338fcf90d1328fa458798` and `4b82f302a2b77383c0bc44d0447a9368235aca2e`; this final metadata record is documentation-only.
- Candidate ancestry: 31 commits ahead of remote feature SHA `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; this remains an isolated candidate.
- 2GIS handoff: exact commit `75808f17b87cb0550f0a6c29735f6c7001b13511` on `handoff/2gis-evidence`.
- Remote feature readback: `git ls-remote` returned `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`.
- PR #14: open and Draft (public API readback); Production remains at previously verified SHA `a6bea89dd4b481a1352dc492969004e6cd1e6e38`.

## Preserved implementation/evidence

The exact 2GIS handoff package was verified without making API requests: all 441 declared manifest entries matched byte length and SHA-256; package verification passed (129 files, valid JSON and hashes); policy review passed 11/11; continuation verification passed 10/10; live-result verification reported 44 unique attempts (43 HTTP 200, 1 HTTP 429), with no calls made by the verifier. Accepted values remain narrowly scoped working calculations, not universal corridor prices: M4 B05 Taman→Voronezh 320 ₽ Mon–Thu / 410 ₽ Fri–Sun/holidays; complete directed CKAD M11→M12 981 ₽; Pulkovo↔M11 38 ₽ per direction. Ambiguous crossings and incomplete totals remain `unknown`/`null`. No new API call was made.

Stage AH's isolated M1 candidate corrects PVP46 Category-I no-transponder 250→230 ₽. The official Russian Highways announcement 141463 supports the passenger base 230 ₽ and distinguishes the 195.50 ₽ maximum loyalty price. Original Order54 PDF bytes remain unavailable; no PDF SHA is claimed. Formal Category-I/payment-column mapping remains owner-attested. The product evaluator assesses 14/14 products as `PASS_WITH_WARNINGS` with 21 warnings; negative controls still block missing sources, invalid/future dates, tariff conflicts and double-charge risk. This is not the active mandatory CI result.

## Mandatory gate — not changed

The attached release request says that if the mandatory gate needs separate approval, prepare the exact patch rather than bypassing it. Accordingly, any attempted change to `.github/workflows/calculator-final-gate.yml` and `scripts/check-tariff-freshness.mjs` was removed; the required gate was not altered. The proposal remains at `experiments/tariff-gate-proposal/product-gate-approval.patch`.

Command:

```sh
TARIFF_AS_OF=2026-11-07 TARIFF_STALE_STRICT=1 node scripts/check-tariff-freshness.mjs
```

Actual result: exit 2, `stale=2`, `invalid=0`, `effectiveDateUnknown=3`. Both stale entries are aggregate Avtodor views (`...category1-transponder` and `...category1-no-transponder`), observed 2026-10-01 with a 30-day threshold (37 days old on the assessment date). No observation date or freshness threshold was changed.

## Checks actually run

| Check | Actual result |
|---|---|
| Full `pnpm build` | PASS, exit 0: offline suite 1,175 passed / 0 failed / 1 skipped; Next.js 16.3.4 Turbopack compiled and built routes |
| `pnpm exec tsc --noEmit` | PASS, exit 0 |
| `pnpm lint` | PASS, exit 0; 0 errors, 9 warnings |
| `node scripts/calculator-final-gate-workflow.test.mjs` | PASS, 6/6 |
| `node scripts/tariff-gate-approval.test.mjs` | PASS, 8/8, including negative gate controls |
| `scripts/api-contract-smoke.mjs` against local production server | PASS, 16/16 contract checks; invalid requests returned expected HTTP 400 |
| Built candidate UI, controlled API, desktop + mobile | PASS, 28/28; report identifies `LOCAL_BUILT_UI_CONTROLLED_API`, `liveProviders=NOT_RUN`; screenshots in `/tmp/final-v3-local-browser/` |
| Required strict tariff freshness | **FAIL/BLOCKED**, exit 2 as above |
| Bounded live V3 route audit | **FAIL/ENVIRONMENT-UNRESOLVED**, 0/6: each calculation returned 502; Valhalla, OSRM and BRouter attempts reported `failure=network`, `httpStatus=null`; no geometry or toll amounts returned. No retry performed. Sanitized summary: `/tmp/final-v3-route-audit.json`. |
| GitHub Actions / Preview | NOT RUN for candidate SHA; publication did not proceed because required gates were not successful |

`git diff --check` passed. ESLint's 9 warnings are existing and unrelated. Local API/UI results are not hosted CI and do not establish live-provider routing.

## Changes retained in this closeout

Two focused regression expectations were corrected from 250 to 230 ₽ to match the isolated Stage AH data/source interpretation:

- `scripts/segment6b-other-road-tariff-snapshot-test.ts`
- `scripts/segment6c-other-road-evidence-contract-test.ts`

The shared result component lives under `app/v2` but is also called by V3. A temporary attempt to move formatting wholly into V3 caused the browser to show `25 ч 0 мин` for the V3 summary; that change was removed. The retained shared-card branch uses day formatting only when `showFastestSummary` is true, a prop passed only by V3's `fastestOnly` branch. V2 uses the unchanged default (`duration()`), and the regression confirms V2 still prints `25 ч 0 мин`. The candidate therefore contains two shared V2-component source paths, but no Android paths or Android workflow changes; the existing V2 runtime presentation is preserved.

No route geometry, route selection, Android or Production code changed in this closeout. The shared component's V3-only `showFastestSummary` branch is retained because the built browser verified the day label; ordinary V2 cards keep the legacy output. The closeout also corrects M1 regression expectations.

## Next safe action

Obtain the owner's decision on applying the exact product-level gate proposal, or provide independent current official evidence that makes the existing strict gate pass without changing its threshold/date. Then rerun the full gate. For provider failures, inspect hosted provider-level diagnostics only after a releasable candidate exists; do not repeat the same local network test. Only then can the authorized push/Preview/Production sequence proceed.
