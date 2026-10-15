# Instructions for contributors and coding agents

Before repository work, read docs/WORK_STATE.md. It is the canonical current-state handoff and links to the relevant specifications and checkpoints.

## Mandatory small-step durable checkpoints (user clarification, 2026-10-15)

Read and follow `docs/CHECKPOINT_PROTOCOL.md` before any task action. This clarification supersedes older instructions limiting records to substantial blocks or saying not to log tiny operations.

After **each small completed change, test step, recovery operation or route case**, create a separate dated checkpoint record under `docs/checkpoints/`, save the exact changed files and evidence, update the short handoff/index, commit, persist to the authorized GitHub working branch, and read back the branch head to verify the expected commit. Do not start the next independent step until this durable checkpoint is verified. A local commit, uploaded unreferenced blobs/tree, or a chat report alone is not sufficient.

Before a long operation, first persist a STARTED checkpoint with inputs and the recovery action; after it ends, save DONE/FAILED and exact outputs. If durable saving fails, stop expansion, preserve the current work, record the blocker and notify the user. Do not claim unsaved results are safely stored. Keep chat updates compact; detailed small-step records belong in the repository. This rule does not authorize merging, production deployment or destructive actions.

## Mandatory repository handoff and full work history (user requirement, 2026-10-09)

**The repository, not an individual chat, is the persistent record of the project.** Every developer/agent in every new chat must be able to resume the project from committed files alone, without access to previous chats.

1. At the beginning of work inspect the actual branch and commit, `AGENTS.md`, `docs/WORK_STATE.md`, the relevant project `README.md`, `WORK_LOG.md`, `DECISIONS.md`, and `NEXT_STEPS.md`, plus relevant code/tests. Do not rely solely on memory or conversation.
2. For every meaningful work block **append** a dated, detailed entry to the project's `WORK_LOG.md`: user request and product decision, diagnosis, implementation and source files, exact algorithms and invariants, source and tariff provenance, tests actually run with outcomes, failures, limitations, commit SHA(s), and next work. Never replace or silently erase historical entries.
3. Keep `docs/WORK_STATE.md` as a short **current-state handoff at the top**, linking to the complete logs and decisions. Update it in the **same branch** whenever a substantial block finishes. Clearly label DONE / IN PROGRESS / BLOCKED / DEFERRED and distinguish plans from implemented work.
4. Maintain `DECISIONS.md` with authoritative user-approved product policies and superseded decisions (dated, with reasoning); maintain `NEXT_STEPS.md` as an executable priority-ordered checklist with exact paths, tests, blockers and acceptance criteria. For experiments keep these alongside the experiment to avoid altering live calculator source.
5. Do not finish a work block with only a chat report: persist code, data, state, decisions and result in Git first. If Git write fails, explicitly say so and provide a portable handoff; never claim that unsaved work is in the repo.
6. Never claim a test, deployment, pricing verification or data import succeeded unless it ran and the result was inspected. Preserve the precise state of unknown/unverified and record negative evidence. Keep timestamps, SHA and source paths so subsequent developers can audit.
7. Protect the currently working calculator. Experimental branches and files must never silently be integrated with live `app/` / `lib/`, main or Production. Follow explicit release authorization and all existing safety checks.

8. For every substantial project stage, keep a **separate, detailed, append-only record file** in the relevant workstream. Explain what was done, how it was done, why it was needed, and what result/purpose it serves. Include decisions, changed paths, exact checks and outcomes, evidence/source provenance, limitations, current branch/commit/PR/deployment state, and the next concrete step. Update `docs/WORK_STATE.md` and the relevant `NEXT_STEPS.md` as the short handoff/index. A new chat or a different AI must be able to continue from these files without relying on chat history. Never overwrite a completed stage report; add a dated entry or a new stage file.

## Resume work
1. Verify the actual remote branch, PR head, and local working-tree state. Do not trust an old scratch checkout or remembered SHA.
2. Read only the linked sources needed for the task. Do not search old chats when the handoff contains the answer.
3. Latest user decisions and current product-policy docs override historical plans and assistant summaries.

## Keep state recoverable
For each substantial implementation block, update docs/WORK_STATE.md in the same branch before ending. Record what changed and why, important files, deferred/rejected work, exact tests/builds/workflow runs and verified commit, remaining risks, and one next action.
Append a dated record for every small completed step according to docs/CHECKPOINT_PROTOCOL.md. Keep WORK_STATE concise and link the checkpoint/evidence instead of copying it. Label items done, in progress, blocked, or deferred; never state a plan as completed.
If essential context is missing from the repository, search the named earlier chat as a fallback and immediately persist the recovered decision in the repository.

## Safety and verification
- Do not merge PRs, modify main, or publish production without explicit user authorization.
- Do not publish to Production, merge a PR, or change `main` without a direct request in the current task. Historical publication authorization is superseded by the user's later standing instruction (2026-10-13) requiring a direct request for those actions. A requested release must still pass all required checks first.
- Preserve toll fail-closed rules: unknown is not free, partial toll sums are not complete, and only independently confirmed routes may be labeled free.
- Keep offline benchmark snapshots out of live route selection and pricing.
- After code changes, run focused tests plus the required full gate/build. For docs-only changes, verify links/content and accurately report CI status.
