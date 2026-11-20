# A+B publication final — mandatory gates PASS / Photon live FAIL / Preview auth BLOCKED

29.10.2026 MSK. ONE authorized normal fast-forward push completed. Published **c2f52ee93cd98a81ecd05efa0358fb38c6704124**, tree **81b4edaee4ffb6a17c3c93308b87ec52fe08d054**. Prepared20commits plus preflight/checkpoint commit published without rewriting history. Exact remote HEAD/tree readback PASS; PR14 remains open/Draft/unmerged. Final follow-up artifacts/checkpoints/WORK_STATE are **LOCAL ONLY**, intentionally NOT sent in a prohibited second push.

## CI — all three automatic runs inspected

| Run / event | Workflow result | Actual jobs / checks |
|---|---|---|
| [40948464866](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40948464866) / push | SUCCESS | Route quality and offline benchmark integrity: provider-selection/corridor/segment/benchmark/runtime-isolation tests, productionbuild, V2validation smoke PASS. |
| [40948474945](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40948474945) / PR | SUCCESS | verify PASS; B03controlled8legacy+10current browser scenarios18/18PASS, sourceSHA/componentSHA checked. Includes A↔B/refocus, bothfields/cancel/stale-response/recovery and mobile. NOT actual Vercel/Photon browser acceptance. |
| [40948475162](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/40948475162) / PR | SUCCESS overall, **not all jobs green** | verify/classifier/calculation_timing PASS; **live_probe FAILURE**, masked only at workflow level by existing continue-on-error. No CI policy changed. |

Node24.22.1, Next16.3.4; complete offline gate1031PASS/0FAIL/1SKIP, TypeScript and productionbuildPASS. Existing actual-corpus opt-in skip is not PASS; separately retained data checks are not re-executed. Six new controlled V3 cancellation regressions PASS inside hosted gate, plus existing fastest/selected-geometry/unknown guards. Scoped ESLint remains previous unchanged-source **local** PASS; no configured hosted ESLint step invented.

Special workflow verifies PR mergecommit33ddd2ed0a3e03112567a653933295ef54acce12. GitHub Git API confirms its tree **exactly equals** publishedHEAD tree81b4edae; B03checks exactHEAD. Raw commit responses, job logs, full workflow list and final metadata preserved. No successful build of an unrelated tree substituted.

## Exact live failure and skipped scope

`scripts/address-search-runtime-probe.mjs:5,38–47` calls **collectAddressFeatures (Photon collector)** directly, not the server GeoNames-first API. Actual artifact:

- Ростов PASS/2490ms,106features,no sourcefailures.
- Красн CHECK_FAILED/938ms,6×http_503,20features,Krasnodar-not-first.
- Донецк SOURCE_UNAVAILABLE/1ms,7×source_cooldown,0features.
- Probe exit1; workflow **fixed50settlementaudit and sixYandexcomparison SKIPPED**, not PASS. No rerun, manual audit, extra push or assertion weakening.

This is a confirmed current Photon503/cooldown failure, **not proof GeoNames API is defective** and not evidence GeoNames hosted independence is verified. Further failure root-cause remediation is outside this publication-only scope.

Geometry probe stepPASS with22provider records:18verified,4unverifiedValhalla. Feodosia→Mariupol and Simferopol→Donetsk LEG_TOTAL_MISMATCH; Krasnodar→Donetsk and Donetsk→Krasnodar LEG_CROSSES_ZONE. Offline comparison with retained prior published artifact confirms the **same four sample/provider/reason warnings**; no claim all geometry proved or newly regressed. No new capture/audit run for this comparison. Three full-flow diagnostic durations21.981–31.017s further preclude a universal10s SLA claim.

Automatic actual Donetsk→Moscow calculation_timing:HTTP200/7108.766ms,1123250m/58336s,priced3050 output. Real GitHubrunner/provider handler check, **not** Vercelbrowser/coldstart or independent tariff recertification. Previously saved noncancelled baseline12response EXACT parity remains local evidence; no fresh all-route equivalence audit.

Three downloaded ZIPs have verified GitHub artifactdigests:12930068474/B03,12930785827/timing,12931445202/live. [Review and hashes](../../experiments/preview-acceptance/2026-10-29-ab/final-review.json), [file manifest](../../experiments/preview-acceptance/2026-10-29-ab/manifest.json). Detailed source-backed failure rows preserved inside live-probe.zip; raw logs not copied into handoff.

## Exact Preview and Production

- [New Preview](https://mezhgorod-calculator-f0h1q39tw-4regodatbe-5310.vercel.app/v3):**READY**,dpl_HbLBjiztL9wCe4xn22gTho3V2Y4k,correctbranch/sourcec2f52ee9. VercelTurbopack/TypeScript/static16of16 PASS. No new deployment triggered beyond the authorized Git push.
- Existing browser reaches **Login – Vercel** on the exactREADY origin; CLI65.7.0whoami exit1/loggedInfalse/linkedProjectnull. **BLOCKED_AUTH**. No loginloop/share/new Trusted Sources rule/protectiondisable/tokenextraction. Management MCP web_fetch not used because it creates/reuses temporary share access. Authnonce/token not saved.
- Actual newPreview cities/streets/regionalranking/clearA-B/swap/desktop/mobile/route **NOT RUN**. No old deployment or mocked response presented as real hosted acceptance. Coldstart/RAM/functionsize UNMEASURED;327.75MB buildcache is not functionsize.
- Production **unchanged**:dpl_6XMRbMu5V5vqWTzf684oPTMyubju/source051d51ea4e4e40b21245af4f7e21b2fea4c4f00f READY; deployment-alias readback still includes mezhgorod-calculator.vercel.app and mezhgorod-calculator-4regodatbe-5310.vercel.app. Initial domain-filter lookup returnedempty and was not treated as evidence of alias removal; deployment-scoped readback supplies the actual associations.

## Remaining limitations / next action

Preserve partial GeoNames coverage (169431admitted/52081excluded), unavailable Photon streets/DNRArtyoma unconfirmed, no operational independent free street reserve, historicYalta→SPb502/socketcauseunknown, BRouter no-track/target-island gaps, unverifiedauxiliarypricing/V2/body-stream cancellation, actualVercelRequest.signal disconnectdelivery, historicmobiletimeoutcause and cloudcold/RAM metrics. No hardcodedcity/coordinate/tariff corrections, matrix/road/routing-policy changes or new source claims made here.

Publication/mandatory offline gates/build/controlled UI and current real GitHubroute done; **A+B full functional/Preview acceptance NOT DONE**. Next: obtain existing authorized access to this exactREADYPreview (no token in chat; no share/protection mutation unless separately authorized), then the existing bounded settlement/street/A-B/mobile/controlroute acceptance. Independent Stage C can be scoped separately without declaring A+B blockers solved; this task does not begin a new tariff/boundary audit or authorize Production.

Save status:implementation/preflight/checkpoints throughc2f52ee9 are durable in allowedGitHubbranch; finalreports/evidence retained in localcommits with recoverable handoff. No activeCI remains among the3associatedruns; no secondpush. Finalnotes change no runtime/data/CI source relative to publishedHEAD. Historical protected addressWORK_LOG/NEXT_STEPS remain untouched; CHECKPOINT-FIRST indexing retained.
