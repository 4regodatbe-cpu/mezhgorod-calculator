# M-12 Segment 5B2D-4D1 — API pricing truth result

Date: 2026-09-30
Branch: `optimize-calculator-2`
Status: COMPLETED

## Defect confirmed

The previous user-API diagnostic for Kazan -> Vladimir returned `tollValidation.status=unknown` while serializing `amount=0`, `weekdayAmount=0`, and `weekendAmount=0`. That violated the project invariant `unknown != exact 0 RUB`.

## Failed approach retained as evidence

A first attempt tried to solve the problem inside the M-12 production adapter. It was rejected by the gate. A production-parity maneuver probe then proved that Kazan -> Vladimir is currently routed by Valhalla over M-7 / E22 (635.747 km), not M-12. Therefore M-12 correctly did not own this result; the defect was generic API truth semantics.

Probe:
- workflow run: `36775141793`
- result: no M-12 maneuver span; M-7 / E22 named maneuvers present.

The rejected M-12-local serializer was removed before the accepted implementation.

## Accepted implementation

Commit: `465b9c8b35a5cc478adc5d1e80145f314f13a22f`

The final `/api/v2/calculate` boundary now serializes toll pricing with an explicit status:

- `priced`: a positive toll price is available;
- `free`: zero is exposed only when toll validation independently proves the route free;
- `unknown`: unresolved zero-like internal estimates are serialized with `amount=null`, `weekdayAmount=null`, `weekendAmount=null`.

Internal `TollEstimate`, M-4/M-12 cores, recovery arithmetic, and route selection were not changed.

## Gates

### Unknown truth promotion

Workflow run `36775509753`: SUCCESS.

Passed:
- patch application;
- production build / TypeScript;
- local production server;
- strict Kazan -> Vladimir unknown-pricing assertion;
- branch commit/push only after the gate.

### Exact M-12 regression

Workflow run `36775715331`: SUCCESS.

Passed existing user-API regression groups A and B (8 exact route controls).

### Cross-road regression

Workflow run `36775927558`: SUCCESS.

Passed:
- M-4 exact controls;
- M-4 + A-289 mixed controls;
- non-M4 routing-distance guards;
- strict free/freeCandidate truth regression.

## Invariant after 4D-1

At the API boundary a missing/unresolved toll price can no longer be represented as exact numeric zero unless the route has independent `free` validation.

## Next

Segment 5B2D-4D2: make the V2 UI, copy output, dual-route logic, and route analytics preserve the same `priced | free | unknown` semantics without coercing nullable money back to zero.
