# Offline regression set

Run from this directory (or use equivalent paths):

- `python3 ../M4_545/regressions/verify_geometry.py`
- `python3 ../M4_545/regressions/verify_route_case.py`
- `node ../M4_545/regressions/m4-545-route-history.test.mjs`
- `python3 ../M12/regressions/verify_mapping.py`
- `python3 ../M12/regressions/verify_raw_osm.py`
- `node ../tool.test.mjs` (diagnostic runner unit tests; does not call the API)

These tests validate source fixtures and fail-closed mapping behavior. They cannot establish undocumented tariff-product bindings. No API call is part of this test suite.
- `python3 REGRESSION_TESTS/verify_package.py` from the package root.
