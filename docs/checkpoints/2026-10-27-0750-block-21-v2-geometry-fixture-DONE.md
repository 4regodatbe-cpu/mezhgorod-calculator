# Reliability block21 — V2 alternative-route geometry fixture — DONE — 27.10.2026 07:50 МСК

- Parent `3f6bafb2f02ec1151069f06549d454263295a3f7` was read back on the allowed branch; PR14 Draft; no Actions associated with that commit.
- Added the declared `RouteWithGeometry` type to a copied candidate fixture in `scripts/v2-toll-booth-alternative.test.ts`. This preserves the intended geometry and route-rejection contract while preventing widened `number[][]` inference.
- Focused test1/1 PASS; strict scripts/tests diagnostics23/8; scoped ESLint and `git diff --check` PASS. Temporary config removed; no CI gate added.
- No runtime/tariff/route behavior changed. Block21 remains IN PROGRESS; plan21/24 (87.5%).
