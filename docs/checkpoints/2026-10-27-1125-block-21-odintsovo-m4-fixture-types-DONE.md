# Reliability block21 — Odintsovo and southern M4 fixture typing — DONE — 27.10.2026 11:25 МСК

- Parent `27a04ff6caed02e6bf014d3172e037aa817242b0` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- The Odintsovo negative identity fixture now uses the declared `null` value for absent way ID. The southern M4 test explicitly adapts the inferred JavaScript adapter return at the typed `composeSelectedM4A289` boundary; runtime result assertions remain active.
- Two focused suites PASS; corrected strict scripts/tests diagnostics14/3→10/1; scoped ESLint and `git diff --check` PASS. Temporary config removed; no CI gate adopted.
- No tariff, routing or production expression changed. Block21 remains IN PROGRESS; overall21/24 (87.5%).
