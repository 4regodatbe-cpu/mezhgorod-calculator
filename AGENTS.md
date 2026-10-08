# Instructions for contributors and coding agents

Before repository work, read docs/WORK_STATE.md. It is the canonical current-state handoff and links to the relevant specifications and checkpoints.

## Mandatory repository handoff and full work history (user requirement, 2026-10-09)

**The repository, not an individual chat, is the persistent record of the project.** Every developer/agent in every new chat must be able to resume the project from committed files alone, without access to previous chats.

1. At the beginning of work inspect the actual branch and commit, `AGENTS.md`, `docs/WORK_STATE.md`, the relevant project `README.md`, `WORK_LOG.md`, `DECISIONS.md`, and `NEXT_STEPS.md`, plus relevant code/tests. Do not rely solely on memory or conversation.
2. For every meaningful work block **append** a dated, detailed entry to the project's `WORK_LOG.md`: user request and product decision, diagnosis, implementation and source files, exact algorithms and invariants, source and tariff provenance, tests actually run with outcomes, failures, limitations, commit SHA(s), and next work. Never replace or silently erase historical entries.
3. Keep `docs/WORK_STATE.md` as a short **current-state handoff at the top**, linking to the complete logs and decisions. Update it in the **same branch** whenever a substantial block finishes. Clearly label DONE / IN PROGRESS / BLOCKED / DEFERRED and distinguish plans from implemented work.
4. Maintain `DECISIONS.md` with authoritative user-approved product policies and superseded decisions (dated, with reasoning); maintain `NEXT_STEPS.md` as an executable priority-ordered checklist with exact paths, tests, blockers and acceptance criteria. For experiments keep these alongside the experiment to avoid altering live calculator source.
5. Do not finish a work block with only a chat report: persist code, data, state, decisions and result in Git first. If Git write fails, explicitly say so and provide a portable handoff; never claim that unsaved work is in the repo.
6. Never claim a test, deployment, pricing verification or data import succeeded unless it ran and the result was inspected. Preserve the precise state of unknown/unverified and record negative evidence. Keep timestamps, SHA and source paths so subsequent developers can audit.
7. Protect the currently working calculator. Experimental branches and files must never silently be integrated with live `app/` / `lib/`, main or Production. Follow explicit release authorization and all existing safety checks.

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
