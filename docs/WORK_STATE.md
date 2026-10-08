## Current handoff — experiment / 2026-10-08

- Отдельная ветка `experiment/toll-od-matrix-2026-10-08` создана на базе `64631d23dc7ca44febafb9ebf1136162c7af9e82`; в этой ветке скопированы 11 исходников М-4/М-11, создана диагностическая OD-матрица из двух подтверждённых прямых пар М-11 и fail-closed модуль `experiments/toll-od-matrix/engine.mjs`. Runtime V2, PR #12, main и Production не тронуты.
- Подтверждённое выполнение: 16/16 JS assertions на исходных функциях; `node --test`, lint, tsc, build и live проверки не запускались.
- Текущие ограничения и следующий шаг: см. `experiments/toll-od-matrix/README.md` и `WORK_LOG.md`. Сначала официальные направленные тарифные пары и географический детектор въездов М-4, потом интеграция.
- **Не публиковать эту ветку**: эксперимент пока не является готовым рабочим расчётом.

---

## Current handoff — 2026-10-08

- Repo: `4regodatbe-cpu/mezhgorod-calculator`, branch `fix/v2-mobile-layout-2026-10-05`; PR #12 remains open/draft and unmerged. Current branch source commit: `01cfe20f71879c9360e427d2d7aab8aecba0bccb`.
- **Design fix in PR preview:** Android/Chrome could algorithmically darken the manually selected light palette, producing dark surfaces with light-mode teal controls. The page now declares support for authored light/dark themes, opts out of Auto Dark while light is selected (`color-scheme: only light`), and keeps browser dark controls in the app's authored dark mode. Initial theme setup and the toggle use the same scheme.
- **Verification:** focused theme tests pass (including light-mode Auto Dark opt-out); `git diff --check` passes. Vercel Preview deployment `dpl_EG928Y6FfCEr4L2CEXPfb8jq4g2p` is READY; `/api/version` and `/v2` returned 200 for the exact source commit, and rendered HTML includes the expected metadata and pre-hydration theme scheme. GitHub Actions workflow run was not available for this commit; local full TypeScript/test/build commands are unavailable because dependencies are absent.
- **Release:** Production was not changed. Preview interactive UI is behind Vercel sign-in; only HTML/API response and remote build were verified. Current user instruction requires an explicit request before Production publication.
- **Workspace caution:** local checkout HEAD is stale and has unrelated dirty route/pricing edits. Do not reset or stage unrelated files. Continue from the remote branch head above.

---
---

## Prior handoff — 2026-10-07 13:36 MSK

- Repo: `/workspace/scratch/a4ecb4a8e44f/repo`, branch `fix/v2-mobile-layout-2026-10-05`. PR #12 remains open/draft; no merge performed. The latest application source commit `cd08bc7e79d0507e0d77d3d58212e1e253a79795` is in PR #12; Production deployment `dpl_4kVEexEXd13aTWhRoUPfLAiRvrcR` is READY at that source commit.
- Published-to-preview code at `aad7d32` includes the committed route/search/UI fixes. Vercel Preview `dpl_Gu8fS3TcWwaoZGxAU19myBDVKbx7` reached READY; `/v2`, `/api/suggest?q=Изюм`, `/api/suggest?q=Краснодар`, and the stylesheet returned HTTP 200. The live Izyum suggestions exposed that country tiering did not reliably push Russia ahead of Kazakhstan when Photon omitted the place subtype.
- New local fix in progress: apply Russia-vs-other-country priority to every exact namesake; keep the four special-territory boost limited to settlements/administrative results to avoid boosting unrelated POIs. Regression covers a subtype-missing Russian match vs a Kazakhstan city. Address search suite passes 35/35; TypeScript no-emit and `git diff --check` pass.
- Combined state before the latest two-file ranking adjustment: all 29 test files passed and targeted ESLint passed with one existing unused-variable warning at `lib/photon-address-search.ts:416`. Local Next production build is blocked by sandbox `EPERM` when it starts subprocesses; Vercel remote build is available and will be the build gate.
- Production was published directly from the verified Git source with target `production`; the separate preview promotion endpoint returned 422, so a production-target build was created instead. Live production `/v2` and both suggestion endpoints returned HTTP 200; Izyum results now start with Russian namesakes and Krasnodar is first. Do not merge PR #12.

---

Warning: truncated output (original token count: 29762)
Total output lines: 430

### 2026-10-04 — разбор расхождения Донецк—Москва по пользовательским скриншотам

- **Подтверждённое наблюдение:** калькулятор показывает 1 341,2 км и 18 ч 40 мин. На скриншоте Яндекс Карт показаны варианты 1 220 км / 14 ч 7 мин и 1 230 км / 17 ч 20 мин. Разница основного расстояния около 9,9%; по времени — около 32%. Калькулятор также показывает платную дорогу 5 130 ₽ в Пн–Чт и 7 040 ₽ Пт–Вс; Яндекс на скриншоте — около 3 810 ₽ на основном маршруте. Сравнение тарифов дорог предварительное, так как геометрии двух маршрутов могут различаться.
- **Подтверждённое в коде:** special-route plan для Донецка ранее закреплял путь через скрытые точки M-4 и EAST, а затем выбирал один provider result; координатная проверка запрещает проход материкового маршрута через Крым.
- **Рабочая гипотеза:** лишняя длина вызывается жёсткими M-4/EAST контрольными точками для обычного материкового маршрута. Скриншот и код согласуются с этой гипотезой, но точный вклад точек требует live-проверки.
- **Изменение в текущей правке:** материковому маршрутизатору даётся выбрать естественный путь между точками; геометрическая проверка по-прежнему исключает Крым. Крымский путь без изменений сохраняет контроль прохождения через мост и внутреннюю точку; поездки с концом в Крыму или из Крыма на материк сохраняют bridge → Krasnodar → M-4 controls.
- **Регрессия/живая проверка:** добавлены тесты порядка и состава контролей в обоих направлениях, live route-probe для Донецк—Москва с метрикой пользовательского скриншота 1 220 км. Результаты CI будут записаны после выполнения.
- **Статус:** Production не менялся. PR #10 остаётся draft. Перед публикацией нужно подтвердить live длины обоих маршрутизаторов и повторно оценить платную дорогу после стабилизации геометрии.


### 2026-10-04 — live-provider confirmation and route-selection correction

- **Live probe run #84** on the first detour-removal commit completed: Valhalla Donetsk—Moscow 1 213.6 km / 58 921 s (0.5% shorter than the 1 220 km Yandex screenshot route); OSRM 1 123.1 km / 58 334 s (7.9% shorter). After geometry-based timing rescan, the route split was verified for both providers. The distance spread is about 7.7%, beyond the 7% agreement threshold.
- **Confirmed second cause:** selectGeographicTerritoryOption chose the shorter-time candidate even when provider distances disagreed. In this live sample that selects OSRM, despite Valhalla matching the supplied Yandex distance far more closely. The generic route-quality selector instead marks this disagreement as a warning and keeps the primary Valhalla candidate.
- **Follow-up change:** special routes now use the shared provider-agreement selection, display route-quality warnings, and prefer the quality-selected provider among candidates with equivalent toll status. Existing preference for a priced route remains first. Added API assertions for warnings and plan controls.
- **CI run #84:** route-provider live probe succeeded and produced the measurements above. The verify job initially failed because two assertions encoded the old forced-waypoint behavior; they are being updated to assert direct mainland endpoint routing and continued Crimea rejection.
- **Unresolved:** live toll amount on the new Valhalla geometry has not yet been checked against Yandex’s ~3 810 ₽ screenshot value. Do not claim the toll discrepancy is resolved.
- **Status:** Production unchanged; PR #10 remains draft. Next: run full CI after test updates, inspect the updated Preview route and its toll card, then update the release decision.


- **Дополнение к run #85:** verify job снова завершился с ошибкой только в новом API-тесте: mock adapters не давали гарантированного расхождения, поэтому статус качества оказался `verified`, а тест жёстко ждал `warning`. Исправление переносит точную проверку 7,7% расхождения в модульный тест реальных метрик Valhalla/OSRM и оставляет API-тесту проверку наличия quality-информации. Live probe run #85 завершился success: Donetsk–Moscow Valhalla 1 213,6 км / 16 ч 22 мин (−0,5% к скриншоту Яндекса), OSRM 1 123,1 км / 16 ч 12 мин (−7,9%); оба маршрута прошли повторную проверку геометрии/времени, но расхождение провайдеров требует quality warning. Run #85 не проверяет live сумму платных дорог, поэтому отличие ~3 810 ₽ на скриншоте Яндекса от калькулятора пока открыто.


