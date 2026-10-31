# Nationwide three-test diagnosis — 25.10.2026 07:46 МСК

## Result

One shared infrastructure blocker, not three established application defects: the Codex runtime denies child Node processes with `EPERM`. Exact per-file diagnostic attempts were `node --test experiments/nationwide-tolls/audit-child-process.test.mjs`, `node --test experiments/nationwide-tolls/automatic-policy-replay-integration.test.mjs`, and `node --test experiments/nationwide-tolls/systemic-audit-report.test.mjs`. The parent Node diagnostic received `Error: spawnSync /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node EPERM` for each. Captured child `stdout` and `stderr` were empty; no assertion-level failure was observable. The tests were not re-run locally in this block.

## Hosted-runner path — run not triggered

Existing `.github/workflows/calculator-final-gate.yml` uses `ubuntu-latest` and Node `24.x` but runs many unrelated checks, so it is not suitable for isolating this diagnosis. GitHub `workflow_dispatch` requires the workflow to exist on the default branch, which is outside the authorized write scope. Added `.github/workflows/nationwide-three-test-diagnostic.yml`, restricted to the allowed branch and its own workflow-file path; it runs only the three files above on Node 24 and uploads separate stdout, stderr and exit-code artifacts. The workflow and all checkpoint files were read back at remote SHA `77658f4bffe872e2db29bd796f4993befa4529c6`, tree `88711b2b565448059832082a1b08fab5f3f09dbf`. However, the GitHub Connector's non-force ref update did not produce an Actions run (`GET /actions/runs?head_sha=77658f4bffe872e2db29bd796f4993befa4529c6` returned zero); no workflow dispatch action is exposed. Therefore the hosted tests have **not run**, and no classification as Codex-only failure is justified.

## Scope and limits

No application code or assertions changed. This does not prove the three tests pass or fail on GitHub-hosted runners. No Chromium, routing providers, nationwide audit, or broad test suite was run. PR #14 remains Draft; only the allowed branch may be updated, non-force.

## Verification

- Current allowed remote head before this block: `82faf1b7bf6634271563dc01dbf504ec889e4b59`; PR #14 head matches and remains Draft.
- Actions read showed no queued/in-progress/waiting/requested/pending runs before the block.
- Existing CI workflow inspected; it is broad and pins Node `24.x`.
- Focused workflow YAML parse and `git diff --check`: PASS.
- Hosted result/artifact: NOT RUN; no Actions event was created.

## Next

Next required action to obtain hosted results: a normal authenticated Git push that emits a `push` event on the allowed branch (without force), or an authorized workflow dispatch after the workflow is available from the default branch. The latter would require changing an unauthorized branch and is not in scope. Until a run appears, keep these tests BLOCKED and do not claim hosted pass/fail. Continue only to an independent B01–B12 block with inputs available offline.
