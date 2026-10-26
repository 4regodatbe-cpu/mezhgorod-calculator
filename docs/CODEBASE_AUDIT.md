# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; новый аудит — 18 блоков. Current source `fix/v3-missing-route-prices-2026-10-15`; initial reviewed SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Read-only; no business logic, tariffs, CI, or production changes. No tests/build/browser/live requests. Progress applies only to this audit.

## Progress

1 architecture; 2 address lookup; 3 cache/pool; 4 API input; 5 providers; 6 candidate selection; 7 saved captures; 8 geometry/boundaries; 9 pricing composition; 10 V2 UI; 11 V3 UI; 12 API outputs; 13 security/privacy; 14 perf; 15 deps/build; 16 tests; 17 CI; 18 data governance/synthesis. Done 13/18 (72.2%); [last checkpoint B13](checkpoints/2026-10-26-2240-codebase-audit-block-13-DONE.md).

## Existing V2/V3 results (no replay)

Eisk Thu/Sat V2−V3 fare deltas +580/+1,530 RUB and route −1m/0s; Maykop fare delta 0 both days and route −1m/0s. Outputs are proxy evidence only, not operator tariff confirmation. See B7 checkpoint for source hashes.

## Findings: P2, not runtime-reproduced

- **AUD-GEOCODE-01:** direct Photon label geocode lacks local timeout; a slow provider may hold calculation until platform timeout. Recommend bounded adapter/abort test, isolated.
- **AUD-API-01:** calculate routes lack explicit request bytes/label size limits; platform constraints unknown. Shared input validator recommendation.
- **AUD-PROVIDER-01:** route JSON responses have no explicit app-level byte cap; provider/platform limits unverified.
- **AUD-TEST-01:** V2-specific invalid geometry regression not found; empty geometry on current API paths is rejected by route control checks. Coverage gap only.
- **AUD-TRACE-RECOVERY-01:** incomplete map trace can still have status=toll; corridor recovery then uses lower threshold (M4 2/4; M12 2/5 consecutive matched geometry segments) and may return matched sum for detected segments. Potential partial-total classification, unproven. Add bounded complete/incomplete trace fixtures before behavior changes; medium risk.
- **AUD-UI-01:** V2 calculation hook has no unmount cancellation (file lines25,70–74,143), unlike V3. Possible continued backend work on SPA navigation. Low-risk isolated cleanup/test.
- **AUD-DATE-01, confirmed validation inconsistency:** `app/api/v2/calculate/route.ts:48` only tests Date parse; invalid calendar dates can normalize and time without timezone is accepted, while V3 validates date and offset. Since departure affects toll period, direct malformed V2 API input can select another period. UI normally sends ISO. Recommend share strict date validator + tests; low–medium risk.
- **AUD-ERROR-01, confirmed HTTP status weakness:** V2 line97 / V3 line132 map all non-`UNAVAILABLE` exceptions to 400, including unknown internal errors. Generic message is safe, but clients/monitoring misclassify server failures. Recommend typed input errors=400, upstream=502, unexpected=500; low risk.
- **AUD-SEC-01, probable abuse/resource risk:** `app/api/collect/route.ts:20–57` accepts public POST, parses JSON before truncating fields, then forwards accepted events/feedback to configured webhook without visible body-size limit, rate limit or fetch deadline. Feedback itself is capped after parse; route fields are coarsened. Repeated large/valid requests could consume function/webhook capacity; no abuse was attempted. Recommend pre-parse/platform size cap, abuse-rate policy at edge or service, and bounded webhook deadline; low/medium risk and independently testable. Validate deployment rate controls before calling it an exploitable defect.

No P0/P1 confirmed. Provisional V2 empty-geometry P1 withdrawn after B6.

## B13 controls reviewed

- `/api/suggest` caps q at 200 chars, ignores under-3 chars, and uses shared bounded address budget with request abort; logs coarse operational failure metadata, not raw query in inspected handler.
- Vercel debug endpoints require configured `CALCULATOR_DEBUG_TOKEN`; hide unauthorized responses as 404; bound labels/timeouts. `/api/v2/classify` caps positions at 2.
- `/api/collect` has field validation/coarsening and honeypot for feedback, but no explicit request body/rate/webhook timeout found in handler.

## Unchecked

Blocks 14–18: performance/memory, dependencies/build/supply chain, test effectiveness, CI configuration and data/doc governance. No runtime execution; no security probing. No tariff/road audit.

## Next

B14 static resource/performance review: repeated computation, provider fan-out, caching and possible memory bounds. No benchmarks or network.
