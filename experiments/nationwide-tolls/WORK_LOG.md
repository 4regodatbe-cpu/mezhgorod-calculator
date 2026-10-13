# Nationwide toll-road calculator — append-only work log

## 2026-10-09 — phase A: nationwide inventory, verified source examples and safe Preview diagnostics
**User request**: extend toll calculation to **all Russian paid roads**, not only M4. No repeat requirements questions; build autonomous blocks in isolated Git branch.

**Baseline discovered**: `lib/v2-calculation/route-leg-pricing.ts` had existing independent live M4/M11/M12/CKAD/A289 components, but M1/M3 detected by old `estimateTolls` were always `tolls:null` and the `regional` family collapsed Ufa/Tolyatti to an unpriced catch-all. Legacy `lib/toll-data/m1-m3.ts`, `regional-ckad.ts` contained approximate checkpoint geometry not independently verified toll evidence. `lib/toll-engine/other-road-current-tariffs.ts` already had official M1/M3/CKAD/A289 2026-10-01 amounts that were not fully wired. The new M4 PVP matrix remained empty.

**Implementation commits (this phase)**:
- `723d7b7366476ae367b5aba68e00474f41e3e1a6`: `national-registry.json` for 22 networks, strict `national-price.mjs` and standalone tests. Operator fare sources for M1, M3, Bagration, Udmurt Kama/Bui, Kazan Voznesensky, Moscow MSD. No assumption that register includes all toll points.
- `213313b236ee5689066f4ae1d538340a0ecc372e`: added Ufa East fixed 150 RUB and Tolyatti exclusive 210/140/320 RUB corridor fares, protecting full corridor from incorrectly summing 210+140.
- `d1d20b709250ac8d1447ad9bee4a5d1fee2b5a99`: `national-preview.mjs` route-family classifier, `lib/v2-calculation/route-leg-pricing.ts` and `route-leg.ts` attach `nationalTollCoverage`, UI collapsible `result-panels.tsx`, server static `app/v2/toll-roads/page.tsx`, link from main `/v2`, app DTO, extend `pnpm run build` to test both experiment suites. **No new money added to UI totals.**
- `2fe9ad2a862f4a929c120e1fb9a81c117b55339f`: MSD city fare on official working days only, same civil-date entry and exit checks, returns null for temporal mismatches and 0 only for independently verified truly free city pass.
- `672a768f4c8b2a5996db6b47bfa6588852941cde`: `quoteNationwideTrip` strictly sums only completely proven national road events, with no mixed partial totals; restricts future audit-unknown tariffs, invalid Gregorian dates, MSD CKAD-CKAD 24h requirement.
- `6917191f6be70561872a971cd904c9f665e4dda7`: found via actual browser E2E that legacy `estimateTolls` supplied no M4 segment labels even though real strict M4 PVP validator confirmed 7 paid gates. Updated national coverage inspector to accept independent system candidate signals from existing strict M4, M11, M12, CKAD production modules, **but still not bill based on mere candidate status**.

**Actual native tests & deployments**: At commit `672a768f`, Vercel deployment `dpl_5Y4dHFCLkHZeHVqLYUf1qqbYoBfF` was READY; combined `node --test experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs`: **232 PASS / 0 FAIL**, Next/TypeScript compiled and deployed successfully. Latest `6917191` additionally authors 3 coverage-focused test cases; must inspect **its own** Vercel build logs for exact total before upgrading the verified number. [This block may be completed in following log entry.]

**Live-browser E2E on commit `672a768f` Preview**: `/v2/toll-roads` renders all 22 systems; back navigation to V2 confirmed. Actual Москва→Воронеж produced 515.9 km / 6h45 / **3,060 RUB legacy M4 toll**, M4 strict validator identified 9 candidates, 7 paid points; national reference fares were **not added**. Browser uncovered a diagnostic omission: national indicator showed zero candidates because approximate legacy road segments were blank. Fixed in `6917191` by piping strict M4 actual signal; next E2E should show M4 as candidate.

**Source provenance and exclusions**: see `SOURCE_AUDIT_2026-10-09.md`. Operator sites for Avtodor, m-road, MSD, Kazan, Udmurt, Pskov, Ryazan, Transtoll and ZSD consulted. Unverified full ZSD OD, Mytishchi, Khabarovsk, Northern Odintsovo time-by-gate, Ryazan 2026 new tariff, Pskov 4 actual tariffs, international bridge not numerically loaded. It would be incorrect to claim all Russian tolls priced. 8 source-price groups only, many require exact working day, direction or camera proof.

**Release control**: experiments are hosted in Preview; `main`, PR #12 and Production remain unchanged. All new road table calculations are shadow/offline; existing customer fare remains legacy calculator. No background worker, scheduler or live data scraper started.

**Remaining**: build independent physical paid gate/zone extraction for each network, secure dated tariff matrices across all 22 and add official operator ticket/calc E2E, then enable strictly gated actual fare cutover by network. Avoid falsely claiming all roads done.

## 2026-10-09 — phase B: latest Preview verification, real-browser route regression, and confirmed handoff

- **Code revision actually tested:** `6917191f6be70561872a971cd904c9f665e4dda7`. This changed national candidate extraction to combine selected-route strict M4 PVP evidence and current M11/M12/CKAD engine signals with old geometry labels; still does not use tentative road names to bill money.
- **Vercel deployment inspected:** `dpl_DEWDeg7fWdkM8Lcr8fK88eycsDb4` `readyState=READY`, https://mezhgorod-calculator-pjfvyy2kq-4regodatbe-5310.vercel.app/v2 . Deployment logs show **235 native Node tests PASS, 0 FAIL**, then **Next.js compilation PASS, TypeScript PASS, static generation 14/14 PASS** (includes `/v2` and `/v2/toll-roads`). `/v2/toll-roads` independently fetched with HTTP 200.
- **Full actual browser E2E on that same deployed code:** TinyFish run `4227d920-4a18-4992-940b-d520ca07cbcd`, selecting Москва → Воронеж via address suggestions. Page calculated **515.9 km**, **6 h 45 min**, **3,060 RUB existing/legacy M4 toll**, with no new national price added. National collapsible diagnostic correctly reports **22 systems inventoried, 8 with selected operator fare rows**, and **М-4 «Дон»** as potential system on actual route. Separate M4 strict diagnostics shows **9 plaza candidates, 7 confirmed crossings** `m4-71 → m4-133 → m4-228 → m4-322 → m4-339 → m4-416 → m4-460`, new M4 full price rows **0**, reason `no_verified_complete_m4_pvp_tariffs`. No interface error in this run.
- **Earlier browser E2E** of `672a768f` showed national candidates empty due to absence of legacy M4 checkpoint matches **even while strict M4 PVP found seven**; fixed by `6917191f`. Retain this negative test as regression rationale.
- Documentation-only followup commit after `6917191f` does not change the tested code. **No proof** that all 22 systems are simultaneously priced. This phase implements inventory, selected offline operator rules, fail-closed national compositor and route-scoped Preview diagnostics; not an all-Russia invoice deployment.
- **Next executable task:** build a national paid-edge/camera and entry/exit graph-matching adapter with timestamp and vehicle class on selected route; validate actual source-issued whole-route tariffs in a second real network (e.g. M3) before gated billing cutover. Operator matrices for unpriced 14 groups remain incomplete. Record all findings in this log before the next handoff.

## 2026-10-09 — Phase C: M1/M3 physical PVP extraction, debugging, six named bidirectional M3 nodes and shadow quote

**User asked "Делай"**. Follow-up to the nationwide project. Objective: integrate M1/M3 exact physical passage detection and start matching operator rates **without inventing route tolls**. New scope M1 PVP46 km and M3 PVP86/136/168 km from Avtodor official sources (links in M1_M3_EVIDENCE_2026-10-09.md). Per user repository rule record each failed verification and correction.

**Source code commits**, all on `experiment/toll-od-matrix-2026-10-08`:
- `17cbd59bbe2f975a4b031f109e8945a594e7e7cb`: `m1-m3-official-gates.json` operator-km physical facility template; `m1-m3-gate-evidence.mjs` selected-route full Valhalla toll-booth evidence matcher, refuses unknown/incomplete/duplicate and `strictPriceAllowed:false`; 20 regressions authored.
- `4e126fad9e7cac63edec530848b3ea8104ebae76`: wires selected-route evidence to V2 API coverage diagnostics. **Vercel native tests 258/258 passed but TypeScript failed** due to missing `m1m3GateAudit` in return signature; fixed `eb01350e68cb11d76d7f1e9161eb6a062795f2fd`, Vercel READY.
- `b840d8e2f9981ca61704c2b22a6b23c97e065c9a`: explicit opt-in checkbox `Углублённая проверка ПВП` makes full-route `diagnostics:true` request to `validateTollEdges`; preserving default faster route UI and amounts. Vercel **262/262 PASS**, READY.
- `a4eae6929636cab56abcfc488181d47d31b205ac`: add unknown toll-booth candidate OSM IDs to UI. **263/263 native tests passed, Next JSX build FAILED** because new paragraph siblings were missing enclosing fragment. Fixed `0377e556e647a43766f64d5a8fcb20b2e7269bed`, Vercel READY **263/263**. Browser real Москва→Калуга 189.1 km/3h14, deep mode: 3 paid events on M3, 0 verified OSM nodes, IDs were null.
- `93e087129d4cf260a3bf96c8750cf82713bb0db4`: fixed full-route Valhalla trace attr `node.osm_id` → `edge.end_osm_node_id` with fallback; 3 additional tests, Vercel **266/266 PASS**. Repeated browser E2E resolves real M3 IDs `13294157951`, `4780909558`, `4780909555`.
- `1bb04415c6e691c1ce93e56f319f3e1a1752808c`: fetched each official `openstreetmap.org/api/0.6/node/...`, verified `barrier=toll_booth` plus explicit "ПВП 86/136/168 км", location and (where present) operator; appended to gate inventory with full provenance and regressions.
- `5608c39970a52d58a41f3c0a648175140198b95e`: `m1-m3-shadow-quote.mjs`, gated sample complete 3-PVP **M3 component only** computation, non-overlapping tariff date/profile and original `quoteNationalRoad` validation, 15 regression tests; `strictPriceAllowed` remains false for actual money.
- `0118196e5bc24caccc0e5b35ff21571fed64bcdd`: show M3 full 3-PVP shadow amount only when all data matches, otherwise unknown; actual route price unchanged. Vercel **285/285 PASS**, Next/TypeScript PASS, deployment `dpl_6z1EEyzUgqHwoKdx6f97GDd8vha7` READY. Browser forward E2E `d8d0756e-8e68-428d-9961-e6a852bf4061`: M3 **3 verified physical nodes, 0 unknown**, M3 component 800 RUB (2026-10-09 Friday), money **NOT charged to customer**. Browser reverse E2E `f50a7cf3-01c2-4b27-82d9-7967bec0eb3c`: reverse 187.8km/3h15, three unrecognized physical node IDs `4780909556`, `4780909557`, `13310936104`, no shadow price.
- `053b32c3a2d9619c4c3abfe83183ce883906e057`: independently fetched all **three reverse direction** nodes from OSM API; names/coordinates confirm reverse assignment 168km→136km→86km; added each to same facility's `verifiedOsmNodeIds`. Added 3 regressions including duplicate opposite-lane toll proof rejection.
- `04c253d23ade176a49b236032aebaa6c0d1a6498`: revised UI to say M3 directional physical nodes are verified while M1 remains unknown. Vercel deployment `dpl_AyBUbHjyX1mZFh6rA2wftV2Fv5ja` **READY**, 289/289 native Node tests PASS, TypeScript/Next PASS. Latest verified executable preview URL `https://mezhgorod-calculator-r6x9ndg7j-4regodatbe-5310.vercel.app/v2`.
- **Live browser reverse proof:** run `95dab92e-7e65-46cf-9509-9d4a64466aa7`, selected Калуга→Москва 187.8km 3h15, **3 confirmed named M3 OSM physical gates**, unmapped count 0, source Fri M3 shadow diagnostic **800 RUB**, **NOT added**; customer toll cost still unknown, standard fare shown without paid roads. No critical browser errors. Detailed six-node + three-run evidence in `M1_M3_EVIDENCE_2026-10-09.md`.

**Open blockers**: Physical OSM lane IDs for M1 PVP46 km not independently verified. Current official tariff effectiveFrom for M3 undated snapshot, no actual operator complete-trip receipt cross-check, no full paid-road all-operator graph guarantee, no quote monetary cutover authorized by evidence. 800RUB is correct sum of published section sample for **Oct9 Friday only**, not certified full selected route toll. Existing M4/M11/M12/CKAD/A289 money untouched. `main`, Production and PR #12 untouched.

**Immediate next block**: extract M1 PVP46 km OSM toll_booth identity on selected actual route via full-route Valhalla matching and official OSM API; test Moscow↔Mozhaysk or Kubinka, do not use 46km proximity to charge; compare complete operator source receipt including transponder, category and dates. Then complete comprehensive ZSD/other operator tariff matrices.


## 2026-10-11 — M1 scope and M3 tariff consistency desk audit

User requested autonomous large work blocks and report afterward. Added `M1_OPERATOR_SCOPE_AUDIT_2026-10-11.md` (commit 42b2527) and `RECONCILIATION_2026-10-11.md` (commit 56ecae5). Found source snapshot discrepancy: M3 shadow evidence Friday 800 RUB vs national-registry Friday components 100+190+230=520 RUB. Both unfit for customer billing until official version, full corridor operator receipt, and same-route proof. M1 mainline PVP46 is not Odintsovo bypass local PVP4.6. Updated handoff docs/WORK_STATE.md (commit 42efc7b). Checks: file/source review only; no Node test, TypeScript, Next build, browser E2E, Valhalla trace or deployment. Next: M1 directional physical OSM proof and authoritative tariff reconciliation.


## 2026-10-11 — Preview publication rechecked after M1/M3 audit

**User request:** finish the current authorized work through a test Preview publication in one block. The local scratch directory supplied to this Codex turn was not a Git checkout, so repository inspection and durable updates used the connected GitHub tools against the existing isolated branch; no local code edits were made.

- Verified branch `experiment/toll-od-matrix-2026-10-08` points to `3d86e02fedbd171286b26ede2d3072b07918fccc`. Open PR #12 remains a draft and is not part of this release path. No merge, main or Production change.
- Vercel deployment `dpl_F6X5FmYLNM9HNTWUHx6r7faTcfmY` is **READY** on the same branch/SHA. Build logs show the experiment test command (`node --test experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs && next build`), successful checks, static output for `/v2` and `/v2/toll-roads`, and deployment completion. The event response is truncated and does not expose the final aggregate test count; do not infer or claim that count here.
- Direct deployment fetches returned **HTTP 200** for both `/v2` and `/v2/toll-roads`. The calculator links to the nationwide catalog; that catalog displays 22 grouped systems and explicitly states that 8 partial published tariff groups are not full route pricing. This was an HTTP smoke check, not a browser route-calculation E2E.
- The resulting test link is `https://mezhgorod-calculator-ch4vpj2qn-4regodatbe-5310.vercel.app/v2`. This is a branch Preview only. New toll pricing remains shadow/diagnostic and does not enter passenger totals.
- Known blockers remain: M1 exact directional physical node mapping; M3 tariff source conflict (800 RUB shadow evidence vs 520 RUB current component sum); official full-route fare confirmation; missing complete paid-facility/tariff coverage for the remaining systems. No customer-price cutover was justified or performed.
- **Next executable block:** resolve M1 PVP46 selected-route OSM IDs in both directions and reconcile the M3 dated official tariff/whole-trip quote; then expand the same selected-route proof/tariff matrix to other operators.


## 2026-10-11 — Yandex Maps route-price controls for M1 and M3

User proposed using Yandex Maps to check actual toll estimates for chosen origin/destination pairs that cross the target facilities. Read-only route planning completed in the connected browser.

- M3 control: selected alternative Калуга→Москва shows **~290 RUB** (3h11/117 mi) and direction details follow Kievskoe highway/M3 before exit toward Минское highway; no M1 mainline/SOO in the shown sequence. Reverse Москва→Калуга selected third alternative shows **~290 RUB** (2h41/115 mi), following Kievskoe highway/M3 then R-132. Both detail panels state price is for passenger vehicle <2 m, no transponder, at estimated toll entry time. Yandex documents operator-sourced segment prices and time-dependent estimates: https://yandex.ru/company/news/01-19-10-2023 and https://yandex.ru/support/maps/ru/concept/rout-options.
- M1 control: Одинцово→Голицыно selected route shows **~50 RUB** (33 min/15.9 mi); directions explicitly include M-1, then exit/rejoin Можайское шоссе. Indexed official Avtodor tariff snippet lists full M1 33–66 km at PVP46 as 230 RUB T-pass / 250 RUB without. Official road page identifies the km33–66 paid segment and PVP46. Direct official tariff-page fetch returned HTTP 403, so the indexed table is evidence of a source snapshot, not an independently read tariff effective date.
- These observations help distinguish a partial route quote from a whole-segment price. They **do not** identify exact toll entry/exit gates or explain the current national-registry M3 row conflict (old shadow sample 800 RUB vs current component sum 520 RUB). Do not hardcode 50 or 290 as full-road tariff; do not enable either in passenger totals. Full detail and observed route URLs recorded in RECONCILIATION_2026-10-11.md.
- Checks: Yandex route UI observed, no login/payment/location permissions; operator source search performed; no code test/build/deploy. Current project branch is experiment/toll-od-matrix-2026-10-08; docs commit 95684d8. Next: map precise selected-route PVP gates/entry exits for these same endpoint routes; fetch exact official tariff row/version or use operator calculator for same passage time/class, then adjust control routes to isolate exact segment if needed.


