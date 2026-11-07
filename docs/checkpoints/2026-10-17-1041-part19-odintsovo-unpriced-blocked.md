# Part 19 — Odintsovo unpriced finding

- Status: DONE for this bounded cause review; outcome **blocked by missing reliable data**. Reviewed 2026-10-17 10:41 МСК (2026-10-17T07:41:10Z).
- Branch/PR: `fix/v3-missing-route-prices-2026-10-15`, PR14 open/draft. Source head/tree: `bdf620e441d2cbe287a348bd388d28e188106341` / `2deefbad4cf1b3038576cabbbe77745643f2a818`.
- Pre-review check: branch run #39010035622 completed/success on source head; PR head matched branch; no active branch writer.

## Finding and user impact

Reviewed `odintsovo:unpriced`, baseline **2 route cases**: `single-odintsovo-golitsyno-to-rublevo` and `single-odintsovo-rublevo-to-golitsyno`. The saved selected-route traces prove Northern Odintsovo Bypass traversal on both routes. These two cases are also listed under `engine_not_yet_composed`; neither is in `expected-road-not-proven`.

The six saved evidence artifacts cover weekday live, same-date replay and weekend replay for each route. Both route traces are complete; same-date parity is true. The road-specific amounts remain null in all six artifacts. Each route also has unresolved M-1 and `unknown-paid-road` components, so the complete toll total remains unknown.

The operator's category-I base-fare table exists as a current candidate source, with direction and time bands. The product registry still marks the directed route boundary pair “to audit”, and `TARIFF_SELECTION_REPORT.json` says integration is pending and `runtimeApproved=false`. Although the evidence records named toll-booth nodes, it does not bind either selected route to a verified directed PVP vector.

**Outcome: blocked by missing reliable route-to-PVP evidence.** This does not justify a fare correction. The calculator keeps the total unknown/null rather than showing an unsupported amount or zero. No code or tariff value was changed.

## Checks and limits

- Reviewed 2 route cases, 4 unique route/date profiles, 6 saved evidence occurrences; all 6 files were present, with blob SHAs in [evidence](evidence/2026-10-17-part19-odintsovo-unpriced-blocked.json).
- No new live route runs, replays, tests, builds, tariff confirmation, or full quote.
- Formal plan remains 18/20 = 90%; Part 19 remains IN_PROGRESS pending synthesis/status reconciliation; Part 20 remains PLANNED.

## Next step

After post-save CI completes, reconcile the 13 Part 19 finding records and their canonical outcomes in the queue; then perform Part 20's required verification and handoff. Do not infer tariff confirmation from the saved candidate table.
