# Reliability block21 — required validation message in saved fixture — DONE — 27.10.2026 06:30 МСК

- Parent `b694db0677f0b3720c13bcbcc018dcde7dfb0c5a` was read back on the allowed branch; PR14 remains Draft; no active run was reported for that commit.
- Corrected the saved M12 recovery fixture in `scripts/v3-unpriced-coverage-audit.test.ts` to supply the required `TollValidation.message`. This is fixture-only typing alignment; assertions, route/tariff behavior and runtime code are unchanged.
- Focused suite PASS (1/1), scoped ESLint PASS, `git diff --check` PASS. Corrected temporary strict scripts/tests config: 34→33 diagnostics across16→15 files. The temporary config was removed; this does not make the global strict check a passing CI gate.
- Block21 remains IN PROGRESS; no CI gate added. Overall plan progress remains21/24 (87.5%).
