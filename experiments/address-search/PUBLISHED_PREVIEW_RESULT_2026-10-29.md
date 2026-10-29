# Authorized publication result — remote saved, Preview blocked

29.10.2026 MSK. One approved normal Git push, no force/no merge/CI changes. Remote HEAD8dc4b2866b12bd6313877ceac03facd15b14d8c9; tree6f4b8b74461785a2e1a3abf8498d55558688b8be. Original source d9bcf30 and all previous local commits preserved in /workspace/address-resilience-8fb. Separate replay checkout /workspace/geonames-preview-publish-fc83523 is the current publication/fix worktree.22commits replayed onfc83523d, no conflicts; ALL22intermediate trees and finaltree match original22source commits. Remote fetched/diffreadbackPASS; PR merge b87949ba410b555288a799e4a7de0f63449dfb8e tree also matches publishedtree. No branch/main/Production/Android/backup overwritten.

## Configuration and Production baseline

Project prj_JbuIKFQNjD3FvAcX2I65Dm5OBKie/team_UFuw0UGXjMqBV2hJBxsWGAMS/Hobby/Node24.x. Created GEONAMES_LOCAL_PILOT=1 ONLYtargetpreview/gitBranchfix/v3-missing-route-prices-2026-10-15; env ID3xiqzr7luF8VfEfu; metadata readback confirmed. No Production pilot variable. Public production hostname still resolves toREADYdpl_6XMRbMu5V5vqWTzf684oPTMyubju/source051d51ea4e4e40b21245af4f7e21b2fea4c4f00f, exactly baseline. No share-link/protection-bypass creation, no deployment rerun/promotion/cancel. Authorized config stays branch-specific Preview only; existing immutable deployments not rewritten.

## Automatic Actions — inspected, not manually rerun

-40825210808pull_requestSpecialterritory:overallSUCCESS, but live_probeFAIL (continue-on-error), not all checks clean. VerifyPASS onNode24.22.1:999tests/998PASS/0FAIL/1SKIP + classifier/capture checksPASS, TS/productionbuildPASS. calculation_timingPASS HTTP200/handler7895.408ms/supervisor8322.509ms; this is runner API timing, NOT deployedPreview E2E.
-live_probe artifact: РостовPASS with1HTTP503, КраснPASS with2HTTP503+4cooldown, ДонецкSOURCE_UNAVAILABLE with4HTTP503+3cooldown/198ms. This job probes Photon without Previewpilotconfiguration, NOT a failure of deployed GeoNames. Geometry18verified/4unverified:Feodosia-Mariupol,Krasnodar-Donetsk,Donetsk-Krasnodar,Simferopol-Donetsk. Fullflow3results persisted (25.2s/22.0s/31.0s); no new route audit/retry undertaken. Do not claim all route issues solved.
-40825210791pull_requestB03SUCCESS; inspected artifact10current+8legacy=18PASS, controlled/mocked browser scenarios, NOT realVercelGeoNames. Chromium156.0.8078.47/Node24.22.1; CI merge tree equals publishedtree.
-40825199214pushB03SUCCESS;40825199219pushRoutequality/offlinebenchmarkSUCCESS. All4automatic runs completed; no workflow_dispatch/rerun. Existing actionNode20deprecation warning retained (forcedNode24), no CI modification.

Artifacts downloaded and SHA verified against GitHub metadata:

| Artifact | SHA256 |
| --- | --- |
|12876686182 liveprobe |856c06337025373bef398d87c686107e537a5b55c52ddfb4d9a2f81dccdba452 |
|12876158337 timing |692d134843ac90755273c32e93d69189370f46fbefdef5063f3b61ee0e9cee00 |
|12876128645 B03 |8351973b1648d4756fcbab1918f201c144e00e0347c71a90ab0cc1a5268167d2 |

Raw archives/logs/replay map/parsed evidence retained under /workspace/geonames-publication-2026-10-29 and /workspace/attachments. No signed download URLs/authentication material committed. Logs are evidence only, not a repeated audit.

## Actual Vercel failure and root cause

New gitPreview dpl_HRNK245d2NL9behEqKvTy34vhgEZ, exactpublishedSHA, targetnull, iad1, ERROR BUILD_UTILS_SPAWN_1:pnpm run build exited1. Build machine2cores/8GB.999offline tests:994PASS/4FAIL/1SKIP, failed BEFORE Next productionbuild/functions. Four Photon/snapshot-specific fixtures inherited the now-enabled Previewpilot:

1. scripts/address-city-snapshot-endpoint.test.ts:31 expected2snapshot results, actual10GeoNames results.
2. scripts/address-connect-recovery.test.ts:24 expectedR-1413957, actualgeonames-709717.
3. scripts/address-partial-cache.test.ts:27 expectedR-1413957, actualgeonames-709717.
4. scripts/address-search-endpoint.test.ts:70 expected2abandoned Photon requests, actual0 (local path bypassedPhoton).

This is a proven environment-dependent test-fixture isolation defect: GitHubchecks run pilotOFF, VercelPreviewbuild inherits pilotON. GeoNames data was readable and returned actual IDs DURING BUILD TESTS; that is not evidence of successful deployed functions/browser flow. No Vercelruntime memory/cold-start/functionpackage measurement, desktop/mobile realPreview, street/house livePhoton or fullroutePreview verification was performed; deployment is NOTREADY. Do not substitute olderPreview/Production/local results or call this a network outage. Local26.39MB/RSS218MiB remain local measurements only.

## Minimal fix prepared locally, NOT published

Only four above test fixtures now explicitly set GEONAMES_LOCAL_PILOT=0 while exercising Photon/snapshot mocks, restore prior value in finally. No assertion removed/relaxed, no globalfeature disable, no CI/build command/runtime/routing/tariff change. Dedicated GeoNames-enabled tests remain intact. Local reproduction under VERCEL=1/VERCEL_ENV=preview/exactbranch/pilot1 reproduced4failures; withfix10focusedtestsPASS (including actualGeoNames corpus path/provideroutage/safety), fullPreview-env offline gate999tests/998PASS/0FAIL/1SKIP + quote/APIadapterPASS. TypeScript/scopedESLint/diffcheckPASS. No new build claim: only test code changed, and no seconddeployment was attempted.

The new fix/checkpoint commit is LOCAL child ofpublished8dc4b28; future authorized push is a normalfast-forward, not another replay. Original22commits and original checkout retained. /workspace/geonames-preview-test-isolation.patch contains only4fixture fixes. Separate owner approval REQUIRED for any secondpush; journals/WORK_STATE are also LOCAL pending that authorization. No implicit secondpublication to save this result. Next: authorize smallfixpublication then allow ordinary automaticCI/newPreview; only afterREADY run realimmutablePreviewURL checks with existing authenticated access, never sharelink without permission. Browser tools were inspected but no PreviewUI test is falsely claimed.
