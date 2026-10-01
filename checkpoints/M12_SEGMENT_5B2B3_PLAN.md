# M-12 Segment 5B2B-3 — RVP-first crossing detector

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Build and validate an M-12 detector that derives the actually crossed official RVP charge sequence from route geometry, using physical RVP evidence as primary proof and the official kilometre sequence as controlled gap-filling evidence.

No production/API integration in this segment.

## New finding that changes the model

The broad 1 km radius used by the earlier exploratory 5A fixture is too permissive for a billing crossing decision:

- proven mainline physical events on the Moscow<->Kazan control are typically ~0.010–0.035 km from route shape;
- the object aligned to official RVP 769 is ~0.526 km from route shape and must NOT be treated as crossed merely because it was inside the exploratory 1 km radius.

Therefore the previous 5B2A alignment is calibration evidence, not itself a crossing detector.

## Evidence model

1. Persist only high-confidence calibrated physical RVP anchors that are truly route-relative.
2. Direct physical crossing threshold for the initial diagnostic: `<= 0.08 km` (80 m).
3. RVP 769 is intentionally excluded from direct crossed evidence on the Moscow<->Kazan control because its known physical candidate is ~526 m away.
4. Non-tariff physical gantries remain explicitly excluded even when directly crossed.
5. Official RVPs missing from OSM may be inferred only *inside* a proven continuous official-RVP interval:
   - bounded by two directly crossed calibrated RVPs;
   - monotonic official order;
   - actual route-chainage delta between bounds agrees with official kilometre delta within a strict tolerance;
   - inferred RVP lies between the bounds, never beyond the first/last proven bounds.
6. This rule can fill RVP 722 between proven RVP 635 and 764, but cannot invent early 33–174 or late 769–832 coverage beyond proven route bounds.

## Validation controls

Bidirectional pairs:

- Moscow <-> Kazan
- Vladimir <-> Kazan
- Murom <-> Kazan
- Arzamas <-> Kazan
- Moscow <-> Arzamas

For each pair:

- direct crossed calibrated-RVP set must be identical forward/reverse;
- inferred internal official RVP set must be identical forward/reverse;
- final charge-RVP sequence must be identical forward/reverse;
- no non-tariff event may enter the charge set;
- no RVP outside proven bounds may be inferred.

Primary Moscow<->Kazan expectation from current Valhalla geometry:

- directly proven charge RVPs should include 184, 281, 314, 392, 420, 485, 591, 635, 764;
- official RVP 722 should be inferred inside the proven 635–764 continuous interval if distance consistency passes;
- RVP 769 must not be included unless a future exact crossing proof exists;
- resulting amount must be calculated from the official snapshot, not hard-coded.

## Safety

- no Overpass;
- no `trace_attributes`;
- no changes to `/api/v2/calculate`;
- no production deploy;
- unknown/incomplete evidence => no exact amount;
- workflow timeout <= 10 minutes.

## Next

If green: Segment 5B2C extracts this into a reusable M-12 core and adds strict regression assertions before user-API integration.

If a partial route fails forward/reverse parity, keep the exact subset only and split the failing corridor into a separate evidence-coverage segment rather than weakening thresholds.
