# B03 exact-file CI exception — stage1 saved / hosted checks STARTED

28.10.2026 МСК. Owner authorized exact exception `app/v2/components/address-field.tsx`, then patch only after CI verification. Source remoted5f3647867cf3c26e0b9d6bafce33375a765f6eb/tree5c93c9b49c20893456262939e2f045372aa378ad; PR14Draft, priorCI40592051765SUCCESS. Fresh `/tmp/b03-ci-current` checkout from actualremote; olddirtyworkspace copies preserved, oldtmpnotpresent.

Classifier excludes exactfile only. APIwatch expandedfromapp/api/v2 toapp/api plusapp/r (stricter, not a new exemption), preserving routing/tariff/lib/otherapp-v2 strict paths. Mixedupdates stilllive. Sparse/malformedpaths fail-open; renames includeoldpath and missingrenameoriginfails-open. Comparison300cap/nonlinear/APIerror/priorbaseline checks unchanged. No globalCIoff/specialworkflowalteration, verify/TypeScript/productionbuild intact.

Tests: `node scripts/special-territory-live-push-classifier.test.mjs`12/12PASS; new `node scripts/b03-browser-workflow.test.mjs`2/2PASS; YAMLparsePASS; diff--checkPASS. Simulations coverexactUI-only, mixedroute/tariff/allAPI/otherruntime, aliases, sparse/missing/renamed/truncated/nonlinear. SourceAddressField unchanged; savedpatch not applied in thisstage.

ExistingB03workflow addsPRtrigger plus exactUIpath/newrunnerpaths, immutablePRheadSHAcheckout, Node24, frozenlockfile. Preservesold8tests and addsnew10suite withactual07swap/refocus; both exitsgatejob, results+sourcehash printed in logs and rawartifacts uploaded. No b03-live-replacement or real/rproviderused. Neitherexistingmandatoryverify nor broadworkflowedited.

Expected first hostedRED: old8PASS, newregression07fails on unpatchedsource. This is proofgateexecution, NOT CI-success/appfix. Need inspectbothspecialverify/classifier/wideskips and actualB03joblogs/artifact before applyingpatch. Ifunexpectedwidejobstarts, do notcancelorclaimdone; diagnosepreservefail-open and stopruntimepublication untilsafe. Atmostonebranchwriter, no branchwritesduringactiveCI. ActualrunIDs/SHA addedbyfollow-upcheckpoint after readback; no guessedfuturePASS.

Next after exacttree/file remote readback+CIinspection: applyonlyalreadyreviewed3linepatch, focusedtests/mandatoryCI/newbrowsergreen, savecheckpoint/log/state/readback; B01external502separate/unfixed. No main/Production/Android/backup/merge/force or repeatedroadcaptures.
