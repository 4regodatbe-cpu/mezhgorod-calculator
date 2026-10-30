# D1 — street geography defect corrected LOCAL / mandatory gates PASS

30.10.2026 MSK;runtime source **ae5203df**,previouslocal210d4669/StageCpreserved;remote c2f52ee9/PR14Draftunchanged. No push/Preview/Production/CI/main/Android/backup action.

## Verified change, not new street coordinates

No-comma city-first streetcontext now retainscity+region; APIranks onlyexisting-compatiblefeatures when anadmittedsettlement exists; explicitpriorityregion is a coordinateconstraint evenwithoutlocaldata. Three runtimefiles:lib/address-query.ts,lib/photon-address-search.ts,app/api/suggest/route.ts. No AddressField/route/tariff/corpus/fallbackactivation/contractrewrite. Existing20sbudget/cancel/rankingpolicy/cityhomonyms preserved.

Exactlocalhandler example `Донецк ДНР улица Артёма` withretainedrealRostovPhotonstreet (39.9866201,48.3179236):HTTP200,first**Донецк — ДНР / geonames-709717 / lat48.023,lng37.80224**,streetSearchstatusunconfirmed/precisionsettlement-centre. SameadmittedGeoNamespoint asstandalonecity; wrongstreetrejected,nottranslated/movedorpretendedrealDNRstreet.3controlledPhotonfetches,0externalrequests. [Example/raw-sourceSHA](../../experiments/address-search/2026-10-30-stage-d/d1-example.json); reproduciblerunneralongside. Syntheticmixedpositives testfilteringonly, notrealstreetcoverage.

## Actual checks on fixed runtime

- New8regressionsbeforefix:**0PASS/8FAIL**; negative d1-before.logretained. Two causesdemonstrated: no-comma contextloss, andmixed incompatiblefeaturesleaking despiteonecompatiblematch.
- Focusednew+existingstreet/compound:**26PASS/0FAIL**.
- ONE `npm run test:audit`:**1047PASS/0FAIL/1SKIP**,quote/APIcontractsPASS/exit0. Existingopt-inSKIPnotPASS. This is mandatoryofflinegatefornewruntimecode, not anotherGeoNames/tariff/routecaptureaudit.
- ProjectTypeScript exit0;newteststandalonestrictTypeScript exit0 (initialclosure-narrowingerrorretained/fixedbeforefullgate).
- ScopedESLint exit0/0errors/1pre-existingunusedkeywarning, not0warnings. ExampleanalysisrunnerlintPASS.
- DirectNext16.3.4webpackproductionbuild/TypeScript/static16of16PASS,exit0;Node24.19.0. ExistingpreferredRegiondeprecation retained. No pnpm build/doubleaudit.

Logs/typesconfig/examples in experiments/address-search/2026-10-30-stage-d/. Otherapp/runtime/data/CIpathsunchangedvs210d4669. No newprimarystreetpoint/sourceimport orbroadbrowserroadsourcechecks. Runtimefix locallyverified, **not deployed or rechecked in the protectedPreview**; publishedbugmustnotbecalledfixedinVercelbeforeauthorizedpublication/acceptance.

Savecode/checkpoints/evidence/localcommitsonly. NextD2recordboundedprimaryresearchandexactmissingoperatorcrosswalk;thenD3remainingretainedroads;D4consolidation. No extra push/permittedCIchange ornewshareauthorization.
