# Stage Z — local integration outcome (M‑4 done locally, M‑11 blocked)

Date: 2026-11-06 UTC. Candidate is local only; no push, Preview, Production, merge or main change. Base: `d60e733313860d2412d8be64f4be10ef71f7de28`. PR #14 remains unchanged/Draft.

## Result

- Stage X final M‑4 data/date correction and Stage V exact selected-route M‑4 trace protection were integrated in the isolated Stage Z worktree. Stage W erroneous intermediate interpretation was not imported as active fare data; no 722-row active-register rewrite was introduced.
- M‑11 Stage 8 patch was not available in the workspace, and the named archive SHA could not be checked. M‑11 runtime and source data remain at d60 unchanged. The 210-cell/60-change report was not accepted as proof.
- M‑4 still has four external-only endpoints `unknown`; later posted current tariff effective date is not preserved; complete route prices not independently certified. Yalta→Rostov 2,060/2,210 remains an unconfirmed component-derived estimate.

## Verification

- Focused M‑4/V3/date/source/trace suites: 15/15 PASS.
- Neighbor roads M‑11/M‑12/CKAD/ZSD selected regressions: 5/5 PASS.
- quote/API, TS, scoped ESLint, Next Webpack build, JS syntax, 4 JSON parse and `git diff --check`: PASS.
- Full direct offline suite: 190 PASS / 5 FAIL of 195. Failures are documented individually in [report](../../experiments/nationwide-tolls/checks/2026-11-06-stage-z-integration/README.md) and raw test output. Full gate remains failed/not verified; tests were not weakened.

Full report: [Stage Z integration](../../experiments/nationwide-tolls/checks/2026-11-06-stage-z-integration/README.md). Exact isolated M‑11 file list required for resume is in the report and [NEXT_STEPS](../../experiments/nationwide-tolls/NEXT_STEPS.md).
