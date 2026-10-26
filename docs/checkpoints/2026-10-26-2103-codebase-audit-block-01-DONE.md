# Codebase audit block 1 — inventory and dependency map — DONE — 26.10.2026 21:03 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `b413f273a075f5b8ff1cbb038b1c648c17b05487`, PR #14 Draft. Source files fetched from exact remote ref; no code/test/build/network changes.

## Evidence

Recursive Git tree at source `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`: 7,240 entries; root counts include app38, lib119, scripts166, data25, experiments3716, docs2356, workflows73. Runtime shape is Next App Router: canonical UI `/v2`; separate `/v3`; API route handlers under app/api. README describes multi-provider routing plus separate local toll engines.

- `package.json:15` test:audit launches TS tests through Node import loader (scripts and selected experiment suites); package also uses Node24/pnpm11, Next16/React19.
- `tsconfig.json:53` excludes `scripts`; TypeScript app build does not statically type-check that tree. This is a validated coverage gap; runtime tests/lint still cover parts, so severity P2 (test/maintenance risk), not a demonstrated user-facing bug. Recommendation: separate no-emit audit tsconfig for production scripts/tests, introduced/tested independently; risk low/moderate; benefit early type errors; standalone module/config.
- V2 API `app/api/v2/calculate/route.ts` uses shared `lib/route-providers.ts`, v2 route-leg, toll pricing integration and special-territory policy. V3 `app/api/v3/calculate/route.ts` uses shared provider/pricing/policy plus v3 route-leg/special options and Yandex estimates.
- `lib/route-providers.ts` imports M11 road evidence, M12 spans and M4/general road boundaries (blob `13118c…`); provider facade is an integration hotspot. V3 UI hook `app/v3/components/use-v3-calculation.ts:5-9` imports shared UI utils, format, pricing data, fare presentation and types from `app/v2/components`. These are architectural coupling risks (P2/P3), not proof of incorrect behavior. Possible future isolated extraction to neutral shared contracts/util modules; moderate refactor risk due parity expectations; useful to reduce cross-version changes.
- Repository surface is evidence-heavy; counts are structural only, not a code-quality metric.

## Outcome

Block 1 complete; 1/18 (5.6%). No application defect asserted from inventory. Static typing gap is a probable/proven validation limitation; module coupling is a risk. Tests/build not run. Next: block 2, inspect exact remote address suggestion/geocoding flow and existing focused tests/evidence, without network.
