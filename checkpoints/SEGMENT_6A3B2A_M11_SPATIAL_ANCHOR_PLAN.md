# Segment 6A3B2A — M-11 spatial-anchor acquisition and validation plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DATA-EVIDENCE ONLY
Production `main`: unchanged.

## Why this split exists

Segment 6A3B1 proved that the repository contains no official-coordinate-backed M-11 tariff boundary. Segment 6A3B2 then created a safe typed model where all 28 official point coordinates remain null/unresolved.

An exact coordinate resolver cannot be implemented honestly until spatial anchors are acquired and classified. This subsegment therefore runs before 6A3B3.

## Goal

Acquire spatial evidence for official M-11 tariff points without deriving coordinates from route km, city centres, legacy five-chunk geometry or route-provider span endpoints.

## Evidence priority

For each point, search in this order:

1. official operator / concessionaire / State Company road documentation that explicitly identifies the relevant interchange/PVP/location spatially;
2. official map or downloadable geospatial material from the operator/state road source;
3. independently verifiable OSM road-infrastructure object only when its identity can be tied to the official tariff point by road/PVP/interchange evidence;
4. otherwise remain unresolved.

## Allowed classifications

- `official_coordinate_backed` — coordinate explicitly supported by authoritative operator/state-road spatial material;
- `independently_verified_infrastructure` — non-official spatial object with strong identity evidence and explicit provenance; this is not equivalent to official-coordinate-backed;
- `unresolved` — insufficient evidence.

Legacy-only and route-provider-derived coordinates remain diagnostic inputs and are never promoted solely by proximity.

## Required inventory

### 15–58

`moscow`, `sheremetyevo2`, `sheremetyevo1`, `zelenograd`, `tskad`, `mmk_a107`, `solnechnogorsk`.

### 58–679

`p58`, `p67`, `p89`, `p97`, `p124`, `p147`, `p159`, `p177`, `p209`, `p214`, `p258`, `p330`, `p348`, `p385`, `p402`, `p444`, `p524`, `p545`, `p647`, `p668`, `p679`.

## Validation rules

1. Point identity must be explicit; same-city proximity is insufficient.
2. `routeKm` / `pvpKm` metadata may corroborate identity but may not be converted mathematically into latitude/longitude.
3. Different route/PVP km values must remain distinct metadata.
4. A provider M-11 road-span endpoint may corroborate a corridor but cannot define a tariff point by itself.
5. A spatial object with ambiguous direction/access is not an exact boundary.
6. No amount calculation or tariff selection is allowed in this subsegment.
7. No `/api/v2/calculate` integration.
8. Every persisted coordinate must carry provenance and evidence class.

## Deliverables

- evidence inventory/checkpoint covering all 28 official point IDs;
- if sufficiently proven anchors exist, a separate versioned spatial-evidence data file;
- deterministic assertions that no unresolved point becomes trusted automatically;
- decision whether 6A3B3 can safely start or must support only a proven subset.

## Stop condition

If authoritative/independently verifiable spatial identity cannot be established for a point, leave it unresolved. Completeness is not a reason to guess.
