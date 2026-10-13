# А-289: исправление категорий и этап4 композиции М-4

Запрос пользователя 13.10.2026: почему Анапа–Краснодар833 при полном А-289800; сверить Славянск–Краснодар/Ростов, исправить аналогичные ошибки, затем следующий этап. Local base801aa3a / remote8cc2982424e78c32d696b79bc857be05310ce94e.

## Причина и тарифная коррекция

В flattened таблице операторские категории I/II ошибочно прочитаны как transponder/noTransponder. Это системная ошибка импорта, а не доказательство дорогого анапского съезда. Первичный операторский search index `https://avtodor-tr.ru/road/tariffs/` содержит строки:

| Пара | Категория I | Категория II (не для этого профиля) |
|---|---:|---:|
| Марьянская—Славянск |415|555|
| Славянск—Варениковская |205|278|
| Марьянская—Варениковская |620|833|
| Варениковская—Темрюк, операторский терминал |180|270|
| Марьянская—Темрюк, все3 рамки |800|1103|
| Славянск—Темрюк, операторский терминал |385|548|

Primary operator document listing `https://tskad.ru/about/documents/` names Order59 of27.02.2026; same-road 800 confirmed by user. Direct Avtodor HTTP403, tskad timeout/proxy error; no new PDF or complete direct HTML download claim. Secondary reports corroborate class-I/II, but implementation evidence is the primary indexed table + accepted user800. New structured snapshot `source-snapshots/a289-category-columns-2026-10-13.json` preserves retrieval limitation. Source index also separately shows bypass410/410 as categoryI, so its price is not changed by this correction; crossing proof is still a separate issue.

Fixed both active other-road snapshots, A289 engine and OD input, regenerated vectors/selection register and validation. Bad old rows are explicitly preserved in a289CategoryCorrection.previousMisinterpretedRows. Base payment modes use classI; no loyalty/transponder discount inferred. Added vehicleCategory1 to generated A289 records and a quote guard against wrong/missing class. Existing city Temryuk620 two-frame control has its own TemryukCity node; operator full terminal800 is distinct. Taman intermediate385/180 are copied from direct operator terminal OD with explicit candidate continuation aliases; no subtraction from800.

Anapa remains the observed two-frame Varenikovskaya exit alias, visibly unconfirmed in API. The live representative route now proves the two actual frames and same620 Yandex fare; no guarantee for every city address/exit. Audit3's earlier833/555/278/270/548 assertions were wrong-class expectations; replaced using independently retrieved source, not declared historical truths. An initial broad numeric test edit also changed longitude37.8330177; corrected back to the real camera before accepting any check.

## Live controls: no mocked external routing

Recorded three actual POST function calls and provider response bodies under `live-controls/2026-10-13-*.json`; replay script `scripts/v3-live-a289-audit.mjs`. API body inputs are the same representative public coordinates used in Yandex UI, departure2026-10-13T13:36+03.

| Representative pair | Live V3 | Live Yandex UI | Same-route qualification |
|---|---|---|---|
| Анапа—Краснодар |165009m,8657s,620; OSRM frames82→23|102mi,2h17,~620|Same observed fare and A289 route; no claim exact time/geometry equivalence|
| Славянск—Краснодар |83634m,4824s,415; OSRM frame23|52mi,1h22,~415|Same observed fare and A289 route|
| Славянск—Ростов |316724m,16991s,150; OSRM no A289, confirmed M4-1093|218mi,4h, A289→M4, paid label/no amount|Routes differ. Do not add415 to an OSRM road that does not cross A289 or certify150 against Yandex|

Yandex UI exact final URLs/directions/profile saved in `live-controls/2026-10-13-yandex-a289-city-controls.json`. No CAPTCHA or sign-in needed. Opera not connected and TinyFish wallet negative; used independent cloud browser for public route-planner interaction. Free source fetch also failed403/proxy_error. Do not claim those failed tools provided live proof.

One diagnostic route through the existing approximate bypass-start control (38.98,45.24) returned360335m/19073s, A289415 + M4 south850 =1265; slower than the unconstrained provider result. Persisted full geometry in `2026-10-13-slavyansk-rostov-western-connector.json`. It was not promoted to fastest or inserted in runtime. Query for new OSM toll booths returned406; no new verified bypass coordinates obtained. Live route-ranking difference and exact bypass crossing remain open for final route controls.

## Этап4: отдельная композиция

V3 now requests M4-only production output through explicit includeA289=false (default for existing V2 callers remains true). New `lib/v3-calculation/m4-a289-composition.ts` combines selected-route M4 vector + separately bound A289 OD + separately detected bypass once. It works for partial M4 corridors such as Rostov and full Moscow corridors. Old V3 priority chose short A289 instead of M4 on partial routes, or required a full Moscow corridor to bind the eastern A289 side. A confirmed selected M4 PVP now supplies eastern continuation binding, never the city name alone. Partial/unknown M4 blocks a total even if A289 is known. Already mixed M4/A289 input is rejected rather than guessing subtraction. Nearby unconfirmed M4 candidates do not break a local A289 trip; actually confirmed M4 passage cannot be dropped by local endpoint names.

Focus cases use real matrix values: southM4850 + Slavyansk A289415 =1265, +Anapa620 =1470, optional detected bypass410 once. FullM45040 + bridge800 =5840, plus bypass410 =6250. These are conditional vector composition checks, not claimed Yandex Rostov totals. Repeated/unknown A289 retains fail-closed status.

## Проверки и оставшиеся этапы

Initial A289 gate failed due to the accidental changed test longitude; after correcting it, focused suites passed. Initial TypeScript complained about JS adapter string-union inference at the new TS composition boundary; explicit existing result-type boundary fixed it. Focused composition/API17/17 PASS; vector validator4699 rows PASS; full gate478/478 + quote/API contracts PASS; TS/scoped ESLint/Next16/16 PASS after final verification. No source fee is clamped to800 to hide bad data.

Changed files: snapshots/OD/matrix/selection data and generators; a289-engine.ts, m4-production.ts, a289-short-route.ts, m4-a289-composition.ts, route-leg-pricing.ts, quote.cjs and related source/regression tests. Full audit remains incomplete: stages5–10 pending. Open concrete route issue: Slavyansk–Rostov same-date Yandex versus available provider path/ETA; exact bypass gate binding; holiday/midnight remains stage7. No merge/main/Production. Persist experimental branch and verify exact Preview before presenting this checkpoint.
