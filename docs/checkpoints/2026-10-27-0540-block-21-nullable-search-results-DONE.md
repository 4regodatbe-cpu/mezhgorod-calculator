# Reliability block21 — nullable search-result assertions group 3 — DONE — 27.10.2026 05:40 МСК

- Parent branch/readback was confirmed before the group; allowed branch only; PR14 Draft; no active Actions.
- Added explicit assertions for the result and position before reading coordinates in three address ranking cases; used optional chaining in the predicate that searches a ranked list. This preserves the existing expected labels/coordinates and makes missing values fail rather than weakening assertions.
- Strict scripts/tests typecheck before group:45 diagnostics/22 files; after:41/21, with none in `scripts/address-search.test.ts`. Test `node --import ./scripts/register-ts-paths.mjs --test scripts/address-search.test.ts`:1/1 PASS; scoped ESLint and `git diff --check` PASS.
- Temporary typecheck config removed. Overall gate still not ready/adopted; block21 remains in progress. Reliability progress21/24 (87.5%).
