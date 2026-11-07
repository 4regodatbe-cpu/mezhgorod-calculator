# Runtime contracts for safe toll attribution

- A route segment has explicit road-system ID, entry boundary ID, exit boundary ID, direction, vehicle class, payment mode, effective edition and rate profile.
- Boundary resolution must precede tariff lookup. A physical OSM gate/gantry/exit is not an operator tariff endpoint without a dated crosswalk.
- Each operator pair is directed unless the primary schedule explicitly proves symmetry.
- Missing / ambiguous / partial evidence returns `unknown` with `amount=null`; it must not become zero or a nearest-match fare.
- Aggregate routing-provider payments do not identify operator tariff products and are not tariff evidence.
- No adjacent-row addition without an operator rule proving cumulative charging.
- M-11 15–58 fare profile and edition should use the actual known entry/exit IDs; departure-time estimate can differ from actual exit-PVP passage time across a boundary.
- M-12 kilometre labels must not be matched by numerical proximity; use stable physical IDs and exact operator mapping.
