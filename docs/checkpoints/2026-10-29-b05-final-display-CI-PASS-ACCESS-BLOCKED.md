# B05 — final published display correction: CI PASS, exact Preview READY, acceptance BLOCKED

29.10.2026 MSK. One authorized ffpush publisheda1c169d3c7dce49b7d1d3747b9698e7aee4b581a/tree19793e429d667ff925003cc58570a8010ed2e86d. Final remote readback remains thisSHA; PR14open/Draft, head same allowed branch. No secondpush. All post-publication checkpoints/artifacts LOCAL ONLY.

## Completed automatic CI, independently checked jobs

- https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40881925570 completedSUCCESS: verify123475396483, classify_live_scope123475396848, live_probe123475592798 andcalculation_timing123475592816 allSUCCESS. The live jobs use continue-on-error, so their individual conclusions were checked, not inferred from workflow green.
- https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40881925603 completedSUCCESS; verify/address-uiSUCCESS. Artifact12901640228 confirms8legacy+10currentUI PASS/0FAIL, sourcea1c169d3, Chrome156.0.8078.47. These are controlled UI tests, not the protected deployed application.
- VerifyNode24.22.1,1007offlinePASS/0FAIL/1SKIP; additional classifier/capture checks, TypeScript and Next buildPASS. Existing preferredRegion/action-runtime/punycode deprecations remain. No prior local gate rerun or CI/config modification.

## Actual live artifact and remaining cautions

Saved original ZIPs in experiments/address-search/2026-10-29-final-display-ci/, hashes match GitHub:

- b03-ui.zip artifact12901640228, SHA2565ba6c7a2ea4a89525254e7a716536f462cb4c0f55a4ff7dc2cf6ffd21cae8c7f.
- calculation-runtime.zip artifact12899509413, SHA2560867475581d6b68ca0de66f4ec83eb36d6b933c4c3354d98aabcb16669daf3a0.
- live-probe.zip artifact12901731154, SHA2560b7b1d873420df9ba2f4f2dc3bfe5b9439f10f172c384a549ba8e4c03299bda5.

Production address collector on GitHub runner: РостовPASS11891ms, КраснPASS11854ms, ДонецкPASS11783ms; no source failures recorded in this run. DNRfirst/Rostovsecond checks true. This is a real runner collector test, NOT GeoNames outage proof in Vercel or proof that intermittent Photon failures are permanently gone.

Actual handler-with-network donetsk-moscowHTTP200/7583.476ms (under10s); artifact explicitly deployedBrowserEndToEndfalse/tariffIndependentlyVerifiedfalse. It does not replace the requested Preview control calculation.

Automatic50-route artifact still has Valhalla48success/2rejectedROUTING_PLAN_LEG_STRETCH_1_16.3X and16.4X, OSRM50success,19provider disagreements. Counts/errors match the preceding5558 automatic run; no new algorithm regression established and no route/tariff changes made. Seven historical Yandex-reference rows (step title says six):5single-provider,1unavailable,1warning; all7lack screenshot geometry identity proof. Green job does not certify all provider outputs or toll values. Only existing automatic results inspected, no new broad audit/query to routing providers.

## Exact new Preview and access boundary

https://mezhgorod-calculator-5liov1bd6-4regodatbe-5310.vercel.app/v3 — READY, deploymentdpl_BLWKSPSNgg4YbB1DLZTXqRkuXWAo, sourcea1c169d3, targetPreview, iad1. Own build logs confirm1007PASS/0FAIL, compilation4.6s, TypeScript12.6s. Protection enabled; direct browser navigation afterREADY redirects to LoginVercel. Exact URL was supplied to the owner for access through their Connector. No new share URL, CLI login, token extraction, protection mutation, old share-token transfer or old Preview substitution. No access response received during this block.

Therefore new-deployment real checks remain NOT RUN: Доне withoutДонецьке, DNR/Rostov andCrimea/other priority qualifiers; no technical IDs/coordinates in labels; retained homonyms and honest unknown-district context; independent local-city path; desktop/mobile clear/retype/opposite endpoint retention; one control route. Previous5558 real results are NOT evidence that the two defects are fixed here. The earlier mobile resize/Moscow timeout is OPEN/UNKNOWN on this new source, not claimed resolved or newly reproduced.

Cloud cold-start and peak memory UNMEASURED. Runtime-log read on this exact deployment returned no entries. Catalogue exposes peak_memory_mb/duration/ttfb but supplied no validated deployment-scoped measurement; metric-specific selector still returned catalogue, documentation supplied no usable query scope. No blind repeated query or paid upgrade attempted. Provisioned memory,350.04MB build cache, localRSS, GitHub timings and build elapsed time are not hosted measurements.

Production public alias and latestProductionREADY rechecked: dpl_6XMRbMu5V5vqWTzf684oPTMyubju/source051d51ea4e4e40b21245af4f7e21b2fea4c4f00f unchanged. No main/Android/backup/merge/Production operation.

## Before Production

Owner-provided access to the exact new deployment is required, not another push. Run the bounded real acceptance set above and inspect response/console state during the old mobile resize/re-entry case; do not attribute a timeout to a provider or client without HTTP evidence. Assess available cloud resource measurements honestly. Investigate any confirmed new defect locally; a further publication needs separate authorization. Even successful B05 acceptance is not an automatic release or proof all B01–B12 functional/data blockers are closed; Production remains separately prohibited.

Historical protected WORK_LOG/NEXT_STEPS unchanged under checkpoint-first rule; this checkpoint/WORK_STATE and downloaded evidence are the current handoff. B05 statusPARTIAL_BY_ACCESS, not completed hosted acceptance.
