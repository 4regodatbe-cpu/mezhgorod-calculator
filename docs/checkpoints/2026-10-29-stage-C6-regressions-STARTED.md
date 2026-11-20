# C6 — final local regression acceptance STARTED

29.10.2026 MSK;startingfromC5completedlocalcheckpoint. Runtime/app/lib/data/workflow/dependency files unchanged vs publishedc2f52ee9; onlyeightnewC3tests plus boundedanalysis/evidence/docs. No push or externalCI/Preview/live invocation authorized.

Run sequentially with rawlogs under experiments/road-ref-boundaries/checks/2026-10-29-stage-c/:

1. `npm run test:audit` — requiredofflinegate fornewregressioncode, not a nationwidecapture audit; expectedprior1031PASS+8newtests,retainexisting1SKIP,do not invent counts.
2. `node node_modules/typescript/bin/tsc --noEmit`.
3. scopedESLintnewtest andthreeC2/C4/C5analysisrunners;syntaxcheckrunners.
4. `node node_modules/next/dist/bin/next build --webpack` — directbuild, NOTpnpm build (would rerunaudit). Standardprocesspermission if sandboxspawnEPERM, not appworkaround.
5. Reuse unchanged-source/published-tree fastest/corridor/dual/date/selectedtrace/unknown contracts as exercised inofflinegate,inspect exact results. Separateboundarysource/hashchecks; rawlogs preserved. No repeatB03/B10browser/live/networkaddress tests.

Record PASS/FAILactualexitcodes,notwholeStageCDONEjustbecauseunitgreen. C2operatorcrosswalk/M11partial/M12registration/CKADfreeboundary/largerZSDproduct gaps stayopen. Fulluserlatency/cloudcold/RAM/hostedabortnotmeasuredhere; sourceidentity verifies no newruntimeperformancechange,butdoesnotprove10sSLA.

Recovery:ifgatefailsreadfirstactualfailureandaddressonlydemonstratedtaskregression; preserveknownsource/modelconflicts, no assertionsweakening. Aftercompletedcheckscheckpoint+WORK_STATE/localcommit+portablebundle; remoteunchanged/PR14Draftreadback.No secondwriter or hiddenpublication.
