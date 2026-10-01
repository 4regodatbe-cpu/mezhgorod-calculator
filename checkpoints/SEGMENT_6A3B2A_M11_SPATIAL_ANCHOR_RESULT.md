# Segment 6A3B2A — M-11 spatial/facility evidence result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: PARTIAL / GREEN FOR 15–58 FACILITY IDENTITY / COORDINATES STILL UNRESOLVED
Production `main`: unchanged.

## Why the model was refined

Segment 6A3B1 proved that the repository had no official-coordinate-backed M-11 tariff boundaries. Segment 6A3B2 therefore correctly started with all official tariff-point coordinates unresolved.

During the authoritative-source pass for 6A3B2A, the current official Section 15–58 rules exposed an additional structural fact: one tariff point is not necessarily one physical toll facility.

Most importantly, the tariff point `ММК (А107)` is represented by two directional physical PVPs:

- `ММК | ЮГ`, PVP `6B1`, M-11 km 48, direction Moscow → MMK;
- `ММК | СЕВЕР`, PVP `6B2`, M-11 km 50, direction Saint Petersburg → MMK.

The same official rules also state that after physical PVP `Солнечногорск` at M-11 km 58, Section 15–58 connects to the next section through a separate virtual toll point.

Therefore the safe architecture is:

`tariff point -> zero/one/many physical or virtual facilities -> optional spatial evidence`

not one coordinate directly attached to each tariff point.

## Authoritative Section 15–58 facility inventory persisted

Added:

`data/tolls/m11/2026-02-24-15-58-facility-evidence.json`

Source: current official M11-Neva rules for Section 15–58, effective 24 February 2026.

Persisted facility identities/chainage:

1. Moscow — PVP 1 — M-11 km 21;
2. Sheremetyevo-2 — PVP 3 — M-11 km 24;
3. Sheremetyevo-1 — PVP 4 — M-11 km 28;
4. Zelenograd — PVP 5 — M-11 km 36, physical PVP on km 3 of the access road;
5. TsKAD — PVP 18 — M-11 km 47;
6. MMK South — PVP 6B1 — M-11 km 48;
7. MMK North — PVP 6B2 — M-11 km 50;
8. Solnechnogorsk — PVP 7 — M-11 km 58;
9. separate virtual section boundary after the Solnechnogorsk PVP.

The official document does not provide trusted coordinates for these objects. Every persisted coordinate therefore remains `null` and every spatial status remains `unresolved`.

## Boundary model refinement

Updated `lib/toll-engine/m11-boundaries.ts`.

The model now separates:

- tariff-point identity/order;
- physical/virtual facility identity;
- facility chainage/direction metadata;
- optional spatial evidence.

A tariff point can contain multiple facilities. Facility evidence cannot refer to an unknown tariff point, duplicate facility IDs are rejected, and coordinate/status consistency is asserted.

No monetary field is owned by this model.

## Deterministic validation

Updated `scripts/segment6a3b2-m11-boundary-model-test.ts`.

The test now proves:

- 2 tariff systems and 28 official tariff points remain unchanged;
- Section 15–58 has 9 persisted facility objects;
- all 9 facility coordinates remain null/unresolved;
- `mmk_a107` has exactly two separate directional physical PVPs at km 48 and km 50;
- `solnechnogorsk` has a physical PVP plus a distinct unresolved virtual boundary;
- tariff-point route/PVP km are not fabricated from facility chainage;
- Section 58–679 still has zero attached facilities until separate evidence is persisted;
- no monetary fields are exposed;
- `/api/v2/calculate` still does not import the boundary model.

## Workflow audit trail

Initial pure boundary-model run:

- run `36799631209`;
- head `5a4019d7ed88efb96dcd588dc1daa2d5cd16f0f8`;
- result SUCCESS.

During facility-evidence workflow editing, run `36800145513` failed because the workflow file accidentally used the wrong pnpm setup input (`node-version` instead of `version`). This was identified before accepting the run and is not a source/model failure.

Corrected clean validation:

- run `36800165898`;
- head `db4966a04e7dfc0a7fbde3a712c718fd7e4f3c58`;
- result SUCCESS.

Green steps:

- checkout/setup;
- dependency install;
- deterministic facility/boundary assertions;
- explicit no-production-API-integration check;
- production `pnpm build`.

## What is now proven

1. Section 15–58 physical facility identities and official chainage can be stored without inventing coordinates.
2. One tariff point can map to multiple directional PVP facilities.
3. A virtual inter-section boundary is distinct from the physical Solnechnogorsk PVP.
4. The original all-null spatial decision was correct: no coordinate has been promoted without spatial proof.
5. No user-facing pricing or routing behavior changed.

## What remains unresolved

- trusted coordinates for all M-11 facilities;
- complete physical/virtual facility inventory for the 58–679 system;
- exact mapping from strict route geometry to official tariff-point IDs;
- full 58–679 tariff matrix required for arbitrary-pair pricing.

## Next

Continue 6A3B2A with the 58–679 physical-facility identity inventory from authoritative operator/state-road sources. Persist only proven facility identity/chainage/direction metadata. Keep coordinates unresolved unless a source supplies or independently proves the spatial object.

Do not start an exact 6A3B3 resolver until the model has sufficient spatial anchors for the subset it is allowed to resolve.