## 2026-10-11 — Yandex Maps: спорные route alternatives и дальние контрольные образцы

**Запрос:** проверить сомнительные платные участки в Яндекс Картах и добавить пару сложных дальних маршрутов как контрольные образцы.

- Продолжены read-only маршрутные проверки в Yandex Maps на профиле пассажирского автомобиля <2 м, без транспондера. Отдельный сводный протокол добавлен в `RECONCILIATION_2026-10-11.md`.
- Казань—Набережные Челны: две альтернативы показывают около 90 и 278 ₽; их детали включают разные коридоры Вознесенский тракт / М-12 / М-7. Это заметный спорный case; без закрепления геометрии и ПВП суммы не сводить и не использовать как tarif.
- Санкт-Петербург—Кронштадт: около 600 и 300 ₽ на вариантах, в деталях обоих есть ЗСД. Вероятен разный въезд/съезд/пробег по ЗСД; точную пару ворот не установили.
- Дальние controls: СПб—Москва около 6 150 ₽ (виден ЗСД; вся разбивка по операторам не доказана); Москва—Казань около 5 250 ₽; Москва—Краснодар около 5 530 ₽ и Краснодар—Москва около 5 260 ₽. Последняя разница 270 ₽ отмечена как требующая сравнения при одинаковой дате/времени и выборе, а не как подтвержденная тарифная асимметрия.
- Попытка контрольного маршрута к Анапе разрешилась в интерфейсе не в точку назначения, а в «площадь Советов»; карточка показала ~620 ₽, но доказательства, что путь проходит по A-289, нет. Эта сумма явно исключена из тарифа A-289.
- Итого: дополнили Яндекс-контроль по M1/M3 из предыдущей записи, ЗСД, Казань/М12 и нескольким дальним маршрутам. Это **не** проверка всех 22 семейств реестра; остаются открытыми точные route/gate cases для ZSD, SHMSD/Vitebsk, Mytishchi, Pskov, Khabarovsk, Ryazan, regional bridges и Odintsovo bypass. Детальный список и ограничения в reconciliation.
- Нет изменений кода/тарифной базе, цены пользователей не менялись. Тесты, build и deployment не запускались для этого docs-only блока. Рабочая ветка остается изолированной `experiment/toll-od-matrix-2026-10-08`; Production не менялся. Запись reconciliation добавлена commit `015a9f9c88397301d4546f9e1375eb3c62fd8d28`.
- **Следующий шаг:** взять спорные пары по конкретным системам из reconciliation, зафиксировать endpoint/альтернативу/время и exact paid gates на той же геометрии, затем сверить сумму с операторским калькулятором/чеком и действующей датированной ставкой.



## 2026-10-11 — продуктовое правило: один самый быстрый маршрут

**Пользовательское уточнение:** новая версия калькулятора ищет и показывает только самый быстрый маршрут. Если на нём нет платных дорог — маршрут бесплатный; если есть — используется именно этот самый быстрый платный маршрут. Никаких альтернатив пользователю не показывать.

- Решение добавлено в `experiments/nationwide-tolls/DECISIONS.md` и является обязательным для будущей новой версии/route pipeline.
- Маршрутизатор должен выбрать минимальное время до подсчёта платы; тарификация анализирует только геометрию/въезды/съезды выбранного маршрута. Нельзя переключаться на более медленную бесплатную альтернативу или смешивать цены вариантов.
- Различия, наблюдавшиеся между вариантами Казань—Набережные Челны и СПб—Кронштадт, сохраняются в аудите для проверки геометрии, но не являются пользовательской выдачей нескольких вариантов.
- **Fail-closed:** отсутствие подтверждения о платности или полном тарифе не трактуется как бесплатная дорога/ноль; сохраняется unknown по ранее утвержденным правилам.
- Это пока задокументированная политика, не внедрение: никакие production алгоритмы, UI, тарифы и текущий selector не менялись. Unit tests/build/deploy не запускались.
- Источник: прямое решение пользователя в сообщении от 2026-10-11. Последний commit этой записи: `ad4ccb1e18f87d2952b25f38d9b400b4cb4b9a7e`.
- **Следующий шаг:** доработать будущий route-selection acceptance suite: самый быстрый платный против более медленного бесплатного; только выбранный маршрут тарифицируется; детерминированный tie-break при равном времени; неполные toll signals остаются unknown.


## 2026-10-11 — уточнён контрольный профиль Яндекс.Карт

Пользователь подтвердил правила проверки стоимости выбранного маршрута: корректировать по дню недели/дате и ожидаемому времени проезда, использовать легковой автомобиль (категория I там, где применима), основной тариф без транспондера и без льгот, фиксировать точные въезды/съезды/направление только на единственной самой быстрой геометрии Яндекса. Альтернативы не тарифицируются и не смешиваются; калькулятор показывает один маршрут. Этот профиль добавлен в `DECISIONS.md`.

Граница доказательства: маршрутная оценка Яндекса подходит как согласованный контрольный ориентир при совпадении профиля и геометрии; она не всегда является операторским точным тарифом/чеком. При доступной только приблизительной оценке сохранять сам факт наблюдения и дату/время, но точность денежной суммы подтверждать тарифом оператора для тех же условий. Не подтверждённую плату не превращать в ноль. Код не менялся; тесты/build не запускались. Документационный commit правила: `bf2427651e24e64f3ef51e4f834cbccf9176fa00`.


## 2026-10-11 — выбранная геометрия платного маршрута исправлена

- **Изменён код:** `lib/v2-calculation/route-leg.ts`, commit `53fda104234b491026116d833267c28afe0db53a`. Раньше по имени provider могла выбираться геометрия главного Valhalla ответа даже когда победил отдельный Valhalla-кандидат; toll route validation и геометрия результата могли разойтись. Теперь выбранный объект находится по точному имени кандидата, и его же `coordinates` идут в `routeGeometry`. Если победитель относится к Valhalla, именно он передаётся как `valhallaEvidence` после нормализации имени provider для production M11/M12 engines. В fallback V2 поведение выбора прежнее, так как имена provider остаются первичными.
- **Preview build:** Vercel deployment `dpl_AZ2ZXmo3MCV4gmwqVbUekCYhFNGi`, READY; source head на момент сборки `19cd0de1...`, в котором содержится fix `53fda104...`. Build log подтверждает node test suite с проходящими тестами (в логе видно 36 отдельных test rows), Next compile, TypeScript, статические страницы 16/16 и Deployment completed. В pipeline нет итоговой TAP summary; не фиксировать неподтверждённое общее число тестов.
- **Runtime check:** GET к `/api/v3/calculate` вернул ожидаемый HTTP 405 (endpoint требует POST). POST/E2E маршрут не запускался: TinyFish не начал сессию, так как баланс кошелька `-$0.22`; инструмент указал, что нужен top-up. UI/route output на исправленном Preview не подтверждены пользовательским сценарием.
- **Следующий шаг:** пользователь может тестировать preview по ссылке ниже; после доступной браузерной сессии прогнать Однинцово—Голицыно, M3 Калуга—Москва и дальний контроль, сверить single-route output и status с Yandex на профиле из DECISIONS.md. Расхождение цены/unknown не переводить в exact tariff без операторского документа для совпадающих gates.
- **Release:** Production и default branch не менялись.


## 2026-10-12 — tariff nomenclature across the current national registry

- Added `TARIFF_NOMENCLATURE_2026-10-12.md` in commit `9789fdfaa051eaf51cfcc0ccafdc91aa42afe596`. The document describes the fare product/model, parameters required for exact calculation, source and evidence state for each of the 22 current registry groups. It distinguishes operator/road charging models (open PVP, closed OD, corridor, free-flow sections, zone/time/transit/cross-border) and records current source signals without treating a road-level sample as a route fare.
- Checked current official/indexed sources for Avtodor, M-road, VIS/Transtoll, Voznesensky and Udmurt RIK. Fresh Avtodor tariff-page search excerpt yields M3 category-I no-transponder amounts 100/200, 190/320, 230/280 ₽ for PVP86/136/168 by Mon–Thu/Fri–Sun; these differ from the saved Oct 1 snapshot. They remain flagged for primary-table column/effective-date verification before updating machine data.
- Current operator evidence surfaced: Mytishchi free-flow five-section model and notice of new tariffs effective 1 February (year must be fixed); Khabarovsk has 5 barrier PVPs (2 mainline, 3 ramps), so the visible 20 ₽ is not assumed to be a whole-route fare; M-road announced revised Odintsovo base rates from 2026-01-15; Ryazan operator announced tariff change from 2026-10-01.
- Search/search-index review only in this block; no Yandex route calculation was run, no machine tariff rows were changed, no tests/build/deployment were run. The previous saved Yandex controls remain route controls, not operator receipts. V2/Main/Production were not published.
- Next: fetch/reconcile the actual dated tariff documents and full route matrices, starting with M3 snapshot conflict, Odintsovo PVP-by-direction/time, ZSD OD tariff PDF, Mytishchi current section table, Ryazan Oct-2026 schedule, Pskov four separate roads, and remaining uncovered operator families. Verify representative fastest-route geometries and under-2m/no-transponder Yandex estimate on same endpoints/date before accepting a row.


## 2026-10-12 — end-to-end implementation plan

- Added `IMPLEMENTATION_PLAN_2026-10-12.md` in commit `d1c996b1d779979f79449fdfd3ac327f469d8aaa` at the user's request for a phased plan from current status to algorithm announcement.
- The plan separates the completed product decisions/prototypes from open nationwide tariff coverage, route geometry, operator tariff source work, benchmark checks, integration gates and release controls. It has 9 substantial blocks, per-block deliverables and acceptance criteria, and a batch order for execution.
- It records the M-4 symmetric span model, one fastest route only, category-I/no-transponder checks, fail-closed unknown handling, current empty M-4 price matrix, stale legacy timed-quote build failure and distinction between Yandex estimates and operator-confirmed tariff.
- Documentation-only operation: no tests, full build, route checks or deployment run. The plan does not authorize Production or merge.


## 2026-10-12 — выполнены рабочие подэтапы блоков 1–3

- **Блок 1 / спецификация:** добавлен `ALGORITHM_SPEC_2026-10-12.md` как единый нормативный контракт изолированного V3: только fastest-by-time, одна геометрия, passenger car/category I при соответствии, без транспондера и льгот, дата и локальное время фактического платного события, unknown при неполном proof, отдельные модели операторов, M-4 по полной непрерывной ПВП-цепочке с двумя готовыми значениями и без runtime суммирования. Найден открытый край: tie-break равного ETA пока не определён и не проверен кодом.
- **Блок 2 / scope:** `national-registry.json` дополнен 16 детальными тарифными продуктами Автодора: 10 М-4 секций, 4 М-11 продукта и 2 М-3 секции, поверх прежних 22 родительских сетей. Источник https://russianhighways.ru/for_drivers/pay-sites.php. Это официальное расширение только части реестра, не полный юридический census РФ; Псковские дороги пока остаются одной parent group.
- **Блок 3 / тарифы:** сохранён conflict audit М-3. Официальный поиск от 2026-10-12 индексирует актуальную тарифную страницу, но прямая загрузка даёт 403. Индексируемые цифры не позволяют однозначно разрешить расхождение с архивным тарифным снимком/подписанными приказами: effective date и колонка категории I/no-transponder не проверены. Действующие money rows не изменены. Никакие точные цены не получены из Яндекс-маршрутной оценки или правового предельного тарифа.
- **Изменённые файлы:** `ALGORITHM_SPEC_2026-10-12.md`, `national-registry.json`, `DECISIONS.md`, `TARIFF_NOMENCLATURE_2026-10-12.md`, `IMPLEMENTATION_PLAN_2026-10-12.md`. Коммиты: spec `801750e`, registry `47ae694`, decision `2cec76e`, nomenclature `33f7c85`, plan `ad090b6`.
- **Проверка:** документы и JSON получены из ветки; JSON был разобран через `JSON.parse` до записи. Автотесты, build, кодовые изменения и проверки live route не запускались в этом подблоке. Production/default branch не менялись.
- **Следующий порядок:** закрыть exact primary tariff rows с Автодором/Псковом/операторами, разнести четыре Псковских продукта, продолжить полный census по официальным решениям и другим операторам; затем блок 4 (coverage доказательства на fastest geometry), 5 (адаптеры), 6 (Яндекс+операторские route controls), 7–8 build/E2E. Публичное объявление только после критериев приёмки.


## 2026-10-12 — попытка проверки маршрутов с датой в Яндекс Картах

- Запрошены будние/выходные проверки всех 16 дочерних продуктов Автодора плюс 8 ключевых/дальних маршрутов. Контрольные даты подготовлены: вторник 2026-10-13 и суббота 2026-10-17, одно время отправления MSK.
- Browser UI: Opera connector ответил Browser not connected. TinyFish run не стартовал и вернул wallet_out_of_funds, баланс -0.221166 USD; новых действий в Яндекс Картах не произошло. Повторно запускать без восстановления баланса нельзя.
- Составлена матрица `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`; все результаты пустые/TBD. Старые route estimate заметки не перенесены как свежие подтверждения.
- Статус: маршрутные проверки будни/выходные блокированы недоступностью UI/автоматизации. Текущие тарифы Яндекса не установлены этим запуском. Никаких изменений тарифных строк/кодового runtime не сделано, Production не затронут.
- Для продолжения нужен доступный подключённый браузер Opera либо восстановление баланса TinyFish; после этого выполнить запросы в матрице и сохранить для каждого дату, ETA, геометрию, сумму/отсутствие суммы, скриншот и URL.


## 2026-10-12 — встроенный браузер: Яндекс route/date benchmark и M-4 snapshot cells

- Встроенный Cloud Chrome доступен из текущей сессии независимо от того, что пользователь пишет с телефона. Перешёл к Яндекс Картам внутри Cloud Chrome и выполнил выбор даты в настройках маршрута.
- Профиль UI: автомобиль, легковой; «Избегать платных дорог» выключено; время отправления 12:14. Выбраны Вт 2026-10-13 и Сб 2026-10-17.
- **Сочи → Ростов-на-Дону:** fastest card: Вт 8 ч 8 мин / 340 mi / ~850 ₽; Сб 7 ч 53 мин / 340 mi / ~1 000 ₽.
- **Сочи → Шахты:** fastest card: Вт 9 ч 21 мин / 390 mi / ~1 230 ₽; Сб 9 ч 13 мин / 390 mi / ~1 450 ₽.
- В соответствии с прямым пользовательским правилом суммы принятия Яндекса записаны как confirmed route-card amounts только для этих OD/time/date и пользовательски заданных PVP-векторов: [1223,1184,1093] = 850/1,000; [1223,1184,1093,1046] = 1,230/1,450. Разница за дополнительный ПВП на этом benchmark: 380/450.
- **Москва → Краснодар:** Вт 15 ч 37 мин / 840 mi, Яндекс помечает платную дорогу, но тарифа не показывает; route toll остаётся unknown по данным этой карточки.
- Исходная страница результатов: `experiments/nationwide-tolls/YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; матрица обновлена `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`.
- Изолированная matrix `experiments/toll-od-matrix/matrix/m4-pvp-corridors.json` теперь содержит 2 Яндекс-confirmed span cells и окно снимка до 2026-10-17. `runtimeEnabled=false` сохранён; тарификация Preview/Production не переключалась.
- Проверка схемы после записи: JSON разбирается; 2 ячейки имеют известные PVP, endpoints совпадают с chain, цены — безопасные целые RUB, даты валидны и URL https. Полные Node unit tests/CI/build после обновления matrix не запускались.
- Предыдущий запуск TinyFish был заблокирован кошельком, а Opera connector недоступен, но это не является текущим блокером: встроенный браузер успешно решил UI часть. Полная проверка remaining 16 products and operator/control routes всё ещё впереди.
- Commits: results `09469fc`, matrix cells `1681ea5`, test-matrix update `2d020fc`, Yandex-adoption decision `a7d2bee`.


## 2026-10-12 — датированные проверки Яндекс: Казань—Набережные Челны

- Использован встроенный Cloud Chrome. Яндекс Карты построили маршрут легкового автомобиля от ул. Баумана (Казань) до площади Азатлык (Набережные Челны); время выезда 12:14 задано через date-time route setting.
- Будний 2026-10-13: fastest 3 ч 19 мин, прибытие 15:33, 150 mi; цена платного участка в активной карточке не показана.
- Выходной 2026-10-17: fastest 3 ч 18 мин, прибытие 15:32, 150 mi; цена не показана.
- Вывод: сохранить оба как наблюдения Яндекса без тарифа; отсутствие цены не равно 0. Ранее виденное «~90 ₽» было для «сейчас» и не подтверждает ни одну из этих дат.
- Обновлены `YANDEX_DATE_TEST_RESULTS_2026-10-12.md` (commit `693ca2e`) и `YANDEX_DATE_TEST_MATRIX_2026-10-12.md` (commit `12dcea5`).
- Общая база по-прежнему далека от 100%: большинство систем/векторов не имеют датированных цен, scope registry сам по себе не исчерпывающий; runtime остаётся выключенным. Следующий шаг — продолжить датированные route controls по спорным продуктам, затем официальные тарифы и remaining matrices.


## 2026-10-12 — второй пакет датированных Яндекс-контролей

- СПб (Дворцовая набережная, 38) → Кронштадт (Якорная площадь, 1): fastest 1:01/30 mi без показанной цены в будни и 1:05/30 mi без цены в выходной; более медленная карточка содержит ~300 ₽. По правилу fastest-only 300 ₽ не используется; предыдущие 600/300 не подтверждены для активной карточки этих концов маршрута.
- Москва (Красная площадь, 1) → СПб (Дворцовая набережная, 38): fastest 7:27/440 mi/~4,760 ₽ во вторник 13.10; 7:19/440 mi/~5,550 ₽ в субботу 17.10, отправление 12:14. Это whole-trip контроль смешанных продуктов М-11; не распределять сумму между операторами без breakdown Яндекса.
- Подробности и воспроизводимые ссылки: `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; матрица расширена, но большинство продуктов остаются TBD.
- Коммит результатов: `4e17a30`; матрица: `e116cc2`. Проверка выполнена визуально через Cloud Chrome и свежую AX-карточку. Не выполнялись исходные тарифные сверки/тесты сборки, цены не включены в runtime.


