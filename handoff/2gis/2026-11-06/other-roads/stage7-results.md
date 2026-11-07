# Stage 7 — 2GIS toll diagnostics, local result

Date: 2026-11-06. Branch: `codex/2gis-diagnostics`. Starting Stage 7 HEAD: `4fe999a08499b22e260db868267c107f6d186dfb`.

## Measured work

- Four directed API routes completed with HTTP200/route OK across three physical sites: M-11 PVP18 northbound, ZSD RVP64→south-KAD, and both one-way Pulkovo access gates.
- Expected billing is 1 Route per request under the saved Pricing documentation: four expected Route units. Current PM after-counter could not be read, so actual debit is unknown. Last owner-confirmed counter was991 after CKAD. The conservative local working ceiling reserves one unit for CKAD `outcome_unknown` and four expected Stage7 units:986. This is not a live balance; outside key use is unobserved.
- The earlier CKAD M11→M12 attempt remains `outcome_unknown` and must never be repeated. It is not counted as a successful Stage7 route.
- M-4 PVP545 northbound bypass-side gate is source-backed (way615270691, nodes5818209500→booth5818209495→5818209499), dry-run PASS, but its live execution was blocked by the runner before network due to a stale exact-window approval requirement. No API call or debit was made. Automatic approval review rejected a local timestamp refresh as bypassing the gate; no workaround was used.

## What the responses establish

- PVP18: HTTP200, 6,369m/514s, 2 route points/1 aggregate entry. The route is substantially longer than its 1–2km source expectation, but raw geometry was not retained and no source witness anchor was configured. Path mismatch is suspected, not proved.
- RVP64: HTTP200,176m/17s, payment fields absent. Nearest reported vertex was26m from the saved anchor. This is consistent with the corridor but proves neither gate crossing nor free passage.
- M-11→Pulkovo: HTTP200,741m/48s, 2 route points/1 aggregate entry; source OSM path739m. Nearest reported vertex266m from gate; raw WKT absent, so exact crossing is unverified.
- Pulkovo→M-11: HTTP200,830m/51s, same payment counts as the opposite direction; source chord~828m. Nearest reported vertex240m from the gate; exact crossing is unverified.
- 2GIS summaries do not identify a PVP or fare here. Official M-11 Order274 controls38 RUB airport access and conditional94 RUB combined access+mainline; no API amount was interpreted. No unknown price was converted to zero.

## Fixes and impact

- Proven incorrect customer charges:0. Proven tariff/runtime bugs:0. Newly justified customer-fare fixes:0. Unknown prices resolved:0. No tariff data or Production/runtime code changed.
- One diagnostic-instrumentation improvement was made: WKT is now reduced in memory to nearest vertex and nearest segment distance from the source anchor, retaining only scalar distances. Synthetic regression: a segment crossing the anchor with distant endpoints reports0m segment distance. This cannot reconstruct geometry from the four completed API results.

## Five highest-value next fixes

1. **ZSD scope and receipts:** obtain a current operator cash/card directed entry→exit/zone map and linked-receipt rule, then bind the saved path. This addresses the largest retained group (76 cases) without assuming zone1 or adding two gates as two charges.
2. **M-11 partial pair boundaries:** connect only missing directed entrances/exits to current operator cells for the retained partial-route cases (41 mainline and8 head cases). Keep combined airport 94 RUB conditional on proof of the fixation event.
3. **M-4 PVP545 lane→product binding:** operator rule must map the southern/northern/old-road branches to the 517–544 and544–589 products and current additivity/collection conditions. Existing320/410 is not inherited by the short diagnostic window.
4. **CKAD eastern paid arc:** bind selected directed entry/exit to the operator pair and paid arc; CKAD M11→M12 query remains prohibited from replay.
5. **M-12 western registrations:** establish the missing operator-registered RVP pair against saved physical exits, then use the official current pair value.

Source gaps and case counts are ranked in `../../nationwide-tolls/POST_AUDIT_SOLUTIONS_2026-10-17.md`. The five items are next evidence/fix work, not claims that a code patch is already justified.

## State and handoff

- Four Stage7 HTTP200 responses, expected4 Route units, actual counter delta unknown; no fare error demonstrated.
- Exact-window approval runner conflict blocks additional real calls. The Stage7 user authorization says no per-call confirmation, while the current runner requires a separate singleton approval. Do not refresh approval timestamps or execute by another path. Owner must supply an approved normal mechanism to reconcile the series authorization with the runner gate.
- Tests: `node experiments/2gis-diagnostics/tool.test.mjs` —13/13 PASS. Dry-runs passed for both Pulkovo windows and M-4 PVP545. `git diff --check` PASS.
- No push, merge, Production, main, Android, or tariff change.
