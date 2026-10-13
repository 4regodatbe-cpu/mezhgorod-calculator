# Stage8 — tariff version / zone / rounding audit, 2026-10-13

DONE existing code audit/fixes; not independent confirmation of all operator fare rows. Local baseline67644e5, integration/matrix-estimates-2026-10-13; remoteexperiment6eeb8bde14358c502fb3e1a60b8aadffc1501387 confirmed. Actual instructions/state/decisions/next/README and engines/generator/geometry read. Unrelated open PRs12draft64631d23,9draft63b4c392,6open808394c8 checked unchanged. No merge/main/Production.

## Version selection findings/fixes

- `quote.cjs` compared a date-only crossing against full ISO effective-from lexically. CKAD2517 with from2026-03-02T00:00+03 was incorrectly unavailable on2026-03-02. New `fare-validity.cjs` validates original civil dates, normalizes timestamp bounds to Europe/Moscow and uses inclusive start/exclusive end. A midnight ISO start is active on its first local date. UTC21:00 previous day maps correctly to Moscow00:00 next day.
- A non-midnight version switch cannot be determined from a crossing date alone: affected day returns unknown. Example M11 head effective2026-04-24T01:00+03 cannot choose a date-only fare onApr24, butApr25 can. No fabricated crossing hour. End aliases effectiveUntil/validUntil both supported; impossible/conflicting/reversed bounds fail unknown. Multiple matching versions stay ambiguous/unknown rather than selecting the largest/newest by guess.
- Provisional confirmation used the OD/profile key, so an expired candidate version could contaminate another independently dated current row. Confirmation now follows the exact selected row's registry identity. Small `createQuoteEngine` factory makes actual version-selection tests injectable offline; runtime still constructs once from the same shipped register, not caller-provided source data.
-1549 of4699 stored rows have neither validFrom nor effectiveFrom. Existing user policy permitting numeric candidates retained; such a selected row is now visibly unconfirmed rather than automatically confirmed. No dates guessed, no dataset amount changed or missing history fabricated. This is not proof of applicability to arbitrary historical/future dates; source-bound chronology remains incomplete.

## Commercial fare / zone / rounding findings/fixes

- Each zone/leg used Math.round before summation, making the total depend on segmentation. Equal raw parts0.49+0.49 produced0+0 instead of rounded total1. Calculate raw amounts, round total once, allocate integer rubles using descending fractional remainders and stable segment index for ties. Displayed segment amounts always sum to the displayed trip total. Rate tiers per ordinary leg, normal/manual/special rates, urgency multiplier, and zone determination policies unchanged.
- A fixed0.001km tolerance admitted missing/extra zone length (e.g.100km leg vs50+49.9995), potentially undercharging or exceeding tiny legs. Require agreement within floating-point tolerance max1e-9km or1e-12 of leg length. Tiny allowable numerical overshoot is clamped, not priced as extra distance. Geometry implementation already uses routed total minus special component, so exact splits remain compatible.
- Finite inputs could overflow money toInfinity or exceed safe integer rubles; they formerly appeared complete and could serialize invalid money as null. Validate raw component/total bounds and rounded safe-integer result. Invalid pricing returns totalPrice null and no invalid partial segment payload, with review/split flags. Unknown vehicle lookup also fails review instead of throwing into calculation.

## Sources and unresolved data issues

M1 generated m1 cell230 is hardcoded, while stored other-roads source labels transponder230 and noTransponder250. Prior A289 import had a category-column error, so changing this M1 payment/category reading blindly would repeat that risk. Primary official search for current2026 M1 table returned no results; opening https://avtodor-tr.ru/road/tariffs/ returned403. No independently verified new price/date imported. M1 customer component remains unknown under physical/source guard; matrix offline230 is unconfirmed. M3 stored source conflict/dates, M11 mainline special-day schedule and seasonal head succession remain unresolved. Existing announced seasonal window is not treated as a newly invented PDF-exclusive end.

Generator hardcoded M1/M3 values and undated source-series rows are documented, not declared validated.4699 row register was inspected, not rebuilt; original amounts/provenance preserved. No new gate-bound M1/M3/regional pricing enabled. Source version at exact intraday payment on day-invariant roads still needs actual timestamp/proof; date-bound lookup now fails safely where boundary time is unresolved.

## Validation actually run

Focused8/8 PASS using actual CKAD/head matrix values, injected exact dated/candidate/overlap versions, conflicting aliases, fractional fare sum, loss of zone length and overflow. Final `npm run build -- --webpack`:516/pass516/fail0 + quote/API contracts PASS; TypeScript/Next16/16 pages PASS. Scoped ESLint/diff-check PASS. First lint invocation reported CJS require-import rule on existing/added require lines; declared the .cjs entrypoint's intentional CommonJS style, reran lint clean. No failed calculation/test hidden. No new live provider/browser/hosted POST. Primary-source retrieval failed as above; no current source price confirmation claimed.

NEXT stage9 UI/copy/cache/failures; stage10 exact routes/performance/live equivalence and remaining source/physical/calendars. Source conflicts remain explicit deferred, not a completed nationwide fare audit. Publication pending at report creation; append verified code/Preview evidence afterwards.


## Stage8 verified publication

Local8993d81 maps to remote5d222c7727b9e911800c985e15f8c5f4f7016277 (parent6eeb8bde), tree22a00de6f518f038b43d88414446bf12ae234116. All10 changed file blob hashes matched tested local source,0 mismatches; base tree preserved, update_ref expected_sha/force=false. No source price dataset regenerated.

Preview dpl_EXRpmoF43j4Y43XAS9aq1seZVtN9 READY exact source5d222c77, target=null; https://mezhgorod-calculator-e7f9g7iwb-4regodatbe-5310.vercel.app/v3 . Remote logs516/pass516/fail0, quote/API contracts PASS, TypeScript/Next16/16 PASS, Build Completed31s. Authenticated protected GET /v3 HTTP200 confirms page availability only, no hosted trip POST/browser/new live source certification. Nextstage9. No main/merge/Production.
