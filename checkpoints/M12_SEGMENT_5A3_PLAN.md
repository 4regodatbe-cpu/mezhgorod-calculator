# M-12 Segment 5A3 — physical-event mirror proof

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Promote the useful 5A2c gantry clusters into a stronger route-traversal invariant without using raw OSM node identity.

## Input

Run the already-green `scripts/segment5a2c-m12-parity-fixture.mjs` as the evidence producer. This preserves exact production-parity Valhalla semantics and the frozen 68-object LIMITED fixture.

## Planned proof

1. Require 5A2c coverage status `informative_limited_fixture`.
2. Read forward and reverse physical-event clusters.
3. Require equal non-trivial event counts; current expected diagnostic count is 11 per direction.
4. Reverse the reverse-direction event order and pair events by ordinal.
5. For each pair calculate:
   - geographic centre distance between clusters;
   - normalized route position residual: `forwardChainage/forwardLength` vs `1 - reverseChainage/reverseLength`.
6. Physical event identity is considered mirrored only if:
   - centre distance <= 0.10 km;
   - normalized chainage residual <= 0.005 (0.5% of route length, ~4 km on M-12).
7. Save all pairs and max residuals to JSON.
8. Fail the gate if any event has no physical reverse pair.

## Important limits

- No Overpass.
- No tariff calculation.
- No `/api/v2/calculate` changes.
- No assumption that forward/reverse OSM node IDs must be identical.
- The frozen fixture remains LIMITED; this segment proves mirrored physical events within that evidence set, not full official RVP coverage.
- Workflow timeout <= 20 minutes.

## Next

If green, Segment 5A is considered sufficient to establish a route-relative physical traversal primitive. Segment 5B then maps official/versioned Avtodor RVP/tariff data onto that primitive. Before production integration, full authoritative coverage must be validated separately from this LIMITED fixture.
