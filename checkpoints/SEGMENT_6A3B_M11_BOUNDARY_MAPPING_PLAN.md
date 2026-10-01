# Segment 6A3B — M-11 tariff-boundary mapping plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Create a deterministic, provider-neutral mapping layer between proven M-11 road evidence and official M-11 tariff-system boundaries/points. This segment must not calculate money and must not change `/api/v2/calculate`.

## Inputs

1. `lib/toll-engine/m11-road-evidence.ts`
   - strict ordered M-11 road blocks from Valhalla/OSRM;
   - candidate clues remain non-authoritative.
2. `data/tolls/m11/2026-04-24-15-58-category1.json`
   - complete Category I/Group 1 directional tariff matrix for the 15–58 km concession section;
   - official named entry/exit points.
3. `data/tolls/m11/2026-03-02-58-679-category1-a1-controls.json`
   - official ordered tariff-point controls for 58–679 km;
   - intentionally incomplete tariff matrix and therefore not yet valid for arbitrary pricing.

## Invariants

1. Road-provider maneuver/step subdivisions are not tariff boundaries.
2. A strict M-11 road block proves road identity only; it does not by itself prove a specific tariff entry/exit point.
3. Candidate clues (`destinations=M-11`, `Нева` without strict M-11 ref/name) never become exact tariff boundaries.
4. Boundary resolution must be deterministic and conservative. Ambiguous/missing boundary evidence => unresolved, never guessed.
5. No interpolation or approximation of tariff amounts or missing matrix cells.
6. The 15–58 and 58–679 systems remain distinct operator/tariff domains and are composed only after each domain resolves its own entry/exit.
7. No production pricing changes in 6A3B.

## Work split

### 6A3B1 — inventory existing anchors/evidence
- locate any existing M-11 PVP/entry anchors in legacy toll code and diagnostics;
- compare them with the official point labels/order in the two snapshots;
- classify anchors as official-coordinate-backed, legacy-only, route-provider-derived, or missing.

### 6A3B2 — pure boundary data model
- define stable IDs for tariff systems and tariff points;
- represent optional trusted coordinates separately from route-km/order metadata;
- do not assign coordinates where no trustworthy source exists.

### 6A3B3 — deterministic resolver
- input: `M11RoadEvidence` plus route geometry when available;
- output: resolved entry/exit point IDs per tariff system, confidence/evidence, unresolved reasons;
- no money.

### 6A3B4 — fixture gate
Must cover at least:
- full Moscow↔Saint-Petersburg-style strict M-11 traversal;
- entry/exit inside 15–58;
- traversal crossing 15–58 → 58–679 boundary;
- route that touches only 58–679;
- unlabeled gap/candidate-only clue;
- non-M-11 control;
- deliberately ambiguous boundary => unresolved.

## Success criteria

- deterministic fixtures green;
- build green;
- no exact boundary emitted from candidate-only evidence;
- no arbitrary pricing introduced;
- all unresolved cases explicitly represented;
- checkpoint records which official points have trustworthy spatial anchors and which remain data gaps.

## Stop / split criteria

If authoritative coordinates for tariff points are missing, do not fabricate or infer them from tariff kilometre values alone. Split the work: keep the tariff order model, mark spatial mapping unresolved, and use further official/OSM diagnostics only in a new subsegment.

## Next after green

Segment 6A3C: pure tariff-selection core over resolved boundaries and versioned official data. Production integration remains a later segment.
