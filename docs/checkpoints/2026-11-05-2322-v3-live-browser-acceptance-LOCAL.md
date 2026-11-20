# V3 live-browser acceptance — подготовленный CI-кандидат

- Status: READY LOCAL / NOT RUN; no push.
- Date: 2026-11-05 23:22 MSK.
- Candidate base: `a6bea89dd4b481a1352dc492969004e6cd1e6e38`, the confirmed PR #14 head and Production source at task start.
- Main local worktree was kept untouched at `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe`; candidate is isolated from its 91 local-only commits so an authorized fast-forward need not publish unrelated local history.
- Archive SHA-256: `17664539174e626f679aef198779375467b05efca0b090bb91a71b0e288e9db1`.
- PR #14 remained OPEN/Draft. No Production, Android, tariff, B03 workflow, or 2GIS agent files changed.

## Applied files and safety

Added:

- `.github/workflows/v3-live-browser-acceptance.yml`
- `scripts/v3-live-browser-acceptance.mjs`
- `scripts/v3-live-browser-workflow.test.mjs`

Workflow uses only `contents: read`, targets the public Production `/v3`, pins Playwright/Chrome, and uploads `results.json` plus screenshots even on failures. Existing B03 workflow is separate and unchanged. `/r` and `/api/v3/calculate` are real requests. The only intercepted request is `**/api/collect`, aborted as `blockedbyclient` before transmission to avoid contaminating live analytics. Version `/api/version` is checked first; an absent SHA causes a nonzero outcome rather than an assumed pass.

## Compatibility fixes from archive review

1. Real `RouteCard` renders `v3RouteHeading()` text (`Выбран маршрут …`); with `showFastestSummary`, it does not render the `title="Самый быстрый маршрут"` prop. The supplied runner would time out after successful API responses. It now waits for one of the actual V3 headings.
2. The clear/replacement flow had the same invalid hidden-heading check, which could pass immediately even if the old result remained. It now waits for the actual result heading to disappear.
3. The workflow path filter omitted `scripts/v3-live-browser-workflow.test.mjs`, and did not execute it. Both trigger and job now include the static test.
4. The static test now asserts `/api/collect` is aborted (not merely intercepted), plus visible distance/time checks tied to the actual API response.

## Checks actually run

- `node --check scripts/v3-live-browser-acceptance.mjs` — PASS.
- `node --test scripts/v3-live-browser-workflow.test.mjs` — exit 0; test file passed (contains three contract checks).
- YAML structural checks via PyYAML BaseLoader — PASS for read-only permission, trigger paths and timeout.
- `git diff --check` — PASS.
- Full application gate/build not run: only new workflow/test scripts and documentation were changed; no runtime app source changed.
- Real Actions run and live Production browser acceptance remain NOT RUN until separately authorized push.

## Next step and persistence

The candidate commit is directly based on remote head `a6bea89…`; it is an ordinary fast-forward candidate and does not include the 91 local-only commits in the main worktree. Push has not been performed. After owner authorization, push this exact candidate to the single permitted branch and inspect the actual workflow run/artifact. Do not claim that static PASS equals real route acceptance. Candidate commit and bundle readback are recorded after commit.
