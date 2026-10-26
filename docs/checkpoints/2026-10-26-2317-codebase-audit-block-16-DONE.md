# Codebase audit block 16 — test inventory and coverage — DONE — 26.10.2026 23:17 МСК

Branch fix/v3-missing-route-prices-2026-10-15, parent 4cffabe01afe228c14090f494945bf109df423c7; PR14 Draft; Actions idle. Static inventory only; no test process.

- Recursive remote tree listed 145 test-like files; deterministic comparison to package test:audit script globs found all 145 included. This is inventory/path inclusion, not proof all suites execute successfully.
- Focused existing tests cover address endpoint/pool/cache, V3 API response/date validation, toll composition unknown/partial, trace retry behavior and route candidate guards. No coverage report/tool configured in the package script; no branch coverage claim.
- V3 API tests explicitly reject invalid calendar and missing-timezone timestamps. V2 API integration tests inspected do not include departureAt validation cases: this is a concrete test gap for AUD-DATE-01.
- No V2 regression for recover partial trace thresholds was found in filenames reviewed; inspect exact related fixtures only if a follow-up change is authorized.

Block done 16/18 (88.9%). No source changes. Next B17 workflow/check wiring static review; do not launch workflow.
