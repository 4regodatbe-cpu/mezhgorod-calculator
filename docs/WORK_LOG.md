# Work log

## 07.11.2026 — Stage AF: retained Avtodor evidence review, gate stays blocked

Continued from Stage AE `e2949a98d59651aaaab8e70e3c1802b64dd98a2d`. Reviewed the two aggregate other-roads registry IDs and the retained first-party tariff artifacts without re-observing or changing dates/rates. Visually inspected scanned Appendix p1 of Order53 (M‑3), Order56 (CKAD) and Order55 (A‑289); each confirms category-I pricing, payment basis and effective date 2026-03-02. Their retained paths and SHA256 are in `experiments/tariff-gate-proposal/avtodor-other-roads-evidence-2026-11-07.json`.

Stage AF evidence/test/docs commit: `273a462e1e1dab156f023432ce445cb2a88b35d0`.

Order54 is cited in saved registry metadata with the official URL and effective-date claim 2026-03-02, but the primary PDF is not retained. The raw official tariff-page response for the aggregate snapshot's 2026-10-01 observation is also absent. The derived snapshot is not treated as primary bytes. Thus the M‑1 33–66 row, payment mode and effective clause cannot be independently reviewed from a retained primary artifact. Both aggregate evidence rows remain incomplete and no `observedAt`, `effectiveFrom`, tariff amount, or active gate changed. Existing owner policy makes observation age a warning, not tariff expiry.

Added `coverageComplete` fail-closed validation to the isolated proposed assessor. Target command ran 3 test files PASS; the Stage AF/AE file has 8 tests. JS syntax, source PDF SHA checks, `git diff --check` and `git apply --check` passed. In a temporary `/tmp` copy, the unapproved patch plus actual prepared records produced stale warnings and expected strict exit2, because M‑1 is incomplete and the proposed schema also requires evidence for M‑11/M‑12. No temporary result is reported as CI or tariff PASS. Negative controls block absent evidence, wrong application date, material tariff contradiction and double-charge risk. Next: preserve/recover Order54 primary bytes at its known official URL (or an original tariff-page capture), assemble M‑11/M‑12 evidence from saved official artifacts, then request owner review of the exact patch package. No push/merge/Production; PR14 unchanged.

Bundle integrity/readback follow-up: `/workspace/stage-af-273a462.bundle` passed `git bundle verify`, requiring base `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`; SHA256 `e892bbe0206d2e94e6a49562494a0acb5ac6fe3783f0ad74e8b6e2a67dfe2cad`. Independent base seeding into a temporary checkout stopped before bundle import because the source partial/promisor repository could not fetch missing promised object `c22625803e0302fa28bbc613e62e647a8c004e2f`. Therefore bundle integrity and committed-file readback are checked, but standalone restoration is not claimed. A full object-complete source repository is needed to read back this incremental bundle.

## 07.11.2026 — Stage AE: approval-ready isolated tariff gate patch

Reviewed StageAD proposal against policy27–28Oct. Prepared isolated evaluator and exact unapplied patch: stale observation warns, material proof/date/product/conflict failures block, explicitly accepted working model may retain unknown legal effective date. No artificial validity end, observation edits or new prices. Default source check validates saved file/hash; semantic official-source review remains explicit evidence, not inferred from URL. Missing/duplicate evidence blocks. Tests6/6 new and3/3 targeted files PASS; patch check and isolated applied-copy negative integration PASS(exit2). Active gate/runtime/workflows unchanged. [Checkpoint](checkpoints/2026-11-07-stage-ae-DONE-LOCAL.md).

## 07.11.2026 — Stage AD local acceptance closure

Resolved external dependency-root symlink by frozen local pnpm install; Node24.19/pnpm11.25.0; unchanged lockfile. Added hard waits around non-cooperative transport/body operations and V3 shared90s budget, preserving provider25s deadlines and geometric selection. Added timeout/body disposal/late response/actual-handler temporal regressions, retained HTTP200 for rejected geometry and corrected geometryUsable. V3 long durations now use days/hours/minutes; V2 output default unchanged.

Final runtime candidate e4e070c8 preserves exact successful transport status through validation using private metadata (including200/201 regression). Offline1157 PASS/0 FAIL/1 SKIP, standard Turbopack build PASS, TS/lint PASS(9existing warnings), API smoke16, benchmark61, workflow contract6. Local real Chromium controlled API: desktop14/mobile14 PASS; two bounded live routes HTTP200/OSRM on runtime176e; four street searches: Krasnodar/Moscow street results, Donetsk/Yalta settlement-only partial. No historical502 cause inferred. Isolated freshness proposal with tests leaves mandatory30day gate unchanged/blocked. Full results and exact evidence: [Stage AD checkpoint](checkpoints/2026-11-07-stage-ad-DONE-LOCAL.md). No push/publication; primary91 history unchanged.

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
