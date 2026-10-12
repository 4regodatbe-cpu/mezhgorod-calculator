## CURRENT 2026-10-13 — M4/M12 V3 matrix adapters

DONE: remote base integration bd77b6f on experiment/toll-od-matrix-2026-10-08. Follow-up M12 dated vector adapter blocks expired Shali prices and permits current candidates with visible warning. Local TypeScript/build PASS, adapter10/10 PASS, native305/305 PASS. V3 UI/copy warn on numeric estimates.

IN PROGRESS: persist M12 follow-up and create Preview at its exact commit; first Preview dpl_6pdqTza1rSL8Cce7MJWAdN7bUBFy belongs to superseded bd77b6f. Live route/browser E2E and remaining road matrix adapters not complete. Full detailed log: experiments/nationwide-tolls/WORK_LOG.md.

---

## CURRENT 2026-10-13 — V3 candidate-price integration

DONE locally on recovered remote source440ce6b2: V3 API uses its own route-pricing module, exact M4 vectors read finished candidate/known table; numeric V3 tolls carry «Стоимость не подтверждена» in UI and copy. Tests305/305 + adapter6/6, TypeScript and Next build16/16 PASS; local page200 / invalid API400 PASS. Logs: experiments/nationwide-tolls/WORK_LOG.md.

IN PROGRESS: persist reviewed changes to experimental branch and inspect Preview; live route/browser E2E not run. Other-road full matrix adapters not yet connected. No Production or merge.

---

## CURRENT 2026-10-12 — M-11 15–58 km full tariff matrix captured

- **DONE:** official operator PDF transcribed into `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`: 42 directed origin/destination cells across 7 toll nodes; exact no-section-transponder Group 1 passenger-car scope; five time/day bands; effective 2026-01-12 01:00. Raw values are retained without flattening Friday/Saturday/Sunday and overnight periods.
- **DONE:** JSON was read back and checked: 42 cells, seven origin nodes, five bands, all tariff amounts integral/non-null. Data commit `c6e544edf501937410c2e04ba083632ccba7d8cb`; log commit `9704effe53c146f38a5d0166743dc9fb69bab19f`.
- **IN PROGRESS:** convert all official tariff schedules into per-operator native matrices and enumerate full M-4 span cells; expand beyond Avtodor and M-11.
- **OPEN:** M-11 transition-time tariff selection (route crossing tariff time boundaries) requires operator rules before engine integration. Candidate tables from Avtodor still need PDF profile/date mapping. Main 58–679 M-11 and non-Avtodor toll systems remain open.
- Detailed source/decision history: `experiments/nationwide-tolls/WORK_LOG.md`; consolidated raw tariff intake: `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`.
- `runtimeEnabled=false`; V2/main/Production unchanged; no tests/build run (data-only).

---

## CURRENT 2026-10-12 — Avtodor raw tariff schedules bulk-captured

- **DONE:** `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` now preserves official tariff-page raw rows: M-4 21, M-1 1, M-3 3, M-12 25 mainline, ЦКАД 16 nodes/full-loop, А-289 6 OD/ramp fares, Togliatti bypass 3 OD fares. Amount sequences kept exactly as displayed; candidate profile/date interpretation remains explicit.
- **DONE:** directly dated official PDF rates captured for M-12 km 1148–1211 (Cat I 325 ₽; effective 2026-03-02) and M-11 St Petersburg km 679–684 (Cat I 56 ₽; effective 2026-03-02). Three M-4 vectors match saved Yandex totals but remain candidate pending PDF date/header confirmation and route-chain proof.
- **Latest data commit:** `5559ee2012f3dd7f55c7d557878658f6dd3f257a`; bulk-capture log `cb7262ddbe61415794fa4f9726b11abe0158231f`. Full provenance and next steps in `experiments/nationwide-tolls/WORK_LOG.md`.
- **IN PROGRESS:** obtain/read detailed tariff PDFs; map raw arrays to category-I/no-transponder and effective periods; continue sourcing toll operators outside the Avtodor schedule.
- **OPEN:** raw capture is broad but not yet a normalized/complete route-span fare matrix; exact mapping, effective dates, PVP vectors and most non-Avtodor operators remain unverified. M-4 accepted matrix still 2 cells.
- **Safety/status:** `runtimeEnabled=false`; V2/main/Production untouched; no tests/build run (data-only commits).

