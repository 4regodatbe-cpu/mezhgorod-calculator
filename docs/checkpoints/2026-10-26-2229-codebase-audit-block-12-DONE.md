# Codebase audit block 12 — API response/error contracts — DONE — 26.10.2026 22:29 МСК

Branch `fix/v3-missing-route-prices-2026-10-15`, parent `6f7024b668a29e9aabe7eb121449ff74a6d3817e`; PR14 Draft; Actions idle before write. Reviewed V2/V3 calculate handlers, legacy calculate handler, UI response validation. Static only.

## Findings

- **AUD-DATE-01, P2 confirmed validator mismatch:** V2 at `app/api/v2/calculate/route.ts:48` only rejects NaN Date.parse; invalid calendar day can normalize and timestamp without timezone is accepted. V3 `app/api/v3/calculate/route.ts:33+` explicitly checks calendar and timestamp offset. UI sends ISO timestamp, so direct API/other clients are the affected surface. Because departure time selects toll period, normalized date can select the wrong period. No request test performed. Recommend shared strict validator + tests; low/medium risk.
- **AUD-ERROR-01, P2 confirmed HTTP contract weakness:** V2 line97 and V3 line132 map all non-UNAVAILABLE exceptions to 400, including unknown internal errors. Generic body avoids error leakage but clients/monitoring see bad-request rather than server failure. Recommend typed input/upstream errors and unexpected=>500; isolated, low risk.

V3 response validation strictly checks one result, monetary null/zero/priced shapes and fare sums; V2 validates a minimum success shape. No malformed payload was sent. UI preserves unknown toll amounts as null. Legacy endpoint limitations recorded B4.

Done 12/18 (66.7%); no code changes, no tests/network. Next B13 static abuse/privacy review.
