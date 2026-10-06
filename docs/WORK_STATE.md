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
- CI run #103 (37262843595) для head перед merge завершился успешно: тесты, TypeScript, Next production build, live provider geometry/time, Photon и сравнение шести контрольных маршрутов.
- Vercel Preview commit 806a79032f2f079e873302b8bfa30debe7e17d70 READY: dpl_CCdsnJKsiEUp69XxS5SPEje4d5pi. SSR /v2 вернул HTTP 200 и содержал брендовый интерфейс, селектор периода и кнопки изменения тарифа.
- Стандартный Vercel Promote API ответил HTTP 422 Resource cannot be processed. Использован прямой alias API: production alias mezhgorod-calculator.vercel.app назначен deployment dpl_CCdsnJKsiEUp69XxS5SPEje4d5pi; ответ указал прежний deployment dpl_7ddWRHNaQhJKDDhLgKnbgCbSwg3p.
- После назначения production /v2 ответил HTTP 200 с новой страницей; в SSR подтверждены заголовок «из А в Б», 4 ставки со степперами, выбор Пн–Чт/Пт–Вс и обновлённая форма.
- Ограничение: runner для интерактивного мобильного браузера недоступен; production проверен серверным ответом и содержимым HTML, но жесты, live loading и реальная автопрокрутка не прогонялись end-to-end.
- В интерфейсе и тарифном движке не менялись расчётные ставки ради контрольных скриншотов. Разница toll-оценок по ранее зафиксированным маршрутам и проверка крымской альтернативы остаются отдельными продуктовыми ограничениями.
- Текущее состояние: PR #11 merged; production опубликован; пользователь должен проверить реальный мобильный интерфейс/маршрут. Следующее действие при найденной ошибке — зафиксировать конкретный экран/маршрут и исправить на рабочей ветке с новым PR; не переназначать production без запроса.


### 2026-10-05 — мобильная иерархия V2 по новым скриншотам

- PR #12, ветка `fix/v2-mobile-layout-2026-10-05`, head `fc5554d72134b70d862913496454c764824ca390`, остаётся открытым черновиком; production не менялся.
- По скриншотам исправлена зона верхней safe-area, удалены повторный верхний текст о меняющихся тарифах и верхний селектор дня. Выбор периода остаётся у карточки результата.
- Поля тарифа уплотнены; ₽/км стоит ближе к числу; стрелки увеличены, контрастнее и имеют сенсорную область 44×44 CSS px.
- В строках результата название тарифа выделено, «=» перенесено к отдельной строке «Итого за поездку». Карточка платных дорог стала компактнее; убрана фраза про легковой автомобиль, оставлена краткая оговорка о возможном изменении стоимости.
- Темная палитра получила более ясное разделение поверхностей и контрастные роли действий/предупреждений; измеренные пары текста/фона выше порога WCAG AA. Светлая палитра сохранена.
- **Проверки:** GitHub Actions run #104 прошёл: scripts tests, TypeScript no-emit, Next production build и live probes. Vercel Preview доступен; SSR /v2 содержит текущую шапку/форму/тарифы и изменения результата. Проверка HTML не доказывает реальную мобильную геометрию или интерактивность.
- Интерактивный браузерный прогон на телефоне не выполнялся. PR #12 оставить draft; следующий этап — визуально проверить на мобильном устройстве шапку под системной строкой, выбранные темы, степперы, wrapping итога и поведение карточек после расчёта. Не вливать и не переназначать production без отдельной просьбы.


### 2026-10-05 — корректировка тёмной темы и альтернативного маршрута

- **Проблема со скриншота:** тёмные поверхности выглядели как сплошной зелёно-синий фон; альтернативная карточка повторяла по каждой категории «платные дороги: сумма не подтверждена» и «не рассчитано», хотя базовая тарифная сумма известна.
- **Важное продуктовое ограничение:** отсутствие платных дорог нельзя считать подтверждённым по непроверенной геометрии. Сохраняем статус неизвестного и не выдаём расчёт по базовому тарифу за полный конечный итог.
- **UI-решение:** при неизвестной платности по каждой категории показывается короткая сумма «Итого без дорог», а под списком один раз написано, что возможная плата не включена. Убираются повторяющиеся технические сообщения, бессмысленный для неизвестной платности переключатель Пн–Чт/Пт–Вс и лишнее предупреждение о неполной проверке сегментов. Для подтверждённо бесплатного маршрута отображается итог без строки «+ 0 ₽»; платный маршрут сохраняет формулу и переключатель.
- **Компоновка:** сокращены отступы и padding результатов/карточки платных дорог, чтобы ниже было заметнее начало альтернативного маршрута. Вводные тарифы немного уплотнены, названия категорий чуть крупнее и с лёгким смещением вниз.
- **Цвет:** тёмные поверхности заменены нейтральным графитовым рядом, бирюзовый и коралловый остались небольшими акцентами для действия и дорог; ослаблен цветовой halo фона. Цель — убрать навязчивый зелёный оттенок, сохранив различие состояний и брендовые акценты.
- Добавлены unit-проверки отображения неизвестной, подтверждённо бесплатной и платной суммы. Прогон CI после commit запишет текущий результат; мобильный визуальный прогон остаётся нужен.
- PR #12 остаётся draft, production не меняется.


