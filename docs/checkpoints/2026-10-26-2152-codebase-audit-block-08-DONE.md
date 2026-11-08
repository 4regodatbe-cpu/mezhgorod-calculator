# Codebase audit block 8 — shared geometry, direction and boundaries — DONE — 26.10.2026 21:52 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `d8f7d24c9022985114fc412e4f4fbcbdb3fe0f5a`; PR #14 Draft; no active Actions before write. Read current `lib/tolls.ts`, `lib/toll-validator.ts`, `lib/special-territory-geometry.ts`, `lib/toll-engine/route-toll-composition.ts`, and selected M4 adapter contracts. No test, trace, network, route or tariff audit.

## Observations

- Legacy geometric toll matcher requires >=3 route points; segment matching checks both ends, bounded route-vs-direct length, directionally ordered stored interior control(s), and full-route endpoints. Two-point endpoint fallback cannot create a toll match; empty estimate has confidence none.
- Trace validator caps sampled points at 320, splits chunks at 140km, concurrency2, request deadline18s, bounded 429 retries; missing/invalid/empty edge results throw and incomplete chunks remain incomplete (not proof of a free route). Static review only.
- Special-territory splitter validates finite coordinate ranges and positive route distance/duration, then derives intersections; overlapping border geometry throws. Route toll composition blocks partial, invalid, duplicate, overlapping old/new road products and unsafe sums as unknown.

No new defect confirmed in this bounded contract review. It is not a renewed road audit and does not confirm any tariff. No source changes. B8 done 8/18 (44.4%). Next B9 pricing aggregation/unknown handling.
