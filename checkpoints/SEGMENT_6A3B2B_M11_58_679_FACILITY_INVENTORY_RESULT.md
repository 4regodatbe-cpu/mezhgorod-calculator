# Segment 6A3B2B — M-11 58–679 physical facility inventory result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / CURRENT-TARIFF DRIFT IDENTIFIED
Production `main`: unchanged.

## Result

The 58–679 evidence layer now separates the March 2026 tariff-point inventory from later authoritative infrastructure changes.

### March official matrix facilities

Added:

`data/tolls/m11/2026-03-02-58-679-facility-evidence.json`

The official Avtodor tariff matrix approved by order No. 35 dated 27.02.2026 directly identifies 21 tariff/PVP points. One physical PVP evidence object is now attached to each of the 21 existing March tariff points.

The evidence preserves the matrix's route-km / PVP-km distinctions, including:

- route km 149 / PVP km 147;
- route km 208 / PVP km 209;
- route km 334 / PVP km 330;
- route km 543 / PVP km 545;
- route km 646 / PVP km 647.

All coordinates remain `null / unresolved` because the tariff PDF supplies identity and chainage, not trusted coordinates.

The facility kind is deliberately `pvp_unspecified`: the tariff table proves that the object is a PVP, but it does not by itself prove whether its physical topology is mainline, interchange, or another layout.

### September infrastructure delta

Added:

`data/tolls/m11/2026-09-18-58-679-facility-delta.json`

Official operator/state-road sources confirm that a new toll plaza opened at M-11 km 593 on 18.09.2026 together with the new interchange.

The new object is persisted as:

- `facilityId = pvp593`;
- `routeKm = 593`;
- `tariffPointId = null`;
- coordinate = `null`;
- spatial status = `unresolved`.

It is intentionally **not** inserted into the March tariff-point list and is not priceable by inference.

## Boundary model change

Updated `lib/toll-engine/m11-boundaries.ts`:

- a facility may have `tariffPointId: string | null`;
- `pvp_unspecified` is an explicit facility kind;
- every tariff system now has `unboundFacilities` in addition to facilities attached to tariff points;
- a null tariff-point binding is allowed only as explicitly unbound evidence;
- a non-null unknown tariff-point ID still fails hard;
- duplicate facility IDs and coordinate/status inconsistencies still fail hard.

This prevents newly observed infrastructure from being silently attached to a nearby or older tariff point.

## Deterministic validation

Updated `scripts/segment6a3b2-m11-boundary-model-test.ts`.

The final gate proves:

- Section 15–58 remains 7 tariff points / 9 bound facility objects / 0 unbound facilities;
- Section 58–679 remains exactly the 21 March tariff points;
- all 21 March points have exactly one bound PVP facility;
- PVP 593 exists as exactly one unbound facility;
- no fabricated `p593` tariff point exists in the March matrix;
- all facility coordinates remain unresolved;
- no monetary fields are exposed by the boundary model;
- `/api/v2/calculate` does not import the boundary model.

## Workflow

Workflow: `Segment 6A3B2 M11 boundary model`
Run: `36802971309`
Head: `ef35708f16282aa65525a05a5efbdd06ca44262e`
Result: SUCCESS.

Green steps:

- setup/install;
- deterministic M-11 boundary assertions;
- no-production-integration assertion;
- production `pnpm build`.

## Critical freshness conclusion

The March 2026 58–679 tariff-point snapshot is structurally stale for current October 2026 arbitrary-pair pricing: an official physical PVP now exists at km 593 but is not represented in that matrix.

Separately, the operator published a 04.09.2026 notice that M-11 tariffs were changing. The exact current matrix from that notice has not yet been captured and independently validated in the repository.

Therefore:

- March data remain valid historical evidence for the points they explicitly contain;
- March data must not be promoted as the complete current October 2026 arbitrary-pair tariff model;
- PVP 593 must remain unbound/non-priceable until a current official tariff snapshot proves its tariff relationships;
- `unknown` remains the required outcome where current tariff coverage is incomplete.

## Next

Before an exact 6A3B3 resolver or arbitrary-pair M-11 pricing is allowed, refresh Segment 6A3A2 against the current post-September official tariff source:

1. recover the current 58–679 tariff-point inventory/matrices after the September changes;
2. prove how PVP 593 participates in the closed toll system;
3. validate point order and matrix completeness;
4. only then bind PVP 593 to a tariff point and proceed to spatial mapping/resolution.

Do not alter production M-11 pricing during this refresh.
