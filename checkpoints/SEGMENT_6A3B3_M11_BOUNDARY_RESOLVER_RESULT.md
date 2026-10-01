# Segment 6A3B3 — deterministic M-11 boundary resolver result

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: COMPLETED / GREEN / CURRENT 58–679 VERIFIED-ANCHOR SUBSET
Production `main`: unchanged.

## Result

Added `lib/toll-engine/m11-boundary-resolver.ts`.

The pure resolver combines strict M-11 road evidence, route geometry and independently verified spatial anchor sets. It emits only ordered tariff-point crossings and resolved entry/exit IDs.

Rules enforced:
- candidate-only evidence cannot resolve;
- malformed strict evidence cannot resolve;
- anchor hit must be within the configured route-distance threshold and inside a strict M-11 geometry interval;
- multiple physical anchors for one tariff point collapse to one crossing;
- fewer than two distinct verified tariff points remains unresolved;
- route order determines direction;
- output is money-free.

## Deterministic controls

Green assertions cover:
- `p58 -> p593`;
- `p58 -> p679` with intermediate p593 crossing;
- reverse `p679 -> p58` geometry;
- candidate-only rejection;
- malformed strict evidence rejection;
- one-boundary-only unresolved;
- unrelated geometry unresolved.

## Validation

Workflow: `Segment 6A3B3 M11 boundary resolver`
Run: `36873526718`
Validated head: `82efacdec981e46dc948003638934722fb22c4db`
Result: SUCCESS.

Deterministic resolver assertions, no-production-import assertion and full production build are green.

## Scope limit

This resolver is exact only for tariff points with independently verified spatial anchors in the current spatial snapshot. It does not infer missing 15–58 boundaries or missing 58–679 anchors from route kilometre/order metadata. Cross-system and unsupported-boundary routes therefore remain unresolved until the fixture gate explicitly proves their safe behavior.

## Next

6A3B4 fixture gate: exercise full/cross-system/15–58/58–679/candidate-only/non-M11/ambiguous cases and prove that unsupported spatial coverage remains `unresolved` rather than being guessed.