# Codebase audit block 11 — V3 UI/lifecycle — DONE — 26.10.2026 22:18 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `e725733df3a2f1ce8e29376cb5bf08bb8d8d9c59`; PR #14 Draft, Actions idle pre-write. Reviewed `app/v3/components/use-v3-calculation.ts`, `response-validation.ts`, `app/v3/page.tsx`. No browser or tests.

- V3 calculation aborts prior requests; unmount effect aborts pending request and clears copied-status timer. On clearResult, it also resets error/result/clipboard state.
- `validV3Response` checks one leg/option contract, positive finite meters/seconds, safe integer/nullable toll semantics, pricing segment structure and summed fare consistency. No malformed-response bug demonstrated from static review.
- V3 reuses V2 form/address/results modules (recorded architecture coupling); no evidence here that this changes business behavior.
- No new defect. B10 V2 hook lacks the corresponding unmount cleanup; remains isolated P2 probable resource lifecycle risk.

Block done 11/18 (61.1%). Next B12 API status/error response contracts.