## 2026-10-12 — контроль Москва—Краснодар и Москва—Казань

- Москва (Красная площадь, 1) → Краснодар (Главная городская площадь), fastest: вторник 13.10 15:34/840 mi/~5,040 ₽; суббота 17.10 15:52/840 mi/~6,090 ₽. Сохранено как whole-route M4 estimate; не распределять по каждому span/PVP. Значения расходятся с ранее записанными контролями с иными endpoints/time snapshot; требуется отдельная сверка.
- Москва → Казань, ул. Баумана: вторник 8:48/510 mi, суббота 8:37/510 mi; обе активные карточки отмечают паром и платную дорогу, но суммы не показывают. Не считать это валидным чистым M12 прайс-контролем; unknown.
- Подробности в `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`, индекс — `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`. Коммиты results `13d2ea5`, matrix `82000fd`. Runtime/tariffs не изменялись; operator-source checks/build/tests не запускались.


## 2026-10-12 — локальный M4 Yandex control: Липецк—Воронеж

- Проверены обе даты на маршруте площадь Ленина-Соборная (Липецк) → площадь Ленина (Воронеж): вторник fastest 2:01/78 mi/~230 ₽; суббота 2:01/78 mi/~360 ₽. Карточка называет платный обход Задонска и Хлевного.
- В открытых деталях Яндекс прямо указывает расчет для легковой машины высотой <2 м, без транспондера, на момент выезда с платного участка, и говорит, что тарифные сведения поступают от операторов. Это подтверждает цену whole selected OD как Yandex output.
- Exact PVP vector не показан в UI; поэтому сумма НЕ попала в `experiments/toll-od-matrix/matrix/m4-pvp-corridors.json`. Нужна трассировка geometry к крайним ПВП прежде, чем seed exact span.
- Подробности: `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; matrix append commit `af7c4ed`, result commit `cb43927`. Runtime, build and tests not changed/run.


## 2026-10-12 — ранний М‑4 контроль Домодедово—Кашира

- Яндекс разрешил адреса ул. Каширское шоссе, 32 → Советская улица: fastest будни 1:04/50 mi/~310 ₽; выходные 1:15/50 mi/~400 ₽; отправление 12:14. Выходная подробная карточка подтверждает авто <2 м без транспондера и сумму на момент выезда.
- Route detail включает съезд с E115 на Каширское шоссе. Номера ПВП не выводятся; сумма добавлена только в OD/date benchmarks, не в M4 exact span table.
- Results commit `b24c728`; matrix commit `350e9b1`. Tests/build not run; runtime unchanged.


## 2026-10-12 — сводка Yandex-control пакета и уточнение числа пар

- Block 6 плана синхронизирован с фактом: **8** маршрутных OD пар имеют оба датированных прогона (M4: Sochi—Rostov, Sochi—Shakhty, Moscow—Krasnodar, Lipetsk—Voronezh, Domodedovo—Kashira; mixed M11 Moscow—SPb; спорные Kazan—Naberezhnye Chelny и SPb—Kronstadt). Москва—Казань — отдельный не засчитанный контроль из-за паромного маршрута/непоказанной суммы.
- Из 8 пар лишь часть имеет показанный fastest-fare; две exact PVP-chain пары seeded как M4 span values. Остальные Yandex fares держим OD benchmark only до установления PVP sequence.
- План commit `b4a9961`; состояние проекта commit `d21aa1e`. Runtime остается выключенным; 100% покрытия тарифной базы не достигнуто.


## 2026-10-12 — срочная фиксация тарифных кандидатов Автодора по М-4

- **Запрос пользователя:** максимально быстро закрывать тарифную матрицу, сразу сохранять данные в рабочую ветку, вести подробный журнал с основаниями, решениями и следующими шагами; последующие уточнения/исправления допустимы.
- **Что сделано:** создан `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`. Внесена транскрипция 21 строки тарифа М-4 с официальной страницы Автодора (включая отображённые числа, ПВП/идентификаторы, диапазоны км и названия участков), предполагаемые ставки категории I без транспондера — Пн–Чт и Пт–Вс — и флаги неопределённости. Для строк 62 км и некоторых параллельных тарифных записей профильная колонка оставлена нерешённой.
- **Основание:** официальная таблица https://avtodor-tr.ru/road/tariffs/ ; её поисковый снимок показывает по М-4 строки от ПВП 62 до 1223 км и ДЗОК. Страница сообщает, что тариф действует с даты в приложенном подробном документе; effective date и полная разметка колонок в этом снимке не установлены. Яндекс-контроли Липецк—Воронеж (~230/360 ₽) совпали с предполагаемой ставкой обхода Задонска/Хлевного 416+460 км; Домодедово—Кашира (~310/400 ₽) совпал с предполагаемой ставкой строки 71 км. Эти совпадения не доказывают полную цепочку ПВП выбранных OD.
- **Решения/ограничения:** пользователь разрешил быстро записывать кандидаты сейчас и уточнять позже; поэтому значения внесены как candidate, с исходной последовательностью чисел и provenance. Не выдавать их за окончательно проверенные строки до сверки PDF/колонок/даты. Не переносить отдельную тарифную строку или whole-route сумму в точную span cell без установленного PVP-вектора. `runtimeEnabled=false`; Production и V2 не менялись.
- **Проверки:** JSON собран структурно и отправлен через GitHub Contents API. Коммит данных: `11f63bdf2f59ca4fbc545461960c14665f7c5db0`. Кодовые тесты/сборка не запускались: это data-only commit.
- **Дальше:** (1) найти и разобрать PDF, чтобы установить колонку категории I/no-transponder и дату действия; (2) расширить inventory по М-1/М-3/М-11/М-12/ЦКАД/А-289/региональным объектам тем же быстрым candidate-first способом; (3) формировать M-4 span цены из полных смежных тарифных строк и уже подтверждённых маршрутных векторов; (4) после заполнения прогнать валидаторы и выпустить исправления отдельным коммитом.


## 2026-10-12 — M-4 candidate rates reconciled against existing Yandex controls

- **Что сделано:** в `TARIFF_CANDIDATES_2026-10-12.json` добавлены три derived span candidate rows: [1223,1184,1093] = 850/1000 ₽; [1223,1184,1093,1046] = 1230/1450 ₽; [416,460] = 230/360 ₽. Первая и вторая получены суммой кандидатных тарифных строк Автодора и точно совпадают с сохранёнными Яндекс-контролями Сочи—Ростов и Сочи—Шахты. Третья совпадает с Липецк—Воронеж и официальной строкой 401–464 км, где совместно указаны ПВП 416/460.
- **Почему:** пользователь попросил ускорить заполнение и разрешил сохранять данные до последующих уточнений. Векторное правило сохраняется: цены храним готовыми строками для целого вектора, не выполняем runtime суммирование. Суммирование применено только офлайн для сборки кандидата из официальных компонентов.
- **Основание/статус:** официальный веб-снимок Автодора https://avtodor-tr.ru/road/tariffs/; Яндекс observations в YANDEX_DATE_TEST_RESULTS_2026-10-12.md. Сходство ставок с Яндексом подтверждает правильность кандидатной интерпретации профиля для южных строк, но дата действия тарифного PDF и exact PVP chain Lipetsk→Voronezh ещё не подтверждены. Три ячейки здесь candidate; исходная production-isolated M4 matrix пока оставляет только две уже принятые Yandex cells.
- **Коммиты:** первичный тарифный снимок `11f63bdf2f59ca4fbc545461960c14665f7c5db0`; этот cross-check `3363fcdbb0829e9a79e99979b8315a5183bff389`.
- **Проверки:** проверена арифметика сумм и равенство опубликованным Яндекс-контролям; тесты и сборка не запускались (данные/документы только).
- **Следующее:** расширить candidate capture остальными официальными тарифными таблицами. Для М-4 не снимать candidate-флаги, пока не получены даты действия PDF и карта точек ПВП; затем одним data commit сгенерировать все нужные span cells.


## 2026-10-12 — M-12 and M-11 dated official tariff rows captured

- **Что сделано:** в `TARIFF_CANDIDATES_2026-10-12.json` добавлены два тарифа из индексированных официальных PDF Автодора: М-12 bypass km 1148–1211, категория I — 325 ₽ Пн–Вс; М-11 Санкт-Петербург km 679–681 / 681–684, категория I — 56 ₽ Пн–Вс. Оба документа указывают вступление в силу 02.03.2026 00:00 МСК. M-12 document identifies cash, card and interoperable transponders under same rate, satisfying base no-transponder scope for that section.
- **Почему:** ускоряем заполнение всех tariff candidates и фиксируем датированные operator values сразу; полные matrices затем будут собраны по каждому оператору/вектору.
- **Источники:** M-12 https://avtodor-tr.ru/upload/iblock/fe5/a2e7y350b1wrbw28x181m10z1eeblnfd.pdf ; M-11 St Petersburg https://avtodor-tr.ru/upload/iblock/402/k44r7q8jiukdw84ropm7pgd9khjh5o4h.pdf . Поиск также выдал ЦКАД full node rates, но payment-column meanings still require full official PDF and thus not yet transcribed into accepted cells.
- **Статус:** source-dated exact product rates; does not close whole M-12 or whole M-11 tariff matrix and is not yet wired into route engine.
- **Коммит данных:** `ab915c42e4ef420aea086af7963ad1c755770643`. Tests/build not run; data-only update. Next: capture full dated M-12 national rows and full operator PDFs for M-1/M-3/M-11/ЦКАД/A-289 and regional roads.


## 2026-10-12 — bulk capture of remaining Avtodor indexed schedules

- **Что сделано:** в `TARIFF_CANDIDATES_2026-10-12.json` сохранены raw tariff rows с официальной страницы Автодора для М-1 (1 строка), М-3 (3), М-12 mainline (25), ЦКАД (16, включая полный круг), А-289 (6 ramp pairs), обхода Тольятти (3 OD тарифы). Числа сохранены ordered arrays ровно в порядке выдачи источника; период/класс/payment columns не переинтерпретируются без PDF.
- **Почему:** по запросу нужно максимально быстро закрывать матрицу, а не ждать уточнений. Сначала сохраняем весь найденный официальный числовой материал; после этого превращаем его в профильные fare cells по PDF и Yandex controls.
- **Основание:** официальная страница `https://avtodor-tr.ru/road/tariffs/`, результат indexed content от 2026-10-12. Поиск показал для М-12 mainline все listed sections 33–1430 км; для ЦКАД все 16 rows; для А-289 6 ramps. В строке 1205 (Исаметово—Асяново) 325 ₽ I category additionally matched dated official Appendix 3 (effective 2026-03-02). Other raw rows stay candidate pending PDF headers/date.
- **Не делалось:** raw schedule arrays НЕ преобразованы в `national-registry` prices, M-4 span matrix или route-runtime fare. Это не молчаливое утверждение о точном тарифном профиле.
- **Commit data:** `5559ee2012f3dd7f55c7d557878658f6dd3f257a`; docs/data only, no tests/build.
- **Следующее:** скачать/прочесть тарифные PDFs, задать точные profile mappings and effective intervals; затем сгруппировать M-4 continuous spans и complete operator-specific matrices; выполнить validators and coverage checks.


## 2026-10-12 — complete M-11 15–58 km no-section-transponder matrix captured

- **Что сделано:** добавлены все 42 направленных тарифных пары между семью узлами участка М-11 15–58 км в `TARIFF_CANDIDATES_2026-10-12.json`. Сохранены пять ценовых окон: каждый день 01:00–06:00; Пн–Чт 06:00–01:00; Пт; Сб; Вс (дневные окна до 01:00 следующего дня). Профиль PDF: группа 1, включая легковые машины высотой ≤2 м; прямо указано отсутствие транспондера секции 15–58. Действие с 12.01.2026 01:00.
- **Почему:** это полноценная тарифная матрица независимого оператора; native time/day bands должны сохраниться, поскольку общая M-4 модель Пн–Чт/Пт–Вс сюда не подходит.
- **Источник:** официальный PDF М-11 https://m11-neva.ru/upload/iblock/efd/jchklu42unx7iu0avbw123k314l3w6dk.pdf (стр. 1–2), список действующих документов https://m11-neva.ru/documentation/ . Данные переведены по таблице из PDF, не из Яндекс-карточек.
- **Проверка:** JSON повторно прочитан из ветки и распарсен; проверено 42 клетки, 7 origins, 5 bands, все значения целые числа, null отсутствуют. Commit data `c6e544edf501937410c2e04ba083632ccba7d8cb`. Tests/build not run (data-only).
- **Открытый вопрос:** правило выбора времени в операторской таблице на маршруте, пересекающем временную границу, не кодировали; проверить по правилам ОССП до route engine integration. Далее — добавить pricing table для М-11 58–679, М-4/M-12 others and external operators.


# Local recovery updates through 13.10.2026

# Toll tariff matrix work log

## 2026-10-12 — user triage decisions, route controls, and audit cleanup

- **User decisions captured:** A-289 fastest route Maryanskaya→Temryuk is 620 RUB; full paid-road vector through to the Crimean Bridge is 800 RUB; the previous 1,103-RUB interpretation is wrong scope and excluded. Heihe is 1,320 RUB in both directions. SHMSD, ZSD and Khabarovsk are excluded. For fixed-price candidates, use Yandex's fastest route between points before/after the toll crossing, repeat with endpoints reversed, and exclude fares unavailable in Yandex and open sources. Keep Odintsovo and MSD on official published schedules, with Yandex route controls still needed.
- **CKAD control:** saved a live Yandex Maps route check in both directions between M-10 Russia 45th km and the selected Kaluzhskoe highway—PK5 toll-plaza point. The forward fastest route displayed approximately 972 RUB; the reversed fastest route displayed no toll estimate. Neither endpoint pair is proven equivalent to the operator's exact matrix junction nodes. This is diagnostic evidence only; do not replace the official 3,189-RUB M-10→PK5 matrix cell with it.
- **Current open-work ledger:** 13 active groups: #1 M-11 closed, #11 Heihe closed; #2 CKAD/A-289 partial, #3 M4 partial, #4 M12 partial, #5 Odintsovo partial, #6 Pskov partial, #9 MSD partial, #12 Mytishchi open, #13 fixed-price-road/Yandex checks partial, #14 traversal model and #15 completeness percentage deferred to final review, #16 intended branch persistence blocked. #7 SHMSD, #8 ZSD and #10 Khabarovsk are excluded. This is 2 closed, 7 partial, 3 open/deferred and 1 blocked; it is not a tariff-completeness percentage.
- **State correction:** updated `WORK_STATE.md` to remove stale A-289-conflict and excluded-road blockers, and revised the next action list. Historical entries in this log that reported 1,103 RUB as the no-transponder whole-road fare or 441 M-11 cells remaining are earlier observations; they are superseded by the user's scope decision and later complete Order 274 transcription.
- **Validation:** source snapshot files and tariff candidate JSON parse. CKAD endpoint mismatch, Yandex estimate and reversed direction are explicitly marked non-authoritative for matrix pricing. No runtime integration, V1/V2 edits, build, publication or production change.

## 2026-10-12 — M12 extension and Pskov legal-currentness review

- **M12 confirmed:** reopened the official holding-company notice about the 2026-10-08 M-12 toll-boundary extension. It states that the direct Sokury exit→Shali (M-7 junction) Category-I fare is 99 RUB all day and that Shali–Bavly is free when the trip does not enter the M-12 mainline or cross the toll boundary. Added the review/source-failure note to the M12 snapshot and candidate record.
- **M12 limitation:** the legacy `kazan_p239` node has not been proven identical to the new Sokury toll boundary. The linked live Avtodor tariff page returned HTTP 403 to web retrieval. No post-extension Moscow/Kazan→Shali direct fare was inferred; the March Moscow→Shali fare remains explicitly superseded.
- **Pskov review:** found the official regional transport department's current “Платные автодороги” inventory and official legal portal search. The inventory confirms all four roads remain listed. Amounts (Ostrov–Vyshgorodok 300; Estonia–Pechory–Izborsk 150; Opochka–Dubrovka 220; Olsha–Velizh–Usvyaty–Nevel 200 RUB) are supported by the 2025 regional resolution and current secondary coverage, but the current official tariff annex/latest amendment was not retrievable. Issue #6 advanced Open→Partial; mark tariff values date-sourced but do not assert a newly verified amendment status.
- **Sources:** official holding-company announcement https://ruhw.ru/press/news/154667/; Avtodor linked tariff page https://avtodor-tr.ru/road/tariffs/ (HTTP 403); Pskov official road inventory https://transport.pskov.ru/perechen-avtodorog-oblasti/platnye-avtodorogi (fetch timeout); legal text https://base.garant.ru/411968606/ (403); official publication search index surfaced https://publication.pravo.gov.ru/.
- **Files:** updated M12 snapshot, candidate record, audit and recovery state. Audit remains 1 closed / 8 partial / 7 open-or-blocked (Pskov swapped into Partial; M12 remains Partial).
- **Verification:** M12 and candidate JSON parse; audit count remains 1 closed / 8 partial / 7 open-or-blocked. No runtime, V1/V2, build, deployment, or publication changes.

