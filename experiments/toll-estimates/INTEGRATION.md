# Stage F — V3 estimate integration, LOCAL / default OFF

30.10.2026. Base620abe48, permitted branch only, no push/Preview/Production. Root is sole writer. F2→F3→F4→F5 are separate local checkpoints; results below are actual completed parts, not promises of background execution.

## F2 — bounded adapter and contract

`lib/v3-calculation/toll-estimate-adapter.ts` calls the existing pure estimator, consumes the actual selected route, strict per-product components, complete existing validation and actual departure. It never imports saved-samples/practical/torzhok fixtures, reads captures/files, performs fetch or chooses a different route. Existing operator quote engines select money/date/profile; no fare literals are introduced. Numeric source-derived M4/M12/ZSD600 remain estimated, not exact. Independently confirmed full strict proof retains priority; original strict objects/amounts never mutate.

The only extra product binding is the already-reviewed CKAD M11↔M7 pair. The adapter uses existing `roadBoundariesFromValhalla` on this selected provider's decoded sections, matching full geometry signature and resolved directed endpoints, plus actual current M11 head boundary and complete trace. It calls the existing CKAD quote engine, not a per-km rate. Missing/unsupported provider sections fail closed: no slower-route substitution, new atlas or document lookup. A fully identified CKAD47 booth may discharge only the exact old duplicate unknown-booth residual, after independent head quote and repeat coverage check; no other unknown road is removed.

Atomic M4/545 sections and family/aggregate guards prevent double counting. Missing components remain required coverage, incomplete full totals are null, and the assessed part is separate. Limits64components/100000geometrypoints, source/signature/date/overlap checks; optional exceptions yield structured unknown, not strict calculation failure. M12 warning explicitly retains the lack of independent registration-boundary certification.

Own server switch `V3_TOLL_ESTIMATE=1`, default absent/OFF. Allowed only localNODE_ENV development/test without VERCEL_ENV, or VERCEL_ENVpreview **and exact permitted commit-ref**. Production/custom/other branches denied, even if switch is set. Client/request fields cannot enable it. No Flags SDK/account/remote env changes or financial dependency; server evaluation/fail-safe isolation guidance applied within owner local-only scope.

Optional DTO `lib/toll-estimate-view.ts`: version1, confirmed/estimated/unknown, totalRub, knownPartRub, confirmedPartRub, bounded warnings/reasons. Currency formatting is toll-only, incomplete known part explicitly not full. This does not affect kilometre/transfer/dual-territory pricing.

F2 checks:4 focused testsPASS, projectTypeScript exit0, scopedESLint exit0; final rerun includes independently confirmed full quote with absent trace, model warning, incomplete/invalid-date/duplicate guards. Initial read-only CKAD inspection used raw instead of decoded provider legs and exited1; corrected to the existing helper's actual decoded-leg signature, yielding both directed endpoints for the two retained cases. This was an inspection harness error, not an application defect. Private raw-trace resolver was also assessed and conservatively refused a discontinuous Torzhok named block; no guard was relaxed. Existing provider-section proof is the reviewed working mechanism, not new map-matching certification.

F3 public API/UI integration and F4 fourcase integration are **pending**; no app callsite wired at F2 save. Mandatory full gate/build follows final wiring, not repeated after each isolated file.

## F3 — V3 API/UI connected, local OFF

`calculateLegTolls` adds only optional `tollEstimate` after producing the unchanged stricttolls/componentAudit. Callers explicitly request it only on the V3 fastest-only path, in both ordinary and special/dual territory flows; V2/default callers do not opt in. `route-leg`/`special-options` propagate the addition without changing provider ranking, coordinates, timing or costs. V3 API keeps legacy fields and vehicle/km pricing intact; an existing accepted Yandex override does not borrow an incompatible pre-override overlay.

Client validates the bounded optional DTO and primary/options agreement. Existing shared RouteCard renders confirmed exact, estimated with«ориентировочно», or unknown/null with knownpart clearly incomplete. Actual data feed the labels; no sample fare is embedded in UI. Existing manual toll input remains available and separate. PriceRows/totalWithToll/km/dual-tariff functions are unchanged; clipboard appends a labelled supplementary toll assessment without substituting any strict transfer total. No extra client switch or public activation.

F3 tests:8combinedfocusedPASS (four adapter + three realReactSSR + one APIcontract), finalprojectTypeScript0/scopedlint0. ReactSSR exercised actual RouteCard, not a string mock: responsive markup, escaped warning, manual input and unchanged strict fields. Not a browser/Preview acceptance claim. Initial TypeScript exit2 on JSunion `coverageKeys` was fixed by explicit property narrowing, not a cast/assertion weakening; original error log retained. F4 source-based fourcase OFF/ON and finalF5gates/build pending.

