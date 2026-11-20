# Reliability block21 — M11 saved capture byte types — DONE — 27.10.2026 07:35 МСК

- Parent `5b7056a368a7f7c31140de12c3e632e096e1c619` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Three M11 saved-data tests now pass explicit `Uint8Array` bytes to decompression/SHA-256 and explicit UTF-8 strings to JSON parsing. SHA-256 source assertions were unchanged and pass. The orphan fixture uses `wayId: null`, the declared representation for absent identity, rather than an invalid `undefined` value.
- Focused tests3/3 PASS; strict scripts/tests diagnostics moved28/12→24/9; scoped ESLint and `git diff --check` PASS. Temporary config removed; strict gate still fails and is not enabled in CI.
- No production routing/pricing change. Block21 remains IN PROGRESS; plan21/24 (87.5%).
