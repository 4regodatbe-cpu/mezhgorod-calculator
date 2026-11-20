# Stage Z stabilization — DONE LOCAL / hosted gates pending

Date: 2026-11-06 UTC. Status: **local work complete; not release-ready**. Branch `codex/stage-z-stabilization`, worktree `/workspace/stage-z-stabilization`. Original Stage Z tree `/workspace/stage-z-tariff-integration` remains at `40d650a29ee06643ee325402c3c4f7fead302dd9`; this candidate is descended from it. PR #14 stays Draft. No push, merge, Preview, Production, main, Android or V2 change.

## Work performed

- Corrected `scripts/v3-ckad-m11-m12-boundary.test.ts`: historical fixture equality omits only generated `routeSignature`; a separate assertion binds that value to the exact route geometry. Confirmed source capture/route fixtures are already present in d60; no historical evidence was manufactured or edited.
- Renamed browser-only `scripts/v3-live-browser-hydration.test.mjs` to `scripts/v3-live-browser-hydration.browser.mjs`. Updated the dedicated workflow and static workflow contract. The delayed-hydration test remains explicitly required by `v3-live-browser-acceptance.yml`, which provisions pinned Playwright 1.56.0 and Chrome; it is now correctly outside `scripts/*.test.mjs` offline-gate glob.
- Corrected a stale M‑4 saved-route assertion in the same CKAD/V3 test. This historical Voronezh trace includes only 1 recorded response for 5 current validation attempts; four replay responses are absent. Current result is `componentAudit.status=unknown`, M‑4 component null, API `unknown/null`. The prior 7,254 ₽ record is explicitly `unconfirmed`; the test no longer represents it as a complete exact total. This is fail-closed test-only behavior; no fare/routing/runtime changed.
- Updated WORK_STATE, nationwide toll WORK_LOG and NEXT_STEPS; report and full offline-gate output are saved at [Stage Z stabilization evidence](../../experiments/nationwide-tolls/checks/2026-11-06-stage-z-stabilization/README.md). Existing Stage Z STARTED/DONE, Stage X/Y/V and older records remain unchanged.

## Checks performed

- Targeted CKAD/V3 saved-route replay run directly: **8/8 PASS**.
- M‑4 PVP62/71 saved route, selected-trace reuse, M‑4/A‑289 composition, A‑289 long/short route: **5/5 test files PASS**.
- Static browser workflow contract: **1/1 PASS**.
- Direct equivalent offline test glob (browser-only `.browser.mjs` correctly omitted; exact output `full-offline-gate.log`, SHA-256 `36ed69d73d7fd96497650dd6c98a2044525d7ec3c8703d535b0c3b2fee3db5a8`): **191 PASS / 3 FAIL of 194**.
  - `audit-child-process`: two output assertions fail because sandbox process mediation drops child output/forwards wrapper text; silent timeout passes.
  - `automatic-policy-replay-integration`: nested Node subprocess does not create `.mock-commits.jsonl`; parent gets ENOENT.
  - `systemic-audit-report`: `spawnSync ... node EPERM` before script execution.
- Prior “missing CKAD fixture” diagnosis: **not reproduced; incorrect**. Historical files are in checkout, and corrected test passes.
- `pnpm test:audit`: blocked before test execution by pnpm 11.25 auto-install attempting inaccessible `/home/agent/.local/share/pnpm/store` (`ENOENT`). The equivalent package test globs were run directly; separate quote/API test PASS.
- `tsc --noEmit`: PASS; full ESLint PASS with 0 errors / 9 warnings; `quote.test.cjs`: PASS; `next build --webpack`: PASS (16 static pages; non-blocking `preferredRegion` deprecation warning); Python YAML parse, JavaScript syntax and `git diff --check`: PASS.
- Real delayed-hydration browser execution: NOT RUN locally because standalone Playwright is absent. The static contract passes and dedicated workflow provisions the correct dependency. No hosted Actions result is claimed for unpushed code.

## Product/evidence limits

The 62→71 route regressions confirm one directed PVP71 event, do not charge the 62 km exit ramps, preserve reverse direction, distinguish no event from incomplete coverage, and deduplicate repeated events. Multiple products/composition tests prevent duplicate M‑4/A‑289 billing. Incomplete/foreign trace remains unknown. The Voronezh full amount remains unknown; four of five M‑4 validation responses are missing in the saved replay. No claim is made that Yalta→Rostov is an operator-confirmed full fare. M‑4 external-only controls/current table effective date and Stage 8/M‑11 evidence remain unresolved as recorded in Stage Z.

## Changed scope

Runtime, fare matrix, geometry, route choice, M‑11 data, other toll systems, Android, V2 and Production are unchanged. Functional/test/workflow paths are the M‑4 regression file, live browser hydration file rename, live browser workflow references, and static workflow test. Other changes are docs and saved verification output.

## Next exact action

No push is authorized. Keep the three subprocess failures open and do not edit their tests to force PASS. After separate push authorization and remote fast-forward review, run these workflows on the exact candidate SHA: `special-territory-policy.yml`, `calculator-final-gate.yml`, and `v3-live-browser-acceptance.yml`; inspect job-level logs and the real browser artifact. A green summary alone is insufficient. Obtain/verify the separate Stage 8 M‑11 evidence before claiming combined M‑11/M‑4 integration complete.
