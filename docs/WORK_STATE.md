undefined

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


- **Toll follow-up:** run #86 verify job completed successfully (tests, TypeScript and Next build). The live-probe script now sends the final Donetsk—Moscow geometry from each routing provider through the same `calculateLegTolls` pricing pipeline as the API, and records weekday/weekend amounts, confidence, segments, and validation status. This is diagnostic output only; it does not assert toll status as free or priced. New run #87 will establish whether the changed route fixes the screenshot's toll discrepancy.