---

## CURRENT 2026-10-12 — tariff candidate intake expanded

- **DONE:** candidate catalog `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` now contains 21 Avtodor M-4 row transcriptions plus three M-4 span candidates reconciled with saved Yandex controls; additionally captured two directly dated official tariff records: M-12 I-category 325 ₽ for km 1148–1211 bypass package and M-11 St Petersburg km 679–684 I-category 56 ₽, both effective 2026-03-02.
- **DONE:** provenance/decisions/next steps appended to `experiments/nationwide-tolls/WORK_LOG.md` (latest log commit `53712074c1a64c07e3e1c400c42c5d61f5450123`). Data commits: `11f63bdf2f59ca4fbc545461960c14665f7c5db0`, `3363fcdbb0829e9a79e99979b8315a5183bff389`, `ab915c42e4ef420aea086af7963ad1c755770643`.
- **IN PROGRESS:** candidate-first expansion of tariff inputs for remaining toll products; capture full official PDFs and raw schedule values operator by operator.
- **OPEN:** M-4 candidate row column interpretation and current effective date need PDF confirmation for every row; route-to-PVP chains remain unproven for most OD controls. M-12 and M-11 entries cover only named sections, not their entire operator matrix.
- **Status:** actual isolated M-4 span matrix still has 2 accepted Yandex cells; other candidate rows are kept separate from runtime. `runtimeEnabled=false`; V2/main/Production untouched. No tests/build were run because changes are data/log only.
- **Next:** extract M-12 main route toll schedule and date; then transcribe dated full M-1/M-3/M-11/ЦКАД/A-289 and regional operator tables into the same candidate catalog, keeping source date and payment/category evidence.

---

## CURRENT 2026-10-12 — M-4 tariff candidate intake and Yandex reconciliation

- **DONE:** saved 21 official Avtodor M-4 tariff table rows, original displayed amounts, candidate class-I/no-transponder Mon–Thu/Fri–Sun interpretation, source provenance and caveats in `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json`.
- **DONE:** appended detailed why/source/status/next-step entry to `experiments/nationwide-tolls/WORK_LOG.md`. Candidate route-span cross-checks now include [1223,1184,1093] = 850/1000 ₽ and [1223,1184,1093,1046] = 1230/1450 ₽; each exactly matches its existing Yandex route control. [416,460] = 230/360 ₽ matches official combined row and Lipetsk—Voronezh Yandex route amount, while its exact route chain is not displayed.
- **IN PROGRESS:** rapidly transcribe official candidate tariff tables for the remaining operators, preserving raw values and candidate status; then build matrix rows and route-vector evidence.
- **OPEN:** confirm effective dates and tariff-column meanings from detailed official PDFs; identify exact PVP chain for each Yandex OD; resolve the PVP 62/71 and 339/355 parallel/overlap semantics. Do not treat candidate rows as verified production fares.
- **Latest commits:** data intake `11f63bdf2f59ca4fbc545461960c14665f7c5db0`; Yandex reconciliation `3363fcdbb0829e9a79e99979b8315a5183bff389`; work log `11d874478b0b7a2eb82cb8af722ecebd9e2df78f`. Branch `experiment/toll-od-matrix-2026-10-08`.
- **Status:** actual sandbox M-4 matrix still has only 2 accepted Yandex cells; candidate dataset is separate. `runtimeEnabled=false`; no V2/main/Production edits; data/docs only, no tests/build run.
- Product decisions: `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md`, `experiments/toll-od-matrix/DECISIONS.md`; complete dated entries in `experiments/nationwide-tolls/WORK_LOG.md`.

---

## CURRENT 2026-10-12 — M-4 tariff candidate intake persisted

