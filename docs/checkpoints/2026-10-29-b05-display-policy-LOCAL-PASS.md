# B05 — source-language conflict and human homonym labels, LOCAL PASS

29.10.2026 MSK. Base104ed681, STARTEDaf64b668; published5558ed8b remains unchanged/PR14Draft. No push, CI edit, production/main/Android/backup modification.

## Exact source diagnosis

Saved UA alias archive SHA25645a39ff54f9fd9035de9dafc0c142db5bc1a63186e720ad1fed6c611f9e4da57. GeoNames709711: alternate9199026 is uk=Донецьке; alternate20868266 is ru=Донецьке. Both were inspected from the saved archive, no download. Existing builder trusts ru and selects Cyrillic; the packaged record therefore lacks ru_name_unverified. The previous screen rejected і/ї/є/ґ/Latin but not Ukrainian ськ/цьк orthography. No source-backed Cyrillic Russian alternative exists for this ID in those saved rows; inventing Донецкое would be unjustified.

## Minimal changes

- Shared lib/russian-settlement-display.ts now screens only source-backed Russian candidates: require Russian Cyrillic, reject other letters and conservative ськ/цьк ambiguity. GeoNames/Photon use exactly this helper. Invalid candidates can fall through to another explicitly Russian provider field/reviewed source; untyped search aliases are not promoted or translated. GeoNames709711 is withheld, not rewritten or deleted from the corpus.
- This screen is a conservative quarantine, NOT a linguistic classifier or semantic certificate for the entire corpus. Ambiguous proper names may need source review; tags alone remain fallible. No mass corpus review/rebuild or claim that all Ukrainian spellings can be detected by a regular expression.
- Existing duplicate-label formatter explicitly appended geonames-ID/lat/lng. Replaced with compact human ordinal `(1 из 2)` near the name; records with unverified administration explicitly say `район не уточнён`. Verified existing administrative context remains. Ordinals identify choices within current matching results, not invented locations/districts or persistent IDs. Precise district disambiguation still requires reliable administrative evidence.
- Both LNR homonyms709713/811884 remain individually selectable with original positions48.6996/38.67627 and48.96667/39.16694. No source ID, aliases, provenance, corpus bytes, coordinates, routing or tariff policy changed. Existing regional ranking/explicit qualifiers/52081-record guard retained.
- Added typed constructor declaration for the JS index used by the TypeScript regression test; no weakening to any.

## Checks actually run, Node24.19.0

Two new regressions failed before correction: source-tagged Донецьке leaked; duplicate labels exposed technical coordinates/ID. Final targeted suite56/56PASS includes actual admitted API data, original IDs/coordinates, regional qualifiers/priorities, Photon-unavailable city search, street/house fallback and safety guards.

Final runtime: full offline npm run test:audit1007PASS/0FAIL/1SKIP, quote/API checksPASS; TypeScript exit0; scoped ESLint exit0 (one pre-existing unused key warning); next build --webpack exit0, existing preferredRegion warning. Initial full gate/build also passed; final gates were repeated only because the homonym ordinal was shortened for mobile visibility. No manual live route audit.

Real local built V3 browser suite settlement-display-browser.mjs passed1280×900 and390×844, no address mocks/no route calculation. Both source homonyms were selected independently after clear/retype; no Ukrainian Донецьке/technical ID/coordinate label. Mobile choices screenshot inspected: compact ordinal and missing-district note visible. Evidence in experiments/address-search/2026-10-29-display-local-evidence/.

Runtime SHA256: shared helper8610dd3abd87495d515507c65bbbe70f806d0580bceda3a1801816a261a608ef; Photon4dc7d0996b775aa6bb757768bf2f2229f81d8d4a24df76b4015b1aaf9b837805; index3003554491fc4dde975b6a2d3dcddb4a0a36c265c30ac6079bac18d0139717d0. Browser review SHA256bf0faa7d4060a23a1549d3bf5dd571a249c8b64ae11755b68621d32864cdc360. Full gate logs remain /tmp/b05-display-*-final.log; first failing tests /tmp/b05-display-regression-before.log.

Next: separately preserve actual existing published Preview evidence and its mobile retry limitation. Current Preview still contains the old defects; these fixes are LOCAL ONLY and require separate publication authorization + updated Preview acceptance. Historical protected WORK_LOG/NEXT_STEPS untouched under checkpoint-first rule.
