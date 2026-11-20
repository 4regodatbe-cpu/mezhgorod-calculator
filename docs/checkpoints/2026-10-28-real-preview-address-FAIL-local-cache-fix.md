# Real Preview address acceptance — FAIL; local partial-cache correction

28.10.2026 MSK. Tested remote source fc83523d9a9bcb75eff6a715e73d2f25dd75e6d7, Preview dpl_7X8NtHuMWxVWnBi1zoQUG1h7oJ12, branch fix/v3-missing-route-prices-2026-10-15, PR14 Draft. No second publication, CI or Production change.

## Temporary access and TLS

Exactly one deployment-scoped share link created with ttl82800seconds (23hours) under explicit owner authorization. Link secret never committed or placed in evidence. Chromium initially failed ERR_CERT_AUTHORITY_INVALID before application access. Imported the existing configured environment-proxy CA into browser NSS only for the test process, kept HTTPS verification enabled, and retained the standard proxy. No ignoreHTTPSErrors/ignore-certificate flags or network-policy changes. Post-test NSS listing contains only original four certificates; temporary alias absent. Revoke(regenerate=false) succeeded; protectionBypass response contains zero entries, our secret absent. Deleted temporary private access JSON. No share link remains active from this task.

## Real browser results — no mocks

Playwright1.56/Chromium141.0.7390.37; desktop1280x900, mobile375x812 with touch/mobile emulation. Real HTTP/navigation/API calls, no response interception or synthetic addresses.

Main series: selected default first Yalta suggestion (explicitly Ялта — ДНР, not Crimea), selected SPb; both real V3 calculation calls returned HTTP200. The test records API completion, not certification of displayed fare correctness. On EACH device, clearA→Volnovakha, retry, clearA→Donetsk, retry, then same sequence forB: all8 search/retry calls returned502. Total main-series address requests20:4HTTP200 (initial cities),16HTTP502;2 real calculation callsHTTP200. Retry waited16s after the UI error; no uncontrolled loops or audit corpus. No additional live probe workflow. Successful selection of target replacement cities and repeat calculation after replacement therefore NOT achieved. Page had no horizontal overflow on either viewport.

Separate no-mock preservation checks on both viewports explicitly selected Ялта — Крым and SPb: clearA retained selectedB, reselectA, clearB retained selectedA, reselectB — PASS/PASS. Used ordinary client cache for same-query reselection. No extra route calculation. Main-series failure is therefore not proof that clear buttons erase the opposite field.

Primary files: /tmp/address-preview-live-results/results.json SHA25671187ab60e1e64435fca8da008c8269c99a3ed948754c19f12c189d38d1acee9; screenshots desktop.png/mobile.png; /tmp/address-preview-preservation-results.json SHA256fd82aff2b9e7b9e981b3e5491b6bb58e409002e4938b3bd45b995a9e31672cf5. Runtime logs saved /tmp/address-preview-runtime-logs.md. Test scripts in the evidence bundle include no access secret.

##503/cooldown and connection findings

Preview logs show partial responses on initial cities (e.g.503:5/cooldown:1), followed by address_search_unavailable at approximately20002ms with budget:7 for new queries. Existing hosted artifact12838399589 independently retains the Donetsk CHECK_FAILED case with503:3/cooldown:3, DNR first and missing Rostov homonym second. This establishes unavailable variants and lost coverage, not a proven absence of that city from Photon or a ranking change. Individual failed URL identity is not retained in aggregate diagnostics, so do not assert which exact variant/instance lost the Rostov candidate. Connect-only retry has NOT restored real Preview search under these conditions. No429/503 retry or circuit-breaker relaxation added.

## Minimal NEW correction — LOCAL ONLY

Confirmed another persistence mechanism: API returned partial provider results as ordinary items; AddressField cached any positive list for5minutes, across both fields. Thus a missing homonym can remain absent on subsequent attempts even if its provider recovers.

- app/api/suggest/route.ts adds boolean partial when any variant failed or budget expired.
- lib/address-suggestion-cache.ts accepts partial option and does not cache such responses.
- app/v2/components/address-field.tsx forwards the API flag to the cache. Partial positive suggestions remain visible; complete lists retain existing TTL/cache behavior; no new requests/retries/tariffs/ranking changes.
- scripts/address-partial-cache.test.ts first FAILED2/2 against old code, then PASS2/2; existing cache regressionsPASS3/3 (5total). Covers API503→partial and recovery from one Donetsk to both without stale cached partial list.
- Local actual component browser test with controlled responses: desktop/mobilePASS, exactly2requests for first partialDNR-only and recovered two-city response after clear/re-entry. Explicitly mocked evidence, separate from real Preview failures. /tmp/address-partial-ui-results.json SHA2561a41b68a90a02592d0d264ba963366329924bc507d0ff6d294c0e16276cb99ec.
- TypeScript/scoped ESLint/diff-checkPASS. Direct Next production buildPASS, log /tmp/address-partial-cache-build.log SHA2560871faa8a93b2534459c8b91688ddd6a4a43d1cfcecb552239878ef0ad7661c4. No additional full audit or CI run. Next dev appended an agent-rules block; that tool-generated unrelated change was removed and AGENTS restored byte-for-byte.

## Outstanding / handoff

Full Photon outage and503/cooldown candidate loss remain unresolved; this local cache correction does not make unavailable results available. No independent provider, invented coordinates, disabled snapshot activation, routing change, CI edit or new deployment. Local patch must receive separate publication authorization and mandatory CI before release. Remote remainsfc83523d; this checkpoint/WORK_STATE and prepared code are LOCAL ONLY in accordance with no-second-publication instruction. Next: review/publish cache correction only with permission; separately solve real provider connectivity/coverage without loosening assertions or repeating unchanged live requests.