- **DONE (candidate capture):** official Avtodor M-4 tariff page transcribed into `experiments/nationwide-tolls/TARIFF_CANDIDATES_2026-10-12.json` (21 tariff rows, raw displayed amounts, candidate Category-I/no-transponder weekday/weekend interpretation, per-row readiness, source, Yandex control links). Values intentionally remain candidates pending official PDF/header/effective-date confirmation and route-to-PVP proof.
- **DONE:** append-only reasoned entry added to `experiments/nationwide-tolls/WORK_LOG.md`. Data commit `11f63bdf2f59ca4fbc545461960c14665f7c5db0`; log commit `545508b2f5f88382b4746e0868d63dd8ba6cca48`.
- **IN PROGRESS:** aggressively collect operator tariff candidate tables and fill each operator-specific data matrix; begin with downloadable Avtodor tariff PDF and other indexed official tables. Then map M-4 rates into complete symmetric PVP spans.
- **UNVERIFIED:** page-level effective date and exact column mapping were not established for every M-4 row; Yandex totals for Lipetsk—Voronezh and Domodedovo—Kashira match candidate rows but do not reveal exact PVP chain. Candidate capture is not final verified coverage.
- **Safety/status:** M-4 experiment matrix still has 2 Yandex cells; this candidate intake has not altered it. `runtimeEnabled=false`; V2, main and Production unchanged. Data-only change; no tests/build run.
- Detailed append-only provenance and decisions: `experiments/nationwide-tolls/WORK_LOG.md`; product rules: `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md` and `experiments/toll-od-matrix/DECISIONS.md`.

---

## CURRENT 2026-10-12 — benchmark plan updated

