# Segment 6 — other paid road families — COMPLETE

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: DONE — safe stabilization/model checkpoint complete; unsupported exact coverage remains fail-closed.
Production `main`: unchanged.

## M-11

Completed:
- strict provider-neutral M-11 road evidence parser;
- current/historical tariff snapshots with provenance separation;
- current A1 ordered-point inventory including p593;
- strict partial current tariff core with only directly verified directed controls;
- facility identity/chainage inventories and September infrastructure drift guard;
- independently verified multi-anchor spatial evidence for current p58/p593/p679 controls;
- deterministic boundary resolver with strict-road, endpoint and ambiguity guards;
- cross-system/15–58/candidate-only/non-M11 fixture gate;
- pure current tariff-selection core;
- production-shaped M-11 wrapper with mixed-road protection and zero extra network requests.

Accepted green runs include:
- `36873273176` — multi-anchor spatial model;
- `36873526718` — deterministic boundary resolver;
- `36873961988` — boundary fixture gate;
- `36874293738` — current tariff selection;
- `36874557342` — production-shaped wrapper.

Promotion remains intentionally deferred because the complete authoritative current A2 matrix cannot be acquired deterministically from the protected operator source and current exact monetary coverage is deliberately partial. Unknown/reverse/interior cases remain unknown/null in the new core; the existing fallback remains available under the global replacement invariant.

## ЦКАД / M-1 / M-3 / A-289 current tariff audit

A current Category-I official visible-page snapshot was persisted from `https://avtodor-tr.ru/road/tariffs/`, observed 2026-10-01, preserving `transponder` and `noTransponder` as separate tariff modes instead of silently mixing them.

Snapshot coverage:
- M-1 33–66: 1 current row;
- M-3: 3 current rows with Mon–Thu/Fri–Sun separation;
- ЦКАД: 16 visible current rows;
- A-289: 6 current route rows.

Important audit finding: the legacy table is not a trustworthy universal “current cash/no-transponder” source. Examples in the current official page include A-289 Марьянская→Темрюк `800` with transponder vs `1103` without transponder, and M-3 weekend values that differ from weekday values. Therefore no new exact engine is allowed to inherit the legacy tariff mode implicitly.

Added `lib/toll-engine/other-road-current-tariffs.ts` as an explicit tariff/evidence contract:
- tariff mode must be explicit;
- exact section IDs must come from `status=verified` route evidence;
- unresolved route evidence returns unknown/null;
- unknown section or unavailable day profile returns unknown/null;
- no false zero.

Green runs:
- `36874854684` — official remaining-road tariff snapshot gate;
- `36875058936` — remaining-road evidence/tariff contract gate.

## A-289

The previously integrated A-289 RVP 82/103 composition remains protected by existing M-4 production controls. The new current audit does not silently rewrite that production behavior because tariff mode must first be made explicit; this avoids replacing a known working control with an assumed payment mode.

## Segment 6 completion decision

Segment 6 is complete as a safety/model stabilization segment:
- every listed paid-road family now has either a validated exact core (M-11 partial, A-289 existing composition) or a current explicit tariff/evidence contract (ЦКАД, M-1, M-3, A-289 audit);
- unsupported route evidence cannot become exact in the new models;
- current tariff modes are preserved explicitly;
- no incomplete engine has been promoted over working fallback behavior;
- production `main` remains unchanged.

This does **not** claim universal exact pricing for every possible traversal. It closes Segment 6 by replacing undocumented assumptions with explicit current models, provenance, fail-closed evidence contracts and regression gates. Expansion of current exact coverage must satisfy those contracts rather than bypass them.

## Next

Segment 7 — tariff data versioning and updater checks:
- effective-date/source metadata normalization;
- stale-data detection;
- deterministic historical/current selection;
- tariff-mode metadata must remain explicit where operator tariffs distinguish transponder/no-transponder.