# Stage Z combined M‑11/M‑4 final gates — BLOCKED by local sandbox subprocess limits

Date: 2026-11-07 UTC. Worktree `/workspace/stage-z-stabilization`, branch `codex/stage-z-stabilization`. This is a local-only candidate; no push, merge, Preview, Production, main, Android, V2, or PR #14 state change. PR #14 remains Draft. The latest commit containing the implementation before the final status-documentation commit is `7d9310d8a131b1191b0f91d1b6b48e5296af762f`; the final repository HEAD is the commit containing this checkpoint and corresponding WORK_STATE/WORK_LOG/NEXT_STEPS updates. The protected primary worktree and previous Stage Z worktree were not modified.

## Integrated result

- M‑11 15–58 km uses the verified, dated 2026-11-02 official matrix and retains the April matrix as a separate historical edition. The model contains 42 directed pairs / 210 tariff cells; the six source/evidence checks verify the official source hashes and 60 changed cells.
- Lookup is exact by directed entry/exit pair, edition and supported tariff profile. Unsupported boundary pairs remain `null`; no nearest-point tariff fallback was introduced. M‑11 58–679 km logic/data remain unchanged, and composition guards prevent charging both the new head product and a duplicate/overlapping legacy aggregate.
- The operator selects the tariff on exit-PVP passage, while the calculator has no reliable per-PVP arrival-time predictor. Thus the existing departure-time estimate remains explicitly approximate; it is not described as the eventual exact operator charge. Boundary cases `2026-11-02T00:59:59+03:00`, `01:00:00`, `01:00:01`, and Nov 3/4 special profiles are covered.
- M‑4 remains on the corrected Order 58 tariff data. The Stage W transcription is retained only as historical/audit material and a comparison input; it is not the active runtime tariff table. Existing selected-trace fail-closed behavior remains: only a complete trace for the exact selected route can confirm or suppress a plaza; absent/incomplete geographic evidence does not become free. M‑4/PVP545, M‑12 crosswalk, and incomplete route totals retain unknown/null where product traversal is unproven.
- No Stage 8 historical runtime patch or 2GIS raw answer/geometry was copied into runtime. A conflicting historical SHA in handoff metadata vs packet README remains unresolved; its old object was unavailable and is not needed for the fresh matrix integration.

## Verification actually run

Targeted suites and their actual outcomes:

- Six handoff source/evidence checks: **6/6 PASS**.
- M‑4 62/71, selected trace, A‑289, M‑11, CKAD and multi-road composition batch: **14/14 PASS**.
- API, estimate, unknown-status, rendering and M‑11 adapter batch: **8/8 PASS**.
- New M‑11 adapter tests: **6/6 PASS**; saved boundary tests: **7/7 PASS**; existing M‑11/CKAD adapter tests: **2/2 PASS**.
- Toll quote/API contract script: **PASS**.
- TypeScript (`node_modules/.bin/tsc --noEmit`): **PASS**.
- ESLint (`node_modules/.bin/eslint . --ignore-pattern .next`): **PASS**, 9 warnings, 0 errors.
- Next.js production Webpack build (`NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build --webpack`): **PASS**; existing `preferredRegion` deprecation warning only.
- `git diff --check`: **PASS**.

The direct full offline equivalent was run with the repository's test globs:

```sh
node --import ./scripts/register-ts-paths.mjs --test scripts/*test.ts scripts/*.test.mjs lib/v3-calculation/*.test.ts experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs experiments/nationwide-tolls/engine/*.test.mjs
```

Result: **195 total, 192 PASS, 3 FAIL, exit 1**. The failures are sandbox subprocess limitations: child stdout/stderr capture in `audit-child-process.test.mjs`; blocked nested `spawnSync` and consequently absent child-generated mock fixture in `automatic-policy-replay-integration.test.mjs`; and `spawnSync EPERM` in `systemic-audit-report.test.mjs`. They are not tariff assertion failures. The tests were not weakened. The `pnpm test:audit` wrapper itself did not start tests: pnpm tried to create `/home/agent/.local/share/pnpm/store`, outside the writable sandbox. Candidate dependencies were temporarily symlinked read-only from the protected primary worktree after matching `package.json` and `pnpm-lock.yaml`; that temporary symlink was removed before the final clean-tree check. No install or store deletion occurred.

## Release status and next action

This candidate is **not ready to declare fully gated/release-ready** because the complete offline gate has three unverified environment-sensitive subprocess cases and the native pnpm wrapper could not initialize. No GitHub Actions result exists for unpublished commits. The exact next verification is to run the unchanged required `pnpm test:audit` (plus the documented type/lint/Webpack gates) on the exact final candidate SHA in the existing normal GitHub Actions runner, after and only after a separately authorized ordinary fast-forward push. Do not alter assertions or report these local environment failures as PASS. There is no authorization to push in this task.

No browser acceptance was repeated because the relevant runtime did not change beyond the M‑11 estimator and the task explicitly forbids unnecessary repeat of prior Production acceptance. No 2GIS request was made.
