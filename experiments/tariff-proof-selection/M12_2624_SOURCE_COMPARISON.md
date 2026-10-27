# Experiment7: M12 official revision and case identity

27.10.2026. Source3862c5dba358ec682b1da0443f517b1b6f330e9d; PR14Draft, CI40501699250SUCCESS before work. A/B/C/D classification; no runtime changes.

## Primary originals actually inspected

| Document | Official publication and original | Inspected page / result |
| --- | --- | --- |
| Government2580-р,09.09.2022 | [Mintrans index](https://mintrans.gov.ru/documents/2/12855), [original6-page PDF](https://mintrans.gov.ru/file/497149) | PDFp3,printed3 visually:421km crossing22ОПМЗ22Н-0239 Арзамас-1–Марьевка–Ковакса–Пиявочное, with exit possibility;442km interchangeР-158 with exit possibility. They are separate rows/objects. |
| Government2624-р,23.09.2026 | [Mintrans index](https://mintrans.gov.ru/documents/2/16001?type=0), [original6-page PDF](https://mintrans.gov.ru/file/570617) | PDFpp2–3 visually: revised appendix start26+516–843+815; p3 list goes395→404→442. Р-158 interchange442 retained;421/22Н-0239 not in the corresponding list. Originalp1 screenshot failed timeout/internal error twice; approval date/number taken from official index, not falsely claimed visually read. |

Documents read through web original-PDF renderer; no original bytes locally downloaded or hashes claimed. Government acts are not operator monetary matrices. Secondary legal databases used to discover official sources, not substituted for original visual comparison.

### Exact relevant wording (government act)

2022p3: “км 421 — пересечение с автомобильной дорогой регионального значения22ОПМЗ22Н-0239 Арзамас-1 — Марьевка — Ковакса — Пиявочное (с возможностью съезда)”. Separate442row names “транспортная развязка” with federalР-158 Нижний Новгород — Арзамас — Саранск — Исса — Пенза — Саратов and exit possibility. Revised2026p3 retains442Р-158 and omits421row in this list.

Omission is a change in the published legal inventory, **not** evidence that the physical421ramp was closed, demolished or prohibited on the saved departure date. Neither list supplies exact OSM identifiers, directed ramp assignment, billing endpoint IDs or a fare for421. “Пересечение”, “транспортная развязка”, physical exit capability and operator tariff endpoint are separate concepts.

The revisions also change overall chainage endpoints, so don't infer a uniform kilometre offset for every junction or rename an OSM object by a nearby distance. A dated as-built/road-passport or official directed-interchange plan is needed for the geometric crosswalk; traffic-opening/closure order is needed for operating restrictions; tariff-point definitions/operator rule needed for monetary applicability.

## Important correction to the supplied six ways

Retained `experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/physical-proof.json` distinguishes:

| Existing directed chain | Retained road identity | Operator candidate | Evidence level |
| --- | --- | --- | --- |
|1550135076→1550561305→1206479738 |22Н-0239; nodes14102954884,10090995838 |arzamas_p158 unproved |A already established; notC/D |
|972809728→972809720→292501171 |**М-7**, nodes10026978937,14216395535 |vladimir unproved |A already established; **not the442Р-158 chain** |

Thus treating the second chain as442Р-158 would contaminate the experiment before pricing. Existing evidence1239/2952 values remain unapplied and are not new verified amounts. Need locate a genuinely saved Р-158 traversal separately, not relabel this М-7 trip. No OSM recapture or completed route audit rerun.

Operator matrix `experiments/nationwide-tolls/source-snapshots/m12-order302-2026-10-08-category1-direct-pair-matrix.json`: order302dated02.10.2026, effective08.10.2026. It has `arzamas_p158` and `vladimir`, no distinct published22Н-0239 point in the saved pointOrder. This is B-level label evidence only; absence of a point is not a rule to borrow a neighbor's fare. Full PDF was not re-parsed.

## Bounded next sequence

1. Persist this legal/case-identity correction with a focused guard on saved classifications.
2. Existing free-flow operator rules and exact saved Р-158 candidate, three western gantries: seek independently named billing endpoints/registration logic, both directions separately. No new general engine.
3. IfDnot reached, nextB05directed545product mapping with genuinely new source; don't repeat old failed URLs.

New results:2original government documents inspected,0new monetary originals,0new physical objects,0gantry operator bindings,0Ccorrespondences,0Dfull pairs. The legal distinction and supplied-chain mismatch are newly documented evidence, not a functional fare blocker closure. All incomplete prices unknown/null.
