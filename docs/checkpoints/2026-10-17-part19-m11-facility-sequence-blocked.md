# Part 19 — M11 58–679 facility-sequence finding

Date: 2026-10-17 17.10.2026, 04:34:06 МСК (UTC 2026-10-17T01:34:06Z)  
Branch: `fix/v3-missing-route-prices-2026-10-15`  
Parent head/tree: `2b61dad6560284da60d9ec2c49952ace3608ae13` / `8cd3f0857f8ccabc431a4898c98e090c367d6560`

## Outcome

Finding `m11_58_679_facility_sequence_incomplete` (15 baseline route cases): **blocked by missing reliable data**. This is not a demonstrated implementation regression. All saved weekday/weekend pairs reproduce the same fail-closed unknown result, and current source evidence does not spatially bind the complete official facility sequence to these selected routes.

## Evidence reviewed

- 15 saved route cases × weekday 2026-10-15 and weekend 2026-10-17 = **30 replay profiles**; no new live calls or replay runs.
- All 30 profiles have complete trace and replay integrity, reproduce the same facility-sequence reason, select the fastest recorded provider, and retain `amount=null`, `confidence=none`, `priceConfirmation=unconfirmed`. Each weekday/weekend pair uses the same capture SHA.
- The official fare inventory identifies 21 M11 58–679 tariff points, but coordinates are unresolved for all 21. The separate spatial-anchor file covers only p58, p593 and p679—not the full intervening sequence or exact selected-route crossings.
- Current code fails closed when a required p58/p593/p679 segment is too far from the route and requires the ordered entry → p58 → p593 → p679 sequence before pricing. Relaxing this guard or inferring tariff would not be evidence-backed.
- These 15 cases are included in the 41-case `m11-58-679:unpriced` group. The next bounded review is only the **26 residual IDs**, not a repeat of these 15; also cross-reference the completed M11 boundary review.

Exact profile blob SHAs, capture SHAs, source blob SHAs and residual IDs are in [evidence](evidence/2026-10-17-part19-m11-facility-sequence-blocked.json).

## User impact

Selected routes remain unknown with no complete numeric total. Any known component remains partial and is not promoted to a complete trip total. **No tariff was confirmed and no price was inferred.** Keep unknown/null until reliable coordinates or independent crossing evidence establishes the required sequence and direction.

## Scope and validation

This was a saved-artifact/source review only: 15 route cases, 30 profiles, 0 new live calls, 0 replays, 0 builds, 0 tests. Parent Actions run [#38985688974](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/38985688974) succeeded on the parent commit; traceability only, not validation of a code change. Formal plan remains 18/20=90%; Part19 IN_PROGRESS, Part20 PLANNED. No code fix, merge, Production or Android change.
