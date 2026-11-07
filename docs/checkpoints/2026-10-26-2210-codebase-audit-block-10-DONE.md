# Codebase audit block 10 — V2 UI state and lifecycle — DONE — 26.10.2026 22:10 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `9780942216b8a15490b4815d10b7b5e6183660ec`; PR #14 Draft; Actions idle pre-write. Read `app/v2/components/address-field.tsx`, `calculator-form.tsx`, `use-v2-calculation.ts`, `app/v2/page.tsx`. No browser/test execution.

- Address field debounces 350ms, aborts obsolete suggestion fetch on effect cleanup, checks abort before consuming results, keeps positive cache, and shows loading/empty/error+retry status. Input maxLength200. No race/empty-query defect established.
- Calculate hook aborts previous request on new calculation and aborts/clears when form settings change. However hook has no unmount cleanup; V2 page invokes it without an external cleanup. P2 probable resource risk: SPA unmount can leave client request/server calculation running. Not reproduced. Recommend effect cleanup of current controller + focused hook regression; low-risk, isolated.
- API success shape is minimally validated before state update; deeper field validity/error handling deferred to B12. Telemetry is best-effort. No change to code.

Block done 10/18 (55.6%). Next B11 V3 UI lifecycle.
