# Nationwide toll-road calculation decisions

## 2026-10-09 — user mandate
User instructed: cover **all other Russian toll roads**, not M-4 only. Existing M11/M12/CKAD/A289 engines remain authoritative as currently implemented; national coverage extension must not regress them or claim completion when only catalogued.

## 2026-10-09 — safety, pricing semantics, scope
1. Separate **road network inventory**, **official selected tariff row**, **route-level evidence** and **money actually applied**. One must not imply the next.
2. Vehicle operator class I (physical dimension/axles) is distinct from passenger transfer tariff "Standard/Comfort/Comfort+".
3. Operator billing differs fundamentally by network: flat single camera, physical gate, entry/exit OD, time/day/holiday, distance, special transit, overlapping toll systems, and operator payment product. Never force one fixed RUB/km model.
4. Unknown paid component => **whole route toll amount unknown, not 0 and not partially priced**. Even an empty paid event list does not certify free without independent route validation.
5. Refuse charging an operator tariff without selected-route full coverage and exact verified facility identity. Input from this offline core is not public user-controlled data. No integration of mocked proof to actual customer invoice.
6. Current reference 8 operator fare networks are **operator published snapshots**, not end-to-end route tariff guarantees. For sources without a known start date, quote only the 2026-10-09 audit date; for future dates after snapshot, return unknown. No transponder discount unless mode supported with versioned source.
7. M4 PVP first/last + every intermediate + mixed-state rules remain separately experimental, 0 official matched full corridor monetary rows. Do not disturb that branch's work history.
8. All next changes must be documented in Git according to `AGENTS.md`; Preview only until proved ready and explicitly release-authorized.

## 2026-10-09 — first bidirectional exact physical M3 PVPs; diagnostic 800RUB only

- Map matching selected-route Valhalla `edge.toll=true` with a concrete OSM toll booth node is admissible **physical passage proof** only if separately cross-checked against OSM API `barrier=toll_booth`, exact official operator kilometer/name, and same-route consistency. Six M3 names/IDs pass, M1 remains unverified.
- A **three-gate M3 sample amount** derived from time-limited 2026-10-09 published category-I/no-transponder source rows can appear **only as shadow**; it is **not** automatically included in actual transfer pricing. Real current operator tariff effective date, full corridor bill, mixed multi-road total and any extra ramps require stronger proof.
- Keep cost unknown instead of adopting an unverified 800RUB live value, even when 3/3 physical booths found. Source-proven gate identity and validated complete operator fare are distinct.