- Block 6 in `experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md` now records the seven dated OD pairs, fare/no-fare results, slow-alternative exclusion for Kronstadt, mixed M11 and ferry caveats, and fact that only two M4 chain cells are currently seeded. Plan update commit `92f748f`.
- Current-route observations and links remain in `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; control index in `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`; append-only logs in `WORK_LOG.md`.
- Not 100%: majority of Russian toll groups, M4 PVP spans and all operator-specific full tariff evidence/receipts remain unverified. All new routes are diagnostic-only; no new amounts activated in runtime. Branch: `experiment/toll-od-matrix-2026-10-08`; no tests/build run because this batch changed documentation only.

---

## CURRENT 2026-10-12 — ранний М‑4 OD контроль добавлен

- Домодедово (ул. Каширское шоссе, 32) → Кашира (Советская ул.): Яндекс fastest ~310 ₽ / 1:04 / 50 mi во вторник и ~400 ₽ / 1:15 / 50 mi в субботу, выезд 12:14. Подробная карточка выходного: легковое авто <2 м, без транспондера; route details показывают E115 → Каширское шоссе.
- UI не показывает ПВП vector, поэтому это только контроль всей OD пары, не M4 vector cell. Results `b24c728`, matrix `350e9b1`, log `da4c3b2`.
- Итого собрано больше датированных route pairs, но база остаётся неполной: M4 exact span table держит 2 cells, остальные M4 control fares ждут map-to-PVP evidence; большинство других групп TBD. Runtime false; не запускались кодовые проверки в этом doc-only блоке.

---

## CURRENT 2026-10-12 — локальная пара М-4 Липецк—Воронеж проверена

- Встроенный Yandex Maps дал для выбранного быстрого маршрута Липецк (площадь Ленина-Соборная) → Воронеж (площадь Ленина): 13.10 = ~230 ₽; 17.10 = ~360 ₽; оба 2 ч 1 мин / 78 mi. В деталях подтверждены автомобиль <2 м, без транспондера, цена на момент выезда; указан платный обход Задонска и Хлевного.
- UI не раскрыл крайние/промежуточные ПВП. Цены сохранены как контроль OD, но не добавлены в M4 span lookup до точного vector proof. Results `cb43927`, matrix `af7c4ed`, work log `709cf02`.
- База всё ещё не 100%; Yandex whole-route controls не заполняют автоматически все M4 endpoint pairs и сети/операторы. Runtime remains false; no tests/build run.

---

## CURRENT 2026-10-12 — новые датированные дальние контрольные пары

- Дополнительно проверены Cloud Chrome/Яндекс Карты для Москва→Краснодар: fastest whole-route estimate ~5 040 ₽ (13.10, будни) и ~6 090 ₽ (17.10, выходные); значения не раскладываются на M4 spans. Два endpoints/date snapshots теперь записаны и требуют сверки с прошлыми маршрутными значениями.
- Москва→Казань: fastest 8:48 и 8:37; Яндекс помечает «Паромная переправа» и «Платная дорога», сумму не показывает. Это не чистая M12 price evidence; остаётся unknown.
- Новые данные: `experiments/nationwide-tolls/YANDEX_DATE_TEST_RESULTS_2026-10-12.md`, matrix и log. Commits: results `13d2ea5`, matrix `82000fd`, log `6d09865`.
- Объём незакрытого: большинство национальных тарифных продуктов и M4 span combinations без заполненных проверенных price cells; M4 runtime выключен. Яндекс тест-пары не закрывают dated operator tariff tables, route detector, adapters или full Preview E2E. Следующий шаг: продолжить парные проверки маршрутами, которые пересекают конкретный продукт; разрешить расхождение полных M4 маршрутов по точным точкам и отрезкам; загрузить оставшиеся сроки/тарифы из первичных таблиц.

---

## CURRENT 2026-10-12 — расширены датированные Yandex route controls

- Через встроенный Cloud Chrome выполнены и зафиксированы пары датированных маршрутов: M4 Sochi→Rostov (~850/~1,000 ₽) и Sochi→Shakhty (~1,230/~1,450 ₽); Казань→Набережные Челны (fastest ETA 3:19/3:18, сумма в датированных карточках не показана); СПб→Кронштадт (fastest 1:01/1:05, цена не показана; более медленная альтернатива ~300 ₽ исключена из расчёта); Москва→СПб дальний контроль (~4,760/~5,550 ₽, whole-trip оценка нескольких М-11 продуктов).
- Казань и Кронштадт «сумма не показана» означает unknown, не бесплатный тариф. Для Москва→СПб не распределять whole-trip оценку по операторам/секциям без раскрытого Yandex breakdown.
- Источники наблюдений, даты/время и URL: `experiments/nationwide-tolls/YANDEX_DATE_TEST_RESULTS_2026-10-12.md`; индекс всех контрольных пар: `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`; журнал: `WORK_LOG.md`.
- Последние commits этой серии: results `4e17a30`, matrix `e116cc2`, log `5db6456`. Все записи сделаны в изолированной ветке `experiment/toll-od-matrix-2026-10-08`.
- Национальная база **не 100%**: текущая матрица по-прежнему содержит TBD для большинства тарифных продуктов; две M4 векторные ячейки остаются единственными заполненными Yandex-ценами в runtime-format, `runtimeEnabled=false`. Не заявлять готовность всех дорог. Нужны локальные route controls по каждой сети/вектору, полные актуальные первичные тарифы, M-4 span комбинации, адаптеры, unit/build и Preview E2E. Следующий шаг: продолжить систематически собирать Yandex пары для конкретных продуктов и отдельно сохранять непоказанные суммы как unknown; затем сверять операторские тарифы.

---

## CURRENT 2026-10-12 — встроенный браузер восстановил работу Yandex benchmark

- Исправлено предыдущее предположение: встроенный Cloud Chrome доступен в текущей сессии с мобильного клиента. Яндекс Карты открыты внутри; пользователь может видеть вкладку.
- Датированные UI проверки (легковое авто, дата/время отправления 12:14, «избегать платных дорог» выключено): Sochi→Rostov, Tue 2026-10-13 = 8h08 / ~850 RUB, Sat 2026-10-17 = 7h53 / ~1,000 RUB; Sochi→Shakhty = 9h21 / ~1,230 RUB и 9h13 / ~1,450 RUB. Москва→Краснодар показывает платную дорогу без суммы.
- По пользовательскому указанию суммы карточек Яндекса принимаются как подтверждённые values для точного OD/vector/date/time контрольного прогона. M4 matrix получила 2 sandbox cells: [1223,1184,1093] 850/1,000; [1223,1184,1093,1046] 1,230/1,450. Обе ссылки/метаданные и лимит snapshot до 2026-10-17 находятся в cells. Matrix по-прежнему `runtimeEnabled=false`; Production не затронут.
- Артефакты: `YANDEX_DATE_TEST_RESULTS_2026-10-12.md`, обновлённая `YANDEX_DATE_TEST_MATRIX_2026-10-12.md`, `experiments/toll-od-matrix/matrix/m4-pvp-corridors.json`. Решение и журнал обновлены.
- Проверка после записи: JSON корректен; две ячейки проходят структурные инварианты (known PVP, canonical endpoint chain, safe integer amounts, valid dates, HTTPS source). Unit tests/CI/build/API E2E не запускались. Статус остальных тарифных продуктов и маршрутов — TBD/unknown.
- Commits: benchmark results `09469fc`; M4 span cells `1681ea5`; decision `a7d2bee`; matrix `2d020fc`; plan `fabe69a`; nationwide log `ac34ce3`.

## CURRENT 2026-10-12 — phased nationwide toll algorithm plan

- **Plan persisted:** [`experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md`](../experiments/nationwide-tolls/IMPLEMENTATION_PLAN_2026-10-12.md), commit `d1c996b1d779979f79449fdfd3ac327f469d8aaa`. Nine substantial blocks cover spec, legal/road inventory, dated operator tariffs, selected-route paid-edge evidence, adapters, Yandex/operator benchmarks, full build, Preview E2E and announcement acceptance.
- **Current product rule:** exactly one fastest-time route is displayed and priced only against its own geometry; base comparison is category I passenger car without transponder; unknown toll/price is not treated as free. M-4 uses a pre-priced symmetric span cell, with full PVP chain proof and two periods only.
- **DONE:** start catalogue of 22 tariff groups, limited offline fare samples and strict composer, some M3 PVP physical checks, saved Yandex controls, M-4 span lookup/compiler with empty real-price matrix, and 2026-10-12 tariff-model nomenclature.
- **IN PROGRESS / NOT COMPLETE:** legal completeness of the Russian toll-road list; current complete operator tables (notably conflicting M3 snapshots); nationwide selected-route toll-geometry coverage; per-operator adapters and current fare rows; same-route operator quote/receipt controls; latest-code E2E and green full build. A Vercel M-4 build at prior SHA failed in old timed-quote tests. Some V3 geometry fixes have not had a full user route E2E.
- **NEXT LARGE BLOCK:** reconcile the spec/handoff and assemble primary dated tariff sources, starting with the M3 conflict, then execute route evidence and tariff adapters system-by-system. Full priorities and accept criteria: nationwide `NEXT_STEPS.md` and plan.
- **Release boundary:** no Production or default-branch change in this work. A tested Preview is a gate; merge/Production/public announcement require a later explicit user decision after all claimed-scope checks pass.

---

## CURRENT 2026-10-11 — M-4 symmetric span tariff table clarified

- **LATEST PRODUCT RULE:** Map the selected fastest route's confirmed PVP chain to a continuous M-4 span bounded by first/last PVP. Price key is the canonical unordered endpoint pair; reverse direction reuses the same cell. Each span stores only Mon–Thu and Fri–Sun prices. Runtime picks one cell; no per-PVP sum and no exit/re-entry flow. Intermediate PVP chain verifies span. See latest decision in `experiments/toll-od-matrix/DECISIONS.md`.
- **SUPERSEDES:** earlier notes treating direction-specific ordered PVP sequences as separate fare keys. Evidence adapter remains useful, but matrix/compiler/quote tests must change to symmetric endpoint spans. Backlog order is updated in `experiments/toll-od-matrix/NEXT_STEPS.md`; audit addendum in `REASSESSMENT_2026-10-11.md`.
- **STATUS:** clarification/docs only; no runtime code, tests/build, route checks or deployment. The branch's matrix has zero price cells and its current V3 result still uses additive per-PVP money. Keep V2/Main/Production untouched.
- **Latest commits:** product decision `7110f3520075d617635473a0b9193d2fa061f0c5`; backlog `b14783625d859825a7fae68ebbbd93e3ea7e0185`; audit `f4964154bf53d624fe54c78fa0b387767107d70e`; log `f4f2f297afff360df684e306e1ce934b5feda6aa`.
- **NEXT:** redesign isolated matrix/compiler/tests around symmetric span endpoints; resolve reported fare/source differences; populate finite table; wire V3 sandbox exact lookup; verify both directions and gate span on same fastest geometry.

---

## CURRENT 2026-10-11 — reassessment: M-4 vector prices, sandbox only

- **DONE — design audit saved:** `experiments/toll-od-matrix/REASSESSMENT_2026-10-11.md`. The experimental exact ordered-PVP lookup and offline sum compiler align with the original concept, but the price matrix is empty and V3 still gets its displayed M-4 amount from the per-PVP additive path. Thus the algorithm exists as a partial isolated prototype, not a complete working tariff route.
- **CONFLICT TO RESOLVE:** saved rows yield `[1223,1184]` 850/1,160 ₽ and `[1223,1184,1093]` 1,000/1,430 ₽, while user-reported Yandex controls are 700/850 ₽ and 850/1,000 ₽. Do not seed either as a verified fare until same-date/profile/vector source is reconciled. Extra PVP 1046 requires its own geometry-confirmed vector and price.
- **SCOPE:** user says develop in separate sandbox and leave V2 untouched. This branch has a historic V2 diagnostic-shadow UI/API integration; review/remove or isolate it before reuse. No V2/Main/Production change was made in this review block.
- **Docs commits:** concept clarification `ab5533a1903a5bb4b5fe38c2be315ef4e8449935`; reassessment `4a38407cba54061aef3f8e071948167ac773f3ad`; reprioritized backlog `183f67633642285b770c13e09713e412856db370`; work-log audit `b0f142d2e59843bc30bb560de6e48c83b2eb7d36`. No tests/build/route recalculation/operator audit were run for these doc-only changes; earlier 165/165 does not cover them.
- **NEXT:** prove exact fastest-route PVP vectors for Sochi→Rostov, Sochi→Volnovakha, and longer control; reconcile official rows vs user/Yandex profile; populate vector cells, test unknown/extra-gate behavior, then replace V3 per-PVP money with vector lookup inside the sandbox. See `experiments/toll-od-matrix/NEXT_STEPS.md`.

---

## CURRENT 2026-10-11 — clarified M-4 PVP-vector tariffs

- **DONE — decision persisted:** fare for one continuous selected M-4 route is looked up by its complete ordered, geometry-confirmed PVP vector + calendar period; no general entry/exit interchange table or runtime sum of individual PVP amounts is needed for this product case. Decision in `experiments/toll-od-matrix/DECISIONS.md`; append-only record in `experiments/toll-od-matrix/WORK_LOG.md`.
- **USER-REPORTED references only (not independently tariff-verified):** `[1223,1184]` = 700 RUB Mon–Thu / 850 RUB Fri–Sun; `[1223,1184,1093]` = 850 / 1,000 RUB. If selected geometry continues across PVP 1046, use a separate exact vector and price cell. Missing or incomplete vector/cell => unknown/null, never a partial sum.
- **Scope/status:** docs only on `experiment/toll-od-matrix-2026-10-08`. Decision commit `ab5533a1903a5bb4b5fe38c2be315ef4e8449935`; work-log commit `d455da32027b9239c7190efbcd09a731287df525`. No runtime code/tariffs changed, no tests/build/route smoke/deployment run, Production untouched. Experimental M4 price matrix still has zero independently verified price cells.
- **NEXT:** implement vector-key lookup in the isolated experiment engine with two-/three-/four+ PVP, direction, period and unknown-cell regression cases; reconcile every user-provided vector price with a dated official tariff and same fastest-route geometry before any runtime cutover.

---

## CURRENT 2026-10-11 — профиль Яндекс-проверки и V3 fast-only Preview

- **ПРАВИЛО ПРОФИЛЯ ЗАКРЕПЛЕНО:** день недели/дата и ожидаемое время проезда; легковой автомобиль (категория I там, где совпадает с правилами оператора); основной тариф без транспондера и льгот; только заезд/съезд/направление выбранной быстрой геометрии Яндекса. Пользователю — единственный самый быстрый маршрут, без альтернатив. Подробности: `experiments/nationwide-tolls/DECISIONS.md`, журнал: `WORK_LOG.md`.
- **КОД FAST-ONLY РЕАЛИЗОВАН В ИЗОЛИРОВАННОМ V3 PREVIEW:** selector/UI выбирают и показывают один маршрут, тарификация вызывается по выбранному пути; V2 и Production остаются отдельными. Preview `https://mezhgorod-calculator-53y0sp8p5-4regodatbe-5310.vercel.app/v3`; deployment `dpl_27xe2AARTyLMRZswQBxdKoGvGPQF`, код SHA `62192398f343fcbf4a3c47f32c9585762c28839c`, READY; сборка скомпилирована, статические страницы 16/16. Страница отвечает HTTP 200.
- **ИСПРАВЛЕНИЕ ЗАПИСАНО В ВЕТКУ:** commit `53fda104234b491026116d833267c28afe0db53a` обновляет `route-leg.ts`: выбранный объект кандидата теперь источник routeGeometry и Valhalla evidence; названия Valhalla-кандидатов нормализуются для production M11/M12 tariff engines. Vercel build для последующей docs commit `43fadfb...` будет проверяться; кодовый SHA fix `53fda104...` сам по себе пока не отмечен как собранный.
- **ЦЕНЫ НЕ ЗАКРЫТЫ:** Yandex amounts остаются наблюдениями для того же профиля/геометрии, когда API показывает оценку. Чтобы утверждать операторский точный тариф, сопоставить ту же дату/время, класс I, без транспондера, направление и точные въезды/съезды с действующей официальной строкой тарифа/калькулятором или чеком. Разногласия и неизвестные сети перечислены в `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`; не переносить оценку на другой маршрут и не помечать unknown как 0.
- **Последняя запись правила:** решение commit `bf2427651e24e64f3ef51e4f834cbccf9176fa00`, work log commit `58c537d4d79eaceaf9a9f68288586500cfad1328`; code fix `53fda104234b491026116d833267c28afe0db53a`. Production не менялся.
- **NEXT:** дождаться Vercel deployment именно code SHA `53fda104...` (последующий Vercel Preview `dpl_8rqTVbayowCjjqma4xzj93RixE4w` строится с ветки после fix и docs commit; получить его git source SHA/logs, затем если сборка успешна); если сборка успешна — POST на `/api/v3/calculate` по контрольным OD, убедиться в одном результате и соответствии validation geometry; затем сверить выбранные тарифы с датированными операторскими правилами и актуальными Yandex route values. Production не выпускать до завершения проверок.

