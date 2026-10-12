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
