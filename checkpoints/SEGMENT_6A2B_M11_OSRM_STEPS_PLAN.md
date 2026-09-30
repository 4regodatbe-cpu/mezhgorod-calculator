# Segment 6A2B — M-11 evidence from the existing OSRM request

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLANNED / DIAGNOSTIC ONLY
Production `main`: unchanged.

## Reason for split

Segment 6A2A proved that Valhalla maneuver evidence is strong for M-11 routes within the public server's 1,500 km path limit, but public Valhalla rejects Sochi→Saint-Petersburg.

The production calculator already sends an OSRM request for every leg and falls back to OSRM geometry when Valhalla is unavailable. Therefore the correct next experiment is to test whether adding `steps=true` to that same OSRM request can expose ordered M-11 road evidence without introducing another network call.

## Goal

Determine whether OSRM route steps can provide enough M-11 evidence for long/mixed routes to support the same future strict span model used for Valhalla-backed routes.

No production code or pricing changes in this segment.

## Controls

1. Moscow → Saint Petersburg — cross-provider control against 6A2A.
2. Sochi → Saint Petersburg — long mixed M-4 + M-11 control.
3. Saint Petersburg → Sochi — reverse long mixed control.

## Probe data

Use the same public endpoint as production:

`https://router.project-osrm.org/route/v1/driving/...`

Request:

- `overview=full`;
- `geometries=geojson`;
- `steps=true`.

For every route step record:

- `name`;
- `ref`;
- destinations where present;
- step distance;
- step geometry start/end coordinates;
- route-relative begin/end km.

Strict M-11 detection should match M-11 only in road name/ref fields. `Нева` without an M-11 ref may be logged as a candidate clue but must not by itself be promoted to strict evidence.

Consecutive strict M-11 steps are grouped into ordered blocks. Non-M-11 gaps remain explicit.

## Success criteria

The experiment is successful if:

- OSRM returns steps for the >1,500 km mixed controls;
- M-11 is identifiable from `name` or `ref` on those steps;
- valid step geometry/distance allows ordered route-relative M-11 blocks to be derived;
- the Moscow→Saint-Petersburg block is broadly consistent with the Valhalla M-11 corridor.

If OSRM does not label M-11 reliably, stop and document that limitation rather than introducing heuristic pricing.

## Runtime rules

- standalone diagnostic script/workflow only;
- no paid API/key;
- per request timeout 45 seconds;
- workflow <=20 minutes;
- do not retry an identical failed provider request if a deterministic provider limit/error is returned.

## Next if successful

Build a pure provider-neutral M-11 span representation with provider-specific adapters (Valhalla maneuvers and OSRM steps), then map versioned official M-11 tariff points in Segment 6A3.
