# B04 exact OSM coordinate/topology intake

Status: DONE for exact OSM identity/topology; official kilometre, operator scope, and fare remain blocked by missing reliable data.

This bounded source intake contains exactly two nodes and four ways for the already proven pending M-4 directed pair. The primary source is the OpenStreetMap API 0.6; data is attributed to © OpenStreetMap contributors under ODbL 1.0.

The reviewed output intentionally leaves `officialKilometre`, `operatorScope`, and `fare` as `null`, with `runtimeEligible:false`. Exact OSM identity, coordinates, refs, and directed node membership do not establish an official kilometre, operator charging scope, or price.

No route replay, router request, tariff update, runtime integration, or feature-switch change is part of this evidence block.

Focused verification: `node verify.mjs` → PASS, 15 assertions, 0 live requests. Exact hashes and NOT_RUN checks are recorded in `verification.json`.
