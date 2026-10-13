# Stage 5 — M11 / M12 / CKAD code and calculation audit, 2026-10-13

Status: DONE code/calculation audit of existing adapters; physical coverage limits remain explicit unknown, not completed nationwide verification. Local baseline ac6fefb, remote head rechecked 839784e5ec008c0be8f614b3d6617fb90b91e032, experiment branch only. No main/merge/Production.

## Fixed

1. OSRM carried named steps but discarded already supported M11 evidence. `lib/route-providers.ts` now attaches `deriveM11EvidenceFromOsrm`; V3 consumes evidence on `selectedFastRoute`, for both ordinary and special requests, never another provider's route. Destination labels remain clues, not strict proof. M12 still requires actual supported strict span; OSRM M12 metadata has no adapter yet and stays unknown when legacy family detection finds it.
2. `matrixM11Component` consumes the native resolver's money-free, directed physical boundary IDs even when the older native tariff table lacks the cell. Current Order274 22×22 matrices from existing register prevail. Native exposes `traversal` without changing V2 native tariff selection. Moscow local date/profile, effective versions, ambiguity, mixed evidence and missing exact cell block pricing. Whole-trip date transition conservatively blocks a mainline-only estimate until stage7 crossing-time refinement.
3. Full M11 geometry exposes separate Moscow15–58 amount and mainline OD/crossing timestamp; V3 re-quotes mainline and adds the head exactly once. No guessed subtraction of a mixed native amount. The Tver helper must actually pass p147 before p58/Moscow; proximity to Tver alone cannot authorize p147→p58. Historical native610/750 remains outside V3's direct matrix result. Current direct p58→p679 MonThu is3900, not older4200; its source is the stored authorized Order274, not a new external quote.
4. M11 facility ordering previously used segment integer: two boundaries on one shape edge appeared simultaneous. Matching now uses fractional position within the edge and crossingAt interpolates that position. Shared helper affects metadata in experimental V2 code too; existing V2 native regression passed. Speed remains proportional to cumulative geometry, not actual per-edge ETA; stage7 refinement deferred.
5. M11 strict block gaps/malformed metadata and return to the same physical toll anchor reject a single OD fare. Repeated-visit guard uses individual physical anchors: p58 has distinct plazas over1km apart sharing an OD ID, so traversing those once is not a loop. Dense neighboring vertices at a booth are one visit. Geometry-only omitted/unnamed maneuver gaps remain a provider evidence limitation.
6. CKAD exposes east-arc direction and V3 queries the stored direct M4↔M11 matrix2517 at the Moscow local date. Expired/missing pair returns null, no fallback to an old section sum. Legacy sum also2517 in this case; the improvement is directed/versioned source binding, not a changed number. Only the existing proven eastern corridor is supported; nine rough anchors up to5km and M11 continuation are legacy proof, not newly independently verified gate lanes. Arbitrary CKAD OD remains unknown.
7. M12 single-span extractor formerly min/max merged disjoint named blocks, including non-M12 gaps. It now rejects positive gaps, malformed strict indexes, zero-length strict segments, invalid geometry and disconnected legs. Contiguous strict sections across a shared leg endpoint remain supported in both directions. Existing M12 dated exact vector/expired Shali guards unchanged. The new official99 Sokury–Shali cell is not guessed from RVP832: exact entry/exit binding still missing.
8. Full Moscow→Petersburg candidate revealed a separately priced679–684 continuation missing from58–679. V3 blocks a mainline/full-head subset whenever final strict M11 extends beyond the proven p679 endpoint, or absence cannot be established. Do not add56 merely from city name; independently bound679–684 exit remains deferred.

## Verification actually run

- New focused suites13/13 PASS (9 selected-route/evidence/geometry tests +4 adapters). Existing M11 Moscow regression also PASS.
- Final `npm run build -- --webpack`:491/491 tests, fail0, quote/API contracts PASS, TypeScript and optimized Next build16/16 pages PASS.
- Scoped ESLint on all changed code/test/replay files PASS; git diff --check PASS.
- Compiler API noEmit PASS after correcting verification invocation: initial invocation inherited incremental without a build-info path and produced TS5074; no application TypeScript error. Later Next compiler checks PASS.
- Two initial regression assertions failed during implementation: wrong test expectation field notes vs segments; coarse segment ordering suppressed full geometry. Fixed test field and the actual fractional-ordering bug, then focused/full gates passed.
- Live loop guard initially treated distinct p58 plazas as repetition; actual provider geometry exposed1.346km between anchors. Changed to physical-anchor repeat and added explicit regression. Final live replay has no false repeated-plaza reason.

## Live controls (actual external providers, not mocks)

Replay: `node --import ./scripts/register-ts-paths.mjs scripts/v3-live-stage5-audit.mjs`. Real NextRequest→production V3 POST handler→OSRM/Valhalla/BRouter HTTP requests, captured raw responses; this is local API-function integration, not hosted Preview POST/browser or Yandex price validation. All routing provider HTTP responses200. Departure2026-10-13T12:00+03.

| Route | Selected | Distance / ETA | Final API toll | Reason |
|---|---|---|---|---|
| Moscow→Petersburg | Valhalla |710.317km /24636s|unknown/null|679–684 continuation not priced; known5030 subset caught and rejected during audit |
| Tver→Moscow | OSRM |179.202km /8889s|unknown/null|actual strict entry lacks a completely bound OD; p147/full sequence not proven |

Final raw records: `live-controls/2026-10-13-stage5-moscow-petersburg.json`, `live-controls/2026-10-13-stage5-tver-moscow.json`. Intermediate5030 was not published, not accepted as a correct trip total; records contain final guarded result. No CKAD/M12 live controls or full-road price certification performed.

## Remaining / next

Stage6 M1/M3/regional matrix composition. Stage7 per-road holidays, direction-specific entry dates, midnight/head seasonal dates. Stage10 physical M11 partial/head/reverse/679–684 and CKAD exact gates, OSRM M12 span, Sokury–Shali exit, full provider/Yandex equivalence including Slavyansk→Rostov. Full reverse Moscow-head traversal currently unknown; never price only mainline as entire trip.

Publication: pending at report creation; exact GitHub code SHA, hash comparison and Preview status must be appended after actual completion.


## Verified persistence / Preview — stage5

Local implementation538c8ac maps to remote code6f68c9574f8eab5e4a6d795764949d53b9a99f49 (parent839784e5), followed by1506a8623cd9780930de75a346fb96133dc5f93c for large work-log/live-control blobs. Final tree dd4c509fb9de22ce16a335475496ffaaae7e5824 matches all21 changed local blobs,0 mismatches; unrelated tree preserved, ref fast-forward with expected_sha and force=false. First post-upload verification caught3 omitted large files because the upload orchestration updated a transient loaded array rather than persisted entries; corrected immediately in the follow-up commit and all21 verified. No lost local work or different source code deployed.

Vercel dpl_BCRWYuDsaxfZMvL72C66EyMbfHWe READY, target=null, exact source1506a862. URL https://mezhgorod-calculator-oy89ta0xy-4regodatbe-5310.vercel.app/v3 . Remote build logs491 tests/pass491/fail0; quote/API contracts PASS; TypeScript/Next16/16 PASS; Build Completed37s. Authenticated connector GET /v3 HTTP200. This establishes page availability, not hosted browser/route POST, which still have not run. No merge/main/Production. Nextstage6.
