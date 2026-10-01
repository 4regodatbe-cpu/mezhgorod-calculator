# Segment 6A3B1 — M-11 tariff-boundary anchor inventory result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN AS INVENTORY / SPATIAL GAP IDENTIFIED
Production `main`: unchanged.

## Goal

Inventory every existing M-11 spatial/boundary anchor already present in the repository before creating any tariff-boundary resolver.

This segment does **not** calculate money, does **not** change `/api/v2/calculate`, and does **not** promote legacy/provider coordinates to official tariff-point coordinates.

## Sources inspected

- `lib/tolls.ts` — legacy M-11 approximate corridor segments and fixed full-route controls;
- `lib/toll-recovery.ts` — confirms no M-11-specific recovery road exists;
- `lib/toll-validator.ts` — generic dynamic Valhalla toll-edge/booth evidence only;
- `lib/verified-routes.ts` — route-level city-pair toll fallbacks, no tariff-point coordinates;
- `lib/toll-engine/m11-road-evidence.ts` and Segment 6A2 result checkpoints — provider-derived strict M-11 road spans;
- `data/tolls/m11/2026-04-24-15-58-category1.json` — official 15–58 tariff-point names and complete Category-I tariff matrix;
- `data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json` — official ordered 58–679 point inventory and A1 control row.

## Classification result

### 1. Official-coordinate-backed anchors

**None are currently persisted in the repository.**

Both official M-11 snapshots provide tariff-system IDs, labels, route/PVP kilometre metadata and tariff/order semantics, but neither snapshot contains trusted spatial coordinates for its tariff points.

Therefore no existing coordinate may be classified as `official-coordinate-backed` yet.

### 2. Legacy-only anchors

`lib/tolls.ts` contains five broad approximate M-11 chunks. Their endpoints are legacy geometry heuristics, not official tariff-point coordinates:

| Legacy label | Coordinate `[lon, lat]` | Classification | Official correspondence |
| --- | --- | --- | --- |
| Москва — M-11 chunk start | `[37.41, 55.94]` | legacy-only | label-level only; not proven as official `moscow` point |
| Солнечногорск | `[36.98, 56.18]` | legacy-only | label-level only; not proven as official `solnechnogorsk` or `p58` coordinate |
| Тверь | `[35.89, 56.77]` | legacy-only | label-level association with `p147`/Tver only |
| Вышний Волочёк | `[34.56, 57.58]` | legacy-only | no direct official tariff-point counterpart in current A1 point inventory |
| Великий Новгород | `[31.28, 58.52]` | legacy-only | label-level association with `p545` only |
| Санкт-Петербург | `[30.29, 59.79]` | legacy-only | label-level association with `p679` only |

`FULL_ROUTES` also contains broad city matching anchors:

- Moscow `[37.62, 55.76]`;
- Saint Petersburg `[30.34, 59.93]`.

These are city/end-point heuristics for full-route matching and are **not tariff boundaries**.

The existence of the legacy `Вышний Волочёк` boundary while the official 58–679 point order contains no equivalent tariff point is direct evidence that the legacy five-chunk model must not be reused as the tariff-boundary model.

### 3. Route-provider-derived anchors

These coordinates come from observed strict M-11 road spans. They prove provider-observed road identity/transition only; they are not official tariff points.

#### Valhalla

Moscow → Saint Petersburg strict M-11 block:

- start `[37.467541, 55.883302]`;
- end `[30.283506, 59.832743]`.

Saint Petersburg → Moscow strict M-11 block:

- start `[30.310918, 59.816499]`;
- end `[37.481044, 55.885579]`.

Partial-route diagnostics also expose route-relative M-11 entry/exit positions for Moscow→Tver, Tver→Saint Petersburg and Solnechnogorsk→Saint Petersburg, but the result checkpoints do not establish those positions as official tariff-point coordinates.

#### OSRM

Moscow → Saint Petersburg strict evidence includes:

- southern strict-corridor start near `[37.488657, 55.878154]`;
- northern strict block end near `[30.312274, 59.81611]`.

Sochi → Saint Petersburg repeats the provider-observed southern M-11 start `[37.467541, 55.883302]`.

Provider agreement is useful corridor evidence, but provider-specific road-span boundaries differ. They must remain `route-provider-derived` until independently mapped to an official tariff point.

### 4. Missing / unresolved official spatial anchors

#### 15–58 system — `m11-15-58-ossp`

Trusted coordinates are unresolved for all seven official points:

1. `moscow` — Москва;
2. `sheremetyevo2` — Шереметьево-2;
3. `sheremetyevo1` — Шереметьево-1;
4. `zelenograd` — Зеленоград;
5. `tskad` — ЦКАД;
6. `mmk_a107` — ММК (А107);
7. `solnechnogorsk` — Солнечногорск.

The official snapshot states that passage across the boundary of Section 15–58 and the next section is priced as passage through PVP `Солнечногорск`. That is a **tariff rule**, not spatial proof that the `solnechnogorsk` point has the same coordinate as km58/PVP58.

#### 58–679 system — `m11-58-679-avtodor`

Trusted coordinates are unresolved for all 21 ordered official points:

`p58`, `p67`, `p89`, `p97`, `p124`, `p147`, `p159`, `p177`, `p209`, `p214`, `p258`, `p330`, `p348`, `p385`, `p402`, `p444`, `p524`, `p545`, `p647`, `p668`, `p679`.

Some points have label-level legacy/provider associations, but none satisfy official-coordinate-backed evidence:

- `p147` / Tver ↔ legacy Tver anchor only;
- `p545` / Veliky Novgorod ↔ legacy Veliky Novgorod anchor only;
- `p679` / Saint Petersburg ↔ legacy city/corridor anchor plus provider-derived M-11 road-exit coordinates;
- `p58` / Peshki has no trusted persisted spatial anchor; it must not be substituted by the legacy Solnechnogorsk coordinate.

## Other repository evidence

- `lib/toll-recovery.ts` supports only `M4` and `M12`; there is no hidden M-11 recovery anchor set.
- `lib/verified-routes.ts` carries Moscow↔Saint-Petersburg and Saint-Petersburg↔Sochi route-level tariff fallbacks, but no M-11 tariff-point geometry.
- `/api/v2/calculate` imports the dedicated M-4 and M-12 engines, but no M-11 boundary/pricing engine. Therefore 6A3B1 has not accidentally changed production/user pricing.

## Decision

6A3B1 is green as an inventory, but it identifies an intentional spatial-data gap:

1. official point **identity/order/km metadata** can be modeled now;
2. trusted coordinates must remain optional/missing;
3. legacy coordinates must be tagged as legacy and never silently promoted;
4. route-provider coordinates must be tagged as observed road evidence and never silently promoted;
5. exact coordinate-based boundary resolution cannot be claimed until authoritative or independently justified spatial anchors are acquired.

## Next — Segment 6A3B2

Create the pure boundary data model only:

- stable tariff-system IDs and official tariff-point IDs;
- official order and route/PVP km metadata;
- optional trusted coordinate field kept empty where unresolved;
- explicit spatial-evidence classification;
- no money and no production API integration.

After 6A3B2, a dedicated spatial-anchor acquisition/validation subsegment must run before any resolver is allowed to emit exact tariff-point IDs from coordinates. If that evidence remains unavailable, the resolver must return unresolved rather than guess.
