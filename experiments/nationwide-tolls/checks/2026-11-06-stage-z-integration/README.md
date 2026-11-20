# Stage Z — bounded M‑11/M‑4 integration report

Date: 2026-11-06 UTC. Status: **M‑4 integration local / M‑11 blocked / not ready to publish**. Worktree `/workspace/stage-z-tariff-integration`, branch `codex/stage-z-tariff-integration`, base `d60e733313860d2412d8be64f4be10ef71f7de28`. PR #14 was not modified; no push, merge, Preview or Production action was made.

## Inputs, provenance and isolation

- Stage X/Y final tree came from `/workspace/stage-w-m4-tariffs`, final SHA `efb12521f64168d265343b550ef207158e8645c2`, and was applied as its net diff against d60 rather than merging its history. This retains Stage X's final source-correct M‑4 state and excludes the invalid intermediate Stage W result.
- Stage V selected-route trace implementation came from `/workspace/stage-v-m4-integration`, implementation commit `7226a82250c34b0b44733919cd48da3225f6fad1`, plus its saved-route/source evidence. No long branch history was merged or cherry-picked.
- The protected primary repository HEAD `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe` and safety ref, Stage V/X/Y worktrees, remote branch `d60e733…`, main and Production were not changed.

### M‑11 — not integrated (blocked on evidence delivery)

The expected archive `2gis-diagnostics-stage8-2026-11-06.tar.gz` with SHA-256 `310d3b70f53e79057e45927beb3edf448f08ca0a17200f782e1eb8f40f223918`, reported patch `136a5a72f1488ce7617d55e9f09648f3376d2ba7`, and handoff `79a09e81ce858874106b1d4af43ec1066380e8a9` were absent from all searched workspace files; those Git objects are also unavailable locally. No 2GIS/API request, web lookup, or independent tariff audit was performed. M‑11 runtime/source/matrix at d60 remain unchanged, and the reported 210 directed cells / 60 changed fares were not accepted as evidence.

To continue, deliver the archive with the stated checksum or provide the exact equivalent files: (1) original official M‑11 price documents and effective-date evidence plus evidence manifest; (2) complete historical and new `data/tolls/m11/` snapshots/matrix and generation inputs; (3) changed `lib/toll-engine/m11-moscow-schedule.ts`, `m11-moscow-production.ts`, `m11-current-tariffs.ts`, `lib/v3-calculation/m11-product-boundaries.ts`, and any `route-leg-pricing.ts` delta; (4) Stage 8 regression tests and fixtures for both products (15–58 and 58–679), direction, vehicle/payment category, old/new versions, and all boundary/special-day cases; (5) Stage 8 report, checkpoint, exact changed-file manifest and SHA256 list. The source file hashes must be verifiable before accepting the patch.

The boundary `2026-11-02T01:00:00+03:00` cannot be judged from the missing implementation or reported matrix. In particular, no departure-time substitution for payment-point entry/exit time is asserted. Preserve M‑11 unknown/estimate behavior until the official period-selection rule and route timing can be verified.

## M‑4 — integrated final Stage X/Y data and Stage V trace safety

Stage X established that saved Order 58 (27 February 2026; effective 2 March 2026) has Category I weekday/weekend columns and separate category rows. The erroneous Stage W interpretation is not used. The selected checks include PVP 62 220/220 ₽ and PVP 71 310/400 ₽, Category I, with the corresponding weekday/weekend profiles. A lower-bound date guard leaves earlier dates unknown. The exact raw HTML of the later posted table and its legal effective date were not preserved; this integration does not present that undated later table as verified current price evidence.

The final net M‑4 diff changes 17 ordinary and 3 mixed source values, with four external-only controls retained as `unknown`; incomplete component totals remain null. `M4_ACTIVE_ENDPOINT_REGISTER.json` changes by 16 insertions/8 deletions, not by a 722-row rewrite; `TARIFF_SELECTION_REGISTER.json` has no diff against d60. The Stage X source restore snapshot and deterministic restore script are included as evidence. Route geometry and selection are unchanged. Saved Yalta→Rostov 2,060/2,210 ₽ remains an unconfirmed component-derived estimate, not an operator-confirmed full-route fare.