## 2026-10-12 — recovery checkpoint and two operator tariffs

- **What:** created `TARIFF_MATRIX_CANDIDATES_2026-10-12.json` with official tariff records for the Ryazan paid overpass and Kazan Voznesensky tract; created this recovery log and `WORK_STATE.md`.
- **Why:** continue filling the new algorithm's matrix while keeping the existing V1/V2 calculators untouched and preserving source/effective-date evidence for future reconciliation.
- **Decisions:** passenger-car class; base fare without transponder discount; operator-defined clock windows retained; Ryazan night exemption remains conditional on direction/timing; Kazan amount selected at gantry passage time. Entries remain outside runtime pending route-anchor verification.
- **Evidence:** Ryazan operator notice, published 2026-09-21 and effective 2026-10-01: https://m-road62.ru/izmenenie-tarifov-na-platnom-puteprovode-s-1-oktyabrya-2026-goda/ . Kazan official tariff page and its referenced order: https://vtkazan.ru/road/tarifs/ (Order No. 07/ПД-ВТ dated 2025-03-06).
- **Verification:** source pages reviewed. JSON syntax and semantic checks are recorded after local validation. No app tests/build run because this is data-only and the project Git checkout is not writable/available in this workspace.
- **Branch/commit/PR:** not committed; the only writable workspace directory has no usable Git metadata. Existing discovered calculator checkout is `fix/v2-mobile-layout-2026-10-05` with 22 modified and 6 untracked files; it was not touched. Second checkout is a separate special-territory branch. Git fetch is blocked by read-only `.git` metadata.
- **Remaining:** recover the intended working experiment branch, restore its earlier matrix dataset, add this checkpoint there and commit; then continue all-operator capture and verify Odintsovo/Bagration image tariffs.

## 2026-10-12 — expand candidate matrix to 50% asset presence

- **What:** expanded the candidate file to include Bagration (790 RUB class 1 base fare) and the four-plaza Odintsovo current base tariff schedule; preserved six existing official-source snapshots for Avtodor M1/M3/CKAD/A-289, M12, M11 km15–58 and M11 km58–679 evidence. Added three previously recorded M4 user/Yandex span amounts as explicitly provisional candidates. Updated coverage and handoff state.
- **Why:** make rapid progress toward broad nationwide tariff coverage while retaining operator-native matrices/schedules and keeping the new data isolated from V1/V2 runtime.
- **Coverage decision:** use the 20-road/asset inventory in T—Ж's 2026 overview as a coarse scope denominator; 10 assets have at least some tariff record, so asset presence is 50%. This does not claim half of all tariff cells, route pairs or entry/exit combinations are complete. M4 candidates are not counted as independently confirmed asset coverage.
- **Source and mapping decisions:** copied existing date-stamped JSON evidence without rewriting its tariff contents; snapshots retain their own official-source URLs/effective dates. Bagration uses operator base fare (790 RUB), excluding 750 registered-plate prepayment and 550 operator transponder fare. Odintsovo preserves published four-PVP order and the page's day/direction/time rows as raw candidate data; no derived route sum is calculated until route traversal is verified. M4 values (850/1000, 1230/1450, 230/360) are marked provisional because the old dated Yandex cards are unavailable here.
- **Verification:** validated top-level JSON and entry keys; audited source snapshot cardinalities: M1 1, M3 3, CKAD 16, A-289 6, M12 19 adjacent rows, M11 km15–58 42 directed cells over five time profiles; current M11 km58–679 explicitly says incomplete and records two verified controls. No app tests/build were run; no runtime files changed.
- **Branch/commit/PR:** not committed. The writable folder still has no usable Git metadata; discovered V2 checkout has a modified worktree and read-only `.git`, so it was not edited. Six snapshots were copied from its existing source-controlled data files into the portable checkpoint.
- **Remaining:** restore the intended experiment branch before project commit; complete remaining ten assets from inventory; fill M11 km58–679 and exact span mapping; recheck Odintsovo time/day labels and M4 dated evidence. Next operator intake: Pskov regional roads and remaining regional/concessionary roads.

## 2026-10-12 — expand coarse asset coverage to 75%

- **What:** added current published tariff records for Udmurtia's Kama/Buy bridges (400/300/700 RUB, category group 1), Ufa Eastern Exit (150 RUB without transponder), Togliatti bypass three route spans (210/140/320 RUB without transponder), four Pskov regional roads (150/300/220/200 RUB, class 1 schedule), and the opened first SHMSD section (300 RUB category I). Added source URLs, effective dates where established, and mapping/completeness limits. Updated coverage inventory to 15/20.
- **Why:** meet the requested next milestone by broadening road-system representation while capturing operator-native whole-road and OD-span rates.
- **Evidence/decisions:** Udmurtia and Ufa rates were taken from official operator tariff pages; Togliatti values from Avtodor's current table; Pskov values from the 2025 regional tariff resolution as indexed by the legal-document source and remain provisional pending current-amendment confirmation; SHMSD amount from the concessionaire tariff-plan PDF, only for the first open stage. Base/no-transponder fare remains the default. For Togliatti, retain the published full 17–97 km tariff (320 RUB), not a sum inferred from partial spans.
- **Coverage metric:** the 20 assets in the 2026 T—Ж national overview remain the denominator. 15 assets are now represented, giving 75% coarse asset presence. This must not be reported as 75% of all route pairs/tariff cells; M11 58–679 is still incomplete, Odintsovo route interpretation is pending, and some newly added regional rows need date/scope validation.
- **Verification:** checked JSON parsing, record count, the 15/20 inventory count, key tariff amounts and source/scope fields. No application tests/build or runtime changes.
- **Branch/commit/PR:** not committed because the writable workspace lacks usable Git metadata; no other calculator checkout was touched.
- **Remaining:** finish five unrepresented assets; reconcile matrix with recoverable earlier candidate records; confirm Pskov current legal schedule, SHMSD open-section current status, effective date of Togliatti current tariff source, and the exact no-transponder profile for Odintsovo; then resolve all directed span/entry/exit gaps.

## 2026-10-12 — expand inventory presence to 100% and correct MSD tariff versioning

- **What:** added source/topology records for MSD, ZSD, the Blagoveshchensk–Heihe bridge, Khabarovsk bypass, and Mytishchi Speed Chord. Inventory presence is now 20/20 objects (100%), explicitly not fare-cell completeness.
- **Why:** continue the user's instruction to close the nationwide asset inventory quickly while keeping unknown tariff cells visible instead of inventing prices.
- **MSD rule:** official MSD FAQ says there are nine sections and 19 RUB per section from 2026-04-10, weekday peak charging 07:00–11:00 and 16:00–20:00, while weekends/holidays and other weekday periods are free apart from transit trips. The same currently indexed site announces 25 RUB per section from 2026-10-16; as of this checkpoint date (2026-10-12), that is future-effective and must not be applied yet. Charging depends on entry and exit timing. No transponder payment is available. A complete dated segment-pair/transit table remains missing.
- **ZSD:** operator-annex search extraction provides one Category-I base-tariff pair, zone 1–2: 70 RUB day / 30 RUB night, dated 2025-09-10. Full PDF retrieval returned HTTP 403 in the research interface; no other pairs were invented.
- **Khabarovsk:** official operator page states four named tariff sections and five toll plazas (two mainline, three ramps) and exposes an OD calculator, but the static text view exposes an isolated 20 RUB without selection context. No exact route fare cell was added. 160 RUB full-route secondary-source reference remains clearly segregated from operator-confirmed fares.
- **Blagoveshchensk–Heihe:** added official regional toll-rule source. No current passenger-car toll was found; bus passenger ticket prices, customs charges and historical vehicle-category amounts were excluded.
- **Mytishchi Speed Chord:** Avtodor confirms the toll road and operator-holding information identifies five chargeable tariff segments or a whole-road trip; current category-I price cells were not exposed in retrieved pages, so they remain null.
- **Coverage semantics:** 20/20 = 100% topology/source presence only. Tariff-cell completeness remains uncomputed because expected directed cell counts are not yet fully enumerated. Null entries mean unknown, not free.
- **Evidence:** MSD official FAQ https://msd.mos.ru/faq and documents https://msd.mos.ru/docs; operator ZSD tariff annex https://nch-spb.com/upload/iblock/4c0/Prilozhenie-2.pdf and rules https://nch-spb.com/upload/iblock/8f4/b6g07qyzz91fvhx46txlz5m2ldp5unk1/Pravila-s-10.09.2025.pdf; Khabarovsk operator https://vis-transtoll.ru/khabarovsk; Amur Region Government Resolution 725 https://www.amur-gov.ru/doc/101326; Mytishchi official Avtodor note https://avtodor-tr.ru/press-center/news/skorostnaya-mytishchinskaya-khorda-kak-oplatit-proezd/ and operator https://vis-transtoll.ru/.
- **Verification:** JSON parse/count check; 15 unique candidate rows; all 20 named assets represented and no unrepresented assets. Confirmed four newly added tariff objects contain null price cells. No application runtime changes or app tests.
- **Branch/commit:** still not committed; current working checkpoint is the writable portable folder, while project Git metadata remains unavailable/read-only.
- **Remaining:** enumerate and fill tariff cells; obtain current MSD future-effective order, complete ZSD matrix, Heihe car price, and Khabarovsk/Mytishchi exact OD tariff tables.

## 2026-10-12 — audit of incomplete operator tariff images

- **What:** checked the apparent 73 RUB value exposed in the Mytishchi operator page and opened the linked image. The value has no origin/destination labels in the static extract, and the linked image rendered a general road layout, not a legible tariff table. Removed any implication that 73 RUB is the full-road fare; kept the five tariff-segment topology only.
- **Why:** prevent a selected UI cell or unrelated dynamic value from becoming a false confirmed fare.
- **Decision:** Mytishchi current tariff schedule is acknowledged but numeric matrix cells remain null pending a direct tariff table or route calculator result with selected endpoints visible.
- **Verification:** re-parsed JSON; checked 15 unique record IDs, coverage 20/20, and that Mytishchi whole-road and numeric tariff fields are null.

## 2026-10-12 — continue unresolved issue audit and operator controls

- **What:** verified that the latest JSON edits parsed and contained eight explicit official/diagnostic controls; created `AUDIT_ISSUES_2026-10-12.md` with status and precise blocker for each of the 16 remaining questions.
- **Why:** continue through the issue list without overstating coarse asset presence as tariff completeness, and leave a resumable record of what is confirmed versus still unresolved.
- **New evidence captured:** Khabarovsk official tariff tabs expose category-I section rates 20/45/90/40 RUB and a separate full-route fare of 160 RUB; sum of section fares is 195 RUB, so the whole-route fare is operator-defined and non-additive. The operator OD calculator returned 175 RUB for Gorky–Vostochnoye, conflicting with its displayed 45 RUB section tariff; preserved only as a diagnostic conflict. Odintsovo operator mapping for representative exit vectors was added to the data. MSD transit flat fare 950 RUB and future 25 RUB rate effective 2026-10-16 are recorded with separate temporal status. A 2025 Heihe fare comparator (1,320 RUB) is retained as historical, not current. Official controls added for M4, M1, M3, CKAD, A-289 and the newly paid M12 Sokury–Shali 7 km span at 99 RUB effective 2026-10-08.
- **Reconciliation flags:** A-289 saved whole-route span 1,103 RUB conflicts with official 2026-03-02 800 RUB benchmark; M1 saved no-transponder 250 RUB conflicts with official benchmark 230 RUB; these may reflect route/payment/date differences and are not silently overwritten. M12 March snapshot predates the new paid span. Khabarovsk calculator route anchors need operator clarification.
- **Coverage decision:** 20/20 refers only to coarse asset inventory presence. No percentage is assigned to fare-cell coverage because expected directed cell counts are not yet enumerated.
- **Verification:** `python -m json.tool` passed for the candidate dataset; checked 15 candidate records and eight validation controls. No runtime code was changed and no application tests/build or publication were run. Research browser checks were read-only.
- **Branch/persistence:** checkpoint, audit and log are saved in the writable workspace. The intended experiment branch remains inaccessible from this workspace's Git metadata, so no commit was made and unrelated calculator worktrees were not changed.

## 2026-10-12 — correct SHMSD/WHSD tariff classification

- **What:** reclassified the 300 RUB Vitebsk/Blagodatnaya tariff finding from an independent SHMSD price to a candidate ZSD tariff-zone-6 amount. Kept standalone SHMSD fare null and added the zone-6 candidate to the ZSD record with explicit interpretation caveat.
- **Why:** the official operator annex search extract names zone 6 as the Southern ZSD span from Blagodatnaya Street to Vitebsky Prospekt, while the official city source describes the Vitebsk interchange as stage 1 of SHMSD connected to ZSD. The evidence does not establish an independent SHMSD charge.
- **Evidence:** official tariff annex https://nch-spb.com/upload/iblock/c89/9w3aehlsbrrr4ys27479u925nkbtno11/Prilozhenie-_1-k-Prikazu-_32-ot-22.04.2025_Bazovye-tarify.pdf (search-indexed excerpt; direct retrieval returned 403); official city statement https://www.gov.spb.ru/press/governor/291314/ . The annex extract shows 300 RUB among columns, but exact category/payment column and trip cell remain unverified.
- **Verification:** re-parsed candidate JSON. No unsupported fare promoted to confirmed status; runtime remains unchanged.

## 2026-10-12 — M11 tariff-table discovery and Yandex point test

- **What:** followed the proposed point method in Yandex Maps for the 88 km→90 km M-11 points near PVP 89. The map returned an 8-minute / 4.2-mile route labelled “Платная дорога,” but displayed no tariff amount. The geocoded kilometer pins route via local access roads, so this attempt does not verify a single adjacent-PVP fare and is excluded from tariff data.
- **Official-source correction:** found that Avtodor does publish M-11 tariff tables. Its official tariff page exposes the 58–679 km tariff table and current category-I rates from the km58 origin to listed exits. An official matrix PDF approved under Order 53 dated 2026-02-22 includes directed PVP-to-PVP rows (e.g. km89 to km97), proving the previous claim that the operator material had only two tariff cells was incorrect. The current detailed PDF, recorded in the existing snapshot as Order 274 dated 2026-09-03, is identified at https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf; direct web retrieval returned 403 and the cloud browser showed DDoS-Guard, so its full current matrix was not extracted in this pass. Do not carry forward Order 53 rates as current without reconciliation.
- **Decision:** use the latest official route matrix as the primary tariff source; use Yandex points for geometry/route validation only when Maps exposes no tariff amount. Keep route-cell prices null until Order 274 is transcribed and reconciled, especially for the PVP km593 opened 2026-09-18.
- **Evidence:** official tariff page https://avtodor-tr.ru/road/tariffs/ (search-indexed extraction, including current no-transponder category-I rates from km58); Order 53 matrix PDF https://avtodor-tr.ru/upload/iblock/402/k44r7q8jiukdw84ropm7pgd9khjh5o4h.pdf; current Order 274 file above. Research refs: `turn117search0`, `turn117search1`, `turn116search5`. Yandex Maps observation on 2026-10-12: route 88→90 km, paid-road label, no fare shown.
- **Verification:** confirmed the current snapshot metadata already identifies Order 274 and records 22 PVPs but only two cells had been transcribed. No tariff was inferred from the Yandex route or by differencing PVP prices. No runtime code changed.


## 2026-10-12 — establish current M-11 km58-origin tariff cells

- **What:** expanded the current M-11 snapshot with all 20 category-I, no-transponder PVP58→published-exit fares exposed by the official Avtodor tariff page, for Mon–Thu and Fri–Sun. Captured the tariff table URL, source access limitation, and route/PVP kilometer mapping.
- **Why:** the user asked for a deep method to resolve tariff cells and specifically proposed 88→648 km as a check. On M-11 the route markers map to PVP km89 and PVP km647 (published road km 646), respectively. The official table can directly supply PVP58-origin fares; Yandex provides route geometry but did not show an amount on the earlier point test.
- **Method decision:** treat each official row/cell as an operator-native tariff vector. Do not derive 89→647 by subtracting PVP58-origin amounts. Keep weekday and weekend prices in separate cells. When the exact OD cell is inaccessible, retain null and use Yandex only as an independent route/path check, then reconcile with operator fare result.
- **Evidence:** official tariff page https://avtodor-tr.ru/road/tariffs/ (search-index extraction ref `turn161search0` / `turn155search2`); current detailed tariff PDF/order 274 https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf (direct access returns 403 in this research interface); official OССП tariff-change notice from 2026-09-04 is recorded in prior research refs `turn125view0`/`turn126view1`. Official page defines Mon–Thu vs Fri–Sun and lists its current validity document.
- **Limit:** tariff page exposes the km58-origin row in the retrieved text, but not the requested arbitrary pair row PVP89→PVP647; do not label that exact cell verified yet. The order PDF's effective-date clause and the complete OD matrix remain to be captured. PVP593 is not included as a published exit in the extracted km58 row and remains a distinct unresolved mapping.
- **Verification:** JSON parses; all 20 mapped destination IDs exist in the 22-point list; values were copied from the four category-I columns [with transponder Mon–Thu, no transponder Mon–Thu, with transponder Fri–Sun, no transponder Fri–Sun], selecting only the no-transponder values. Existing 58→593 and 58→679 controls remain separate. No runtime code changed.

