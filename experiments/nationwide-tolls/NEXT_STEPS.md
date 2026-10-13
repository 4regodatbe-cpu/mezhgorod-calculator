## 2026-10-13 — user price correction + stage4

- [x] Correct A289 vehicle-category import; Anapa620 / Slavyansk415 confirmed by actual API and live Yandex representative controls.
- [x] Stage4 calculation: separate M4-only + A289 OD + bypass, no lost/double components;478 tests/build PASS.
- [ ] Persist correction/large regenerated matrices to experiment with lease8cc29824; verify exact Preview.
- [ ] Stage5: M11/M12/CKAD adapter composition.
- [ ] Stage10 live gap: Slavyansk–Rostov OSRM vs Yandex different route/ETA; no Yandex total, do not declare same-route price check complete. Preserve exact bypass binding / source/holiday limitations.

---

## 2026-10-13 — аудит: части1–3 завершены

- [x] Части1–3: календарный вход API, fastest provider geometry, промежуточные A289 OD/frame ordering/unknown/repeat guard. Gate472 и build PASS.
- [x] Audit baseline и части1–3 сохранены в experiment code93c0c5d,35 files SHA match; Preview READY exact code SHA,472 tests/build PASS; GET /v3 200.
- [ ] Часть4: M4 partial/full plus A289, no dropped/double charged components.
- [ ] Части5–10 по AUDIT_PLAN_10_PARTS_2026-10-13.md; live bindings/browser остаются открытыми.

---

## 2026-10-13 — аудит: часть 2 завершена

- [x] Часть2: V3 fastest candidate validity/geometry/provider identity, equal ETA, no fake freeError; 466 tests/full build PASS.
- [ ] Часть3: A289 intermediate OD pairs and physical frame ordering; resolved/unknown boundary.
- [ ] Сохранить локальные части1–3 и исходный аудит8556e57 в удалённой экспериментальной ветке после проверки текущего head.

---

## 2026-10-13 — текущий порядок аудита

- [x] Часть 1: исходное состояние, общий gate, календарная валидация API.
- [ ] Часть 2: fastest selector / equal ETA / provider geometry-evidence.
- [ ] Части 3–10 по [плану](AUDIT_PLAN_10_PARTS_2026-10-13.md).
- [ ] Перенести локальный аудит после `d0dc2227` в экспериментальную удалённую ветку с повторной сверкой head; текущий Preview старее исправлений. Не смешивать с V2 PR #12.

---

## Audit follow-up — 2026-10-13

- [x] Code/calculation audit fixes and62-file regression gate; see AUDIT_2026-10-13.md.
- [ ] Persist audit + exact Preview and record SHA/availability.
- [ ] Live V3 selected-route controls Yalta/Anapa/Taman/Temryuk↔Krasnodar/Moscow; inspect frame sequence and bypass, not just page HTTP200.
- [ ] Unify holiday/midnight tariff handling across M4 native/matrix/API/UI without applying one road's calendar to all roads.
- [ ] Resolve exact local exit/bypass geometry and complete M1/M3/regional matrix-to-route composition.

---

## CURRENT 2026-10-13 — Yalta and Anapa short-route regression

- [x] Wire V3 short A-289 selected route to finished OD lookup and conditional bypass, with synthetic Yalta/Anapa↔Krasnodar direction checks; a provisional two-frame Anapa exit estimate is visible as unconfirmed.
- [ ] Capture real `/api/v3/calculate` responses for the user's exact Yalta/Anapa↔Krasnodar endpoints on Preview. Inspect selected geometry and crossed physical frames; if the router chooses a different road, fix the route classifier instead of forcing the 800/833 estimate.
- [ ] Verify whether Anapa's exact interchange maps to the saved Varenikovskaya OD and reconcile 833 ₽ with the user's actual no-transponder route card. Keep missing candidate quote unknown until observed.

---

## 2026-10-13 — A-289 exit pairs

