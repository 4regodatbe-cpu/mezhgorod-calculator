# M-12 Segment 5B2B-1 — Valhalla maneuver-span capability probe

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: PLANNED / IN PROGRESS

## Goal

Determine whether the normal Valhalla `/route` response can expose enough road identity and shape-index information to identify the actual contiguous M-12 span without an additional full-route `trace_attributes` call.

This is a diagnostic-only capability probe. It must not change `/api/v2/calculate` or produce a toll price.

## Why this is separate

Segment 5B2A proved that physical gantry events can be mapped to official RVP kilometre markers, but pricing an arbitrary route additionally requires knowing where that route actually enters and exits M-12. The production route call currently asks Valhalla for `directions_type: none`, so maneuver evidence is discarded.

Valhalla documentation states that route legs can include maneuvers with `street_names`, `begin_street_names`, `begin_shape_index`, and `end_shape_index`. The public server must be probed rather than assumed to return useful M-12 naming.

## Probe

1. Request the same production-style routes with:
   - `costing=auto`;
   - `costing_options.auto.use_tolls=1`;
   - `shape_format=polyline6`;
   - directions/maneuvers enabled.
2. Test Moscow -> Kazan and Kazan -> Moscow.
3. Decode route geometry and cumulative chainage.
4. Inspect each maneuver for M-12 identity using only returned maneuver fields, including:
   - `street_names`;
   - `begin_street_names`;
   - text instructions/verbal instructions as diagnostics only.
5. Convert maneuver shape indexes to route chainage and derive contiguous M-12-labeled spans.
6. Compare forward/reverse normalized span boundaries for mirror consistency.
7. Save the raw normalized maneuver evidence to JSON.

## Decision rules

Capability is considered promising only if:

- both directions contain at least one unambiguous M-12-labeled maneuver;
- shape indexes are present and valid;
- the labeled M-12 sequence is contiguous enough to derive a stable span;
- forward/reverse normalized span boundaries are reasonably mirrored.

If these conditions are not met, do not force them. The next segment must use a different route-relative evidence method.

## Safety

- diagnostic only;
- no Overpass;
- no `trace_attributes`;
- no pricing call;
- no `/api/v2/calculate` change;
- workflow timeout <= 20 minutes.

## Next

If maneuver evidence is sufficient: Segment 5B2B-2 builds a span detector from the same normal route response and tests partial routes.

If maneuver evidence is insufficient: Segment 5B2B-2 switches to a bounded/local evidence strategy around official RVP/entry-exit context rather than one long full-route map-matching call.
