# Stage AA — V3 final-gate and route-failure diagnosis STARTED

- Start date: 2026-11-07 UTC.
- Source candidate: published commit `8fae15c7e5b81ef55492f2b009cbe665e5fdc0fb`.
- Isolated worktree: `/workspace/final-gate-v3`, branch `codex/final-gate-v3-repair`.
- Local documentary evidence commit `9374a1b75ac319fceb0491ba2edb629e0cd03620` was reviewed but not cherry-picked because three handoff files diverged; only its exact findings and saved artifacts are inputs. No runtime changes have been made yet.
- Protected primary 91-commit worktree/ref, Android, V2 code, main, Production, and PR #14 remain out of scope. No push/merge/PR creation is authorized.

## Why a second, version-correct diagnosis is necessary

The prior local final-gate scripts `scripts/segment3-free-truth.mjs`, `scripts/live-user-route-audit.mjs`, and `scripts/route-monitor.mjs` POSTed to `/api/v2/calculate`. The user's requested acceptance is for current V3. Therefore their prior route failures do not by themselves prove V3 defects. Their inputs and raw summary artifacts remain available under `/tmp/calc-final-gate-8fae15c`; no uncontrolled rerun is planned. Diagnose the tests and all recorded failures, then perform only bounded, version-correct V3 checks needed to distinguish code defects from stale V2 contracts and unsupported controls.

## Bounded work plan

1. Identify original purposes and replacements for the three missing scripts; align `calculator-final-gate.yml` and its static truth checks with V3 as active root while keeping `/v2` as a tested legacy route. Preserve test strength and read-only permissions.
2. Inspect saved route results, exact fixture coordinates/date/category, and control provenance. Where the prior harness called V2, use a small, explicit V3-only sample (at most the named key routes) rather than repeat all nine requests.
3. Inspect the two Avtodor freshness rows, their source/effective dates and the freshness algorithm; update only if current evidence supports it, otherwise keep them unconfirmed and state the block.
4. Implement only proven P0/P1 runtime or harness fixes; add regression tests and run focused checks.
5. Run all available offline tests, TypeScript, ESLint, required production builds and local V3 API smoke. Record actual blockers (including Turbopack EPERM) separately from assertions.

## Acceptance / safety

- Unknown is never free or zero; partial is not a full fare; no prices are inferred from control bands.
- No new provider request until saved route evidence and inputs are reviewed. Any live tests are limited, one pass, and explicit.
- Do not alter toll data without source and geometry proof; do not loosen checks to pass.
- No push, PR creation/merge, changes to main/base ref/Production/Android, or security-policy changes.
- After the diagnostic block, update WORK_STATE, WORK_LOG, NEXT_STEPS, and a terminal checkpoint, commit locally, verify readback, and create an incremental bundle if complete.
