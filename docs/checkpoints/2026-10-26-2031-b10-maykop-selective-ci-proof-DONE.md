# Selective CI proof for Maykop-only B10 — DONE — 26.10.2026 20:31 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`; parent `c65db6d026d5fb2b42d62986efa75a675da92a7b`; PR #14 remains Draft.

The docs-only PR update generated Special territory workflow run [40369124628](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40369124628) on commit `c65db6d026d5fb2b42d62986efa75a675da92a7b`. On the Ubuntu 24.04 hosted runner:
- `classify_live_scope`: SUCCESS; stdout `{"shouldRunLive":false,"reason":"no-route-runtime-change-in-update"}`.
- Required `verify`: SUCCESS, including unit/contract tests, B10 selector tests, TypeScript and Next build.
- `live_probe`: SKIPPED.
- `calculation_timing`: SKIPPED.
- Overall run: SUCCESS. No jobs were cancelled.

This proves the pending B10 workflow-only delta from the prior successful baseline is considered non-runtime, while required verification remains enabled. The fail-open behavior for runtime changes or uncertain comparison remains in place. B10's push path is the B10 workflow file only; the preceding docs-only update did not trigger a capture.

## B10 status / next step

No new provider requests were issued. Eisk capture remains unchanged and will not be repeated. The B10 workflow selects `maykop-to-moscow` only at the preceding remote checkpoint/commit. Next perform exactly one normal, comment-only update to that B10 workflow file to trigger the narrow workflow. Before writing, confirm no Actions are active. B10 will run only for Maykop; special-territory classifier should independently classify this workflow-only update and skip its broad jobs. Do not write during either run. Preserve raw responses/statuses/SHA/artifact, then verify Thu/Sat offline replay and saved V2/V3 comparison. Do not infer tariff from algorithm deltas.

No code, provider data, runtime behavior, tariff matrix, Production, main, Android, or backup branch changed in this DONE block.
