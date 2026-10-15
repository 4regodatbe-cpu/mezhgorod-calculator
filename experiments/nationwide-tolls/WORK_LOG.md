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


## 2026-10-13 — stage6 M1/M3/regional audit

User asked to continue the ten-part audit. Actual clean checkout0714614 and remoteacefcefe matched checkpoint; AGENTS/state/README/decisions/next/log and relevant code read. Open PR heads #12 draft64631d23, #9 draft63b4c392, #6 open808394c8 inspected; none used for experimental work. Fixed dropped unpriced selected-route M1/M3 and14 regional network detections in V3 composition; late trace cannot revive partial prices; unnamed paid booths retain unknown; exact road-ref boundaries and CKAD intersection labels corrected; precompiled patterns; strict four gate road/km/fare identity and safe integer trace count contract. Added unpriced-road-coverage.ts, focused selected-route regression and actual live replay. Tariff data untouched, no new numeric M1/M3/regional fees. Source series/date, physical binding and always-on evidence coverage are explicitly deferred, see STAGE6_M1_M3_REGIONAL_AUDIT_2026-10-13.md.

Final build webpack:500/500 tests, fail0, quote/API contracts PASS; Next TypeScript/16pages PASS; scoped ESLint/diff-check PASS. Strengthened initially weak approximate A289 fixture to actual stored frames and baseline620 assertion; then verify additional synthetic M1/M3/ZSD detection blocks numeric subset. Live actual local API/provider/trace: Moscow→Kaluga OSRM184.817km/10636s unknown, two physical M3 booths86/136 (not168); Moscow→Odintsovo OSRM26.172km/1937s free0 for exact complete1/1 trace269edges,0 paidedges/booths. External HTTP/API200, no mocks; raw live-controls persisted. Not hosted browser/POST/Yandex verification; no all-road coverage claim. Source national shadow M3 verifiedThroughOct10 and undated generated M1/M3 matrix rows still need stage8, M1 node inventory incomplete; conservative unknown retained. Stage6 existing code audit DONE, nextstage7 calendar. GitHub/Preview pending, to append actual verified identifiers. No main/merge/Production.


### Stage6 final validator hardening / publication progress

After the initial500 gate and live controls, code review exposed two false-free paths: missing/empty/malformed trace edges accepted as complete0; physical booth without toll=true accepted as free. Hardened traceChunk schema/coverage, complete free status now requires0booths, and V3 unpriced detection retains even contradictory physical booth events. Added2 regressions; final502/502 + contracts/TypeScript/webpack16pages PASS; scopedlint PASS. No invented payment or booth identity. Final actual live replay confirmed unchanged routes/results on hardened code, external/API200 (Kaluga18919ms, Odintsovo16040ms); stored raw files from final replay. Initialab191c8 persisted remote6a230c9d (parentacefcefe),15 hashesmatch. Initial create_tree result had no usableSHA, successful retry and tree verification before ref write; no branch loss. Preview first500 version READY dpl_wVWix16XsKBywxoN1zoMzkEzWQau. Final502 source/Preview pending and will supersede that interim version.


## Stage6 verified final publication

Local implementation0260915 maps to remote8df6745822c6e521a1009b6aecb4645a0c3aca1a (parent6a230c9d), final tree5a0f37d73d6bbe460bf0035cb9da24b3a0fffd29. All16 total changed file blobs match tested local code,0 mismatches; base tree preserved; ref expected_sha/force=false. Final live records replayed on hardened validator and saved. First list-deployments immediately after update was empty; no readiness inferred until the deployment appeared.

Preview dpl_87VMJRdHd9ToEbjV8QMURTrjwAjB READY, target=null, exact source8df67458; https://mezhgorod-calculator-2hq1o2uiy-4regodatbe-5310.vercel.app/v3 . Remote logs tests502/pass502/fail0; quote/API contracts PASS; TypeScript/Next16/16 PASS; Build Completed2m (dependency installation delay observed, not a failed check). Authenticated GET /v3 HTTP200 confirms page availability only; no hosted POST/browser/Yandex validation.

Stage6 code/calculation audit complete with explicitly deferred M1/M3 tariff-source/physical integration and regional OD coverage. Nextstage7 road-specific calendar/time. No main/merge/Production.


## 2026-10-13 — stage7 temporal/calendar audit

User requested continuation. Clean local4e6a1a4 / remoteexperimentc48b18e confirmed. Read AGENTS/state/next/decisions, native clock calculations, per-road schedules and adapters. Fixed server-timezone getDay in legacy toll/native M11 to Moscow weekdays; M12 supported allDays label; explicit M4 null-tolls calendar/midnight result retained across V3/M4+A289 rather than resurrecting native amount; impossible Date-normalized calendar; M11 date-only/missing hourly time and unknown years; potential mainline special-day ambiguity guard avoids borrowing head/M4 calendar rates; native crossing-time wording now calculated, not actual. No fare cells or new holiday rates added. Detailed algorithms/source limitations STAGE7_TIME_CALENDAR_AUDIT_2026-10-13.md.

Focused6/6; final508/508 + quote/API contracts, TypeScript/Next webpack16pages PASS, scoped lint/diff-check PASS. Initial M12 unused-argument lint warning fixed while preserving API. Deterministic synthetic selected vectors and TZ/night boundary checks only; no new live external routing/browser/hosted POST. M4 same-trip midnight remains conservative unknown; complete mainline special/transferred-day schedule, seasonal source succession, version-at-crossing and actual payment/edge ETA unresolved, delegated to continuing source/version stage8 and E2E10 rather than claimed complete. Stage7 existing temporal code audit DONE, nextstage8. No main/merge/Production. Local/remote checkpoint publication pending, append exact verified SHA/Preview evidence.


## Stage7 verified publication

Local99fbcf4 maps to remote988a2a0b6f20518c368ea1239bbd2f10a3250e57 (parentc48b18e2), treeb18a787c48eeada9bdf4eb9ea405cb7ee2febcf7. All17 changed blobs matched local tested source,0 mismatches; remote base protected with expected_sha, force=false. Open unrelated PRs12draft64631d23,9draft63b4c392,6open808394c8 rechecked unchanged; no experiment PR/merge action.

Preview dpl_Fvjo1poQfyvkPkbsVSDiEEP29UDB READY exact source988a2a0b, target=null; https://mezhgorod-calculator-h1hah9yrn-4regodatbe-5310.vercel.app/v3 . Remote logs508/pass508/fail0, quote/API contracts PASS, TypeScript/Next16/16 PASS, Build Completed28s. Protected authenticated GET /v3 HTTP200 establishes availability only, no hosted route POST/browser/current-tariff or live calendar verification. Nextstage8 with explicit source/time limitations above. No main/merge/Production.


## 2026-10-13 — stage8 tariff versions/zones/rounding

User asked continuation. Clean local67644e5 and remoteexperiment6eeb8bde confirmed; instructions/current handoff/decisions/generator/pricing and source snapshots read; unrelated PRs12/9/6 unchanged. Fixed lexical date-vs-ISO first-day exclusion, Moscow interval normalization, intraday unknown, effectiveUntil alias and invalid/conflicting bounds; selected-row provisional identity;1549 undated rows now unconfirmed while numeric candidate permission retained. Added fare-validity.cjs and offline createQuoteEngine factory, runtime still shipped registry. Commercial fare now rounded once then apportioned by largest fractional remainders with stable index ties; displayed parts equal total; strict floating-point split coverage and safe money/overflow/vehicle-review guards. Prices/rate tiers/zone policies and all4699 source rows unchanged. Report STAGE8_VERSION_ZONE_ROUNDING_AUDIT_2026-10-13.md.

Focused8/8; final516/516 + contracts/TypeScript/webpack16pages PASS. Scoped lint initially rejected CommonJS require-import syntax in .cjs; declared intended CommonJS file style, lint rerun clean; diff-check PASS. No new live routing/browser/hosted POST. Primary M1 official query noresults; official tariff page403. Found generator230 vs stored noTransponder250 conflict, retained data and unknown customer M1 rather than guessing category/payment meaning. M3 series/date, mainline M11 independent calendar/seasonal succession/physical coverage remain deferred. Stage8 existing calculation/version/rounding code audit DONE, nextstage9. Local/remote publication pending; append actual verifiedSHA/Preview next. No main/merge/Production.


## Stage8 verified publication

Local8993d81 maps to remote5d222c7727b9e911800c985e15f8c5f4f7016277 (parent6eeb8bde), tree22a00de6f518f038b43d88414446bf12ae234116. All10 changed file blob hashes matched tested local source,0 mismatches; base tree preserved, update_ref expected_sha/force=false. No source price dataset regenerated.

Preview dpl_EXRpmoF43j4Y43XAS9aq1seZVtN9 READY exact source5d222c77, target=null; https://mezhgorod-calculator-e7f9g7iwb-4regodatbe-5310.vercel.app/v3 . Remote logs516/pass516/fail0, quote/API contracts PASS, TypeScript/Next16/16 PASS, Build Completed31s. Authenticated protected GET /v3 HTTP200 confirms page availability only, no hosted trip POST/browser/new live source certification. Nextstage9. No main/merge/Production.


## 2026-10-13 — stage9 UI/copy/failure/state audit

User requested continuation. Clean ca53a08/local integration and remoteexperiment72fcdbd7 verified; instructions/state/decisions/next/README/shared UI/provider cache read. Unrelated PR12/9/6 unchanged. Fixed fastest-only UI/copy replacing API toll.amount with weekday/weekend references: explicit actual mode/card-owned warning; V2 selector kept. Added strict nested response money/arrays/total/toll-state validator and actual automaticMode type; request identity/unmount abort, reset/error/manual/copied lifecycle, clipboard catch/cancel/late identity; guarded optional browser storage/crypto, stable SSR urgency init, best-effort telemetry does not invent missing fares0. Combined display money/manual overflow guard. Provider21600s geometry cache documented unchanged, no final price cache found or added. Details STAGE9_UI_COPY_FAILURE_AUDIT_2026-10-13.md.

Focused11 functional tests PASS: controlled real-hook lifecycle/fetch/clipboard harness and actual ReactDOMServer ResultPanels/Card/PriceRows markup. Real API880 night amount vs1130/1650 references preserves880/+base100=980 and unconfirmed warning in both markup/copied text. Final527/527 + quote/API contracts, TypeScript/Next webpack16pages PASS; scoped ESLint/diff-check PASS. Initial TypeScript failure exposed missing automaticMode shared response field after narrowing; fixed type, no assertion hiding. Applied React Best Practices skill checklist to TSX changes. No actual hosted browser/system clipboard/live routing in this block. Pending stage10E2E/provider/cache/performance/source/physical/calendar gaps remain explicit. Stage9 existing client code/render audit DONE; GitHub/Preview pending, append actual verifiedSHA. No main/merge/Production.


## Stage9 verified publication

Locald0fcdfa maps to remote402a1b2a15dbbde22fa20ac7d328a9329ebd45c4 (parent72fcdbd7), treeec52233f826b853c59fafaed065fc4eb33086ae2. All16 changed blobs matched tested local source,0 mismatches; base tree preserved, expected_sha/force=false ref update. Strict response validator also replayed7 saved actual API responses (Anapa/Slavyansk/Krasnodar/Rostov, Moscow–Petersburg/Tver/Kaluga/Odintsovo), all valid; this is saved-payload compatibility, not a new live route run.

Preview dpl_4uHeVRXK2J3GcKENFYrqddQ6BNKw READY exact source402a1b2a, target=null; https://mezhgorod-calculator-7u2o9rrzb-4regodatbe-5310.vercel.app/v3 . Remote527/pass527/fail0, quote/API contracts PASS, TypeScript/Next16/16 PASS, Build Completed52s. Authenticated protected GET /v3 HTTP200 establishes availability only, no hosted trip/browser/system clipboard verification. Next finalstage10. No main/merge/Production.


## 2026-10-13 — stage10 UI and user screenshot controls, IN PROGRESS
# Stage10 in progress — requested UI and screenshot routes, 2026-10-13

User asked: approved «из А в Б» logo, centre city swap, larger/centred ₽/км, filled circular increment and outline circular decrement controls, Calculate disabled until A/B entered, remove «единственный допустимый», investigate missing road fees for screenshot routes. Baseline local1a02b81, remote3ce874f365e4647e7a1cce49ccd1646d37ac71f9 checked unchanged; unrelated PRs12/9/6 unchanged. No main/merge/Production.

## Implemented

- `public/izavb-approved-logo.svg` copied byte-for-byte from existing portal working source `/workspace/scratch/f8c8d11baabe/portal-work/apps/web/preview/assets/logo.svg`. Prior approved variant2: navy text, lower orange line/two markers, no upper line. Replaced V3 Car placeholder with this asset via Next Image; accessible h1 remains. No new logo invented.
- V3 swap exchanges whole Place objects (labels AND positions), cancels/clears old results. Desktop centre control between A/B, stacked mobile control between fields. Shared form only renders swap when handler exists; V2 gets no dead control.
- CTA desktop/mobile disabled for empty/whitespace labels or loading. Typed addresses can still be geocoded by API; no artificial requirement to choose a suggestion added.
- Rate/unit22px/17px, centred in the available column, circle-filled upper stepper/circle-outline lower stepper. Do not span across the decrement button column (initial draft overlap corrected).
- Ordinary V3 route note now «Выбран маршрут с минимальным временем». Unknown road fare has a prominent card-owned note that the full trip total is unknown; base fare remains labelled without roads.
- Proven calculation bug: `recoverCorridorTolls` can sum just two approximate M12 segments and produce995 as matched. V3 local/remote recovery now retains those segments as diagnostics with zero internal sentinel and null/unknown API fare, not a full charge. Matrices/strict road engines and A289620/415 unchanged. V2 legacy recovery unchanged.

## Corrected earlier assumptions

Earlier uncommitted A289 alias detection and direct-price override were speculative, unsupported by a failing example, and could suppress a road candidate. They were fully removed before final tests. Earlier commentary asserting A289 alias as the root cause was incorrect. Existing saved live A289 controls already returned620/415. Current proven issue is subset recovery, not a missing A289 tariff.

## Screenshot comparison / actual fresh API-handler runs

Screenshots are user-provided Yandex UI observations, not authoritative billing tables. API uses representative city coordinates, not guaranteed identical addresses/traffic/departure minute. All external providers actual, not mocked. Full raw geometry was not archived in this block; final Ufa API body/provider summaries retained in `live-controls/2026-10-13-stage10-ui-ufa-moscow.json`. Replay runner `scripts/v3-live-user-routes-audit.mjs [case-name]`.

| Route | Screenshot fastest | Actual API chosen | Road amount / reason |
|---|---|---|---|
| Ufa→Moscow |1330km,13h52,~6720₽ (other paid choice~5909)|Valhalla1315.853km,63893s (17h44m53s)|Before995 subset recovery; finalnull unknown, same selected distance/time. Final measured39162ms; screenshot fare not imported.|
| Petersburg→Moscow |710km,7h18,~5630₽|Valhalla718.376km,24952s (6h55m52s),11410ms|null, `m11_northbound_sequence_not_proven`: full geometry head engine supports northbound and Tver southbound, not complete Petersburg southbound. Separate679–684 remains unresolved.|
| Petersburg→Sevastopol |2590km,30h03,~11899₽|OSRM2591.826km,122968s (34h09m28s),34467ms|null, unresolved full M4/A289 and M11; Valhalla/BRouter400 for controlled corridor.|

Distances look similar but durations differ substantially. No ≤3% Yandex equivalence claim. Earlier discussion suggesting Ufa time was17 minutes faster was incorrect: API17h45 vs Yandex13h52. Display unknown does not fix source/physical completeness; the requested full numeric tariffs for these three routes remain OPEN.

## Verification actually run

Focused final12 tests PASS, including actual React static form render (CTA blank/typed addresses and swap rendered) and actual recovery+V3 regression proving legacy995 becomes null unknown. Full `npm run build -- --webpack`:530/pass530/fail0, quote/API contracts PASS, TypeScript and Next16/16 PASS. Scoped ESLint/diff-check PASS. First focused command omitted TS loader and failed module resolution; corrected command with register-ts-paths passed. React skill review: accessible labels/button types/logo alt, no new hook/dependency, swap/reset consistency, static asset dimensions.

Local Next startup default hostname failed `uv_interface_addresses`; explicit127.0.0.1:3101 started successfully. Playwright installed but Chromium executable absent, no system browser found; browser script could not launch. No screenshot visual QA, real browser swap/click/system clipboard or hosted POST claimed. Previous final UI draft530 tests/build ran after final source edits; live replay helper changed only afterwards (not runtime). Actual API-handler calls bypass Next HTTP transport, not hosted browser tests.

## Next work

