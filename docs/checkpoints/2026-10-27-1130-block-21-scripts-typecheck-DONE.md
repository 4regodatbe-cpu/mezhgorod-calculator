# Reliability block21 — strict scripts/tests TypeScript — DONE — 27.10.2026 11:30 МСК

- Parent `5138acdecd75640ac7b43ce59dd60890811f68f3` was read back on the allowed branch; PR14 remains Draft; no Actions associated with that SHA.
- Corrected temporary noEmit config covered `scripts/**/*.ts` and `lib/**/*.test.ts`, extended the repository `tsconfig.json`, set `incremental:false`, explicitly included `node_modules/next/types/global.d.ts`, and excluded `node_modules` from discovery. `npx tsc --noEmit -p tsconfig.scripts-check.json` exited0 with no diagnostics. The temporary config was removed. Root app `npx tsc --noEmit` also PASS.
- Original diagnostic run reported57 errors across24 files. Three `RequestInit.next` errors were caused by omitted Next ambient types; 54 actual type errors were resolved in the documented focused groups. No assertions were disabled or weakened. Source changes are generic return typing and JSDoc; remaining fixes align test fixtures and non-null guards with existing runtime contracts.
- Focused tests for all modified groups passed individually; scoped ESLint and `git diff --check` passed. No full test suite, current-head Next build, or CI gate is claimed here; CI gate was not added.
- Block21 DONE; overall technical progress22/24 (91.67%). Block23 remains PARTIAL; block24 is report consolidation.
