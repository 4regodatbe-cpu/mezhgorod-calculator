# Stage Z — M‑11/M‑4 integration (STARTED)

Date: 2026-11-06 UTC. Worktree: `/workspace/stage-z-tariff-integration`, branch `codex/stage-z-tariff-integration`. Base is published development SHA `d60e733313860d2412d8be64f4be10ef71f7de28`. Push, merge, Preview, Production and publication are forbidden. PR #14 remains Draft.

## Inputs and isolation

- Stage X/Y corrected M‑4 tree: `/workspace/stage-w-m4-tariffs`, final SHA `efb12521f64168d265343b550ef207158e8645c2`.
- Stage V exact-selected-trace fix: `/workspace/stage-v-m4-integration`, final SHA `293f4ab225547789466636ae9d2a0907461b131d`, implementation commit `7226a82250c34b0b44733919cd48da3225f6fad1`.
- Reported M‑11 Stage 8 patch `136a5a72…`, handoff `79a09e81…` and archive `2gis-diagnostics-stage8-2026-11-06.tar.gz` are not present in the searched workspace; the reported Git objects also are not locally available without a promisor fetch. Do not synthesize their contents or claim M‑11 integration.
- The primary 91-commit worktree, safety ref, Stage V, Stage X/Y and remote refs are not modified. This candidate is a separate worktree from d60; no branch merge/cherry-pick is performed.

## Planned bounded work

1. Import only the final Stage X/Y M‑4 tree diff from d60, excluding the rejected intermediate Stage W data interpretation; verify changed-file scope and no 722-row fare rewrite.
2. Incorporate the minimal Stage V exact-route-signature guard and directed trace regressions; preserve Stage X tests and avoid duplicate charging.
3. Keep M‑11 pending until its exact patch, source files, tests and evidence manifest are available; continue only independently verifiable M‑4 integration meanwhile.
4. Run focused M‑4/V3 checks and available quality gates; classify inherited Stage Y sandbox failures without weakening tests.
5. Save final WORK_STATE/log/next-steps/checkpoint, local commit and a verified portable bundle.

No runtime change has been applied at this STARTED checkpoint.
