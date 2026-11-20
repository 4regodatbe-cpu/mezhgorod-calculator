# Stage V — local-history protection and bounded M‑4 trace integration

Status: DONE LOCAL / NOT PUBLISHED. Date: 2026-11-06 UTC. Candidate branch: `codex/stage-v-m4-negative-trace`, based directly on published development SHA `d60e733313860d2412d8be64f4be10ef71f7de28`. PR #14 remains Draft. No push, merge, Preview, Production, main, Android or V2 change.

## V1 — preserve the 91-commit local history

Before other work, verified primary worktree `/workspace/mezhgorod-reorganization`, branch `fix/v3-missing-route-prices-2026-10-15`, clean, HEAD `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe`, 91 commits ahead/5 behind remote tracking ref. Created and read back `refs/safety/local-91-before-reconciliation-2026-11-06` at that exact SHA; primary HEAD was not moved. PR-associated remote branch was read-only verified at `d60e733313860d2412d8be64f4be10ef71f7de28`, and PR #14 was OPEN/Draft. No history was merged, rebased, cherry-picked or rewritten.

The local repository is a promisor partial clone (`remote.origin.promisor=true`, `remote.origin.partialclonefilter=blob:none`). With lazy fetch disabled, 8,273 objects reachable from the protected ref are missing locally but promised by origin. Sample `c22625803e0302fa28bbc613e62e647a8c004e2f` is a GitHub blob available through the GitHub blob API; this establishes an omitted promisor blob, not repository corruption. Full `git bundle create` could not materialize the promised objects: the configured sandbox proxy on port 8080 was unreachable. `git fsck --full` reported dangling objects and did not certify omitted promisor blobs. Therefore no complete self-contained bundle could be made.

Partial recovery package: `/workspace/local-91-recovery-2026-11-06/`. It contains a reverse-checked full-index net-tree patch, 194 changed current files in a tar archive, SHA256 manifest, path inventory, 91-commit metadata chain, and the isolated M‑4 patch. The 194-file extraction hash check passed. This is explicitly **not** a full repository backup: all 91 commit objects and the 8,273 promised blobs still depend on the original repository/remote. Do not delete the original clone or safety ref. Package-level SHA256 manifest is added after this checkpoint is finalized.

## V2 — constrained history comparison and decision

Used Stage U's already completed classification; did not repeat its 194-path inventory. Remote-only commits are `700b3ce5`, `7d5caee6`, `1e30ff19`, `547e909a`, `d60e7333`, all harness/workflow/docs changes. The local-only chain has 91 commits and 194 changed paths relative to the common ancestor `a6bea89dd4b481a1352dc492969004e6cd1e6e38`; Stage U found only `docs/WORK_STATE.md` as a changed-path overlap. Local changes include the directed M‑4 PVP/negative-trace work, broader tariff-product mapping and estimates, feedback, diagnostics and experiments. `lib/v3-calculation/route-leg-pricing.ts` differs materially; `lib/toll-engine/route-toll-composition.ts` does not. The broad route-product mapping was not transferred: it is multi-road and carries separate tariff/applicability evidence requirements.

Selected one narrow defect class: a complete positive or negative toll-booth trace could be reused by M‑4 validation without proving it belonged to the selected route geometry. This could transfer a PVP event or suppress a real event from a different candidate. The fix adds `routeSignature` to `TollValidation` records and allows reuse only for an exact directed geometry signature. Mismatched traces are ignored; selected-route validation runs instead, and failed validation stays `unknown`, not free. Exact complete trace events remain the only basis for suppressing false nearby-ramp attribution. No tariff values, route geometry, general route selection or product matrix were changed.

Evidence retained from the prior local M‑4 work (not re-audited): saved selected-route geometry and OSM directed graph in `experiments/toll-od-matrix/sources/m4-pvp-62-71-directed-graph-2026-11-03.json`; report `experiments/nationwide-tolls/checks/2026-11-03-m4-62-71-directed-binding.md`. That evidence distinguishes PVP62 exit-ramp toll nodes from PVP71 direction-specific mainline toll lanes. The current tariff table entries remain unchanged (62: 220/260 ₽, 71: 400/500 ₽ without transponder as represented in existing code). Historic Order 58 differs; independently preserved current-period primary confirmation remains incomplete. This candidate does not claim to resolve tariff provenance or establish new exact fare totals. Existing overlapping-product duplicate protection and unknown/null semantics were not changed.

## V4 — exact checks on candidate source

- Target M‑4 saved-route, edge-evidence and selected-trace reuse tests: **3/3 PASS**.
- Neighbor-road regression selection: CKAD alias coverage, M‑11 products, M‑12 product boundaries, ZSD finished-vector and Planernaya identity: **5/5 PASS**.
- Combined focused M‑4 + M‑11/M‑12/CKAD/ZSD suite after changes: **8/8 PASS**.
- Additional ODintsovo trace contract after adding geometry-signature metadata: **1/1 PASS**.
- TypeScript `./node_modules/.bin/tsc --noEmit`: **PASS**.
- Scoped ESLint on all changed runtime/test files: **PASS**.
- `git diff --check`: **PASS**.
- Next.js production build using the available Webpack fallback: **PASS**, Next 16.3.4; compilation, TypeScript, static generation and route manifest completed. Default Turbopack was not repeated because the same environment is already known to fail with `listen EPERM`.
- Full offline gate, exact direct command equivalent to `test:audit`, after supplying the available Playwright module path and `/usr/bin/chromium`: **188/193 PASS, 5 FAIL**. Failures: three existing nationwide audit/process/report suites (`audit-child-process`, `automatic-policy-replay-integration`, `systemic-audit-report`); `v3-ckad-m11-m12-boundary` expects local-only fixture evidence absent from published base; `v3-live-browser-hydration` could not launch sandbox Chromium (SIGTRAP / `setsockopt: Operation not permitted`). The target M‑11, M‑12 and CKAD alias suites pass; no tests were weakened. This is not a full-gate PASS.
- Invoking `pnpm exec` directly first failed because pnpm tried to create its default `/home/agent/.local/share/pnpm/store`; checks were rerun using already-installed direct binaries. No dependency install or manifest change was made.

## Result / handoff

Prepared candidate is locally testable but **not ready for publication** because the full offline gate has five unresolved failures and the current-period tariff source/application record still needs independent reconciliation. Safely transferable scope is only exact-geometry binding of complete M‑4 event traces plus its regressions and preserved evidence; no broad 91-commit history transfer. Remote d60 remains unchanged. Next: retain the local candidate commit/bundle; before any push, resolve the five gate failures in their own scoped task or obtain a green ordinary CI run after a separately authorized push. Separately strengthen primary current-period M‑4 tariff provenance before claiming a current exact amount.