## F4 — four retained-source integrations and real POST contract

`integration-cases.test.ts` calls actual current `calculateLegTolls` with the four SHA-checked selected geometries, rebuilding the existing validator's route-bound private context from exactly retained successful HTTP responses. Every fetch is intercepted; unrecorded request is an error, not sent to the network. Per-case JSON and original/final logs are retained. For each departure OFF has no optional field; removing the single addition from ON leaves **all** legacy fields/components/validation byte-equivalent. Geometry is unchanged.

| Saved control | Thu15.10.2026,09MSK | Sat17.10.2026,09MSK | New layer |
| --- | ---: | ---: | --- |
| Torzhok→Kazan |5904|6084|estimated; explicit M12 registration-boundary warning|
| Krasnodar→SPb |10464|12334|estimated|
| Granitnoe→SPb, **ZSD component** |600|600|source-derived working component, explicit ZSD warning|
| Same Granitnoe **whole composition** |9534|11184|estimated, existing strict numeric totals unchanged; includes M4/M11 too|
| Arzamas→SPb Primorsky avenue |null (known6928)|null (known7268)|unknown; partial never full; M12 warning|

Important correction: E's finished600 fixture is a **ZSD component control**, not the complete public strict fare of the Granitnoe capture. Initial F4 expected600 as a whole and failed (3/4PASS); actual producer correctly returned9534 and all M4/M11/ZSD components. The source requirement expressly calls600 a component. Test was corrected and strengthened to verify600 separately, sum **all** current components and preserve strict9534/11184. No algorithm/amount/assertion was weakened to produce600; the original failed log/report remains. Historical E artifacts are not rewritten or imported into runtime.

Additional negative guards reject reversed geometry with stale provider sections, incomplete trace, duplicate products, invalid dates and a CONTROLLED dense long-loop perturbation of a copy. The CKAD estimate reuses the existing northern physical reference/path bound; same endpoint names alone cannot price a different long arc. No atlas/source/tariff or M4/M12 threshold changes. Atomic M4/545 overlap is refused; disjoint producer-verified split remains additive. Optional error reasons are bounded to the client contract, preventing supplementary failures from rejecting an otherwise valid response.

Final F4 suite9/9PASS/exit0 (four actual-source cases + source/geometry guards + four adapter tests), projectTS0/scopedlint0. Separate existing `scripts/v3-api-audit.test.ts` extended with one **real POST** standard/dual OFF/ON/Production-denial check;5/5PASS/exit0. That test uses CONTROLLED routing transport, not live routes/operator evidence; stripping the addition leaves the entire old public/vehicle/territory body identical. ReactSSR and recorded-response checks are distinguished from real Preview/browser acceptance, which has not been performed.

F5 final combinedfocused/fulloffline/projectTS/wholeESLint/directproductionbuild now STARTED; no publication or environment activation. Address-search defects and ZSD exactcollectionbundle remain independent open tasks.

## F5 — LOCAL READY, all required checks complete

