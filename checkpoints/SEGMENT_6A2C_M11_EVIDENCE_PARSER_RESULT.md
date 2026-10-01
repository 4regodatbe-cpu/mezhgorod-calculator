# Segment 6A2C — provider-neutral M-11 road-evidence parser result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN
Production `main`: unchanged.

## Scope

Segment 6A2C converted the provider diagnostics from 6A2A/6A2B into a deterministic pure parsing layer only.

No M-11 tariff amount, user API response, existing generic M-11 fallback, M-4 engine, M-12 engine, or production `main` behavior was changed.

## Implemented files

- `lib/toll-engine/m11-road-evidence.ts`
- `data/m11-road-evidence-fixtures.json`
- `scripts/segment6a2c-m11-road-evidence-test.ts`
- `.github/workflows/segment6a2c-m11-road-evidence.yml`

## Provider-neutral evidence model

The parser now represents M-11 route evidence as:

- ordered strict M-11 blocks;
- explicit candidate/weak clues;
- malformed strict-source count;
- provider identity;
- source-index ranges;
- route-relative distance when measurable;
- begin/end coordinates and diagnostic labels.

It does not decide tariffs, toll/free status, monetary amounts, or official tariff-point ownership.

## Valhalla adapter semantics

`deriveM11EvidenceFromValhalla()`:

- accepts M-11 only from maneuver `street_names` / `begin_street_names`;
- validates `begin_shape_index` / `end_shape_index` against decoded leg geometry;
- groups only consecutive valid strict M-11 maneuvers;
- malformed matching maneuver evidence is counted and breaks continuity;
- separate blocks remain separate;
- no monetary interpretation is performed.

## OSRM adapter semantics

`deriveM11EvidenceFromOsrm()`:

- accepts strict M-11 only from step road `name` or `ref`;
- `destinations` mentioning M-11 remains candidate-only evidence;
- `Нева` without strict M-11 road identity remains candidate-only evidence;
- groups only consecutive strict steps;
- unlabeled gaps are preserved and never silently bridged;
- invalid strict step distance/geometry is counted as malformed rather than promoted;
- route-relative distances become conservative when source distance continuity cannot be trusted.

## Deterministic fixtures

Fixture corpus covers:

1. Valhalla continuous Moscow→Saint-Petersburg-style M-11 block;
2. malformed Valhalla index that must split continuity;
3. OSRM northbound two strict M-11 blocks separated by the observed unlabeled gap;
4. OSRM southbound destination-only M-11 clue followed by a strict block;
5. `Нева` without strict M-11 ref/name as weak evidence only;
6. non-M-11 M-10 control.

## Validation run

Workflow: `Segment 6A2C M11 road evidence parser`
Run: `36786170033`
Validated head: `55dcba2fa02e7d60d41404da8dec443641186641`
Result: SUCCESS.

Deterministic fixture output:

- `M11_EVIDENCE_FIXTURE_OK valhalla moscow-spb-continuous blocks=1 malformed=0`
- `M11_EVIDENCE_FIXTURE_OK valhalla malformed-index-break blocks=2 malformed=1`
- `M11_EVIDENCE_FIXTURE_OK osrm northbound-two-blocks-with-gap blocks=2 clues=0`
- `M11_EVIDENCE_FIXTURE_OK osrm southbound-destination-clue-not-strict blocks=1 clues=1`
- `M11_EVIDENCE_FIXTURE_OK osrm neva-without-m11-ref-is-clue blocks=0 clues=1`
- `M11_EVIDENCE_FIXTURE_OK osrm non-m11-control blocks=0 clues=0`
- final: `M11_EVIDENCE_FIXTURES_GREEN valhalla=2 osrm=4`.

The same workflow then completed a production `pnpm build` successfully, including TypeScript and static-page generation.

## Invariants proven by 6A2C

1. Provider-specific metadata can normalize into one conservative M-11 road-evidence model.
2. An unlabeled provider gap does not become M-11 merely because strict M-11 exists before and after it.
3. `destinations=M-11` does not prove that the current road step is M-11.
4. `Нева` alone does not prove strict M-11 road identity.
5. Malformed matching metadata cannot create a continuous strict block.
6. A non-M-11 route remains free of strict M-11 evidence.
7. The parser is pure and deterministic; public route providers are not required for its fixture regression.

## No production wiring yet

The parser is intentionally not imported into `/api/v2/calculate` yet.

Production OSRM still uses its current request shape; `steps=true` has only been proven diagnostically and has not yet been promoted into production.

Current user-visible M-11 amounts therefore remain unchanged until the official tariff data and tariff-point mapping layers are complete and tested.

## Next — Segment 6A3

Split official M-11 tariff work into conservative subsegments:

- **6A3A** — persist versioned official tariff snapshots/metadata only;
- **6A3B** — map official tariff-system boundaries and entry/exit points to route evidence/anchors;
- **6A3C** — implement a pure tariff-selection core over proven road evidence and versioned official data;
- only after those layers are green may a later integration segment alter user M-11 pricing.

Do not approximate or interpolate missing official tariff cells. Do not use route-provider maneuver subdivisions as tariff boundaries.
