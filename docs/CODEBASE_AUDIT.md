# Технический аудит репозитория «Из А в Б»

IN_PROGRESS; новый аудит из 18 блоков. Remote `fix/v3-missing-route-prices-2026-10-15`; initial source SHA `f1ca4d2662e8937a6f7a74f1168a2e9c15910d3d`. Только статический анализ и просмотр исторических evidence. Не менялись код, бизнес-логика, тарифы/CI; не запускались тесты, build, browser или live запросы. Процент только нового плана.

## План / прогресс

1 architecture; 2 address lookup; 3 cache/cancel; 4 API inputs; 5 providers; 6 candidate selection; 7 saved V2/V3 captures; 8 geometry; 9 fare composition; 10 V2 UI; 11 V3 UI; 12 API outputs/errors; 13 security; 14 performance; 15 dependencies/build; 16 test quality; 17 CI; 18 docs/data governance. Done 12/18 (66.7%). Последний [B12 checkpoint](checkpoints/2026-10-26-2229-codebase-audit-block-12-DONE.md).

## Saved V2/V3 comparison

Ейск V2−V3 Thu: −1m/0s/+580₽; Sat −1m/0s/+1,530₽. Майкоп Thu/Sat: −1m/0s/0₽. Это capture/API proxy results, не тарифные доказательства; details/SHA в [B7](checkpoints/2026-10-26-2143-codebase-audit-block-07-DONE.md).

## Findings

### P2 — вероятные риски / ограниченные контракты

- **AUD-GEOCODE-01:** direct label Photon geocode lacks local deadline; slow call may hold request. Not reproduced. Isolated bounded transport fix/test.
- **AUD-API-01:** no explicit request byte/label size caps in calculate handlers; platform caps unknown. Shared validator suggested.
- **AUD-PROVIDER-01:** route JSON parsed without explicit application size cap; upstream limits unverified.
- **AUD-TEST-01:** no V2 counterpart found for V3 invalid geometry regression; V2 public calls enforce plan controls. Coverage gap, no demonstrated wrong fare.
- **AUD-TRACE-RECOVERY-01:** `toll-validator.ts:317–325` can return `complete:false,status:toll`; `toll-recovery.ts:101–104,117` then uses lower minimum geometry run (M4 2 vs4; M12 2 vs5) and may return matched toll for matched subset. Plausible partial-total risk; no repro, geometry still required. Add controlled complete/incomplete trace fixtures before policy changes. Medium risk; isolated evidence contract.
- **AUD-UI-01:** V2 `use-v2-calculation.ts:25,70–74,143` cancels on replacement/clear but not unmount. Potential ongoing backend work on SPA unmount; not reproduced. Low-risk isolated cleanup. V3 already has cleanup.
- **AUD-DATE-01 (confirmed validation inconsistency):** V2 `app/api/v2/calculate/route.ts:48` checks only whether `new Date(value)` is invalid; impossible calendar dates can normalize and time-of-day strings without an offset are accepted. V3 `app/api/v3/calculate/route.ts:33+` validates calendar and requires an offset when time is included. Since departure date selects toll period, direct V2 API input can map to a different day/period instead of 400. UI sends ISO timestamps, so exposure to normal users is not demonstrated. Fix proposal: reuse strict date contract and regression tests; low–medium risk, independent validator.
- **AUD-ERROR-01 (confirmed contract weakness):** V2 `app/api/v2/calculate/route.ts:97` and V3 `app/api/v3/calculate/route.ts:132` classify every exception not suffixed `UNAVAILABLE` as HTTP400. Unknown/internal failures therefore masquerade as client errors, weakening monitoring/retry behavior; response body remains generic. Recommend explicit typed input errors (400), known upstream unavailable (502), unexpected internal (500) with safe generic body. Low risk, independently testable.

No P0/P1 confirmed. Initial V2 empty-geometry P1 was withdrawn after current call paths showed ordered controls required. Incomplete recovery concern remains P2 only.

## UI/API safeguards observed

V2/V3 UI preserve toll `unknown` as null in request telemetry and show unknown price wording. V3 hook response validator checks schema, numeric bounds, fare sums and unknown/free semantics. V2 response validation is shallower. V2 and V3 API handlers validate enum/rate/coordinates; V2 date is less strict. Error status classification is shared weakness above.

## Unchecked

Blocks 13–18: abuse/privacy/security, perf/memory/requests, deps/build/supply chain, test breadth/quality, CI selective coverage, data governance and final synthesis. No runtime tests/requests/build. No mass route/fare audit repeated.

## Next

B13 security/abuse/privacy static-only: API limits, logging/analytics payloads, external services and error/data handling. Do not probe or attack running services.
