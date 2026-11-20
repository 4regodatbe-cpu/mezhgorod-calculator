# Stage T — V3 readiness and browser harness (DONE LOCAL)

- Status: DONE LOCAL; push is forbidden by the task.
- Date/time: 2026-11-06 10:28 MSK.
- Repository: `4regodatbe-cpu/mezhgorod-calculator`.
- Branch context: `fix/v3-missing-route-prices-2026-10-15`.
- Isolated detached worktree: `/workspace/stage-t-v3-input-readiness`.
- Source commit: local-only `1e30ff192f7d6e1a807e98a04b62814b427b645f`, parent `7d5caee6602ae0431906566ab2ec074fd89b8540` (verified published remote head at task start).
- Main development worktree remains untouched at `86fd19bd5cae0aaaa21f2ef352679a8b7a2db1fe`, retaining its 91 local-only commits.
- PR #14 remains Draft. No push, Production, main, Android, pricing/runtime, 2GIS, or route-algorithm changes.

## Findings and implementation

The previous live run `42116523393` recorded for Yalta and Donetsk→Melitopol: no `/r` request, no HTTP status/items, no visible loading/error state, no JavaScript errors, and blank fields in failure screenshots. That evidence places the observed failure before a search request but does not establish the cause.

The new local fixture reproducibly simulates a controlled input whose pre-hydration DOM value is reset when its client state hydrates. The readiness handshake then observes the existing standard→dual→standard React-rendered state changes before typing, and the later input remains present through the search debounce. This proves that the old harness order was vulnerable to a readiness/hydration race. It does **not** prove that the original Production failure was caused by hydration; the old run did not record input values/events at fill time.

Harness changes:

- `scripts/v3-live-browser-readiness.mjs` verifies actual rendered mode transitions and restores the standard mode; attempts and transition waits are bounded.
- `scripts/v3-live-browser-acceptance.mjs` records document/input/readiness timing, immediate and post-debounce values, observed input events, changes without test action, `/r` request/response telemetry, page navigations, client-resource failures and JS errors. It does not refill/retry a city after a failure or substitute `/r` or `/api/v3/calculate` responses.
- Search failures are classified separately (input not retained, event mismatch, no request, HTTP/JSON/empty results, unrendered/wrong suggestions, missing response); API and DOM calculation outcomes remain distinct.
- Original cases 01–04 still require the sequential Yalta→Volnovakha→Donetsk chain. A separate diagnostic `R1` begins with the previously working Donetsk→Volnovakha pair, then replaces both addresses with Krasnodar→Rostov without reload. R1 is excluded from the eight-scenario acceptance counts and cannot turn the original chain into a PASS.
- `scripts/v3-live-browser-hydration.test.mjs` is a deterministic local browser fixture only, not live V3 acceptance.
- Workflow path filters now include the readiness modules and fixture. The existing B03 workflow and mandatory checks are unchanged. The V3 workflow retains `contents: read`, its pinned Playwright install and real, unmocked Production endpoints.

Changed paths are limited to the V3 acceptance workflow and its test harness/tests. No production application/runtime file changed.

## Checks

- `node --check` on the live harness, readiness helper, classifier contract and hydration fixture — PASS.
- Chromium fixture plus workflow/classification contracts: **11 tests PASS, 0 FAIL** using the installed local Chromium and the required environment permission.
- The same Chromium test invocation under the default sandbox failed to launch Chromium (`SIGTRAP`/restricted Crashpad socket); no sandbox bypass was attempted. Re-running the same target with the permitted execution capability succeeded.
- PyYAML parse plus `contents: read` and workflow trigger-path assertions — PASS.
- `git diff --check` — PASS.
- Scoped ESLint — NOT RUN: this worktree has no local ESLint binary. Full app offline gate, TypeScript and production build — intentionally not run because only acceptance harness/workflow files changed; no runtime was touched.
- No new GitHub Actions run or live Production browser acceptance is claimed. The actual eight scenarios and R1 remain to be evaluated on a separately authorized push/run.

## Durable local state

This DONE checkpoint, WORK_STATE update and harness changes are saved in the Stage T local commit and portable bundle recorded in the final handoff. The commit is local-only; there is no remote readback. Exact final local SHA and bundle SHA256 are recorded in the handoff after commit/bundle verification.

## Next step

Obtain separate authorization for one ordinary fast-forward push of the verified candidate. Then verify remote readback and PR #14 Draft status, wait for the V3 Actions run, and inspect `results.json`, HTTP diagnostics and screenshots. Do not infer live hydration cause, successful search, or route acceptance from the local fixture.
