# Stage6 — M1/M3/regional coverage audit, 2026-10-13

DONE existing code/calculation audit, not complete physical/tariff integration of every network. Baseline0714614; local integration/matrix-estimates-2026-10-13. Remote experiment head acefcefe72452353575595c81967f784a6cc8a37 verified before work. Open PRs inspected: #12 draft64631d23 on fix/v2-mobile-layout-2026-10-05, #9 draft63b4c392, #6 open808394c8; none is this experiment, none changed/merged. No main/Production.

## Findings and fixes

1. V3 final composition tested only legacy M1/M3 segment names, despite same-selected-route map matching reporting M1/M3 candidate/gate IDs. Thus a known other-road amount could bypass an unpriced component. New `lib/v3-calculation/unpriced-road-coverage.ts` unions legacy names, catalog candidate networks, M1/M3 gate-audit candidates, actual selected-route paid names and paid booth events. M1/M3 detections block a numeric incomplete total. A complete physical gate match is detection, not a new fare approval.
2. Regional composition detected only Ufa eastern exit/Tolyatti. Odintsovo existed as a legacy M1 array entry with no M1 road label, while its actual regional toll name could remain outside composition. All14 regional catalog IDs now require a separately priced traversal before a complete sum; common regional names are recognized (ZSD/SHMSD/MSD, Bagration, Odintsovo, Mytishchi etc). A paid booth without a supported named family maps to unresolved regional rather than vanishing. No fabricated regional fares or independently verified physical bindings added.
3. Late remote trace was consumed by fallback/recovery after composition, without rechecking missing M1/M3/regional systems. It now blocks corridor recovery and preserves unknown once any such unpriced family is observed. Existing real A289620 + synthetically supplied selected trace M1/M3/ZSD tests verify the known620 disappears from the final total rather than showing an incomplete trip number. No trace from another provider candidate is borrowed.
4. Legacy family regexes recognized prefixes e.g.M40 asM4/M111 asM11/M120 asM12 and some embedded road refs. Now require number/word boundaries and support Latin/Cyrillic plus common Unicode hyphens. `ЦКАД: М-4 — М-11` describes intersections; it now identifies CKAD only, not additional highway passage. Explicit composite `М-4 + М-11` still yields both. Reused precompiled patterns avoid repeated regex construction; no measured performance gain claimed. Shared experimental V2 helper changes passed full existing regression, no live production change.
5. M1/M3 inventory validator allowed an ID to bind the wrong road/km/fare-row. Enforced exact four ID→road/km/fare mappings, retaining verified node data. Fractional/infinite/missing chunk counts could pass complete-trace checks; require safe integer counts before physical audit. Existing duplicate plaza/missing route/incomplete trace/node guards retained.

## Tariff/source coverage intentionally remains incomplete

M1 exact46km lane IDs are still absent in `m1-m3-official-gates.json`; a250 legacy geometric number is not an independently priced crossing. M3 source series conflict was not resolved here. Stored national dated shadow series is verifiedThrough2026-10-10, before this live date. Generated M1/M3 matrix rows lack explicit effective-from metadata (generator19–20), whereas their raw published snapshot carries a series; do not activate matrix prices using missing dates/unknown exits. Correct this source/provenance layer in stage8 and independent calendar layer in stage7. Provisional-price permission does not authorize invented route/gate identity. No new customer M1/M3/regional numeric fare introduced, no tariff dataset changed.

The national inventory has22 scoped networks, not proof of a complete Russian paid-road census. Detection covers currently available catalog names/events. No nationwide new spatial indexes, provider regional named-step adapter or always-on map matching for positive already-priced routes added. Where diagnostics are absent and current geometry/provider evidence cannot reveal a missing network, coverage remains an explicit stage10 limitation. Do not claim all roads detected or all stored matrices integrated.

## Verification actually run

- Focused selected coverage tests9/9 PASS; inventory adds2 meaningful regression cases. Final `npm run build -- --webpack`:502/502 tests, pass502/fail0; quote/API contracts PASS; Next TypeScript and optimized16/16 pages PASS.
- Scoped ESLint for changed sources/tests/replay PASS; git diff --check PASS.
- Initial coverage fixture used approximate A289 anchors without asserting its base fare. Corrected to actual stored gates82/23 and asserted baseline620 before adding each synthetic unpriced M1/M3/ZSD component. No failed focused test hidden; first fixture was too weak and replaced.

## Actual live local API/provider controls

Replay: `node --import ./scripts/register-ts-paths.mjs scripts/v3-live-stage6-audit.mjs`. Real NextRequest→V3 POST→OSRM/Valhalla/BRouter and same-selected-route trace_attributes, diagnostics=true; externalRoutingSimulated=false. Departure2026-10-13T12:00+03. HTTP route/trace responses200, local API200. This is local handler integration, not hosted Preview browser/POST or Yandex price check.

| Route | Selected | km /seconds | Result | Evidence |
|---|---|---|---|---|
| Moscow→Kaluga |OSRM|184.817 /10636|unknown/null|trace matches exactly86→136 (2 booths); do not substitute complete three-gate fare |
| Moscow→Odintsovo |OSRM|26.172 /1937|free0 for this selected geometry|complete1/1 trace,269 edges,0 paid edges/booths; not a claim that all Odintsovo routes are free |

Records `live-controls/2026-10-13-stage6-moscow-kaluga.json` and `...moscow-odintsovo.json` contain API responses and raw providers/traces. Complete M3 pricing and all regional gate/tariff coverage remain deferred, not treated as zero. Previously accepted A289620/415 and existing Slavyansk→Rostov routing discrepancy unchanged.

NEXT stage7 per-road dates, timezone, holidays, midnight/crossing time; stage8 resolve dated source series; stage10 full physical/provider/Yandex equivalence. Publication pending at report creation: append exact verified GitHub/Preview evidence after it runs.


## Final trace-validator follow-up

While checking live free-route proof, found HTTP200 with missing/empty/null/nonboolean-toll/nonarray-names edges could certify zero edges as a complete free trace. `lib/toll-validator.ts` now rejects these malformed/no-evidence traces; failed coverage stays unknown. A physical toll booth without toll=true now makes a completed trace unknown, not free. V3 missing-system detection uses physical booth presence even if its edge flag is contradictory; it does not invent the booth fare. Existing alternative-payment-point policy already rejects any physical booth and remains unchanged. Added2 regression cases, final502 tests/TypeScript/Next16/16/lint PASS. Live controls rerun on hardened code confirmed the same routes and results (Kaluga18919ms, Odintsovo16040ms; external/API200); final raw files replaced with this completed run.

First saved localab191c8 → remote6a230c9d60040c5569a460a8a23d4cd258414fec (parentacefcefe), treea68e5bd1ff07014bdba8e4599c2c708cc29aea1e;15 changed files hash-matched,0 mismatches. First create_tree response supplied no usable SHA; retry succeeded, tree verified before ref update. First500-test Preview dpl_wVWix16XsKBywxoN1zoMzkEzWQau READY at code6a230c9d; final hardened502 checkpoint still pending at this entry. No production/merge.
