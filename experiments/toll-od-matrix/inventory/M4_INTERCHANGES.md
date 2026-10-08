# Preliminary M-4 interchange discovery (not a verified node catalog)

As of 2026-10-08 collected **23** city-level access references from a June 2026 editorial guide and **30** additional roadside kilometrage references from MultiGO, total **53 raw observations** (not deduplicated physical interchanges).

- Sources: https://t-j.ru/m4/ (03.06.2026), https://hitroad.ru/trassa/M4 (checked 08.10.2026).
- The first group describes entries/exits near Moscow, Voronezh, Rostov, Krasnodar and Novorossiysk. The second group mixes turns, signed junctions, and regional access leads; **all entries are unverified candidates only**.
- Each candidate lacks an OSM access-node ID, verified direction, precise coordinates and gate correspondence. Therefore **0 of 53 are usable by `od-geometry.mjs`** and **zero new M-4 directed price pairs** are justified.
- The underlying operator's published M-4 charging policy is predominantly **open-toll**: actual payment depends on traversed PVP, and entry or exit off motorway before the PVP may not charge at all. Closed/mixed toll rules apply to 401–464 km and 633–741 km separately. See https://avtodor-tr.ru/company/docs/proezd/ and https://avtodor-tr.ru/info/legal-info/pravila-proezda/.
- This source list is for narrowing OSM topology lookup only. No pseudo-coordinate interpolations from km posts, nearest town, or road geometry are allowed.

## Planned automated validation

1. Query named interchanges against real OSM motorway/motorway_link graph, collect precise access-node/way IDs and coordinates **for both directions**.
2. Confirm continuous drivable connectivity between named ramp and selected M-4 carriageway, including direction-specific turning restrictions.
3. Resolve each verified transition against the exact selected route evidence; never accept a node merely because it falls within 35 metres.
4. Obtain official tariff rows for verified entry/exit pairs or complete validated operator receipts. No arithmetic reconstruction of unverified OD cells.

See `m4-candidate-interchanges.json` for structured input; the file remains isolated from production.