1. Publish/check exact experimental Preview source; persist SHA/logs/availability checkpoint.
2. Complete directed M11 southbound head/mainline +679–684 physical/source model before numeric Petersburg fares; extend actual M12 complete selected-route boundaries/current versions for Ufa. Do not copy screenshot amounts to other geometry or revive subsets.
3. Obtain a working browser runtime for real desktop/mobile layout and client→API verification; compare same endpoint/date/profile selected Yandex route, then complete stage10 performance/coverage report. Stage10 remains IN PROGRESS; nationwide audit not complete.

## Verified experimental publication — 2026-10-13

Local implementationfeafa14 maps to remotea38c50e3fb19dbbb461104f5483a400ca1da986d (parent3ce874f), tree43b42df8f17f8da1010ca1da021d36f98371394d. All16 changed blobs matched tested local source; remote tree691+new entries not truncated,0 mismatches. Expected-head/nonforce ref update. PRs12/9/6 unchanged.

Preview dpl_DyQNDZRP7MEn6F1L1ryATYhhc7rZ READY, exact sourcea38c50e3, target=null. https://mezhgorod-calculator-ir6hc5hpg-4regodatbe-5310.vercel.app/v3 . Vercel530/pass530/fail0, quote/API contracts PASS, TypeScript/Next16/16, Build Completed30s. Protected authenticated GET /v3 and logo asset200; page references new asset. This proves hosted page/asset availability only, not visual/mobile/hosted trip verification.

Built static HTML contains new logo and swap label. Logo byte-identical to approved portal source, SHA256b5e594ad67f6a7b6ab9eb968df02671b186a30562d117508a1d3f29bc1015957. Local server initially reported Ready on127.0.0.1 but later GET refused connection; no local HTTP availability claim. Browser unable to launch due absentChromium. No installation, auth/protection changes, main/merge/Production.

Next action: complete M11 full southbound/head/tail and M12 full selected vector; repeat exact-route Yandex and working browser checks. User-requested three complete road prices still OPEN; stage10 IN PROGRESS, not10/10 audit finished.

## 2026-10-13 — fare recovery verified locally; environment offline; persistence checkpoint
# Road-price recovery checkpoint — 2026-10-13, execution environment OFFLINE

## Current verified state

User supplied screenshots Volnovakha→Moscow (1182.6 km/17h09) and Ufa→Petersburg (2018.8 km/26h18), requested fixing these and similar missing road fares. Last confirmed local commit8429442; remote experiment branch ad9a8b06f5363c3a2d9c71899a82b9148178005a. No main/merge/Production.

Implemented and verified in the local working tree BEFORE disconnect:
1. M4 validation changes24s/four-request batches/4.5s attempt →55s budget/two-worker queue/8s attempt; next plaza starts when a slot frees. Existing strict near-miss rejection skips needless requests; positive charges STILL require exact toll-tagged expected OSM nodes. Nonarray local trace edges fail safely.
2. M4/M11 midnight guard: every crossed Moscow day must have the same road-specific resolved profile AND applicable fare/source. Tue→Wed/Fri→Sat no longer falsely block; Thu→Fri/holidays/unknown year/hidden weekend/version change remain unknown.
3. OSRM M12 strict named-step evidence bound to the EXACT selected overview geometry, excludes destinations; retains unresolved candidate. Single continuous span uses existing calibrated core. Disjoint traversal is not silently omitted from a composed total.
4. Special route result retains selected M4/national diagnostics; composition reasons retain upstream failures.
5. Tests updated for the intentional calendar/pool policy, with new availability regression suite.

## Actual checks, not plans

Full npm run build -- --webpack FINAL:536/pass536/fail0; quote/API contracts PASS; TypeScript/Next16/16 PASS; scoped ESLint/diff-check PASS. First build failed two stale expectations (all date transitions null/peak4 requests); corrected Tue→Wed unchanged fare with Thu→Fri null and peak2; final build inspected. No browser/hosted POST claimed.

Actual local API-handler + external providers/trace:
- Volnovakha→Moscow BEFORE: OSRM1182.425km/61701s,35.414s API; null because only8/14 M4 candidates completed. Another diagnostic old run11/14 showed repeated4500ms timeouts and tail plazas exhausted budget.
- Same saved selected geometry AFTER queue change, ACTUAL new trace requests:14/14 candidates resolved,8 paid nodes/6 rejected; complete native3050 weekday/3890 weekend.
- Fresh final Volnovakha API: same OSRM1182.425km/61701s,54.732s API;3050 RUB priced/unconfirmed. Longer verification is intentional;25s route+55s proof fits120s API allowance.
- Fresh Moscow→Voronezh API: Valhalla516.348km/24040s,32.618s API;2300 RUB priced/unconfirmed; ordinary weekday midnight trip.
- Ufa→Petersburg BEFORE: OSRM2016.848km/94548s,14.861s API; null for m11/ckad while M12 was omitted.
- Ufa→Petersburg FINAL: same OSRM2016.848km/94548s,16.068s API; null with explicit m11,m12,ckad. Full Ufa fee NOT solved.

Ufa selected trace: M11 has a301.2m unnamed step around p679, followed by5.327km named M11→A118. CKAD is M7→M11, not the currently supported complete M4→M11 east arc. M12 has two separated traversals (eastern section and mainline), interrupted by M7/local16K-1091; cannot treat one known subset as whole fee.

Primary source read: existing scanned September Order274 PDF pages9/10, text layer empty. Mainline679–681/681–684 categoryI56 RUB effective04Sep2026; airport access38 and conditional combined94 (footnote2 requires airport RVP fixation). No new tail money enabled without exact passage binding. Official direct PDF web fetch403; current search index identified the same10-page September PDF. Original PDF exists under source-snapshots/m11/2026-09-04-avtodor-order274-current.pdf. Re-read originals before implementing physical mapping.

## Blocker and persistence limits

During final docs/Git save, tool call stalled; it was terminated without a completion result. Subsequent read-only exec failed:
failed to query exec-server capabilities ...409 Conflict, environment_offline: Environment is not connected.

Thus the local final docs/commit command may or may not have executed. Do not claim a new local SHA or clean tree. Remote runtime remained ad9a8b06 when rechecked; NEW runtime source has NOT been published. Last verified functioning UI Preview remains https://mezhgorod-calculator-ir6hc5hpg-4regodatbe-5310.vercel.app/v3 (sourcea38c50e3,530 tests). This checkpoint is docs/recovery data only and does NOT deploy the fare fixes.

Complete local source files and gzip chosen-provider responses existed before disconnect, but are currently inaccessible. Do not fabricate or substitute them. Recovery JSON reconstructs executed code edits from inspected remote baseline and recorded tool commands; it is NOT a byte-hash comparison with the inaccessible final local tree. New helper/test/live-runner sources are retained within it. Before using, prefer recovered local files, compare, run gates, and verify actual fees again.

## Resume, precisely

