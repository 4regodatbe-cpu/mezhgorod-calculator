# B03 hosted address UI scenarios retry — STARTED

- Status: STARTED, 26.10.2026 17:27 МСК; update 17:31 МСК.
- Allowed branch: `fix/v3-missing-route-prices-2026-10-15`; current saved base: `685685bcc5b31f05ecf2cc46f2f95a0ecc5184d9`; PR #14 Draft.
- Prior block: [runner bootstrap failure](2026-10-26-1726-b03-ui-runner-bootstrap-FAILED.md); no browser scenario ran.
- Goal: execute the eight B03 UI scenarios via the isolated workflow after correcting tool setup order; expected outputs are per-case JSON, environment/versions, stdout/stderr, request counts and screenshot evidence.

Inputs: existing V2 app, mocked address snapshot records from `data/address-city-snapshot.json`, and the exact scenario definitions in `ADDRESS_CITY_SNAPSHOT.md` / B03 brief. The snapshot was remotely rechecked at 26.10.2026 17:22 МСК with matching records hash; expiry is `2026-10-31T08:24:54Z`. Recheck remotely in the actual run job immediately before data use; fail closed at or after expiry. No external routing/geocoding requests, no Production, no flag activation, and no claim that the original B-only issue is fixed based on mocks.

Workflow fix: install pnpm 11.25.0 via `pnpm/action-setup@v4` before `actions/setup-node@v4` with `cache: pnpm`. This specific ordering correction is prepared locally but not yet saved. Acceptance: the runner proceeds beyond setup-node, launches Chrome 156.0.8078.47, and records an outcome for each of the eight scenarios. If startup fails again, preserve its precise error and do not repeat under unchanged conditions. Save a DONE/FAILED/BLOCKED result and exact artifact/log references before any next task.