- [x] Preserve three physical frames and seven directly sourced/user-approved OD pairs (14 directions); persist explicit unknown Anapa/Taman partial pairs in `A289_OD_MATRIX_2026-10-13.json`; rebuild/validate complete matrix and quote adapter.
- [ ] Bind Anapa exit and Taman continuation to precise route geometry/maneuver evidence. Then test the remaining Slavyansk→Taman, Varenikovskaya→Taman, Temryuk→Taman, and every Anapa pair with a current direct operator/Yandex fastest control; fill only actual observed OD fares. The 620 city route requires its exit/re-entry control.
- [ ] Drive representative real routes in both directions through V3: Krasnodar↔Slavyansk, Temryuk, Anapa and Crimea, plus Slavyansk↔Temryuk/Taman. Inspect selected geometry, frames, exit node, fare and warning, then create exact-commit Preview.
- [x] Persisted as code `f9c092a`, exact Preview `dpl_7CfgeSqL2jfpziGSYFDcFM8nhzPN` READY; authenticated `/v3` GET200. Real route POST remains open.

---

## 2026-10-13 — Crimea Yalta route regression

- [x] In V3, add the full A-289 bridge vector to the complete M-4 corridor and add the west bypass only when its selected-route geometry matches. Incomplete A-289 evidence must produce unknown, not a partial 5,040 ₽ trip total. See `lib/v3-calculation/crimea-m4-total.ts` and dated `WORK_LOG.md`.
- [ ] Verify the actual fastest Ялта — Крым → Москва and reverse V3 API response on Preview, including coordinates, three A-289 frames, bypass crossing, and price/label. The protected Preview browser was previously redirected to login; do not claim a live route test from build alone.
- [ ] Check the current west-bypass tariff and route scope against operator/Yandex evidence: 410 ₽ is inherited from `lib/toll-data/m4.ts`, while the user recalled roughly 300+ ₽. Reconcile before treating 6,250 ₽ as validated.
- [x] Persist fix as experimental remote commit `8b8442c` and create exact-code READY Preview `dpl_EMmxvx7w6ZELCuKag9upow8Kh2Q4`; authenticated page GET 200. No merge or Production release.

---

## 2026-10-12 — phased completion plan

See `IMPLEMENTATION_PLAN_2026-10-12.md` for the nine-block execution plan and per-block acceptance criteria. Current first large block: reconcile the canonical algorithm/specification and establish a current complete paid-road registry and dated operator tariff tables. Immediate specific conflict: re-fetch the primary Avtodor M3 category-I no-transponder table and compare it with the archived Oct 1 snapshot before updating any price data. Then proceed to selected-route evidence, per-system adapters, Yandex/operator route benchmarks, full build and Preview E2E. No Production publication without explicit release decision.

---

# Nationwide paid-road calculator — next engineering blocks
**As of:** 2026-10-11. Product decision: show only the minimum-time route and price only that selected geometry; see `DECISIONS.md` 2026-10-11. No alternative-route UI. Preview remains verified on source head `3d86e02`; latest docs-only Yandex controls are recorded in `RECONCILIATION_2026-10-11.md` and `WORK_LOG.md` (commits `015a9f9`, `2b378c9`, `812628d`). Preview only; no production release. **Safety:** experiments and preview only. The requirement is not fulfilled merely by a register or reference fare list.

