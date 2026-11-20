# Nationwide three-test environment diagnosis — DONE

26.10.2026 16:51 МСК. Current allowed branch head at verification: `2907a409305834c4cb9b25bc717978f049bb22f9`, tree `7b5d053a04f125813c99d1275bd91448f1388a2a`. PR #14 is open and Draft. The cited Actions run is bound to this exact branch/head.

## Hosted evidence

GitHub Actions run [40332405721](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40332405721) completed `success` on `ubuntu-24.04`, Node `v24.21.0`; `pnpm install --frozen-lockfile` passed. Job `isolated-tests` (`121604943915`) and its test/artifact upload steps passed. The job logs were fetched from GitHub; test stdout/stderr/exit-code files and the complete compact evidence ZIP are stored in [`checks/2026-10-26-three-test-diagnostic`](../../experiments/nationwide-tolls/checks/2026-10-26-three-test-diagnostic/README.md).

Exact individual commands used by the diagnostic workflow were:

- `node --test experiments/nationwide-tolls/audit-child-process.test.mjs` — exit 0, 3/3 pass, stderr empty.
- `node --test experiments/nationwide-tolls/automatic-policy-replay-integration.test.mjs` — exit 0, 3/3 pass, stderr empty.
- `node --test experiments/nationwide-tolls/systemic-audit-report.test.mjs` — exit 0, 1/1 pass, stderr empty.

Total: 7/7 pass, 0 fail. The archived stdout reports the individual assertion names and test counts; the archive SHA-256 is `3fa758f4bfafc1c895dc599f4a3881eab69de707723750e8bac9b4f95e90001c`, matching the GitHub artifact digest. Artifact ID `12654889085`; hosted retention ends 26.11.2026 13:39 UTC. A branch-local copy is retained in the repository.

## Diagnosis and scope

The previous local attempts reported `Error: spawnSync /opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node EPERM` before test assertions, with empty child stdout/stderr. All three tests pass unchanged on the hosted Node 24 runner. Classify the local failures as Codex sandbox child-process restriction, not application defects. Do not rerun these files without a new cause. No application code or assertion was changed in this block. No broad tests, Chromium, live routing services, tariff changes, merge or Production action were performed.

## Verification and next step

- Run status/conclusion/head verified via GitHub API: `completed` / `success` / `2907a409305834c4cb9b25bc717978f049bb22f9`.
- Job summaries and artifact inventory fetched; nine archive entries verified, all exit-code files contain `0`, all stderr files empty.
- PR #14 remains Draft; no Actions run was active before this documentation/evidence write.
- Continue with B10's unfinished V2-vs-V3 comparison only if a route-provider response becomes available. Do not repeat Valhalla/OSRM/BRouter attempts under unchanged network conditions. Other outstanding B01–B09/B12 items require new trusted source data or an allowed browser runtime; retain their existing blockers.
