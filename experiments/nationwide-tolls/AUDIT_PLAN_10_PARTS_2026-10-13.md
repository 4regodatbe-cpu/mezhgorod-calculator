# Аудит V3: 10 сопоставимых частей

Запрос пользователя 13.10.2026: полный аудит расчётов, логики и кода; исправлять найденное, выполнять частями. Каждый блок включает чтение цепочки, воспроизведение проблем, исправления, регрессию и запись ограничений. Это сопоставимые области работы, не обещание одинакового времени.

| № | Область | Критерий завершения |
|---|---|---|
| 1 | Исходное состояние, воспроизводимость и входной контракт API | Зафиксировать локальный/удалённый код; воспроизвести общий gate; ошибочные даты отклонять до внешнего запроса |
| 2 | Выбор fastest и целостность геометрии | Выбор по ETA, стабильные равенства, evidence только выбранного провайдера; регрессии |
| 3 | А-289: короткие поездки и пары съездов | Ялта/Анапа/Тамань/Темрюк/Славянск в обе стороны; порядок рамок; отсутствие подмены тарифа названием города |
| 4 | М-4 и составной южный коридор | Полный/частичный вектор, пропущенный ПВП, А-289 и обход без потерь/двойного счёта |
| 5 | М-11, М-12, ЦКАД | Правильный OD/версия/провайдер; стыки дорог и неполное покрытие |
| 6 | М-1, М-3, региональные дороги | Карта реального покрытия; готовые цены подключены при достаточной геометрии, пробелы явно обозначены |
| 7 | Время и версии | Праздники, часовые пояса, полночь в пути, начало/конец действия без смешения календарей операторов |
| 8 | Коммерческая цена | Особые зоны, обычные/двойные ставки, наценки, округление и некорректные километры |
| 9 | UI и устойчивость | Итог/копирование согласованы; сброс устаревшего результата, отмена/таймауты/кеш, ошибки провайдера |
| 10 | Сквозная проверка и оптимизация | Общая регрессия/сборка, замеры узких мест, реальные контрольные поездки где доступно; честный итог открытых ограничений |

## Часть 1 — выполнено локально

Восстановлена копия `integration/matrix-estimates-2026-10-13`, исходный HEAD `8556e578901b24223a634c05c808791c12c52b0d`. Рабочее дерево исходно чистое. GitHub API подтвердил удалённую `experiment/toll-od-matrix-2026-10-08` на `d0dc2227d75862c58b1fc880c96a9440049ceef7`: локальный аудит 8556e57 ещё не опубликован. Открытые PR проверены; PR экспериментальной ветки среди открытых не найден, #12 относится к V2 и не используется как цель.

Прочитаны AGENTS, WORK_STATE, README, DECISIONS, NEXT_STEPS, журнал и предыдущий аудит. Базовый gate повторно дал 458/458 тестов и дополнительные quote/API contracts. Это проверка сохранённого задела, не новые 458 исправлений.

Новая ошибка: `new Date` в V3 API нормализовал невозможные календарные даты и принимал неоднозначные форматы/время без зоны. Исправление в `app/api/v3/calculate/route.ts`: строгая календарная проверка, ISO-дата либо ISO timestamp с явной зоной, запрет 24:00. Существующий UI отправляет ISO UTC и совместим. Дата без времени сохранена для совместимости (семантика UTC как прежде); политика времени проезда относится к части 7.

В `scripts/v3-api-audit.test.ts` добавлены отрицательные API проверки с нулём внешних запросов и положительные проверки високосного дня/ISO даты/UTC. После правки общий gate: 460/460 и quote/API contracts PASS. Политика предварительных тарифов не менялась. Реальные маршруты и браузер не проверялись в части 1.

Следующая работа: часть 2 — `lib/v3-calculation/route-leg.ts`, selector и special-options, происхождение evidence и равный ETA. Не повторять готовый аудит как новую работу; использовать его регрессии. Части 2–10 ещё не завершены. Production/merge не разрешены текущим заданием и не выполнялись.

## Часть 2 — выбор маршрута и привязка evidence

Исправлено локально: V3 не допускает кандидатов без конечных точек и полной числовой геометрии, с неположительной/нечисловой длиной или временем. Прямая линия между адресами больше не подставляется вместо отсутствующего ответа дорожного сервиса. В special-options fastest-only использует провайдера, выбранного общим selector, и ограничивается разрешённым географическим коридором. Обычный fastest-only ответ не содержит сообщения о неудавшемся поиске бесплатной альтернативы, который этот режим не запускал.

Новые шесть проверок реального POST с заменой только внешнего fetch: OSRM fastest получает свой A-289 тариф, повреждённый Valhalla отбрасывается в обычном/особом расчёте, равный ETA стабилен в обоих вариантах, неверные координаты/конечные точки не допускаются, пустая геометрия возвращает ошибку. Focused 6/6, полный gate 466/466 и quote/API contracts PASS; TypeScript PASS. ESLint первоначально выявил prefer-const и unused index в изменяемых функциях; исправлены. Next webpack build PASS, 16/16 страниц; ESLint после исправлений и git diff --check PASS. Реальный маршрутизатор/браузер не наблюдались.

Файлы: lib/v3-calculation/route-candidate.ts, route-leg.ts, special-options.ts; scripts/v3-route-selection-audit.test.ts. Действующие тарифы и V2 алгоритм не менялись. NEXT: часть 3 — промежуточные пары А-289, порядок физических рамок, различение отсутствия А-289 и неопределённой цены.