- [x] **Inventory and operator map (SCOPE COVERED; not tariff complete)**: 22 groups representing major federal, municipal, regional and international toll road systems. `national-registry.json`, `SOURCE_AUDIT_2026-10-09.md`. Refresh with newly opened toll roads instead of claiming a permanent authoritative census.
- [x] **Versioned conditional offline fare core (CODE IMPLEMENTED, not live)**: 8 selected operator fare groups for M1/M3/Ufa/Tolyatti/Bagration/MSD/Kazan/Udmurt bridges, zero inference from mere geometry, accurate exclusive corridors, working-day peaks, plate/taxi exception preconditions, null incomplete.
- [x] **Strict national multi-operator composer (CODE IMPLEMENTED)**: `quoteNationwideTrip` requires all paid facilities checked, rejects missing/repeated/cross-route/unregistered, partial sums never returned as totals. No live route data adapter yet.
- [x] **V2 Preview catalog + candidate coverage UI (IMPLEMENTED)**: `/v2/toll-roads` and route results diagnostics; user can see exactly which road groups require work. No price cutover.
- [x] **P0 — native combined tests and browser smoke on latest code (VERIFIED)**: Vercel build deployment `dpl_DEWDeg7fWdkM8Lcr8fK88eycsDb4` from code `6917191f`: **235/235 PASS**, Next+TypeScript+14/14 pages; actual browser run `4227d920-4a18-4992-940b-d520ca07cbcd` Moscow→Voronezh shows M4 national candidate, 7 strict PVPs, no new amounts. See `WORK_LOG.md` phase B.
- [x] **P0 — second-road M3 physical PVP E2E BOTH DIRECTIONS (DONE at selected-route matching + source sample, NOT MONEY CUTOVER)**: Real M3 three-PVP 86/136/168 both directions: all six lane OSM IDs verified via OSM API + actual same-route Valhalla, E2E Москва→Калуга and reverse, 800₽ sample component on 2026-10-09, never included in actual fare. **Not done:** independent official operator whole-trip receipt/calculator cross-check, full current tariff effective date, full fare cutover. See M1_M3_EVIDENCE_2026-10-09.md.
- [ ] **P0 — implement fastest-route-only selector policy in new route pipeline:** enumerate valid candidates internally, select minimum travel time deterministically, expose exactly one route, and price only its geometry. Add regressions: fastest paid vs slower free, no alternative shown, tie-break determinism, incomplete toll evidence remains unknown. Scope: new version; keep current production untouched until acceptance gates pass.\n- [ ] **P0 — resolve disputed Yandex controls before any tariff change:** exact selected geometries and gates for Kazan—Naberezhnye Chelny (90/278), SPb—Kronstadt (600/300), and directional M4 Moscow—Krasnodar (5530/5260); match date/time, then compare dated operator calculator/receipt. Treat A-289 test as unresolved because Yandex geocoded destination incorrectly. See `RECONCILIATION_2026-10-11.md`.\n- [ ] **P0 — M1 PVP46 exact OSM mapping and reverse E2E (NEXT; still open after 2026-10-11 Preview verification):** Operator marks 33–66 paid km and PVP46, but both direction OSM IDs still unknown. Try full selected-route Valhalla Moscow↔Mozhaysk/Kubinka, collect toll edge end_osm_node_id, independently verify OSM barrier/name/coords; reject bare geographic proximity.
- [ ] **P0 — M3 tariff validity and full receipt (OPEN)**: Verify current dated operator tariff order and real operator complete road quote, vehicle class/payment method, all possible M3 paid access/exit legs. Shadow 800 RUB only Oct9 does not certify arbitrary trip or "all roads".
- [ ] **P1 — unverified non-M3 paid operator families (OPEN)**: expand true paid-edge graph proof/OD prices in ZSD, SHMSD, Mytishchi, Pskov, Khabarovsk and regional sectors.
- [ ] **P0 — official complete tariff matrices for remaining 14 groups**: prioritize ZSD, Odintsovo, Khabarovsk, Mytishchi, Ryazan, Pskov 4 sections, SHMSD/Vitebsk, Amur border bridge. Operator source links in SOURCE_AUDIT; record date, direction, all gates, category I/no transponder, historical version and holiday exceptions. Do not mistake concession operator partial table or legal maxima for exact customer fare.
- [ ] **P0 — automatic same-route nationwide paid-facility verifier**: model strictly matched OSM `toll_booth`/free-flow camera physical IDs for **all networks**, structured entry/exit/timestamp/paid edge and detected unknowns. Map matching must use the *selected* live geometry; candidate corridor proximity is NOT enough.
- [ ] **P0 — complete paid-road coverage detector**: prevent unregistered road/facility families from being classified as free. Bind urban networks (MSD/ZSD/Bagration, Mytishchi) separately from federal M1/M3/M11/M12 and regions. Account for overlapping networks (ShMSD and ZSD).
- [ ] **P1 — vehicle and transponder UX**: road-operator vehicle class based on physical dimensions/axles; user-provided Comfort/Comfort+ is a driver service class, NOT I/II/III/IV. Allow verified individual operator's native transponder plan only after tariff lookup supports it.
- [ ] **P1 — operator calendar/time integration**: timezone by road, actual passage times (not just departure), true holiday checks, weekend rules, MSD short-lived section closure changes and transit exemptions.
- [ ] **P1 — road benchmark suite**: 2+ operator-confirmed directed cases per network, full road + partial road + no-toll road, cross-network total, time boundary, same endpoint different ramps, plate/taxi exemption; compare with official journey calculator and ticket/receipt.
- [ ] **P1 — activated payment cutover**: only where all above verified, feature flag per road with previous legacy fallback only if independently justified; don't silently substitute old geometry estimate for unknown.
- [ ] **P1 — field E2E Android/desktop & Vercel Preview**: real routes in many regions; confirm no React DOM crashes, alt routes and minimum travel time sort, unknown displayed without invented zero.
- [ ] **P2 — continuous operator data maintenance**: dated snapshots, sources, change alerts and audit acceptance protocol. Deactivate stale rows instead of silently assuming valid.


