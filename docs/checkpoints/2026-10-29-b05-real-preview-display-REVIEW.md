# B05 — real existing Preview acceptance and known defects (not the local fix)

29.10.2026 MSK. Published source5558ed8bdec347361b2b5749c370d6d3c31d83c1; local correctionac61af868c55d309b83ca362cdff106401600e95 NOT published. No push/new CI/Production/main/Android/backup/PR merge changes. Existing owner-supplied temporary access worked in Chromium154.0.8037.57; no CLI login required, no new access link/protection change. Access token is excluded from code, logs, evidence, saved browser state and this checkpoint. Only page-content screenshots, never browser URL bars. Copied evidence was byte-scanned for the supplied token: PASS.

## Actually checked without mocks on existing protected Preview

- Actual POST/r: Доне HTTP200/GeoNames1333.3ms; Донецк200/313.9ms; Волноваха200/300.2ms; Донецк Ростовская область200/996.2ms; Севастополь200/1040.2ms. These are request timings, NOT isolated cold-start or memory metrics.
- Confirmed published defects: Доне returns Донецьке, ID709711; duplicate labels include geonames-ID and exact coordinates. This is failure of the published display standard, despite HTTP200.
- Донецк returned DNR709717 first and Rostov565348 second. Qualified Rostov returned565348 first; Volnovakha689198 correct; Sevastopol694423/Crimea first. Returned positions retained in raw evidence. Other source administrative labels retain their original title case; this is not a new administrative review.
- Desktop1280×900: real selection Moscow→SPb; exactly ONE actual POST/api/v3/calculate returnedHTTP200 in4484ms, one leg711430meters/24889seconds, mode standard. No result/provider mocks. This confirms real round-trip calculation, not independently certified tariff correctness.
- After successful desktop calculation, clearA→Volnovakha→clearA→Donetsk DNR keptSPb inB; clearB→Sevastopol keptDonetsk inA. DesktopPASS.
- Initial continuation of that same page after resizing to390×844 timed out waiting for Moscow suggestions. Failure retained in desktop-and-resize-review.json. Request statuses for that failed UI query were not captured, so its root cause is UNKNOWN; do not attribute it to Photon, the corpus, rate limits or the harness without evidence.
- One bounded retry of only the unfinished mobile portion used a fresh390×844 context with isMobile/hasTouch and tap/fill, no additional calculation. YaltaCrimea→SPb, clearA→Volnovakha→Donetsk, clearB→Sevastopol allPASS; opposite endpoint preserved. All five actual search responsesHTTP200/geonames. Mobile screenshot inspected. This proves the independent mobile scenario, NOT resolution of the initial resize/re-entry timeout or mobile-after-calculation behavior.

## Local versus hosted

The shared orthography screen and human-only homonym labels were separately checked on locally built code, 56targetedPASS,1007offlinePASS/1SKIP, TS/ESLint/buildPASS and local desktop/mobile choicesPASS. They are NOT in this Preview. Published old defects remain until a separately authorized publication and exact-new-deployment recheck. A source-tag-based orthography screen is not a semantic certificate for all names.

Local outage tests exercise real admitted data with fetch throwing/call count0; actual Preview responses declare sourcegeonames and the early-return path is unchanged. No deliberate hosted Photon outage was injected. This is NOT independent confirmation of every external service failure mode. No new live street request, repeated route calculation or broad audit.

## Durable evidence

experiments/address-search/2026-10-29-published-preview-display-evidence/:

- desktop-and-resize-review.json SHA256787e4054077e04daf640e683623e5fe5bb1878aad926dc418694b81d7f63618f: raw five API bodies, actual route response, desktopPASS and original mobile timeout.
- fresh-mobile-review.json SHA25652b7a4dcc3d227ac1c49cdf4cf06c9e8004a25b0036de67fdfdd691d8e1ec61e: actual mobile response bodies/steps.
- desktop.png SHA256bf60cf89367ca3085a44ea5d82fa94de28223bb1016f75f5450e1580dfe104b9.
- mobile.png SHA25645a3babbdcd7e852870caa22bb4dd2e9682f6e4518af2568d766167353bfd17f.

Raw safe test stdout and runners remain in /tmp/b05-share-preview-review*, /tmp/b05-share-mobile-review*; authenticated navigation/cookie state deliberately not saved. Source data conflict and exact local checks are in the preceding display-policy checkpoint; historic protected WORK_LOG/NEXT_STEPS untouched under the checkpoint-first rule.

Next: owner authorization to publish the local display fix, then verify that exact updated Preview no longer shows both defects. Separately retain an open observation for the original mobile resize/re-entry timeout; a further controlled retry must not silently repeat the already-used live route calculation. Overall B05 remains PARTIAL until hosted correction verified. No automatic push or new share access.