## 2026-10-12 — MDS direct tariff cell for M-11 89–646 km

- **What:** captured a Category-I tariff table cell shown on the MDS operator website for route 89–646 km: 3,120 RUB on workdays and 3,310 RUB on weekends/holidays. Added it to the M11 snapshot as the user's Yandex point pair 88→648 km, mapped to PVP89→PVP647 (operator route km646).
- **Why:** the user requested a way to obtain exact M-11 tariffs through operator-defined spans and emphasized storing a complete vector price instead of summing individual PVP charges. This is a directly published route cell; it is not inferred from the PVP58 origin fare or synthesized by subtraction.
- **Evidence:** official MDS tariffs https://www.mos-spb.ru/tariffs/main/main-ru, Category I (<2 m, 2+ axles), row “89-646 км”; the opened page was crawled 2026-10-12. The row shows 3,120/3,120 across workday time columns and 3,310/3,310 across weekend/holiday time columns. At initial capture this was treated as current; the follow-up source comparison below reclassifies it as disputed and likely stale. Yandex route geometry for 88→648 km previously showed an M-11 route, 5h09, and no price.
- **Limitations:** captured MDS tariff page does not state the exact effective-from date. The Avtodor current detailed Order 274 PDF remains inaccessible behind DDoS-Guard, so reconcile this direct operator cell against the current Avtodor full matrix when it can be read. Do not generalize one cell to other endpoints.
- **Verification:** updated M11 JSON snapshot, candidate source index, state, and issue #1. JSON parse and semantic checks follow. No V1/V2/runtime edits.
- **Source conflict found during follow-up:** the MDS table also publishes 58–646 km at 3,290/3,520 RUB, while the current Avtodor tariff page publishes the corresponding PVP58→PVP647 cell at 3,890/4,580 RUB. MDS says full M-11 tariff information/calculation is on Avtodor's website. This suggests the MDS page may be stale or reflect a different tariff scope; exact cause is not established. Therefore the captured MDS 89–646 cell is marked disputed and excluded from runtime approval until reconciled against current Order 274 / Avtodor calculator. Do not extrapolate either amount to other pairs.

## 2026-10-12 — date/scope analysis of the MDS discrepancy

- **What:** checked the official OССП M-11 announcement after finding conflicting MDS and Avtodor 58–646 values. OССП says M-11 tariffs on km 58–543 change effective 2026-09-04. The current Avtodor detailed tariff PDF is identified as published 2026-09-04 (Order 274 dated 2026-09-03), while the MDS page does not show a tariff effective date and points users to Avtodor for complete tariff information/calculation.
- **Why:** determine whether the MDS route-cell observation is applicable to the current price matrix and whether the change is in the component containing the requested 89→646 trip.
- **Decision:** interpret MDS 58–646 and 89–646 numbers as likely stale/historical observations because those trips include the repriced km58–543 span, but label this cause as an inference, not proven. Keep 3,120/3,310 as disputed source data; do not subtract old/current fares to synthesize a new value. Current Avtodor PVP58-origin cells are the active sourced values for that origin and dated 2026-09-04 where the updated official tariff page supports them.
- **Blocker:** current Avtodor PDF direct open returned 403; the official site’s browser page served a DDoS-Guard human-verification page. No challenge was solved or bypassed. The full row 89/current 89→646 fare remains untranscribed; no exact Yandex price was shown.
- **Evidence:** official OССП notice https://unitoll.ru/about/press/news/izmenyayutsya-tarify-na-proezd-po-doroge-m-11-neva-/ ; official MDS table https://www.mos-spb.ru/tariffs/main/main-ru ; Avtodor tariff page https://avtodor-tr.ru/road/tariffs/ and detailed PDF https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf .
- **Verification:** JSON parse and assertions on source conflict / 20 PVP58 origin cells / null complete-matrix status passed. No app or runtime changes.

## 2026-10-12 — Yandex weekday/weekend route control for A-289

- **What:** built the Yandex Maps car route from станица Марьянская to Темрюк. Tested Monday 2026-10-12 and Saturday 2026-10-17, both at 19:44 local time. The fastest route on each date follows A-289. Weekday: 1 h 28 min, 73 mi, toll display ~620 RUB. Saturday: 1 h 27 min, 73 mi, toll display ~620 RUB. Yandex details say this fare is for a vehicle under 2 m without a transponder and that toll data is supplied by road operators.
- **Why:** user authorized Yandex route-price checks as a truth source and instructed that the product selects only the fastest route. This is a controlled weekday/weekend test for a disputed A-289 route.
- **Decision:** preserve this as a user-approved Yandex route control with the displayed approximation marker intact. Do not substitute it for an operator tariff cell with toll-plaza endpoints and do not propagate it to other A-289 routes. Slower options are excluded by the fastest-only rule.
- **Evidence:** Yandex Maps browser observation on 2026-10-12; selected path detail shows A-289 segments (28.5 mi and 22.8 mi); weekday screenshot/DOM date 2026-10-12 19:44; Saturday DOM date 2026-10-17 19:44. Separate snapshot: `source-snapshots/yandex-2026-10-12-a289-maryanskaya-temryuk.json`.
- **Verification:** JSON parse and semantic assertions passed; control indexed in candidate file. No runtime code changes.

## 2026-10-12 — M-12 Sokury–Shali post-extension tariff addendum

- **What:** added the direct Sокуры exit→Шали Category-I passenger-car fare of 99 RUB, effective 2026-10-08 00:00 local, all day. Stored both in the M-12 source snapshot as a later operator tariff addendum and linked from the candidate control index. Updated audit/state notes to invalidate the older March Moscow→Шали assertion for routes crossing the newly paid span.
- **Why:** prevent a stale pre-extension whole-vector result from being used after the toll boundary moved; obey the matrix rule to capture complete operator-defined route vectors directly and never append a component price to unrelated adjacent prices.
- **Evidence:** Russian Highways official announcement https://ruhw.ru/press/news/154667/ (lines 109–112 states date, exact endpoints, Category I 99 RUB, 24-hour applicability, and references Avtodor tariffs). Interfax separately confirms the 7.045 km scope and toll-boundary endpoints: https://www.interfax-russia.ru/volga/news/proezd-po-7-kilometrovomu-otrezku-m-12-pod-kazanyu-s-8-oktyabrya-stanet-platnym (lines 26–32).
- **Limits:** this proves only the Sокуры-exit→Шали vector. It does not refresh other M-12 entries/exits or validate the legacy Moscow→Шали price after the boundary extension. Avtodor tariff page direct fetch returned 403 in search; no browser challenge was attempted.
- **Verification:** JSON parsing and semantic checks for the exact route, 99 RUB, start date, all-day period, and addendum linkage passed. No runtime files changed.

## 2026-10-12 — matrix readiness and issue-count definition

- **What:** recalculated state from the 16 tracked audit groups and candidate index: coarse road-asset presence is 20/20 (100%); issue-group status is 0 closed, 8 partial, 8 open/blocked. Added these counts to the recovery state and clarified the audit header. The consistency check also found that the Ryazan paid overpass was represented by a tariff entry but missing from the explicit 20-name asset list; added it so the listed count, declared count and inventory agree. Explicitly quarantined the M-12 March 2026 Moscow→Shali 5,909 RUB assertion as historical and non-runtime-approved, while retaining the direct post-extension Sokury-exit→Shali 99 RUB addendum.
- **Why:** answer readiness questions without conflating presence of a road/source with completeness of its tariff cells or directed endpoint vectors.
- **Method:** counted the 16 issue rows in `AUDIT_ISSUES_2026-10-12.md`; only rows explicitly marked Partial qualify as partial. The other 11 are Open, Reclassified unresolved, or Blocked; none meets the full closure standard.
- **Verification:** parsed candidate matrix and M-12 snapshot; asserted 20 represented assets, 16 unique audit issue numbers, 0 Closed, 8 Partial, 8 Open/blocked; asserted March 5,909 RUB vector is quarantined and current direct 99 RUB vector remains present. No runtime changes. Git status unavailable because this writable work folder has no Git repository metadata.

## 2026-10-12 — accessed and tested the official M-11 «Нева» tariff calculator

- **What:** opened `https://m11-neva.ru/`; confirmed the route form is interactive and exposes origin/destination points, weekday, arrival-time interval, vehicle category and transponder/no-transponder. Verified direct Category-I no-transponder tariff for Moscow km22→Solnechnogorsk/M10 km58: 1,130 RUB Tuesday and 1,650 RUB Saturday for the selected 00:00–01:00 interval. These match the existing official 15–58 km table for Mon–Thu and Saturday daytime periods.
- **Critical scope finding:** the operator tariff page heading says M-11 Moscow–Solnechnogorsk and identifies the 15–58 km concession. Homepage route selectors list points farther north, but km89→km646 also returned the same 15–58 values (1,130 weekday / 1,650 Saturday); a control from km58→km646 likewise displayed the weekday 15–58 amount. Do not ingest those outputs as prices for km58–679 or PVP89→PVP647. Store them only as a calculator scope/UI diagnostic.
- **Why:** user specifically directed checking direct combinations on this operator site. Direct access was successful, but the scope boundary matters: this site validates the previously captured 15–58 matrix, not the Avtodor-operated km58–679 matrix.
- **Evidence:** operator tariff page https://m11-neva.ru/rate/ explicitly labels the tariffs “Москва—Солнечногорск”; text search extract states km15–58. Direct browser UI observation saved in `source-snapshots/m11/m11-neva-live-calculator-access-2026-10-12.json`. The page warns its calculations are reference values and may differ from actual charges.
- **Verification:** snapshot JSON parsed; compared observed 1,130/1,650 values to existing operator PDF snapshot `2026-04-24-section15-58-category1-no-transponder.json`; confirmed selected endpoints/payment/class/day are written. No runtime edits. No Git metadata available in this workspace.

## 2026-10-12 — resolve interpretation of the M-11 58–679 full-span row

- **What:** confirmed that PVP58→PVP679 (full km58–679 vector) already exists as an official current row. Clarified all four Category-I cells in the audit record: Mon–Thu 3,900 RUB with transponder / 4,200 RUB without; Fri–Sun 4,690 RUB with / 4,940 RUB without. Under the calculator's default no-transponder rule, use 4,200 and 4,940 RUB for the published day profiles.
- **Why:** user correctly pointed out that a direct full-span route cell can be counted as one vector; the prior response blurred that specific complete row with the still-incomplete all-origin M11 matrix. The issue is only the mapping of 3,900/4,200 to day groups: in the official table those are payment-method columns within Mon–Thu, not Tue–Fri and Sat–Mon prices.
- **Evidence:** current official Avtodor tariff page `https://avtodor-tr.ru/road/tariffs/` labels the span 58–679 km and, under Category I, lists columns Mon–Thu (with / without transponder), Fri–Sun (with / without transponder), with row values 3,900 / 4,200 / 4,690 / 4,940. The same page defines Mon–Thu and Fri–Sun treatment, including holidays and pre-holiday days. Search extraction ref `turn203search0`; direct page open is unavailable in this research interface.
- **Decision:** the PVP58→PVP679 full-span cell is counted and runtime-eligible as source data with no transponder: 4,200/4,940 RUB, subject to the official effective-date scope recorded in the snapshot. User-reported 3,900 Tue–Fri / 4,200 Sat–Mon is preserved as a discrepancy note, not silently remapped. This does not complete arbitrary origin rows in the M11 58–679 matrix.
- **Verification:** snapshot and candidate JSON parse; assertions confirm PVP58→679 current no-transponder values are 4,200/4,940, with-transponder values are 3,900/4,690, and the day profiles match the operator's published definitions. No runtime code changed.

## 2026-10-12 — retract premature M-11 closure and log operator-calculator discrepancy

- **What:** reverted issue #1 from Closed to Partial and restored the aggregate count to 0 closed / 8 partial / 8 open or blocked. Updated `AUDIT_ISSUES_2026-10-12.md` and `WORK_STATE.md`.
- **Why:** user clarified that the prior message about closure was a question, and reported the m11-neva.ru UI showing 3,900 RUB Tuesday–Friday and 4,200 RUB Monday/Saturday/Sunday, with identical amounts regardless of transponder. This is not what the current Avtodor km58→679 table publishes.
- **Evidence:** Avtodor official tariff page search result `turn205search0` displays 3,900/4,200 RUB Mon–Thu with/without transponder and 4,690/4,940 RUB Fri–Sun with/without. m11-neva.ru `/rate/` page itself labels the tariff scope Moscow–Solnechnogorsk; prior homepage UI test selected beyond-scope exits and returned the 15–58 section fare. No new 58→679 live selection was made in this turn; the user's current output remains a reported observation pending capture with exact controls.
- **Decision:** retain Avtodor values as current published-source candidates; do not silently replace with the unexplained reported UI output. Ask no clarification now; continue next by reproducing the precise UI controls on m11-neva.ru, if possible, and establish whether it returns a genuine Avtodor fare or a calculator scope artifact. If direct output still differs, contact/source clarification is needed before choosing runtime values.
- **Verification:** checked the official table's four cells and day/payment headings, the m11-neva.ru rate page scope, and consistency of 16 issue rows / 0 closed / 8 partial / 8 open-or-blocked. No runtime code changed.

## 2026-10-12 — set Avtodor as authoritative source for M-11 km58–679

- **What:** preserved the official Avtodor tariff cells as the adopted M-11 values, reclassified the reported m11-neva.ru figures as a UI diagnostic only, and recorded the user's source-priority decision in the M-11 snapshot, audit and state files.
- **Why:** the user said official Avtodor data should be retained where available. The direct published PVP58→PVP679 Cat-I cells are 3,900/4,200 RUB Mon–Thu with/without transponder and 4,690/4,940 RUB Fri–Sun with/without. The m11-neva.ru page's stated rate scope is Moscow–Solnechnogorsk; previous higher-kilometer controls repeated the 15–58 section fare.
- **Coverage limit:** this settles which source wins for the overlapping PVP58-origin vector cells; it does not establish that every entry/exit pair for km58–679 is already in our files. The current snapshot contains 20 direct PVP58-origin vectors, not the complete origin/destination matrix. Keep issue #1 Partial until the remaining applicable vectors are transcribed or the defined product vector set is explicitly bounded.
- **Verification:** parsed the edited JSON snapshot and candidate matrix; asserted audit row count 16 with 0 closed, 8 partial and 8 open/blocked; confirmed all 20 PVP58-origin rows remain intact and the direct no-transponder PVP58→PVP679 values remain 4,200/4,940 RUB. No runtime code changed.

## 2026-10-12 — clarify that Avtodor publishes direct prices for PVP pairs

- **What:** updated the M-11 audit and recovery state to describe the official source correctly: detailed tariff appendices are PVP-origin × PVP-destination matrices, where each cell is a direct route-vector fare. Set the next task to transcribe all current cells from Order 274, not to infer them by summing per-PVP increments.
- **Why:** the user's proposed vector model corresponds directly to the operator's matrix format. The previous summary understated the existence of other combinations. A prior official Avtodor matrix exposes rows and columns for many PVPs and direct values for every pair (e.g., km67→km89); these historic numbers demonstrate structure only and are not current fare inputs.
- **Evidence:** official historical Appendix 1 search result `turn208search2` / `turn212search0` includes the full PVP-pair matrix. Current Avtodor Order 274 PDF dated 2026-09-04 is identified at `https://avtodor-tr.ru/upload/iblock/b40/0dbxelqoqelj4yx3ey7yfieo3odimmkn.pdf` (search result `turn210search0`); direct open returns 403, and the current local snapshot contains 20 PVP58-origin cells only.
- **Verification:** no prices copied from the historical matrix into current data. JSON parse and audit row-count check; runtime unchanged. Next task: obtain/transcribe the current Order 274 matrix cells while preserving category, payment basis, direction and day profile.

## 2026-10-12 — user supplied Avtodor Order 274 PDF; inspected current M-11 matrices

