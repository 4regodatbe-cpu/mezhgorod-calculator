# Special-territory CI selective live-probe gate — STARTED

- Status/time: STARTED, 26.10.2026 20:30 МСК.
- Source branch/head: `fix/v3-missing-route-prices-2026-10-15` / `77b8a6b9b919aadfcb64d7fa9b0546414f9c63a4` (verified from PR #14); PR #14 remains open Draft.
- Scope: only `.github/workflows/special-territory-policy.yml` plus a deterministic changed-path classifier and model tests if needed. No application/tariff/geometry logic, main, Android, backup, Production, merge, or force push.
- Existing workflow state: PR trigger has historical `paths` filters; `verify` runs tests, TypeScript and build; `live_probe` and `calculation_timing` perform external checks. No active PR-triggered runs were listed for the source head. Previously authorized runs `40354432433` and `40354448205` are complete; they will not be rerun as part of this configuration block.
- Plan: retain PR verification; classify only the current push event commit list/range for route-runtime paths. A docs/diagnostic-only commit, test-only commit, or workflow-only edit must not invoke broad live jobs. A genuine runtime change must. Missing/truncated/unparseable push metadata fails open to the live jobs. Manual `workflow_dispatch` remains explicit and runs the existing jobs. Do not cancel any Action.
- Before persistence: model independent diagnostic, runtime algorithm, test-only, workflow-only, and unknown/truncated payload cases. Check YAML and job conditions; preserve existing live command/assertion content and required tests/typecheck/build.
- B10 continuation, only after this config is durable and verified: use existing corrected harness in Maykop-only mode, reuse the saved Eisk artifact/comparison, and make one bounded Maykop capture plus Thu/Sat offline replay/V3 comparison. Never repeat Eisk without a concrete cause.
- If safe gating cannot be proven, leave B10 untriggered; record exactly why and do not install the change.

## 26.10.2026 20:40 МСК — safety refinement before persistence

An initial push-only classifier would have skipped live checks for every `pull_request` event, including runtime changes. Automated review correctly rejected that as unsafe; the workflow itself was not written remotely. Replaced it with a PR-specific classifier that compares the current PR head against the most recent completed Action run associated with this PR/allowed head branch. Only an exact, complete linear comparison with fewer than 300 changed files can suppress broad live jobs for docs, tests, diagnostics, or workflow-only edits. Runtime paths run the live jobs. Missing prior run, API error, diverged history, invalid metadata, or truncated comparison fails open to live. Required PR verification remains enabled. Local model tests cover the refined cases; see a follow-up DONE checkpoint after hosted verification.

## 26.10.2026 21:05 МСК — verified source head and baseline safety refinement

The expected SHA `77b8a6b9b919aadfcb64d7fa9b0546414f9c63a4` was not current. The allowed remote branch and PR #14 head were `192d2238b9136646a7ecc0842926b4e8cee585f4`; PR remains Draft, no PR Actions are active, and only a Vercel success status exists. No existing run was cancelled. Compare `77b8…`→`192d…` was linear, nine commits, with only docs/checkpoint and classifier/test files. The classifier now also requires the previous `verify` job to conclude success; old-workflow baselines require successful geometry and timing checks. Unknown or incomplete baseline still runs live. Nine local model tests pass. Remote persistence and hosted verification remain pending.
