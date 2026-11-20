# Stage Z — M‑11/M‑4 combined gates STARTED

- Status: STARTED, 2026-11-07 UTC.
- Candidate branch/worktree: `codex/stage-z-stabilization`, `/workspace/stage-z-stabilization`.
- Source candidate at start: `64a4bf5fe0a5d8b1ce36125b8cf92373b63cc5d3` (M‑11 data/runtime and targeted tests committed); no push/merge/publication permitted.
- Scope: verify M‑4 and multi-road/API contracts after the M‑11 adapter change; run full `pnpm test:audit`, TypeScript, ESLint, and Next Webpack production build, recording real outcomes. No M‑4 tariff/trace data edits planned.
- Dependency setup: `package.json` and `pnpm-lock.yaml` SHA256 match `/workspace/mezhgorod-reorganization` exactly; installed packages are exposed read-only through temporary `node_modules` symlink to that protected tree. No package installation or store deletion performed. Remove the symlink before final clean-tree verification.
- Commands planned: combined target node test invocation; `pnpm test:audit`; `node_modules/.bin/tsc --noEmit`; `node_modules/.bin/eslint . --ignore-pattern .next`; `node_modules/.bin/next build --webpack` (or the repository's build script only if full offline audit passes).
- Recovery: if an unchanged subprocess test fails with sandbox EPERM, record it and do not repeat; if a build/test fails from an identifiable command/config issue, make only a relevant local fix/test and rerun that affected gate.
- Next step after completion: save DONE/BLOCKED gate checkpoint, update WORK_STATE/WORK_LOG/NEXT_STEPS, finalize manifest and verified bundle. No GitHub Actions can verify unpublished commits; push is forbidden.