- **What:** copied the supplied 10-page Order 274 PDF into `source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf`; visually inspected the document and transcribed the Category-I PVP58-origin row for both day profiles into `currentOrder274Matrix` in the M-11 snapshot. Updated audit, state and candidate source index.
- **Why:** user supplied the exact current operator document needed to resolve M-11 directed vector prices. The PDF contains complete origin-PVP × destination-PVP matrices; each cell is a direct fare, so do not compose prices from increments.
- **Document facts:** Appendix 1, page 1 is Mon–Thu; page 5 is Fri–Sun; category I; 22 tariff points (462 ordered non-self cells/profile); Order 274 signed 2026-09-03 and tariffs effective 2026-09-04. The matrix header lists cash, bank card, and transponders APD/OSSP/MCC/NKD in one common table. Day definitions include holidays and pre-holidays as printed.
- **Transcribed control:** PVP58→PVP679 is 3,900 RUB Mon–Thu / 4,200 RUB Fri–Sun; PVP67→PVP89 is 130/160 RUB. The first PVP58-origin row includes PVP58→PVP593 3,440/3,600 and PVP58→PVP647 3,600/3,890. These values are copied from the attached Order 274 matrices, not inferred.
- **Conflict:** the current Avtodor tariff overview separately exposes a four-cell schedule for PVP58→PVP679 (3,900/4,200 Mon–Thu and 4,690/4,940 Fri–Sun with/without transponder). The detailed Order 274 matrix shows one common payment table at 3,900/4,200 by day profile. Both source records are retained separately; use Order 274 direct cells for this route-vector matrix and hold runtime integration until the source scope/payment distinction is reconciled.
- **Coverage:** only the PVP58-origin row (21 destinations per profile) has been transcribed; the remaining 21 origin rows (441 ordered non-self cells/profile) are still outstanding. Matrix completion remains partial.
- **Verification:** PDF has 10 pages and is unencrypted; visual inspection confirmed the two Cat-I tables and effective date; JSON parses; 22 PVP points and both 22-value row arrays asserted; PVP58→PVP679 and PVP67→PVP89 controls asserted. No runtime code changed.


## 2026-10-12 — user confirmed M-11 tariff source priority

- **Decision:** User explicitly designated Avtodor Order No. 274 dated 2026-09-03 as the basis for all M-11 km58–679 tariff data. Its direct Category-I origin-PVP × destination-PVP cells prevail over conflicting Avtodor overview-page values or calculator observations.
- **Payment/day interpretation:** preserve the order's two profiles exactly (Mon–Thu excluding weekends, non-working holidays and pre-holiday days; Fri–Sun including weekends, non-working holidays and pre-holiday days). It prints one common matrix for cash, bank card and listed transponders; the calculator's base fare remains the no-transponder choice, with no extra adjustment where the order provides none.
- **Scope:** copy each published direct vector cell from pages 1 and 5; do not calculate vectors by summing increments or subtracting origin totals. Retain conflicting lower-priority source observations in audit notes, but they no longer block Order 274 transcription.
- **Progress:** PVP58-origin row is present (21 non-self cells per profile); the other 21 origin rows per profile are still outstanding. No runtime or V1/V2 edits.
- **Verification:** JSON parse passed; PDF pages 1 and 5 rendered and reviewed. Full row-by-row transcription and matrix consistency check remain pending.

- **Transcription aid:** rendered Order 274 pages 1 and 5 at 300 dpi and saved a raw Tesseract OCR transcript to `source-snapshots/m11/2026-10-12-order274-pages1-5-ocr-raw.txt`. It is explicitly labeled unverified/non-canonical; legible original page cells remain the only tariff authority. This captures all OCR candidate rows for subsequent correction without feeding OCR guesses to runtime.


## 2026-10-12 — Order 274 cell extraction attempt

- **What:** rendered Appendix 1 pages 1 and 5 at 300 dpi; isolated the Category-I tables; saved raw page OCR. Tested per-cell Tesseract extraction with grid coordinates.
- **Result:** OCR is not accurate enough to promote automatically: digits are dropped/changed and the first-page parsing has unresolved cell alignment/missing cells. No newly OCR-read fares were inserted into the canonical matrix. Existing verified PVP58 row remains the only transcribed Order 274 row.
- **Decision:** keep issue #1 partial; do not infer/fill the other 21 rows from noisy OCR or add/subtract route totals. Resume from original page images and verify each value directly; then run bidirectional/symmetry and full-cell-count checks.
- **Environment:** the scratch workspace has no usable project Git branch; candidate state and raw OCR artifacts are local only. No runtime, publication or V1/V2 changes.


## 2026-10-12 — manually transcribed next Order 274 M-11 rows

- **What:** added direct Category-I origin rows PVP67, PVP89 and PVP97 for both Mon–Thu and Fri–Sun to the existing PVP58 row in the current snapshot. Prices were copied directly from the original page images (Appendix 1, pp.1 and 5); OCR was used only as a locator/check aid, not as the value source.
- **Verification:** each row has 22 columns including an explicit null diagonal; JSON validation passed. Reciprocal cells among the four transcribed rows match where both sides are available. Per profile: 4/22 origin rows and 84/462 ordered non-self cells are transcribed; 18 rows / 378 cells remain.
- **Decision:** matrix remains Partial and not runtime complete. Continue direct cell transcription; do not derive fare values.


- **Follow-up transcription:** added four more direct Order 274 rows: PVP124, PVP147, PVP159 and PVP177, for both day profiles. Paired reciprocal values were checked against already transcribed rows; the checks agree. Current coverage is 8/22 rows (168/462 cells per profile); 14 rows / 294 cells per profile remain. JSON parse and semantic length/diagonal checks passed.


## 2026-10-12 — completed M-11 km58–679 Order 274 matrix transcription

- **What:** transcribed the remaining eight rows (PVP402, PVP444, PVP524, PVP545, PVP593, PVP647, PVP668, PVP679) for both profiles from original PDF page images. Combined with previously transcribed rows, both 22×22 Category-I matrices are now complete in the snapshot.
- **Why:** user directed completion of this matrix before moving to other roads and confirmed Order No. 274 (signed 2026-09-03, effective 2026-09-04) as the source of truth. Each cell remains a direct PVP-to-PVP price; no increments or differences were used.
- **Validation:** each profile has 22 rows, 22 columns/row, 22 null diagonal cells and 462 non-self fares. Automated reciprocal equality check passed across all 462 pairs in each profile; JSON parse and row-shape checks passed. PVP58→PVP679 in the Order is 3,900 RUB Mon–Thu / 4,200 RUB Fri–Sun.
- **Disposition:** audit issue #1 moved Partial→Closed for source-matrix collection; overall issues are now 1 closed / 7 partial / 8 open. No runtime integration, build/test, publication or production change. Next road issue is M4 route-vector confirmation, then continue through the remaining audit list.
- **Repository:** no usable Git working branch in this workspace; updated portable checkpoint files only.

## 2026-10-12 — M-4 south-region tariff and Yandex controls

- **What:** captured current Avtodor Category-I payment/day cells for PVP1046, 1093, 1184 and 1223; stored them with two precomputed audit vectors and preserved the prior Yandex candidate numbers. Ran live Yandex fastest-route checks for street-level Rostov-on-Don→central Krasnodar at 10:00 Tue 2026-10-13 and Sat 2026-10-17, with car <2 m/no transponder.
- **Observed:** Yandex displays approximate toll totals of ~850 RUB Tuesday (3 h 46 min) and ~1,000 RUB Saturday (3 h 42 min). It does not expose the exact PVP sequence on the route card. Official Avtodor table extraction lists for PVP1093 transponder/no-transponder 150/150 Mon–Thu and 210/270 Fri–Sun; PVP1184 300/350 and 380/470; PVP1223 400/500 and 530/690; PVP1046 380/450 and 600/770. The official current page heading orders the columns by weekday/profile and payment type.
- **Vector precomputations:** PVP sequence 1223→1184→1093: 1,000/1,430 RUB no transponder and 850/1,120 with transponder (Mon–Thu/Fri–Sun); adding PVP1046: 1,450/2,200 no transponder and 1,230/1,720 with transponder. These were precomputed offline from the published PVP cells and stored as audit vectors; no runtime sums are permitted.
- **Why partial:** old 850/1,000 values plausibly mix the weekday transponder total (850) and weekday no-transponder total (1,000), but the newly tested Yandex street-level route independently displays those same numbers as weekday/weekend no-transponder estimates. Exact route-to-PVP equivalence is unproven, and the effective date printed inside the official detailed PDF was not independently extracted. Preserve both observations; do not silently reconcile them or approve a runtime cell.
- **Files:** added `source-snapshots/m4-2026-10-12-avtodor-and-yandex-checks.json`; updated M4 record, audit issue #3, and recovery state.
- **Verification:** JSON parse passed; asserted all four PVP rows and both Yandex controls exist with no-transponder metadata; verified vector arithmetic only as a one-time audit consistency check. No application runtime changes, tests, build or publication.

## 2026-10-12 — corrected A-289 payment-basis label; CKAD/A-289 audit advanced

- **Finding:** the Avtodor current tariff table for A-289's direct Марьянская→Темрюк vector lists Category-I amounts 800 RUB with a transponder and 1,103 RUB without. The existing whole-road control had stored “800 RUB” without a payment-method label, which could be mistaken for the calculator's base/no-transponder fare. Corrected the control to preserve both prices and clearly label 800 as the transponder rate.
- **Yandex comparison:** existing date-selected fastest city route cards for Марьянская→Темрюк show ~620 RUB without a transponder on Mon 2026-10-12 and Sat 2026-10-17. This is retained as a user-authorized route-specific Yandex control; it conflicts with the direct operator vector and is not generalized. The endpoint/PVP mapping discrepancy remains open.
- **CKAD:** its 16 current tariff rows and 2,381-RUB whole-ring benchmark remain; complete directed RVP-pair matrix is not yet present.
- **State maintenance:** audit counts are now 1 closed / 8 partial / 7 open or blocked because M4 has moved from Open to Partial after capturing official and Yandex controls. Updated candidate control, audit, and recovery state.
- **Verification:** both dataset/snapshot JSON parse; asserted A-289 payment basis 800-with / 1,103-without and count/status consistency. No runtime code/build/tests/publication.


## 2026-10-12 — corrected M4 tariff-column interpretation and verified south vector

- **Correction:** retract the earlier M4 interpretation that mapped 850/1,000 RUB to mixed transponder/day cells and the derived no-transponder vector 1,000/1,430 RUB. That conclusion came from flattening the overview table columns and is not supported by the direct operator tariff pages.
- **Operator evidence:** direct pages for PVP1093, PVP1184 and PVP1223 show Category-I weekday/weekend tariffs of 150/150, 300/350 and 400/500 RUB. The operator identifies these as its three successive toll points on km1091.6–1319. The complete vector is recorded as 850/1,000 RUB Mon–Thu/Fri–Sun; runtime should look up this finished vector and never sum its PVP components.
- **Yandex controls:** date-selected fastest routes from the PVP1093 vicinity to central Krasnodar displayed ~850 RUB Tuesday 2026-10-13 and ~1,000 RUB Saturday 2026-10-17; Yandex details specified car <2 m without transponder. A separate route from M4 km1025 (north of PVP1046) to central Krasnodar displayed ~1,230/~1,450 RUB on the same weekday/weekend dates and traced M4/E115/A-136. Treat these as approximate route controls, not standalone 1046 cells: Yandex route cards do not itemize each toll crossing.
- **Files changed:** corrected the M4 source snapshot, candidate row, audit issue #3 and recovery state. The old flattened overview readings are not used as normalized tariff cells. PVP1046 remains unverified from a dated operator tariff document; M4 remains Partial.
- **Verification:** source and candidate JSON parse; asserted southern PVP fare values, vector 850/1,000, Yandex controls and null unresolved cells; checked audit issue counts remain 1 closed / 8 partial / 7 open or blocked. No runtime changes, application tests, build or publication.


## 2026-10-12 — normalized M4 PVP1046 and four-point vector

- **New source finding:** the current Avtodor tariff page and its March 2026 tariff data give the Category-I base fare at PVP1046 (km1024–1091) as 380 RUB Mon–Thu and 450 RUB Fri–Sun, effective 2026-03-02. A dated report reproducing Avtodor's update confirms 380 RUB Monday–Friday / 450 RUB Saturday–Sunday (https://www.kommersant.ru/doc/8479038). This corrects the earlier flattened extraction that recorded 450/770 as a no-transponder fare.
- **Completed vector:** added the direct lookup cell [1046,1093,1184,1223] = 1,230/1,450 RUB Mon–Thu/Fri–Sun, from the current PVP1046 base fare and the three downstream operator PVP fares. This is a one-time matrix transcription/normalization, not a runtime component sum. It matches date-selected Yandex fastest route estimates from M4 km1025 to central Krasnodar on 2026-10-13/17; Yandex explicitly says no transponder and car below 2 m.
- **Coverage status:** M4 rows 1093→1184→1223 and 1046→1093→1184→1223 now have candidate complete vector prices, supported by direct PVP pages/current Avtodor schedule and route controls. Other contiguous vectors/road groups remain open, so issue #3 stays Partial.
- **Verification:** recalculated the offline vector cells against the stored current PVP fares; JSON source/candidate files parse; route controls and day profiles match; audit counts remain 1 closed / 8 partial / 7 open or blocked. No runtime code or deployment changed.


## 2026-10-12 — inspected A-289 fastest-route toll trace

- **What:** reopened the saved date-selected Yandex route for Марьянская→Темрюк and inspected the complete Saturday directions and fare card.
- **Observed:** fastest route is ~620 RUB, car <2 m, no transponder. Directions take two long A-289 legs (28.5 and 22.8 mi), leave the toll road via 03К-010, then rejoin A-289 for the final legs. The map's ~620 RUB equals the official A-289 direct full-vector transponder amount; the no-transponder table cell is 1,103 RUB.
- **Disposition:** preserve Yandex ~620 as the route-specific control per user rule and preserve Avtodor 1,103 as the operator matrix vector. The route includes an exit/re-entry/bypass that may alter which toll facilities are traversed, but the observed amount matches the transponder cell; exact toll-point accounting and/or Yandex fare basis remains unresolved. Do not overwrite one with the other or infer arbitrary A-289 fare cells.
- **Files:** amended A-289 Yandex source snapshot, audit issue #2 and recovery state.
- **Verification:** displayed Yandex card explicitly labels no-transponder and lists A-289/03К-010 directions; JSON parses. No runtime changes.


## 2026-10-12 — transcribed the current CKAD direct fare matrix

- **Source:** official CKAD operator tariff page, https://tskad.ru/stoimost-proezda/tarifs-ckad/, identifies Order No. 56 dated 2026-02-27 and tariff validity from 2026-03-02. The current indexed operator page exposes the complete Category-I entry/exit matrix. The live operator page timed out in the browser, so the search-indexed primary-source table was transcribed, with this retrieval limitation recorded.
- **What:** saved 15 entry/exit nodes and 210 direct ordered non-self fares (null diagonal) as Category-I base/post-payment prices in source-snapshots/ckad-2026-03-02-category1-direct-pair-matrix.json. This is a direct vector matrix, not component increments.
- **Validation:** every reciprocal origin/destination fare is equal, all 15 diagonals are null, and there are 210 non-self cells. Representative direct cell M-10→M-11 is 60 RUB; M-10→PK-5 is 3,189 RUB.
- **Remaining conflict:** the holding-company release says “whole CKAD” is 2,381 RUB (2,023.85 after maximum T-pass discount), while the operator pair table has longer direct origin/destination cells up to 3,189 RUB. Preserve both with distinct scopes; do not overwrite the direct matrix or treat a max pair as the full-road cell until route endpoints are reconciled.
- **Status:** CKAD matrix capture is complete for published nodes, but combined issue #2 remains Partial due to this whole-road scope conflict and the A-289 Yandex-vs-operator discrepancy.


## 2026-10-12 — full recovered catalogue and vector construction

User requested finishing the matrix without reopening agreed questions. Recovered correct GitHub branch and prior 21 M4 / 25 M12 raw rows, built 4,683 tariff records and 374 canonical M4 candidate spans, captured live Mytishchi 73/57/44/51/34 and whole259, fixed Heihe and excluded-road JSON, added Odintsovo time combinations and MSD dated masks. Corrected M1/M3 class-column mistakes using the current indexed official page. `node scripts/build-vector-matrix.cjs` and `node scripts/validate-vector-matrix.cjs` both passed; exact assertions and limitations are in `MATRIX_VALIDATION_2026-10-12.json`. Complete narrative: `MATRIX_HANDOFF_2026-10-12.md`. This is data construction, not proof that every route was independently checked in Yandex. Old M12 Shali cells expire Oct8; new99 is a separate direct span and is not blindly added to old whole-route fares. No V1/V2/Production changes. Starting remote head440ce6b2; correct experiment branch restored via connector, atomic data/docs commit prepared next.

## 2026-10-13 — этап 1: восстановление и сверка

Создана отдельная writable копия репозитория и локальная audit-ветка. Перенесены исходные данные без изменения тарифных чисел. Старый противоречивый аудит сохранён как AUDIT_HISTORY; создан актуальный аудит и краткое состояние. Отозван ошибочный вывод предыдущего прохода о неверных южных ценах в действующем сводном JSON.

Проверка: node experiments/nationwide-tolls/scripts/validate-vector-matrix.cjs — PASS 4683. Предыдущий EROFS устранён использованием writable копии. Shell git ls-remote завершился сетевой ошибкой; GitHub connector подтвердил существование целевой ветки, но её head и PR не проверены. Нет удалённого коммита/публикации. Следующий шаг: этап 2 по текущему аудиту.

## 2026-10-13 — этап 2: отбор актуальных тарифов

Создан воспроизводимый build-release-register.cjs: 2086 записей с опубликованной/согласованной ценой на дату 13 октября, 777 истёкших или будущих версий отдельно, 1820 candidate-записей отдельно. Ни одна selected-строка не одобрена для runtime без привязки маршрута. Проверки partition-count, запрета candidate и текущих дат — PASS. Тарифные значения не подменялись. Публичные источники повторно подтверждают Багратион790, Уфа150, тарифную группу1 Удмуртии400/300/700; особые условия классификации ТС не отменены. Автодор403; сообщение М12 timeout. Новые arbitrary OD-пары не извлечены, массовый Яндекс-контроль не проводился.

