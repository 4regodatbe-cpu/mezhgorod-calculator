# Reliability block21 — V2 trace fixture uses RouteSummary — DONE — 27.10.2026 07:00 МСК

- Parent `8d928a21308c22b338e1b26370bc779ac4260974` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Removed redundant `coordinates` from the saved `selectedFastRoute` fixture in `scripts/v2-partial-trace-recovery.test.ts`. This call accepts `RouteSummary`; full geometry is already passed separately as `routeGeometry`. No runtime behavior or assertion changed.
- Focused regression1/1, scoped ESLint and `git diff --check` PASS. Corrected strict scripts/tests typecheck moved32→31 diagnostics,14→13 files. Temporary config removed; overall strict check still fails and is not a CI gate.
- Block21 remains IN PROGRESS; plan progress21/24 (87.5%).
