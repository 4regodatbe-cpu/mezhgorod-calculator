# M-12 physical/tariff crosswalk findings

The retained operator category-I matrix/order 302 (effective 2026-10-08) defines adjacent tariff rows at the named RVP markers 281, 314, 392, and 420. It does not make a coordinate or physical exit ID for those markers available to this diagnostic case. The calibrated physical toll-frame anchors at tariff RVP labels 281, 314, 392, and 420 are retained with coordinates and OSM node IDs in `sources/rvp-calibrated-anchors-2026-09-30.json`. These are physical toll-boundary anchors, distinct from nearby highway interchange exits. The labels 287, 318, and 395 have no retained primary source/tie point in the inspected checkout and remain `UNKNOWN`. Separately, Mintrans legal inventories list a 442-km R-158 interchange (2022 and revised 2026) and the 2022 inventory lists a 421-km 22Н-0239 crossing; the 421 entry was not identified in the revised 2026 inventory. The selected exit on 22Н-0239 is not the 442-km R-158 exit. None of those legal kilometrage facts alone binds an operator tariff endpoint.

Existing route/topology evidence proves two different physical exits:

- Arzamas case: one-way exit ways `1550135076→1550561305→1206479738`, then road 22Н-0239. Candidate operator stop `arzamas_p158` remains unbound; 2,952 RUB is an unused candidate, not a confirmed toll.
- Cheboksary case: ways `972809728→972809720→292501171` to M-7. Candidate operator stop `vladimir` remains unbound; 1,239 RUB is not selected. Destination name does not prove a 281/314/392/420 boundary crossing.

For the two previous 281–314 and 392–420 API windows, the local checkout contains planning/user summaries, not a complete raw 2GIS request/response payload suitable for reconstructing a new exact boundary crosswalk. Do not replay them. Existing offline route and OSM proofs remain useful only within their recorded scope.

Algorithm contract: resolve a physical directed boundary to an operator tariff endpoint by explicit, source-versioned crosswalk. No nearest-kilometre matching, no automatic offset, and no summing adjacent prices to manufacture an OD fare. Until the crosswalk is proven, return unknown/null.
