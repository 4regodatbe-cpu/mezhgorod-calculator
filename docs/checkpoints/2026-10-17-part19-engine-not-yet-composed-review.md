# Part 19 — M1/M3 “engine_not_yet_composed” cause review

- Status: DONE (parent finding deferred as an aggregate); reviewed 2026-10-17 09:28 МСК.
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 draft. Source head: `2b1882159d7ef0576c7eb8c3dcb6ca13f6bd0c21`; source tree: `368b3ff960e9c86d4966d3738fb82ff40ef6c492`.
- Workflow status before this step: run #39007230631 completed/success on source head; run #38959170444 also completed/success on an older head. No active branch run at review start.
- Inputs: saved report `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/REPORT.json` (generated 2026-10-16T02:19:51.916Z, Git blob `528163f94cf0092bf58ad5b0be200059d61baff9`, recorded raw SHA-256 `cf72f0f4084236e3acb442a961bae5a9c79f49980566b6d784bd8b73642d765e`); findings queue; current route-leg pricing, M1/M3 shadow audit, gate inventory, national registry and dated tariff snapshot. Exact source blob SHAs and case-level evidence paths are in [evidence](evidence/2026-10-17-part19-engine-not-yet-composed-review.json).

## Result and user impact

The historical label covers **13 route rows and 39 saved live/same-date/weekend evidence occurrences**; all 39 referenced files exist in the source tree, all 13 rows have complete evidence, complete traces and same-date parity, and both weekday/weekend amounts are null. This is saved-evidence review, not 13 new route executions.

The label is a mixed aggregate, not one root cause:

- **M3: 10 cases, outcome blocked by missing reliable data.** The saved report proves traversal on all ten, but M1/M3 is still diagnostic-only in `route-leg-pricing.ts`. The operator tariff records are verified through 2026-10-10; these route profiles depart 2026-10-15 and 2026-10-17. The M3 gate inventory explicitly does not prove tariff-version validity, and the shadow quote requires all three ordered gates on the same selected route. Current evidence cannot support a date-valid full M3 quote.
- **M1-labelled/OD area: 3 cases, outcome deferred pending the distinct `odintsovo:unpriced` cause review.** Two overlap that finding; one overlaps `expected-road-not-proven` (the route proves generic M1, not the expected Odintsovo product). Counting these as a second independent failure would duplicate or misstate the user impact.

Current user-visible effect: these saved quotes remain unknown/null, rather than a fabricated fare or zero. No runtime correction is justified by the saved data alone; the M1/M3 shadow boundary is intentionally fail-closed.

## Verification and limitations

- Reviewed 13 case rows / 39 saved occurrences; 39 evidence references resolved in the Git tree.
- Road coverage: 10 M3 traversals proven; among the three M1/OD-labelled rows, two expected OD traversals are proven and one expected OD road is not proven.
- No new live/replay requests, tests, builds, tariff updates, or customer-price changes.
- Formal plan remains 18/20 = 90%; this is formal-plan completion only, not tariff confirmation or product readiness.
- Revisit M3 when official category-I tariff validity covers the departure dates and the selected route has complete independently mapped chargeable-gate scope. Review the OD-labelled cases under their dedicated cause before attributing them to generic M1.

## Next step

Review `odintsovo:unpriced` (baseline 2) using saved evidence and overlap analysis, then save and verify its own checkpoint before any independent work.