---

## CURRENT 2026-10-11 — Yandex route checks expanded

- **DONE — read-only route controls:** Yandex checks now include disputed alternatives Казань—Набережные Челны (~90/278 ₽) and СПб—Кронштадт (~600/300 ₽), plus long controls СПб—Москва (~6 150 ₽), Москва—Казань (~5 250 ₽), Москва↔Краснодар (~5 530/~5 260 ₽). Older M1/M3 checks remain documented. Exact observations, limitations and failed A-289 endpoint resolution are in `experiments/nationwide-tolls/RECONCILIATION_2026-10-11.md`.
- **INTERPRETATION:** these are route estimates for passenger car <2 m/no transponder; they do not certify per-gate tariffs or operator receipts. Route alternatives/direction deltas are unresolved checks, not billing corrections. A-289 not confirmed by the malformed endpoint. No all-network coverage claim.
- **DONE — docs persisted:** reconciliation appended and work log updated; latest audit commit `79b86c99654d072597c438e7027f4037cfb6ca47` (includes reconciliation, work log, next-step priority and this handoff). No code/tariff change. No tests/build/deploy run (docs-only research). Existing branch Preview remains on earlier source SHA; production untouched.
- **NEXT:** resolve each materially divergent route against exact selected geometry, dated operator tariffs and matching official trip calculator/receipt; expand targeted Yandex checks for open network groups listed in `NEXT_STEPS.md`. Never convert estimates directly to live prices.

