# Experiment8 — directed physical crosswalk at M4 545

27.10.2026. Geometry review completed; **B05 PARTIAL, no newly admitted full tariff pair or amount**. This is not a new route capture, detector, or public integration.

## Originals and selected leaves actually read

Exact original bytes/provenance/cover review: [acquisition manifest](M4_PODD_ACQUISITION.json). Original cover year2023, publication index13.03.2025; neither establishes October2026 fare validity. Page numbers below are **one-based PDF pages**; the printed lower-right numbers match on reviewed leaves.

|Original|PDF page|Readable physical content|
|---|---:|---|
|[mainline](https://russianhighways.ru/upload/iblock/ac0/ac0d3f914d1dbbb1965af9018617ec94.pdf#page=241)|241|ТР544+090–544+955: curved bypass crosses straight older corridor on a bridge; ramps and start/end paid-road signs|
|mainline|242|ПВП544+835–545+600: separate northern/southern gate groups, central lanes and separation islands; this is not one universal toll line|
|mainline|243|545+572–545+915: АЗС «Калина Ойл»; Moscow paid-road signs, «ДОПОЛНИТЕЛЬНЫЕ ПОЛОСЫ800м» and «ВЪЕЗД НА БЕСПЛАТНЫЙ ПРОЕЗД …350м»|
|mainline|244|545+904–546+247: repeated advance direction sign with paid Moscow/main and additional-lane choices versus free НОВАЯ УСМАНЬ/ВОРОНЕЖ/МОСКВА|
|[alternative](https://russianhighways.ru/upload/iblock/963/9632eae064152f4477899207a052bc6b.pdf#page=86)|86|543+475–543+818, straight divided older corridor approaching final leaf|
|alternative|87|543+808–544+240, paid-road start/end signs near544+112/114; blue kilometre markers544 and545 on opposing sides near the same cross-section|

The mainline volume ends near546km; **it does not document the complete544–589km journey or the589km endpoint**. Alternative title517–544 describes that road volume, not a legal mapping of every nearby cash lane to a charge. Do not infer a universal +1km offset from the last alternative leaf. No geographic coordinates or surveyed OSM IDs were found on these selected leaves.

Rendering: ordinary Poppler `pdftoppm`, unmodified source; main241–243 at reduced whole-leaf resolution plus native240/720dpi crops for page242 signs, main244/alt86 at2400px, alt87 previously rendered. High zoom confirms gate detail but raster tariff-board headings remain insufficient to certify product allocation. Historical board figures differ from the separately retained order58; **none were admitted as new prices**. Rendering returned0 with Fontconfig writable-cache warnings, no missing-page/error claim. Derived images/text remain in `/tmp/m4-podd-exp8.FSZfcc`; originals remain unmodified. Remote reproduction uses original URL+SHA and these page/crop coordinates, not an assertion that temporary images are in Git.

## Independent directed OSM evidence

[Retained bounded subset](m4-545-directed-osm.json): source URL, HTTP200, byte SHA256, exact selected coordinates/way order/version/tags and ODbL attribution included. Ordinary new map request covered only39.548,51.462–39.564,51.476. It is not a routing-provider call. API full intersecting ways may extend beyond that box. XML parsed with stdlib ElementTree; an initial ad-hoc regex display was discarded because self-closing XML nodes made it unreliable.

The separate target-way GET duplicated an already retained way snapshot; it is **not** counted as a newly discovered physical identity. Full original map remains locally `/tmp/m4-podd-exp8.FSZfcc/plaza545-local-map.osm`; the committed subset is explicitly not the complete raw map.

All three northbound alternatives start at exact fork **4522140254** (51.4679181,39.5546310), adjacent to independently named fuel node383727273 «Калина Ойл» (51.4674767,39.5552183):

|Branch|Exact directed way sequence|Gate and exit|
|---|---|---|
|Target southern gate → eastern/bypass corridor|799492317→615270676→615270691→615270694→1043769287→799492323|5818209495; merges at4513805004|
|Central approach → northern gate → same corridor|799492326→799492325→606838738→799492324→1043769289→702218809→787089819→1043769288|3504914294; same merge4513805004|
|Neighbouring southern gate → older straight corridor|522875739→799492316→467980114→467980113→1043769286→432522383→1043769285|9620416636; distinct exit4512436102|

Target way615270691 version9 is one-way north, five lanes:5818209500(51.4701519,39.5547146)→**5818209495(51.4702718,39.5547040)**→5818209499(51.4703840,39.5546944). The target traverses **neither northern gate3504914294 nor neighbouring gate9620416636**. Opposing booth365274796 on467980112 is southbound. Southern cluster also includes6594393968; northern cluster includes3842564088. These six map booth nodes do not mean six independently chargeable products.

## What the comparison establishes — and what it does not

The unique *fork by named fuel station → distinct southern cash branch → bypass of northern cash branch → common downstream merge* matches the main242–244 topology and direction signs; it is materially stronger than a545-name/radius match. **5818209495 is the northbound southern additional-cash approach to the bypass-side corridor**, not the northern cash gate and not the neighbouring old-corridor gate. This is a new document-supported directed **geometry cross-reference**, limited to gate-bank/branch level; no surveyed overlay or individual numbered cash booth assignment is claimed. Plans2023 and OSM revisions through2026 are not necessarily contemporaneous as-built survey evidence.

It does **not** establish which combination of517–544 and544–589 products is collected at5818209495. In particular, two approaches with common downstream merge need not charge the same interval, and lack of a second booth traversal does not prove a free component. Page242's signs are traffic-direction instructions, not a dated operator charging rule assigning tariff intervals to these OSM lanes. Full target-to589 traversal and northern517 boundary are absent from this local map and were not newly captured.

Order58 selected rows remain historical monetary evidence only:517–544 categoryI140/160,544–589180/250. The tempting320/410 sum is **not an admitted charge**, because lane-to-product bundle, additivity/no-double-payment and date are unproved. Nor do we select140/160 or180/250 merely by the physically adjacent road or chainage label. Original retained order and row hashes remain unchanged.

### Exact evidence still needed for C/D admission

1. Operator lane/plaza diagram or collection rule explicitly binding the southern northbound additional lanes versus northern gate and old-road gate to product517–544,544–589, or a combined payment bundle.
2. Dated chainage/as-built tie points (or independently certified topology) binding both product endpoints to physical entry/exit; these volumes alone do not show589.
3. One already retained complete directed traversal proving those endpoints and no premature exit; inspect only after item1 identifies the claimed product, not22-route replay.
4. Operator tariff edition/effective date valid for the selected day/class/payment, plus independent additivity/no-double-charge rule if two components apply. Do not invent effectiveFrom or treat2023 plans/index2025 as fare freshness.

No functional B05 closure, C/D pair, real priced positive, or technical runtime correction is claimed. A real full-pair positive and its six pricing negatives remain conditional on these missing facts. Geometry tests instead check exact chain continuity, direction, neighbouring/repeated/missing-link rejection and distinct gates; they do not prove tariff completeness. Public `unknown/null` and all tariff amounts/routing logic are unchanged.
