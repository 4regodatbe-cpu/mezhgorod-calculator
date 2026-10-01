# M-12 Segment 5B2A — calibrate observed gantry events to official RVP kilometre markers

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Determine which already-proven physical M-12 gantry events correspond to official Avtodor RVP tariff events. This segment is diagnostic only: it must reject non-tariff gantries instead of treating every non-Platon `highway=toll_gantry` as a billable RVP.

## Official evidence

Avtodor's current M-12 tariff table publishes Category-I adjacent sections with RVP kilometre markers:

`33, 65, 81, 118, 174, 184, 281, 314, 392, 420, 485, 591, 635, 722, 764, 769, 782, 806, 832` km.

These markers are stored with the corresponding official adjacent tariff section, not inferred from OSM.

## Traversal input

Reuse Segment 5A3 / 5A2c only:

- production-parity Valhalla geometry (`use_tolls=1`);
- 11 mirrored physical non-Platon gantry events;
- frozen LIMITED OSM fixture;
- no Overpass.

## Calibration model

For a route that starts in Moscow city rather than at M-12 kilometre zero, route chainage and official road kilometre differ by an approximately constant offset:

`officialRoadKm ~= routeChainageKm + offsetKm`

The mapping must be monotonic and one-to-one.

Algorithm:

1. Add official `sections[]` metadata to the versioned tariff snapshot. Each of 19 sections stores `from`, `to`, `rvpKm`, and Category-I amount.
2. Re-run 5A3 evidence to obtain the 11 forward physical events.
3. Generate candidate offsets from every `officialRvpKm - eventChainageKm` pair.
4. For each candidate offset, use ordered dynamic-programming sequence alignment:
   - an event may be skipped;
   - an official marker may be skipped;
   - an event/marker pair is allowed only when absolute residual <= 2.5 km;
   - each event and marker can be used once;
   - order must be preserved.
5. Choose the alignment with maximum matched-event count; break ties by minimum squared residual.
6. Refine the offset as the median of `markerKm - chainageKm` across matched pairs, then run alignment once more.
7. Record matched official sections, residuals, unmatched observed gantries, and unmatched official RVP markers.

## Success criteria

- Existing 5B1 monetary assertions stay green.
- At least 9 of 11 observed physical events map monotonically to unique official RVP markers.
- Every accepted match residual <= 2.5 km after robust offset refinement.
- At least one observed event may be rejected; rejected events are explicitly not tariff evidence.
- No widening of the threshold to force all gantries to match.
- No toll amount is selected from city destination and `/api/v2/calculate` is unchanged.
- No Overpass request.
- Workflow timeout <= 20 minutes.

## Expected diagnostic from current evidence

Pre-analysis suggests 10/11 events form a stable sequence with an offset near 13 km. The event around route chainage ~670.5 km appears incompatible with the nearest official RVP sequence and is expected to be rejected rather than forced into the tariff model. This is an expectation, not a hard-coded mapping.

## Next

If green, Segment 5B2B determines the actual M-12 route span/entry/exit for arbitrary routes. It will first test whether normal Valhalla route maneuvers expose sufficient M-12 road/ref information without an extra full-route `trace_attributes` call. Pricing remains disabled until that span detector is proven.