---

## CURRENT 2026-10-11 — Yandex Maps fare controls observed

## M-4 symmetric span implementation checkpoint — 2026-10-12

- Sandbox branch: `experiment/toll-od-matrix-2026-10-08`; latest implementation commits: `032c6cca9ca6124a9abd88147c28837afa7bc2bb` (compiler now rejects any missing intermediate known PVP) and `3e12d7ede4299d7aeb4441a0b6f1372cea32759a` (regression test).
- New runtime span lookup/compiler/inventory/preview code uses one direction-independent endpoint pair and exactly two fare values (Mon–Thu, Fri–Sun). Runtime does not sum PVP rows. Matrix remains empty; no real tariff rows were inserted.
- Local Node test result: 4 focused new-schema suites pass (corridor, preview, inventory, compiler; compiler 15/15). This is not a full repository build.
- Vercel branch build at prior HEAD `739b586973827d744c48583f9299e2d8785c1640` failed in legacy timed-quote tests expecting the superseded `priceCells` and mixed-zone contract. This build issue remains open and must be fixed before calling the branch build green.
- V2/Main/Production were not modified or published. Real Yandex/official tariff verification and route-control E2E remain outstanding.


## Nationwide tariff-nomenclature checkpoint — 2026-10-12

- Added [`experiments/nationwide-tolls/TARIFF_NOMENCLATURE_2026-10-12.md`](../experiments/nationwide-tolls/TARIFF_NOMENCLATURE_2026-10-12.md), commit `9789fdfaa051eaf51cfcc0ccafdc91aa42afe596`. It maps the current 22 registry groups to tariff models, required exact-route inputs, official sources, and what can/cannot be considered a confirmed price. This is not yet a complete legal census or complete priced tariff database.
- Current official Avtodor tariff-page search excerpt surfaced newer M3 numbers than the archived snapshot: PVP 86 100/200 ₽, PVP 136 190/320 ₽, PVP 168 230/280 ₽ (Mon–Thu/Fri–Sun, category I no transponder as interpreted from table labels). Do not update runtime rows until primary document, column labels, effective date and Yandex same-route controls are reconciled.
- Nationwide operator sources expose materially different price structures: exact OD (ZSD, M11), per-section/free-flow (Mytishchi, Bagration), barrier PVP sequence (Khabarovsk), date/time windows (Kazan/MSD), exclusive corridors (Tolyatti/Udmurt) and cross-border eligibility (Amur). See nomenclature for all entries.
- No code pricing changes, tests, full build or deployment performed in this research/documentation block. Existing Yandex controls remain approximate route-level observations. No Production publication.
- Next concrete block: extract complete dated primary tariff files and reconcile the M3 conflict; then enter only supported per-operator rows and verify representative fastest-route controls in Yandex Maps. Full list and priorities in nationwide `NEXT_STEPS.md`.


