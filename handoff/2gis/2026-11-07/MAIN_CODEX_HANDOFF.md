# Main developer integration instructions

Research is closed; MASS-300 is `CLOSED_PARTIAL`. This handoff is evidence for a separate runtime review, not approval to change production behavior.

1. Keep exactly the four accepted calculations in `evidence-next-v2/ACCEPTED_WORKING_CALCULATIONS.json`: M-4 B05 320/410, full named CKAD 981, and Pulkovo 38 in each standalone direction. Preserve their route/date/category scope. Do not infer receipts.
2. Load `evidence-next-v2/UNKNOWN_BINDINGS.json` as explicit unknowns. Do not charge unresolved M-4 PVP545 lane/product mappings, M-12 western gantries, ZSD gantry 64, or other listed cells. The v2 `CONFIRMED_BINDINGS.json` is the current reviewed crosswalk; historical V1 is retained for audit only.
3. Review `mass300/.../RESULTS_FINAL.md`, `ROAD_RESULTS.json`, and `CROSS_CONTROL_COMPARISONS.json`. Add regression cases for whole-route geometry mismatch and for aggregate payment appearing in both a selected-boundary crossing and a boundary-distant control. Do not treat the aggregate as a per-PVP fare.
4. Preserve fail-closed semantics: missing payment fields are unknown, never free; route-scope mismatch invalidates a price comparison; do not sum neighboring OSM lanes or toll objects as separate products without an operator tariff mapping.
5. The eight MASS scope mismatches, 35 supported corridors, and eight equal-aggregate control pairs are diagnostics, not proof of operator billing error. No new V3 defect or tariff model was established. Do not import synthetic route fixtures as live observations.
6. CKAD `outcome_unknown`, the previous 11 exact attempts, and the MASS HTTP 429 attempt are permanently no-replay for this research packet. MASS-300 closed partial with 44 new attempts; no further API requests are authorized by this handoff.
7. Do not replay historical Stage 8 patches. M-11 official data overlay and legacy patch are packaged as historical implementation artifacts; inspect applicability against the current runtime and existing integration before any separately authorized change.

No runtime, production, main, Android or PR #14 changes are part of this handoff. Push publication of this subtree does not imply integration or deployment.
