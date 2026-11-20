# Experiment9 — route-dependent545 collection sources

27.10.2026 МСК. New source review; no repeat of experiment8 plans/OSM tests. **Historical principle supported, October2026 application UNKNOWN**. Indexed representations of operator pages are distinguished from complete original HTTP captures.

## 1. Historical operator explanation26.12.2016

[Official article](https://avtodor-tr.ru/press-center/news/rezhim-platnosti-vveden-na-uchastke-avtomobilnoy-dorogi-m-4-don-v-obkhod-sela-novaya-usman-i-sela-ro/).

Direct curlGET: HTTP403, exit0 without `--fail`,902bytes, DDoS-Guard challenge rather than article; SHA256d48782a6d126baadc69beef3f37a643f10798916bc8e4460a3deacc36fbb8b51. Local `/tmp/m4-exp9-operator-2016.html`. No authentication/challenge bypass attempted. Separate public search-index result for exact official URL exposes publication date and article text (index reports crawled2months ago); this is not a fresh complete origin capture or proof of unchanged rules.

Article meaning, paraphrased: the545plaza collects for517–544 and544–589. Southbound, entry at this location pays the southern section; a vehicle continuing from the northern paid bypass pays for both. Northbound, charges depend on chosen onward route; the article gives29.2km and73.9km options. Historical money/discounts are not imported.

The29.2km figure corresponds to the described517–544 bypass and73.9km to the combined journey. The text does **not** fully specify every northbound old-road-only alternative, numbered lane, prior-payment check or re-entry rule. Nor does it describe the technical mechanism detecting a vehicle's past/future path. It supports route-conditioned product choice; **it does not prove lane choice irrelevant**. Lanes may physically encode the selected itinerary.

Therefore abandon only the unsupported assumption *one named plaza event always means one fixed tariff row*. Do not substitute the opposite assumption *every545event always charges two rows*. A real route needs evidence before and after the gate; historic direction asymmetry must not be silently normalized.

## 2. TPass plaza index

[Official page](https://avtodor-tpass.ru/page/punkty-vzimaniya-platy-i-tsentry-podderzhki).

Direct curlGET timed out30s: exit28, HTTPheaders200,8192bytes **incomplete HTML**, SHA25679b0ffb81e30d5f6b770346824b08f646331ac16d083558265ee2daaf14971f3; local `/tmp/m4-exp9-tpass-index.html`. Those8192bytes contain early markup, not a verified545section.

Exact-URL public index (reported crawled3months ago) independently lists both517–544 and544–588.7/589 at545 and attributes operation toОССП. It corroborates the two-product plaza association, not the complete directional charging algorithm or current effective date. Undated index language must not be treated as an October2026validity certificate. The544/545 starting-label difference across operator material is retained, not silently reconciled by kilometre rounding.

## 3. Bounded current-rule search

Queries: exact official articleURL+545; exact TPassURL+545; `site:avtodor-tr.ru "545" "2026" "маршрут"`; `site:ossp.ru "545" "517" "оплата"`. Four searches total, two directGETs, no repeated failed requests or routing calls.

The returned [current tariff overview](https://avtodor-tr.ru/road/tariffs/) index contains both545products and2026/2027calendar context, but no newly verified lane/history collection rule or dated applicable combined-charge condition. Its money rows were not re-audited or newly admitted. One returned2026PDF was **M11**, not M4; rejected as irrelevant without download. No exhaustive claim that no newer rule exists.

## Outcome and next proof

Historical route-conditioned charging is now independently supported by operator text, **not yet confirmed as the governing October2026rule**. Missing: current operator collection document linking three directed545branches to covered products/prior payment/re-entry, plus applicable fare edition and full route boundaries. Monetary result remains unknown/null. Next inspect one retained real target5818209495 route, record exact predecessor/successor and completeness; do not re-run providers or experiment8tests.

Network method: normal HTTPS through inherited proxy/TLS with per-command grant per cloud-runtime skill. Public search index is a separately identified source representation, not successful origin authentication or a bypass claim. Full indexed articles were not copied into Git; only bounded factual paraphrases and provenance are retained.
