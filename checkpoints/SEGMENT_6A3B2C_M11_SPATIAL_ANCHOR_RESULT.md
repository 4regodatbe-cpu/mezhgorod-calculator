# Segment 6A3B2C — M-11 spatial anchor acquisition result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: SAFE STOP / CONTROL METHOD NOT YET PROVEN / NO PRODUCTION CHANGE
Production `main`: unchanged.

## Goal

Test a strict, source-proven method for assigning physical coordinates to five M-11 toll-facility controls before scaling to the remaining 58–679 inventory:

- PVP 58;
- PVP 147;
- PVP 545;
- PVP 593;
- PVP 679.

The acceptance rule from the plan remains unchanged: a coordinate may be promoted only when the physical object is unambiguously a toll facility on M-11, has a stable source identity and coordinate, is corroborated by an independent source or official facility description, and no conflicting local candidate remains unresolved.

## Result summary

Promoted coordinates: **0 / 5**.

No existing facility-evidence JSON was modified. No provider route endpoint, city centre, kilometre marker, interchange coordinate or legacy coordinate was relabelled as an official PVP coordinate.

### PVP 58

Status: `candidate_high_confidence_not_promoted`.

Evidence:

- official/operator and map sources independently confirm the physical PVP 58 identity;
- two secondary pages publish the same coordinate candidate `56.138476, 37.047376`;
- those two coordinate publications appear to reproduce the same underlying content rather than provide independent coordinate evidence.

Decision:

- keep `coordinate=null` / `spatialStatus="unresolved"` in authoritative facility evidence;
- do not count duplicated secondary coordinate publication as two independent proofs.

### PVP 147

Status: `identity_verified_coordinate_unresolved`.

Evidence:

- current operator/infrastructure sources identify PVP 147;
- a stable map entity exists for the toll facility at M-11 km 147;
- no trustworthy explicit coordinate tied to that exact stable toll-facility object was obtained in this subsegment.

Decision:

- keep unresolved.

### PVP 545

Status: `interchange_candidate_not_pvp_proof`.

Evidence:

- operator/map sources identify PVP 545 as a toll facility;
- a historical technical map publishes a coordinate around the M-11/M-10 interchange near km 545;
- that coordinate describes the interchange context, not an unambiguous physical PVP object.

Decision:

- do not substitute interchange coordinates for the PVP;
- keep unresolved.

### PVP 593

Status: `conflicting_context_candidates`.

Evidence:

- official operator news confirms the new PVP associated with the km-593 interchange opened on 18.09.2026 within the closed toll system;
- current infrastructure descriptions identify the local intersection context;
- one map source exposes a coordinate for the **road kilometre point** 593, not explicitly for the PVP;
- an older project map exposes a different coordinate for the planned interchange near km 594.

Decision:

- a road kilometre point and an interchange coordinate are not accepted as the physical PVP coordinate;
- the disagreement reinforces the need for a stable toll-facility object ID;
- keep unresolved.

### PVP 679

Status: `identity_verified_chainage_discrepancy_coordinate_unresolved`.

Evidence:

- official/operator evidence identifies PVP 679;
- a stable map entity exists for the toll point, but its address text references M-11 km 681 while the official facility identity remains PVP 679;
- nearby historical project coordinates describe KAD/Pulkovo interchange geometry, not the exact toll facility.

Decision:

- do not resolve the 679/681 discrepancy by assumption;
- do not use nearby interchange coordinates;
- keep unresolved.

## Promotion gate

The plan required at least three unambiguous controls with no false-match pattern before scaling the method.

Observed result:

- unambiguously promoted controls: 0;
- unresolved controls: 5;
- promotion threshold reached: **NO**.

Therefore the method is not scaled to the remaining facility inventory.

## Truth constraints preserved

- no kilometre-chainage to latitude/longitude conversion;
- no city-centre coordinate substitution;
- no nearest-road-point substitution;
- no Valhalla/OSRM route-span endpoint relabelled as a PVP;
- no proximity-only identity match;
- no legacy coordinate copied without independent verification;
- no candidate coordinate written into authoritative facility evidence;
- no import into `/api/v2/calculate`;
- production M-11 pricing is unchanged.

## Validation/build applicability

This subsegment changed documentation only and deliberately made **no source-code, runtime-data or production API modification**. A new build is therefore not a meaningful acceptance gate for this checkpoint; the previously accepted code/data gates remain unchanged.

## Safe continuation

Search for a source that exposes a **stable toll-facility object ID plus explicit coordinate**, preferably:

1. an official/operator machine-readable map marker or infrastructure endpoint;
2. otherwise a stable OSM toll-facility object with explicit tags/ID/coordinate, independently corroborated against the official PVP identity.

Route-provider geometry may be used only as corroboration after an object-level candidate exists. Until then all five authoritative coordinates remain unresolved.
