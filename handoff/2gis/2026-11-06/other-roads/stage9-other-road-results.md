# Stage 9 — geometry evidence handoff: M-4 → CKAD/M-12 → ZSD

Date: 2026-11-06. Branch `codex/2gis-diagnostics`. Starting HEAD `79a09e81ce858874106b1d4af43ec1066380e8a9`; working tree clean. Scope: independently documented road geometry and evidence handoff. No tariff/runtime integration in this stage.

## A. Stage 8 handoff — verified locally

The exact Stage 8 packet is included at `../m11-stage8/patches/stage8-original-packet.tar.gz`, SHA-256 `310d3b70f53e79057e45927beb3edf448f08ca0a17200f782e1eb8f40f223918`. Its original internal manifest was verified before packaging. The inner `source-files.tar.gz` expands to the documented Stage 8 files; the patch was checked, applied, and reverse-checked in a temporary shared clone based on `3a000f64c82a7e89715cdea09a13e1edf9354bef` (17 changed paths, 12 textual stat entries plus additions/binary file). No files in the working checkout were changed by this validation.

The published implementation commit hash in the transfer document is mistyped: the local object is `136a5a72f76076188b3768897951a2b700a3d728`, not `136a5a72f1488ce7617d55e9f09648f3376d2ba7`. Handoff commit `79a09e81ce858874106b1d4af43ec1066380e8a9` matches. The reported bundle and source evidence are present. Stage 8 includes M-11 tariff/runtime integration changes inherited in this branch; they are explicitly for the primary curator to review/integrate. This geometry branch makes no additional tariff/runtime change and does not push or merge them.

Stage 8's M-11 source/result, 42 directed pairs / 210 cells, 60 changed values, effective timestamp 2026-11-02 01:00 MSK, historical edition, test/build results and departure-time-vs-exit-PVP limitation are recorded in `STAGE8_RESULT.md` and `docs/checkpoints/2026-11-06-2gis-stage8-m11-tariff-fix-DONE-LOCAL.md`. Stage 8 made no 2GIS calls. The prior 338 MB bundle remains untouched.

## B. M-4 — physical branches at PVP545 and prior PVP62–71 pilot

### M4-545-NB-BYPASS

Status: `PARTIAL` (directed physical branch proven; operator product/price unknown).

- Road/object/direction: M-4, northbound, southern cash gate on the bypass-side branch at PVP545.
- O-D: `[39.5547146, 51.4701519]` → `[39.5546944, 51.4703840]`, on one-way OSM way `615270691`, ordered node `5818209500` → toll-booth node `5818209495` → `5818209499`.
- Source says the gate node is named `ПВП 545 км`; the full local directed-map snapshot, node/way versions, SHA and ODbL attribution are in `experiments/tariff-proof-selection/m4-545-directed-osm.json`. The retained plan crosswalk maps this to the southern northbound additional-cash approach, distinct from northern gate `3504914294` and older-road gate `9620416636`; see `M4_545_ENGINEERING_CROSSWALK.md` and `candidate-evidence/m4-545-northbound-bypass-gate.json`.
- O-D chord/source segment is about 26 m; allowlist maximum 2 km, well within the 50 km demo limit. This tiny segment is a gate traversal probe, not a full 517–589 journey.
- Hypothesis for the prepared 2GIS request: fastest route between consecutive points on this directed branch follows the intended booth and the response exposes geometry/payment fields. Confirmation requires a returned line crossing the same branch/booth and coherent event presence; refutation is route failure or path on a different carriageway/branch. A response aggregate cannot identify tariff product or assign 517–544 vs 544–589.
- API status: `NOT_RUN` here; the earlier live execution was stopped by the existing exact-window approval gate before network. No ledger attempt or debit was created. Do not refresh the approval timestamp or bypass the gate.
- Operator's 2016 notice supports two distinct route products at the PVP; it does not bind this lane to either or prove current effective fare. The retained 2023 plan set likewise does not show the whole 544–589 boundary. No price or component may be inferred from `320/410`, physical proximity, or a 2GIS aggregate.

### M4-62–71 historical pilot

The 03.11.2026 pilot case is accepted as already performed; it was not repeated. Existing summary identifies 151 route geometry vertices, but raw geometry/complete request ledger is absent in this checkout. It is therefore historical diagnostic evidence only, not a newly reproducible gate-to-product proof. Review the retained M-4 source and tariff assertions at `experiments/2gis-diagnostics/PLAN.md`, `CANDIDATES.csv`, and `STAGE7_FINAL.md`; no second query was needed to determine that it must not be repeated.

