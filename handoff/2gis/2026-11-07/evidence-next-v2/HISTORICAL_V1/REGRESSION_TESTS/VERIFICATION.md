# Verification record

Executed offline on 2026-11-07 under Node.js v24.19.0 / Python 3.12.14. No network calls were made.

- `REGRESSION_TESTS/verify_package.py`: PASS — 98 manifested files, JSON syntax and checksums valid.
- `M4_545/regressions/verify_geometry.py`: PASS — 3 chains, 3 gate nodes, 0 tariff assignments.
- `M4_545/regressions/verify_route_case.py`: PASS — observed directed gate 5818209495, 0 confirmed tariff products, fare null.
- `M4_545/regressions/m4-545-route-history.test.mjs`: PASS — 11/11.
- `REGRESSION_TESTS/tool.test.mjs`: PASS — 13/13.
- `M12/regressions/verify_mapping.py`: PASS — 4 tariff rows, 4 physical labels, 0 automatic matches.
- `M12/regressions/verify_raw_osm.py`: PASS — 9 OSM objects and XML/metadata valid.

The tests verify retained evidence and fail-closed behavior only. They do not establish unresolved tariff bindings.
