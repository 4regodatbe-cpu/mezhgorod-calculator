# Instructions for contributors and coding agents

Before repository work, read docs/WORK_STATE.md. It is the canonical current-state handoff and links to the relevant specifications and checkpoints.

## Resume work
1. Verify the actual remote branch, PR head, and local working-tree state. Do not trust an old scratch checkout or remembered SHA.
2. Read only the linked sources needed for the task. Do not search old chats when the handoff contains the answer.
3. Latest user decisions and current product-policy docs override historical plans and assistant summaries.

## Keep state recoverable
For each substantial implementation block, update docs/WORK_STATE.md in the same branch before ending. Record what changed and why, important files, deferred/rejected work, exact tests/builds/workflow runs and verified commit, remaining risks, and one next action.
Append a dated entry to the relevant detailed work log/checkpoint for large blocks. Keep WORK_STATE concise and link evidence instead of copying it. Do not log every tiny operation. Label items done, in progress, blocked, or deferred; never state a plan as completed.
If essential context is missing from the repository, search the named earlier chat as a fallback and immediately persist the recovered decision in the repository.

## Safety and verification
- Do not merge PRs, modify main, or publish production without explicit user authorization.
- Standing user authorization (2026-10-07): after implementing and verifying each requested product change, publish it immediately to the current Production app without waiting for a separate publish request. This authorization applies to this calculator and does not authorize merging PRs or changing `main`. If a required verification/build fails, do not publish that change; report the blocker.
- Preserve toll fail-closed rules: unknown is not free, partial toll sums are not complete, and only independently confirmed routes may be labeled free.
- Keep offline benchmark snapshots out of live route selection and pricing.
- After code changes, run focused tests plus the required full gate/build. For docs-only changes, verify links/content and accurately report CI status.
