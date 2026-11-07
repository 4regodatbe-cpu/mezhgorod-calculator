# Work log

## 2026-11-07 — Stage AC reliability implementation, PARTIAL LOCAL

Implemented safe typed provider diagnostics, upstream HTTP status retention, bounded reason codes, request-local validator/selection outcomes; preserved shared legacy messages for V2. V3 now separates homogeneous timeout/corridor/no-route outcomes from generic upstream failure. Added actual-handler controlled partial-failure regressions and ten-city GeoNames controls. Three providers independently survive competing HTTP/timeout/invalid-geometry/slow failures; all invalid geometries yield HTTP 502.

Full offline on implementation: 1148 PASS/0 FAIL/1 SKIP plus subsequent expanded provider test PASS. TypeScript, ESLint (9 warnings), Webpack build, benchmark61, harness6, API smoke16 PASS. Standard Turbopack rejects external node_modules symlink. Real street/browser and the complete temporal matrix remain unverified. No live provider calls, push or Production writes. See [Stage AC detailed checkpoint](checkpoints/2026-11-07-stage-ac-PARTIAL-LOCAL.md).

Append-only summary of substantial project work. Detailed evidence remains in stage checkpoints.

## 2026-11-07 — Stage AB: offline all-provider failure contract; hosted release remains blocked

- Source base: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; isolated local branch `codex/final-gate-v3-repair`; implementation/test SHA `9ac745c35500e4bfcb04cf3411806be8a4887d44` (docs closure follows locally). Main developer worktree and its 91-commit history were not modified.
- Added `scripts/v3-all-routing-providers-unavailable.test.ts`: mocks Valhalla, OSRM, and BRouter upstream responses as HTTP 503, exercises the real V3 handler, and asserts generic HTTP 502 with no fabricated route/legs/options and one call per provider. Added it to the existing V3 final-gate targeted suite and harness static contract. Runtime, routing selection, toll data and tariff code unchanged.
- Preserved six earlier bounded route outcomes; no additional routing API calls made. Two requests (Tver→Adler; Golubitskaya→Saint Petersburg) previously returned HTTP 502 after all provider stages failed, but saved evidence lacks per-provider status/exception, so exact historical cause remains unknown. The regression proves fail-closed behavior under the synthetic all-503 condition, not that the historical provider errors were 503.
- Official source freshness was not refreshed: GET `https://avtodor-tr.ru/road/tariffs/` on 2026-11-07 returned HTTP/2 403 DDoS-Guard. Search-index copy is approximately two months old and cannot establish current effective date. The two October 1 registry rows remain stale; no amount or `observedAt` was changed.
- Tests on code SHA `9ac745c3…`: targeted route/error tests 2/2 PASS; final-gate harness 6/6 PASS; both V3 readiness checks PASS; route benchmark 61 records PASS; TypeScript PASS; ESLint exit 0 (9 existing warnings); `pnpm build` 1143 PASS / 0 FAIL / 1 SKIP; YAML/JS syntax and `git diff --check` PASS. Strict freshness correctly exits 2: two stale, zero invalid, three unknown effective dates. Local API smoke against local production server passed 16/16 only after environment-approved local access; it is not a hosted Actions result. No GitHub Actions run exists for the unpushed candidate.
- Source hashes and HTTP/blocker evidence: [Stage AB manifest](checkpoints/2026-11-07-stage-ab-manifest.json). Full terminal record: [Stage AB DONE-LOCAL](checkpoints/2026-11-07-stage-ab-blocker-closure-DONE-LOCAL.md).
- No push or publication; PR #14 remains Draft. Candidate is **not release-ready** until current official tariff evidence is obtained and the exact candidate passes hosted mandatory Actions, including strict freshness/live route outcome.

## 2026-11-07 — Stage AA: V3 final-gate and route diagnosis

- Base/published head: `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; isolated branch `codex/final-gate-v3-repair`.
- Implemented and locally committed final-gate/harness corrections at `da4e362013ddbe2e2fb7ed9e3ed44d1ea4f3ab2f`.
- Old “nine failures” were V2 calls and unsupported expectations; no V3 runtime defect established. Four of six bounded V3 routes returned HTTP 200; Tver→Adler and Golubitskaya→SPB returned HTTP 502 after all three route providers failed, with no finer status exposed. Two M‑12 full toll results remain `unknown/null` because the direct tariff pair/boundary is unproven.
- Replaced deleted workflow script references with current executable checks and added a V3-only bounded live diagnostic without persisting provider geometry/raw payloads. V2 remains explicitly covered.
- Full build: 1142 passed, 0 failed, 1 skipped; TypeScript PASS; ESLint exit 0 (9 warnings); webpack build PASS; final-gate harness 6/6; API smoke 16/16; route benchmark 61 PASS. Standard Next/Turbopack build passed. Strict tariff freshness remains blocked by two October 1 snapshots at 37 days vs 30-day threshold, with effective dates unknown.
- No runtime/pricing/geometry edits. No push or publication. PR #14 remains Draft.
- Detailed results: [Stage AA checkpoint](checkpoints/2026-11-07-stage-aa-v3-final-gate-DONE-LOCAL.md).