[Machine evidence/exits/source hashes](checks/2026-10-30-integration/verification.json). Node24.19.0, Next16.3.4. **53targetedPASS**, projectTypeScriptexit0; finalwholeESLintexit0/**0errors,7warnings**; finalmandatoryofflinegate **1057PASS/0FAIL/1SKIP**, quote/APIcontractsPASS, **actualexit0**. The existing skipped realGeoNamesGET test requires GEONAMES_TEST_DIR; not executed/notPASS, unrelated to F. No GeoNames/address/road audit repeated.

The initial fullgate exited1 (1043PASS/10FAIL/1SKIP), because three custom testVMloaders lacked the same @/realTS resolution already supported by sharedhelper/nativeapp/Next. Two renderfiles failed during imports and eight hook tests before assertions. Only the three **test loaders** were repaired; no assertions removed/weakened and no application workaround. Their final14/14tests include a new supplementary-clipboard case retaining the original strict transfer total. Fullgate was retried once for this concrete cause and passed. Initial logs/exits remain intact.

Direct productionbuild command `NEXT_TELEMETRY_DISABLED=1 node node_modules/next/dist/bin/next build --webpack`: **exit0**, compile/TypeScript/static16/16/traces/routescomplete, source `48d685a767010aa9011fc27f03f2e0736fcb973a`. Thereafter only testloaders/docs/evidence changed; application/config/data/dependency/CI **and imported pure estimator** compare identical to that built source. Build was not repeated or falsely attributed to a different entireGit tree. Finalgate source `77c9ce8b8deeb5aa77bb48c881ad7b8042d63182`. Build warning: existing preferredRegiondeprecation. V3 function's local productionNFTmanifest48files contains **no offlinecaptures, named-routefixtures, checklogs or atlas dependency**. This is local bundle tracing, not a Vercel-cloud memory/cold-start measurement.

All F1–F5 are DONE_LOCAL within this stage; not all B01–B12/unknown fares and not a Productionrelease. No push, GitHubActions dispatch/rerun, remoteenvironment change, Preview creation or Productiondeployment. PR14 remains Draft; lastremote readbackc2f52ee93cd98a81ecd05efa0358fb38c6704124. Every stage/savepoint and initialfailed check preserved. Only temporary dependency symlink may be removed, never the real dependency directory or old worktrees/bundles.

### Preview procedure — requires separate publication permission

1. Recheck current remoteHEAD, complete pending localdiff/commits and target **Preview**, notProduction. Existing mandatoryCI remains unchanged; do not silently suppress automatically required jobs. This document does not authorize push, deployment or CI livejobs.
2. Keep Production flag absent/OFF. For an authorized Preview of exactly `fix/v3-missing-route-prices-2026-10-15`, set only Preview-scoped `V3_TOLL_ESTIMATE=1`; the server additionally requires `VERCEL_ENV=preview` and the exact `VERCEL_GIT_COMMIT_REF`. Production is hard-denied even if flag were accidentally set. Never add a NEXT_PUBLIC/client/request override.
3. Local developer opt-in uses `V3_TOLL_ESTIMATE=1` with NODE_ENVdevelopment/test and **no VERCEL_ENV**; existing dependencies suffice. No SDK/provider subscription, financial commitment or external flagservice.
4. Test the actual new deployment/SHA after READY, not an oldPreview: APIoptionalfield/three UI states/manualcopy/standard+dual. For historical amounts use departures15/17October2026,09MSK and the saved exact endpoint/geometry; current dates use current departure calendars, not hard-coded example totals. Production aliases/build must remain unchanged.
5. Explicitly retain M12/ZSD warnings and Arzamasunknown/null. ExtraCKADM11↔M7 requires this selected provider's full decoded sections plus complete trace; metadata unavailable (including some OSRM/BRouter outputs) meansunknown, **not a slower route choice**. Existing acceptedYandex overrides do not borrow an incompatible pre-override layer. Namedfixtures never enter runtime.

### Independent remaining work, not closed by F

- Exact expandedZSD cash/card collectionbundle missing; no complete Arzamasfare invented.
- M12 registration-boundary certification remains a warning, not a claim of verified new operators' boundaries.
- Address D1 street-context fix remains LOCAL-PASS pending protectedPreview acceptance; broader livePhoton/streetcoverage and prior mobile-timeout cause remain unconfirmed. No address components/data/provider logic were changed in F.
- Real deployedPreview/browser desktop/mobile/cloud resource measurements have **not** been performed in F. Local evidence comprises realReactSSR, recorded-source component integration, CONTROLLED-transport actualPOST and offlinegates/build, explicitly distinguished above.

## 31.10.2026 — H3 terminology and continuity clarification

Current wording: **«оценённая часть 6 928/7 268 ₽»**. It includes estimated M12 **1713** and CKAD **941**, total **2654**. CKAD has an operator price source, but its selected-route applicability remains `working_estimate`. ZSD and whole total remain **unknown/null**. Yandex residual **2085 is not a ZSD tariff**. Historical F controls/artifacts above remain unchanged; no repeated H2/source audit or build was performed.

[H3 record and exact missing G list/recovery plan](stage-h3-2026-10-31/README.md): F→H2→H3 local history preserved; Gdd3e2ff6 not found in accessible objects/refs/reflogs/bundles or GitHub lookup. No G files reconstructed from assumptions. Combined F–G–H publication readiness remains BLOCKED pending original G evidence/ancestry review and separate publication permission. No push, runtime/tariff/geometry/Production change; estimate remains OFF.

## 31.10.2026 — H4 documentary reconstruction, NOT original G recovery

[H4 source/reconciliation/findings](stage-h4-2026-10-31/README.md): owner-supplied ZIP CRC/sourceSHA verified;5originalpackagefiles retained bytewise,8newtargetchecksPASS. OriginalGhistory remains unrecovered; a new explicit **F→H2→H3→H4 RECONSTRUCTED content** lineage is prepared for separately authorized controlled documentary/Previewpublication review. This supersedes H3's missing-documentary-input blocker only; it does not certify exact Yandex geometry/date/payment, screenshots or runtime tariff admission. Source report's old Granitnoe/Arzamas replay descriptions are retained with discrepancy findings, not imported as current defects. No fresh Yandex/sourceaudit/build/push; application/matrix/geometry/CI unchanged, F OFF/Productiondeny, Arzamaswhole/ZSDunknown/null and2085notZSDfare.