Сбор реестра выполнен. Этап2 по маршрутной привязке остаётся частично выполненным: М4 candidate, новые М12 пары, контроль ЦКАД/фиксированных проездов. Следующий шаг — маршрутная проверка этих групп либо явное ограничение покрываемых векторов перед финальной моделью.

## 2026-10-13 — закрытие статуса кандидатов

По прямому запросу пользователя и ранее согласованному правилу исключения недоказанных тарифов: 1456 М4 candidate +4 ДЗОК +360 М12 candidate исключены из текущего покрытия. Генератор теперь сохраняет причины/условия повторного включения; pendingCandidates=0. Это не подтверждение всех проездов; остаётся ограниченное покрытие и неизвестный итог при пересечении исключения. Проверка численности, непересечения групп, отсутствия runtime-повышения, сохранения М4юг и М12direct99 — PASS. Следующий шаг: модель маршрута/времени и интеграция; удалённого обновления не выполнялось.

## 2026-10-13 — пользователь разрешил оценки

Прямое решение пользователя заменило исключение1820: разрешено применять с пометкой «Стоимость не подтверждена». Изменён генератор: provisional, authorizedForEstimate, обязательная видимая метка. История/будущие версии сохранены вне текущего расчёта. Проверки1820, обязательных меток, дат и суммы4683 — PASS. Записан контракт следующего этапа ROUTE_PRICE_POLICY.md; интерфейс/API ещё не подключены. Следующий шаг: интеграция в актуальную экспериментальную ветку.

## 2026-10-13 — реализация изолированного обработчика тарифов

engine/quote.cjs реализует точный ключ дорожной группы/from/to/profile, проверку действующей даты, согласованность routeId и exactTraversal, полноту платных доказательств, уникальность traversalId. selected/provisional/history используются с датами; кандидат выдаёт числовую оценку и метку, которая распространяется на общий результат и formatCopy. Неизвестный компонент делает итог null; ноль только при confirmedNoPaidCrossing.

scripts/quote.test.cjs — PASS: confirmed югМ4, candidate310, смешанный итог с предупреждением, копирование, отсутствующая цена, другая геометрия, дубликат, unresolved profile, бесплатность, граница МСД15/16 октября, старый Шали. Это изолированные unit-тесты, не API/браузер E2E или полный build. Адаптер геометрии/таймзон должен обеспечивать правдивые exactTraversal/profileResolved; они не выводятся обработчиком самостоятельно.

GitHub connector прочитал актуальные AGENTS и docs/WORK_STATE экспериментальной ветки: продолжать изолированно, сохранять журнал/решения/next steps. Прямой git mirror не авторизован. API/UI действующего экспериментального приложения ещё не подключены, удалённого коммита/публикации нет. Следующий шаг: восстановить актуальные исходники V3/эксперимента и вставить этот контракт в его adapter/API/UI, проверить сборку и браузер.

## 2026-10-13 — API adapter и защита повторного начисления

Прочитаны актуальные GitHub файлы V3 API/page, route-leg/route-leg-pricing, shared result types/copy/result-panels и README/backlog. Источники показывают диагностическое national coverage; actual native API/UI ещё не используют новый обработчик.

Добавлен engine/api-adapter.cjs: перевод результата quote в tolls.amount/pricingStatus/priceConfirmation/displayLabel и matrixQuote; copyRouteResult сохраняет предупреждение. quote запрещает двойное представление одной дорожной группы (m4-south+m4-candidate, аналогично М12). Раздельные дорожные группы суммируются с распространением unconfirmed. Подготовлен app/v3/components/toll-confirmation-note.tsx для UI, пока не импортирован текущей страницей.

Проверки: scripts/quote.test.cjs PASS (включая API JSON roundtrip, копирование, null, двойной М4, М4+Уфа); validate-vector-matrix.cjs PASS4683. React-компонент не отрендерен, TypeScript/fullbuild/HTTP/browser E2E не запускались. Remote source tree прочитан частично; head SHA не установлен и новая работа только в локальной audit-ветке. Следующий шаг: восстановить полный актуальный checkout, интегрировать API adapter через реальные route evidence и вывести компонент рядом с суммой, затем полный build/E2E.

## 2026-10-13 — V3 integration of estimates (current block)

User policy: current candidate prices may be used with a visible «Стоимость не подтверждена» label. Restored every remote blob of experimental head440ce6b2 via connector; all source hashes matched. Local recovery history differs from remote Git history; remote integration must use440ce6b2 as parent, not the special-territory base.

Implemented V3-only route-leg/pricing modules and changed V3 API to use them. M4 adapter selects a finished exact confirmed-PVP vector from selected/provisional tables, keeps direction prices equal, rejects missing dates, duplicate Pvps, partial evidence, day/profile boundary and A289 composition replacement. Existing other-road engines still provide their prices; all V3 numeric results are labeled unconfirmed while nationwide integration remains partial. Dedicated V3 copy hook appends the label. UI note is imported beside V3 results. V2 pricing files/UI unchanged; shared m4-production only normalizes diagnostic renamed field for TypeScript compatibility.

Found pre-existing experimental regression failures22/305: compiler tests used seeded source as an empty template, preview tests assumed zero rather than two seeded cells, timed wrapper used obsolete priceCells schema. Fixed synthetic fixture separation and migrated timed source selection to spanCells without changing seeded tariffs.

Actually run: TypeScript noEmit PASS after fixing the original renamed preview field plus new adapter typing; native experiment tests305/305 PASS; M4 route adapter6/6 PASS; quote/JSON/copy assertions PASS; React server render warning visible/unconfirmed and hidden/confirmed PASS; Next production build --webpack PASS with16/16 static pages; real local HTTP /v3=200 and invalid /api/v3/calculate=400 PASS. Initial default-host server encountered uv_interface_addresses; explicit127.0.0.1 resolves start, same-process HTTP verified.

NOT RUN: live geographic route APIs/Yandex/browser driving E2E, the full calculator-final-gate workflow, new Preview deployment. Per-road integrations beyond M4 remain partial; marked estimates are not national independently verified coverage. Next: persist this tested code against actual experimental head, inspect branch CI/Preview, then verify real routes and extend other-road matrix adapters.

## 2026-10-13 — remote persistence and M12 dated integration

Uploaded44 changed blobs to GitHub with every SHA equal to local content; atomic commit bd77b6f125de9e2062a66cb4849661ec80ff62cb persisted on experiment/toll-od-matrix-2026-10-08 with parent440ce6b2 (lease checked). Vercel Preview dpl_6pdqTza1rSL8Cce7MJWAdN7bUBFy was started at exactly bd77b6f, target=null; observed BUILDING, not yet considered tested/ready. Initial API request target=preview was rejected400; retry omitting optional target created Preview, no production target.

Added M12 adapter to V3: native resolved continuous final RVP vector matches a dated current candidate matrix key; known prices rendered as unconfirmed estimates. Missing dated vectors or expired832/Shali block the entire component instead of using stale native money. Tests4 M12 +6 M4 =10/10 PASS; TypeScript PASS and Next build16/16 PASS after this change. Other-road matrix adapters remain the next block. This follow-up changes code after bd77b6f, so that first deployment is superseded for final code verification.

## 2026-10-13 — final special-route wiring

Remote M12 commit8d00f0a433df005bfc73a258be1c9a1c9ebca880 persisted successfully; Preview dpl_BSAkHN4rvU8yLgDGBTsKYMuQ7tqY became READY, exact source8d00f0a. Protected Vercel fetch /v3 returned200; build logs say Build Completed23s. No driving-browser E2E claimed.

Final review found specialEndpoint V3 still called shared V2 special-options. Copied the current module to lib/v3-calculation/special-options.ts with V3 pricing import and changed V3 API import. This ensures M4/M12 dated pricing and expired-Shali rejection also apply to special-zone routes. TypeScript PASS, Next --webpack build16/16 PASS after change. V2 files unchanged. This final follow-up needs its own exact-commit Preview.

## 2026-10-13 — final remote checkpoint and Preview verification

Final code10276acf786c9ceb60ae19b8f85f7938bd84a9f0 persisted in experiment/toll-od-matrix-2026-10-08; includes V3 special-options isolation. Vercel Preview dpl_8rCSYEHPBRZ3DYVzsst2kqstoE1j READY, target=null, exact source10276ac. URL https://mezhgorod-calculator-a3d3ijrcm-4regodatbe-5310.vercel.app/v3 . Authenticated connector HTTP check completed on this page.

Cloud browser navigation with temporary share link redirected to Vercel login, so driving-route browser E2E was blocked at deployment authentication. No CAPTCHA/bot claim, no login attempted, test tab closed. Authenticated connector page availability is not a live route calculation. Temporary share tokens are not stored in Git.

Done this block: matrix lookup for resolved M4/M12 in ordinary and special-zone V3, API warning, V3 result note/copy, expired Shali guard, source/state restored remotely,305native+10adapter tests, TS/build, local HTTP contracts and Vercel READY. Remaining: M11/CKAD/regional matrix-to-route adapters and complete live route verification/full CI gate; do not claim100% national tariff verification or all matrix engines connected. No merge/Production change.

## 2026-10-13 — user route checks, Crimea Yalta → Moscow

User observed 5,040 ₽, the whole Moscow–Krasnodar M-4 tariff, as the toll total from Crimean Yalta to Moscow. They require the additional 800 ₽ full A-289 vector toward the Crimean Bridge, plus the separately traversed Krasnodar bypass. They also asked whether «Ялта — ДНР» is real: it is a separate named settlement. The address-search code intentionally lists that namesake first; no change to the existing priority was made. My prior inference about selecting the namesake did not explain the reported 5,040 ₽ and is superseded.

Diagnosis: shared `m4-production.ts` chooses the 5,040/6,090 whole M-4 tariff and thereby drops its previously detected A-289 frame sum; V3 matrix M-4 adapter declines to replace when an A-289 segment exists. `estimateTolls` has a distinct west-bypass match, but that value also was omitted by the full M-4 substitution. The shared A-289 engine's old three-frame 1,103 ₽ contradicts the user's agreed 800 ₽ full-bridge vector and must not leak into this V3 trip.

Implementation: isolated V3 `lib/v3-calculation/crimea-m4-total.ts` gates on an actual Crimea endpoint, native full M-4 result, exact production and three distinct A-289 frame matches on the selected route. It composes 5,040/6,090 +800 and conditionally +410 only when the selected geometry's existing toll segments include the west bypass. An incomplete A-289 frame set yields unknown/null, not 5,040 as a trip total. Wired before other M-4 matrix fallback in `route-leg-pricing.ts`. The bypass tariff 410 is an existing local value, not newly independently confirmed; the user recalled roughly 300+. `next.config.ts` selects the TS API checker because the inherited Next CLI checker receives zero stdout for `--showConfig` in this workspace. V2 pricing unchanged.

Tests actually run: `node scripts/crimea-m4-total.test.mjs` 2/2 PASS for forward/reverse, conditional bypass, missing frames and non-Crimea; `node_modules/.bin/tsc --noEmit` PASS; `node --test experiments/toll-od-matrix/*.test.mjs experiments/nationwide-tolls/*.test.mjs` 21 files PASS; first Next `--webpack` build failed due inherited `--showConfig` CLI runner, then after config adjustment `node_modules/.bin/next build --webpack` PASS, 16/16 static pages. No actual Valhalla/OSRM or protected Preview live trip executed, and no external source confirms the west bypass figure for the selected trip. Next: validate exact selected Yalta—Moscow route evidence, verify bypass rate, deploy/test Preview at exact new commit, then continue other network adapters. Remote head verified010cf2d at start; local branch integration/matrix-estimates-2026-10-13. No merge/Production.

Follow-up persistence: remote GitHub experimental commit `8b8442ceb2efe9e18382efc08d1d91e274952459` has parent010cf2d and the eight code/state blobs. Preview `dpl_EMmxvx7w6ZELCuKag9upow8Kh2Q4` built exact8b8442c, READY target=null, authenticated GET `/v3` HTTP200 with application title. This checks deployment/page availability only; real Yalta→Moscow API/geographic routing and 410 ₽ bypass match remain unverified. Next run selected route on accessible Preview and compare component evidence, then extend other matrices. No Production/merge.

## 2026-10-13 — A-289 three sections and entrance/exit OD pairs

User requested a matrix of A-289 direct pairs for Krasnodar side, Slavyansk, Temryuk, Anapa exit, and Taman/Crimean-Bridge continuation, in both directions. Inspected archived Avtodor category-I/no-transponder direct table and Yandex route snapshot. Created `A289_OD_MATRIX_2026-10-13.json` with physical frames km23/82/103, named exits, seven undirected priced pairs: Maryanskaya–Slavyansk555, Slavyansk–Varenikovskaya278, Maryanskaya–Varenikovskaya833, Varenikovskaya–Temryuk270, Slavyansk–Temryuk548 from saved operator source; Maryanskaya–Temryuk city fastest620 from user's Yandex control; Maryanskaya–Taman/bridge800 from user's full-vector decision. Both directions are persisted, total14 records. Eight undirected Anapa and partial Taman pairs are recorded as unresolved with reasons; no subtraction/interpolation or 1,103 fallback. Named Varenikovskaya is not silently equated to the Anapa exit.

Generator `scripts/build-vector-matrix.cjs` now reads this versioned file and produces complete OD rows instead of two hardcoded pairs. The previous remote recovery omitted its original `TARIFF_MATRIX_CANDIDATES_2026-10-12.json` input: restored that existing experiment source from the read-only prior checkout to make the whole matrix reproducible. `a289-route-adapter.mjs` requires route identity, exact bound exit and ordered physical frame evidence; Maryanskaya–Temryuk620 additionally requires the city-route bypass control. The V3 full Crimea-M4 helper reads 800 through the new direct registry, not a local literal. Other pairs remain data/adapter ready but require live exit classification; no automatic arbitrary-city assignment.

Actually run: build matrix4693 rows (A289 14 vs4); release selection2086 selected,1830 provisional,777 history; validator PASS unique price keys, directed A289 controls and explicit missing Anapa/Taman; quote/API tests PASS; A289 adapter2/2 and Crimea composition2/2 PASS; experiment native21 test files PASS; Next webpack build16/16 and TypeScript PASS. No real route POST or browser E2E; first source search did not yield a direct current official Anapa/Taman OD quote, so those prices remain unknown. Remote experimental head `7afb510` checked before work; local branch `integration/matrix-estimates-2026-10-13`; persistence/Preview pending. Next: bind exact junctions, run live bidirectional controls, and fill direct prices from evidence. No main/Production.

Persistence follow-up: all16 changed blobs matched local Git blob SHA, published atomically as remote experimental commit `f9c092a0a492cf15c472b488ff71c64ef2c2d1e6` with parent7afb510. Preview `dpl_7CfgeSqL2jfpziGSYFDcFM8nhzPN` built exact code, READY target=null; authenticated GET `/v3` HTTP200/title. Neither page GET nor successful build verifies actual route entry/exit binding. No merge/Production.

## 2026-10-13 — user reports no toll amount for Yalta/Anapa → Krasnodar

Diagnosis in code: `crimeaM4Total` returns null unless full M-4 Moscow–Krasnodar is priced; the general matrix A-289 quote adapter was not wired to short city routes at all. Consequently even a selected short trip with A-289 frames could fall into unknown/partial composition. Added V3-only `a289-short-route.ts`, called by `route-leg-pricing.ts` for matching short routes even when a partial native M-4 toll-plaza candidate exists. It reads physical frame events from the exact selected geometry and maps Crimea/Yalta↔Krasnodar all-three-frames to accepted finished 800 ₽; maps Anapa↔Krasnodar two-frame vector to the stored Maryanskaya↔Varenikovskaya 833 ₽ direct candidate as an unconfirmed approximation to the Anapa exit; also supports exact Slavyansk/Temryuk lookup. Geometrically matched western bypass is added once using existing 410 ₽ candidate. Missing/different frame evidence gives unknown rather than a forced city-based toll. This is a provisional interpretation of the user request to display the majority of already stored prices, not proof of the actual Anapa exit tariff.

Checks actually run: synthetic selected frame and endpoint regression `node scripts/a289-short-route.test.mjs` 2/2 PASS forward/reverse Yalta/Anapa, bypass once, wrong/missing frame null; `node_modules/.bin/tsc --noEmit` PASS; `node_modules/.bin/next build --webpack` PASS16/16 static pages. Real exact user journey API/browser not run due protected Preview and external routing access, so do not claim the observed UI now returns those numbers until live exercise. Persisted experimental commit `ed34c4c18ba74fe292042be4ea2ec985269eb1f7`; Preview `dpl_CUGKzMqTn6D8H4cjoDTDpkNtD3z5` READY target=null; authenticated GET /v3 HTTP200. Also ran native experiment files22/22 PASS. Next: inspect real routes and refine exit binding. No main/Production.

## 2026-10-13 — full requested audit, code and calculation pass

User requested a complete audit in large stages and immediate fixes. Remote baseline verified d0dc2227 (code ed34c4c); checkpointed previously published working tree locally as9b30d57. Inspected canonical state, decisions and source, all4693 selection-register rows (zero overlapping date intervals or invalid amounts). Found and fixed the issues enumerated in AUDIT_2026-10-13.md, including an additional missing-A289 charge for Anapa/Taman full-M4 routes. Kept source prices and existing explicit uncertainty policy; no fabricated official tariff verification. Temryuk preliminary620 now requires ordered two frames and never sets the bypass-control-proved flag from the city name. Anapa833 remains provisional. Shared M4 amounts are consumed instead of hardcoded5040/6090. Invalid/duplicate components fail to unknown, invalid zone lengths to null, not zero.

