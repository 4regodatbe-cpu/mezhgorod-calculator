# B01 actual browser→/r→Photon→selection with correct Node proxy opt-in

28.10.2026 МСК. One new changed-condition scenario, not a repeat of the mocked18B03suite. Localserver sourcecomponentSHA5ece9b654422c35e43442208f5b778cbf0d173fc19f6da946dd21bbc08728a4d equals published/hostedverifiedfix; API/collector/library code unchanged. Node24.19.0, Next16.3.4webpack, Chromium154.0.8037.57,390×844. No application, othercomponent, tariff or deployment edits.

## Flow and actual results

Story: select realAnapa inB→clearB→search/select realDonetsk throughactualPOST/r→productioncollector→Photon→renderedchoices. Serverstartedcommand-scoped with`NODE_USE_ENV_PROXY=1 NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next dev --webpack --hostname127.0.0.1 --port3014` and standardnetworkgrant. Inheritedproxy/TLS/credentials unchanged; no proxy/authbypass. Exactcurrentlockfilematchedexistingdependencytree before reuse.

|Boundary|Actual evidence|
|---|---|
|BrowserUI/hydration|Real local/v2, no pageerrors, not SSR-only|
|Client→/r|Exactly2actualrequests:Анапа,Донецк; no retries/calculation/routes|
|API→Photon|RealcollectorHTTP200both; sourceCount7variants each atsameorigin, partialhttp_503/source_cooldown preservedinserverlog|
|Response→selection|RealreturnedAnapaR-1477115 selected/cleared; realDonetskRostovR-1517207 selected|
|Selectedcoordinates|ActualclientclassifyPOSTpositions equal eachselectedrealitem.position; classificationservice response explicitlyMOCKED|

[Full report](report.json), [raw/rAnapa](response-1.json), [raw/rDonetsk](response-2.json), [serverstdout](server.log). AnapaHTTP200:3606msincludingdebounce/firstAPIcompilation, bodySHA2564d95e56989888566d63ddda0b16f76593e6fa229600229603a527bd227209b1c. DonetskHTTP200:1144ms, SHA25671e34b160963f46dd5d782d124f3e7858482f9fcac30c74a1bf3aba5046fb769. Bclearedbeforesecondquery, finalpositionnotAnapa. No reviewed_city_snapshot fallback returned; flagfalse andexpiryunchanged. Coordinates are **liveproviderresponses**, not reviewedlocalcatalogadmissions.

Important identity: selected**Донецк,Ростовскаяобласть,Россия**, notDonetskDNR. Browserexplicitlyclickedthelabel; app didnotautoselectcity or mergehomonyms. Do not inferDNRcoverage fromthisrun. Independent same-name choice was separatelymock-tested inB03CI.

Actualserverpartialdiagnostics: Anapa1710ms,sourceCount7,failures{http_503:1}; Donetsk716ms,sourceCount7,failures{http_503:3,source_cooldown:2}; budgetExpiredfalseboth. This verifies positivepartialresults survive an observed partialservicefailure. SourceCount is URLvariantcount, not sevenindependentproviders or proven numberofoutboundrequests. Telemetry/classificationresponses were controlledmocks; calculation/notrealrouting were neverrequested.

## What is and is not closed

- Currentproxy-awarelocaltransport andthisrealreplacementflow **PASS**. Verification skillstopsaftertheseaddressboundaries, no unrelatedfeatures/cosmeticfixes.
- Earlieractual502/7network_error remains immutableearlierevidence. Differenttime+changedNodeproxycondition are not apairedcausalproof ofitsrootcause, nor proofoperatorneveroutages. No default/direct-connection control attempted.
- B01completeoutageresilience **PARTIAL**: no new independentfallback/catalog or backendcodefix. ColdqueryduringtotalPhotonfailurecanstill502; no Production/everyuser/phone/general10sSLAclaim.
- B03specificswap/refocusdefect remains alreadyclosed bypublishedcode/hostedred-green; thisnewliveflow is notusedretroactivelytorelabelallpastB-onlyincidentsfixed.
- RawPhoton/OSMresponses retain sourceoriginandobservedhash; ©OpenStreetMapcontributors/ODbL attribution https://www.openstreetmap.org/copyright. No unreviewedcoordinateimport, snapshotsourceactivation, expiryextension or tariffchanges.

Next usefulinput: approved independentfallback/source/collisionvalidation fortruefulloutage, or a newly reproducibleproductionfailure withsafeaccess. Do notrepeatthesetwoqueries or historicB03/road/providercorpus without newcause. Localserver canbestoppedafterexactownPIDverification; copieddependencies/workingcopyretained. Currentresults require checkpoint/log/state/nonforcecommit+allfile/tree readback before handoff.
