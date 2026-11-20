# B03 minimal fix — locally verified, NOT applied to remote app

28.10.2026 МСК. [Portable patch](address-field-swap-focus.patch) adds three state resets to AddressField's selected/too-short-value branch: items=[], citySnapshot=false, open=false. Existing request abort/350msdebounce/cache/source metadata and selected Place remain unchanged. SourcebeforeSHA2561ad0808c05368c7962a911dec2607f48170f1795e4ef5209371e8f3d8d0285cd; afterSHA2565ece9b654422c35e43442208f5b778cbf0d173fc19f6da946dd21bbc08728a4d. Patch reverse-check against actual localfilePASS.

## Actual browser evidence

[Baseline](baseline.json):6PASS/1FAIL/3NOT_RUN, stopped at swap/refocus. [Patched local source](fixed-local.json):**10/10PASS**,0FAIL/NOT_RUN, Chromium154.0.8037.57/Playwright1.57/Node24.19.0; real localNext16.3.4 UI, mockedAPI, no Photon/routingservice calls. Eight oldfallbackscenarios not rerun. This is a new10case suite; six passed cases rerun after the source fix as neighbouring regressions.

- Exact A/Bselected coordinates and isolation checked via actual classifyPOSTbodies.
- Anapa→clear→Donetsk: oldcoords/items cleared; same-name Donetsk entries remain distinct and correctpositionselected. Anapa is marked syntheticQAfixture, no runtimecoordinates added.
- Fasttypingdebounce, delayedoldresponse and activeclear/shortprefix: lateitems notrestored, realAbortSignal events observed on pending/rrequests.
- Swap values+positions correct, refocus no longer reopens other city's olddropdown.
-503→retry429→retryempty→newDonetsk200: explicit unavailable/empty/recovery behaviourPASS, no APIstatus represented as zero/free.
-320×720selection/clear/replacement/overflowPASS; [mobile screenshot](09-mobile-fixed-local.png),138058bytes/SHA25642200a6164429e0a354b619e1b8e1bc6fdadc4f076d29c12fbd4ec8fdfd29e85.

The original external-service B-only incident is **not reproduced or declared fixed**. Its controlled Anapa replacement counterpart passed even before this fix; swap/focus is a separate proven defect.

## Code checks and environment correction

`node node_modules/typescript/bin/tsc --noEmit && node node_modules/eslint/bin/eslint.js app/v2/components/address-field.tsx`: exit0, no diagnostics. `git diff --check`PASS.

First directNextbuild failed before appcompilation because node_modules symlink escaped Turbopackroot; [actual log](next-build-symlink-failed.log). Preserved link at `/tmp/b03-current-dependencies-link`, copied existing frozen-version dependencytree inside newcheckout (500MB, no reinstall/download/lockfilechanges), then **direct `next build` exit0** with productionTurbopack/TypeScript/static16pagesPASS: [full output](next-build-fixed-local.log). No pnpm build/test:audit/livecorpus. This checks the **modified localcomponentSHA above**, not remoteappcode or an unverifiedfuturecommit.

## Why only patch/evidence are published

Existing classifier `scripts/classify-special-territory-live-push.mjs` marks anyapp/v2 or lib change shouldRunLivetrue. `special-territory-policy.yml` then executes50settlements+Yandex+liveproviders. Simulationconfirmed: thispatch's sourcepathtrue, diagnostic/patch/docsfalse. Publishing appcode now would conflict with owner's explicit ban on broadliveaudits. No security/CIguard bypass or skip-ci trick used. No CIpolicy changed, no runtimefile staged; local modifiedsource is retained.

**Proposed authorization (not implemented):** add an exact-file exception only for `app/v2/components/address-field.tsx` to live-route classification; mixed updates containing any other runtimepath remainlive. Keep verify/TypeScript/build and add/run focused new mocked UIchecks; test classifier cases for UI-only/mixed/unknown/fallback fail-open. After that validatedCIchange, apply this exactpatch and read backappsource. No all-lib exclusion, routing/toll test weakening or accumulatedruntimeclaim.

Until separately authorized, status is LOCAL_FIX_VERIFIED / PATCH_SAVED / REMOTE_APP_UNCHANGED. Sourcepatch, testscript, resultJSON and screenshot allow complete recovery without this local directory. Next independent work: bounded liveB03/B01addressflow and offline remaining-gap assessment; no oldserveraudit replay.
