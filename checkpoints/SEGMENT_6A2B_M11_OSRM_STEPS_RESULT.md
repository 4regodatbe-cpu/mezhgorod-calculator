# Segment 6A2B — M-11 evidence from existing OSRM request result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / DIAGNOSTIC ONLY
Production `main`: unchanged.

## Final accepted run

Workflow: `Segment 6A2B M11 OSRM step evidence probe`
Run: `36785727265`
Head: `f4de514acb4333d607931f3648d563125cbb122a`
Result: SUCCESS.

The first probe was deliberately not accepted as final because the diagnostic script classified `destinations` as strict M-11 evidence. The detector was tightened to the planned rule:

- strict evidence: M-11 match in road `name` or `ref` only;
- `destinations` mentioning M-11: candidate clue only;
- `Нева` without M-11 road identity: clue only.

The tightened run remained green and retained useful M-11 evidence on all three controls.

## Moscow → Saint Petersburg cross-provider control

OSRM route: 705.671 km / 501 min.
Steps: 42.
Strict M-11 steps: 3.

Observed strict blocks:

1. `17.647 → 684.403 km`, length `666.757 km`, road ref `М-11`;
2. `684.704 → 690.031 km`, length `5.327 km`, road ref `М-11` / name `«Нева»`.

Between those strict blocks OSRM exposes a `0.301 km` step with no M-11 name/ref.

The strict corridor starts near `[37.488657, 55.878154]` and the second block ends near `[30.312274, 59.81611]`.

This is broadly consistent with the Valhalla M-11 corridor from Segment 6A2A, but the exact provider boundaries differ slightly. Provider-specific route-relative indices therefore must normalize into a common evidence model rather than requiring identical coordinates.

## Sochi → Saint Petersburg long mixed control

OSRM route: 2338.436 km / 1832 min.
Steps: 133.
Strict M-11 steps: 4.

Observed strict blocks:

1. `1650.453 → 2317.168 km`, length `666.715 km`;
2. `2317.469 → 2322.796 km`, length `5.327 km`.

The first strict M-11 coordinate is `[37.467541, 55.883302]`, matching the M-11 entry observed by Valhalla on Moscow-origin controls to within provider-level routing differences.

The northern `0.301 km` unlabeled step remains a gap and is not silently merged.

This proves that the existing OSRM provider can expose M-11 road identity on the long M-4 + M-11 route that public Valhalla rejects for exceeding 1,500 km.

## Saint Petersburg → Sochi reverse mixed control

OSRM route: 2339.387 km / 1833 min.
Steps: 151.
Strict M-11 steps: 3.

Strict block:

- `19.573 → 689.529 km`, length `669.955 km`.

Immediately before it is a `1.960 km` step whose `destinations` says `М-11: Москва` but whose road `name/ref` does not identify M-11.

This step is recorded only as a candidate clue. It is not part of the strict block until another evidence layer proves road ownership.

That asymmetry is intentional and demonstrates why `destinations` cannot be treated as exact road identity.

## What is proven

1. The existing OSRM request can return ordered M-11 road evidence when requested with `steps=true`.
2. OSRM supports the long Sochi↔Saint-Petersburg mixed route that exceeds public Valhalla's full-route limit.
3. M-11 appears in OSRM `ref` strongly enough to derive strict blocks on all tested controls.
4. The production calculator already performs the OSRM network request, so a future implementation can request/parse step metadata in that same call; no additional network call is inherently required.
5. Valhalla and OSRM can be normalized into a shared provider-neutral concept: ordered strict M-11 blocks plus weaker candidate clues.

## What is not proven

1. A short unlabeled gap between two M-11 OSRM blocks is not automatically M-11. It must remain a gap until official corridor/tariff-point geometry or another exact evidence rule proves continuity.
2. A step whose destination mentions M-11 but whose road identity does not is not strict M-11 evidence.
3. Provider route times and exact boundary coordinates differ; provider agreement is corridor-level evidence, not proof that their route-relative indices are interchangeable.
4. Road span evidence still does not determine money. Exact pricing requires official tariff-system boundaries, entry/exit points and time/day rules.

## Architectural decision after 6A2

M-11 span extraction can proceed without a second production route request:

- Valhalla adapter for routes where the existing Valhalla fast request succeeds;
- OSRM step adapter, using `steps=true` on the existing OSRM request, including long mixed M-4 + M-11 routes;
- both adapters emit a provider-neutral ordered block model;
- no provider-specific gap is silently bridged;
- weak clues remain explicitly weaker than strict road identity.

## Next — Segment 6A2C

Implement the parsing layer only, still without monetary integration:

1. pure provider-neutral `M11RoadEvidence` type;
2. Valhalla-maneuver adapter;
3. OSRM-step adapter;
4. deterministic fixtures based on the observed controls;
5. tests/assertions that preserve gaps, direction asymmetry and weak clues;
6. no change to `lib/tolls.ts` M-11 prices or user toll output yet.

After the parser is deterministic and green, proceed to Segment 6A3 versioned official tariff data and tariff-point mapping.