## CURRENT 2026-10-12 — blocks 1–3 executed in sandbox

- **Canonical spec:** `experiments/nationwide-tolls/ALGORITHM_SPEC_2026-10-12.md` defines exactly one minimum-ETA route; price only that same route geometry; category I passenger car when operator classification matches; no transponder/privileges; tariff date and local passage-event time; complete evidence or unknown; distinct operator product models; M4 as full continuous PVP vector with a pre-entered symmetric price cell for Mon–Thu and Fri–Sun, no runtime per-PVP sum.
- **Scope:** `national-registry.json` retains 22 parent groups and now adds 16 child Avtodor tariff products (10 M4, 4 M11, 2 M3). Official source: https://russianhighways.ru/for_drivers/pay-sites.php . This is an expanded but partial inventory, not an exhaustive Russian legal census. Four Pskov roads remain unsplit.
- **Tariff audit:** M3 conflict is unresolved. Official tariff page is indexed but direct retrieval returned HTTP 403; snapshot/current indexed excerpt does not unambiguously establish effective date and class-I cash/no-transponder column. Existing rates were not overwritten. No new amount is marked verified.
- **Status:** block 1 specification complete (equal-ETA tie-break still needs code rule/tests); block 2 partial; block 3 partial/source audit only. Details: `IMPLEMENTATION_PLAN_2026-10-12.md`, `TARIFF_NOMENCLATURE_2026-10-12.md`, `WORK_LOG.md`, `NEXT_STEPS.md`.
- **Commits in this step:** `801750e` spec, `47ae694` registry, `2cec76e` decisions, `33f7c85` tariff nomenclature, `ad090b6` plan, `63789d2` work log, `4e2ba6b` next steps. Production/default branch untouched. Docs/registry-only work; JSON parsed before write; no tests, build or route E2E run.
- **Next:** obtain readable current primary tariff artifacts (starting M3), split Pskov into four separately sourced products, finish operator and legal object census. Proceed to blocks 4–6 after tariff/source coverage advances. Do not publish prices with unresolved sources.


## CURRENT 2026-10-12 — Yandex dated route tests blocked

- Prepared `experiments/nationwide-tolls/YANDEX_DATE_TEST_MATRIX_2026-10-12.md` for weekday Tue 2026-10-13 and weekend Sat 2026-10-17, with both dates/one local departure time, fastest-only, passenger car and route geometry/ETA/amount evidence capture. Matrix covers 16 detailed Avtodor products and selected route controls.
- No fresh Yandex route was calculated: Opera connector reports Browser not connected; TinyFish did not start due wallet balance -0.221166 USD (`wallet_out_of_funds`). No new UI observations, dates, sums, geometry or screenshots exist. Existing route estimates remain historic controls only; not marked as newly re-confirmed. No fare data/runtime changed.
- Next action: resume matrix via connected Opera Yandex Maps UI or TinyFish after wallet access is restored; record real output verbatim before marking any test. Do not claim the tests complete or seed fare cells until evidence is captured.
- Work log entry in `experiments/nationwide-tolls/WORK_LOG.md` dated 2026-10-12; matrix commit `a2bfaf4`, work log `67efc22`. Production unchanged.


