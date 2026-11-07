# B03 live flow / B01 remaining gap —28.10.2026 МСК

## Actual browser→API result, not mocks

[Report](live-report.json), [raw response](live-response-1.json), [server log](next-server.log). Chromium154, Node24.19.0, viewport390×844, local3linefix componentSHA5ece9b654422c35e43442208f5b778cbf0d173fc19f6da946dd21bbc08728a4d; **server/r/collector code unchanged from75d55b8a**. Classify/analytics explicitlymocked, real/rnotintercepted. No calculate/routing/provider audit.

Actualtime28.10.2026 00:59:51–00:59:59МСК (rawUTC timestamps retained). One coldquery«Анапа»→HTTP502 after7141ms browser-observed, bodySHA256b95d4f631601309de642febf3326f364c4ed9d4d6645fcafd9986d1d2a40c9c6. UI actually displayed “Сервис поиска временно недоступен.” and “Повторить”, no inventedcoordinates/items. No automaticretry; Donetsksecondquery **NOT_RUN**, stopped at first broken external boundary as planned.

Serverdiagnostic: `address_search_unavailable {elapsedMs:5691,sourceCount:7,failures:{network_error:7},budgetExpired:false}`. Next/rrequest6.7s including887mscompilation, not a10sSLA. Sourceorigin `https://photon.komoot.io/api/`; existing `photonSearchUrls('Анапа')` yields plain/UA/RU/fourbboxvariants, still **one origin**, not sevenfallbackproviders. Exact variant construction is reproducible offline via lib/photon-address-search.ts; no extra network requests made to diagnose it.

**Do not call this PhotonHTTP503/429 or a proven globalPhotonoutage.** All failures have boundedlabelnetwork_error in this environment; low-levelDNS/TLS/proxy/socketcause and remoteHTTPstatus were not established. `photonFailureReason` deliberately does not lograwURL/error; the summary cannot support a more specific claim. No challenge/proxy/auth bypass or unchanged network retry attempted.

## Independent B01 offline assessment (not rerun old tests)

Relevant sourcechecked: `app/r/route.ts`→`app/api/suggest/route.ts` lines16–34; `lib/address-search-service.ts` outcomes/unavailable/finally; `lib/photon-request-pool.ts` finish/cache/get; `lib/address-city-snapshot.ts`. Existing pool15tests/endpoint/snapshotcontracts were only consulted by names, **not rerun**.

- unavailable=true only if every source variant rejects; partialsuccess/validempty do not trigger fallback. Current actualfullnetworkerror maps to explicit502.
- Positivecache is read before cooldown; finish deletes task only when mapidentitymatches. No new cancellation/cache defect proved; do not redesign already working pool based on a speculative race.
- Existing budget/cancellation remainsbounded; circuit's503/429policy is unchanged. Network-error cooldown would be a separate policy tradeoff, not a demonstrated defect justifying blind expansion.
- Coldqueries without currentpositivecache cannot be solved by queue/singleflight/cooldown alone. Limited4-citysnapshot is DISABLED; it has noAnapa and expires31.10.2026 11:24:54МСК. No new independent reviewedsource/catalog supplied in this unit. Existingtariffcarryforwardpolicy does **not** extend addresssnapshotexpiry.

B01 remains **BLOCKED_BY_LIVE_SOURCE / missing approved independent coverage**; **0new B01runtimechanges**. No unverifiedcoordinates/fallbackactivation/expiryextension. No safe furtherofflinechange to sourceavailability is demonstrated by these inputs. This is a verified currentfailure boundary, not another serverwideaudit.

## Current handoff and required decision

B03swap/focus technical defect locallyfixed with3lines,10/10mockedbrowsercases+TS/ESLint/defaultproductionbuildPASS; portablepatch and sourcehashes in LOCAL_FIX_REVIEW.md. Remoteappstillunchanged. OriginalB-onlyexternalAnapa→clear→Donetsk cannot be accepted from liveflow because firstlookupfailed; mockcounterpartpassed before and afterfix.

To publishprovenB03fix without prohibitedwideaudits, owner must authorize **exactAddressField-only liveclassifierexception** while retaining mandatoryverify/TS/build and focusedUItests; other/mixed/unknownruntimechangesremainfail-openlive. No suchCIchange implemented. Next permission/newsource, not more identicalPhotonrequests or experimental tariffs. PR14Draft, no Production/main/Android/backupchange.
