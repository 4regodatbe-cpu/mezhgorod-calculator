# B10 Maykop—Moscow V2 capture — STARTED

- Status/time: STARTED, 26.10.2026 20:24 МСК.
- Exact remote source branch/head: `fix/v3-missing-route-prices-2026-10-15` / `6b4b4d75dfbe4d6fa86c04cdeba66db961851421`.
- PR #14 open/Draft; no GitHub Actions active. Special CI immutable-head classifier verified on run40367512131 (`no-route-runtime-change-in-update`, verify success, wide jobs skipped).
- Existing B10 workflow is unchanged (blob `6fdb317bae6ff58400c54da6fd61cfc2361f220d`). Selector helper/test are read back and hosted-tested (4/4). Existing Eisk capture and Thu/Sat comparison must be reused; do not recapture Eisk.
- One required hosted capture only: Maykop→Moscow. Keep the user-approved limits: one bounded preflight request per provider, then route capture, raw request/response bodies, HTTP status, response SHA256, API/capture SHA, run environment and artifact. Continue only if Valhalla, OSRM and BRouter all provide valid data. Offline Thursday/Saturday replay and V2/V3 comparison only. No tariff change from route-algorithm differences.
- Safe trigger sequence: (1) update only `B10_CAPTURE_CASES: maykop-to-moscow` in B10 workflow with `[skip ci]`; verify no Action starts and read back. (2) make a distinct docs-only checkpoint update; because this commit does not match B10 workflow's push `paths`, it runs only the special PR workflow. Require reason `no-route-runtime-change-in-update`, `verify` success, and both wide jobs skipped. (3) only after that proof, add a meaningful one-time explanatory comment to the B10 workflow in a normal commit, which triggers the single B10 capture and the final special classifier check.
- If stage (2) is uncertain, classifier fails, or verify fails, do not execute stage (3); preserve the exact failure and leave B10 blocked. No capture has run at this STARTED checkpoint.
- Main, Android, backup, Production, merge and force push remain out of scope. Do not cancel Actions.
