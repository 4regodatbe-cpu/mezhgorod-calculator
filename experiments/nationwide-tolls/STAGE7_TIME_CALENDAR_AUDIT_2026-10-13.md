# Stage7 — temporal/calendar code audit, 2026-10-13

DONE existing temporal integration audit and safe handling of unresolved calendars; not verification of every operator holiday schedule or exact traffic-based crossing time. Baseline4e6a1a4 on integration/matrix-estimates-2026-10-13; remoteexperimentc48b18e219133c759875216a105aa3fec33baaa7 confirmed. Read actual state/instructions/decisions and per-road adapter/schedule code. No main/merge/Production.

## Fixed and tested

1. `lib/tolls.ts` and native `m11-production.ts` used server getDay(), yielding Thursday in UTC when the road already has Friday in Moscow. Reuse Moscow-time `highwayTariffPeriod` for basic weekday classification; empty and full legacy results no longer depend on host timezone. This helper supplies ordinary weekdays, not a universal road holiday schedule. Supported M12 tariffs are allDays; native period now literally `все дни`, not misleading Friday/weekday labels. Its departure parameter remains for API compatibility.
2. M4 matrix correctly refused an unknown calendar/midnight transition but returned null, interpreted as 'no adapter' and replaced with numeric native fare. Now returns an explicit null-tolls component for missing/invalid/overflow date, unverified calendar year, date/profile transition. `composeSelectedM4A289` and V3 preserve that null instead of nullish fallback. A known850 native M4 +415 A289 cannot revive1265 across Thursday→Friday when the tariff time is unresolved. Missing exact traversal/adapter not-applicable remains distinct. Same-date known vectors still price normally.
3. M4 calendar input accepted Date-normalized February30/April31. Validate original date component before parsing the timestamp. Source-bound2026 holiday/exception mapping remains the existing M4-specific dataset, not extended to another road/year.
4. M11 mainline matrix requires a timezone-bearing timestamp; a date alone cannot silently manufacture03:00 Moscow from JavaScript's UTC midnight. V3 hourly Moscow-head detection explicitly rejects missing entry time, even if geometry helper made a candidate. Day-invariant A289 is not subjected to that hourly rule. Whole mainline trip crossing local dates conservatively stays unknown pending a proved payment-time model.
5. M11 mainline source defines Friday/Sunday and special-day exclusions, but an independently verified complete mainline exception schedule is not stored. The adapter now blocks unknown calendar years and ordinary MonThu dates flagged as potentially special by current2026 snapshots (national holidays and stored operator special-date sets). These flags are **ambiguity guards**, never price/profile transfer from M4 or the separately operated M11 head. Friday/weekend rates remain source-defined friSun; normal ordinary days remain available. November3/4 thus cannot accidentally receive a normal weekday matrix amount. Exact mainline special-day resolution remains source work for stage8.
6. M11 Moscow15–58 uses its own stored per-day/night/operator exception schedule. Regression checks00:59:59/day1130,01:00/night880,05:59:59/night880,06:00/day1130; November3 Friday profile and November4 Saturday profile from that exact stored schedule. No head fare was copied to mainline. Geometry-proportional crossing time is an estimate; native period wording changed from 'actual' to 'calculated'. It is not actual per-edge ETA or measured gate arrival.

## Validation actually run

New focused temporal suite6/6 PASS. Host timezone test covers UTC, America/Los_Angeles and Asia/Tokyo using the same instants around Moscow Friday/Monday. Matrix→native/A289 midnight fallback tested with actual composition, not only adapter rejection. Missing hour, impossible calendar, end timestamp overflow, future year and independent-road exception behavior covered.

Final `npm run build -- --webpack`:508 tests/pass508/fail0; quote/API contracts PASS; TypeScript and optimized Next16/16 pages PASS. Scoped ESLint for all changed code/tests PASS; git diff --check PASS. Initial lint warned unused M12 departureAt after removing a misleading date-dependent label; preserved interface and explicitly marked the unused compatibility argument, final lint clean. No new live provider/browser/hosted POST or external current-tariff research in this block; deterministic calendar/unit/integration checks only. Existing actual stage6 live records remain historical, not claimed as stage7 reruns.

## Remaining precise limits

- Full independently sourced M11 mainline special-day/transferred-working-day calendar and seasonal M11-head source succession still need stage8. Guard dates are not a claim of a complete Russian holiday inventory.
- M4 date/profile transitions currently block full-trip estimate rather than assigning actual individual plaza payment times; geometry timing does not establish operator pay/entry/exit profile rules. Source policy/time integration remains explicit unknown, not an invented average/higher rate.
- Other day-invariant roads still need date-version proof at actual crossings (M12/CKAD/A289) when the journey spans a version change; stage8 exact version intervals and stage10 physical/traffic bindings. No new invalid source version made valid here.
- Existing M11 partial/reverse/679–684 and Slavyansk→Rostov route gaps unchanged. No nationwide temporal completeness claim.

NEXT stage8 fare/version/zone/rounding audit, including dated M1/M3 rows and independent holiday/seasonal source series. Stage9 failure/cache/UI; stage10 exact chosen-route physical/time/Yandex evidence. Publication pending at report creation; append verified code/Preview after it runs.


## Stage7 verified publication

Local99fbcf4 maps to remote988a2a0b6f20518c368ea1239bbd2f10a3250e57 (parentc48b18e2), treeb18a787c48eeada9bdf4eb9ea405cb7ee2febcf7. All17 changed blobs matched local tested source,0 mismatches; remote base protected with expected_sha, force=false. Open unrelated PRs12draft64631d23,9draft63b4c392,6open808394c8 rechecked unchanged; no experiment PR/merge action.

Preview dpl_Fvjo1poQfyvkPkbsVSDiEEP29UDB READY exact source988a2a0b, target=null; https://mezhgorod-calculator-h1hah9yrn-4regodatbe-5310.vercel.app/v3 . Remote logs508/pass508/fail0, quote/API contracts PASS, TypeScript/Next16/16 PASS, Build Completed28s. Protected authenticated GET /v3 HTTP200 establishes availability only, no hosted route POST/browser/current-tariff or live calendar verification. Nextstage8 with explicit source/time limitations above. No main/merge/Production.
