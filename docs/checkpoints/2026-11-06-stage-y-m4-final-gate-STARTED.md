# Stage Y — final gate / M‑4 candidate (STARTED)

Date: 2026-11-06 UTC. Push, merge, Preview, Production forbidden.

## Inputs and isolation

- Stage X candidate: `e95d0af856c986a3480766aaec23aab27a4167b1`, branch `codex/stage-w-m4-tariffs`, isolated worktree `/workspace/stage-w-m4-tariffs`.
- Published base: `d60e733313860d2412d8be64f4be10ef71f7de28`.
- Stage V checkpoint HEAD: `293f4ab225547789466636ae9d2a0907461b131d`; code commit `7226a82250c34b0b44733919cd48da3225f6fad1`.
- Keep the original local 91-commit worktree/ref, PR #14, remote and Production untouched. Do not auto-merge Stage V.

## Bounded work

1. Read AGENTS, WORK_STATE, checkpoint protocol and Stage X/V handoffs.
2. Verify actual parent/merge-base relation; inspect Stage X `d60e733..HEAD` diff and establish whether the Stage W bulk 722-row fare rewrite remains.
3. Check `node`, `pnpm`, cached store and available dependencies. Run the exact frozen-lockfile install without deleting the store. If local `pnpm test:audit` cannot bootstrap, run only the script-equivalent test glob and classify all failures honestly. Do not change tests to force PASS.
4. Review six fare-integration conditions: source rate, travel-date period, vehicle category, actually traversed PVP, duplicate prevention, and unknown for incomplete total.
5. Update report/state/log/next steps. If all gates pass, leave candidate local pending separate publication permission. If environment blocks the full gate, identify one reproducible runner path and keep release status blocked.

Initial observation: Stage X and Stage V both branch from d60 and are not ancestors of each other. Offline install reused the existing `/workspace/.pnpm-store` but ended `ERR_PNPM_NO_OFFLINE_META`; `pnpm test:audit` attempted an unwritable default store under `/home/agent`. No test result is claimed at STARTED.
