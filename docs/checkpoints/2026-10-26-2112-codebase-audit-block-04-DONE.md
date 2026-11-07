# Codebase audit block 4 — route API inputs and call graph — DONE — 26.10.2026 21:12 МСК

Branch fix/v3-missing-route-prices-2026-10-15, current parent 2cb7cd85fafbdfbef5ef09176b7a4eecd505fb18; inspected exact remote app/api/calculate, app/api/v2/calculate, app/api/v3/calculate, classify/version/debug routes. Read-only; no request, test or deployment was executed.

## Evidence / findings

- V2 calculate lines14–22,31–57 and V3 lines16–28,45–80 validate known enums, rates, date and coordinate ranges; geocode both endpoints concurrently, apply special-endpoint policy, then route through distinct V2/V3 leg engines. V3 adds timing and accepted Yandex estimate processing. Malformed JSON is caught as controlled 400.
- P2 probable API resource-limit gap: validated point labels require nonempty strings but no server-side maximum length; handlers call request.json() without an application byte cap. UI maxLength200 and provider settings do not protect direct API callers. Static evidence only, not an exploit or outage; Vercel request-size limits may bound some exposure. Recommend consistent body/label limits at the API boundary. Low/moderate risk; prevents oversized payload/query work; isolated validator module.
- Legacy app/api/calculate/route.ts lines7–17,21–30,33–40 directly fetches Photon/OSRM without AbortSignal deadline, unlike the bounded modern provider path; uses truthiness for distance/duration. Root UI redirects to /v2 per README, so public relevance is unconfirmed. P2 reliability/contract risk, not proven active defect; establish consumers, then retire/forward or add timeout and explicit zero-route semantics if compatible. Risk low only if unused; moderate if consumers depend on behavior. Zero-distance not asserted as product bug.
- V2/V3 duplicate request validation/response assembly with distinct calculation engines; divergence possible, but no concrete mismatch found. Keep separate until contract equivalence tests prove safe shared validation.
- classify caps coordinate count at2; debug endpoints use debugAllowed and bounded labels/timeouts (security details later).

No business/routing logic changed. Block4 complete: 4/18 (22.2%). Next: inspect provider adapter request/response/failure limits.