1. Restore/check writable runtime. Locate /workspace/scratch/fff27e842376/current-experiment, read AGENTS/current state, git status/head and actual remote/PRs. Do not overwrite an existing modified tree.
2. Prefer its already-tested changes and local live-controls/*.provider.json.gz. If unavailable, run recovery/apply-road-availability.py --apply in an isolated experiment checkout; driver validates base Git blob SHA or skips identical targets, aborts conflicts BEFORE writing.
3. Recovery new test expects the chosen Volnovakha archive. Recover the original JSON+gzip; if not possible regenerate with node --import ./scripts/register-ts-paths.mjs scripts/v3-live-user-routes-audit.mjs volnovakha-moscow. This is actual fresh routing; confirm selected route geometry/proof before treating new fixture as equivalent. Other runner cases moscow-voronezh/ufa-petersburg.
4. npm run build -- --webpack, scoped lint/diffcheck; inspect source/fixture hashes. Persist implementation and detailed log in Git, publish exact experimental Preview, inspect its own536 gate/source/availability; do not claim docs-only deployment carries fixes.
5. Finish full M12 multiple/eastern products, M11 southbound head/mainline+tail and CKAD M7→M11 direct pair binding (dated matrix1313 RUB present but physical integration missing). Ufa/prior Petersburg totals remain OPEN. No borrowed competitor geometry, city-only fare, subset-as-total, main/merge/Production.




## 2026-10-13 20:05 MSK — фиксация повторного пользовательского правила

Пользователь отверг предложенный пункт проверки промежуточных съездов: в принятой модели водитель едет по платной дороге до необходимого конечного съезда; промежуточные съезды невозможны и не должны рассматриваться. Зафиксировано в DECISIONS.md; добавлен приоритет переработки в NEXT_STEPS.md и актуальная запись WORK_STATE.md. Старые требования mainlineContinuity/reentryStatus для нового алгоритма этим уточнением superseded. Код в этом блоке не изменён, тесты не запускались (docs only). Локальная ветка integration/matrix-estimates-2026-10-13, исходный HEAD8429442; незакоммиченный runtime-задел прошлого блока сохранён без включения в этот docs-коммит. Следующий шаг — реализация lookup по двум границам без обязательных промежуточных сетевых проверок. Этап10 и полное покрытие цен остаются IN PROGRESS. Production/merge не выполнялись.


## 2026-10-13 — new endpoint-only implementation, full gate540

# Endpoint-only implementation — 2026-10-13

User repeated and required: one continuous toll-road journey, first/last tariff boundaries, no intermediate exit/re-entry analysis, ready matrix cell. Local branch integration/matrix-estimates-2026-10-13; policy commit5a660cc; remote parent49e1da08 verified. Runtime reconnected and previous uncommitted availability work recovered.

## Implemented

V3 calculateLegTolls now calls resolveSelectedM4Endpoints, not calculateProductionM4/calculateM4Core. Boundary search starts from both route ends, rejects nearby free-ramp candidates until finding each actual paid boundary, stops on confirmed or unknown, does not validate the interior. Cached boundary checks avoid duplicate single-section requests. Existing all-PVP validation is retained for older consumers, not V3 final pricing. No native sum in new M4 production result (tolls:null); only ready matrix lookup can produce its fare.

Existing stored candidate fares are re-indexed by outer boundaries, deduplicating identical amount/source/version cells without adding money. Conflicting prices for the same endpoints fail explicitly as m4_endpoint_matrix_ambiguous-fare-version. Direct south matrix rows support both directions and single sections. Source/calendar/unknown guards retained. No arbitrary tariff winner.

M11 V3 no longer scans geometry for intermediate gaps/repeated crossings. Malformed input and actual endpoint/product mapping still matter; head and679–684 remain separate tariff products. M12 providers additionally expose an endpoint span spanning first/last strict road labels; V3 uses it. Exact OSRM step-chain/overview equality remains required. Older single-span evidence remains available to older consumers, deliberately distinct from new user policy.

Prior recovered work includes stable road-specific overnight tariff windows, OSRM M12 metadata, diagnostic serialization and live source archives. Native per-PVP M4 remains legacy compatibility only; prior3050 live result used that legacy mechanism and must not be presented as proof of new endpoint pricing.

## Actual verification

npm run build -- --webpack:540 tests/pass540/fail0, quote/API contracts PASS, TypeScript5.0s, Next16/16 PASS. Scoped ESLint PASS (npm environment warning only), git diff --check PASS. Tests cover M4 only2 boundary checks when valid, both directions, single-section direct lookup, missing/conflicting cell unknown, M11 same endpoint fare despite internal metadata gap, M12 endpoint span with exact overview binding. No browser/hosted POST/Production.

Fresh actual external-provider local V3 handler POST Volnovakha→Moscow:OSRM1182425m/61701s, elapsed30356ms, unknown due m4_endpoint_matrix_ambiguous-fare-version. Boundary resolution succeeded; this is now a tariff-table ambiguity, not unfinished intermediate checks. First attempted fixed-two-nearby-candidates version failed because one was a free ramp; corrected boundary search and repeated live control. Full price is NOT fixed, and no all-roads completion claim. Saved live metadata and gzip provider geometry in live-controls/2026-10-13-stage10-ui-volnovakha-moscow.*.

## Next

Resolve endpoint table conflicts from actual direct operator tariffs without selecting arbitrary internal chains. Complete missing M11 head/tail, M12 eastern products and CKAD M7↔M11 boundary mapping. User goal remains IN PROGRESS, stage10 not complete. Publish only experimental Preview after verified persistence; main/Production untouched.


## 2026-10-13 — actual Yandex controls and four reviewed endpoint cells

# Яндекс: устранение конфликтов готовых endpoint-ячеек — 2026-10-13

Запрос пользователя: проверить конфликтующие записи Яндекс Картами и оставить по одной. Выполнена реальная облачная UI-сверка двух северных векторов М4, не всех конфликтов страны. Новые правила one-entry/exit соблюдены; контрольный промежуточный ПВП71 применяется только в исследовании для определения правильной тарифной границы, не в live расчёте.

| Направление | Пн–Чт | Пт–Вс | Основание |
|---|---:|---:|---|
| m4-620 → m4-71 | 2480 | 2730 | Яндекс623км→ПВП71→66км |
| m4-636 → m4-71 | 3050 | 3370 | Яндекс641км→ПВП71→66км |

Параметры Яндекса: легковое авто ниже2м без транспондера, отправление13Oct20:33/34 и17Oct20:33MSK, прибытие14/18Oct. Подробный маршрут показывал именно эти суммы с~ и текстом оператора о цене на момент выезда. Все сохранённые суммы — unconfirmed estimates, не подтверждённые квитанции. Точные проверенные post-redirect URLs, координаты, даты, ETA и отрицательные контроли в live-controls/2026-10-13-yandex-m4-endpoint-conflicts.json. Точность расстояния показана в милях; не заменять округлённые мили точной геометрией.

В текущем калькуляторном OSRM Волноваха→Москва границы636→71. Отдельный Яндекс целиком Волноваха→Москва показывал3810/800mi/16h49; его полная цена НЕ скопирована в калькуляторный1182km маршрут. Используется только отдельно исследованный endpoint-коридор. Полное геометрическое равенство двух провайдеров не установлено и не заявляется.

Первоначальный северный контроль623→66 показал2480 в будни, совпавшую с одним старым вариантом; старый2330 не совпал. Выходной контроль2730 не совпал НИ с3130, НИ с2950. Поэтому ошибочно было бы просто выбрать одну старую цепочку и перенести её выходной тариф. В обратном направлении без фиксации ПВП71 Яндекс объезжал его через Каширское шоссе и показывал2170 в будни; этот контроль не разрешает зеркалить северный тариф. На пересчёте будущего маршрута также была платная иконка без суммы; она не считается0/проверенной ценой.

Активные четыре directed/profile-ячейки в M4_REVIEWED_ENDPOINT_CELLS_2026-10-13.json имеют приоритет в endpointRegister; все старые варианты для точного ключа road/from/to/profile исключаются из активного lookup. Исходный TARIFF_SELECTION_REGISTER сохранён как история/legacy, не уничтожен. Другие пары/обратные направления не выбираются по аналогии и остаются открытыми. Генератор старых цепочек не создаёт reviewed-ячейки и не может перезаписать их импорт; никаких сумм ПВП в новой обработке нет.

Проверки: npm run build -- --webpack542/pass542/fail0, quote/API contracts PASS, TypeScript4.6s/Next16pages PASS; scopedESLint иdiffcheck PASS. Тесты обеих северных пар/двухпрофилей/unconfirmed и запрета переноса в reverse/другую конфликтующую пару. Живой локальный handler контроль записывается отдельно по фактическому результату; browser UI тарифы не выдаются за hostedPOST.

Статус: две пары/четыре ячейки обработаны; полная очистка всех конфликтов и nationwidestage10 остаются IN PROGRESS. Следующий шаг — аналогично проверять остальные реальные крайние участки/направления, сохранять суммы и случаи несовпадения, не выбирать min/max произвольно. Production/merge не выполнялись.

Actual fresh local V3 API handler/external-provider control after selection: Volnovakha→Moscow1182425m/61701s, status200, elapsed33949ms; priced3050, weekday3050/weekend3370, unconfirmed, segment m4-636→m4-71. This is live local handler evidence, not hostedPOST/browser calculator E2E.

Persistence: localf93ec71081be48fb541f997b496b7aada0a49179 → remote ca8d317f138a2727f0399de9dd6751c0b6115429, parent34b9a0ca;9 changed blobs verified byte-hash identical before nonforce expected-head ref update. Working tree clean. Preview dpl_D2pZpBEFmaN5JEW94TJymCvujcx5 automatically created target=null, exactca8d317 source; last observed BUILDING, not yet READY/availability-verified. No Production.

Whole index audit after expanding compound boundary IDs and counting directed/profile keys:472 conflicting keys before,468 remain after4 reviewed cells. These are fare keys, not472 physical roads or distinct journeys. This block fixes only two northbound pairs. Other pairs need actual control geometry/paid boundaries; no global339/355 winner inferred.
## 2026-10-13 — matrix stage 1: writable checkout and M4 endpoint conflicts

User asked to remove the read-only limitation and start the first matrix-audit block. The earlier `matrix-work` checkout is mounted read-only (`EROFS`); this is a workspace mount policy, not Unix file mode. Created a full Git clone under the permitted writable workspace at `/workspace/scratch/806dbc1ef74b/matrix-audit-work`, branch `audit/matrix-endpoint-conflicts-2026-10-13`, based on integration head `8cc7cf4d967fb356f9923aa71654adf51a8aca10`. The original mount was not modified. Existing installed dependency tree was reused read-only after the package registry returned `EPERM`; lockfile unchanged.

Finding: full keys `(road, from-chain, to-chain, profile)` were unique, but endpoint lookup collapses alternative M4 chains to `(directed first section, directed last section, profile)`. Those collapsed groups can carry different offline-added amounts. Generator `build-vector-matrix.cjs` now expands compound endpoint IDs, marks each M4 candidate runtime eligible only where all source chains for that directed pair/profile agree, and emits `m4EndpointConflicts` plus `m4RuntimeEndpointSpans`. Conflicting source rows remain in the matrix as audit-only, with no arbitrary min/max/first winner. Rebuilt selection register preserves those fields. `m4-route-adapter.mjs` excludes quarantined rows, reports an explicit ambiguous-fare reason for known conflicts, and does not synthesize reverse prices; reverse rows are independently grouped. The four existing Yandex reviewed directed cells continue to override only their exact keys.

Validation on this branch's input: matrix contains4699 rows, of which1456 are M4 candidate rows; 428 ordered endpoint/profile groups have conflicting amounts and remain quarantined; 360 groups have a unique offline amount. These figures are specific to this generated input and counting key, and are not a claim that 428 roads or journeys were checked. `validate-vector-matrix.cjs` verifies every conflict is excluded from runtime and each eligible row belongs to a unique fare group. Quote test and M4 adapter tests pass, including conflict→unknown, previously reviewed cells, unreviewed reverse, and single-section direct lookup.

Commands actually passed: `node experiments/nationwide-tolls/scripts/build-vector-matrix.cjs`; `node experiments/nationwide-tolls/scripts/build-release-register.cjs`; `node experiments/nationwide-tolls/scripts/validate-vector-matrix.cjs`; `node experiments/nationwide-tolls/scripts/quote.test.cjs`; `npm run build -- --webpack` (75/75 tests, quote/API contracts, Next16 webpack build and TypeScript). `git diff --check` passed before docs. An initial full gate without dependencies failed because clone had no `node_modules`; npm registry install attempts were denied `EPERM`. Reused exact existing local package versions (Next16.3.4, TypeScript5.9.3), then reran the full gate successfully. No browser, new Yandex route, hosted API POST, Vercel deployment, push, merge, or Production action performed.

Remaining: query/direct operator evidence for the other428 conflict keys; confirm why this branch's scope count differs from the separately recorded broader audit count472 (the counts use different input snapshots/normalization and must not be conflated); complete M11/M12/CKAD product bindings. Full nationwide pricing audit remains IN PROGRESS. Working branch is local and must be pushed through the normal repository path only when explicitly requested/approved by the project workflow.

## 2026-10-13 — M1/M3 and regional tariff re-audit

User requested a full tariff audit. Rechecked current Avtodor's official tariff-page indexed table and the official 2026-03-02 tariff notice. Found M1 no-transponder had been collapsed to the 230 ₽ transponder fare; corrected to 250 ₽ in active `data/tolls`, `national-registry`, and the matrix builder. Reconciled M3 800-vs-520: the archived snapshot read higher vehicle classes (200/320/280) as payment-mode rates. Category-I direct schedule is 100/100, 190/190, 190/230 MonThu/FriSun; full-road benchmark is 480/520. Corrected active and source snapshots and explicitly withdrew the old 800 ₽ shadow diagnostic. A second legacy class error was found in `lib/toll-data/regional-ckad.ts`: full Tolyatti span was 650 ₽ (higher class) instead of category-I 320 ₽; corrected and added a both-direction `estimateTolls` regression.

The generator now sources M1's category-I no-transponder fare from its JSON row and composes M3 vectors from the saved category-I rates. Rebuilt the 4,699-row vector matrix and selection register; 428 endpoint/profile M4 conflicts remain quarantined, 360 unique cells. Builders/validator and focused tariff tests pass. `npm run build -- --webpack` passes 75/75 tests plus Next/TypeScript; the first attempt lacked node_modules and failed, then reused an installed identical Next16.3.4/TypeScript5.9.3 dependency tree and the complete gate passed. No live Yandex route, hosted API, deploy, push, merge or Production action in this block. Other M4/M11/M12/CKAD/region tariff-source dates and route scopes remain open; this is partial audit progress, not full tariff coverage. Detailed report `M1_M3_TARIFF_REAUDIT_2026-10-13.md`.


## 2026-10-13 — тарифный аудит актуальности М-12 и ЦКАД

Пользователь продолжил полный тарифный аудит. Повторно сверил current source для M12/CKAD и группы дополнительных систем после предыдущих исправлений M1/M3/Tolyatti. Госкомпания «Автодор» подтверждает с 08.10.2026 цену 99 ₽ cat-I для конкретной пары съезд Сокуры→Шали. В legacy code M12 сохраняется исторический `kazan_p239→shali=62`; точное равенство P239 и нового Сокуры въезда не подтверждено, поэтому 62 не заменялось 99. Отдельная legacy full-route строка Москва—Казань ошибочно включала эти 62 ₽: исправлена 5909→5847 ₽ по официальному мартовскому direct matrix assertion Москва→Казань (P239), а не до Шали. Добавлен `scripts/m12-full-route-tariff-audit.test.ts`: синтетическая последовательность опубликованных M12 segments до P239 в прямом/обратном направлении подтверждает 5847 ₽ и исключает сегмент Шали; focused 1/1 PASS. Оператор CKAD публикует длинную OD-cell М-10→ПК-5 3189 ₽ (base no-transponder в сохранённой таблице), тогда как holding-company release на той же дате указывает «вся дорога ЦКАД» 2381 ₽. Оба scope сохранены отдельно; это unresolved source/product conflict, CKAD `runtimeApproved=false`; не выбрана цена. Багратион 790 ₽ base confirmed current, Удмуртия group1 amounts retained pending class mapping. Подробный отчет `TARIFF_AUDIT_CURRENTNESS_2026-10-13.md`.

Повторный `npm run build -- --webpack` в разрешённой рабочей копии после M12-коррекции прошёл: 77 test files pass, quote/API contracts PASS, Next.js 16.3.4 / TypeScript PASS, static pages16/16. Зависимости exact versions переиспользованы из локального package tree через временную ссылку; lock-файл не менялся, ссылка удалена. No new Yandex/operator calculator trip or receipt, no runtime fare changed, no deploy/merge/Production. Repository branch `audit/matrix-endpoint-conflicts-2026-10-13`, base local HEAD `bd95fcd` at start; Report/state/log/next-step and Moscow—Kazan correction/test committed as `fb50f8f` on `audit/matrix-endpoint-conflicts-2026-10-13` (one local commit ahead of its local origin); no push/deploy/merge/Production. `git diff --check` PASS; temporary node_modules symlink removed. Next: exact geometry regression for stale M12 legacy matches and direct CKAD operator resolution, then continue M4/M11/other systems.
## 2026-10-13 22:26 MSK — свод правил из чатов и постоянное журналирование

**Запрос пользователя:** найти все правила из связанных с новым алгоритмом/матрицей чатов, обнаружить пропущенное/конфликтующее, добавить новое правило «отдельная пара въезда/съезда для каждой платной дороги; готовые суммы этих дорог просто сложить», и сделать подробные записи по каждому этапу постоянным требованием для продолжения из другого чата/ИИ.

**Источники, которые просмотрены:** актуальная ветка/HEAD и чистота checkout до изменений; `AGENTS.md`, `docs/WORK_STATE.md`, `README.md`, `experiments/nationwide-tolls/README.md`, `DECISIONS.md`, `ALGORITHM_SPEC_2026-10-12.md`, `NEXT_STEPS.md`, `WORK_LOG.md`, `experiments/toll-od-matrix/DECISIONS.md` и backlog. Доступный поиск прошлых чатов вернул релевантные выдержки по правилам от 9–13 октября (fastest-only, geometry, Yandex, тарифные границы, fail-closed, ведение handoff); полный текст всех чатов не был возвращён, что прямо отмечено в сводке.

**Результат сверки:** позднее уточнение пользователя от 13 октября о поездке по платной дороге до конечного необходимого съезда уже отменяло проверки промежуточных съездов/re-entry. Текущее сообщение уточняет арифметику между дорогами: для каждой самостоятельной дороги отдельная пара крайних пунктов оплаты → одна готовая ячейка/вектор конкретной матрицы → обычное сложение готовых сумм дорог. Это не разрешает складывать промежуточные ПВП внутри одной дороги. Неизвестная или конфликтная ячейка любой обнаруженной дороги оставляет весь итог unknown. Также сопоставлены fastest-only, выбранная геометрия, passenger/category-I/no-transponder profile, дата и будни/выходные, принятие конкретных Yandex controls и общероссийская цель покрытия.

**Изменённые файлы:**
- `AGENTS.md`: постоянное требование отдельного append-only stage log с «что/как/зачем/для чего», путями, решениями, источниками, точными проверками, ошибками, ограничениями, Git/PR/deployment state и следующим шагом. Исправлена устаревшая production authorization: прямой запрос нужен перед Production/merge/main.
- `experiments/nationwide-tolls/DECISIONS.md`: добавлены датированные подтверждённые решения по паре каждой дороги/суммированию и журналу.
- `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md`: актуализированы составление route total и endpoint matrix lookup; runtime не ищет цену по промежуточным ПВП.
- `experiments/nationwide-tolls/RULES_RECONCILIATION_DRAFT_2026-10-13.md`: новая сводка, приоритет источников, отменённые старые правила и семь вопросов для совместного решения.
- `experiments/nationwide-tolls/NEXT_STEPS.md`, `docs/WORK_STATE.md`: handoff/приоритеты обновлены.

**Остаточные границы:** в сводке предложены безопасные defaults: самостоятельность определять по тарифному продукту, не только бренду; незаписанный endpoint/реально разрывный проезд без точной ячейки оставлять unknown; равный ETA разрешать существующим детерминированным порядком; направленность брать только из явной матрицы; часовой/праздничный тариф применять только по точному расписанию; совпадающий по всем полям, но расходящийся Yandex-контроль оставлять unresolved. Главный продуктовый каталогический вопрос для дальнейшего обсуждения — как разделить связанные/последовательные тарифные продукты одной магистрали без пропуска и двойного учёта.

**Проверки:** `git diff --check` PASS после удаления лишней пустой строки в конце журнала. Относительные Markdown-ссылки сверены в 7 изменённых/новых файлов: PASS. При первой проверке обнаружились старые ссылки на отсутствующие recovery archive/patch; исправлены как явные исторические ограничения в `docs/WORK_STATE.md` и `NEXT_STEPS.md`, без утверждения, что архив восстановлен. Код, тарифные таблицы и тесты в этом блоке не менялись; тесты/сборка/маршруты/веб-контроли не запускались (docs-only). Branch `audit/matrix-endpoint-conflicts-2026-10-13`, исходный HEAD `3ce9f4a` (локально ahead of origin by 2 commits до фиксации этого этапа); push/merge/deploy/Production не выполнялись.

**Следующий шаг:** совместно проверить сводку, особенно определение самостоятельных тарифных продуктов; затем продолжить текущую матричную сверку по exact endpoint pairs. Общая матричная работа остаётся IN PROGRESS.

**Сохранение этапа:** нормативные правки и сводка сохранены в commit `7cf40fb` (`docs: reconcile toll matrix rules and handoff`) ветки `audit/matrix-endpoint-conflicts-2026-10-13`; после него локальная ветка была ahead of origin by 3, worktree clean. Этот последующий журналирующий commit добавляет только идентификатор сохранённого этапа; push/merge/deploy/Production не выполнялись.

## 2026-10-13 23:54 MSK — план внедрения и официального выпуска V3

**Запрос:** составить чёткий план реализации согласованного нового алгоритма/матрицы до интеграции, тестовой версии и официальной публикации калькулятора. Этот блок — планирование, не реализация и не публикация.

**Проверенное исходное состояние:** локальная ветка `audit/matrix-endpoint-conflicts-2026-10-13` на `22bffe7`, worktree до редактирования чистый; локальный `origin` ведёт на scratch checkout и отстаёт на 4 коммита. GitHub repo `4regodatbe-cpu/mezhgorod-calculator` доступен, default `main`; поиск GitHub не обнаружил audit-ветку, экспериментальная `experiment/toll-od-matrix-2026-10-08` существует. Открытые PR №12/9/6 не являются отдельным V3 release PR. Vercel просмотрен только read-only: последний показанный экспериментальный Preview READY с source `1642c76`, последний показанный Production READY с V2 source `64631d23`; эти показания не заменяют повторную проверку в момент релиза.

**Кодовая сверка для плана:** `README.md`, `docs/CALCULATOR_HANDOFF.md`, `AGENTS.md`, `docs/WORK_STATE.md`, `DECISIONS.md`, `NEXT_STEPS.md`, `ALGORITHM_SPEC_2026-10-12.md`, десятичастный audit plan, `lib/v3-calculation/route-leg-pricing.ts`, `lib/toll-engine/route-toll-composition.ts`, `experiments/nationwide-tolls/engine/quote.cjs`, `app/api/v3/calculate/route.ts`, `app/page.tsx`, `.github/workflows/calculator-final-gate.yml`, `scripts/segment10-production-readiness.mjs`, Android `MainActivity.kt`. Найдено: runtime-компонент `m4_a289` объединяет продукты, M1/M3/regional стоят с null в V3 composition, legacy fallback остаётся в части кода, V3 API числовую цену помечает unconfirmed; официальный корень, Android и статический final gate закреплены за V2. Матрица ранее имела 428 изолированных конфликтов endpoint keys и незакрытое nationwide покрытие. Новых route/browser/source-проверок в этом блоке не выполнялось.

**Результат:** создан `DELIVERY_PLAN_TO_OFFICIAL_RELEASE_2026-10-13.md` с шестью крупными этапами, путями, артефактами `stages/01`–`06`, переходными проверками и критериями выпуска; `NEXT_STEPS.md` и `docs/WORK_STATE.md` обновлены как короткий handoff. План включает синхронизацию актуальной ветки, каталог платных продуктов, исправление матрицы группами причин, интеграцию exact pair lookup и простого суммирования, полный live/CI/browser gate, тестовый Vercel Preview на проверенном SHA, затем отдельный production gate/rollback и Android. Production/merge не выполнялись.

**Почему такой порядок:** удалённая экспериментальная ветка и локальный тарифный аудит нужно сравнить до нового кода; без идентификатора самостоятельного платного продукта общий номер магистрали может дать пропуск или двойное начисление; без ready-fare matrix runtime неизбежно вернёт unknown. Старые релизные проверки прямо требуют V2, поэтому их нельзя оставлять как истинное подтверждение выпуска V3. Всякий неподтверждённый тариф остаётся unknown, а покрытие фиксируется количественно без обещания 100% числовых цен по стране.

**Проверки этого документа:** `git diff --check` PASS; относительные Markdown-ссылки четырёх изменённых/новых файлов проверены и существуют (`DOC_LINKS_OK: 4 files`); `git status` показал только перечисленные docs. Код, данные, тесты и build не менялись/не запускались в этом docs-only блоке. Следующий шаг — сохранить план Git-коммитом, затем начать stage 1 с актуального GitHub HEAD и локальных коммитов. Прямой запрос на Production/merge требуется перед release stage согласно текущему `AGENTS.md` и пользовательской инструкции.

**Сохранение:** план, handoff и очередь сохранены в commit `47b045f` (`docs: plan V3 toll matrix delivery and release`) локальной ветки `audit/matrix-endpoint-conflicts-2026-10-13`. Следующая запись журнала фиксирует SHA основного docs-коммита. Push, merge, Vercel Preview/Production и APK не выполнялись.

## 2026-10-13 — реализация этапа 1: каталог продуктов и исходный SHA

Запрос пользователя: приступить к шестиступенчатому плану внедрения нового V3 калькулятора. Начальное состояние: чистая локальная ветка `audit/matrix-endpoint-conflicts-2026-10-13` на `3059331`; `origin` — другой временный checkout. GitHub API подтвердил экспериментальный HEAD `1642c76cc479c8790c18351f1496ecc2949eeb52`; локального объекта нет, Git HTTPS недоступен (`browser-proxy port 8889`). Ни ancestry, ни сравнение файлов, ни перенос в удалённую ветку не выполнены. Старые PR не менялись.

Созданы `tariff-products.json`, `tariff-products.test.mjs` и подробный `stages/01-baseline-and-product-boundaries.md`. Реестр связывает 23 уникальных платных продукта с `national-registry.json`, явно оставляет Псков как неразделённый агрегат, фиксирует ключ пары, границы и исключение двойных тарифов М-4/А-289/обхода, частей М-11 и ЗСД/ШМСД. Это модель данных, не новый runtime тариф. Просмотрены `route-toll-composition.ts`, `m4-a289-composition.ts`, `route-leg-pricing.ts`; старое объединение `m4_a289`, `regional`, legacy fallback и неподключённые М-1/М-3 сохраняются до последующих этапов. При неизвестной границе или цене полный итог остаётся unknown.

Проверки: локальный catalog test PASS; с доступным временно вторым `node_modules` 78/78 audit tests и quote contracts PASS, `next build --webpack` PASS (16 app routes). Первые две попытки полного `npm run build` не имели TypeScript, третья прошла тесты, но Turbopack отверг внешний симлинк пакетов; стандартный build на полноценной установке в проекте не подтверждён. `git diff --check` PASS. Live routes, тарифы оператора, Preview, Production не проверены/не менялись. Следующий шаг — завершить GitHub comparison/единую ветку и потом аудит 428 конфликтов М-4. Итоговый commit SHA этапа фиксируется следующей записью.

Сохранение этапа 1: commit `deac03a` (`feat(tolls): catalog tariff product boundaries for V3 stage one`) в локальной ветке. GitHub push/PR/Preview отсутствуют; это частичный этап 1, не релиз-кандидат.

## 2026-10-14 — завершение этапа 1, объединение с опубликованной экспериментальной историей

По запросу пользователя довести этап 1 до завершения повторно проверена настоящая GitHub экспериментальная ветка. `git fetch github experiment/toll-od-matrix-2026-10-08` получил HEAD `1642c76cc479c8790c18351f1496ecc2949eeb52`; merge-base с локальным `06e072d` = `1a63018c850a57e114674a28502276c07804c0b7`. Расхождение 49 локальных/439 удалённых коммитов. Новая ветка `integration/v3-product-baseline-2026-10-14` сохраняет два родителя; в add/add конфликтах сохранены более поздние локальные проверенные тарифные файлы. Итоговый diff к локальному HEAD: только три документа/файла recovery из GitHub, без автоматического применения reconstructive patch. Сравнение текущего локального кода с GitHub выявляет подтверждённые исправления 5847 вместо 5909 (М-12 Москва—Казань), 320 вместо 650 (Тольятти), карантин конфликтов М-4. Список продуктов и защита от двойного счёта: `tariff-products.json`, `tariff-products.test.mjs`, `stages/01-baseline-and-product-boundaries.md`.

`pnpm install --offline --frozen-lockfile` завершился ошибкой отсутствующей offline metadata для `@alloc/quick-lru`; использован готовый локальный набор зависимостей проекта, физически скопированный внутрь checkout. `npm run build` PASS: audit tests 546/546, quote contracts PASS, Turbopack и 16 маршрутов PASS. `git diff --check` для staged/unstaged PASS, конфликтов индекса 0. Runtime каталогом пока не пользуется; содержимое recovery patch требует отдельной проверки. Публикация объединённой ветки и подтверждённый SHA фиксируются следующим checkpoint, не являются Production/merge в main.

Checkpoint интеграции: локальный merge `cf18e8677aa53c30f959c93aff8745d57167ab5d` содержит родителей `06e072d` и удалённый `1642c76`. Push новой ветки `integration/v3-product-baseline-2026-10-14` отклонён auto-review по причине возможной передачи полного локального содержимого во внешний GitHub без достаточно явного разрешения на конкретную отправку. GitHub branch search вернул пустой список. Никакого обходного способа не применялось. Этап 1 — локально готов, удалённый критерий BLOCKED; подробности в `stages/01-baseline-and-product-boundaries.md`. Следующий шаг: явное разрешение на отправку указанного SHA, затем сверка ref. Не считать PR/Preview/Production выполненными.


## 2026-10-14 — пользователь разрешил продолжить публикацию

На запрос разрешения отправить `3ad1bc2` в новую интеграционную ветку пользователь ответил «Продолжай». Повторный `git push` не был отклонён auto-review, но завершился ошибкой отсутствия CLI credentials: `fatal: could not read Username for https://github.com`. Используется уже подключённый GitHub для переноса точного Git-дерева проверенных файлов на базе `1642c76`; это snapshot commit с новым SHA, не публикация исходного merge SHA. Исходная merge-история сохраняется в отдельной локальной ветке. После GitHub commit обязательны сравнение tree SHA, fetch новой ветки и единое локальное/удалённое состояние. Окончательный результат будет добавлен ниже.


## 2026-10-14 — DONE: критерии этапа 1 выполнены

Пользователь сообщил повторное зависание и потребовал разобраться до продолжения. Проверка сохранённого progress JSON показала `completedIndex:39`, то есть повторная передача уже закончилась; первоначально отсутствовал blob №20 (`TARIFF_SELECTION_REGISTER.json`, 3 833 832 байта), а при последнем возобновлении отсутствовала только ветка. Проверенный GitHub `create_tree` из всех 39 hashes вернул `4f0574609ffe5fb7dec55ddb405b3069352e9688`, точное совпадение локального HEAD `c6d3843`. Точную внутреннюю причину подвисания интерфейса/оркестратора установить не удалось; нельзя выдавать её за недостаток разрешений или ошибку GitHub. Устранённое организационное ограничение: длинная передача прежде делала много мелких чтений без долговременного progress; при возобновлении использованы чтения с дедупликацией строк, каждый blob проверен по SHA, progress записан отдельно. Не было повторной передачи уже подтверждённых blobs.

Подключённый GitHub создал snapshot commit `2b756ef73c793d1ee03ad66e4c0587578582b8a2` с родителем опубликованного V3 `1642c76cc479c8790c18351f1496ecc2949eeb52`; затем создана `integration/v3-product-baseline-2026-10-14`. `git fetch github integration/v3-product-baseline-2026-10-14` PASS, `git diff --exit-code` между локальным заделом и полученной веткой PASS. Локальная исходная интеграционная ветка переименована в `archive/v3-local-audit-merged-2026-10-14`, новая рабочая локальная ветка создана от GitHub ref с upstream. Обе рабочие стороны имеют source SHA `2b756ef...`, дерево совпадает побайтно. Полная локальная merge-история не отправлена в GitHub; опубликован её проверенный итоговый source tree поверх настоящей удалённой истории. Подробные прежние work logs и решения входят в snapshot и доступны следующему разработчику.

Критерии: одна воспроизводимая опубликованная рабочая ветка — DONE; каталог самостоятельных продуктов и явных unresolved — DONE; уникальные ID, границы/матрица/правила overlap — DONE; примеры М-4 + А-289 + обход и М-11 head/mainline/tail — DONE в данном отчёте; проверка каталога и полного source tree — DONE. `npm run build` на идентичном source tree ранее PASS: 546/546 tests, quote contracts, 16 app routes. Финальное обновление касается только WORK_STATE, NEXT_STEPS, WORK_LOG и данного отчёта; нет новых runtime правок после полного build. Критерий этапа 1 полностью выполнен. Тарифный аудит 428 конфликтующих М-4 ключей и runtime интеграция независимых продуктов остаются этапами 2 и 3. Main/Production/merge PR не выполнялись. Новый Preview/CI в этом этапе не подтверждался. Следующий конкретный шаг: этап 2 и отдельный отчёт `stages/02-matrix-and-provenance.md`.

## 2026-10-14 — этап2: структурный аудит матрицы и происхождения

User supplied six-stage delivery plan. Actual repository state already recorded stage1 DONE; read plan/AGENTS/state/decisions/stage1, independently fetched GitHub integration head a5c892e67af4b050f53bf2211b62feac34d6df6c. Local ea8bf4a and remote a5c892e had identical files (diff stat empty) but distinct docs commit IDs. Created isolated audit/v3-matrix-provenance-2026-10-14 from true remote baseline. No old PR or production change.

Implemented scripts/audit-matrix-provenance.cjs, deterministic MATRIX_PROVENANCE_AUDIT_2026-10-14.json and matrix-provenance.test.mjs. Every conflict key matched saved quarantine list;428 keys classify as339/355=140,636/672=168,both=120. All1096 conflicting source chains stay audit-only. Matrix4699 rows;1549 lack start date. Source fields exist for every row but content/currentness is not certified. Date auditor initially treated explicit timestamp boundaries as invalid; corrected before final build, tested explicit timezone/calendar validity. No fare rows promoted or changed; unique fare not equivalent to confirmed price.

Commands/results: generator PASS; focused tests3/3 PASS; final npm run build -- --webpack549/549 PASS, quote/API contracts PASS, Next webpack/TypeScript PASS(exit0); git diff --check PASS. Initial full build with2 new tests also passed but final rerun covers timestamp correction and third test. No fresh operator/Yandex retrieval, browser, hostedAPI, CI, push, Preview, merge or Production. Stage2 remains IN PROGRESS. Detailed report stages/02-matrix-and-provenance.md includes per-road coverage and next exact evidence requirements. Separate earlier local runtime fixes a01e2bf from /workspace/scratch/806dbc1ef74b/matrix-audit-work remain outside this baseline; preserve and evaluate during integration, not silently discard.

## 2026-10-14 — этап2: primary topology evidence and core quarantine fix

Continued authorized stage2 on parent ebcea80, clean initial worktree. Read current handoff and source snapshots. Fresh primary-source retrieval: Avtodor tariff page indexed rows match339/355 and636/672 saved arrays, direct page403; historical Avtodor bypass opening page67350 read fully,672 is a Pavlovsk exit; indexed Avtodor appendix e0b/5kq5uo88zxclelibmubucv607fda7cvv.pdf states entry355 towards Moscow and receipt at339, directPDF403. Another historic tariffPDF4c3/oni2swug8zwnp3eh55on5qjxvrjcjy9t.pdf indexed exemption rule but direct403; not used as current money source. Stored facts/inference/access limitations in source-snapshots/m4-conflict-topology-evidence-2026-10-14.json. No unverified date/price imported. Cause inference: generator kmRange grouping conflates through-section and ramp-specific products; correct exact direction/current OD evidence still required for all428 conflicts.

Found bypass of quarantine: general createQuoteEngine included provisional runtimeEligible:false rows by full-vector key, despite endpoint adapter excluding them. engine/quote.cjs now rejects audit-only exact rows and returns null total. New matrix-quarantine.test.mjs checks every1096 rejected chain and propagation with another known road; no partial overall800 result. Test fixture800 is not tariff verification. Existing runtime normal candidate estimates unchanged.

Actually ran focused tests2/2 PASS, full npm run build -- --webpack551/551 PASS, quote/API contracts PASS, TypeScript/Next webpack PASS(exit0), git diff --check PASS. No CI/browser/Yandex fresh route/hostedPOST/push/Preview/merge/Production. Stage2 remains IN PROGRESS. NEXT verify current exact boundary/OD rules before reconstructing mainline versus ramp matrix; retain unknown where evidence absent; then M11/M12/CKAD source/date bindings.

## 2026-10-14 — user requested correct endpoint fare and removal of extras

Parent e1f465f; user explicitly asked to establish correct fares and remove redundant alternatives. Fresh read of primary OSSP traffic-junctions page https://unitoll.ru/roads/m-4/objects_m4/traffic_junctions/ confirms672 exit towards Pavlovsk; its road-rules page describes mixed systems but has historical range633–715 (not current price evidence). Earlier primary355 receipt appendix proves entry355 towards Moscow, only indexed text because direct403. These topology facts under user's continuous-trip/no-reentry model justify filtering internal ramp substitutions, not official fare certification.

Created scripts/build-m4-endpoint-register.cjs and M4_ACTIVE_ENDPOINT_REGISTER.json; build-release-register.cjs rebuilds it automatically. All1456 old M4 candidate chains retained in source matrix;668 with355/672 as internal substitute excluded from active lookup. Remaining through-chain grouping gives one saved candidate per key. Unsupported355 boundary directions kept unknown rather than manufacturing reverse entry/exit. Compiled726 active keys with4 reviewed exact overrides, zero multi-price active cells.404 of428 original conflict keys obtain one canonical topology estimate;24 remain unknown. Additional64 total keys excluded by355 direction policy across full source. No min/max/first-price selector; future unexplained conflicts remain unknown.62→460 now1740/2120 unconfirmed, lower1590/1940 from inappropriate intermediate355 eliminated. Reviewed2480/2730 and3050/3370 north cells retained with exact key precedence; other directions use independently stored estimates, never copied reviewed price.

Runtime m4-route-adapter.mjs now reads compiled endpoint register; no runtime intermediate sum/request. Old source quarantine remains enforced in general core for historical vector lookup. Added m4-endpoint-register.test.mjs coverage for unique/reproducible/all conflicts accounted/direction/reviewed override/unexpected conflict, updated endpoint regressions for canonical through fare and separately stored reverse estimate.

Actually passed focused17/17, register builder, matrix validator (raw archive4699/428/360 unchanged), final npm run build -- --webpack554/554 tests, quote/API contracts and TypeScript/Next webpack(exit0), git diff --check. Initial full build also passed; final rerun covers new generator rebuild-hook. Generated-only timestamp changes in old selection/validation artifacts restored (no semantic source difference). Source-topology adoption and stages/02 report updated. No fresh Yandex route, operator receipt, complete effective-date PDF, browser E2E, CI/push/Preview/merge/Production. Therefore prices remain visibly unconfirmed estimates; no claim that404 correct official fares have been individually verified. NEXT same-boundary/date/profile monetary verification, then M11/M12/CKAD sources; unknown unsupported355 pairs stay unknown.

## 2026-10-14 — user requested directPDF and Yandex check of24 PVP355 cells

Found previously unresolved direct current-index M4 tariffPDF https://avtodor-tr.ru/upload/iblock/a2d/9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf; search exposes five-page tariff document with2026 heading and633–741 cells. Direct web open403; did not inspect actualPDF pages/columns/effective dates. Separate355 receipt-rulePDF e0b/5kq5uo88zxclelibmubucv607fda7cvv.pdf kept as rules source, not same tariff document. User offered download/upload.

Actual control set:355↔803,911,1046,1093,1184,1223:12 directed pairs x2profiles =24 cells. Prepared exact node-anchor URLs Thu2026-10-15 and Sat2026-10-17 10:00 Moscow in live-controls/2026-10-14-yandex-355-pending.json. Coordinates are observed repo anchors, not proof that Yandex snaps to/actually crosses gate355.

Opera list_tabs failed Browser not connected. Tried one authorized TinyFish route355→803+reverse; rejected before run started(wallet_out_of_funds balance-0.221166USD), no runID. Not retryable without restored access/funds. No actual Yandex route, date/ETA/fare/geometry observations; all24 marked not-executed. Cannot mark impossible direction from automation blocker. No changes to runtime/tariffs/tests/build/remote/Production. NEXT restore browser UI access and execute prepared matrix, then exact fare/geometry classification; wait for userPDF. Docs/data preparation verification JSON rowcount24 and diffcheck only.

##2026-10-14 — user-authorized cloud Yandex controls355:24/24 observed

User explicitly approved cloud browser fallback (Да разрешаю) after Opera disconnected/TinyFish insufficient funds. Initialized cloud browser through cua_repl and used only documented UI APIs. Existing Yandex parameterized route support reused from observed URL; inspected active route and route-details DOM, date/day visible, vehicle under2m/no transponder and passage-at-exit price basis visible. For alternatives, active route had minimum visibleETA. Ran all12 directed anchor pairs x2dateprofiles(ThuOct15/SatOct17,10:00Moscow). Fare asynchronous in initial weekend803 and1184 cases: waited for visible price annotation;355→803 weekend re-observed after missing price; deduplicated25 captures to24 actual cases. All24 now show approximate fare. No CAPTCHA/botblock/login, no account/settings changes.

Actual sums weekday/weekend:355→8033530/4090;803→3551450/1830;355→9113370/3970;911→3552010/2450;355→10463550/4170;1046→3552590/3150;355→10933550/4170;1093→3552890/3450;355→11844300/5020;1184→3552740/3300;355→12234800/5670;1223→3553040/3650. These are whole selected route estimates tocoordinates, not operator-certified endpoint tariffs. Directional distance/ETA differ and should not be mirrored. UI distance unit was miles; preserved as displayed, not claimed exactkm.

Named Yandex organization toll_plaza_355_km_m4_don/164007456868 found through site search. Card addressM4,357thkm; org route coordinate52.797990,38.314710 vsrepo52.7980213,38.3147948, nearby. Corrected provisional concern about label mismatch: address357 does not establish wrong355point. Snapshot/screenshot of organization and near355 route details inspected. South→355 routes show explicit local exit, turn and U-turn at end;355→south starts through Yar kino bypass then exit/join. Thus actual requested coordinates have routes, not proof of impossible journeys, but actual355 paid boundary/continuous tariff-product equivalence not proved. Other anchor lane choice also causes turns; cannot assign whole-route estimate to existing candidate matrixpair.

Saved compact24 actual DOM-derived observations/URLs/dates/vehicle/amounts/ETA/distances/near355maneuvers in live-controls/2026-10-14-yandex-355-results.json and report stages/02-yandex-355-controls-2026-10-14.md. Full rawDOM/screenshots not persisted; stated limitation. Historical blocked pendingJSON retained with continuation pointer. No tariff/code changes, no money imported,24 unknown remain; prior4reviewed override cells unchanged. Checked JSON24distinctrows and diffcheckPASS; no new tests/build/CI/preview/push/merge/Production. NEXT userPDF + directed actual payment-boundary/side selection, then exact-source equivalence and import only qualifying fares.

##2026-10-14 — uploaded official M4 PDF visually verified and generator provenance updated

User uploaded9ig1ywvudpmvi8i0v2icgc64eqbwzn5x.pdf and offered more downloads. Read PDF skill, read attachment directly at supplied scratch path (noLibrary retrieval). pdfinfo5pages, scanned/no text layer; pdftotext yielded only formfeeds. pdftoppm140dpi rendered all5pages, visually inspected each. Tesseract onlyeng/osd installed, no Russian OCR run; structured transcription was visual, not claimed automated OCR success. No PDF authoring/edit performed.

Verified payment header supports cash/card without transponder; I-row columnsMonThu/FriSun. Page5 explicitly start00:00:00March2,2026. Order58 visible; uncertain handwritten approval-date not normalized. Rates21 normalized rows match original raw arrays, including62=220/220,71=310/400,339=370/400,355=220/220 specificallytowardsMoscow,416/460samecorridor230/360 once,636=570/640,672=350/440,1046=380/450,1093=150/150,1184=300/350,1223=400/500,DZOK410/410. PDF545secondrange544–589 corrects metadata knowledge from old545–589 snapshot; original historical file not rewritten. Page4/5 footnote5 second slash636/672220/270 is APDtransponder633↔672partial120min; not no-transponder. Exemption exit636/672within120min afterpaidentry;416/460receipt within12h; rules documented in source snapshot, not declared all timed route fares certified.

Preserved uploaded unchangedPDF in source-documents/m4-order58-effective-2026-03-02.pdf,SHA25625fdb9a430934f47617c8cc1563f95e49c6ebe41c6303e9bd67465b3c568662d; visually verified transcription source-snapshots/m4-order58-2026-03-02-category1-verified.json withpages/hash/limits. Generator now validates each original candidate numeric row against this source (aborts mismatch), assigns datedsource status to1456candidate+32south+4DZOK rows. Same prices, no numeric changes. Rebuilt matrix/register/activeendpoint/provenance. MissingStartDate1549→57. Source/category/date provenance verified, completed endpointOD binding stays unconfirmed. Existing4reviewed Yandex overrides remain exact observations, no fabricated effectivedate.24unknown remain, compiler cardinal726/404/24/668 unchanged. Earlier core-quarantine enforcement preserved.

New m4-verified-source.test.mjs checksactual preservedPDF hash, no-transponder636/672 notdiscount, preMarch2fareblocked andMarch2candidate remainsunconfirmed. Actually ran matrixbuilder,release+activebuilder,provenancebuilder,validatorPASS,focused3/3PASS,fullnpm run build -- --webpack557/557tests+quote/APIcontracts+TypeScript/NextwebpackPASS(exit0),gitdiffcheckPASS. No newCI/browserroute/hostedAPI/push/deploy/merge/Production. Source read does not certify absenceof lateramendment. Tried official russianhighways edc rulesPDFURL fromindex,got404,not requested as working download. ExistingAvtodor e0b rulesPDFdirect403 hasindexed355 receipttext; give user that working-index URL for manual download ifneeded. NEXT obtainactual rulepages for355 semantics,then geometry/payment-boundary equivalence;continueothernetworksstage2.

##2026-10-14 — uploaded rulesPDF:355 adjudication and directreceipt cell

User supplied5kq5uo88zxclelibmubucv607fda7cvv.pdf, implicit continuation. Read suppliedscratch attachment directly; pdfinfo13pages andmetadata creationAug13,2025; pdftotext extracted readabletext, relevant section4.2pages7–8 rendered130dpi and visuallyverified. Page7states entry355towardsMoscow,receipt at339prevents secondcharge; page8states636/672receipt120min. RulePDFdoesnotpublishnumericfare/startdate. Preserved unchanged source-documents/m4-entry-receipt-rules-uploaded-2026-10-14.pdf,SHA256a3ed4b13529e0eae7865bfc4192c6944a0b3ece6c371062a97d5b6dc461c57dc; source-snapshots/m4-355-receipt-rule-verified-2026-10-14.json distinguishesmetadata/effective-dateunknown/2026tariffcomplement. Printedold416/460range414–464 notsilently substitutedforcurrent2026range401–464.

Adjudication:existing24originalconflictkeys355↔803/911/1046/1093/1184/1223 are not a supportedcontinuous355entrytariffpair. PhysicalYandexroutes tocoordinates doexistwithdetours; classificationexcludes publishedfaremodel,not physicaltravel. Compiler now records excludedEndpoints separately from unresolvedprices:64such355keys overfullsource,24originalconflicts; original428keys accounted404canonical+24excluded+0unresolved. Active728keys including2newoperatorcells and4reviewed;668internalrampchainexclusions preserved. Oldraw4699/428 archive preserved for audit. No inventedfare for discarded southward355boundaries.

Added M4_OPERATOR_ENDPOINT_CELLS.json:355→339categoryI/no-transponder220MonThuand220FriSun,effectiveMarch2from2026tariffrow,page2,andreceiptbasisrulespage7. Compile takes explicitoperatorrows,validates class/payment/source/rule/profilenum/duplicates and refuses disagreement withsamecanonicalprice. Reviewedexactcells stillapply. Adapterexcludedkey=>unknown specificm4_unsupported_paid_endpoint_pair; notfalse0. Direct355→339charged220once, reverse notgenerated. UI/routeexactconfirmation remainsunconfirmed; no hostedAPI/actualphysical355→339geometrycertification claimed.

Updated register/adapters/sourcehash and sourceaccounting regressions. Actually ran generatorPASS (728active,404restored,24excluded,0unresolved,668chains,4reviewed,2operator),focused23/23PASS;fullnpm run build -- --webpack560/560tests+quote/APIcontracts+TypeScript/NextwebpackPASS(exit0),gitdiffcheckPASS. No newbrowserroute/CI/push/Preview/merge/Production. SourcePDF+compacttranscription+code+state allpersisted inGit. NEXT remaindernationwide stage2M11/M12/CKAD,57rawdategaps and fullselectedgeometrybinding; stage3separateproductcomposition. Existinga01e2bf fromsecondlocalcheckout stillseparate/preserved;verify before releaseintegration.

## 2026-10-14 — пользователь спрашивает, закрыта ли матрица и нужны ли документы

Parent d66b1d4471d4a4700eb61aba871710d256ff2e32, branch audit/v3-matrix-provenance-2026-10-14, clean initial tree. Read AGENTS/state/current audit/snapshots/nextsteps/decisions. M4 conflict cleanup is done but404 canonical fares remain unconfirmed, not full national completion. New primary-index comparison found probable CKAD category-column contamination: official tariff page I values42/2278 vsII60/3189, while saved210-cell Cat-I table includes60/3189. FullPDF403, no visual confirmation or fare mutation; keep existing runtimeApproved=false. Historical 2278transponder/3189base interpretation flagged for re-audit, not erased. Identified6-page order56CKADPDF165/wiri43iwx18q7t9xc6izr4qeds5odt3z.pdf, index confirmsCKAD/SmallVyazemy but dateOCR unreliable. M12 knownorder57PDFfe5/a2e7y350b1wrbw28x181m10z1eeblnfd.pdf also403; Marchbase alone cannot prove postOct8OD. M11mainlinePDF already preserved, head/rules webPDF accessible; no redundant userrequest.57undatedrawrows and physical bindings stillopen.

Persisted MATRIX_OPEN_ITEMS_AND_DOCUMENTS_2026-10-14.md, topstate/nextsteps and correction appendix in currentness report. Sources: official tariff index; CKADPDFindex; fresh officialM12announcement154667 confirms99exactspan. No code/tariff/registry changed, no sourcePDFfabricated, no build/tests/CI rerun, no push/Preview/merge/main/Production. Check docs paths and diffcheck before commit. Next get2PDF then fullcategory/directcell re-audit and physicalbinding.

## 2026-10-14 — повторныеrulesPDF и неработающая ссылка пользователя

Parent5fb60cd, sameauditbranch, cleanstart. User suppliesPDF(2)+404screenshot. Checked scratchexists, SHA256, pdfinfo13pages, pdftotexttitle. PDF matches preservedM4rules exactly(a3ed4b...); no newtable/no duplicateimport. Screenshot visibly404butfulladdressclipped, no claim whicholdPDFfails. Search stillindexesCKAD165/M12fe5; directindex existence not activeURLproof. Cloudbrowser actualtariffs visit seesbrowsercheck, one reloadseesmanualrobotcheck; no CAPTCHAsolved/no workaround, botDetectionchallenge_loopreported. OnecrediblealternateofficialtskadURL502connectionrefused. ActualcurrentPDFlinksremainunretrieved. Telluser path viaownofficialtariffpage links rather than reissue unverifiedhashedURLs. Appended statusdoc/updateWORK_STATE/NEXT. No fare/code/build/tests/CI/push/Preview/merge/Production changes; docs-onlychecks andcommit. Userfiles notmodified. IndependentM11/regionworkcancontinue.

## 2026-10-14 — семь PDF оператора: CatI ЦКАД и текущая М12 матрица

User supplies7PDF after failedhashedlinks; implicitauthorization continues sourceaudit andcorrection. Parent77ca608, sameauditbranch cleaninitial. Metadata/hash/textlayer inspected all7, five scannednewPDFs rendered140dpi, numeric tables visual/manualtranscription bothdirections independently. M4+M11 duplicatehashmatch reuse. Fullsources preservedwithSHAmanifest; no library reread or userfilemutations. CKADorder56page1 proves prior210cells correspondII notI: replaceall210I, archivewrongtable, correct16mirroreddata/snapshotrows, M10PK5=2278/M4M11=1800. PDFfootnote2 requires contextforM12initial/finalsection; generated28M12endpointcells requireTariffContext, quoteunknownuntilcallinglayerevidence. SeparateSmallVyazemy103 twoexplicitdirections added sourcefare/product, physicaladapterpending;2381 arithmeticconsistent but nofullroutealias.

M12newuploadedcavPDForder302Oct2 effectiveOct8 page3,20x20I page1,380explicitdirectcells; replace5oldcurrentassertions withcomplete380, retains oldsourceaudit and2Sokuryaddenda. MoscowShali5946/P239Shali99/Kazan5847 fromdirecttable notsum. Definitionspage8twoShali;noold832resurrection,noSokuryP239alias. Appendix2–4sourceotherproducts preservednotruntimeactivated. A28912directI cells match existingfares; provenancePDFupgraded; aliasesremaincandidate. M3ratesmatch,24rowdatesadded. Tolyatti210/140/direct320 confirmMarch1,6dates previouslydropped bygenerator fixed. Raw4699→5076,selected2477/history777/provisional1822, undated57→27; M4countsunchanged.

Changes recorded in stages/02-uploaded-operator-pdfs-2026-10-14.md with algorithms/files/limitations. Actuallyexecutedbuilders,validator5076unique/provenancePASS,focused26/26. Firstfullbuildfailed564/565 staleCKAD227expected vs161actual insegment6c; testcorrectedbyPDF,focused1/1 thenfinalnpm run build -- --webpack565/565+quote/APIcontracts+NextTypeScript16pagesPASS(exit0). DiffcheckPASS. No live route controls/CI/push/Preview/main/merge/Production; remotebranchsearchexistenceonly, currentremoteSHAfetchunavailable; lastindependentfetcha5c892e remainshistorical. Next27undatedregionalrows,M11products/newShaliphysicalbinding,thenstage3. No additionalCKAD/M12PDFrequested.

## 2026-10-14 — продолжение:17дат и календарь М11

Пользователь:«Делай». Parent4d004ac, cleanbranch audit/v3-matrix-provenance-2026-10-14. ИзученыAGENTS/state/README/log/decisions/next/source/code. Реальныйgitls-remoteGitHubинтеграции=a5c892e67af4b050f53bf2211b62feac34d6df6c. Найдены первичные подтверждения М1March2(индексPDF,403), РязаньOct1, Кама/БуйFeb1, КазаньMarch9 23:50:01 (приказdateMarch6 не effective), МСДtransitJan2,2023. SourceproofJSON сохранён; перенос17rowdates, raw5076unchanged, undated27→10(pskov8/heihe2). Псковprimaryfetcherror/legalquery no effective evidence; не угадывать.

СохранённыйM11order274 страницы3/4/8 визуально прочитаны125dpi: switch01:00, ownholidaysNov3/4Dec30/31. НовыйcalendarJSON/resolver: previous tariff-day before01, unknown2027outsideverifiedcalendar. stablewindow проверяет actualboundariesinsideinterval, прежнийполденьвнеshortMondaytrip убран. Северная геометрия mainlineAt изменена навыезд679; южная exit58alreadyused. Не изменялись суммы924М11cells/nativeamountполя иневыдавалась ETA зафактическуютелеметрию. a01e2bfпрочитан изsecondcheckout, перенесены актуализированныйstrictdateЦКАДguard иsafeinttotalМ11, безегостарыхцен/docs. validInstant не принимаетnull/number/dateonly/timezoneless/impossibledate/24:00. quote laneproofдляРязани0 иeligibilitycontextМСД950;нетruntimeсписанияврегиональныхадapters.

Sourcefiles/code/tests перечисленывstages/02-dates-and-m11-tariff-calendar-2026-10-14.md. Initialfocused28/28; finalfocused30/30; полныйnpmrunbuild--webpack571/571+quote/APIcontracts+NextTypeScript16pagesPASS(exit0); generators/validator/audit/diffcheckPASS. Ни новыхlivecontrols/UI/hostedAPI,ниCI/push/Preview/PRmerge/main/Production. Следующее:physicalbindingsМ11tail/М12Shali/ЦКАД иstage3independentproducts;10undatedestimateстрокбезфальшивойдаты.

## 2026-10-14 — М12directpair, independentproducts иphysicalPulkovo guard

User«Дальше»,parent806e4b8,cleanlocalauditbranch. Readstate/next/source/code;lsremoteactualintegration=a5c892e67af4b050f53bf2211b62feac34d6df6c. M12adapter usesoperatordirectpairfromprovednativeboundariesfirst/last/direction, notfullvector. Ignoresnativeamounts/intermediatevectorrepresentation;nativepriced/tolls eligibility remains (notfullgeometrymigration). OctoberShali/old832blocked;properexplicittimezone/dates/mixedroadguards. RecordedM12projectioncontrols replaybothdirections3513Vladimir↔P241, no freshrouteclaimed. quoteproductidentitynormalizesaliases, nowM4+DZOKadd separately andduplicates/mismatchedproductIds unknown. CKADfootnoteonly16eastM12Nosovinitial/finalcells, not12northsidepairs; no numericchanges. SmallVyazemy separateproduct added,24catalogproducts.

OSMprimarynodeGET200;Overpass406 nojson(noShalievidence);OSMmapinitial40050000nodelimit, smaller200 thennarrowcorridor200. Raw5.7MB archivedgzip541985byteswithSHA/ODbLattribution. Contains2namedPulkovo tollgantries13377945035/36 andknown679booths, no independentlyidentifiedmainlineframes. Existingorder274pages9/10 visuallyre-read140dpi verifiesairport38/mainline56/conditional94; no newmoneyactivation. Positiveairportcandidategeometry<=25m forcesV3unknown evenproviderfree;APIamountnull. Not claimabsenceunmappedcamerasorallgeographicbindings. Details/files/limitations instages/03-directed-pairs-and-physical-product-guards-2026-10-14.md.

Builders5076unique/matrixvalidator/auditPASS,focusedinitial19/19 then17/17;geometryfirst14/15 failedbecausetestusedinternallegacy0insteadAPIserializednull. Testassertioncorrectedonly,finalnew9/9;fullnpmrunbuild--webpack580/580+quote/APIcontracts+NextTypeScript16pagesPASSexit0;diffcheck/docslinksPASS. No hostedAPI/Yandex/CI/push/Preview/merge/main/Production. NextM12outergeometry/newShali andM11tail/airportexactscope; upperV3productcomposition stillpending,10datesunknownremain.


## 2026-10-14 — верхний расчёт V3 без прямых production-подстановок

Пользователь: «Дальше». Начальный HEAD `4e7ff40`, чистое дерево audit-ветки. Удалённый integration HEAD повторно проверен: `a5c892e67af4b050f53bf2211b62feac34d6df6c`. Убраны верхние денежные подстановки М4/М11/М12/ЦКАД и внутренняя подстановка production-М4 в М4/А289. Геометрическая оценка больше не может стать ценой при отсутствии компонентов. Recovery остаётся диагностическим; неизвестная цена в API — null. Для нулевой цены без компонентов требуется полное подтверждение бесплатности выбранного маршрута. Общий V2/V3 сборщик проверяет безопасные целые суммы и переполнение.

Подробный алгоритм, пути, первоначальные 28/30 и исправления, ограничения и точные команды: [отчёт](stages/03-v3-upper-pricing-fallbacks-2026-10-14.md). Итоговые focused 30/30 и новые 4/4 PASS; полный build 585/585, quote/API, TypeScript/Next PASS (exit 0); diff-check PASS. Тарифные данные не менялись. Верхние агрегированные ID, старые денежные поля обхода Краснодара и головного участка М11 остаются открытыми; весь этап 3 не объявляется завершённым. Нет CI/push/Preview/Production. Коммит этого блока определяется по истории Git файла отчёта; parent указан выше.


## 2026-10-14 — самостоятельные М4, А289 и обход Краснодара

User «Дальше», parent `1d09027`, чистая audit-ветка. Повторный ls-remote integration подтвердил `a5c892e67af4b050f53bf2211b62feac34d6df6c`. Получены первичные OSM данные двух направленных ПВП 46 обхода; XML/gzip и нормализация с SHA/ODbL сохранены. Старый большой bbox вернул 400, меньший восточный 200 с двумя toll_booth на named/oneway/toll=yes дорогах; западный ответ не доказывает отсутствие платности. Готовые тарифы m4-dzok 410/410 взяты из существующей матрицы; цены не изменены.

В активном верхнем V3 агрегат m4_a289 заменён компонентами m4/a289/krasnodar-west-bypass. Обход требует направленного пересечения ПВП и собственного датированного quote, больше не читает цену M4-массива. Одно legacy название → неизвестный обход, unknown → весь итог null в API. Общий V2/V3 сборщик запрещает aggregate+новые пересекающиеся ID и дубли. Каталог остаётся 24 продуктов. Старые неиспользуемые активным верхним V3 helper-пути не объявляются очищенными.

Полный алгоритм, пути, primary provenance, ограничения и команды: [отчёт](stages/03-v3-southern-products-2026-10-14.md). Initial focused 14/15 из-за VM default JSON import; тест переведён на native TS import, итог 21/21. Новые 7/7 PASS. Первый full build: 592/592 tests, TypeScript FAIL (confidence:string); точный JSDoc тип исправлен. Итог full build 592/592 + quote/API + TypeScript/Next PASS, exit0; diffcheck PASS. Нет browser/Yandex/CI/push/Preview/merge/main/Production. Следующее: отдельный готовый тариф головного М11 и независимые head/mainline/tail. Commit определяется Git-историей этого отчёта, parent указан выше.


## 2026-10-14 — М11: независимые head/mainline/tail и оплата на выезде

User «Дальше», parent7d3427f, чистая audit-ветка; integration повторно проверен ls-remote=a5c892e67af4b050f53bf2211b62feac34d6df6c. Самостоятельно получены два official m11-neva PDF (819442/2969094 байт), сохранены с SHA/URL, визуально прочитаны тарифная страница2 и правила страница3. 42×5 ячеек из PDF независимо разобраны: 210 совпадений,0 расхождений; суммы матрицы не менялись. Найдены native head entry-time и directional проблемы; actual tariff определяется на конечном платёжном выезде по собственной таблице/часам/дням head.

Новый head adapter берёт готовую направленную цену; native headAmount/headWeekday/headWeekend не участвуют. V3 boundary resolver использует p58/p679 в обоих направлениях без обязательного p593/старой цены. Север: общий конечный p679 ETA; юг: московский ПВП21 ещё без координат, стабильное окно p58→15 вместо выдуманного времени. Верхний V3 добавляет отдельные head/mainline/tail, неизвестный хвост блокирует весь итог на обоих концах и для mainline-only поездок. Старый aggregate+новые ID/дубли запрещены. Native V2 production не изменён; каталог24.

Полные алгоритмы/пути/источники/ограничения: [отчёт](stages/03-v3-m11-products-and-payment-time-2026-10-14.md). Focused23/23,16/16,new8/8; final focused25/25. Первый build600/600PASS; дополнительный tail scope/regr оправдал новый полный gate: итог601/601+quote/API+TypeScript/NextPASS(exit0),diffcheckPASS. Ошибок сборки/тестов нет. Нет live/Yandex/browser/hostedAPI/CI/push/PR/Preview/merge/main/Production. Следующее: М12 outer geometry без old priced gate, затем ЦКАД/context/региональныеID/helper cleanup. p21/p147/tail физика ещё open, этап3 не завершён. SHA блока — Git history отчёта, parent указан.


## 2026-10-14 — М12 outer boundary без native денег; cleanup V3 helpers

User «Дальше»,parent10bc704,чистая audit-ветка; fresh remoteintegration=a5c892e67af4b050f53bf2211b62feac34d6df6c. Новый V3 М12 resolver содержит только крайние калиброванные границы/направление/span, не вызывает continuity/inferred/money. Верхний V3 больше не вызывает calculateProductionM12; matrix adapter не требует priced/tolls и проверяет даты/версию во всём окне поездки. Старый832 не новаяШали; unknown/профиль/partial гарантии сохраняются. Удалён dead crimeaM4Total с устаревшими тестами, A289helper больше не читает обход изM4 и имеет strictdate/allDays. Actual supported415/620/800, independentDZOK410 сохраняются; матрица5076,10undated неизменны.

Полный отчёт с алгоритмом/источниками/путями/командами/ограничениями: [stage](stages/03-v3-m12-outer-boundaries-and-helper-cleanup-2026-10-14.md). Firstfocused29/29,new8/8; cleanup28/29 из-за потеряннойunverifiedпометкиТемрюка, исправленаcode reason; finalfocused30/30. Firstfull606/606+quote/API passed, TSfailed(optionaldateJSnarrowing);typeofguard исправлен. Finalfull606/606+quote/API+TypeScript/NextPASS(exit0),diffcheckPASS. 601→606 =9newtests−4obsoletehelpertests. Нет новых live/Yandex/browser/hostedAPI/CI/push/PR/Preview/merge/main/Production. Следующее: ЦКАД/context и независимые региональныеproductIDs, then stage3 finalaudit/stage4. География новойШали/М11tail/ПВП21/SmallVyazemy и10дат не закрыты; этап3 не завершён. CommitSHA определяется history отчёта, parent указан.


## 2026-10-14 — ЦКАД/региональные ID и пропуск paid evidence исправлены

User«Дальше»,parentdf9120a,чистая audit-ветка; fresh integration lsremote=a5c892e67af4b050f53bf2211b62feac34d6df6c. Выявлен partial-total bug: paid validation называла М4/М11/М12/ЦКАД, но coverage отдавал верхнему составителю толькоm1/m3/regional; известнаяА289620 могла закрыть неоценённую дополнительную дорогу. Named core paid evidence теперь добавляет собственныйunknownкомпонент, early/late/provider-free не обходят защиту. Regional aggregate заменён13namedproductIDs, collectorspskov-unresolved/unknown-paid-road сохраняютunknown и не принимаютmatched0. Алиасыодногоbooth не создаютпараллельныйМ1/М4 рядом сОдинцово/ДЗОК;SmallVyazemy отдельноunknown.

CKAD новыйgeometry-only adapter без native section money, готоваяM4↔M11=1800 черезquote/window; стараяeast-arc geography модель сохраняется и не объявляетсяобщимирамками. PDF56page2/3 визуально перечитаны, scope120мин **после** регистрации иSmall103 сохранёнhashproofJSON.16cells остаютсяblocked, callerbool неproof. Fare rows5076/10undated/cat24 unchanged.

Подробные algorithms/files/evidence/checks/limitations: [stage](stages/03-v3-ckad-regional-identity-and-paid-evidence-2026-10-14.md). Firstfocused38/39: старыйassertdiagnosticsword теперьраньшезаменёнexplicitmissingm12 при сохранённыхAPIunknown/null; исправленtestscope. Existing14/14, new9/9 затем10/10, finaltargeted20/20. Full616/616+quote/API+TypeScript/NextPASS(exit0),diffcheckPASS. Никакихlive/Yandex/browser/hostedAPI/CI/push/PR/Preview/merge/main/Production. Следующее: консолидированныйactiveV3 audit/releaseblockers, thenstage4. География/120minproof/10dates open, этап3/Russia coverage не объявленыготовыми. Commit определяетсяhistory stage,parent указан.


## 2026-10-14 — сводный аудит V3: diagnostics не меняет цену

Запрос пользователя: «Дальше», продолжение подготовки к официальному выпуску. Исходный HEAD a662b78; remote integration a5c892e67af4b050f53bf2211b62feac34d6df6c. Проверен путь выбранная геометрия → независимые продукты → API → presentation. Найдена зависимость полноты платного расчёта от diagnostics и отсутствие обязательной trace в специальных планах; исправлены route-leg.ts/special-options.ts. Явно неполная trace добавляет unknown-paid-road и блокирует итог. Response-validation.ts требует один согласованный маршрут. HTTP fixtures существующих API тестов дополнены явной полноценной trace; новые пять pipeline тестов проверяют реальные адаптеры/матрицу/API и отрицательные случаи. Тарифы и источники не менялись.

Focused 27/27, новые 5/5, полный npm run build -- --webpack exit0: 621/621 + quote/API + TypeScript/Next PASS. Локальный запуск: uv_interface_addresses без hostname; с 127.0.0.1 Ready, но HTTP smoke не завершён/не засчитан. Живые маршруты/браузер/мобильный/CI/Preview не проверены. Процессы попыток остановлены. git diff --check и ссылки отчёта PASS перед коммитом. Изменения сохраняются коммитом «fix(v3): require complete paid evidence independently of diagnostics»; точный SHA доступен в git log. [Полный отдельный отчёт](stages/03-consolidated-v3-audit-2026-10-14.md) содержит файлы, инварианты, ограничения, матричные счётчики и приёмочные сценарии. Следующий шаг — GitHub checkpoint/точный Preview и живые проверки; обязательная trace требует измерения задержки/отказа. Неподтверждённые даты/география/операторский контекст остаются открытыми; Production не менялся.


## 2026-10-14 22:17–22:35 МСК — GitHub snapshot, Preview и живые API; CI correction

Продолжение «Дальше»: 114 blobs/2 удаления перенесены с durable progress, хеши сверены, tree 943b7806... совпал с 3b675df. Опубликован snapshot 37d55f6 в audit-ветке; fetch/diff PASS. Draft PR13 теперь в integration baseline, mergeable true; PR10 closed. Vercel READY Preview dpl_67vpYt2..., version SHA подтверждён, remote 621/621+quote/API+Next/TS PASS. Live Анапа off/on 620 одинаковый toll payload/дистанция/ETA; Ялта800 с предупреждением, JSON и desktop screenshot сохраняются отдельно. Копирование показало toast, actual clipboard не подтверждён. Actions38623167929 FAIL: Node22.13 не экспортирует registerHooks; build workflow segment8-route-quality и calculator-final-gate приведены к24.x без ослабления gate. Повторный CI pending; Москва—СПб pending. [Отдельный отчёт](stages/04-preview-and-live-acceptance-2026-10-14.md). Исходная локальная Git-история архивирована; GitHub получил точное итоговое дерево/все журналы, не все промежуточные коммиты. Main/Production/Android не менялись. Следующий шаг — опубликовать correction, проверить CI, добавить живой длинный результат, продолжить приёмку.


## 2026-10-14 22:34–22:38 МСК — повторный CI PASS и завершённый Preview acceptance checkpoint

Correction afdc2c4 опубликован через verified tree и ref lease37d55f6, fetch/diff PASS. Actions38624425083/job116059843286 полностьюsuccess включаяbuild/API smoke; PR38624434385 verify116059876836 success, optionallive_probe покаin_progress. Новый Preview dpl_DaGA58ER... READY/versionafdc2c4; runtime идентичен протестированному37d55f6. Длинный живойAPI Москва—СПб200/10,394с/710312м/24633с: unknown/null изМ11tail+ЗСД, частичная сумма не выдана полной. DesktopUI сподсказками711,2км/6ч54мин показываеттолько«Итого без дорог» иunknown. ФактическиеCtrl+V вставкиАнапы/Москвы подтвердилипредупреждение/unknown ичетыресуммы; сообщения неотправлялись, временное полеочищено. ЧетыреJSON, дваscreenshots, clipboardtext иpublication-verification.json сохранены вsource-snapshots/preview-2026-10-14. Focused5/5PASS, workflow/screenshotassertions, parity иdiffcheckPASS. [Отчёт сдобавленной записью](stages/04-preview-and-live-acceptance-2026-10-14.md). Следующийшаг: расширеннаяприёмка/mobile/free/отказtrace/профиль иsourcegaps. Матрица/production/main/Androidнеизменны; полногоRussia coverageнет. Финальныйcheckpointкоммит «docs: preserve verified Preview and live acceptance evidence» публикуетсяповерхafdc2c4; точныйSHAgitlog/remote.


# 2026-10-15 — устранение ложных блокировок V3 и приёмка проблемных маршрутов

## Запрос и исходное состояние
Пользователь: устранить причины отсутствующих расчётов из особых территорий и в Санкт-Петербург. GitHub PR13/head и fresh ls-remote: c1421f8a6b1ead6696fe7c639de372a9c6d85270. Создан новый writable checkout и ветка fix/v3-missing-route-prices-2026-10-15, родитель c1421f8. Production/main/Android не менять.

## Диагноз и выполненные изменения
1. Живой Волноваха → Москва вернул 1182425м/61701с и корректный особый comfort fare55299, но tollunknown из-за unnamed booth. Полная выбранная trace содержала 5818209495 (ПВП545),3717382721 (416),5061777372 (228): все IDs уже есть в M4_NODE_TO_PLAZA. `lib/v3-calculation/unpriced-road-coverage.ts` теперь связывает безымянное событие с М4 через точный известный nodeID; распознанное другое название не переопределяется. Это road identity, не новый денежный тариф и не доказательство пары границ. Неизвестный ID/incomplete trace всё ещё блокируют итог.
2. На Волноваха → Краснодар первая проверка вернула base22907, но две локальные проверки М4 не смогли подтвердить границы. `lib/toll-engine/m4-route-validator.ts`/`m4-production.ts`/`lib/v3-calculation/route-leg-pricing.ts` используют положительные toll=true события полной trace той же выбранной геометрии для её крайних М4 границ. Требуются complete=true, boothEventCoverage=complete, exact knownnode. Отсутствие события, partial trace, toll=false и чужой node не заменяют доказательства: тогда остаётся прежняя локальная проверка. V2 не передаёт новую optional trace, его алгоритм не изменён. Геометрический порядок крайних границ и готовая направленная матрица сохранены.
3. `app/v2/components/result-panels.tsx`: fastestOnly раньше игнорировал manualToll/onManualToll и не передавал manual sum в copy. Теперь ручной ввод доступен для V3, явно помечен, один и тот же amount идёт в экран/копирование. Никакой подстановки0 вместо unknown.
4. `app/v3/components/use-v3-calculation.ts`: при существующем base и неизвестных дорогах копируется сумма «без платных дорог», а не строка «итого не рассчитано». Полный итог не выдумывается. Проверено, что особая тарификация/раскрывающийся comfort сохраняются при tollunknown.

## Источники и доказательства
`../source-snapshots/route-fixes-2026-10-15/` содержит API before/after, полную живую trace Волноваха–Москва, mixed-profile replay, primaryOSM node/way и provenance.json с SHA256. Original node5818209495 GET и way615270691/full получены200: ПВП545/Автодор, selected unnamed way contains node and toll=yes/oneway=yes. Идентичности228/416 взяты из существующего именованного инвентаря. Старые исходные live-controls restored; новая история хранится отдельно. Петербургский raw provider snapshot передвинут в новый каталог, путь в record обновлён.

## Проверки, действительно выполненные
- pnpm install --frozen-lockfile: PASS (29.2s; Node24.19.0).
- Focused `node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m4-selected-trace-reuse.test.ts scripts/v3-ckad-regional-products.test.ts scripts/v3-hook-race-audit.test.mjs scripts/v3-result-render-audit.test.mjs`:22/22 PASS. Первоначальный render test19/20 FAIL из-за test typo(tolls undefined), исправлен на tolls:toll;20/20 затем22/22 PASS.
- Первый fullbuild625/625+quote/API+Next/TS PASS; после добавления reuse — финальный `npm run build -- --webpack`:627/627+quote/API+Next/TS PASS, exit0. stdout финального gate сохранён в checks/v3-route-fix-build-2026-10-15.log.
- Targeted eslint всех изменённых product TS/TSX и runner/test: PASS(exit0). git diff --check PASS.
- Live API representative city coords, departure2026-10-15T00:30+03:00: Донецк→Краснодар479156м/26633с: comfort20995, roads850(unconfirmed), validResponse=true,39.2s. Волноваха→Москва1182425м/61701с: comfort55299, roads3050(unconfirmed), valid=true,57.9s. После reuse Волноваха→Краснодар509239м/27910с: comfort22907, roads850(unconfirmed), valid=true,26.3s; до reuse roadsunknown/49.3s. Суммы разных городских координат не являются проверкой exact user addresses/Яндекса.
- Live Санкт-Петербург→Москва и Краснодар→Санкт-Петербург:200/valid DTO, base fare присутствует, tollunknown сохраняется. Краснодар–СПб2061458м/94845с base66997; missing m4(profile switch),M11tail,unnamedbooth,ZSD. Эти записи до finalreuse: это диагностика незакрытых причин, не доказательство финальной API-приёмки всех Петербургских маршрутов.
- Offline replay Волноваха–Москва c departureThursday12:00 и длинной поездкой пересекает Fridayprofile: m4_crossing_profile_changes всё ещё unknown. Не смешивать этот допустимый отказ с устранённым unnamed-node bug.

## Незакрыто и конкретный следующий блок
Полный Петербургский итог ещё НЕ исправлен: М11tail679–684/airport needs exact scoped readypair; ЗСД needs no-transponder current operator table and exact crossing zone binding. Original SeptemberM11PDFpages9/10 visually reread;56/38/94 источники есть, физический scope не завершён, ни одна сумма не активирована. Прямые ЗСДbasePDF/Prilozhenie2 curl/search дали403; по snippets цена не импортирована. Другие unnamed paid IDs и смена профиля на длинном М4 также сохраняют unknown. Не удалять платные продукты и не публиковать subset как full.
Next: получить доступный оригинал ЗСД, закончить binding М11tail/mainline/airport и ЗСД по фактической выбранной геометрии; оформить собственные готовые пары в source register; затем focused/fullgate и повторная приёмка Петербурга в обе стороны, диагностикаon/off. PrimaryPDF повторно от пользователя пока не запрошен. CI/Preview этого нового блока ещё не проверялись. Нет production deploy/merge/Android.

Git: родительc1421f8, новая fixветка; commit этого блока определяется Git history данного файла. PR/remote сохранение записывается в последующем checkpoint после фактического результата.


## 2026-10-15 — checkpoint972a35a и отказ remote push
Код,30files/sourceevidence/logs сохранены localcommit972a35a. `gitpush -uoriginfix/v3-missing-route-prices-2026-10-15` отклонён автоматическойreview (unverifiedGitHubremote; requesttofix не признан explicitexportauthorization для repositorydata/evidencesnapshots). Не обходитьотказ черезGitHubconnector/blobs/другойtransport. Remoteupload/PR/CI/Previewнеподтверждены и не заявлены. Next: явное разрешение пользователя на preparedcommit upload вточный4regodatbe-cpu/mezhgorod-calculator, затем повторpushиverify. Локальное дерево/коммиты доступны в /workspace/scratch/31a127bf701a/mezhgorod-calculator; Gitжурнал содержит точную точкупродолжения. Петербургtail/ZSD ещёнезавершены; Production/main/Androidнет.


# 2026-10-15 — аудит длинных цепочек платных дорог

## Запрос и исходное состояние
Пользователь предложил построить длинные маршруты через несколько платных дорог: Казань–Санкт-Петербург и Краснодар–Санкт-Петербург через Москву и другие дороги, чтобы найти конкретные места отказа. Работа на fix/v3-missing-route-prices-2026-10-15, parent29a7c4d; предыдущий codecommit972a35a. Сохранение GitHub ранее отклонено автоматической review, разрешение экспорта ещё не получено; повторного push/обхода через connector не было. Все результаты этого блока сохранены в локальном Git.

## Метод и реальная выборка
`scripts/v3-long-chain-audit.mjs` вызывает настоящие Valhalla/OSRM/BRouter, применяет production isUsableRoute/followsPlan/stretch/territory checks и тот же fastest selector. Затем проверяет полную выбранную геометрию через validateTollEdges и вызывает реальный V3 calculateLegTolls. Тестовые routing controls обеспечивают указанную цепочку; это audit harness, а не поддержка пользовательского via в API. Provider/query responses, точная выбранная геометрия, strict spans и trace сохранены gzip; копии ответов не используются в live выборе или ценах.

Выполнены 8 живых прогонов 7 разных цепочек. Все ожидаемые семейства обнаружены. Основная дата2026-10-13T09:00+03:00 выбрана для отдельной проверки географии без немедленного перехода в пятничный профиль. Смена профиля проверена отдельно на той же записанной геометрии2026-10-15T22:30+03:00:16 offline replays (2 на каждый живой снимок), JSON всех16 прочитаны/проверены. Offline replay запрещает внешние запросы без записанного ответа, сохраняет порядок повторных ответов одного requestkey и не подменяет incomplete trace полной.

| Цепочка | Доказанный результат локализации |
|---|---|
| Казань–Москва–СПб | М12 готовая пара3513; headМ11 880 и mainline3900; хвост679–684/ЗСД unknown. Первый live trace incomplete из-за429; повторный live complete, неизвестны толькоtail/ЗСД |
| СПб–Москва–Казань | М11head1130/mainline3900, М12 3513; tail/ЗСД unknown |
| Краснодар–Москва–СПб | М4 5040, М11head1130/mainline3900; unnamedbooths локализованы; после fix неизвестныtail/ЗСД |
| СПб–Москва–Краснодар | Те же семейства, готоваяМ4 5040/mainline3900; первичная trace incomplete, так и сохраняется в replay, несмотря на исправленные идентичности |
| Казань–ЦКАД–СПб | MainlineМ11 после fix3900; partialhead не доказан; ready pairМ12 на въезде/выездеЦКАД не привязана; текущийCKAD adapter поддерживает full eastarcМ4↔М11, не этот северный отрезок |
| Краснодар–ЦКАД–СПб,11controls | MainlineМ11 после fix3900, М4 5040; CKAD arc_length_out_of_range, partialhead/tail/ЗСД unknown |
| Краснодар–ЦКАД–СПб,3outercontrols | Независимый контроль routing artifacts от частых остановок; М4/mainlineМ11 готовые, CKAD east_arc_not_proven и partialhead/tail/ЗСД unknown |

Эти суммы — известные отдельные компоненты/оценки, не полный маршрут и не новая сертификация тарифа. Семь цепочек не гарантируют полный аудит всех платных дорог России. Конкретные точки/пары/reasons и источники: `source-snapshots/long-chain-2026-10-15/INDEX.json`,live.json и timestamped replayJSON в каждом каталоге.

## Выполненные исправления
1. `lib/v3-calculation/route-leg-pricing.ts` возвращает внутренний read-only componentAudit: список реально обнаруженных продуктов, готовые суммы, missing и reasons. Копии объектов/segment arrays отделены; audit не участвует в eligibility/price и не добавлен в public API DTO. Известные части видны исследователю даже при неизвестном полном итоге.
2. `m11-product-boundaries.ts`/`engine/m11-route-adapter.mjs`: mainline58↔679 определяется независимо от15км московского head. Для нового headless/partialhead пути требуются strictM11 evidence выбранного провайдера, оба физически близких anchor≤120м, порядок/spans и отсутствие malformed. Московский полный путь сохранён. Выявленный partialhead при въезде сЦКАД добавлен отдельным неизвестным продуктом: entry point не выдумывается, Moscow→Solnechnogorsk не назначается вместо него. Основная пара получает собственный платежный clock/window, headless может обходиться без head, partialhead не даёт полный итог. Разделение заново заставляет увидеть хвост679–684 послеЦКАД, ранее скрытый за общим unresolvedmainline.
3. `unpriced-road-coverage.ts` и source-backed node-identities.json: события7014845616 (М11p679),933974949 (ЗСДПВП4),318102347 (ЗСДПВП3),6257559336 (М4ПВП515) не превращаются в неизвестную «ещё одну дорогу». Все новые идентичности подтверждены primaryOSM object/topology или существующим primary архивом. ЗСД рампы связаны через соседние nodes/ways с namedtollЗСД. Старые OSM fee tags ПВП515 не импортированы как тарифы. Нераспознанные IDs/partialtrace остаютсяunknown.
4. `lib/toll-validator.ts`: HTTP429 может получить ровно1 повтор с Retry-After в пределах прежнего18s бюджета chunk. Более длинное ожидание>5s не игнорируется: остаётсяincomplete. Стойкая429, malformed response и неполнота не дают0/полную сумму. Общая неоднократная retry policy не добавлялась. Последний повторный liveКазань tracecomplete без429; нельзя приписывать его успех исключительноretry. Retry действительно проверен отдельнымиunit cases429→200/persistent429/RetryAfter60.

## Проверки и исправленные промежуточные ошибки
- Originalcomponentaudit focused18/18 PASS.
- После расширения M11 initial34 tests33/34: ошибочный partialhead detect у маршрутаp593→679; причина—сравнение indices безphysicalp58 hit. Исправлено requiringp58/p679≤120м дляpartialhead. Повтор34/34 PASS.
- Новый realfixture source test36/37: test наследовал unrelatedcapturedroadNamesМ12, очищены только unrelatedfixturealiases; runtime не ослаблен. Финальный focused38/38 PASS.
- Final command: `node --import ./scripts/register-ts-paths.mjs --test scripts/v3-chain-boundaries.test.ts scripts/v3-m11-products.test.ts scripts/v3-road-evidence-audit.test.ts scripts/v3-ckad-regional-products.test.ts scripts/toll-trace-rate-limit.test.ts`:38/38 PASS.
- Final `npm run build -- --webpack`:635/635 + quote/API + TypeScript/Next PASS, exit0. Relevant stdout в checks/v3-long-chain-build-2026-10-15.log; focused log рядом.
- Targeted eslint changedTS/runner/tests PASS(exit0),gitdiffcheckPASS.
- 16/16 offline replay records inspected; no missingExpected; logs checks/v3-long-chain-replays-2026-10-15.log. All complete-route totals remained unknown when any required product unresolved. This is expected failclosed, not a claim that full trip fares are fixed.
- Captures and post-fix replays separate; newer replay output timestamped, no completed stage report overwritten.

## Незакрыто и следующий конкретный блок
1. Привязать partialheadМ11 на въезде/выездеЦКАД к собственным `tskad↔solnechnogorsk` directed tariffs и точнымphysicalPVP47; МосковскийПВП21 тоже не объявлен закрытым. Требуется факт выбранного crossing, а не только название города.
2. Привязать mainline tail679–684/airport к собственным рамкам и operator rule56/38/94; ЗСДПВП3/4 nowidentified, но base no-transponder/currentzone tariff и связьштмсд/витебскойразвязки ещёне готовы. Не начислять guessed300/56 или aggregate известныхчастей.
3. General CKAD endpoints:М12↔М11 и реальныеМ4↔М11 физические границы вместо full-arconly heuristic; подтвердить operatorcontext120min/defaultmatrix. На этих двух CKAD сценариях М12 exit/operatorpair остаётся не привязан; проверить exactmarkers/newШали/CKADjunction. М11 mainline patch не закрывает эти независимые gaps.
4. Проверить profile switches по paymentevent каждого продукта. Повторные воспроизводимые dates/replays уже готовы; entiretrip M4profile switch остаётсяunknown согласно нынешней модели, не удалять guardбез correct scopedclock.
5. Повторить liveacceptance после sourcebindings и хотя бы1 полностьюpriced multi-roadchain; затем полныйgate. Текущий этап — успешная локализация/кодовые исправления, а не полный выпуск.

Publication: main/Production/Android не изменены, новогоPR/Preview/CI нет. GitHub export остаётсяBLOCKED по предыдущемуauto-review, новыйpush не пытался. Currentfix commit определяется Git history этого отчёта; parent29a7c4d.


# Этап07 — разрешённая публикация и MMK М11, 2026-10-15

Пользователь явно разрешил GitHub export. Обычный push после разрешения не имел CLI credentials; connected GitHub опубликовал проверенное дерево96319999be776dfa22e7cba59dd4bbbc690939f1, commit16fc7213a4d0d7095b29e049a672768b2089eafd. PR14 draft в audit/v3-matrix-provenance-2026-10-14. Actions38644084416 verify/live_probe success, Vercel status success. Ни merge, ни Production не выполнялись.

Контрольные цепочки ЦКАД фактически входят через MMK north50, не CKAD47. Операторские passage rules page5 и head tariff page2, ранее сохранённые PDF, проверены визуально. Направленные OSM gates3499155981/3499155978, flanks и source SHA сохранены source-snapshots/m11/2026-10-15-mmk-bindings. Новый m11-mmk-head-boundary.ts требует единственный gate, ordered flanks25m/chord≤2km и независимый strict mainline. Source approximate position сохранён; nearby/reverse/long chords unknown. m11-product-boundaries использует собственную MMK↔Solnechnogorsk пару и payment clock; суммы матрицы не изменялись.

Начальное предположение симметричной цены вызвало1 failure: по первичной таблице reverse200, forward280. Исправлены ожидания, focused16/16 и full638/638+quote/API+Next/TS PASS. Новый live spb-kazan-ckad показывает head200/mainline3900, остальные неподтверждённые компоненты unknown. Evidence, replay и checks сохранены. Parent новой работы16fc7213; итоговый commit определяется git history PR14. Следующий блок: scoped ZSD, затем tail.

# Этап08 — первая зона ЗСД, 2026-10-15

Задача: длинные пересекающиеся платные цепочки и точные места обрыва. nch-spb PDF403 не обошли выдуманной ценой: официальный владелец whsd.ru/tarifyi-na-proezd/ и /pravila-ispolzovaniya-zsd доступны200. HTML cash/card таблица effective2025-05-01, category1 zone1 КАД(юг)–Благодатная300; transponder2026 не используется. HTML, SHA, bulk OSM64ways/335nodes и readiness сохранены source-snapshots/zsd/2026-10-15-zone1.

Reviewed conservative subset27 paid way IDs полностью в zone1. Runtime не использует latitude heuristic. zsd-zone1-component.ts требует complete selected trace/booth coverage, ledger всех toll edges, только reviewed ZSD ways, единственный known PVP3/4 gate, ordered flanks25m/chord≤2km; иначе unknown. Quote engine использует scoped cash cell и время фактического crossing; same-zone key не нулевой OD. toll-validator отдаёт paidRoadEdges, route-leg-pricing подключает scoped component; tariff-products описывает partial scope. Общая готовность сети не объявлена.

Новые4 tests проверяют source hashes/HTML, обе стороны300 без nightdiscount, чужую зону/неполноту/повторные booths/reverse/pre-effective отказы и recorded live scope. Focused29/29, full642/642+quote/API+Next/TypeScript PASS, targetedlint и diffcheck PASS. Replay runner восстанавливает ledger только из recorded global responses, без сети и без повышения completeness. Вначале синтаксическая ошибка flatMap остановила runner; исправлена, node --check PASS и10 replay PASS.

Свежий live Краснодар→Москва→СПб: M4/M11 known, ZSD300; единственный blocker tailМ11 679–684. CKAD variants head280/ZSD300, missingtail+CKAD. Kazan и reverseCKAD выходят за reviewedzone1, поэтому ZSD unknown. Волноваха→Краснодар22907+850 regression PASS. Никакой partialtotal не принят. Primary order274 ещё не привязан физически. Яндекс UI northbound probe дал12km detour/no fare label; не является price/free proof, никаких0/250/56/112 не импортировано.

Ветка fix/v3-missing-route-prices-2026-10-15 parent16fc7213, PR14; эта работа публикуется отдельным exact-tree checkpoint. Main/Production/Android не менялись. Следующий шаг: reviewed tail physical endpoints/payment events, другие ZSD zones/CKAD/M12, полностью priced длинная цепочка.
## 2026-10-15 — Stage 09 continuation: order274 visual audit and Pulkovo ambiguity regression

**Request/resume point:** continue PR14 on `fix/v3-missing-route-prices-2026-10-15` from `docs/WORK_STATE.md` stage09. Branch was behind GitHub by three commits; fast-forwarded clean local branch from `bb29d344` to remote `ef33b268`. No unrelated changes were present.

**Evidence checked:** rendered saved official Avtodor Order274 scanned PDF pp.9–10 and visually read against SHA256 `6b52ca130ee7e8a7948c2b39982c00d82174e4e45ec5dcd3983355238c403b91`. It lists category-I 94 RUB for the combined RVP (airport approach plus 679–681 or 681–684), 38 RUB for airport approach, and 56 RUB for 679–681/681–684 alone. These are alternative product tariff lines; they must not be summed. The document supports prices and the operator wording but does not independently bind a selected route trace to a complete directed RVP passage. Existing OSM snapshot has two airport gantries about 12m apart; current 25m geometric candidate radius matches both, so direction is ambiguous from this evidence.

**Implementation:** updated `scripts/v3-pulkovo-product-evidence.test.ts` to expect both nearby gates, null direction and `ambiguous_nearby_gates`, and to match the new diagnostic reason emitted by commit `ef33b268`. Public API guard still asserts unknown toll amount serializes as null. No runtime pricing code or tariff activation changed. Updated stage09, NEXT_STEPS and WORK_STATE with exact evidence, result and open binding.

**Checks:** focused initial run exposed 1 stale assertion (11 passed/1 failed; API null assertion itself passed). After test correction, Pulkovo/M11/road-evidence focused suites pass **21/21**. `pnpm build` full audit passes **642/642**, quote/API pass, Next.js compilation and TypeScript pass, static generation 16/16. Targeted ESLint and `git diff --check` pass. Whole-repo `pnpm lint` was run and fails with 19 existing unrelated repo-wide lint errors (mostly CommonJS `require` in `.cjs`; also `prefer-const` in `lib/v2-calculation/route-leg.ts`); no lint error in edited test. No live route was rerun.

**Limits / next:** keep 56/38/94 unassigned in runtime until exact physical directed paid-event/RVP boundary and complete route coverage are proven for tail-only, airport-only and combined travel. Then implement scoped resolver and both-direction/live chain tests. PR14 is open draft; branch now includes only existing remote commits plus this local test/docs block pending checkpoint. Main/Production/Android untouched.


## 2026-10-15 — stage09 checkpoint persisted to PR14

**Publication:** direct `git push` was unavailable because the shell had no GitHub credentials. The already-authorized branch update was persisted through the connected GitHub repository API with a compare-and-swap ref update. First API upload truncated the 303,750-byte work log at the tool response limit; this was detected by remote size/line-count comparison before completion, then the exact full local file was re-uploaded in verified 100-line chunks. Remote `WORK_LOG.md` was verified at **1333 lines / 303750 bytes**, same as the source before appending this publication note. No historical lines were lost.

**Remote commits:** `91f7e40` contains test + stage/work-state updates; `1efe8c8` restores the full log. PR14 head verified as `1efe8c8bcc7a18f399c01e216cedb69e4b26866b`, still open/draft, not merged. Combined check for `1efe8c8` showed Vercel pending when queried; local `pnpm build` remains the completed 642/642 + quote/API + Next/TS verification from the prior entry. Main, Production and Android unchanged.
## 2026-10-15 — Stage 09 live tail trace in both directions

**Route runs:** reran `node --import ./scripts/register-ts-paths.mjs scripts/v3-long-chain-audit.mjs krasnodar-spb-moscow` and `... spb-krasnodar-moscow`. Both exit 0, fastest provider OSRM. Captures are saved at `source-snapshots/long-chain-2026-10-15/krasnodar-spb-moscow-2026-10-15T03-00-40-046Z/` and `spb-krasnodar-moscow-2026-10-15T03-01-42-562Z/`. Both full selected-route traces and booth-event coverage are complete; both API totals remain `null` / `unknown`, with only `m11-679-684` missing.

**Evidence:** forward geometry trace has booth `7014845616` on service way `241701006` with `edgeToll:false`; nearest fee=yes plaza node `2492861246` is 6.1m away and is not reported as a toll event. Reverse geometry trace identifies `2492861243` as toll booth on toll=yes way `1395997595` and `edgeToll:true`. Both events occur at the archived p679 plaza, but the forward lane mismatch and absence of proven tail exit prevent a complete directed RVP match. These captures do not cross the airport gantries; they cannot justify 38/94 RUB. No runtime code/tariff change was made; no tests repeated because this evidence-only block uses the existing harness.

**Next:** independently prove the physical exit/toll event for the complete 679–684 product and distinguish tail-only, airport-only and combined passages. Keep all three tariff rows unknown in the runtime until this is established. Main/Production/Android remain unchanged; PR14 draft.


## 2026-10-15 — Официальная модель ПВП хвоста М-11 и проверка lane topology

**Запрос/решение.** Продолжить PR14 с последней точки. Сохранять fail-closed: неизвестное не бесплатно; точная или частичная известная сумма не становится полной автоматически. Main/Production/Android не менять.

**Диагностика и источники.** Подтверждены локальная чистая ветка `fix/v3-missing-route-prices-2026-10-15`, HEAD `ffa11c37c608451b31cbd45cf0e583bae76353d1`; PR14 открыт, draft, mergeable; combined Vercel status для SHA success. По официальной странице Автодора `https://avtodor-tr.ru/business/road/m-11/` проверено: участок км 646–684 работает как closed system с оплатой за фактически пройденное расстояние между въездным и выездным ПВП; подъезд к Пулково начинается на км 681 и использует free-flow. Операторская страница `https://avtodor-tpass.ru/page/punkty-vzimaniya-platy-i-tsentry-podderzhki` идентифицирует ПВП 679 (ОССЗ) и ПВП 668 (Автодор-Платные Дороги) на участке 668–684. Попытки открыть HTML истекли/получили 403; зафиксированы поисковые выдачи первичных страниц, а не скриншот/полная сохранённая страница.

**Проверка архивной геометрии.** Из `2026-10-14-osm-tail-corridor.osm.gz`: nodes 2492861243 и 2492861246 — fee=yes toll booths на односторонних motorway М-11 toll=yes ways; 7014845616 — соседний booth на односторонней service way без fee=yes. Новый JSON audit фиксирует топологию и ограничения. Две полные свежие трассы остаются разнонаправленными по plaza lanes: прямой маршрут задевает service booth, обратный — fee=yes node. Официальная схема описывает систему, но не связывает выбранный точный event с конкретной строкой приказа 274.

**Изменения.** Добавлен `source-snapshots/m11/2026-10-15-official-tail-corridor-source-audit.json`; в stage09 дописан append-only результат; `NEXT_STEPS.md` и `docs/WORK_STATE.md` обновлены. Runtime и тарифные данные не менялись. `DECISIONS.md` не менялся: нового ценового правила не выведено.

**Проверки.** Верификация PR/status выполнена коннектором GitHub: PR14 head `ffa11c3…`, open/draft/mergeable; Vercel success. Локально проверена OSM XML topology; `git diff --check` PASS (после правки). Тесты/build не запускались, поскольку изменены только docs/evidence.

**Итог/ограничение.** Подтверждено: модель закрытого участка 646–684, endpoint facilities 668/679 и начало отдельной аэропортовой дороги у km 681. Не доказано: точная lane/entry-exit пара на выбранном live route и её mapping к 56/38/94 при проезде в двух направлениях. Сумма для Санкт-Петербурга остаётся unknown/null; не включать тариф, не начислять combined + tail. PR остаётся draft; main, Production и Android не менялись.

**Следующий шаг.** Получить первичную lane-level схему/операторский log конкретной пары 679↔668 либо 679↔681 и определить airport branch event; затем направленно проверить complete selected-route crossings в обоих направлениях.


## 2026-10-15 — пользовательское правило 94 ₽ реализовано для хвоста М-11

**Запрос и продуктовое решение.** Пользователь дважды прямо выбрал применять 94 ₽ к участку М-11 679–684 вместо дальнейшего выбора между строками 56/38/94. Решение сохранено в `DECISIONS.md`: для компонента хвоста категория I — 94 ₽ каждый день и в обоих направлениях; 56 и 38 не добавляются и не складываются с 94. Калькулятор использует строку с effective date 04.09.2026.

**Диагностика/область применения.** Страницы 9–10 приказа Автодора №274 визуально проверены ранее и повторно: стр.9 объединённый продукт Пулково + 679–681/681–684 =94 ₽, пн–вс, сноска 2 указывает фиксацию на airport-access RVP; альтернативы — отдельный airport 38 ₽ и стр.10 mainline56 ₽. Пользовательское решение закрывает выбор тарифа для хвостового компонента. Оно не расширяется на геометрию: цена назначается только при имеющемся strict M-11 selected-route continuation beyond p679 (`m11TailUnresolved`). Airport gate радиус без обнаруженного tail остаётся unresolved. Отсутствующая mainline boundary не становится полной суммой из одного хвостового 94.

**Код и данные.** Добавлен `lib/toll-engine/m11-tail-component.ts`: использует сохранённый официально датированный тариф, проверяет валидность даты и начало действия, возвращает 94 ₽ для weekday/weekend и одинаково для направлений. `lib/v3-calculation/route-leg-pricing.ts` подключает отдельный `m11-679-684` component к строгому хвостовому detection; близость airport gantry без tail не активирует сумму. Обновлён tariff JSON с `runtimeApproved:true` и точной отсылкой к user policy. Обновлены regressions в `scripts/v3-m11-products.test.ts` и `scripts/v3-road-evidence-audit.test.ts`, добавлен `scripts/v3-m11-tail-component.test.ts` (effective date, unknown undetected tail, direction-independent amount). Сохранены четыре offline replay outputs для Краснодар↔СПб и Казань↔СПб.

**Промежуточная ошибка и исправление.** Первый full build после внедрения прошёл 643/645 и выявил два теста, ожидавших прежние `unknown`/`0` для строго обнаруженного tail. Ожидания обновлены по явному решению пользователя; отдельно оставлен unknown теста маршрута с отсутствующей mainline boundary. Повторный focused suite 28/28 PASS. `pnpm build`: **645/645**, quote/API PASS, Next.js/TypeScript PASS, static generation16/16 PASS, exit0. Targeted ESLint и `git diff --check` PASS.

**Перепроверка цепочек.** Сохранённые capture JSON повторно проиграны offline под новым кодом. Краснодар→СПб и СПб→Краснодар: trace complete; все компоненты priced; выбранный tail94; полный расход 10 464 ₽ weekday /12 334 ₽ weekend. Казань→СПб и СПб→Казань: выбранный tail94 с обеих сторон; общий итог корректно остаётся unknown из-за отдельного ZSD continuation beyond zone1, не относящегося к решению по М-11. Это воспроизводимое recorded-response replay, не свежий live routing и не production UI.

**Сохранение/публикация.** Runtime/evidence commit local `f9e43406bf4ec1ceb51cbb1fe848bf87d7188463`; его дерево опубликовано в GitHub commit `019859828de9aa3edbfcbf76b0be1fe7baebbb4e`. PR14 head теперь `019859828de9aa3edbfcbf76b0be1fe7baebbb4e`, open/draft/mergeable. На последней проверке Actions run `38681974174` in_progress, Vercel pending. Docs handoff обновлён отдельно в том же branch после итогового мониторинга. Main/Production/Android не менялись.

**Следующий шаг.** Проверить завершение Actions/Vercel на exact head, выполнить API/Preview acceptance по длинной цепочке и затем продолжить отдельные blockers ZSD beyond zone1, CKAD physical context/endpoints, M12↔CKAD. Не переоткрывать выбор 94 ₽ без нового тарифа или нового scope доказательства.


### Status refresh after code and documentation publication — 2026-10-15

PR14 was checked after both commits. Runtime/evidence commit `019859828de9aa3edbfcbf76b0be1fe7baebbb4e` remains published; PR is open, draft and mergeable. Vercel is **success** for runtime commit 0198598. The later docs-only handoff checkpoint has its own pending Vercel status; the PR includes that docs-only tip. GitHub Actions run `38681974174` for runtime commit 0198598 is still **in_progress**. Do not report full hosted CI success until it concludes. No code changed after the verified build.
# Stage 10 — exact Preview smoke and fresh reverse long chain — 2026-10-15

After the user closed the M-11 fare choice at 94 RUB, verified the current PR tip and performed the next acceptance block. GitHub PR #14 is open/draft/mergeable at `b555be97c722b9eadc74780986edb783789e6c41`. Vercel deployment `dpl_BW9c2DCBJLP1KXx7MHvLhhepFWnD` is READY for that exact SHA. Raw unauthenticated curl received HTTP 302 from Vercel Deployment Protection and was not counted as success; connected authenticated Vercel fetch returned `/api/version` 200 with the exact SHA/environment `preview`, and `/v3` 200 with calculator HTML. No protection settings or secrets were changed.

Fresh selected OSRM route Saint Petersburg→Krasnodar via Moscow was captured at `2026-10-15T04:35:19.248Z` UTC, route length 2,051,990 m, expected M-11/M-4 detected. `m11-679-684` resolved to 94 RUB as directed. Route trace is incomplete; audit reports missing ZSD (`zsd_complete_selected_trace_missing`) and `unknown-paid-road` (`selected_route_payment_trace_incomplete`), so the full total remains unknown/null. Do not represent the known M-4/M-11 partial sum as a quote. Evidence: `source-snapshots/long-chain-2026-10-15/spb-krasnodar-moscow-2026-10-15T04-35-19-248Z/{live.json,capture.json.gz}`; SHA-256 values are in stage 10 report. No calculator code changed in this block.

GitHub Actions run `38682163789` for the exact docs tip and `38681974174` for the runtime commit were both `in_progress` at last poll; hosted CI is not reported as successful. Previous local full gate for runtime SHA remains 645/645 audit + quote/API + TypeScript/Next + static generation16/16 PASS. `git diff --check` and documentation link validation are to be run before recording this docs/evidence checkpoint. Next: poll Actions; then separately bind complete ZSD continuation and diagnose unknown paid-road trace while preserving fail-closed full totals. M-11 94 RUB selection is closed. No merge/main/Production/Android changes.
## Stage 11 — Valhalla rate-limit resilience and reverse chain — 2026-10-15

Fresh SPb→Krasnodar via Moscow in stage 10 failed selected-route trace completeness at 14/15 chunks: Valhalla `/trace_attributes` returned HTTP 429 twice for the same chunk. The complete route had M-4/M-11 evidence, but incomplete trace correctly blocked the whole total through ZSD and `unknown-paid-road`; no subtotal was exposed.

Changed `lib/toll-validator.ts`: reduced per-route chunk concurrency from3 to2 and expanded the bounded HTTP429 policy to two retries (1s/2s fallback if no valid Retry-After, maximum5s delay each, existing18s deadline and server Retry-After respected). Persistent rate limiting/long retry-after remains fail-closed. Updated rate-limit tests to cover retry-recovery after two429s and persistent failure after two retries. Live audit capture now records Retry-After response header in `scripts/v3-long-chain-audit.mjs`.

Verification: focused retry suite4/4 PASS; targeted ESLint PASS; `git diff --check` PASS. Full `pnpm build`: 646/646 audit tests, quote suite, API contract, TypeScript/Next, and static generation16/16 all PASS (exit0). Re-ran exact reverse live route SPb→Krasnodar via Moscow: 2,051,990m, all expected M-11/M-4 identities, complete selected-route trace, audit status `priced`, no missing components. Tail `m11-679-684`=94 both fare periods; route total 10,464 weekday/12,334 weekend. Capture has16 trace requests, all HTTP200 and no429. Price confirmation remains unconfirmed and the display warning remains: this is complete calculation over currently wired components, not independently confirmed operator receipts.

Evidence is saved in `source-snapshots/long-chain-2026-10-15/spb-krasnodar-moscow-2026-10-15T04-45-39-137Z/` and hashed in stage11. Previous remote tip `1d76774...` was Preview success; its Actions run `38682872780` was in progress at the last poll. Current code/evidence requires publication and new exact-SHA CI/Preview checks. Next: publish; verify; then investigate remaining ZSD scope/source-date conflict without guessing fare cells. No merge/main/Production/Android changes.
## Stage 11 publication status — 2026-10-15

Code/evidence commit `e87b7b5057984efbdd1688d56e5ee69e93997445` is on PR14 branch; local checkout fetched the exact remote head/tree and is clean. PR remains open, draft and mergeable. Actions run `38683370889`: `verify` job success; `live_probe` still in progress at last poll. Vercel deployment for exact SHA READY; authenticated `/api/version` returned exact commit + preview environment (200), `/v3` returned 200. The completed runtime block is validated and published; wait for live_probe before claiming the hosted workflow fully successful. Next source block is ZSD fare-scope/version reconciliation. No main/Production/Android changes.
## Коррекция публикации WORK_LOG — 2026-10-15

Обратная проверка показала, что промежуточная GitHub-загрузка docs-коммита `547d541` повредила сериализацию `WORK_LOG.md`. В локальном исходнике сохранены все датированные записи (1405 строк); SHA blob `9111f400236746d4b63b3f955b3de0650a6326ad` совпал с GitHub blob после восстановления. Точное полное дерево восстановлено коммитом `3e86bc600f88955ef6f13b7a3a47a6ecf0986635`; рабочая копия синхронизирована, текущий файл проверен через GitHub `fetch_file` по blob SHA. Не удалять и не переписывать прежние записи журнала.