## 2026-10-12 — tariff nomenclature and source refresh

- [x] Created `TARIFF_NOMENCLATURE_2026-10-12.md`: current 22-group registry mapped to tariff products/models, required route/class/payment/time inputs, known source signals and evidence state. It explicitly does not claim that 22 groups are an exhaustive national legal inventory.
- [ ] **P0 — reconcile current Avtodor M3 matrix:** compare official current tariff page/PDF with the saved 2026-10-01 snapshot. Search-indexed current page appears to show PVP 86: 100/200; 136: 190/320; 168: 230/280 ₽ (Mon–Thu/Fri–Sun) without transponder. Verify exact headings and effective date from the primary table and preserve a dated snapshot before editing runtime/reference data.
- [ ] **P0 — finish exact current fare tables across all 22 groups:** prioritize multi-OD/conditional operators and newly changed schedules (Odintsovo from 2026-01-15; Mytishchi 1 February notice; Ryazan from 2026-10-01; ZSD; Pskov's four independent roads; Khabarovsk route matrix). Store source dates, category I and base/no-transponder profile.
- [ ] **P0 — route controls:** for each proposed live row, use only one fastest Yandex route with fixed endpoints/date/time and passenger car under 2 m/no transponder; retain full geometry and estimate as a control, then reconcile to operator's exact entrance/exit/section tariff or receipt.
- No price row is accepted from a search snippet, legal maximum, ambiguous image/table column or route-level estimate alone.


## CURRENT 2026-10-12 — blocks 1–3 progress

Completed in isolated branch:
1. Canonical algorithm contract: `ALGORITHM_SPEC_2026-10-12.md`. Open: tie-break for equal ETA and code-level conformance.
2. Scope expansion: registry now retains 22 parent networks and includes 16 individual Avtodor products (M4/M11/M3). This remains partial; split Pskov into four IDs and continue official census of regional/concession roads.
3. Tariff source audit: M3 current official page is indexed but returned HTTP 403 to direct fetch; conflicting published snapshot rows remain unresolved. Do not change stored fares or call them verified until the live dated class-I no-transponder row can be read. Most operator tariff products still lack dated complete tables.

Next execution: get primary artifacts for Avtodor current M3 and all section tariffs; identify four Pskov road contracts/decision rows; capture operator tariff versions for Odintsovo, Bagration, ZSD/SHMSD, Khabarovsk, Mytishchi, Ryazan and remaining groups. For every amount preserve category, payment mode, effective date, periods, directions/OD and source artifact. Only after block 3 expands materially, proceed with blocks 4–6 on geometry evidence and route benchmarks.


# Local recovery updates through 13.10.2026

# Следующие действия

1. Получить актуальный head/source tree experiment/toll-od-matrix-2026-10-08; чтение AGENTS/docsWORK_STATE уже выполнено connector. Прямая git-сеть не авторизована; локальная audit-ветка не равна актуальной экспериментальной.
2. Прочитать текущие V3 route/API/result types и экспериментальные адаптеры; подключить engine/quote.cjs через точные routeId, traversalId, локальные passage date и тарифный профиль.
3. Отобразить displayLabel в UI/API/деталях/копировании. Не позволять нескольким перекрывающимся представлениям одной платной группы начисляться одновременно.
4. Запустить quote.test.cjs, матричный валидатор, требуемый full gate/build актуальной ветки и API/browser проверки.
5. Сохранить изменения и handoff в целевую ветку; выпуск тестового preview после проверок.

Current: V3 API/UI/copy wired, native305/305 + M4adapter6/6 + TS/build/local HTTP PASS. Next: remote persistence/Preview, live route verification; extend other-road matrix adapters. Do not call full nationwide matrix-to-route integration complete.

M12 dated-vector adapter now implemented; expired Shali blocks stale native fallback. Next: exact follow-up Preview, then remaining M11/CKAD/other-road adapters and live route/browser verification.

Yalta/Anapa → Krasnodar short-route fix: experimental commit ed34c4c, Preview dpl_CUGKzMqTn6D8H4cjoDTDpkNtD3z5 READY/GET200. Next verify actual selected route POST and exact Anapa exit; no main/Production.