## Часть 3 — А-289: промежуточные пары и рамки

Исправлены: ограничение short-route только парами с Maryanskaya; порядок рамок при двух камерах на одном сегменте shape (теперь учитывается положение внутри сегмента); потеря различия «А-289 отсутствует»/«А-289 есть, цена не найдена»; применение одиночной OD-цены к геометрии с возвратом через ту же камеру. Детектор теперь сообщает repeatedFrames, а V3 возвращает unknown при повторном проезде. Соседние точки одной камеры не считаются повторным проездом. V2 денежная сумма по физическим рамкам сохраняет прежнее правило counted-once; метаданные порядка уточнены.

Готовые пары Славянск↔Анапа278 (предварительный alias Варениковской), Славянск↔Темрюк548, Анапа↔Темрюк270 (тот же alias) и Славянск↔Краснодар555 теперь доступны при соответствующей выбранной последовательности рамок в обе стороны. Новые тарифы не выдуманы; для Славянск↔Тамань законченной цены нет, сохраняется unknown. Все предварительные суммы помечены. Отсутствующие выходы/несовпадающие векторы больше не позволяют fallback на native сумму.

Focused20/20 PASS; полный npm run test:audit472/472 + quote/API contracts PASS; tsc noEmit PASS; Next webpack16/16 PASS; scoped ESLint после исправления старого имени module в mock-тесте PASS; diff-check PASS. Mock short-route теперь использует настоящий OD-adapter/реестр. Проверки используют синтетическую выбранную геометрию и настоящий API/детектор/матрицу; реальные поездки не наблюдались.

NEXT: часть4 — М-4, частичные/полные векторы, стыковка отдельной цены А-289 с неполным М-4 без потерь/двойного начисления; точная привязка bypass410 и Anapa alias остаётся ограничением живой проверки.

## Сохранение и Preview частей1–3

GitHub experiment/toll-od-matrix-2026-10-08 code93c0c5d2848202824f5a0e3f2afb1f782080c7d6 (parent d0dc2227), tree5419073db1028042710f803cd5cea72bf6bb3f57. Сохранены прежний audit8556e57 и части1–3. Переданные35 файлов полностью совпадают с local373fefd по blob SHA. Ref обновлён fast-forward с expected_sha, без force.

Vercel deployment dpl_7yF5xLbKL6bHP4NBqKUwQ9bTodVv READY, target=null, exact source93c0c5d; https://mezhgorod-calculator-5xqtongc3-4regodatbe-5310.vercel.app/v3 . Удалённый build log подтверждает472/472, fail0, quote/API contracts PASS, Next16/16, Build Completed27s. Protected authenticated connector GET /v3 status200 и title калькулятора. Live POST/router/browser не выполнен этим блоком.

## User correction + part4 — 2026-10-13

Part3 tariff expectations were wrong-category data: replace833 with classI620,555→415,278→205,270→180,548→385; whole800 unchanged. Real API + live Yandex controls now agree on Anapa620 and Slavyansk415. Rebuilt matrix4699 rows with class guard. Part4 composition code now handles partial/full M4 + separate A289/bypass without replacement/double charge; focused17 and full478 tests/build PASS. Detailed source/negative evidence/live cases: A289_CLASS1_AND_M4_COMPOSITION_AUDIT_2026-10-13.md. Part4 code/calculation audit complete; Slavyansk–Rostov same-route live discrepancy remains explicitly open for stage10, not declared verified. Stages5–10 pending.


## Stage5 — 2026-10-13

Existing M11/M12/CKAD code/calculation audit DONE: exact selected-provider evidence, Order274/directed CKAD adapters, explicit head, fractional boundaries, disconnected/repeated physical crossing protection and null for unbound679–684.491 tests/full build PASS; actual local external-provider controls Moscow→Petersburg and Tver→Moscow preserve unknown. Details/coverage deferred: STAGE5_M11_M12_CKAD_AUDIT_2026-10-13.md. Stage6 next; physical/calendar/live equivalence tracked under7/10, no claim of full new-road coverage.


## Stage6 — 2026-10-13

DONE existing M1/M3/regional code audit: selected-route missing-system coverage cannot be dropped from totals or late fallback; numeric ref/CKAD endpoint identity and gate/trace contracts fixed.500 tests/build PASS; actual Kaluga2 gates unknown and Odintsovo exact-route0 complete trace. No new numeric M1/M3/regional pricing; dated tariff/source/physical completion deferred7/8/10. Details STAGE6_M1_M3_REGIONAL_AUDIT_2026-10-13.md. Stage7 next.

Stage6 follow-up rejects empty/malformed HTTP200 trace and physical-booth-without-toll false-free; final502 regression/build PASS.


## Stage7 — 2026-10-13

DONE existing temporal code audit and safe ambiguity handling: Moscow weekday, M12 allDays, no M4 calendar-null fallback, strict original dates, M11 time/year/special-day uncertainty;508 tests/build PASS. Road-specific unverified calendar/source succession and actual individual plaza timing remain explicit deferred8/10, not replaced with shared profiles. STAGE7_TIME_CALENDAR_AUDIT_2026-10-13.md; nextstage8.


## Stage8 — 2026-10-13

DONE existing version/zone/rounding code audit,516 tests/build PASS. First-day ISO/date bug, alias/intraday/version certainty, consistent integer fare parts and overflow/split checks fixed. M1 source230/250 conflict and other source/calendars remain explicit unverified, no guessed fees. See STAGE8_VERSION_ZONE_ROUNDING_AUDIT_2026-10-13.md. Nextstage9.
