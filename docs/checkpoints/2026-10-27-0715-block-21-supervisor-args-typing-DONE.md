# Reliability block21 — supervisor child args typing — DONE — 27.10.2026 07:15 МСК

- Parent `2c52f7e3c849cc3df99568b93400fb0b1a801d20` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- The runtime supervisor already accepted injected child-process `args`; strict inference omitted the option from its public type. Added `args?: string[]` to the JSDoc options shape. This is type documentation only; no process execution behavior changed.
- Existing `scripts/calculation-runtime-probe.test.ts` PASS; scoped ESLint and `git diff --check` PASS. Corrected temporary strict check:28 diagnostics/12 files (down from31/13). Temporary config removed; not a passing project-wide gate.
- Block21 remains IN PROGRESS, no CI gate adopted; plan progress21/24 (87.5%).
