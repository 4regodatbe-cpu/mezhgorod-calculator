# Segment 6A3B2D — M-11 stable OSM toll-object inventory plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PLAN
Production `main`: unchanged.

## Context

Segment 6A3B2C ended in a safe stop: 0/5 control coordinates met the strict promotion gate because available web/map evidence either lacked a stable object coordinate, duplicated a secondary source, referred only to a road kilometre/interchange, or contained unresolved chainage conflicts.

## Goal

Use a different evidence-acquisition method: query OpenStreetMap/Overpass for stable physical toll objects across the M-11 corridor and inspect object IDs, tags and explicit coordinates for the five control facilities:

- PVP 58;
- PVP 147;
- PVP 545;
- PVP 593;
- PVP 679.

This is candidate discovery only. An OSM object is not automatically accepted as authoritative.

## Method

1. Query a bounded M-11 corridor rather than deriving coordinates from kilometre labels.
2. Collect objects explicitly tagged as toll infrastructure, including `barrier=toll_booth` and `highway=toll_gantry`.
3. Persist the raw diagnostic inventory as a workflow artifact, not production data.
4. Inspect stable OSM object type/ID, coordinate/center and tags (`name`, `ref`, `operator`, `description`, road context).
5. Compare candidate identity against already authoritative PVP identity/chainage evidence.
6. Route-provider geometry may corroborate a candidate later but cannot establish identity by itself.

## Network rule

The probe may fail over to a different public Overpass endpoint after a transport/server failure. It must not repeat the identical failed request indefinitely. Total workflow time remains capped at 20 minutes.

## Promotion gate

No coordinate is written into authoritative facility evidence during this inventory probe.

A later promotion requires, per facility:

- stable OSM object ID;
- explicit coordinate/center;
- toll-infrastructure tags;
- unambiguous compatibility with the official PVP identity/context;
- independent corroboration;
- no unresolved conflicting local candidate.

If fewer than three of the five controls satisfy that later gate, do not scale promotion to the remaining PVP inventory.

## Non-goals

- no change to `/api/v2/calculate`;
- no M-11 pricing change;
- no coordinate derivation from `routeKm`;
- no city-centre or nearest-road substitution;
- no reuse of legacy coordinates as truth;
- no change to current tariff snapshots.
