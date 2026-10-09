# Nationwide toll roads: operator-source audit
**Research date:** 2026-10-09. Vehicles: **operator category I** (physical classification), payment **without an operator-specific transponder**. Business driver classes «Стандарт/Комфорт/Комфорт+» are unrelated to toll operator vehicle class.

## Scope: network ≠ billable section
The `national-registry.json` enumerates **22 separately maintained / tariff-distinct national and regional road networks**. It is an **inventory**, not proof that all 22 have complete geometry, real paid edge events or pricing. `М-11` has two distinct concession tariff systems, and four Pskov roads are grouped as one network, so network counts must not be used as a national census. Operator and government published pages change and coverage must be re-audited as new roads open. No generated "all-Russia price" from this inventory alone.

## Eight networks whose *selected* published operator fare rows were integrated into an offline strict pricing module

| Network | Category-I tariff examples without transponder (RUB) | Verified official origin | Precondition of a quote |
|---|---|---|---|
| М-1 33–66 км | 250 (one published section) | https://avtodor-tr.ru/business/road/tariffs/ , stored snapshot `data/tolls/2026-10-01-avtodor-other-roads-category1.json` | Exact physical section and operator calendar |
| М-3 | 65–86: 100/200; 112–150: 190/320; 150–194: 230/280 (Mon–Thu / Fri–Sun) | https://avtodor-tr.ru/business/road/tariffs/ + same persisted snapshot | Full actual sequence of paid segments and operator holiday profile |
| Восточный выезд Уфы | 150 | https://avtodor-tr.ru/business/road/tariffs/ | Actual Ufa toll paid passage |
| Обход Тольятти | 17–60: 210, 60–97: 140, full 17–97: **320** | https://avtodor-tr.ru/business/road/tariffs/ | **Mutually exclusive** official corridor fare: full 320, NOT 210+140=350 |
| Проспект Багратиона | 790 base; 550 proprietary prepaid transponder is NOT interchangeable | https://m-road.ru/tariffs/ ; https://m-road.ru/bagration/ | Confirmed 6.6-km operator camera passage + correct payment product |
| Удмуртия: мосты Кама и Буй | Кама 400, Буй 300, оба моста **700** | https://osa-kama.ru/tarify/ effective 2026-02-01 | Mutually exclusive travel zones; NOT double-charge zone "both" |
| Казань, Вознесенский тракт | 90 off-peak/weekend, 150 on working-day peak 06:30–09:00 and 17:00–19:30 | https://vtkazan.ru/ , https://vtkazan.ru/road/tarifs/ | Same-route payment frame, Moscow/Kazan local passage time, independently verified holiday/weekend |
| МСД (Москва) | 19 per proven paid city section when both entry and exit inside **working-day** 07:00–11:00 / 16:00–20:00; **950** for separately proven CKAD–MSD–CKAD transit meeting operator criteria | https://msd.mos.ru/info ; https://msd.mos.ru/faq | Separately prove all zone/time conditions, current 2026 section schedule, Moscow region plate exemptions, taxi registry exemptions, both CKAD crossings within 24 h, MSD crossing under 2 h; **no price from a road name** |

**Provenance limits:** for several Avtodor and M-road online tariff snapshots an unambiguous official effective-from date was not captured. These `effectiveFrom:null` rows are accepted by the research core **only on the catalog audit day 2026-10-09**. All requests later than `asOf` and older dates with undated rows fail closed. Any future automatic price version requires a signed/effective dated operator source, not only an observed webpage. The dated 2026-02-01 Udmurt and 2026-04-10 MSD rates are version-gated and still cannot be safely projected beyond the audit date without new audit.

## Other systems: incomplete operator matrices or precise map matching (no invented prices)
- Existing production subsystems retained without rewriting: **М-4**, **М-11** 15–58/58–679, **М-12**, **А-113 ЦКАД**, **А-289**. Their own runtime engines have differing completeness; existing code is not a nationwide complete-price guarantee. New M-4 PVP matrix still has **zero** official complete PVP price cells.
- **Северный обход Одинцова:** official https://m-road.ru/tariffs/ — direction, gate, day/time and operator-transponder specific tariffs. A flat amount is incorrect.
- **ЗСД:** official https://nch-spb.com/ — operator's detailed six-zone tariff document and concession-specific transponder schedule. Requires true entry/exit geometry, direction, current tariff version. PDF body inaccessible to this retrieval environment, so **no numerical fare imported**.
- **ШМСД/Витебская развязка:** only open Stage 1 as of observed 2026 information https://www.gov.spb.ru/gov/otrasl/kio/news/315898/ ; must account for consecutive ZSD charges, later stages under construction.
- **Обход Хабаровска:** official https://vis-transtoll.ru/khabarovsk has five physical collection points, local segments and an interactive calculator. Visible small item 20 ₽ is **not** a whole-road tariff; no flat amount imported.
- **Мытищинская хорда:** official https://vis-transtoll.ru/vbt; multiple sections and free-flow, operator announced updated tariffs from February 2026. No route-level matrix imported.
- **Псковская область:** four separate concession/tariff sections; legal maximum rates are **not** a verified actual operator fare. State portal https://pskov.ru/; current exact operator tariff/geo needed.
- **Рязанский платный путепровод:** operator https://m-road62.ru/ reports tariff update effective 2026-10-01; new official amount not independently transcribed and matched. No quote.
- **Мост Благовещенск–Хэйхэ:** international border-crossing tariff and vehicle eligibility / border requirements; not a normal unrestricted domestic passenger-car toll. No speculative estimate.

## Evidence acceptance contract
1. **Selected route identity:** `routeId` and verified *same-geometry* continuous road traversal, not the proximity of a checkpoint to a polyline. No fallback based on place names or route distance.
2. **Actual paid passage:** `proof.source === independent_paid_edge_or_operator_camera`, `status=verified`, `complete=true`, `edgeToll=true`; ordered, unique known facility IDs and exact vehicle class. Current module only accepts these **already verified inputs**; no live nationwide independent verifier has been built.
3. **Operator billing:** exclusive corridor products, date/peak profiles, exemptions, transponder plan, actual number of charges and current fare version. Costs for multiple roads can be summed **only** when every component was independently confirmed. If any charge is unknown, entire amount is null. No inferred free route or automatic 0.
4. **Release boundary:** repository branch preview shows candidate families and catalog; it **does not** replace production money for any national system. `national-price.mjs` is an offline testable research core, not the invoicing authority.

## 2026-10-09 — independent source inspection: six bidirectional M-3 named OSM toll nodes
The exact operator-kilometer facility labels M-3 PVP86, PVP136 and PVP168 were originally verified on Avtodor's official M3 road/PVP pages. Selected Valhalla same-route deep diagnostics generated **three exact OSM IDs on each of two opposite real routes**. All six were fetched independently from the OSM API on 2026-10-09 and shown to carry `barrier=toll_booth` and exact physical operator PVP name, with operator tag where recorded. See [M1_M3_EVIDENCE_2026-10-09.md](M1_M3_EVIDENCE_2026-10-09.md) for direct stable source links and coordinates. This supports exact physical M3 gate matching, **not** full operator tariff total certification. M1 46km gate exact lane-node identity has not yet been independently established. Other road tariff source evidence and date limitations above still apply.
