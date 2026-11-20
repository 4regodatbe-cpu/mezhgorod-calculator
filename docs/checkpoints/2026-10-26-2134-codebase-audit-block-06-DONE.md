# Codebase audit block 6 — route candidate selection — DONE — 26.10.2026 21:34 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `215ab7accf22106feae1c4dd6fefc830b97eab67`; PR #14 open/Draft; no active Actions at pre-write check. Static remote review: `lib/route-quality.ts`, V2/V3 `route-leg.ts`, V2/V3 `special-options.ts`, `lib/special-territory-policy.ts`, `lib/v3-calculation/route-candidate.ts`, `scripts/v3-route-selection-audit.test.ts`, remote tree test-path inventory. No tests/network/build.

## Conclusion

The initial provisional P1 concern (V2 empty geometry reaching toll pricing) is **not substantiated on current public call paths**. V2 API ordinary/special route calls pass candidate-plan control positions. `followsPlan` requires ordered matching of each control and returns false when geometry is empty; the provider result is filtered before selection/pricing. Thus the described empty-array case does not reach fallback/pricing in those handlers. V2 still lacks V3's explicit `isUsableRoute` (finite positive summary, coordinate range, endpoint proximity, reviewed ZSD exclusion) and V2-specific regression was not found among inspected tests; record only as P2 test/defense-in-depth gap, not wrong result.

Fastest-only calls use `selectFastestRoute` over already admitted candidates. Ordinary selection uses `selectLiveRouteCandidates`; no defect inferred because the product's normal-selection contract was not established in this block. V2/V3 special options likewise call `followsPlan`; V3 additionally calls `isUsableRoute` before plan checks. Existing V3 regression asserts empty geometry is not priced as a road. No assertions were executed.

Block done 6/18 (33.3%). No source/business changes. Update report removes provisional P1 and records AUD-TEST-01. Next: B7 offline inspection of already saved Eisk/Maykop V2/V3 evidence only; do not repeat capture.
