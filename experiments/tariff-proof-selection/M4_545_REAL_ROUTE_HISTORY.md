# Experiment9 — actual Taman→Voronezh history

27.10.2026. Case9 / B05 **PARTIAL**. This new comparison uses the operator principle from [source review](M4_545_ROUTE_COLLECTION_SOURCES.md) with one retained real trace; it does not repeat22routes or experiment8plans/topology/tests.

## Exact saved evidence

Capture and per-response hashes/indices: [review JSON](m4-545-route-history-review.json). Capture `experiments/nationwide-tolls/source-snapshots/systemic-road-audit-2026-10-15/runs/pair-m4-a289-taman-to-voronezh/2026-10-16T00-10-53-930Z-capture.json.gz`, SHA256`db7ce8f0d256d7e2583644611c3a00adae58c5367735a146a4f9005867b9404a`; unchanged and already in Git. It is the exact unresolved case referenced by `docs/checkpoints/evidence/2026-10-16-m4-1223-545-scope-gap.json`, not a newly selected cheap/expensive route.

Selected OSRM route1026560m,6540coordinates, departure15.10.2026. Retained validation: trace complete,8/8chunks,0failed, complete booth-event coverage. All8saved trace responses HTTP200. These are historical captured statuses, not new network success. Last response is `calls[10]`,181edges; edge shape indices are continuous, no gaps. Whole validation completeness is **not** proof of complete billable coverage.

|Stage|Exact last-chunk edge evidence|
|---|---|
|Arrival from southern M4|edges26–35 follow named northboundМ4;35=1043769291 ending fork4522140254|
|Cash branch|36=799492317→2350820444;37=615270676→5818209500;38=615270691→5818209495;39=sameway→5818209499;40=615270694→9605783251;41=1043769287→5818209497;42=799492323→4513805004|
|After plaza|43=702218808→3504913992, then uninterrupted reviewed bypass-side way sequence, saved in JSON/module through69|
|Actual exit|70=301694367→3057885104;71=705714822→318331760, namedР-298/E38/AH61/улицаДимитрова; continues into Voronezh|

Selected route coordinate indices6008(fork),6011(target),6027(merge) agree with experiment8coordinates to six decimals; this is a rounding-aware check on recorded points, **not** a nearest-radius tariff admission. Target event occurs once. Neither northern3504914294 nor adjacent9620416636 is traversed on this witnessed branch. Previous observed named620plaza is4315323077; it is not itself a surveyed589product boundary. Route label “Воронеж” is not used to choose a price.

## Product interpretation

The observed itinerary approaches545from the southern M4 and takes the bypass-side path north, rather than the neighbouring old-road branch. It is compatible with the **historic combined-product hypothesis**517–544 plus544–589. Historical explanation explicitly makes payment route-dependent; its Moscow detail does not independently map this2026path to all collection conditions.

**Confirmed current products: none admitted. Candidate product set:517–544 and544–589, expressly not a charge instruction.** Exact missing facts are a governing dated operator route/product collection rule and certified directed tariff endpoint crossings, followed by applicable fare/no-double-payment proof. Partial travel through a named paid corridor does not alone establish which whole commercial product is payable. The recorded route ends before any observed515cash event; lack of that event does not prove absence of517–544 coverage or justify using only544–589.

Thus do not select historic matrix1223→545-a versus545-b by minimum/maximum, city label, subtotal, or isolated gate event. No320/410 or historic2016amount is admitted. No addition, re-entry or receipt-validity condition is invented. One observed gate is not enough to prove no prior payment; the excerpt contains no receipts/account ledger.

## Precise information gap

Raw capture retains the full selected OSRM route plus trace responses. Requested trace filters contain way/toll/names/begin/end shape indices and end-node IDs, but **omit matched shape coordinates and explicit start-node IDs**. Returned indices can exceed input320sample points: they refer to matched geometry, not directly to the6540OSRMpoints or request shape. Reusing them as OSRMindices would be an error. Retained continuous edge-order and selected local OSM graph support the local path witness; they do not independently georeference operator517/589limits. No whole-capture loss is claimed.

The main missing information is operator-side: which itinerary incurs which product, how previous payment/re-entry is handled, valid-date rules, and physical product-endpoint mapping. It was never supplied by a traffic `toll:true` flag. A new router call would not resolve this commercial/legal gap.

## Narrow executable experiment and acceptance

`m4-545-route-history.mjs` is an **evidence inspector for this one reviewed case**, not a universal classifier or a tariff engine. It reads provided capture objects, requires full saved chunk status, contiguous edge shape indices, unique target event, exact directed8-edge cash approach and exact29-edge onward witness. It rejects unreviewed predecessor/successor, incomplete/gapped data, adjacent gate, reverse-path mutation and duplicated/re-entry event. Shape-index continuity is not represented as surveyed all-road node connectivity; repeated chunk hits are conservatively ambiguous, not automatically double charges.

Output separates observed history from `confirmedProducts:[]`, `pricingStatus:"unknown"`, `rub:null`. No source import from public application; no app flags/routes/prices changed. Dates are deliberately not auto-certified by the inspector; even complete geometry cannot authorize a fare. Changing labels or injecting a plausible subtotal has no effect.

`node experiments/tariff-proof-selection/m4-545-route-history.test.mjs`: **9/9PASS**, Node24.19.0. One actual saved-case history-positive and eight mutation/control tests (not nine real trips, not a fully priced pair-positive). Additional assertions cover missing prior path, shape gap, opposite branch, neighbour, repeated entry, different exit, same exit via unreviewed intermediate path, false label/subtotal. No previous five geometry tests rerun. `git diff --check`PASS. Next: one NOT_SENT question to operator, with exact three-branch scheme and current-rule request.
