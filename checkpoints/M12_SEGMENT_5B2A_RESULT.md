# M-12 Segment 5B2A — official RVP calibration result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN

## Run

- workflow: `Segment 5B2A M12 RVP calibration`
- run id: `36762043739`
- head: `3e065fdf477109de7dd41a6cc017cf8285ec8fbc`
- artifact id: `11118378338`
- timeout bound: 20 minutes
- result: success

## Monetary core regression

Segment 5B1 was re-run before calibration:

- official tariff assertions: `96/96` passed;
- Moscow -> Kazan (P239): `5847 RUB`;
- Moscow -> Shali: `5909 RUB`.

## Traversal/RVP calibration

Input evidence:

- Segment 5A3 physical-event proof;
- production-style Valhalla route geometry (`use_tolls=1`);
- frozen LIMITED OSM fixture;
- `overpassRequests=0`;
- 11 mirrored physical passenger M-12 gantry events.

Result:

- matched physical events: `10/11`;
- rejected events: `1`;
- refined route-chainage -> official-road offset: `12.9775 km`;
- maximum absolute residual: `1.7865 km`;
- monotonic mapping: `true`;
- threshold: `<= 2.5 km`;
- minimum required matches: `9`.

Matched official RVP kilometre markers:

- event 0 @ 172.026 km -> RVP 184 km, residual -1.0035 km;
- event 1 @ 269.075 km -> RVP 281 km, residual -1.0525 km;
- event 2 @ 301.367 km -> RVP 314 km, residual -0.3445 km;
- event 3 @ 378.938 km -> RVP 392 km, residual +0.0845 km;
- event 4 @ 407.107 km -> RVP 420 km, residual -0.0845 km;
- event 5 @ 473.091 km -> RVP 485 km, residual -1.0685 km;
- event 6 @ 577.298 km -> RVP 591 km, residual +0.7245 km;
- event 7 @ 621.135 km -> RVP 635 km, residual +0.8875 km;
- event 9 @ 750.910 km -> RVP 764 km, residual +0.1125 km;
- event 10 @ 754.236 km -> RVP 769 km, residual +1.7865 km.

Rejected evidence:

- event 8 @ 670.500 km did not fit the official monotonic RVP sequence within the allowed residual and was correctly rejected rather than forced into the tariff model.

## Build

`pnpm build` completed successfully under the real application build.

## Conclusions

1. A non-Platon OSM `toll_gantry` is not automatically a billable official M-12 RVP.
2. Physical traversal evidence can be calibrated to official Avtodor RVP identity with a robust ordered model.
3. The current LIMITED fixture proves the mapping method but does not provide all 19 official RVP coordinates/events.
4. Pricing must still wait for an independently proven actual M-12 route span/entry/exit.
5. `/api/v2/calculate` remains unchanged by Segment 5B2A.

## Next

Segment 5B2B-1: capability probe of the normal Valhalla `/route` directions/maneuver response. Determine whether maneuver `street_names` / shape indexes expose enough M-12 identity and contiguous span evidence to locate entry/exit without an additional full-route `trace_attributes` request. Diagnostic only; no user pricing integration.