- **Toll follow-up:** run #86 verify job completed successfully (tests, TypeScript and Next build). The live-probe script now sends the final Donetsk—Moscow geometry from each routing provider through the same `calculateLegTolls` pricing pipeline as the API, and records weekday/weekend amounts, confidence, segments, and validation status. This is diagnostic output only; it does not assert toll status as free or priced. Live run #87 completed successfully: Valhalla returned a priced toll estimate of 4 640 ₽ weekdays / 6 200 ₽ weekends with M-4 matching; OSRM returned unknown because its route has an unresolved mixed-zone M-4 event and correctly suppressed the partial total. The screenshot's Yandex estimate is about 3 810 ₽, so the price mismatch is still open. Run #88 added plaza-level diagnostics and passed CI. Valhalla's 12 charged events sum to 4 640 ₽ weekdays / 6 200 ₽ weekends: km 71 (400/500), 133 (500/600), 228 (320/470), 322 (320/470), 339 (400/540), 416 (360/480), 515 (170/250), 545 (410/520), 620 (250/300), 636 (640/770), 803 (620/950), 911 (250/350). Evidence is exact-name/map matching at most plazas, operator-local for 515, route traversal for 803/911. No unresolved M-4 item on Valhalla. This confirms how the local engine composed its amount but does not establish that every charged plaza lies on the user's Yandex route or that the total matches the screenshot. Yandex's ~3 810 ₽ remains unreconciled; do not publish to Production yet. OSRM's mixed-zone 636 unresolved state remains unknown and hides any partial total as required.

- **Детализация toll-расхождения:** повторный probe будет сохранять по Valhalla M-4 подтверждённые ПВП с тарифами по каждому пункту и неразрешённые mixed-зоны. Это позволит проверить состав 4 640/6 200 ₽ по составляющим, не меняя production-логику до установления причины.


### 2026-10-04 — M-4 breakdown of the toll discrepancy

- **Run #88** on code head `63f70c3292ed323896aecffb95eea43a57c1f143`: tests, TypeScript, Next build, route-provider geometry/time probe, toll probe, and Photon address probe all passed.
- **Valhalla Donetsk—Moscow:** 1 213.6 km, 58 921 s; territory timing verified at 13 855 s inside special zones (23.5% of route time). The same API pricing function returns 4 640 ₽ Mon–Thu / 6 200 ₽ Fri–Sun with priced/matched status.
- The live toll diagnostic returns 12 M-4 plazas: 71, 133, 228, 322, 339, 416, 515, 545, 620, 636, 803, and 911 km. Plaza-level amounts sum exactly to the API result. Most evidence is exact-name/local map match; 803/911 are strict route-traversal matches; 515 uses operator-local evidence.
- **OSRM Donetsk—Moscow:** 1 123.1 km, 58 334 s; timing verified, but tariff remains unknown because the M-4 633–741 km mixed entry/exit zone cannot be priced without complete entry/exit context. API returns null toll amounts, not zero.
- **Selection/UI:** route-quality warning is propagated to `fast.quality`; `RouteCard` renders the warning. The quality selector picks Valhalla when distance spread is 7.7%; the geographic selector still prioritizes a confirmed priced route before unknown toll routes, matching policy.
- **Open:** The live Valhalla toll amount (4 640/6 200 ₽) does not match the user's Yandex screenshot estimate (~3 810 ₽). Plaza-level composition is known, but we have not established whether the difference is a route geometry mismatch, toll-section selection, or external estimate behavior. Do not claim the toll amount is resolved or publish this version to Production pending reconciliation.
- PR #10 remains open/draft; no merge or production alias change. This log is carried forward for the next chat.

### 2026-10-04 — Yandex route screenshot audit

- **Задача:** проверить шесть пользовательских снимков Яндекс.Карт и сохранить наблюдаемые расстояния, длительности и читаемые оценки платы как отдельный benchmark; не переносить их в runtime и не считать пустую/нечитаемую сумму подтверждением бесплатного маршрута.
- **Источник и ограничения:** снимки показывают карточки маршрутов, но не содержат пригодной для сравнения геометрии. Для живого прогона используются приблизительные центры городов из V2 autocomplete на дату проверки; это сравнение коридора и порядка величин, а не совпадения адресов или трасс.
- **Обнаруженный риск адресного поиска:** Russian query «Запорожье» не возвращал город Запорожье; «Харьков, Украина» ставил выше одноимённый пункт в Крыму. В benchmark заданы корректные украинские варианты «Запоріжжя» и «Харків»; это не скрывает проблему русскоязычного пользовательского ввода.
- **Проверки:** добавлен scripts/yandex-route-reference-audit.mjs, который запрашивает Valhalla и OSRM, проверяет предусмотренный routing corridor, фиксирует расхождение расстояния/времени и качество согласия провайдеров, затем вычисляет текущий статус toll-оценки. CI прикладывает неизменяемый отчёт как artifact; результат нужно оценивать только после workflow run.
- **Статус:** PR #10 остаётся draft и не слит; production не менялся.

### 2026-10-04 — результаты сравнения маршрутов Яндекса (run #90)

