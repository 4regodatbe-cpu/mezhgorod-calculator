# Nationwide three-test diagnosis — 25.10.2026 07:46 МСК

## Result

One shared infrastructure blocker, not three established application defects: the Codex runtime denies child Node processes with `EPERM`. Exact per-file diagnostic attempts were `node --test experiments/nationwide-tolls/audit-child-process.test.mjs`, `node --test experiments/nationwide-tolls/automatic-policy-replay-integration.test.mjs`, and `node --test experiments/nationwide-tolls/systemic-audit-report.test.mjs`. The parent Node diagnostic received `Error: spawnSync /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node EPERM` for each. Captured child `stdout` and `stderr` were empty; no assertion-level failure was observable. The tests were not re-run locally in this block.

## Hosted-runner path

Existing `.github/workflows/calculator-final-gate.yml` uses `ubuntu-latest` and Node `24.x` but runs many unrelated checks, so it is not suitable for isolating this diagnosis. GitHub `workflow_dispatch` requires the workflow to exist on the default branch, which is outside the authorized write scope. Added `.github/workflows/nationwide-three-test-diagnostic.yml`, restricted to the allowed branch and its own workflow-file path; the branch push can trigger it without changing a broad workflow. It runs only the three files above on Node 24 and uploads separate stdout, stderr and exit-code artifacts. GitHub-hosted execution result is pending this checkpoint's push and must be read back before classifying the tests.

## Scope and limits

No application code or assertions changed. This does not prove the three tests pass or fail on GitHub-hosted runners. No Chromium, routing providers, nationwide audit, or broad test suite was run. PR #14 remains Draft; only the allowed branch may be updated, non-force.

## Verification

- Current allowed remote head before this block: `82faf1b7bf6634271563dc01dbf504ec889e4b59`; PR #14 head matches and remains Draft.
- Actions read showed no queued/in-progress/waiting/requested/pending runs before the block.
- Existing CI workflow inspected; it is broad and pins Node `24.x`.
- Focused workflow syntax and diff checks: pending before persistence.
- Hosted result/artifact: pending.

## Next

Read back the allowed branch head and all four changed files, then inspect only the focused workflow run/artifacts. If the three tests pass there, classify the local failure as Codex sandbox restriction; if not, analyze their captured runner output without weakening assertions. Continue to the next independent B01–B12 task after this checkpoint is durable.
