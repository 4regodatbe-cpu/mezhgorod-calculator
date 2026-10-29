# Stage A city/street code — LOCAL PASS, source coverage PARTIAL

29.10.2026 MSK. Parent9d0d87d0; prior d7cc05f6/a0e27781 preserved. Published a1c169d3/PR14 Draft unchanged; no push, Preview, CI change or Production. All new code/data/evidence is LOCAL ONLY.

## Proved corrections, regression-first

The initial seven-test run reached3PASS/4FAIL: comma-qualified city classified as detail, comma-qualified admitted city returned502 during controlled Photon outage, equal street matches ignored territorial/explicit-region preference, and an unconfirmed target street silently left only an unrelated city's street instead of the admitted city option. These correspond to three root causes; both first failures share city-intent classification. Existing real-capture city+street relevance and coordinate-preservation tests already passed and were retained.

An additional URL contract failed before correction: street inputs still requested the mixed house/POI window, whereas saved real street-layer responses contain verified street features. Houseless explicit street inputs now use the existing three global/UA/RU variants with layer=street/limit20, not extra fan-out. Numeric/more detailed inputs preserve their old windows. Markers after comma/semicolon without whitespace are recognized.

- `lib/address-query.ts`: recognized comma+administrative qualifier remains city-only; conservative city-first street context extraction, no guessed arbitrary city split; no removal of existing detailed parsing.
- `lib/local-settlement-search.ts`: normalize accepted city/region separators before existing admitted index lookup; no corpus/ID/coordinate/territory/import change.
- `lib/photon-address-search.ts`: preserve geographical tie priority after city/street evidence; source-backed street/locality/region and coordinate guards; explicitly approximate street-point labels; existing genuine names/coordinates kept. The helper does not certify exact municipal polygons for every city.
- `app/api/suggest/route.ts`: if an unambiguous city-first street has an admitted city but no confirmed matching street, return **city-only** suggestions with actual original coordinates, partial=true and explicit streetSearch unconfirmed/unavailable/settlement-centre metadata. Do not merge a wrong-city street into the city fallback or call it street success. A confirmed street may use the admitted Russian city name as label context, not an invented translation. Cancelled calls never expose fallback. Local work is deducted from the existing20s collector deadline; no mechanical timeout increase.
- `scripts/street-address.test.ts`:12 new tests, eight controls, real saved windows, namesakes, territorial ties, invalid geometry, outage/cancel/deadline and unchanged more-detailed compatibility. No old assertions removed/weakened.

## Source evidence, exact limits

[Evidence](../../experiments/address-search/2026-10-29-street-scope/README.md): four initial **real** Photon street-layer requests, allHTTP200, then exactly ONE justified UA-filter follow-up for Donetsk, HTTP200. Original bodies/URLs/status/time/SHA retained. No full corpus/route/toll audit or repeated failed URL. Three sources contain requested city/street points: Krasnodar/Krasnaya, Moscow/Tverskaya, Yalta/Kirova. Their coordinates remain byte-equivalent to the provider's features.

Global Donetsk window contains only Rostov Donetsk/Artyoma; the additional UA window contains no proved requested DNR street. This is bounded negative evidence, NOT proof the street is absent globally or physically. Current handler replay therefore returns admitted Donetsk/DNR **settlement** rather than a Rostov street. Street coverage remains PARTIAL; do not fabricate a point or require a house.

Handler replay runs actual Next GET+admitted GeoNames with controlled I/O replaying these saved responses, not a new real server-to-Photon/Preview run. All eight responses200; four city-only controls zero provider calls; the street outputs include three proved street points and one explicit city fallback. Separate full-outage tests are simulations. No operational independent free street reserve was added or claimed.

## Final exact-code checks

Node24.19.0. Final targeted command: `node --import ./scripts/register-ts-paths.mjs --test scripts/street-address.test.ts scripts/compound-address.test.ts scripts/address-search.test.ts scripts/address-region-qualifier.test.ts scripts/photon-russian-display.test.ts scripts/local-settlement-api.test.ts scripts/local-settlement-safety.test.ts scripts/address-search-endpoint.test.ts scripts/photon-request-pool.test.ts scripts/photon-fetch.test.ts scripts/address-connect-recovery.test.ts scripts/photon-retry-budget.test.ts` →93PASS/0FAIL/1SKIP. Skip is the existing separately opt-in actual-corpus test; new tests exercise the bundled admitted data directly.

Final `npm run test:audit` →1025PASS/0FAIL/1SKIP, quote/API checksPASS, exit0. `node_modules/.bin/tsc --noEmit` exit0; scoped ESLint changed four runtime files+new test exit0, one unchanged unused-key warning. `node_modules/.bin/next build --webpack` exit0, Next16.3.4, existing preferredRegion deprecation. Final logs saved under evidence/logs. Initial gate on the preceding mixed-window implementation is not substituted for the final gate; repeat was required only after the confirmed URL change.

Negative fixture evidence retained: initial expected Krasnodar coordinate was not the admitted source point and was corrected to compare with the actual standalone city response, not a made-up constant. Another replay initially reused a cached negative fixture URL; isolated that fixture using an equivalent semicolon query without altering runtime cache/assertions. The first unprivileged file runner only reported test-file failure; sanctioned permitted runner exposed the actual assertions. No unsupported root-cause claim for that generic runner error.

## Next bounded acceptance

Save/read back this local code block, then check only the new street/city-fallback selection plus clear/swap preservation in desktop/mobile. City requests use the real built local server; street I/O explicitly replays actual saved handler responses, not a new Photon run. The earlier single actual route may be reused: route/client/calculation files are unchanged from a0e27781 and the current Moscow coordinate matches the archived real browser input. No second route query or new Preview publication is needed/authorized. Full hosted acceptance, DNR street data and independent street reserve remain open.
