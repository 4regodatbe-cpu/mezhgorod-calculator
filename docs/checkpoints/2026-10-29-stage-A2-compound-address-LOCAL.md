# A2 — compound address relevance and administrative display, LOCAL

Base622b52a5; publisheda1c169d3 unchanged. No push, CI/routing/tariff/Production/main/Android/backup change. Four regression-first tests failed on old code, then passed after the generic fix.

## Evidence and boundaries

Exactly5 bounded Photon requests: global/RU windows for each reported query, then ONE justified RU house-layer comma-form follow-up for Moscow. Raw bodies, original URLs, HTTP codes, timing and SHA256 in experiments/address-search/2026-10-29-stage-a2-photon/. Two global requests returned503 HTML (their .json files retain original bytes, not valid JSON); RU requests returned200. No retries of those failed global URLs, new account or route-provider requests.

RU Krasnodar capture contains an actual building with cityКраснодар/streetКрасная улица/housenumber100 and original geometry/OSM ID. Other-city addresses with identical street/house also exist. Order-reversal replay proved that old scoring could prefer those unrelated candidates; fixed scoring selects the actual full city/street/house match independent of candidate order. All source candidates remain available, never region-matched as city.

Moscow full-query RU window(10features) and alternate house-layer window(20features) did NOT contain exact cityМосква/streetТверская улица/house1. No claim that the house is absent from Photon globally. Actual returned Тверская street8к1 and1-яТверская-Ямская buildings remain truthful partial candidates; no synthetic house1/coordinates are manufactured. A controlled unrelated locality test recreates the incorrect old type bonus, not a claim that its artificial point came from Photon. Exact Moscow house coverage remains BLOCKED_BY_PROVIDER_DATA.

## Minimal runtime changes

lib/address-query.ts supplies shared detail detection and evidence ranking. Rank uses actual city/town/village, street and housenumber tokens; state/county cannot satisfy a city. Complete token evidence wins over partial/city-mismatched addresses; house tokens match boundaries, word order does not require city-specific exceptions. This is a relevance scorer, not a postal-address existence certificate. Streets/house details are included in the display label while original object names/IDs/coordinates are retained.

Photon detail queries keep their original complete query, including comma-separated addresses with trailing priority-region qualifier. Street-marker queries no longer launch settlement bbox windows. City/country qualifier behavior and all prior territorial tiers remain unchanged; the first patch's Харьков,Украина regression was caught/fixed by separating address terms from the local GeoNames comma-bypass rule.

Priority-area POI/address labels now use coordinate-derived Крым/ДНР/ЛНР/Запорожская/Херсонская labels plus explicit Russian administrative fields or existing reviewed area-scoped city names. Unverified raw Ukrainian city/county/state labels are omitted, not translated. Genuine object/street names remain unchanged absent Russian source fields. A previous POI ranking fixture now explicitly provides city:ru for its unchanged city-label assertion; negative tests verify untranslated administration is excluded.

Request-pool timeout/retry/cooldown/abort code and20s budget are unchanged. Added no network retries or paid service. GeoNames detail routing still bypasses settlement centres; zero-fetch outage tests and excluded-record guards retained.

## Verification actually run, Node24.19.0

-79targeted tests PASS/0FAIL using normal file isolation: compound saved-response replay, city ranking/qualifiers, source language, actual GeoNames API, safety, request pool/fetch,503/cooldown/retry budget/cancellation and endpoint flow.
-An earlier --test-isolation=none combination failed2fetch-count assertions due shared Photon cache between test files. Normal isolated rerun passed without weakening assertions or changing runtime cache. Failure log retained /tmp/stage-a2-targeted-final.log; isolated evidence /tmp/stage-a2-targeted-isolated.log.
-Mandatory offline test:audit1011PASS/0FAIL/1SKIP plus quote/API checksPASS; TypeScript exit0; scoped ESLint exit0(one unchanged unused-key warning); webpack production build exit0(existing preferredRegion warning). Logs /tmp/stage-a2-{audit,tsc,eslint,build}.log.

Status A2 algorithm FIXED_LOCAL for proved ranking/query/display causes; exact Moscow house data and hosted corrected-code acceptance remain PARTIAL. No whole-corpus or route audit repeated. Next A3 reuse existing documented reserve assessment, then A4 bounded local actual API/browser/one route and separate published status. No publication without new permission.
