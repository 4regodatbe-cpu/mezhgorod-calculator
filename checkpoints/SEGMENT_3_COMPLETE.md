# Segment 3 — strict free-route truth — COMPLETE

Date: 2026-09-30
Branch: `optimize-calculator-2`
Validated UI/head commit: `bc7916ce9095b5404c811d0c983f9d269650f31c`

## Result

The calculator no longer treats an avoid-toll route-provider result or an `unknown` validation result as proof of a toll-free route.

API truth model:
- `free` is returned only for an independently validated route with `tollValidation.status === "free"`;
- an alternative whose toll status is not proven is returned separately as `freeCandidate`;
- `freeCandidate` is never used as proof of a free route, never feeds toll-difference evidence, and never substitutes for a confirmed `free` route;
- the verified/known-route table remains a distance/time reference and is not treated as toll-free evidence.

UI truth model:
- confirmed free routes keep the green `Без платных дорог` presentation;
- unverified alternatives are shown separately in an amber `Альтернативный маршрут / Платность не подтверждена` card;
- unverified alternatives are not automatically used in optimal-route selection, dual-tariff calculation, or analytics as a `Бесплатный` route;
- copied text for an unverified alternative carries an explicit warning that possible toll cost is not included.

## Valhalla capability finding

Dedicated probe against `valhalla1.openstreetmap.de` proved that hard toll exclusion cannot be relied on on the current public instance.

Observed warning:
`208 — Hard exclusions are not allowed on this server, ignoring hard excludes`

Therefore `exclude_tolls:true` is not accepted as proof of toll-free routing on this deployment. `use_tolls:0` remains only a candidate-generation preference.

## Regression evidence

Dedicated workflow: `Segment 3 free-route truth`
Run `36699567088`: SUCCESS after the UI change.

Earlier strict API run `36699030877`: SUCCESS.
Observed controls:
- Москва → Краснодар: `free=null`, `freeCandidate=1450.0 km`, validation `unknown`;
- Москва → Сочи: `free=null`, `freeCandidate=1740.0 km`, validation `unknown`.

Assertions:
- fast route exists;
- unverified control route is not exposed as `free`;
- unverified alternative is preserved separately;
- unverified alternative remains `unknown`;
- confirmed and unverified alternatives are mutually exclusive;
- API explains why the free route is withheld.

## Safety invariant now enforced

`unknown`, timeout, missing geometry, provider preference or control-database presence must never be presented as confirmed `Без платных дорог`.

## Next

Segment 4: benchmark and reduce unnecessary public-Valhalla map matching. First measure whether route-shape proximity to known M-4 PVP anchors can safely resolve a subset of candidates without a second remote `trace_attributes` request. Do not change production evidence thresholds until a probe demonstrates a clean separation between confirmed and rejected cases.
