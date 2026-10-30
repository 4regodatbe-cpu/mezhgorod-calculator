# D1 — minimal street-context correction LOCAL / final gates STARTED

30.10.2026 MSK;parente21ce88f;publishedremote c2f52ee9/PR14Draftunchanged. New8regressionsfirst:0PASS/8FAIL,negative d1-before.log retained. Retained actualPhoton street-2.body returns RostovDonetsk street39.9866201,48.3179236, matching the owner's incompatible-preview symptom; no newPreviewHTTP capture or livePhotonrequest claimed.

## Concrete cause and minimal source changes

- lib/address-query.ts:settlementForStreetQuery previously required comma/semicolon. Now city-first prefixbeforeanexplicitstreetmarker can preserve city+region withoutpunctuation. House/numericqueries and street-only/arbitrarywordorder are not reinterpreted; no citydictionary or coordinate added.
- app/api/suggest/route.ts previously found a compatibleStreetID but then rankedALLrawfeatures. It now ranks onlyfeatures passing existingphotonStreetMatchesSettlement when the admittedcitycontext exists. No compatible street→sameexplicitcity-onlyGeoNamesfallback with existingstreetSearchstatus/precision,notanothercity'sstreet.
- lib/photon-address-search.ts:explicitpriorityregion fromstreetcityprefix is a coordinate-basedconstraint,not onlyrankingbonus. Incompatiblecoordinatefeature is rejected evenifitsproviderstatetextlies orlocalstore is unavailable. Ordinaryregion/citymembership uses existingadmittedlocalcontext. No providerURL/budget/retry/AddressField/route/tariff/data/switch/CIchange.

Currenttargetedcommand `node --import ./scripts/register-ts-paths.mjs --test scripts/address-street-context.test.ts scripts/street-address.test.ts scripts/compound-address.test.ts`:**26PASS/0FAIL**,including8newcases. Checks no-comma,all-incompatiblefallback,mixedleak,explicitRostovoppositepriority,genericKrasnodar/Eisknamesake,coordinate-over-claimed-region,fullsourceoutage/cancel,and20sbudgetwithoutnewfanout. SyntheticpositiveDNRstreet is explicitlya filteringfixture,notnewrealArtyomastreetcoverage. Actualfallback citypoint/ID comesfromadmittedGeoNames, not invented.

NewteststandalonestrictTS initiallyfoundoneclosurepropertynarrowingerror; saved d1-test-types-before.log, capturedalreadyvalidatedposition inconst, strictconfig nowPASS. ScopedESLint exit0/0errors/1pre-existingunusedkeywarning; notrelabeled0warnings. Existing tests unchanged. Portabletargetedtypingconfigkeptwith evidence; no projecttype/CIconfig altered.

Beforelonggate this localcommit preserves code/test/evidence. Remaining mandatory commands, logs under experiments/address-search/2026-10-30-stage-d/: ONE npm run test:audit; projecttsc --noEmit; scopedESLint; directnext build --webpack (notpnpm build); finalnewtesttyping. Use standardprocesspermission for knownsandboxspawnEPERM, no appworkaround. Inspectfailures, no broadroad/GeoNamesaudit/newbrowsernetworkqueries. D1finalstatuspendinguntilgatescomplete; source newPreview checkNOTRUN/unpublished.

NextsaveD1verifiedcheckpoint/localcommit,thenD2boundedprimaryresearchresults→D3remainingoperatorcases→D4table. ProtectedaddressWORK_LOG/NEXT_STEPS untouched/checkpoint-first; no push/Production/main/Android/backup/PRmutation.
