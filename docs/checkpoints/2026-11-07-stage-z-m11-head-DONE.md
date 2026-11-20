# Stage Z — M‑11 15–58 directed tariff adapter

- Status: DONE for the isolated M‑11 code block; combined M‑11/M‑4 gates remain pending.
- Branch/worktree: `codex/stage-z-stabilization`, `/workspace/stage-z-stabilization`.
- Block started from code-stage parent `81bf253dcb4fe4a632b4389865691674a4787e50` (handoff source verification is already committed there). The larger assignment's protected base remains `0dc9560450128f73590c6ca521ef5f176bb62db1`.
- No push, merge, Production, Preview, main, Android, V2 or PR #14 change.

## Changes

1. Added `data/tolls/m11/2026-11-02-15-58-category1-no-transponder.json`, an exact copy of the manifest-verified current official matrix (42 directed pairs, 210 cells), SHA-256 `b801eb896b4a29848e49164498d4b25041adda54950dbb708c1c23185c519279`. Official source PDF SHA-256 is `543bf97c5ab7900897440c3432b735db86e5707b21417f3f8e35b3a8764bc835`.
2. Updated `experiments/nationwide-tolls/engine/m11-head-route-adapter.mjs` to use exact dated official April/November editions and direct directed matrix lookup. The edition changes at precisely `2026-11-02T01:00:00+03:00`; tariff-day and holiday profiles follow source metadata. Missing point pair is `unknown/null`; no nearest-row or direction fallback.
3. Added six tests in `experiments/nationwide-tolls/engine/m11-head-route-adapter.test.mjs`. Extended `experiments/nationwide-tolls/engine/m11-ckad-route-adapter.test.mjs` with composition and duplicate/overlap guards. M‑11 58–679 tariffs remain in their separate data/model; no M‑4/M‑12/CKAD price data changed.

## Decisions and sample results

No independently validated actual exit-PVP clock is present. Preserve current V3 departure-time estimate; the output period/segment says that operator pricing is selected at PVP exit and this is not exact actual charge. Test boundary results: Nov 2 00:59:59 Moscow time uses April/Sunday value 1,260 ₽ for Moscow→Solnechnogorsk; exactly 01:00:00 and +1 second use November/night 850 ₽. Nov 3 special-Friday and Nov 4 special-Saturday both return 1,500 ₽ for that pair. Reverse Solnechnogorsk→Moscow on Nov 6 Friday returns its directed cell 1,260 ₽. Unsupported P214→P58 stays `null`.

## Actual checks

- Six existing source/evidence tests: **6/6 PASS** (recorded in handoff evidence checkpoint).
- New adapter tests: **6/6 PASS**.
- Selected-route M‑11 boundary tests: **7/7 PASS**.
- Existing M‑11/CKAD adapter tests: **2/2 PASS**, including route product composition guard.
- `git diff --check`: PASS before checkpoint creation.
- M‑4-specific suite/API contract and general TS/ESLint/Webpack/full offline gate are not claimed here; they remain the next block.

Detailed code/data/control results: [Stage Z report](../../experiments/nationwide-tolls/checks/2026-11-07-stage-z-m11-m4/README.md). Handoff checkpoint: [verified evidence](2026-11-07-stage-z-handoff-evidence-DONE.md).

## Next step

Run M‑4 saved-route/62–71/selected-trace/A‑289 checks plus multi-road and unknown/null API contracts without editing M‑4 data. Then run dependency availability diagnostics and the required local static/build/offline gates, recording each actual outcome.