Stage V adds exact directed-route binding for M‑4 trace evidence. `TollValidation.routeSignature` is computed from the selected route. `validateKnownM4Plazas` reuses complete booth events only when the signature matches. For a complete matching trace, a paid booth event confirms; explicit free/no corresponding event rejects proximity-based attribution; an ambiguous booth edge remains unknown. A stale/foreign trace is not reused. This prevents a PVP trace from being transferred across candidate geometries and preserves unknown for incomplete geographic evidence. No other route-selection policy or toll-road rates changed.

When composed with Stage X, Stage V regression assertions had to change PVP71 amounts from old `400/500` to Order 58's `310/400` for Thursday/Friday test instants. The suite demonstrated this mismatch at runtime; only test descriptions/expected values were corrected. The staged M‑4 source data was not modified to satisfy the older assertions.

## Changed runtime/data scope

Runtime files changed:

- `lib/toll-engine/m4-data.ts` — corrected Category I Order 58 source values and supported date profile.
- `lib/toll-engine/m4-route-validator.ts` — exact route-signature gate and complete negative-event semantics for M‑4.
- `lib/toll-validator.ts` — attach the directed route signature to validation results.

Research/source-data and regression files change as shown by `git diff --stat` from the candidate base. No file under M‑11 source/runtime, `route-leg-pricing.ts`, M‑12, CKAD, ZSD, route geometry or selection policy changed. V2, Android, UI and Production were untouched.

## Checks actually run on this candidate

- M‑4 tariff/source/calendar/register plus saved-route/trace/regression direct test command: **15/15 PASS**.
- Adjacent road regression selection: `v3-ckad-alias-coverage`, `v3-m11-products`, `v3-m12-product-boundaries`, `v3-zsd-finished-vector`, `v3-zsd-planernaya-identity`: **5/5 PASS**.
- `node experiments/nationwide-tolls/scripts/quote.test.cjs`: **PASS** (numeric/null/unknown and API adapter contract assertions).
- `node --check experiments/nationwide-tolls/scripts/restore-m4-order58-endpoint-register.cjs`: **PASS**; four source/evidence JSON files parse; `git diff --check`: **PASS**.
- `./node_modules/.bin/tsc --noEmit`: **PASS, exit 0**.
- Scoped ESLint for all changed TS/TSX/MJS/CJS files: **PASS, exit 0**; no warnings/errors.
- `./node_modules/.bin/next build --webpack`: **PASS** on Next 16.3.4; compilation, embedded TypeScript, page data and 16 static pages completed. One non-blocking `preferredRegion` deprecation warning was emitted.
- Full direct offline script glob and quote/API check: **190 PASS / 5 FAIL of 195**, not a full-gate pass. Exact test log: `full-offline-tests.log`; quote/API log: `quote-api.log`.
  1. `audit-child-process`: sandbox wrapper fails to forward child stdout/stderr.
  2. `automatic-policy-replay-integration`: nested `spawnSync` denied; mock output fixture then missing.
  3. `systemic-audit-report`: nested `execFileSync` denied with sandbox `EPERM`.
  4. `v3-ckad-m11-m12-boundary`: local-only fixture from protected history is absent from published d60; no fabricated fixture was added.
  5. `v3-live-browser-hydration`: available lock-identical dependency tree lacks `@playwright/test`; module loading fails before Chromium. Stage V previously observed an additional browser sandbox `setsockopt`/SIGTRAP failure in its worktree; this current run does not claim to have reached browser launch.
- The command-equivalent full gate was run directly because the unchanged Stage Y `pnpm test:audit` wrapper had already failed before tests with exit 254 attempting its store path under `/home/agent`; that wrapper failure was not reattempted. Tests were not weakened.

The dependency symlink used to reuse a tree with matching `package.json`/`pnpm-lock.yaml` was temporary and is removed before commit. No install, network, API or tariff query was issued during Stage Z.

## Decision and next step

M‑4 Stage X+V is a bounded local integration with targeted PASS evidence; M‑11 remains unintegrated. The combined M‑11/M‑4 product candidate is therefore **not complete and not ready for publication**. The full gate also remains non-green. Next: verify and receive the named Stage 8 archive/evidence set; then inspect tariff chronology, product/direction mapping, time-bound selection and tests before integrating only verified M‑11 changes. Afterward rerun combined controls and the full required gate on a dependency-complete supported runner. No push or external publication is authorized.
