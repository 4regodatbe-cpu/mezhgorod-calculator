# M-12 Segment 5B2C — reusable core and deterministic route fixtures

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: IN PROGRESS

## Why split

Live Valhalla route changes and pure toll-math regressions must not be conflated.

Segment 5B2C is split into:

### 5B2C-1 — immutable route fixture capture

Capture the current production-style Valhalla controls once:

- encoded route geometry (polyline6);
- route distance;
- strict M-12 maneuver span where available;
- endpoint/control identity;
- capture timestamp and source URL semantics (`costing=auto`, `use_tolls=1`).

Controls:

- Moscow -> Kazan / Kazan -> Moscow
- Vladimir -> Kazan / Kazan -> Vladimir
- Murom -> Kazan / Kazan -> Murom
- Arzamas -> Kazan / Kazan -> Arzamas
- Moscow -> Arzamas / Arzamas -> Moscow

The fixture is regression evidence, not a production route database.

### 5B2C-2 — pure TypeScript core

Create a reusable module under `lib/toll-engine/` that:

1. accepts route geometry and optional strict M-12 span;
2. projects calibrated official-RVP anchors with the 80 m direct-crossing threshold;
3. reconstructs only internal missing official markers when bounded continuity passes;
4. checks entry/exit coverage conservatively against the nearest outside official RVP;
5. composes amounts only from the official tariff snapshot;
6. returns `priced` only when traversal + internal continuity + boundary coverage are all proven;
7. otherwise returns `unknown` with `amountRub=null`;
8. never returns 0 merely because no supported RVP was found.

## Boundary rule to test

Maneuver road-name span is secondary boundary evidence only. For a proposed first/last crossed RVP, the distance from the span boundary to that direct RVP must be materially less than the official distance to the next outside RVP in that travel direction. If this cannot be proven, result stays unknown.

This specifically prevents:

- inventing early M-12 charges before the actual entry;
- including RVP 769 on the current Moscow->Kazan route when route geometry does not cross its calibrated candidate;
- turning an evidence gap into zero.

## Gates

- fixture capture: <=10 min, no writes to production;
- deterministic core assertions: no network calls;
- application build;
- 5B1 official tariff assertions remain green.

## Next

Only after 5B2C is green: Segment 5B2D integrates the M-12 core into `/api/v2/calculate` behind conservative precedence/fallback and runs user-API regression before any merge to `main`.
