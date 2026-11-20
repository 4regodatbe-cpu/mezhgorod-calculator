# Reliability block21 — M11 nullability and fixture literals — DONE — 27.10.2026 08:15 МСК

- Parent `fe2c30362ffdf77d45da1e81a842f3f79f139c7c` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Added explicit guards for nullable M11 boundary results; comparisons still require the expected payment time/amount, and route assertions are unchanged. Pulkovo fixture now uses the declared validation source `Valhalla map matching` while selected provider remains OSRM.
- Three focused suites PASS; strict diagnostics23/8→18/5; scoped ESLint and `git diff --check` PASS. Temporary strict config removed; CI gate not added.
- No runtime fare/route logic changed. Block21 IN PROGRESS; plan21/24 (87.5%).