- **CI:** [run #90](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/37234155971) завершён успешно: тесты, TypeScript, Next.js build, прежний live probe, Photon probe и шесть новых маршрутов. Отчёт `yandex-route-reference-audit.json` приложен к artifact `special-territory-live-probe-37234155971`.
- **Результаты по геометрии/времени:** Запорожье—Омск: OSRM 4 048,8 км против 3 500 км (+15,7%), 58 ч 01 мин против 50 ч 53 мин; маршрут по политике идёт крымским коридором, но Valhalla не ответил. Белгород—Архангельск: 1 901 км против 1 890 (+0,6%), 27 ч 57 мин, что на 3 ч 25 мин дольше самого быстрого скриншота; платность неизвестна. Мурманск—Астрахань: 3 344 км, расстояние укладывается в диапазон Яндекса 3 300–3 400 (+1,3% к нижней границе); 46 ч 17 мин — на 3 ч 43 мин–5 ч 32 мин дольше вариантов Яндекса; платность неизвестна. Пермь—Махачкала: 2 478 км против самого короткого варианта 2 490 (−0,5%), 35 ч 21 мин — на 1 ч 11 мин дольше; платность неизвестна. Томск—пгт Черноморское: 4 732 км против 4 700 (+0,7%), 66 ч 41 мин против 65 ч 29 мин (+72 мин).
- **Маршрут без результата:** Сургут—Харьков: Valhalla недоступен; единственный ответ OSRM был исключён как проходящий через особую зону (`SPECIAL_TRANSIT_EXCLUDED`). Поскольку обе конечные точки обычные, исключение соответствует правилу продукта; отдельный допустимый альтернативный маршрут не получен.
- **Тарифное расхождение:** для OSRM маршрута Томск—Черноморское геометрия близка к первому варианту Яндекса, но модель вернула 3 303 ₽ на выходной (2 553 ₽ будни) против видимых ~2 180 ₽ Яндекса: разница выходного тарифа +1 123 ₽ / +51,5%. Это открытая ошибка/несогласованность тарифа, её нельзя считать разрешённой. Запорожье—Омск: 3 303 ₽ против ~2 940 ₽ (+12,3%), но расстояние и коридор маршрута не совпадают с карточкой Яндекса достаточно точно для вывода об ошибке суммы.
- **Достоверность сравнения:** Valhalla вернул `ROUTE_UNAVAILABLE` по всем шести парам; все численные сравнения опираются только на OSRM и приблизительные центры населённых пунктов из автодополнения. Скриншоты не содержат геометрии Яндекса, поэтому нельзя подтвердить идентичность трасс. Русские запросы «Запорожье» и «Харьков, Украина» по-прежнему имеют описанную выше проблему ранжирования; координатный probe её обошёл.
- **Корректировка отчёта:** в JSON поле `status` заменено на `routeStatus` и `timingVerification`, чтобы «время плеч проверено» не прочитывалось как подтверждение совпадения с маршрутом Яндекса.
- **Статус:** PR #10 остаётся draft; изменения на production не выкладывались.

### 2026-10-05 — исправление регионального поиска и разбор toll-компонентов

- **Подтверждённый поиск:** добавлены UA-алиасы для русских запросов «Запорожье» → «Запоріжжя» и «Харьков» → «Харків». Алиас извлекается из основной части адреса, поэтому работает и при уточнителе «, Украина». Добавлены unit-тесты на URL поиска и первое место соответствующего города; live Photon probe расширен обоими запросами.
- **Разбор 3 303 ₽ Томск—Черноморское:** 4 подтверждённых ПВП М-4 имеют выходные тарифы 770 + 270 + 470 + 690 = 2 200 ₽. Полный проход трёх рамок А-289 добавляет 555 + 278 + 270 = 1 103 ₽. Скриншот Яндекса ~2 180 ₽ близок к одному M-4 компоненту, но не подтверждает прохождение или непрохождение А-289.
- **Важно:** официальный тарифный сайт Автодора перечисляет два подхода к А-290: маршрут через А-289 и маршрут через дорожную сеть Краснодара/А-146. Поэтому вероятная причина расхождения — иной подход Яндекса или неполный учёт дорожных сборов; это гипотеза, так как скриншот не содержит геометрии. Компонентная разбивка добавлена в live audit report для подтверждения текущих фактически пересекаемых ПВП и рамок. Тарифы в runtime не менялись.
- **Проверки:** Run #91 до этой правки прошёл. Новый run после alias/diagnostic изменений ожидает выполнения; не объявлять live alias или component breakdown подтверждёнными до его артефакта.
- **Ссылки на первичный тариф:** https://avtodor-tr.ru/road/tariffs/ ; snapshot: data/tolls/2026-10-01-avtodor-other-roads-category1.json.
- **Статус:** PR #10 открыт как draft. Production не менялся.

- **Unit-test correction (run #92):** tests revealed the alias keys must use normalized Russian forms without soft signs (`запороже`, `харков`), because `normalize()` strips `ь`. Corrected the dictionary keys; rerunning CI on the follow-up commit. Run #92 verify failed before TypeScript/build because of these new alias tests. The live job was still in progress at the time of this entry.

### 2026-10-05 — confirmed toll composition and alias live checks

- **Run #92:** full live job succeeded and attached artifact, while verify failed only in the two new alias tests. The live result is retained as a record of the test's defect before correction.
- **Run #93:** tests, TypeScript, Next.js build, live route/provider probe, Photon probe and six-route toll audit all succeeded. Russian query «Запорожье» now returns the intended city first at 47.8507859, 35.1182867; «Харьков, Украина» returns Kharkiv city first at 49.9923181, 36.2310146. This validates the alias key normalization fix against live Photon.
- **Томск—Черноморское breakdown from run #93:** M-4 charges four confirmed plazas: 1 450 ₽ weekdays / 2 200 ₽ weekend; A-289 crosses all three frames and adds 1 103 ₽ on either schedule. Aggregate 2 553 ₽ weekday / 3 303 ₽ weekend. The screenshot ~2 180 ₽ is close to M-4 weekend alone, so the observed difference maps to the A-289 component (1 103 ₽), but the screenshot cannot establish whether Yandex's route uses A-289 or an alternative.
- **Primary source checked:** Автодор's tariff page confirms the A-289 charge rows and documents two routes to A-290: via A-289 or via Krasnodar street network/A-146. This supports, but does not prove, that the screenshot's route may use the latter. Avoid removing a route-crossed official frame from the calculator based only on a screenshot price.
- **Next diagnostic:** a separate OSRM route via the official A-146/A-290 approach through Novorossiysk, Anapa, and Temryuk was added for Tomsk—Черноморское. It is marked diagnostic-only and cannot enter the UI route candidate list. Compare its distance/time/tolls with Yandex cards to see whether the A-289 difference is caused by route choice.
- **Code changes:** alias map keys now use normalized forms without soft signs; unit tests and live queries cover Russian Zaporizhzhia/Kharkiv. Benchmark report now carries exact M-4/A-289 component detail and a controlled A-146 route experiment. No tariff runtime formula changed.
- **Status:** PR #10 remains draft; run #93 passed. Run #94 with the diagnostic A-146 route is pending; production was not changed.

### 2026-10-05 — Run #94 route experiment and tariff timezone fix

- **Run #94** passed tests, TypeScript, Next.js build, route/provider probes, live Photon probes, and the extended Yandex audit.
- **Diagnostic alternate:** controlled route via M-4 → Krasnodar → A-146 (Novorossiysk) → A-290 (Anapa/Temryuk) → bridge returned 4 854 km / 69 h 24 min and 2 200 ₽ tolls (M-4 only; no A-289 frame crossings). It is 154 km longer than the 4 700 km Yandex candidate and 1 h 46 min slower than the slowest visible Yandex candidate. It does not prove the Yandex route uses A-146; it only demonstrates how avoiding A-289 changes toll total.
- **Confirmed pricing defect:** run #94 occurred at 2026-10-04 21:35 UTC = 2026-10-05 00:35 in Moscow. The route audit still selected the Friday–Sunday M-4 amount 3 303 ₽, because M-4 and A-289 used host-local getDay() in the UTC Vercel host. M-4 and A-289 lie in the Moscow timezone; tariff weekday/weekend selection must use Europe/Moscow. M-11 schedule logic already uses Europe/Moscow.
- **Fix:** added a shared Moscow-time tariff-period helper and regression tests around the UTC/Moscow midnight boundary. This corrects departure-day selection for M-4/A-289. It does not yet estimate each toll-booth crossing time for multi-day routes; pricing still applies departure period to all toll components.
- **Toll discrepancy remains open:** A-146 experiment does not match Yandex route distance/time closely enough to explain the screenshot. Do not remove A-289 charges from the selected route without its geometry. The official A-289 page and category-I snapshot support the three frame amounts.
- **Status:** follow-up CI run #95 pending. PR #10 remains draft and production is unchanged.

### 2026-10-05 — Run #95 completed; current toll status

- **Run #95** on the current calculator logic passed: all scripts tests (including Moscow tariff-period boundaries and regional address aliases), TypeScript, Next.js production build, live route/provider probes, Photon search probe, and Yandex route/toll audit. Artifact: `special-territory-live-probe-37236978777`.
- **Confirmed correction:** at 2026-10-04 21:35 UTC / 2026-10-05 00:35 Moscow the M-4/A-289 tariff selector now treats departure as Monday. Tomsk—Черноморское current selected amount is 2 553 ₽ (weekday), with 3 303 ₽ weekend; this corrects the old UTC-host selection of weekend tariff on Monday Moscow time.
- **Component evidence unchanged:** four M-4 plazas sum 1 450 ₽ weekday / 2 200 ₽ weekend; A-289 frames 23/82/103 sum 1 103 ₽. The current OSRM path intersects all seven charge locations. No evidence supports dropping the A-289 amount from that path.
- **Alternative approach test:** A-146/A-290 diagnostic path gives 4 854 km / 69 h 24 min and 2 200 ₽ weekend (M-4 only); it is longer/slower than the visible Yandex route range. The 2 180 ₽ Yandex card remains unreconciled; screenshot geometry is unavailable, and Valhalla is still unavailable across the six sampled routes. No runtime toll amounts were calibrated to screenshot observations.
- **Remaining limitations:** toll rate period is selected from departure instant in the road's timezone, but long-route toll booths are not individually assigned their actual passage day/time. Route identity versus Yandex cannot be confirmed without map geometry or identical endpoint addresses. Sургут—Харьков still has no eligible route after special-transit exclusion.
- **Current status:** branch head before this log update: `d2ee8f4167cc221a1f1105fa47e017a0eb21975b`; PR #10 remains open/draft, not merged; production unchanged. This log update records the state for the next session.


### 2026-10-05 — публикация PR #10 на V2

- **Merge:** PR #10 отмечен готовым и слит squash-коммитом `ba23668df6be2991d8389a48b4376db4187b0d7f` в целевую ветку `work/remove-v3-runtime-2026-10-02`. Коммит ветки PR `2917229d2a52b1023af24ea32843bead1bf8d84f`; последний полный CI — run #95 на кодовой части перед docs-only записью, success.
- **Production deployment:** после merge Vercel собрал target commit `ba23668...` в READY deployment `dpl_7ddWRHNaQhJKDDhLgKnbgCbSwg3p`. Два вызова штатного promote API вернули HTTP 422 `Resource cannot be processed`; для публикации READY deployment production alias `mezhgorod-calculator.vercel.app` назначен через Vercel alias API. Предыдущий production deployment был `dpl_8kojrNGDFxbEWewrCxABJ2sV2cXM`.
- **Проверка после публикации:** alias присутствует в списке deployment; production `/v2` ответил HTTP 200 и вернул страницу «Калькулятор межгород». Это server-rendered smoke-check, не полное браузерное взаимодействие или повторный API route test.
- **Тарифные ограничения, оставшиеся открытыми:** скриншотная оценка Яндекса ~2 180 ₽ для Томск—Черноморское не согласована с расчётом 2 553 ₽ будни / 3 303 ₽ выходные; геометрии Яндекса нет, поэтому подтверждённый A-289 компонент не удалялся. Для многодневных маршрутов применяется тарифный период времени выезда, а не оценка времени прохождения каждого ПВП. Маршрут Сургут—Харьков остаётся без допустимого результата в живом тесте.
- **Дальше:** получить геометрию или точные адреса контрольных маршрутов с Яндекса, проверить полные участки/ПВП и выполнить интерактивный браузерный прогон; зафиксировать результаты отдельной записью. Публикация этого коммита не означает, что расхождение платных дорог разрешено.


### 2026-10-05 — интерфейс «из А в Б»: брендбук, карточки и расчёт

- **Сверка источника:** ветка GitHub work/remove-v3-runtime-2026-10-02 на e1ca92e302cf7bfbe188717a91da916abbf8e77c; PR #10 уже слит commit ba23668df6be2991d8389a48b4376db4187b0d7f. Vercel status на базовом commit — success. Прежнее указание о draft PR #10 устарело.
- **Брендбук:** использованы ранее найденные утверждённые токены: ivory #F7F4EE, navy #102A43, teal #0D5C63, mist #DDECF2, signal orange #FF6B35, deep orange #C94C20. Inter/system оставлен: семейство шрифта в найденном документе не было окончательно утверждено. Отдельного logo-файла в текущем репозитории нет; иконка машины не перерисовывалась, бренд в шапке набран как «из А в Б».
- **Сделано в V2:** окошко подсказок ограничено шириной поля и длинный текст обрезается; тарифный инпут показывает ₽/км рядом с числом и имеет доступные кнопки +0,50/−0,50 ₽/км; добавлено предупреждение об изменяемости тарифов и выбор Пн–Чт / Пт–Вс прямо в форме. Период по умолчанию берётся для текущего дня Europe/Moscow и общий для карточек/копирования.
- **Результаты/загрузка:** брендовая тёплая тема по умолчанию при сохранении пользовательского dark/light выбора; графически заметные loading-кнопка, анимация и статус; max-width V2 уменьшен до 3xl, карточки защищены min-width и раскладка узкая; после успешного ответа происходит прокрутка к результату с учётом prefers-reduced-motion. Основная карточка называется «Основной маршрут», видимый заголовок «По платной дороге» удалён, «Расчёт по сегментам» из UI убран. Описание тарифов стало построчным: база + выбранная плата дорог = итог.
- **Сохранность toll-правил:** неизвестная платность остаётся unknown и не получает ложное 0 ₽/итого; явно подтверждённый free передаётся отдельно как 0 ₽; ручная поправка суммы остаётся доступной и применяется к строкам и копированию только для той карточки, которой принадлежит. День ставки переключаемый, обе кнопки синхронизированы общей настройкой.
- **Копирование:** только короткие названия A/B, расстояние, время, выбранный период и четыре формулы тариф + дороги = итог; длинное описание плеч не копируется. Сумма итого рассчитывается из округлённых до рубля компонентов, чтобы сумма на экране сходилась с видимым уравнением.
- **Проверка:** добавлен scripts/v2-quote-presentation.test.ts; прямой запуск node scripts/v2-quote-presentation.test.ts — 6/6 passed (период МСК, сокращение подписей, будний/выходной расчёт, free/unknown, ручная сумма, видимое округлённое равенство). Полные тесты/TypeScript/Next build локально не выполнены: в текущем workspace нет clone/.git/node_modules. GitHub CI этого UI-коммита нужно проверить после открытия draft PR; браузерный Preview ещё не проверен.
- **Статус публикации:** изменения отправляются отдельной веткой и draft PR в интеграционную ветку. PR #10 не переоткрывается. Production не менялся.


### Проверка UI-ветки — 2026-10-05, CI и Preview

- PR #11: https://github.com/4regodatbe-cpu/mezhgorod-calculator/pull/11; открыт draft, head 4add192d4ed5fe32c56ad2e52a0899f20e8bbd77, base work/remove-v3-runtime-2026-10-02. Merge не выполнялся.
- GitHub Actions run #97 (37259520781) на этом code head завершился success: тестовый набор, tsc --noEmit, next build, live route-provider/Photon/Yandex-audit job — все шаги успешны.
- Vercel Preview deployment READY: https://mezhgorod-calculator-bp9rlxgmq-4regodatbe-5310.vercel.app/v2. Vercel protected URL fetch вернул HTTP 200; SSR markup содержит brand label «из А в Б», tariff stepper aria-labels и updated period selectors. Это server-rendered smoke-check, не интерактивный/визуальный прогон.
- Интерактивный браузерный runner в текущем workspace отсутствует; agent-browser/chromium бинарей нет. Не проверены визуально точные размеры на мобильном устройстве, выбор подсказки реальным жестом, загрузка/автопрокрутка во время live запроса.
- Production не затронут. До merge остаётся провести интерактивную проверку Preview в мобильном браузере и просмотреть итоговые суммы на маршрутах с priced/free/unknown статусами.


### 2026-10-05 — согласованность ручной суммы платных дорог

- Повторно просмотрен поток priced/unknown с пользовательской ручной правкой. Найдена несогласованная подпись: при неизвестной провайдеру платности форма могла посчитать итог с введённой человеком суммой, но подсказка всё ещё говорила, что итог не рассчитан.
- Исправление в V2: строка явно помечает сумму «вручную»; предупреждение объясняет, что ручной ввод не подтверждён провайдером; clipboard также сохраняет эту оговорку. Если суммы нет, итог остаётся неизвестен. Тарифная оценка провайдера и классификация маршрута не меняются.
- Это уточнение добавлено после полного CI run #97. Docs-only CI run #98 проверял базовый UI head, но в момент записи ещё выполнялся live_probe; финальный code follow-up запускает свой run отдельно.
- Production не менялся; PR #11 draft.


### Исправление CI-синтаксиса follow-up — 2026-10-05

- GitHub run #87 (37262360068) завершился failure на шаге production build; run #99 (37262364268) выявил ту же ошибку на tsc. Ошибка находится в новой строке clipboard-helper после ручной подписи unknown toll: вместо переноса строки в коммит попали литеральные символы backslash+n.
- Исправлено: литеральная последовательность заменена настоящим переводом строки. До ошибки route-quality tests, pricing regressions и benchmark integrity в run #87 прошли.
- Для исправленного commit запущен новый CI; результат записать после его завершения. Ошибка не связана с расчётом тарифов или данными маршрутов.
- Preview соответствующего commit временно был ERROR из-за того же build parse failure; проверка требуется после успешной пересборки.


### 2026-10-05 — завершение проверки интерфейса и актуализация API smoke-контракта

- **Проверка актуального UI-коммита:** GitHub Actions run #100 (37262493974) на `dd051c9f9c24b9db1e533c4fad360d14e8fa9b4b` завершился успешно. Job verify: весь набор тестов, TypeScript noEmit и Next production build прошли. Job live_probe: геометрия/время провайдеров, Photon и аудит шести маршрутов завершились успешно.
- **Отдельный сигнал:** run #88 упал только на API contract smoke: ожидал HTTP 400 для запроса dual без via, получил HTTP 200. Исходник API не требует via; это соответствует уже принятому решению убрать обязательное поле промежуточной точки. Ошибка в smoke-контракте, а не в runtime.
- **Исправление:** commit `47eadabb6837ed3af608fa24d96edec004fca2bf` меняет контракт на проверку «dual mode accepts omitted midpoint» и ожидаемый статус 200. Код расчёта API не менялся. CI для нового коммита нужно дождаться; данный запрос до этого CI не объявлять закрытым.
- **Готовность интерфейса:** предыдущий UI commit имеет READY Preview https://mezhgorod-calculator-3wj96t3ya-4regodatbe-5310.vercel.app/v2, HTTP 200 и SSR markup с новой шапкой, выбором периода и степперами тарифов. Интерактивный мобильный браузерный прогон остаётся недоступен в этом окружении; точную визуальную ширину, жесты подсказок и прокрутку после реального расчёта в браузере не подтверждали.
- **Ограничения продукта:** крымская альтернатива для реальных маршрутов не подтверждается этой UI-работой; живое прохождение правила её допуска по текущей упрощённой зоне нужно проверять отдельно. Оценки платных дорог по пользовательским скриншотам и route identity также остаются с ранее записанными ограничениями.
- **Статус:** PR #11 остаётся open/draft, merge не выполнялся; production deployment не менялся.


### 2026-10-05 — публикация брендового интерфейса V2

- PR #11 (feat/v2-brand-ui-2026-10-05) слит squash; merge commit: d47076d24ca2faad57f8e5d5c3512e470e2e0d35. Ветка назначения: work/remove-v3-runtime-2026-10-02.
- CI run #103 (37262843595) для head перед merge завершился успешно: тесты, TypeScript, Next production build, …9762 tokens truncated…льтаты run #142. Исторические результаты #142 остаются диагностикой предыдущего SHA.
- Доступный рабочий каталог в этой сессии не содержит checkout проекта; сверка и правки выполнены GitHub-интеграцией непосредственно в PR-ветке.
- **Следующий шаг:** повторно запустить полный workflow после документационных правок и изучить live artifacts/причины отмены. Затем начать A1 — покрытие поселений, ранжирование и провайдеры; отдельно зафиксировать измеримые лимиты Photon.
- **Подтверждённые оставшиеся риски:** Photon не доказывает полноту каталога; межпровайдерские расхождения велики; toll pricing и геометрия для отдельных benchmark маршрутов открыты. Run #153 не закрывает A6 матрицу.


### 2026-10-06 — follow-up A0/A1/A5: live artifact diagnosis and alternative cards

- Current head before this documentation update: `fd28837faaf6a48024a975c19801d5046a6ece85`; PR #12 remains draft/open and no production deploy or merge was made.
- Runs #154 (`37443721189`), #155 (`37445722866`) and #156 (`37445845048`) all passed `verify` (tests, TypeScript, Next build). Their live audit step failed after collecting diagnostics; this is not a full successful release gate. Run #156 used the increased 60-minute timeout.
- Artifacts #154 and #156 report Photon HTTP 400 for all provider requests: #156 made 325 attempts (66 DNR, 40 LNR, 50 Zaporizhzhia, 64 Kherson, 105 Crimea), returned 0 features, resolved 0/50 settlements, and consequently produced 0 route comparisons. The Yandex comparison was skipped. This isolates A1/A6 as blocked at provider response, not empty search results or a confirmed zero-coverage dataset. The provider response body is not currently preserved, so exact HTTP 400 cause remains unknown.
- In run #154 artifact, the independent fixed address probe likewise had 0 results for all 10 city/region queries; both global and country-filtered searches rejected. Earlier statement that the alias ordering was live-confirmed must be treated as historical to its earlier artifact, not re-confirmed by these runs.
- A5 change in commit `df80430e570f9b82de7d2304dbe0469881647a5d`: on special-territory results, primary route retains the detailed `RouteCard`; secondary options use `AlternativeRouteCard` and fare-only clipboard copy, omitting unsupported toll detail. Run #155 verify passed.
- CI live job repeatedly used to exceed/cancel at the old 25-minute timeout; changed it to 60 minutes in `fd28837faaf6a48024a975c19801d5046a6ece85`. The latest run still ended with audit failure from the Photon responses, rather than timeout.
- Browser visual QA remains unconfirmed: Vercel preview authentication led to a Google credential prompt; user declined password entry, so no authenticated preview was opened. No visual/mobile pass is claimed.
- Next: preserve Photon HTTP response status/body in diagnostics, verify whether request construction or upstream policy causes 400 with a minimal query, then choose a working geocoder/fallback based on evidence before rerunning the seeded 50-place audit. Keep release blocked until geocoding, routes, unresolved toll comparisons and preview QA are addressed.


### 2026-10-06 — A1 root cause/fix, A6 seeded audit, A2/A3 triage

- **Current code head at audit:** `6af8f2e4d3c6fad8278ca1059e5c15754828187a`; run #162 (`37452856442`) verify and full live job both succeeded. Verify passed 87 tests, TypeScript no-emit and Next build; live provider geometry, payment-point avoidance, address probe, 50-route audit and seven Yandex screenshot comparisons all completed.
- **Photon root cause confirmed from #160 artifact:** the hosted Photon service rejected `lang=ru` with HTTP 400, explicitly listing accepted languages `default, de, en, fr`. Removed unsupported language parameter from app and live audit URLs; changed retry behavior to fail fast on 4xx and retain a short response-body diagnostic. Added URL regression asserting the default language. Run #161 (`ca204bd9f1fed59f34f281d34e76b58ea49a41b0`) verify/live jobs passed; all 10 fixed address queries returned features with 0 failed sources. Донецк ranked “Донецк — ДНР” first and Ростовский Донецк second; Макеевка DNR match present.
- **A1 ranking refinement:** live query “Донецкая область” initially showed a partial locality “Донецкая” ahead of the exact oblast. Tightened prefix matching so partial locality names are not considered exact for a region query; added a regression test. In run #162 live output exact “Донецкая область” is now first. The four other region queries/city aliases also returned results. A Crimea-name ranking case (“Ялта” first showed a DNR namesake) remains a potential policy decision to review against the product’s locality ranking rule.
- **A6 seeded audit, seed 20261006:** selected exactly 10 in-polygon settlements from each of DNR, LNR, Zaporizhzhia, Kherson and Crimea (50 total). Valhalla routed 49/50; OSRM 47/50; 20 of 50 pairs exceeded 30 km or 5%. Provider failures: 4. Largest distance gap remained Kushugum—Tikhoretsk: Valhalla 4,481.2 km vs OSRM 979 km (3,502.2 km / 78.2%); territory-distance composition suggests an unexpected DNR/LNR excursion on the Valhalla route, but per-leg route geometry was not retained, so exact cause is unproven. This is a successful audit run, not a route-correctness pass.
- **A2:** live territory timing geometry probes passed after route rescan. However route comparison remains open: Valhalla and OSRM disagree on 20 sampled pairs; investigate per-leg distance/control passage for Kushugum, and other flagged outliers, before accepting a selected distance. Do not substitute a provider automatically without validating path geometry.
- **A3 seven Yandex screenshot checks:** only OSRM returned for six of seven routes; both providers returned for Donetsk—Moscow. Zaporizhzhia—Omsk OSRM 4,048.8 km vs screenshot ~3,500 (+15.7%), toll 2,553/3,303 ₽ vs screenshot ~2,940 ₽; Murmansk—Astrakhan distance close (3,344.3 vs 3,400 km, −1.6%) but duration +332 min and toll remains unknown vs screenshot paid amounts; Surgut—Kharkiv had no route (Valhalla unavailable, OSRM rejected special-territory transit); Perm—Makhachkala 2,478.4 vs 2,790 km (−11.2%), toll unknown; Belgorod—Arkhangelsk 1,901 vs 1,890 km (+0.6%) but +205 min; Tomsk—Chernomorskoe 4,732.3 vs 4,700 km (+0.7%), toll 2,553/3,303 ₽; Donetsk—Moscow Valhalla 1,214.4 km (+0.4%) / 982 min (+82) / 4,640/6,200 ₽ vs screenshot 1,210 km / 900 min / ~3,810 ₽. Toll/route composition remains unreconciled.
- **A5:** special-endpoint alternatives render as fare-only `AlternativeRouteCard` (code commit `df80430e570f9b82de7d2304dbe0469881647a5d`); primary route still includes detailed toll. Verify passed. Browser preview visual QA remains unconfirmed because protected preview authentication required credentials that the user declined to enter.
- **Status:** PR #12 remains open/draft; no merge or production deployment. A4 session settings and A7 versioned API handoff are not yet audited. Do not mark overall release-ready until outlier routes, toll benchmarks, A4/API review, and preview QA are closed.


### 2026-10-06 — A2 first-leg outlier pinpointed; A3 tariff source checked

- Run #164 (`37454871357`) on code head `1d171066608b94aa6d23867f9c622d0d6e57bea5` passed verify and live jobs. It adds control-leg distance/duration diagnostics to every seeded route pair. Run #163 also passed, but overlapped the same live providers; its output is superseded by the instrumented #164 artifact for A2.
- Kuschugum—Tikhoretsk (Crimea corridor) outlier is now isolated to control leg 0, Кушугум → Crimea interior. Valhalla reports 3,842.5 km / 3,058 min for that one leg, followed by 246.1 / 240.2 / 152.5 km. OSRM reports 362.5 / 246.2 / 217.6 / 152.7 km for the same four plan legs. The second–fourth legs agree closely; essentially the entire 3,502.2 km total gap occurs on leg 0. The outputs pass endpoint/control checks, so current validation does not reject the anomalously long but control-following leg. This proves where the outlier occurs, while the provider-side route graph cause remains unresolved.
- In the concurrent #164 run, Valhalla succeeded 49/50 and OSRM 34/50; 18 pairs were over the 30 km or 5% diagnostic threshold. OSRM availability was materially lower than run #162 (47/50), so live provider capacity/results vary; do not call failed fetches valid no-route evidence.
- **A3 official rate evidence:** the state-owned Avtodor highway company’s announcement effective 02.03.2026 lists Moscow—Krasnodar M-4 for passenger cars at 5,040 ₽ Monday–Thursday and 6,090 ₽ Friday–Sunday, before optional T-pass discount: https://russianhighways.ru/press/news/141463/ . This is the complete M-4 route figure, not a substitute for tolling Donetsk—Moscow or a different geometry. The #162 engine’s Donetsk—Moscow composition remains 4,640/6,200 ₽; screenshot ~3,810 ₽. Compare identical route section and individual toll plazas before altering rates. The source confirms the 2026 full-route baseline; it does not resolve the screenshot mismatch.
- PR #12 remains open/draft. No merge, production deployment, or visual preview sign-off. A2/A3 outlier pricing still open; A4 and A7 remain unreviewed.


### 2026-10-06 — A2 control-leg guard and A4 stale-quote correction

- Run #171 (commit `fd92e3a6f162c119431c3fc52e01aa44bfa70a06`) completed successfully: 90 tests, TypeScript, Next build, live provider probes, address search, seeded 50-place audit, and screenshot-route comparison.
- The seed picked 50 in-polygon settlements (10 per area). Valhalla returned 48 routes; OSRM returned 49. The previous Kushugum—Tikhoretsk outlier is now safely rejected for Valhalla with `ROUTING_PLAN_LEG_STRETCH_1_16.5X`; the remaining OSRM route is 979 km. The raw Valhalla diagnostic still shows 4,481.2 km, with 3,842.5 km on the Kushugum→Crimea-interior control leg. The guard marks the surviving result with a warning in the API; the abnormal provider path remains an external routing issue, while its distance no longer silently enters the selected answer.
- One other Valhalla route, Kherson, also exceeded the 10× control-leg stretch threshold (16.4×) and was rejected. There are still 20 provider-distance disagreements above the existing 30 km/5% diagnostic threshold, so broader A2 route agreement remains open. The audit records 1 transient OSRM fetch failure; successful workflow completion does not imply every provider responded.
- A4 code review found that changing the urgency toggle or urgency percentage left an old result visible even though the multiplier had changed. Both controls now clear the result and abort an in-flight calculation, matching the existing address/rate invalidation behavior. Run #172 will verify this change.
- A5 visual browser QA still has no screenshot sign-off. The protected Vercel preview requires credentials the user declined to enter; no login or access-control bypass was used. Use an independent local/CI-rendered QA path if visual evidence is needed.
- A3 still has unresolved route/toll screenshot mismatches. A6 is not release-ready while these discrepancies and route disagreements remain. A7 contract/handoff is intentionally pending the A6 gate; no portal integration is authorized by this status.
- PR #12 remains open/draft. No merge or production deployment.


### 2026-10-06 — итог runs #172–#173 и следующий порядок закрытия блокеров

- Runs #172 (commit `2b8607303d04715e1f11ff5827407433d5c971e3`) и #173 (head `70873ef87aca285fb333bf00fb9fc18aef8c9bcb`) прошли verify и полный live workflow. В verify прошли 90 тестов, TypeScript и Next build. Артефакты #173: `special-territory-live-probe-37460946070` и связанные JSON отчёты.
- **A2:** seeded matrix — 50 поселений; Valhalla 48/50, OSRM 48/50; 19 межпровайдерских расхождений выше порога. Максимум: Донецк—Тихорецк 86,2 км / 18,7%; далее Токмак 64,6 км / 7,2%, Чулаківка 59,2 км / 6,6%. Две Valhalla геометрии (Кушугум 16,5×; Херсон 16,4×) отклонены проверкой контрольного плеча; два OSRM `fetch failed` — это сбой доступности, а не доказательство отсутствия дороги. Не усреднять расстояния провайдеров; для каждого конфликта надо сравнить контрольные точки/геометрию и сохранять предупреждение, а для временных ошибок — повторять один раз с ограничением по времени.
- **A1:** в live autocomplete запрос «Ялта» ставит «Ялта — ДНР» выше «Ялта — Крым». Результаты имеют точные совпадения, но для голого запроса порядок семантически плох. Следующий фикс: общий exact-name ранг с приоритетом крупного/канонического населённого пункта; региональный qualifier сохраняет первое место за явно указанной зоной. Зафиксировать оба поведения тестами и повторить Photon live probe.
- **A3:** run #173 подтвердил непогашенные отличия на семи Yandex-сравнениях. Запорожье—Омск: +15,7% по длине и 2 553/3 303 ₽ против ~2 940 ₽; Пермь—Махачкала: −11,2% и unknown toll; Мурманск—Астрахань: −1,6% по длине, +332 минуты, unknown toll; Томск—Черноморское: +0,7%, +72 минуты и 2 553/3 303 ₽ против ~2 180 ₽; Донецк—Москва: Valhalla +0,4% по длине, +82 минуты и 4 640/6 200 ₽ против ~3 810 ₽, OSRM −7,2%. Скриншоты не дают геометрии и точной даты тарифа, поэтому сравнение не подтверждает, что совпадают участки.
- **A3 предлагаемое закрытие:** получить для этих эталонов выбранный путь/ссылку с геометрией, дату поездки и вариант маршрута; если геометрии нет — сравнивать только грубый коридор, не менять цены по одному скриншоту. Повторно построить тарифный breakdown на одной и той же геометрии; сверить каждый ПВП/рамку, направление, класс ТС, будний/выходной тариф, транспондер и дату действия с первичными опубликованными тарифами. Не заменять сумму hardcode-итогом. Для полного маршрута М-4 Москва—Краснодар официальный baseline не равен тарифу конкретного участка Донецк—Москва.
- В Moscow—Krasnodar альтернативе штраф 900 с дал кандидат 1 524,5 км с 4 ПВП и был правильно отклонён; при 1 200 с кандидат 1 631,2 км с 7 платными дорожными рёбрами и 0 ПВП прошёл проверку. Это подтверждает механизм на этой паре, не на всех направлениях.
- **A4:** изменение срочности теперь сбрасывает старую цену/результат и отменяет активный запрос. Verify обоих прогонов #172–#173 прошёл; отдельный live расчет не нужен для проверки client-side invalidation.
- **A5:** preview-auth не использовался. Следующий независимый путь к визуальным evidence — локальный/CI Playwright прогон без Vercel preview: снимки mobile/desktop до расчёта, после результата, для загрузки и ошибки; затем проверить геометрию карточек и доступность текста. Пока это план, визуального sign-off нет.
- **A6/A7:** release gate остаётся закрыт из-за 19 расхождений и неотлаженных toll-сравнений. Не готовить integration API как стабильный контракт до решения A6; после него контракт должен фиксировать schema, версию, unknown toll (amount=null), владельца тарифов, ошибки и fixtures.
- PR #12 открыт/draft; production не менялся. Следующий конкретный блок: исправить ranking «Ялта», добавить regression-тесты и отдельный live check; затем адресно triage top-A2 расхождений и выполнить геометрически идентичное A3 сравнение.


### 2026-10-06 — Приоритеты алгоритма: качество в пределах текущих провайдеров

- **Решение продукта:** собственный маршрутный сервер и новая инфраструктура сейчас не разрабатываются. Продолжаем на существующих Valhalla, OSRM, BRouter, Photon и текущей тарифной базе.
- **Критерий качества:** допускаются небольшие отклонения расчётного времени, отдельных расстояний и сумм платных дорог. Недопустимы системные ошибки: маршрут через запрещённую зону, аномально растянутый контрольный сегмент, выбор явно неисправного ответа без предупреждения, частичный/неподтверждённый toll как 0 ₽, устаревшая цена после изменения параметров.
- **Изменение алгоритма, commit `78bf6b439187b908e849c7c21eb070745ec462ff`:** в обычном расчёте теперь явно выявляется и записывается причина отклонения чрезмерно длинного контрольного плеча; если остаётся другой допустимый кандидат, расчёт использует его и ставит quality warning с провайдером/коэффициентом. До этого `followsPlan` уже исключал такой маршрут, но причина не попадала в качество результата для обычной поездки.
- **Оптимизация, commit `8dbe01a47377ad757e8a42d5653ce57eff9d184c`:** Valhalla full-detour запрос со штрафом 43 200 секунд больше не запускается одновременно с каждым обычным маршрутом. Сначала параллельно проверяются основной маршрут, локальный объезд 900 с, частичный объезд 1 200 с, OSRM и BRouter. Полный объезд строится только если быстрые кандидаты не смогли пройти полную проверку отсутствия ПВП. Это убирает один дорогой запрос из критического пути успешного сценария; сокращение wall-clock ещё нужно замерить на одинаковой выборке.
- **Проверки:** run #179 verify прошёл после guard+регрессии; run #180 verify прошёл на текущем HEAD (90 тестов, TypeScript no-emit и Next build). Live job #180 на момент записи ещё выполняется.
- **Live evidence #177 (предыдущий HEAD):** Photon подтвердил все три проверки Ялты: голая «Ялта» → Крым, «Ялта ДНР» → ДНР, «Ялта Крым» → Крым. Seeded matrix записал диагностический артефакт, но шаг завершился ошибкой: после поиска всех 20 имён ЛНР найдены только 8 поселений из требуемых 10. Поэтому #177 не является полным успешным маршрутным gate; это нестабильность геокодерного набора/выборки, не доказательство ошибки маршрутизатора. Фиксированный benchmark-набор координат нужен отдельно от живого Photon-поиска.
- **Следующие этапы:** (1) сделать детерминированный контрольный набор пар и реальных поездок, не зависящий от доступности Photon на каждом прогоне; (2) измерить задержку расчёта по каждому провайдеру и этапам проверки, сравнить обычный сценарий до/после ленивого full-detour; (3) разбирать top-A2 расхождения по геометрии и плечам; (4) держать toll-расхождения отдельной точностью, обновляя только подтверждённые тарифные элементы.
- PR #12 остаётся open/draft; merge и production deployment не выполнялись.



### 2026-10-06 — Детерминированный контрольный набор маршрутов

- Из успешного live audit #181 сохранены 50 разрешённых Photon населённых пунктов с точными координатами и контрольная точка Тихорецк. Новый файл `data/settlement-route-benchmark-20261006.json` хранит дату, seed, run/artifact provenance и точки; runtime приложения его не использует.
- `scripts/settlement-random-route-audit.mjs` теперь гоняет одинаковые 50 пар Valhalla/OSRM по снимку координат. Photon больше не может остановить route audit из-за случайного неполного списка; адресный поиск остаётся отдельным live smoke test. Workflow step переименован соответственно.
- Первый run #184 выявил пропущенный helper `mapLimit` после выделения геокодинга; исправлено в коммите `af235e23590b81d96f9799c0271edc7e714e79e1`. В run #185 (`37491779623`) verify и полный live job прошли, включая новый фиксированный 50-route audit и семь сравнений скриншотов. Артефакт: `special-territory-live-probe-37491779623`.
- #185: Valhalla 48/50, OSRM 49/50; 19 пар выше диагностического порога 30 км или 5%. Две ошибки провайдера — Valhalla stretched-leg отклонения Кушугума и Херсона; один оставшийся отказ — OSRM/provider failure. Это измерение качества провайдеров, не gate абсолютной точности.
- Первая адресная диагностика #185: крупнейший разрыв Донецк—Тихорецк (Донецк—ДНР): 460,2 против 374,0 км, 86,2 км / 18,7%. Valhalla относит 116,4 км маршрута к ЛНР, OSRM — 0 км; оба маршрута проходят одну и ту же mainland-план-схему. Это указывает на разную выбранную геометрию/коридор, но само по себе не доказывает, какой путь правильный. Следом стоит сохранить/сравнить геометрию двух кандидатов и проверить контрольные точки до принятия маршрута.
- Ещё крупные отличия: Керчь—Тихорецк 42,1 км / 9,2%; Сорокино—Тихорецк 32 км / 9,1%; Марковка—Тихорецк 38,5 км / 7,4%; Токмак—Тихорецк 64,6 км / 7,2%. Для Токмака основная доля видимого расхождения находится на участке Краснодарский край—Крымский переход (Valhalla 258,7 против OSRM 216,7 км), а не на заключительном участке до города.
- Preview обновлён для кода `af235e23590b81d96f9799c0271edc7e714e79e1`, состояние Vercel READY: https://mezhgorod-calculator-5sedqk2yr-4regodatbe-5310.vercel.app . Обычная SSO-защита Vercel действует. Новые изменения не мерджены и не опубликованы на production.
- Следующее: зафиксировать A2 геометрию/лег breakdown на топовых расхождениях и определить системные invalid-path условия; отдельно не менять toll rates по несовпадению без одинакового маршрута и подтверждённой ставки.


### 2026-10-06 — Геометрия пяти крупнейших провайдерских расхождений

- В audit добавлено сохранение полных координат Valhalla/OSRM для пяти крупнейших расхождений (только диагностический workflow artifact); остальные маршруты остаются компактными. Это нужно для проверки формы пути, когда километры отличаются.
- Run #188 (37493261424) завершился success по verify и всему live workflow: фиксированная матрица 50 пар, пять geometry diagnostics и семь сравнений с Yandex скриншотами. Verify, TypeScript и Next build прошли. Artifact: special-territory-live-probe-37493261424.
- #188: 50 координат, Valhalla 48/50, OSRM 48/50; 19 пар с расхождением >30 км или >5%.
- Сравнение разреженных координат топовых геометрий (приближённая локальная проекция, ближайшие точки; не полноценное дорожное расстояние): Донецк—Тихорецк существенно расходится по форме — медианное расстояние между выборками точек 19,3 км, только 36,9% в пределах 10 км. Керчь—Тихорецк, напротив, совпадает по коридору: медиана 0 км, 92,8% точек в пределах 10 км, но суммарная длина отличается на 42,1 км. Токмак—Тихорецк тоже идёт почти по общей форме (86,3% в пределах 1 км), хотя разница длины 64,6 км. Следовательно, одна универсальная «выбрать меньшую/большую длину» правка неверна: разные выбросы требуют разных обработок, а Керчь/Токмак прежде всего требуют контроля длины конкретных плеч.
- В диагностике не найдено оснований менять live route selector или тарифы автоматически. Новый код только сохраняет геометрию в artifact и не меняет пассажирский ответ.
- Preview для кода 90c1bab9e48d51882a9ddd5895eee7562add2bbb READY: https://mezhgorod-calculator-9ju3i4978-4regodatbe-5310.vercel.app . Доступ по обычному Vercel SSO. PR #12 остаётся open/draft; merge/production не выполнялись.
- Следующий технический шаг: анализировать top route shapes по corridor/плечам, выяснить, где геометрия ломает требование маршрута; отдельно измерить latency после lazy full-detour на фиксированном наборе.


### 2026-10-06 — Wikipedia locality lists and Yalta–Volnovakha live audit

- The user proposed using the Russian Wikipedia regional settlement lists and checking Ukrainian spellings. Reviewed the four articles. They list urban/rural localities by raion; rural counts are Donetsk 1,118, Luhansk 787, Zaporizhzhia 918, Kherson 658. These are name inventories, not coordinate sources; indicated rural population data cites the 2001 census and lists include duplicate homonyms across districts. Source articles: https://ru.wikipedia.org/wiki/Населённые_пункты_Донецкой_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Луганской_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Запорожской_области ; https://ru.wikipedia.org/wiki/Населённые_пункты_Херсонской_области .
- User code updated: Wikipedia name corpus has not yet been imported. Safe next implementation is a versioned search-only name list with RU/UA aliases plus live geocoder coordinates checked against boundary polygons; must not treat article names or administrative claims as coordinates/territory.
- CI run #199 (37505598437) on head 259fb7a1bba7868a59afae243fec5b114d30fd1c succeeded: 93 tests, TypeScript, Next build; full live probe and fixed 50-place audit succeeded. Artifact: special-territory-live-probe-37505598437.
- Yalta–Volnovakha comparison: screenshot approx 991 km / 2,060 ₽ Mon–Thu / 2,533 ₽ Fri–Sun. Valhalla produced 1,067.7 km, OSRM 1,053.1 km on the same mainland corridor (respectively +7.7% / +6.3%); both route times verified across the 5 control legs, and both outputs follow the planned Crimea bridge/Krasnodar/Rostov/Mariupol corridor. Route geometry was not compared to Yandex, so shorter screenshot mileage remains unexplained.
- Both providers' toll calculation returned 2,103 ₽ weekday and 2,533 ₽ weekend. Weekend matches; weekday is +43 ₽. Breakdown includes M-4 plaza segments plus three A-289 ramp sections (270 + 278 + 555), so inspect the M-4 segment/plaza count and weekday tariff against screenshot before adjusting any rate. Do not hardcode route total.
- Live Photon checks: Yalta now correctly puts “Ялта — ДНР” before “Ялта — Крым”; explicit “Ялта Крым” remains available. “Изюм” returns Izyum in Kharkiv oblast first among candidates, but no result in target polygons was found; Kazakhstan homonyms still appear in top 8. This confirms regional bbox searches alone do not ensure every small/poorly indexed locality will be geocoded.
- Next: import/normalize complete ru-wiki tables for the four oblasts as versioned search vocabulary, add Ukrainian-name counterpart checks where present, and probe exact name + region phrase against Photon. Still require coordinate match inside the target polygon before assigning special area label/ranking. If a name isn't geocoded, leave unresolved instead of fabricating coordinates. Then rerun tests/live search and inspect Yalta toll plaza details.
- PR #12 remains open/draft; no merge or Production deploy.


### 2026-10-06 — RuWiki-only locality search vocabulary

- The user specified that the calculator's new settlement-name data must come only from RuWiki; no Wikipedia data is used in this index.
- Added `data/ruwiki-settlement-index.json`, built from the four RuWiki PDF exports supplied in chat. It contains 2,110 deduplicated area/name groups and source-page URLs. Parenthesized alternatives are separated and retained as search aliases.
- Photon search now expands an entered RuWiki alias to its listed counterpart and sends a bounded search to that counterpart's matching priority-area polygon. Existing live geocoder coordinates and the verified boundary geometry remain the only sources for route endpoints and territory classification; the index contains no coordinates.
- Coverage is explicitly partial where the PDFs do not expose all rows: the Luhansk export has 818 extracted rows against the article's 933 urban-plus-rural summary; Kherson has 755 extracted rows against 757; Zaporizhzhia has 947 rows across legacy district groupings whose scope does not reconcile with the article's current summary; the Donetsk export has the 52 city rows, while its 131 urban-type rows are collapsed and rural settlements are absent. These discrepancies are stored in the index metadata and no completeness claim is made.
- The exports provide parenthesized alternatives inconsistently; they do not provide a complete Ukrainian-spelling column for all settlements. The search code uses only listed alternatives and does not invent coordinates or transliterations.
- The earlier historical work-log entry describing a Wikipedia-source plan is superseded for the address-search dataset. No entries from that work were copied into the RuWiki index.
- Added address-search regression coverage for alias expansion, territorial bounding-box targeting, and display of the listed name. Verify and live search CI are pending on this commit. PR #12 remains open/draft; no merge or Production deployment was performed.


- **CI correction:** verify run #37517080978 on the first RuWiki-index commit failed at module loading because Node 24 requires JSON import attributes. No address-search assertion ran in that file; 63 other tests passed. Added `with { type: "json" }` to the index import and pushed a follow-up commit; the rerun is the validation gate.


### 2026-10-07 — Payment-point alternative and six-point hardening

- Updated `routeDifferenceEvidence`: the payment-point-avoiding option now needs at least 10 km/1% distance savings or 15 minutes/5% time savings. A route that is longer and slower is no longer misclassified as a useful alternative. This also corrects toll fallback evidence, which shared the same helper.
- Kept the user-confirmed payment-point rule: toll-tagged road edges remain allowed only when a complete geometry trace confirms zero toll-booth nodes. Regression tests cover an allowed toll edge with a verified booth bypass, a booth, an incomplete trace, and a candidate with no benefit (which skips map matching).
- Added Yalta–Volnovakha corridor assertions in both directions. Existing policy continues to route via the bridge/Krasnodar/M-4 control sequence; no corridor selector behavior was changed.
- Strengthened production boundary checks for exact four-area IDs, sourced URLs, nonempty geometry, and representative coordinates. Added RuWiki index guardrails: its four source URLs must all be ru.ruwiki.ru, the index must remain a 2,000+ row name-only list, and entries must not contain fabricated coordinates. The existing Ukrainian spellings and priority tiers remain covered by address-search tests.
- Targeted local checks passed: 33 address search, 9 payment-point/toll fallback, 5 boundary, 10 route policy, 4 route-pricing integration tests; systemic toll composition and route-corridor policy scripts also passed. `git diff --check` passed.
- At the subsequent full-suite run, 28/29 test files passed; the remaining API test could not load `next` because dependencies are absent. `pnpm install --frozen-lockfile` could not download packages because network access is denied; the offline attempt lacked the required package metadata. TypeScript/build and live provider checks are therefore not claimed as run.
- Toll amount discrepancy on Yalta–Volnovakha remains for route-geometry reconciliation: screenshot is ~2,060 ₽ weekday / 2,533 ₽ weekend; app estimate is 2,103/2,533 ₽. No amount was hardcoded or changed without matching Yandex geometry/plaza evidence. RuWiki list completeness and missing Ukrainian counterpart spellings also remain bounded by the supplied exports; no additional RuWiki fetch was available in this run.
- Changes are local on PR branch `fix/v2-mobile-layout-2026-10-05`; no production deploy or merge.

### 2026-10-07 — Further no-new-data improvements

- Review found the prior detour filter conflated “better” with “useful”: a payment-point bypass can legitimately be longer/slower yet remain within a reasonable guardrail. Replaced the savings-only gate with explicit upper bounds of 25% extra distance and 50% extra time; candidates outside either bound are rejected before map matching. The thresholds are implementation guardrails, not values calibrated against route ground truth. The 43,200-second full-detour fallback remains enabled when quick candidates fail, since evidence does not justify skipping it.
- Renamed the internal truth state to `confirmed_payment_point_avoiding` so a route with paid-tagged edges but no payment booths is not represented internally as toll-free. Such candidates now carry a quality warning if tagged edges exist; the user’s booth-bypass rule remains intact.
- Added M-4 component breakdown fields: stable item ID, km marker, direction (`unknown` unless route context proves it), entry/exit markers for mixed sections, weekday/weekend tariff and selected amount. Audit/live-probe JSON now records these fields. This makes same-plaza deduplication and the Donetsk–Moscow sum auditable without changing route prices.
- Added corridor regressions for Yalta paired with Volnovakha, Tokmak, Berdyansk and Kherson, in both directions, using the current geographic-zone rule. This locks current policy; it does not establish that every corridor preference is the user’s final intended one.
- Tests passed after these changes: full route-settlement-specific suites (address search 33, toll alternative 10, boundaries 5, policy 10, M-4 breakdown 1), plus pricing integration, systemic composition, strict M-4 traversal and other-road tariff/evidence checks. Full test runner still has one unavailable `next` package import. No tsc executable or local dependency installation is available; build/typecheck/live providers not run.
- Current branch `fix/v2-mobile-layout-2026-10-05`, based on prior local commit `8350649`; this block is uncommitted until final review. PR #12 push remains blocked by missing GitHub credentials in the environment; no production actions.


### 2026-10-07 — M-4 Москва—Краснодар: исправление полной цены

- Пользовательское правило выпуска: каждое завершённое изменение сразу публиковать в production после проверок; обновлять ветку PR и журнал состояния в том же блоке. Это решение действует для следующих изменений тоже.
- Причина завышения: production суммировал цены отдельных ПВП и mixed-зон по всему коридору, хотя для полного маршрута Москва—Краснодар опубликована единая контрольная стоимость 5 040 ₽ Пн–Чт / 6 090 ₽ Пт–Вс. Старый пользовательский regression ошибочно закреплял 6 090 / 8 400 ₽.
- Исправление: если полная проверка M-4 подтвердила маршрут от северного пункта 62/71 км до 1223 км и не менее восьми ПВП по пути, применять полный маршрутный тариф из `lib/toll-data/full-routes.ts`; локальную разбивку оставить в диагностике. Частичные маршруты этот override не получают.
- Источник суммы: сообщение Госкомпании «Российские автомобильные дороги» от 02.03.2026; страница указывает обе цены для М-4 Москва—Краснодар: https://russianhighways.ru/press/news/141463/ .
- Добавлены проверки для обоих направлений, буднего и выходного периода, а также защита от применения полного тарифа к частичному маршруту. Пользовательский live regression обновлён для Краснодар—Москва.
- Фокусные и полный локальный тесты: 30/30 прошли; `tsc --noEmit --incremental false` и `git diff --check` прошли. GitHub run #212 verify на коммите `b6220a3a52c23df2f566bb3526a03deb703211ef` прошёл полные тесты, TypeScript и Next build. Production deployment `dpl_GSnRXDXUF7QyXArkEZHHbFrbV9fS` READY на этом коммите; `/v2` и `/api/version` отвечают HTTP 200, версия API подтверждает production commit. Отдельный POST-прогон полного route API из этой среды не выполнялся; live-probe workflow #212 ещё выполняется.

### 2026-10-07 — M-4 toll charging requires paid-edge evidence

- Reproduced the Volnovakha–Moscow mismatch against the saved Donetsk–Moscow audit: the calculator charged 4,640 ₽ weekdays / 6,200 ₽ weekends from 13 M-4 plaza/section records; the saved Yandex screenshot shows about 3,810 ₽ for the selected route. The Volnovakha screenshot shows the same calculator pricing pattern (4,680/6,270 ₽), but no matched Yandex geometry is available to claim an exact target fare.
- Root cause in the algorithm: a `toll_booth` node match was accepted even when Valhalla marked its traversed edge `toll: false`. Also, when Valhalla matching failed, strict geometric proximity/straight-through evidence could independently confirm and price a booth without proving the route crossed its paid edge. Both paths could charge a free bypass or slip road.
- Changed M-4 confirmation to require `edge.toll === true`; explicitly free matched booth edges are rejected, and missing toll metadata stays unknown. Removed geometric-only confirmation as a charge source. Added a second defensive `edgeToll` filter in the pricing engine.
- Added deterministic tests for paid, free-bypass, missing-edge-evidence, geometry-only, and no-node near-miss cases, including a route total proving a free second plaza cannot inflate a paid first plaza. Extended live probe to inspect Volnovakha–Moscow and expose per-plaza statuses and `edgeToll` evidence for both south-to-Moscow pairs.
- CI run #215 passed the full test suite, TypeScript, and Next build on commit `dc0f8637dbeba98019f290cbf4a78e3a7a546b52`. Its live probe completed the provider geometry/per-leg-time step; later unrelated checks and artifact upload are still running, so the post-fix route diagnostic file is not yet available.
- The paid-edge fix and near-miss refinement are deployed to Production as `dpl_APHxyqimAyzi1kcYEizAL5sefxKx` (READY); `/v2` and `/api/version` returned HTTP 200 and the API reports the expected commit. The earlier revision `069531b634917bd8f455b291a57ed99058f999ad` is superseded. PR #12 remains open and unmerged.
