# Experiment5 — three saved routes and boundary methods

27.10.2026. Source eb68ca949858319a9c0574c5d3a65aff50f7af6d; documentary checkpoint/tree/files readback verified, CI40497845768 SUCCESS. PARTIAL / no public integration.

## New geographical screen, not an invented cut

To inspect the locality containing independently retained58km anchor groups, use a deliberately broad diagnostic rectangle lon37.02–37.10,lat56.12–56.17. The rectangle has **no tariff authority**; touching or crossing it never admits a quote. All samples below are existing selected route coordinates, not interpolated chainage or new routing. Indices are original `record.route.coordinates` indices, not trace shape indices.

Base: `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/`.

| Saved capture | Locality samples, inclusive indices | Directed movement | Product applicability |
| --- | --- | --- | --- |
| pair-m11-ckad-noginsk-to-tver/2026-10-16T01-29-30-153Z-capture.json.gz |36;857–892;37.099926,56.136998→37.022794,56.144105 | Northbound, known147 exit6588472831 | Candidate58→147 through virtual interface, despite earlier CKAD entry. Actual boundary crossing still unproved. |
| single-m11-tver-to-moscow/2026-10-16T00-21-53-115Z-capture.json.gz |37;838–874;37.022729,56.143923→37.099800,56.136882 | Southbound, known147 entry6588472832 | Candidate147→58 through virtual interface; lower section must be separately priced and proved. |
| single-m11-moscow-to-tver/2026-10-16T00-21-05-808Z-capture.json.gz |36;824–859;37.099926,56.136998→37.022794,56.144105 | Northbound, unknown exit12007034961 | Cannot assign58→147 or58→159; destination-city label does not identify exit. |

All three retained validations are complete (two trace chunks each); provider selection differs (Valhalla,OSRM,OSRM). Full trace does not establish legal product coverage or latest fare applicability. Original hashes and physical147 controls are retained in M11_PHYSICAL_CROSSWALK.md / M11_DIRECTION_CONTROLS.md and not re-audited here.

**Clarification of experiment4:** “CKAD→Тверь does not prove a physical p58 entry” remains true, but is NOT evidence that the journey cannot contain the p58→p147 product. A virtual transition could divide an earlier-entry journey. Likewise no58km booth event does not establish absence of that product. This narrows a methodological false-negative risk without claiming a live-code defect or a new admissible tariff.

## Exact information gap, not a tracing outage

Retained58km evidence consists of official facility names/rounded distances, coordinates of booth anchor groups, and a context summary with named parent ways580575025/795559452/795563883. The original parent-context collector `scripts/segment6a3b2d-m11-osm-parent-context.mjs` uses `out center tags`; it does not preserve full way-node order in that response. The summary is insufficient to turn facility proximity into a directed mainline cut.

Retained trace requests include way IDs, toll flags, names, shape indices and end-node IDs; `shape_match:walk_or_snap`. Responses contain `units,edges,alternate_paths`, no matched `shape`. Do not correlate an output shape index with an input or global route index without a documented alignment guarantee. Mainline continuity/branch position is available only as an ordered path, not an officially partitioned tariff domain. A vehicle path passing this locality cannot resolve which accounting interface cut the operator means.

Needed: dated operator interface/section plan distinguishing mainline and both Солнечногорск facilities, authoritative15–58/Section1 product mapping and direction, and corresponding full OSM parent-node order/exact anchors. Alternatively a certified directed corridor partition can establish unavoidable passage without a single point coordinate. No paid-boundary coordinate is invented here.

## Methods A, B and C

| Method | What it can prove | Failure / false positive risk | Current result |
| --- | --- | --- | --- |
| A: physical booths for every product endpoint | Observed directed access/exit where actual booths exist | Misses virtual internal boundaries; a booth near a route or shared facility number is not sufficient |147access/exit observed,58internal endpoint missing; cannot alone close product |
| B: directed certified section cut | Entry/exit of a documented operator domain, even without booth | Wrong carriageway, nearby parallel ramp, coarse geofence, incomplete trace or uncertified cut can misclassify |No certified cut data; detector NOT implemented |
| C: unique certified through-section path | Given independently identified outer endpoints and exhaustive branch/path evidence, prove unavoidable traversal of a product | Requires official domain partition and no unresolved alternate connector; a named M11 edge chain is insufficient |Promising for CKAD→147 and147→Moscow, but domain bridge still missing |

No need to require a physical toll booth at a virtual boundary. Conversely, replacing a missing booth with a proximity rectangle is not proof. Keep `unknown/null` if any required product/direction/date/class/payment/version or full-coverage evidence is missing. Original610/750 matrix cells were not rechecked or modified. Absence of a later applicable tariff revision remains separately unproved for a fresh2026-10-27 quote; don't turn a retained October capture into current tariff monitoring.

## Other roads and next independent work

B/C can be applied in principle to M4, M12, CKAD and ZSD only with their own operator domains, exact directions/ramps and charging rules. M11 rules do not authorize transfer. M4 may have different products at545 and distinct collection areas; M12/CKAD need frame/entry-exit product definitions; ZSD needs zone and interchange transitions. Partial route coverage must never imply a full amount.

No located new boundaries, full pairs, eligible monetary components or functional blockers closed. No detector is justified on present certified inputs. Next independent bounded lead: M3 official operator collection-scope/pair evidence, using retained prior-blocker result first; only new primary material, no repeat of failed sources or route audits.

Check: `node --test experiments/tariff-proof-selection/m11-virtual-route-review.test.mjs` verifies the new locality/direction screen against three actual captures, complete trace metadata and missing matched-shape contract. It does not assert a boundary crossing or priced amount. `git diff --check`.