## C. CKAD / M-12 — preserve the unknown, use saved boundaries

### CKAD-M11-M12

Status: `UNKNOWN` for the prior API outcome and permanently no-replay under the existing per-window policy. The one attempt timed out without an HTTP response; owner counter readback was 991 both before and after (observed delta 0). This does not convert the missing route response into a successful or failed route. The local runner's `ckad-m11-m12` reservation remains `outcome_unknown`. No repeat was made.

The earlier physical directed witness is source-backed in `experiments/nationwide-tolls/source-snapshots/ckad/2026-10-17-m11-m12-binding/physical-directed.json` and `binding-proof.json`, with ordered OSM one-way ramps, gate nodes and the named M-11 → M-12 path. It supports physical binding of the interchange, not recovery of the timed-out 2GIS geometry/payment output or a new fare assertion.

### M12-WESTERN-EXITS

Status: `PARTIAL` (two physical exits proven; operator point binding unknown). Reuse the saved 9-object OSM boundary review in `experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/`:

- Primorsky → Arzamas: directed ways `1550135076 → 1550561305 → 1206479738`, shared junction nodes `14102954884` and `10090995838`, exiting to road `22Н-0239`; candidate operator point Arzamas (P158) is unproven.
- Primorsky → Cheboksary: ways `972809728 → 972809720 → 292501171`, nodes `10026978937` and `14216395535`, exiting to M-7; candidate Vladimir product is unproven.
- All three observed M-12 gantries in the bounded review have only `highway=toll_gantry`, no operator identity fields. Operator's exact linked M-12 track returned `operatorBindingsConfirmed: 0`.
- Neither a tariff label, nearby OSM point, one `toll=true` edge, nor historical amount establishes the paid boundary/product. Existing partial subtotals remain partial; `fullTrip=null` and unconfirmed cases stay unknown. Saved checks established no new operator mapping, so no source/API/route replay was repeated.

## D. ZSD / Pulkovo — reuse Stage 7 and official rule evidence

### ZSD-RVP64

Status: `PARTIAL` (physical identity/boundary evidence; no cash/card product attribution).

- Reuse the one completed Stage 7 request `zsd-rvp64-exit`; do not repeat. It returned HTTP 200, route OK, 176 m/17 s; the redacted reducer found 3 geometry lines/9 vertices and nearest vertex 26 m from saved node `13020687195`. Raw geometry was not retained, so exact gate/lane intersection is not independently inspectable.
- Independent OSM source review identifies node `13020687195` on one-way way `351741889` as RVP-64 / `ref:rutoll=64E`, coordinate `[30.2224424, 59.9615898]`, operator MSS. It is a gantry/boundary point, not a confirmed separate toll plaza.
- The retained order for Shkipersky interchange names RVP571/581/59/60, not RVP64. No mapping from RVP64 to that separate tariff or its 13/6 RUB amounts is admitted. The rule for barrier re-entry between Avtomobilnaya and Blagodatnaya requires the linked receipt and specified time limit; it is not a general ZSD re-entry exemption.
- Response payment fields were absent/unavailable (`null`), not zero. Neither free passage, a fare, repeated-payment behavior nor a tariff defect follows from this short test.

## Cross-case conclusion / handoff boundary

- Evidence supports a precise M-4 southern northbound gate branch, CKAD/M-12 interchange geometry, two M-12 physical exit chains, and the identity of ZSD RVP64. It does not independently map the M-4 lane to a 2026 tariff product, either M-12 gantry to an operator charged boundary, or RVP64 to a separate toll product.
- No tariff, route-selection, or production runtime patch is proposed from these cases. Fail-closed/unknown amounts remain appropriate. The primary curator may use the Stage 8 packet separately; this report is the geometry/evidence handoff.
- Network ledger for this stage: **0 new 2GIS requests; 0 new Route units**. Existing results are referenced, not replayed. CKAD remains non-repeatable. M-4 PVP545 runner approval gate remains unresolved; future execution must use the runner's supported scoped authorization process, not a local timestamp edit.
- Offline reproduction starts with the source files/checkpoints linked above; no test, route, map, or 2GIS call was repeated for this synthesis.
