# B06 M11 product composition — local regression PASS (28.10.2026)

Status: bounded V3 composition contract verified; operator/route binding remains PARTIAL.

`matrixM11GeometryComponent` composes the independently priced `m11-15-58` head and `m11-58-679` mainline. The existing adapter already ignores native money. Strengthened `experiments/nationwide-tolls/engine/m11-ckad-route-adapter.test.mjs` to assert both product IDs appear once, the final amount equals the sum of those two component amounts, and a detected but unresolved head keeps the full result null.

Check: Node v24.19.0; direct execution of the focused test file — 4/4 PASS; `git diff --check` PASS. No tariff values, price-period rules, route-selection logic, or application runtime code changed. No network request or route replay was performed.

The current adapter uses the established departure-frozen tariff policy. This check does not bind a specific physical 15–58 entrance/exit or prove a full real route's payment composition. B06 remains PARTIAL for that product/geometry evidence.

Local parent before this block: `2c7ccb5f1a508f6157c61cbfce440a4b3181e008`. Local only: no GitHub publication, readback, or CI verification.

Next: use only already saved route evidence or a new exact operator source to identify the 15–58 and 58–679 directed endpoints for one route. Do not infer payment from the nearest interchange label.
