Warning: truncated output (original token count: 75938)
Total output lines: 1333

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
- **Почему:** это полноценная тарифная матрица независимого оператора; native time/day bands долж…45938 tokens truncated…raw arrays, including62=220/220,71=310/400,339=370/400,355=220/220 specificallytowardsMoscow,416/460samecorridor230/360 once,636=570/640,672=350/440,1046=380/450,1093=150/150,1184=300/350,1223=400/500,DZOK410/410. PDF545secondrange544–589 corrects metadata knowledge from old545–589 snapshot; original historical file not rewritten. Page4/5 footnote5 second slash636/672220/270 is APDtransponder633↔672partial120min; not no-transponder. Exemption exit636/672within120min afterpaidentry;416/460receipt within12h; rules documented in source snapshot, not declared all timed route fares certified.

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
