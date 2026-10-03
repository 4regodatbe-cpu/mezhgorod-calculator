# Special-territory routing and pricing foundation

The confirmed tariff zones are Donetsk, Luhansk, Zaporizhzhia, and Kherson. Crimea is an ordinary-rate area and a possible routing corridor. The working zone should use the complete administrative polygons of all four oblasts, including land beyond the current line of contact. It must not follow a live or estimated frontline, and it must not imply that every road inside the polygon is safe. Endpoint classification must use geocoded coordinates against reviewed boundary polygons; address text alone is not a classification source.

`lib/special-territory-geometry.ts` provides the geometry and candidate-selection primitives. It requires exactly four polygons with source URL, source title, review date, and `verified: true`. It rejects ambiguous points on a boundary, overlapping zones, malformed geometry, and route segments that run along a boundary. It then splits the selected route geometry and scales those distance shares to the routing provider's distance so ordinary and special mileage add up exactly.

The current live route providers return a route-level duration, not per-edge travel durations. The splitter therefore reports `timeIsEstimated: true` and distributes duration by geometry distance. That estimate must not be used to enforce the 50% Crimea comparison: `qualifiesCrimeaAlternative` and `selectSpecialTerritoryOptions` default to refusing that comparison unless the caller supplies verified time evidence. Before wiring those helpers into the calculator, the router must expose segment durations (or another reviewed way to measure cumulative time inside all four territories).

No production boundary dataset is included. Candidate source review found a geoBoundaries open ADM1 dataset with 2017 boundary-year metadata and OpenStreetMap as its primary source; this is too old and not an official authority source for the requested production boundary set. UN OCHA's COD-AB dataset is a more recent administrative-boundary candidate, but its geometry and source metadata still need to be retrieved and reviewed before inclusion. The official route information found for the DNR–Crimea land route describes organized freight transit and restrictions, not a general passenger-car corridor. Do not label it as an approved public corridor or route all passenger trips through it. Until reviewed boundary data and passenger-route time evidence are connected, the existing calculator behavior remains unchanged and these primitives are not active in production.

Run the synthetic geometry contract tests with:

```sh
node --experimental-strip-types scripts/special-territory-geometry.test.ts
```

The test polygons are fabricated and verify algorithm behavior only. They are not real territory boundaries or route guidance.
