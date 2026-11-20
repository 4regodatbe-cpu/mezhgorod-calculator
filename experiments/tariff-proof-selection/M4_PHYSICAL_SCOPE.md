# Experiment4: M4 physical vector, 27.10.2026

PARTIAL / no monetary admission. Parent remote182a365a33c1c5d7dc38c2a0923f817b6a96486e; M11 checkpoint readback verified. CI40489676480 verify/classifier SUCCESS, live_probe/calculation_timing SKIPPED before publication.

## Saved topology versus operator scopes

Use `experiments/road-ref-boundaries/checks/2026-10-24-b04-osm-coordinate-intake/reviewed-identity.json`: directed entry4443232947 at47.5105556,39.9708171 joins way447135768→1182567076 from Platov access; exit358467208 at48.186303,40.265878 leaves1211606940→28835034 for Р-260. These identities were already proved; do not count them new or assign1038km because an airport is nearby.

**New bounded geometric exclusion:** the original selected route in Granitnoe capture from `M4_GRAPH_ENDPOINT_REGISTER.json.pending[0].topologySources[0]` contains each endpoint once at six-decimal source precision. Inclusive indices1877–2328 yield452points, latitude47.510556–48.186303, longitude39.967785–40.265878. This uses exact rounded coordinate equality, not a nearest-point choice or inferred kilometre scale.

`data/m4-pvp-osm-partial.json` independently retains named1093 nodes5325424715/5325424716 at latitude47.0132374/47.0131472. Both lie strictly outside the entire segment latitude interval by at least0.4973186degrees. No polyline edge in this interval can cross those retained booths. This rules out a **physical1093 crossing of this vector only**, not all toll liability, unknown gantries, the full journey or a legal section boundary. No distance interpolation or monetary inference is used.

## New operator source cross-check

[United Operator1093](https://uoperator.ru/pvp-1093/) explicitly assigns1091.6–1119.5 to1093, CategoryI150/150; [operator home](https://uoperator.ru/) confirms section4 responsibility. Page read27.10.2026, no effective date/order attached in extracted text. Amount is an undated corroborating observation, not a newly dated eligible fare. Existing original order58 was NOT re-audited or extrapolated to October. OSM's old generic operator tag is not legal authority and does not override the operator's own scope.

[OSSP PVP inventory](https://unitoll.ru/roads/m-4/objects_m4/toll_plaza/) separately identifies1045 and both545 products (517–544 and544–589). [OSSP junction list](https://unitoll.ru/roads/m-4/objects_m4/traffic_junctions/) identifies1024 Новоперсиановка,1038 Новочеркасск/Ростов,1051 Новочеркасск/Аксай. It does NOT bind target OSM IDs or Platov transition to those chainages. Keep1045 facility naming distinct from tariff label1046 until independently reconciled.

545 has two products under one PVP number: product identity remains necessary even if booth identity is known. No new lane-to-product proof was obtained. Existing blocked-source record `experiments/nationwide-tolls/checks/2026-10-18-m4-545-operator-source/result.json` is reused, not rerun. Neither545 nor1093 is assigned to the pending vector by a name/radius or by summing table rows.

## Exact remaining gaps

| Question | Evidence now | Missing proof |
| --- | --- | --- |
| Is1093 physically crossed within this vector? | No, exact saved route interval excludes its retained booth coordinates | None for these two retained booths; not a proof of every possible tariff mechanism |
| Is entry inside1024–1091 legal paid scope? | Platov access OSM edge identity and operator scope separately known | Operator interchange map/road passport connecting this exact directed ramp to official chainage and charging rule |
| Where does applicability end before Р-260? | Exact directed exit, no official km | Official boundary/charging coverage linked to exit and intervening route |
| Does1093 have an October applicable direct fare? | Current undated operator observation150/150 matches retained March original | Dated applicability/version evidence; physical applicability to requested route absent |
| Which545 product applies on a route? | Two separate official product scopes | Directed lane/ramp-to-product mapping and dated tariff applicability |

Result remains unknown/null; new full pairs0, new dated monetary components0, new tariff boundaries0, functional blockers removed0. One new geometric exclusion reduces the candidate hypothesis set. No runtime/data tariff changes, live routing, broad audit or original-PDF revalidation.

Check: `node --test experiments/tariff-proof-selection/m4-scope.test.mjs` verifies original capture integrity, unique endpoint matches, exact interval and1093 exclusion; `git diff --check`. Next: seek a saved complete M11 Moscow↔Тверь traversal for directed58km facility assignment, before trying another incomplete source family.