Initial broad run:57/61 files passed; two stale M1/M3 expectations contradicted the snapshot's explicit 10.10 correction (M1 230; M3 weekdays100/190/190, weekends100/190/230), and two API tests failed JSON native loading. Fixed tests and Node hook; subsequent62/62 files and quote/API contracts PASS. Actual API tests simulate only routing transport and demonstrate numeric unconfirmed Yalta/Anapa responses; they are not live route observations. Focused6 scenarios PASS, TS PASS, webpack16 pages PASS, scoped ESLint0 errors/warnings, diff-check PASS. Added test:audit to build so adapters/integration no longer fall out of release checks. No measured live performance claim; registry already indexed once and no new pricing network calls. Open calendar holiday/midnight issue, incomplete other-road live composition and exact local route bindings are documented, not silently declared solved. Remote persistence/Preview pending at this entry. No main/Production.

## 2026-10-13 — десятичастный аудит, часть 1: восстановление и API

User requested ten comparable audit parts with fixes. Plan/acceptance criteria saved in AUDIT_PLAN_10_PARTS_2026-10-13.md. Read repository instructions/current state/decisions/log; clean local baseline8556e578901b24223a634c05c808791c12c52b0d on integration/matrix-estimates-2026-10-13. GitHub GET git/refs/heads/experiment/toll-od-matrix-2026-10-08 confirmed remote d0dc2227d75862c58b1fc880c96a9440049ceef7. No open PR for that branch in returned open PR list; #12 is V2, not target. Prior audit remains local and was not represented as newly implemented.

Reproduced npm run test:audit:458/458 plus quote/API contracts. Found V3 request validation accepted normalized invalid calendar dates (Feb30) and ambiguous/timezone-free strings. Added strict ISO calendar validation in app/api/v3/calculate/route.ts before routing; timestamps require timezone, ISO dates remain compatible. Added real POST tests for six invalid inputs asserting zero external fetches, and leap-day/UTC/date positive cases. External routing transport remains simulated; no real route/browser claim. No tariff policy changes.

Executed after fix: npm run test:audit PASS460/460 plus quote/API contracts; node node_modules/typescript/bin/tsc --noEmit exit0; node node_modules/next/dist/bin/next build --webpack exit0,16/16 pages; node node_modules/eslint/bin/eslint.js app/api/v3/calculate/route.ts scripts/v3-api-audit.test.ts exit0; git diff --check exit0. Logs /tmp/izavb-audit-part1-fixed.log and /tmp/izavb-audit-part1-build.log are temporary; results recorded here. No failed check concealed: initial lookup of nonexistent fastest-route-selection.ts returned file-not-found; next block must locate actual selector. Build/test commands completed, no live/deployment action.

Part1 complete locally; parts2–10 pending. Next: audit route-leg selector/special-options for minimum ETA, stable ties and same-provider geometry/evidence. Remote publication remains pending; do not claim current Preview contains these fixes. Commit for this block is the commit containing this entry (resolve via git log); base8556e57. No merge/main/Production.

## 2026-10-13 — часть 2, fastest selection / same-route evidence

Resume on ef0da4c with pending route candidate edits; remote experiment head rechecked via GitHub GET: d0dc2227 unchanged. Added isUsableRoute in V3 (finite positive distance/time, valid complete coordinate array and matching oriented endpoints with existing policy tolerance). Applied before ordinary/special candidate ranking. Removed straight endpoint-line substitution for missing geometry. Special fastest-only now prices the exact selector provider and final candidates stay in the allowed geographic corridor. No freeError on ordinary fastest-only since no bypass search ran. Equal ETA retains fixed provider order; existing selector already provides this invariant.

Tests added in scripts/v3-route-selection-audit.test.ts exercise actual POST/policy/pricing with only external transport simulated: fastest OSRM A289 geometry and fare, rejected negative distance, special rejected negative ETA (previous second ranking could select it), stable tie on both flows, unusable endpoint/coordinate values and empty shape rejected with502. Focused6/6 PASS. npm run test:audit PASS466/466 plus quote/API contracts. tsc --noEmit PASS. First scoped ESLint failed prefer-const/unused index in edited existing functions; fixed and reran successfully. Next webpack build exit0/16 pages. git diff --check PASS. No live-provider/browser/new tariff/source/deployment claim. Source files route-candidate.ts, route-leg.ts, special-options.ts. V2 unchanged.

Next part3: intermediate A289 OD pairs, same-segment frame ordering, unknown-not-fallback handling. State saved in this commit; remote persistence remains pending. No merge/main/Production.

## 2026-10-13 — часть 3, A289 intermediate OD / ordered camera traversal

Base57543aa. Inspected actual A289_OD_MATRIX, adapter, physical engine and V3 short/composite flow. Removed unnecessary Maryanskaya-only restriction so recorded intermediate pairs reach V3 (Slavyansk–Anapa278 and Anapa–Temryuk270 as provisional Varenikovskaya alias; Slavyansk–Temryuk548; reverse same stored cells). No new tariff cells invented. Unknown OD or exits returns explicit tolls:null with reason, and route-leg-pricing preserves the blocked result instead of nullish fallback to native monetary sum. crimeaM4Total also handles unresolved extra component safely.

Physical engine previously sorted only segmentIndex: two cameras on one coarse shape segment inherited registry order instead of travel order. Now stores within-segment projection, sorts first passage along the route, and reports repeatedFrames when the same anchor is revisited after leaving camera vicinity (>0.5km progress between near matches). V3 blocks finished single-OD price for repeat passage; neighboring sampled points remain one passage. This does not certify independent map/road-lane evidence: same existing80m geometry matching and direction-anchor data remain, live bindings deferred. Native V2 counted-once monetary rule unchanged.

Focused20/20 PASS (real registry/frame geometry and API with fetch-only simulation); full npm run test:audit472/472 plus quote/API contracts PASS. tsc --noEmit PASS, Next webpack16/16 PASS. Initial scoped ESLint failed legacy mock variable module; renamed testModule and reran scoped lint plus affected mock2/2 PASS. git diff --check PASS. No real route/browser/public source verification. All provisional prices keep warning; Slavyansk–Taman remains unknown.

Remote preparation: GitHub GET remote commit d0dc2227/tree0ed91222, recursive646 entries/no truncation. Changed tracked files relative to local checkpoint9b30d57 all match remote baseline blob SHA, no mismatches/missing source. Write to experimental branch pending; do not claim Preview changed. Next part4 M4 partial/full composition with A289. No merge/main/Production.

## 2026-10-13 — части1–3 persisted / exact Preview verified

Saved all35 changed files since remote-matching checkpoint9b30d57 via GitHub create_tree(base0ed91222) → tree5419073db1028042710f803cd5cea72bf6bb3f57, create_commit(parent d0dc2227) → code93c0c5d2848202824f5a0e3f2afb1f782080c7d6, update_ref experiment/toll-od-matrix-2026-10-08 with expected_sha d0dc2227 and force=false succeeded. New recursive tree655 entries/nontruncated; compared all35 changed blob hashes against localHEAD373fefd, mismatches0. This also publishes previously local audit8556e57, part1ef0da4c, part257543aa and part3373fefd.

Inspected Vercel team_UFuw0UGXjMqBV2hJBxsWGAMS/projectprj_JbuIKFQNjD3FvAcX2I65Dm5OBKie. Auto Git Preview dpl_7yF5xLbKL6bHP4NBqKUwQ9bTodVv changed BUILDING→READY, target=null, exact git meta93c0c5d/experiment. URL https://mezhgorod-calculator-5xqtongc3-4regodatbe-5310.vercel.app/v3 . Build tail confirms472 tests/pass472/fail0, quote/API contracts PASS, compile/Next16/16, completed27s. Earlier500-log request was truncated; retrieved backward80-event tail for actual summary. Authenticated web_fetch_vercel_url GET /v3 success/status200, correct page title. This verifies page/deployment availability only, not a routed user calculation. No browser/new live router or production publication.

Followed Vercel deployments-cicd and access-protected-vercel-deployment instructions for inspection/protected fetch. No protection setting changes. Current code remote93c0c5d; this subsequent documentation commit preserves checkpoint, does not require rerunning unchanged code. Next: part4 M4 vectors/partial/full and A289 composition, then remaining5–10. Full audit not yet finished.

## 2026-10-13 — user833 objection, class-column repair and audit stage4

Base local801aa3a, remote8cc2982424e78c32d696b79bc857be05310ce94e checked via GitHub. User explicitly questioned partial Anapa833 > fullA289800 and requested Slavyansk→Krasnodar/Rostov checks, then next stage. Diagnosed flattened operator vehicle category I/II columns misread as payment modes. Primary web search indexed avtodor-tr.ru/road/tariffs returns complete A289 category rows415/205/620/180/800/385 vs II555/278/833/270/1103/548. Direct pages403/timeout/proxy_error, no new PDF downloaded; tskad indexed docs identify order59/27.02.2026. Saved source-snapshots/a289-category-columns-2026-10-13.json. This corrects previous assistant scope/transponder explanations without undoing user's accepted620/800 values. Bypass410 checked against separate primary indexed DZOK class-I410/410, not changed.

Updated active data/tolls and experiment snapshot A289 rows (old interpretation preserved explicitly), frame engine415/205/180, direct OD matrix and class metadata/guard, generators and4699-row vectors/register/validation. City two-frame620 stored as TemryukCity; operator three-frame Temryuk800 is separate. Taman385/180 continuation aliases use independently stated direct terminal OD, visibly provisional. Related old class-II test expectations corrected. First broad edit accidentally changed gate longitude37.8330177 in tests; corrected before acceptance. Initial full gate failed and is not counted as passed.

Live external API requests actually ran (no routing simulation): AnapaKrasnodar165009m/8657s/620, OSRMframes82→23; SlavyanskKrasnodar83634m/4824s/415, frame23; SlavyanskRostov316724m/16991s/150 on an OSRM route without A289, confirmedM4-1093. Raw API/provider responses saved under live-controls, portable replay scripts/v3-live-a289-audit.mjs. Independent live cloud Yandex UI for same representative public coordinates: Anapa102mi/2h17/~620, Slavyansk52mi/1h22/~415; Rostov218mi/4h throughA289→M4, paid label but no amount. Opera not connected, metered TinyFish wallet negative, free source fetch errors; independent public route-browser interaction worked without CAPTCHA/login. No site claim based on failed tools. Exact postredirect URLs/directions/profile in yandex-a289-city-controls JSON.

Stage4 new m4-a289-composition.ts: V3 calls nativeM4 with includeA289=false, default existing callers unchanged. Exact/known partial-corridor M4 vector and separate A289 lookup sum once; a confirmed M4 PVP binds eastern A289 continuation, not full Moscow-only condition. Nearby unconfirmed M4 candidates don't spoil a local A289 quote; any confirmed M4 passage is retained. Partial/unknown M4 blocks complete total; mixed M4/A289 payload rejected; duplicate legacy bypass labels add once. Synthetic real-matrix controls850+415=1265,850+620=1470,+410 only when separately detected; full5040+800=5840,+410=6250. These conditional vector tests are not YandexRostov totals.

One live diagnostic through old approximate bypass-start control returned360335m/19073s/1265, slower than unconstrained provider; not added to runtime/ranking. Record persisted. OSM new booth query returned406, no new gate coordinates derived. SlavyanskRostov route/ETA discrepancy remains open; cannot close all geographic accuracy from two agreeing money controls.

Verification: vector validator4699 rows PASS; focused A289, API and composition suites PASS (composition/API17/17); final npm run test:audit478/478 + quote/API contracts PASS; final tsc --noEmit exit0; scoped ESLint exit0; Next webpack16/16 exit0; git diff --check PASS. Initial TS union-inference error at JS adapter/TS boundary fixed with result type boundary; final compiler log clean. Actual gate logs /tmp/izavb-part4-final-gate.log, -types, -lint, -build; meaningful results persisted here and detailed report A289_CLASS1_AND_M4_COMPOSITION_AUDIT_2026-10-13.md. No hidden failed check or live-route universal claim.

Next: persist correction and stage4 to remote experiment, inspect exact Preview, then stage5 M11/M12/CKAD. All audit stages not yet finished; holidays/midnight stage7 and live same-route controls stage10 remain. No merge/main/Production.

## 2026-10-13 — category repair and stage4 remote checkpoint

Local implementation b9a4983 persisted to remote experiment/toll-od-matrix-2026-10-08 code4b27032ff430308b46163c876f35b8cf9dcc12b2 (parent8cc2982424e78c32d696b79bc857be05310ce94e), treeced4c0e1da9f6e91e17997b8b2ffa3353a95a678. All39 changed baseline files matched remote before write; after upload all39 blob SHAs matched local,0 mismatches. Large generated register/vector blobs uploaded intact, no truncation; base tree preserved unrelated files; update_ref expected8cc29824 force=false succeeded.

Vercel automatic Preview dpl_CAK7URaKJrP8oNhs6ZhY2svN1VCy READY, exact source4b27032, target=null, URL https://mezhgorod-calculator-4ncn2cwjo-4regodatbe-5310.vercel.app/v3 . Backward80 build-log events show tests478/pass478/fail0, quote/API contracts PASS, compile/Next16/16, Build Completed33s. Protected authenticated connector GET /v3 success/status200. No Preview browser trip claim; actual API/router and Yandex observations already persisted separately. No production/main/merge/protection-setting change.

Following checkpoint clarifies both source snapshot notes: obsolete assistant explanation about payment columns/scope moved into previousNote; active note describes vehicle-category correction. Asserted complete roads objects unchanged before/after, so no fee or price/profile change in this metadata edit. Record checkpoint/next stage5 and open Rostov same-route discrepancy. Final full478/TS/lint/build evidence remains from the unchanged calculation implementation; metadata-only integrity and focused snapshot contracts checked separately.


## 2026-10-13 — stage5 M11/M12/CKAD audit and fixes

User requested continuation of the ten-part audit. Actual checkout integration/matrix-estimates-2026-10-13 clean at ac6fefb; remote experiment head839784e5 reconfirmed. Read AGENTS/current handoff/experiment decisions/plan and existing engines/tests. Implemented OSRM selected-route M11 evidence; directed Order274 M11 matrix adapter and separate geometry head/mainline parts; p147 physical check; fractional facility positions/crossing time; M11 disjoint/malformed/repeated-physical-anchor protection; CKAD directed/date-versioned exact pair; M12 continuous-span strict validation; blocked missing679–684 complete-total subset. New source files engine/m11-route-adapter.mjs, ckad-route-adapter.mjs and lib/v3-calculation/m11-traversal-safety.ts; existing tariff data unchanged. Current authorized candidate/unconfirmed policy remains, unknown never free. Full diagnosis/algorithms/source boundaries and exact limitations: STAGE5_M11_M12_CKAD_AUDIT_2026-10-13.md.

Final focused13/13 and full491/491 + quote/API contracts PASS; Next webpack16/16/TypeScript PASS; scoped ESLint/diff-check PASS. Initial TypeScript verification command TS5074 fixed incremental option, compiler API PASS. Test assertion notes vs segments corrected; coarse-shape failure caused actual fractional-ordering fix. Live repeat guard false positive from two distinct p58 plazas1.346km apart corrected to physical-anchor repeat with regression. Actual external local V3 POST controls final Moscow→Petersburg710.317km/24636s Valhalla unknown679–684; Tver→Moscow179.202km/8889s OSRM unknown incomplete OD. Known5030 Moscow subset observed on intermediate code was rejected before publication; final records only. Replay script scripts/v3-live-stage5-audit.mjs and raw live-controls/2026-10-13-stage5-*.json persist exact sources, HTTP200, unsimulated. No hosted POST/browser/Yandex/CKAD/M12 live validation.

Stage5 existing code/calculation audit DONE with explicitly deferred physical/calendar coverage; nextstage6 M1/M3/regional. Existing Slavyansk→Rostov provider gap remainsstage10; stage7 calendar and source series. Local/remote publication pending, to append verified SHA/Preview after completion. No main/merge/Production.


## Verified persistence / Preview — stage5

Local implementation538c8ac maps to remote code6f68c9574f8eab5e4a6d795764949d53b9a99f49 (parent839784e5), followed by1506a8623cd9780930de75a346fb96133dc5f93c for large work-log/live-control blobs. Final tree dd4c509fb9de22ce16a335475496ffaaae7e5824 matches all21 changed local blobs,0 mismatches; unrelated tree preserved, ref fast-forward with expected_sha and force=false. First post-upload verification caught3 omitted large files because the upload orchestration updated a transient loaded array rather than persisted entries; corrected immediately in the follow-up commit and all21 verified. No lost local work or different source code deployed.

Vercel dpl_BCRWYuDsaxfZMvL72C66EyMbfHWe READY, target=null, exact source1506a862. URL https://mezhgorod-calculator-oy89ta0xy-4regodatbe-5310.vercel.app/v3 . Remote build logs491 tests/pass491/fail0; quote/API contracts PASS; TypeScript/Next16/16 PASS; Build Completed37s. Authenticated connector GET /v3 HTTP200. This establishes page availability, not hosted browser/route POST, which still have not run. No merge/main/Production. Nextstage6.
