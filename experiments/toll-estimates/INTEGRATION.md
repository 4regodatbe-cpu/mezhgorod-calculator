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
