# B10 Maykop workflow scope staged — DONE — 26.10.2026 20:28 МСК

Branch: `fix/v3-missing-route-prices-2026-10-15`; base commit `f85955f4d3596617cad3d399a4b593524dd733f6`; PR #14 remains Draft. Before this block, branch HEAD and PR were reread; Actions runs for the branch had no queued/in-progress runs. The expected user SHA `77b8a6b9…` was superseded; actual head was `f85955f4d3596617cad3d399a4b593524dd733f6`.

## Result

The existing B10 workflow now sets `B10_CAPTURE_CASES: maykop-to-moscow` and has been saved/read back at commit `f85955f4d3596617cad3d399a4b593524dd733f6`, blob `bbbad1d4c9aad8b6eccf77cb05878cf497180f54`. The write used `[skip ci]`; it did not start B10 or other Actions. The selector's hosted tests passed earlier; this block does not issue provider requests and does not recapture Eisk.

This checkpoint/docs-only commit is intentionally a separate PR update. The existing B10 workflow has `push.paths` limited to its own YAML, so a docs-only push does not match that capture trigger. The special-territory PR workflow may run because the PR's cumulative diff contains workflow changes. Its hardened classifier must compare the immutable completed-run `head_sha` with the current PR head and fail open. Required `verify` must pass; only then may the B10 capture be triggered.

## Checks and limits

- Branch HEAD before docs update: `f85955f4d3596617cad3d399a4b593524dd733f6`; no active Actions; PR #14 open/Draft.
- Latest completed special-territory run: `40367512131`, SUCCESS; classifier reported `no-route-runtime-change-in-update`, `verify` PASS, broad live jobs SKIPPED. It is the comparison baseline.
- B10 workflow staged env is Maykop only; no Eisk recapture.
- No provider call, route replay, new V2/V3 comparison, application or tariff change in this block.
- Next: commit only the compact docs/checkpoint update; read back all files and SHA. Wait for the resulting PR check to finish; verify success and skipped wide jobs before any B10 workflow-only trigger. If not, stop B10 and document the exact blocker.

