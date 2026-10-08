# M-4 source inventory and OD readiness

Generated 2026-10-08 from `sources/m4-data.ts` and `sources/m4-plaza-nodes.ts`, both copied unchanged from working V2 commit `64631d23dc7ca44febafb9ebf1136162c7af9e82`.

**Diagnostic result:** 17 open-plaza tariff rows, 16 distinct open payment facilities, 2 mixed entry/exit systems, 20 distinct PVP kilometre points across models; 20 have copied coordinate anchor groups. Missing anchors in copied node list: none.

**Important:** payment-facility kilometre points are not automatically the geographic positions of motorway **entry ramps / exit ramps**. None of these records authorizes pricing an arbitrary journey by first PVP / last PVP. Verified directed M-4 OD pairs currently **zero**. Open-plaza price rows are preserved only as reference amounts. Mixed systems are not unfolded into independent charges.

## Risks already evident

- 339 and 355 km are alternate payment facilities in a directional receipt arrangement: adding both can overcharge.
- At km 545 there are two tariff source rows associated with a single physical PVP, not two independent PVPs.
- Zones 401–464 and 633–741 km have entry/exit context and transit-window rules; tariff depends on verified movement, not simply the count of PVPs.
- The 460-km OSM data contains two separate geographic anchor clusters that cannot be averaged.
- Full corridor Moscow—Krasnodar is not an arbitrary ramp-pair price: `sources/full-routes.ts` is source evidence only.

## Pending verification before OD matrix

1. Inventory actual on/off ramps accessible in each travel direction and attach georeferenced entry/exit IDs; distinguish entry/exit gates from payment plazas.
2. Fetch and version official current directed tariff matrix for every possible pair if available; separately mark missing or variable-price rows.
3. Correlate each selected route's geometry with crossings and multiple disjoint paid traversals.
4. Compare against the existing full-corridor control and exact real itineraries without manufacturing prices to fill unknown gaps.

See `inventory/m4-payment-facilities.json` for the extracted snapshot. **No M-4 price is used by the new engine yet.**
