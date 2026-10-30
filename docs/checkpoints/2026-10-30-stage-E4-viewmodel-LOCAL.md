# E4 — isolated toll-only presentation / local markup, not live UI integration

30.10.2026 MSK; parent9193c5a7. New `presentation.ts`, standalone `demo.ts`/renderer and6tests inexperiments/toll-estimates. [Offline HTML example](../../experiments/toll-estimates/checks/2026-10-30/e4-demo.html). No app/Reactcomponent/API/CI/Production change.

Confirmed complete: «Платные дороги:600₽». Estimated complete: «Платные дороги:10464₽(ориентировочно)». Insufficient: «Платные дороги:стоимость уточняется», with separately labelled assessed portion5987including confirmed4274 and explicit «не полный итог»; these amounts are not added a second time. Disabled shadow returnsnolabel, leaving existing strict presentation untouched. A stale numeric field on an insufficient result cannot become a displayed total.

The view accepts only toll assessment, not kilometre/base transfer fare; approximation applies solely to tolls. Comparable-upper-bound method has explicit explanatory copy. HTML is escaped, responsiveviewport andlocal/offstatus visible; generated fromactual saved samples. **6testsPASS**, scopedstrictTypeScript/ESLintPASS. This is string/viewmodel/server-markup evidence, **not a real browser/desktop/mobile/Preview acceptance**. Known browser blockers not retried. No new network or route replay, tariff value or public behavior change.

Next E5source-based calendar/reverse/overlap regressions and one mandatory finalofflinegate/TS/directbuild for the new calculation prototype, not a road/capture audit. Preserve all failures and exact command results; only after verifiedlocalcheckpoint report readiness/remainingunknowns. No push or live activation permitted.
