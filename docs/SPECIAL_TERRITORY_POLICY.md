# Special-territory routing and pricing foundation

The confirmed tariff zones are Donetsk, Luhansk, Zaporizhzhia, and Kherson. Crimea is an ordinary-rate area and a possible routing corridor. The working zone should use the complete administrative polygons of all four oblasts, including land beyond the current line of contact. It must not follow a live or estimated frontline, and it must not imply that every road inside the polygon is safe. Endpoint classification must use geocoded coordinates against reviewed boundary polygons; address text alone is not a classification source.

`lib/special-territory-geometry.ts` provides the geometry and candidate-selection primitives. It requires exactly four polygons with source URL, source title, review date, and `verified: true`. It rejects ambiguous points on a boundary, overlapping zones, malformed geometry, and route segments that run along a boundary. It then splits the selected route geometry and scales those distance shares to the routing provider's distance so ordinary and special mileage add up exactly.

The current live route providers return a route-level duration, not per-edge travel durations. The splitter therefore reports `timeIsEstimated: true` and distributes duration by geometry distance. That estimate must not be used to enforce the 50% Crimea comparison: `qualifiesCrimeaAlternative` and `selectSpecialTerritoryOptions` default to refusing that comparison unless the caller supplies verified time evidence. Before wiring those helpers into the calculator, the router must expose segment durations (or another reviewed way to measure cumulative time inside all four territories).

`data/special-territory-boundaries.json` now contains the four oblast polygons selected from the user-supplied OCHA COD-AB Ukraine ADM1 GeoJSON: UA14, UA44, UA23, and UA65. The source layer is version v05 and marks these boundaries valid on 2025-09-01. The source coordinates are CRS84 longitude/latitude. The exact polygon geometries and source properties are retained. Attribution: UN OCHA / HDX, Ukraine Common Operational Dataset – Administrative Boundaries (COD-AB), v05; CC BY 4.0. See `data/SPECIAL_TERRITORY_BOUNDARIES.md` for source and extraction notes. `lib/special-territory-boundaries.ts` maps those source codes to the calculator's four internal IDs and validates the loaded set.

The official route information found for the DNR–Crimea land route describes organized freight transit and restrictions, not a general passenger-car corridor. Do not label it as an approved public corridor or route all passenger trips through it. The data and geometry primitives are not active in production: route-time evidence and efficient route-boundary intersection still need to be connected safely before runtime integration.

Run the synthetic geometry contract tests with:

```sh
node --experimental-strip-types scripts/special-territory-geometry.test.ts
```

The test polygons are fabricated and verify algorithm behavior only. They are not real territory boundaries or route guidance.
