# Experiment 4: M11 Пешки–Тверь, 27.10.2026

Status: PARTIAL / directed exit resolved from retained evidence; full pair not admitted.
Source HEAD: e8b83a1a2bccee12ada8c49ee4ce5633eb2cbcd1. No live routing or new OSM request.

## Independent identity and directed traversal

| Tariff point | Official identity | Retained OSM evidence | Remaining ambiguity |
| --- | --- | --- | --- |
| p58 / Пешки | Солнечногорск and Солнечногорск-2, both58km | ways580575025,795559452,795563883; separate anchor groups | Which directed entry crosses which facility is not established for the requested pair |
| p147 / Тверь | Воскресенское147km; M10 interchange147km | named facility way795249782; nodes6588472831 (56.7331188,36.2530645),6588472832 (56.7339197,36.2537629) | Facility identity was already proved; opposite booth direction not proved merely by adjacent coordinates |

Official lists independently establish facility names and M10 junction identity:
[PVP list](https://unitoll.ru/roads/m-11/objects_m11/toll_plaza/),
[junctions](https://unitoll.ru/roads/m-11/objects_m11/traffic_junctions/).
Retained object evidence: `checkpoints/SEGMENT_6A3B2D_M11_OSM_OBJECT_INVENTORY_RESULT.md`, accepted run36848648128 / narrow context36849513645.
These are reused identities, not two new discoveries.

New cross-reference to retained selected-route trace: capture
`experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m11-ckad-noginsk-to-tver/2026-10-16T01-29-30-153Z-capture.json.gz`,
SHA256 `3235c04e3f0d95c30df518d159c3e47bce988a0c4a0b1b5700b5ee9e206f61b1`.
In `calls[4].text` parsed as JSON, ordered edges63–72 show:
M11 way1307036919 → junction3742581847 → way1301779282 → way1307036921 → **way1307036920 / booth6588472831** → way599932042 → way423187295 → way599934826 → **M10 way900434333**.
This identifies one directed M11→M10 exit through Воскресенское; not an entry, not booth6588472832. Node and approach-road IDs, sequence and independent operator junction identity jointly support it, without nearest-point matching.
The capture starts in Ногинск and joins via CKAD: it does **not** prove a p58 entry. Its retained replay reports `only_one_verified_boundary_crossing`; its whole-route amount remains null. Do not relabel it Пешки→Тверь.
Trace shape indices are local to matcher output; do not index the input request shape with them as if alignment were guaranteed.

## 149 is not a second inferred physical exit

`experiments/nationwide-tolls/source-snapshots/m11/2026-10-12-58-679-category1-a1-current.json` explicitly labels p147 as routeKm149 / pvpKm147 / Тверь. The operator junction list independently uses147. Thus149 is the tariff-product extent label in this source, not evidence of a new booth at149 nor a licence to offset coordinates by2km. Why the labels historically differ is not established by these sources.

## Applicable money, kept separate from geometry

The **later saved complete matrix**, not the obsolete incomplete October1 runtime snapshot, contains direct cells p58→p147 and p147→p58:610 monThu /750 friSun, CategoryI, cash/card (no transponder required). p58→p124 is460/570; it is not the same destination. These values were already transcribed; no new price is claimed.
Original retained order274: `experiments/nationwide-tolls/source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf`; retained verified calendar `order274-calendar-2026-verified.json` establishes effective04.09.2026 00:00MSK and tariff-day switch01:00. Original hash and transcription were not re-audited here.
[Operator change notice](https://unitoll.ru/about/press/news/izmenyayutsya-tarify-na-proezd-po-doroge-m-11-neva-/) confirms September4 change58–543. Lower-priority web overview750/770 must not replace the original order610/750. No claim that an undated later revision cannot exist; October15/17 retained replay context is after the confirmed effective date.

## Negative controls and exact missing evidence

- Reverse traversal: reciprocal monetary cell exists, but reversing this edge list does not prove an actually observed reverse journey or assign booth6588472832.
- Neighbor p124: distinct official interchange124km, distinct direct fare460/570. It cannot satisfy a p147 traversal.
- Full pair: missing directed p58 entry/approach graph linked to the same complete selected route. Multiple official58km facilities prevent automatic choice.
- Runtime comparison: `lib/toll-engine/m11-moscow-geometry.ts` imports a spatial snapshot without p147, although the older inventory proved the facility; therefore `facilityAnchors("p147")` is empty. `m11-moscow-production.ts` southbound branch additionally requires Moscow entry and must not be treated as a generic58→149 resolver. This is a precise evidence-consumption gap, not permission to change runtime.

Checks: `node --test experiments/tariff-proof-selection/m11-crosswalk.test.mjs`; offline assertions on exact capture bytes, ordered exit, tariff reciprocity, distinct neighbor and missing p58. No full pair admitted to compose; real priced-positive test would be unsupported.
Counters: new operator/OSM facility identities0; new directed route-to-existing-facility cross-reference1; new tariff boundaries0; full directed pairs0; new monetary components0; functional blockers removed0.
