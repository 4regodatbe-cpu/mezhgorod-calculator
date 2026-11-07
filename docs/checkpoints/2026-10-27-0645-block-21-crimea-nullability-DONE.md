# Reliability block21 — Crimean M4 nullable toll assertion — DONE — 27.10.2026 06:45 МСК

- Parent `20a547e47c3cb176f03d69c85acd7afa9f77137b` was read back from the allowed branch; no Actions associated with that new commit; PR14 remains Draft.
- The saved bidirectional Crimea/M4 test passed before the edit. Added `assert.ok(dzok)` before reading `dzok.amount`; the expected 410 ₽ remains asserted. No route, fare or runtime behavior changed.
- Focused test1/1, scoped ESLint and `git diff --check` PASS. Corrected temporary strict scripts/tests check:33→32 errors,15→14 files. Temporary config removed; this remains diagnostic work, not a CI gate.
- Unexpected earlier run40469828321 on the prior SHA completed overall SUCCESS: `verify` and `calculation_timing` PASS; live geometry PASS; address collector returned Ростов and Красн PASS, Донецк SOURCE_UNAVAILABLE after HTTP503/cooldown; 50-settlement/Yandex checks skipped. Failure artifact [12718511135](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40469828321/artifacts/12718511135). No rerun requested or started.
- Block21 remains IN PROGRESS; plan remains21/24 (87.5%).