- **Результат follow-up (#107):** 2026-10-05 run #107 завершился success обоими jobs: scripts tests, TypeScript, Next build, live provider/Photon/six-route audit. Preview latest head `e69c726800c33619f4ae26c9e98ff40ead61e992` READY; protected SSR `/v2` вернул 200, stylesheet содержит новые графитовые токены и больше не содержит прежний зелёно-синий `#1C2B33`. В интерактивном браузере Vercel показал sign-in gate, поэтому mobile visual/E2E не выполнен. Production не менялся; PR #12 draft.


### 2026-10-05 — тарифные поля, загрузка и объезд пунктов оплаты

- **Новые требования со скриншотов:** компактнее карточки ставок; названия выровнять по верхней кнопке-стрелке, число и ₽/км — по нижней; текст увеличить на 1,5 px. Во время расчёта одновременно оставить заметными кнопку процесса и короткое сообщение о загрузке.
- **Уточнение правила альтернативы:** это не маршрут «только по бесплатным дорогам». Он должен по возможности использовать удобные платные магистрали и объезжать именно пункты взимания платы; например, оставаться на бесплатных отрезках М‑4 между пунктами. Это уточнение заменяет прежнее пользовательское упрощение «альтернативный маршрут всегда по бесплатной дороге».
- **Маршрутизация:** быстрый вариант Valhalla оставлен с `use_tolls=1`. Второй запрос тоже оставляет платные рёбра доступными, но задаёт высокий `toll_booth_penalty=43200`, чтобы поиск предпочитал объезды пунктов. Результат проверяется по `node.type=toll_booth`; наличие платного дорожного ребра само по себе альтернативу больше не дисквалифицирует. При полной проверке с найденным пунктом маршрут отбрасывается; при неполной проверке кандидат с ненаблюдавшимся пунктом может сохраниться как внутренне неподтверждённый.
- **Результат/копирование:** карточка альтернативы показывает короткое название, километры/время и четыре пары «тариф — сумма», без статуса платности, повторного «итого без дорог» и дорожных пояснений. Копирование включает короткие города, расстояние, время и четыре суммы. Вводные тарифы перестроены в две строки; степперы остались с мобильной областью нажатия 44 px; добавлено компактное сообщение «Подождите пару минут, пока загружается маршрут».
- **Проверки:** добавлены тесты для копирования краткого расчёта и для допустимого платного дорожного ребра без пункта, отбрасывания обнаруженного пункта и неполных данных. Полный CI, live probe и Preview после отправки изменений ожидают результата.
- **Ограничение:** штраф Valhalla — предпочтение, а не жёсткий запрет. Документация описывает его как средство создавать маршруты, которые стремятся избегать пунктов оплаты; сам факт нужно подтверждать по геометрии/map matching. При неполной проверке UI по решению пользователя не показывает техническую метку неопределённости.
- **Ветка:** PR #12 `fix/v2-mobile-layout-2026-10-05`, оставить открытым черновиком. Production не менять; публикацию пользователь не запрашивал.


### 2026-10-05 — подтверждённый объезд пунктов оплаты с участками М‑4

- **Уточнение пользователя:** альтернатива не обязана избегать всех платных дорожных рёбер. Она должна объезжать пункты оплаты; участок платной магистрали между пунктами допустим, если фактическая геометрия не проходит ни через один пункт.
- **Почему предыдущая проверка давала 12/12 отказов:** адаптер отправлял trace_attributes как GET с длинным query. Valhalla описывает trace_attributes как POST с JSON body. Переведено на POST; это восстановило map matching длинных геометрий. Официальная схема Valhalla показывает POST request body для /trace_attributes: https://github.com/valhalla/valhalla-docs/blob/master/map-matching/api-reference.md .
- **Защита от ложной карточки:** неподтверждённые кандидаты больше не сохраняются как candidate_unverified и не отправляются в API. Кандидат выдаётся только если trace завершил все части и не нашёл toll_booth узлов. Также кандидат должен отличаться от главного по порогам существующей политики, иначе дубликат скрывается. Это важно, потому что UI по решению пользователя не показывает технический статус неопределённости.
- **Генерация кандидатов:** маршрутизатор разрешает use_tolls=1. Кандидаты запрашиваются в порядке штрафов 900 сек., 1 200 сек., затем BRouter и резервный Valhalla 43 200 сек. Они проверяются по очереди; поиск останавливается на первом маршруте с полной проверкой без пунктов. Поэтому приоритет получает короткий объезд, а длинный остаётся резервом. Платное ребро само по себе маршрут не отбрасывает.
- **Live sweep Москва—Краснодар:** основной Valhalla 1 347,3 км / 1 071 мин. Штраф 900 сек. дал 1 524,5 км / 1 289 мин, но map match нашёл 407 toll edges и 4 пункта оплаты — кандидат отклонён. Штраф 1 200 сек. дал 1 631,2 км / 1 416 мин; полная проверка нашла 7 платных рёбер М‑4, 0 пунктов — кандидат принят. От 1 800 до 43 200 сек. маршрутизатор выдавал 1 649,1 км / 1 441 мин без платных рёбер и без пунктов. Это подтверждает на одном live route разрешённое сочетание платных участков и объезда пунктов; результат не обобщается на все маршруты.
- **Тесты:** проверены POST/JSON контракт, разрешение платного ребра без пункта, отклонение найденного пункта и неполного trace, запрет маршрута-дубликата и переход от кандидата с пунктом к подтверждённому кандидату с платным ребром. Основная платная оценка, суммы будни/выходные и тарифная формула не менялись.
- **CI:** run #129 (37356502753) на кодовом head 384c0691fcdb9e3c14ed4c77e313be854a098510 завершился успешно: тесты, TypeScript, next build, live provider geometry/timing, toll-point sweep, Photon и аудит шести скриншотных маршрутов.
- **Preview:** Vercel deployment dpl_3BUxQU4HDZpLDHxv2LAA6ah2Lmpg READY. Защищённый SSR fetch /v2 вернул HTTP 200 с калькулятором и обновлённым описанием альтернативы. Интерактивный мобильный браузерный тест остаётся недоступен за Vercel login gate.
- **Статус выпуска:** PR #12 остаётся open/draft; merge и production deployment/alias не выполнялись. Внешняя публикация не запрашивалась.

### 2026-10-05 — первый мобильный тест: форма двойного тарифа и Донецк—Москва

- **Проверка исходника:** PR #12 остаётся open/draft, ветка `fix/v2-mobile-layout-2026-10-05`, исходный head `dbd41783759807550a67d541db1c3fe662dbd456`. Production не менялся.
- **Наблюдения со скриншотов пользователя:** для Донецк—Москва калькулятор показывает 1 213,6 км / 16 ч 22 мин, платная дорога 4 680 ₽ Пн–Чт и 6 270 ₽ Пт–Вс. Яндекс показывает выбранный вариант около 1 210 км / 15 ч / 3 810 ₽ и альтернативу 1 237 км / 19 ч. Геометрии и точные условия оплаты Яндекса не предоставлены, поэтому нельзя считать 3 810 ₽ подтверждённой правильной суммой. Эти данные занесены отдельным follow-up наблюдением в `benchmarks/routes/yandex-2026-10-04/screenshot-observations.json`; CI route audit должен выдавать живую геометрию, провайдера и разложение платных систем для приблизительных координат Донецка и Москвы.
- **Отдельный тарифный риск, обнаруженный при сверке:** live-route regression по Москве—Краснодару всё ещё ожидает 6 090 ₽ будни / 8 400 ₽ выходные. Официальная новость «Автодора» об индексации с 02.03.2026 указывает для М‑4 Москва—Краснодар цену 5 040 ₽ Пн–Чт (https://avtodor-tr.ru/press-center/news/na-m-12-vostok-vvodyatsya-novye-abonementy-/). Это означает, что набор контрольных данных или состав маршрута/тарифа требует пересмотра; из одной общей цены пока нельзя корректно переписать постовые ставки либо установить причину расхождения. Проверять состав участка и тарификацию по первичным таблицам Автодора до изменения сумм.
- **UI-исправление в этом изменении:** обе группы двойных ставок обведены раздельными приглушёнными контурами; dual cards получили меньшие внутренние поля, а область кнопок 44×44 px сохранена. На узких экранах кнопка расчёта теперь закреплена внизу над системной safe-area, вместе с ней при загрузке отображается «Подождите пару минут…». В форме после результата панель скрывается, чтобы не перекрывать карточки. Идентификаторы полей двух групп тарифов разделены для корректных label/input связей.
- **Проверки:** CI, typecheck, build и live probe на новом commit ожидаются; ниже добавить конкретный workflow run и итог. Интерактивная браузерная проверка мобильного safe-area/scroll остаётся отдельной ручной проверкой.
- **Статус:** PR #12 остаётся черновиком; публикация/merge/production deployment не выполнялись.


### 2026-10-06 — приоритет названий поселений и выборочный аудит маршрутов

- Текущая ветка PR #12 проверена на head `d49e74ace2f6d46948c8c1b04496ffae9627dbe9`; PR открыт и остаётся draft. Workflow run #132 был отменён (оба job cancelled), поэтому это не кодовая ошибка и не успешная проверка; нужен новый прогон.
- Название региона не зашивается по списку населённых пунктов: для любого результата OSM place-поиска суффикс выбирается из координаты и геометрии ADM1/Крыма. Так новые малые поселения получают ту же маркировку без ручного обновления каталога. Если Photon не возвращает населённый пункт, интерфейс сам его создать не может — это остаётся ограничением внешнего геокодера.
- Исправляется порядок exact-совпадений: локалитеты пяти целевых территорий получают приоритет над российскими одноимёнными городами независимо от OSM-класса (село/хутор больше не проигрывает городу только из-за типа). Для Донецка закреплён порядок: координаты ДНР, затем Донецк Ростовской области, затем остальные совпадения.
- В подписи используется доступное имя `name:ru/name_ru`, если поставщик его отдаёт; добавлены типы place=`farm` и `isolated_dwelling`. Из выдачи удаляются теги станций, платформ, остановок и терминалов; обычные адреса и улицы не фильтруются.
- Запросы с приписками ДНР/ЛНР/Крым/названия области нормализуются для точного поиска. Классификация тарифа остаётся исключительно координатной.
- Добавлена live-проверка на 50 реальных geocoder-resolved локалитетах: seed `20261006`, по 10 из каждой зоны, по возможности 3 сельских/малых поселения в страте; один случайно выбранный пункт РФ; направление пары чередуется; Valhalla и OSRM сохраняют километры, время, разделение км по полигонам, тип поселения и расхождение провайдеров. JSON прикладывается к workflow artifact. Выборка строится из пула запросов и фильтруется по полигону; это не каталог всех поселений и не доказательство качества каждой записи OSM.
- Добавлены unit-регрессии на приоритет малых поселений, порядок Донецков, региональные квалификаторы, станции, фермы/изолированные dwellings и локализованное русское имя.
- Workflow #133 на первом head дал 82/85 tests; три address-search assertions падали: два старых ожидания ставили обычный/крымский namesake выше специального региона, а одна новая фикстура точки «Приморск» лежала вне полигона. Исправлено: области выше Крыма при совпадениях (ДНР/Ростовский Донецк имеют отдельный строгий порядок), тест Kharkiv проверяет возврат украинского alias без навязывания порядка против Крымского тезки, точку хуторной фикстуры перенёс в проверенную координату Донецка. Перезапустить весь CI/live audit на следующем head. PR оставить open/draft; merge и production не выполнять.

### 2026-10-06 — результат первого случайного геокодированного аудита

- Run #134: unit-тесты **85/85 passed**, TypeScript no-emit passed, Next build passed. Live geometry/alternative probes completed before the random test.
- Первый seeded audit (20261006) correctly refused to call itself complete: only **39** route pairs were resolved (DNR 10, LNR 10, Zaporizhzhia 10, Kherson 9, Crimea 0); job failed at the 10-per-area gate and uploaded its JSON artifact. Provider outcomes for attempted pairs: Valhalla **37** successful, OSRM **32**; one pair failed both provider checks. For shared successful routes some distances differed materially (e.g. 44.9 km); these are route-source differences recorded for review, not treated as geometry-split failure.
- Причина низкой выборки: resolver associated ranked suggestions back to raw Photon features using OSM IDs, and accepted only place=*; this was too brittle for area data that Photon returns as administrative locality features. It also queried Crimea through global/UA only. Переписано на прямую проверку каждой raw feature, принято точное administrative locality, добавлен RU query для Crimea, расширены candidate pools с малыми населёнными пунктами и diagnostics counters (features/place/admin/inside-area/accepted).
- Повторный random audit обязателен; до его результата нельзя утверждать, что получено 50 маршрутов. В артефакте первого запуска сохранены 39 маршрутов и счётчики доступности. Следующий CI/live результат добавить ниже.

### 2026-10-06 — второй live audit и снижение нагрузки на Photon

- Run #135 verify снова зелёный: **85/85 tests, TypeScript, Next build**.
- Расширенный resolver всё ещё не дал требуемые 50 пар: **28** доступны (ДНР 10, ЛНР 10, Запорожская область 8, Херсон 0, Крым 0). На этих парах OSRM вернул 28 маршрутов, Valhalla — 21. Artifact counters показывают, что Photon вернул 0 features для всех запросов Херсонской области и Крыма в этой части workflow, хотя отдельный Photon query smoke ранее успешно возвращал Yalta/Sevastopol. Результат не считается выполненным тестом.
- Диагноз изменён: прежний resolver отправлял 8–12 запросов одновременно и выполнял глобальный/UA/RU поиски для всех 145 candidate names; ошибки allSettled могли быть незаметны. Новый resolver делает последовательный fallback global → UA → RU, повторяет временные 429/503/сетевые ошибки, логирует request failures, а candidate names проверяет в seeded случайном порядке с ранней остановкой после 10 (с 3 сельскими, если доступны). Полные source counters идут в JSON.
- Повторить live audit обязательно: нужно получить реальные 10 точек в каждой из пяти зон и 50 маршрутов. Если Photon продолжит отдавать ноль по нескольким зонам, следующий шаг — сменить источник геокодирования в тесте либо использовать проверенную settlement dataset; нельзя подделывать точки и выдавать неполный пул за покрытие.


### 2026-10-06 — address-search and randomized route audit follow-up

- PR #12 was rechecked as open/draft; run #136 was green for verification (85 tests, TypeScript, Next build) and live probes. Its seeded route matrix resolved exactly 50 settlements: 10 each in DNR, LNR, Zaporizhzhia Oblast, Kherson Oblast, and Crimea. The random Russian endpoint was Azov. Photon produced 16/15/16/11/35 candidate place features respectively; only this live sample is covered, not every locality in the provider index.
- Route provider outcome: Valhalla 50/50, OSRM 47/50; three OSRM calls ended in fetch failed. Route distance partition checks passed for returned geometry (ordinary km + special km equals route length within 0.05 km). However, 24 pairs exceeded the audit warning threshold (>30 km or >5% inter-provider spread); extreme differences included 3603.1 km for Gulyaypilske and 2227.8 km for Kherson. These are not validated interchangeable routes, and the 50-pair run is a sample/diagnostic rather than evidence that all route options are correct.
- Live Photon search returned Donetsk DNR first and Rostov Oblast Donetsk second, but repeated the same Rostov locality in multiple cards. Query Донецкая область had no relevant oblast/special-region result in its first suggestions. Query Ялта also surfaced same-name localities inside DNR before Crimea; each suffix reflected its own coordinates, but ranking still deserves review.
- Updated photon-address-search to exclude place=municipality from selectable locality suggestions and collapse repeated rendered labels. Added a regression test. Tightened the random route audit to select only inhabited place=* classes, excluding administrative/community relations, and to include per-route provider distance deltas, a warning list and provider call failures in the artifact.
- Live payment-point avoidance probe confirmed the implementation can route partly on toll-tagged M-4 while avoiding mapped toll points: a fully traced candidate with 7 paid road edges and 0 toll booths passed; a separate route with 4 toll booths was rejected. This only confirms that one live Moscow–Krasnodar case follows that routing policy; real toll price accuracy remains a separate unresolved limitation.
- Source modifications were committed on the PR branch; a fresh workflow is required for the final source head. Keep PR open/draft and do not merge or deploy production.


### 2026-10-06 — результаты follow-up run #141 и ужесточение выборки

- Run #141 на head c52c96d подтвердил verify: 86 tests, TypeScript и Next build прошли. Исправленные выдача и random audit прошли live job.
- Дубли названия «Донецк, Ростовская область» исчезли: live выдача теперь ставит одну карточку «Донецк — ДНР» первой и одну карточку Ростовской области второй. Шумные повторные результаты больше не занимают слоты подсказок.
- Live выборка по прежнему seed содержит 50 поселений — по 10 из каждой зоны — и ни одной municipality/admin feature. Valhalla вернул 50 маршрутов; OSRM — 44. 25 межпровайдерских пар превысили 30 км или 5%; крупный выброс для Гуляйпильского остался 3 603,1 км. Из-за этого эти маршруты остаются диагностикой и не считаются подтверждёнными как правильные направления.
- Дополнительно найден дефект самого тестового resolver: Photon мог вернуть населённый объект, который не совпадает с запрошенным именем (например, для «Комсомольское» принял «Гуляйпільське»). Аудит теперь требует точного совпадения поля имени либо явного alias для русского/украинского написания; raw имя поставщика добавляется в артефакт. Отвергнутые геокодерные подсказки не считаются населёнными пунктами маршрута.
- Live search still не разрешил «Донецкая область» как запрос региона; «Ялта — ДНР» остаётся выше «Ялта — Крым» из-за общего приоритета населённых пунктов в пяти целевых территориях. Оба пункта остаются на проверку/решение ранжирования. Coordinate-derived suffixes сами по себе не подменяются.
- Run #142 (37432068925) на новом source head 3fb9601 queued; он должен проверить новый exact-name gate, тесты и сборку. После завершения добавить итог и проверить artifact: по 10 реальных совпадающих имён в каждой зоне, без административных районов и ложных результатов.
- PR #12 по-прежнему open/draft; production/merge не менялись.


### 2026-10-06 — regional search aliases and audited sample results

- Follow-up run #142 resolved exactly 50 named settlements (10 each in DNR, LNR, Zaporizhzhia, Kherson and Crimea), all checked against their polygons. The shared Russian endpoint was randomly selected as Tikhoretsk. Valhalla succeeded for 49/50 pairs and OSRM for 49/50; 20 pairs exceeded the diagnostic difference threshold (>30 km or >5%). The largest spread was 3,502.2 km for Kushugum. Two other provider calls failed. LNR's selected sample contained no rural places because only ten exact-name candidates were available.
- Those figures show provider disagreement, not route correctness. Do not treat the resulting route/price as confirmed until the route choice is independently checked. This matrix is a reproducible seeded sample, not proof that every settlement is searchable or routable.
- Photon live output in the earlier artifact confirmed “Донецк — ДНР” first and “Донецк, Ростовская область, Россия” second. However “Донецкая область” had no matching region card: the provider returned Ukrainian “Донецька область,” which did not match the Russian query after normalization.
- Added the existing explicit Ukrainian/Russian region aliases to the feature exact-name matcher. Added a regression for the Ukrainian “Донецька область” feature returned by a Russian query; the same matcher covers all four configured region aliases. Request URLs continue to ask Photon for Russian-language names.
- Run #148 verify passed but its live job failed because a literal \\n had accidentally been written between JavaScript statements in the live-search probe. Repaired the script and pushed it; it now records ranking diagnostics instead of aborting when a live provider result differs.
- Current code head `2983dea6f5b5c257ab87422e20c2e61f1c5e138d`: run #151 verify passed (87 tests, TypeScript, Next build). Its live probes are still in progress. Await that artifact before claiming regional alias behavior or refreshed route counts as live-confirmed.
- PR #12 remains open and draft. No merge or production deployment.


### 2026-10-06 — A0: повторная сверка GitHub, PR и live CI

- Проверен открытый [PR #12](https://github.com/4regodatbe-cpu/mezhgorod-calculator/pull/12): draft, head branch `fix/v2-mobile-layout-2026-10-05`, head SHA `49c10fcef0ebadeca0e2e97f564a435a36679fcc`; base `work/remove-v3-runtime-2026-10-02`. PR не слит; production deployment не выполнялся.
- Workflow run #153 (run ID `37435505636`) завершён `cancelled` в 08:46 UTC. Job `verify` прошёл: 87 тестов, TypeScript no-emit и Next build. Live job: provider geometry/time, payment-point avoidance и Photon search завершились успешно; seeded audit 50 населённых пунктов был отменён на шаге 9, Yandex route comparison пропущен. Артефакт и итог матрицы от этого run не подтверждены.
- Preview Vercel для SHA #153 отмечен Ready; это preview, не production.
- Исправлено устаревшее описание PR, которое ошибочно представляло матрицу как всё ещё выполняющуюся и приписывало run #153 завершённые результаты run #142. Исторические результаты #142 остаются диагностикой предыдущего SHA.
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
