# Segment 6A3B3 — deterministic M-11 boundary resolver plan

Date: 2026-10-01
Branch: `optimize-calculator-2`
Status: STARTED
Production `main`: unchanged.

## Goal

Resolve current M-11 58–679 tariff-point crossings from strict M-11 road evidence plus actual route geometry and independently verified facility anchor sets. Return boundary identity only; no money.

## Algorithm

1. Reject candidate-only evidence: at least one strict M-11 block is required.
2. Reject malformed strict evidence.
3. Map strict-block begin/end coordinates onto the supplied route geometry and form conservative strict geometry index intervals.
4. For every verified spatial anchor, find its nearest route-geometry vertex and distance.
5. Accept an anchor hit only when it is within the configured distance threshold and its route index lies inside a strict M-11 interval.
6. Collapse multiple physical anchors of the same tariff point into one crossing at the earliest route index.
7. Sort crossings by route order; the first distinct tariff point is entry and the last distinct tariff point is exit.
8. Fewer than two distinct verified tariff points => unresolved.
9. Return explicit unresolved reasons; never guess from route kilometre values, candidate clues or point order alone.

## Success criteria

Deterministic fixtures prove:
- p58→p593 and p58→p679 direction;
- reverse direction from reversed geometry;
- multiple p58 booth anchors collapse to one tariff point;
- candidate-only evidence cannot resolve;
- malformed strict evidence cannot resolve;
- one-anchor-only route remains unresolved;
- unrelated geometry remains unresolved;
- output contains no monetary fields.

## Safety

No production API import in this segment. No tariff selection. No March/current money mixing.

## Next

6A3B4 fixture gate over broader route shapes/ambiguity cases, then 6A3C pure tariff-selection core using only resolver results and explicitly covered current tariff cells.