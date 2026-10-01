# Segment 6A3B2C — M-11 spatial anchor acquisition plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLAN
Production `main`: unchanged.

## Goal

Acquire trustworthy physical coordinates for a small control set of M-11 toll facilities before scaling the method to the remaining boundary inventory.

Initial controls:

- PVP 58;
- PVP 147;
- PVP 545;
- PVP 593;
- PVP 679.

## Evidence hierarchy

1. Official/operator infrastructure source with explicit coordinates or a machine-readable official map marker.
2. If official coordinates are unavailable: independently verifiable infrastructure evidence such as an OSM object explicitly tagged as a toll facility and independently consistent with the official facility identity.
3. Route-provider geometry may corroborate a candidate but cannot by itself promote a coordinate into the official boundary model.

## Forbidden derivations

- no kilometre-chainage to latitude/longitude conversion;
- no city-centre coordinates;
- no nearest-road-point substitution;
- no Valhalla/OSRM span endpoint relabelled as a PVP;
- no proximity-only identity match;
- no copying legacy coordinates without independent verification.

## Acceptance requirements per facility

A coordinate may be marked `independently_verified_infrastructure` only when:

- the physical object is unambiguously a toll facility on M-11;
- its identity is compatible with the official PVP number / official route context;
- the source object has a stable identifier and coordinate;
- an independent source or official facility description corroborates the identity;
- no conflicting toll facility candidate remains unresolved in the same local context.

If any requirement fails, keep `coordinate=null` and `spatialStatus="unresolved"`.

## First-stage output

Create a diagnostic evidence report for the five controls. Do not modify existing facility evidence until the control method is proven. If at least three controls are unambiguous and no false-match pattern is found, scale the same method to the remaining 58–679 inventory in a separate subsegment.

## Validation

Any promoted evidence must later pass deterministic assertions for:

- coordinate ranges;
- unique facility identities;
- exact tariff-point/facility bindings where already authoritative;
- provenance retained per coordinate;
- unresolved candidates remaining null;
- no import into `/api/v2/calculate`;
- full `pnpm build`.
