# 14 октября 2026 — М12: крайние границы без старой цены; очистка V3 helpers

## Запрос и исходное состояние

Пользователь: «Дальше». Исходная ветка `audit/v3-matrix-provenance-2026-10-14`, HEAD `10bc704`, рабочее дерево чистое. Прочитаны AGENTS, WORK_STATE, README, NEXT_STEPS, DECISIONS и WORK_LOG, исходники/тесты М12 и связанного V3. Повторный `git ls-remote github refs/heads/integration/v3-product-baseline-2026-10-14` подтвердил SHA `a5c892e67af4b050f53bf2211b62feac34d6df6c`. Новый PR/Preview не создавались; PR head отдельно не запрашивался.

Цель: убрать старый денежный/промежуточный prerequisite М12 и продолжить ранее утверждённое правило first/last. Дополнительно выполнить уже записанную в NEXT_STEPS очистку неиспользуемого композитора Крым–М4 и bypass-денег в helper А289.

## Диагноз

`matrixM12Component` требовал `production.core.status === priced` и наличие `production.tolls`. Старый `calculateM12FromRoute` проверяет continuity всех промежуточных РВП, добавляет inferred markers и складывает мартовские денежные значения. Даже при доказанных крайних границах отказ старой continuity блокировал готовую направленную октябрьскую ячейку. Значения из исходной production-суммы прямо не использовались, но её наличие оставалось необоснованным prerequisite.

В активном верхнем V3 вызывался `calculateProductionM12`; следовательно, недостаточно было убрать guard только из матричного адаптера. Нужен отдельный геометрический resolver без monetary result и проверки промежуточной цепочки.

`crimeaM4Total` не имел production-вызовов, только устаревшие тесты, но сохранял старую whole-M4 денежную подстановку. `a289ShortRoute includeBypass=true` сохранял чтение цены из массива M4; active composer использовал false, но старый путь оставался. Локальная дата А289 допускала Date-нормализацию невозможного календарного дня.

## Изменения и алгоритм

### Геометрия М12

Новый `lib/v3-calculation/m12-product-boundaries.ts` не содержит денежных полей:

1. Проверяет форму/числа/географические пределы координат, конечную длину геометрии и endpoint span выбранного маршрута. Span начинается не раньше 0, имеет положительную длину и не выходит за геометрию более чем на 5 м (допуск округления chainage).
2. Использует существующий калиброванный spatial snapshot `data/tolls/m12-rvp-evidence-2026-09-30.json` через `projectM12Evidence`. Новые координаты/неподтверждённые anchors не добавляются. Радиус прямого пересечения остаётся 80 м.
3. Из пересечённых известных markers выбирает первый/последний по положению на выбранной геометрии. Для `proveBoundaries` передаются только эти два внешних объекта. Проверка промежуточной continuity, inferred markers и тарифные суммы не вызываются.
4. `proveBoundaries` сохраняет проверки собственных внешних границ: направление, наличие как минимум двух различных прямых РВП, расположение внутри span, исключение соседнего внешнего РВП у входа/выхода с существующим калибровочным запасом 2.5 км. Это проверка краёв проезда, а не промежуточных съездов.
5. Неизвестный/некорректный marker или числовая projection не может молча исчезнуть: boundary становится unknown. Результат содержит boundary, directMarkers и reason, но не amountRub/continuity.

`lib/v3-calculation/route-leg-pricing.ts` больше не импортирует и не вызывает `calculateProductionM12`. Используется endpoint span этого же выбранного маршрута (или совместимый strict span), новый геометрический результат и ready matrix adapter. Native M12 production/core для V2 не изменены.

### Готовая цена М12

`engine/m12-route-adapter.mjs` больше не требует priced status/tolls старого движка. Принимает новую boundary; core.boundary сохранён как совместимый вход для существующих внутренних проверок. Готовая направленная ячейка читается из общего quote. Native суммы, finalMarkers и inferred-chain prices не могут определять стоимость.

Сохраняются строгая реальная дата с часовой зоной, direction check, смешанный неподтверждённый input guard и отказ для marker832. Мартовское Шали не переименовывается в новую октябрьскую границу.

Добавлено окно поездки: проверяется применимость готовой цены и её источника на каждой затронутой московской дате. Профиль allDays, но изменение/неизвестность тарифной версии внутри окна блокирует результат. Неконечная/отрицательная длительность запрещена. Окно консервативно охватывает всю поездку, точное время РВП в этом блоке не вводилось.

### Очистка старых денежный путей V3

- Удалён `lib/v3-calculation/crimea-m4-total.ts`: production consumers отсутствовали. Удалены его 3 устаревших теста и ещё один тест старой money-substitution модели из `v3-toll-audit`. Их актуальные инварианты уже проверяются в independent-product tests М4/А289/обхода.
- `lib/v3-calculation/a289-short-route.ts` возвращает только А289. Убраны M4 import, legacy bypass money и includeBypass. Совместимый legacySegments argument не поставляет ни деньги, ни другой продукт. М4/обход составляются независимо upstream.
- А289 использует готовую allDays цену одинаково во всех трёх денежных полях и соответствующее обозначение периода. Добавлена strict validInstant проверка: невозможная дата/отсутствие часовой зоны не нормализуются в применимый день.
- Из `m4-a289-composition.ts` убран ненужный пятый аргумент. Тесты old bypass helper теперь проверяют, что изменение legacy M4 amount не меняет А289. Числа поддержанных А289 415/620/800 и независимый ДЗОК410 сохраняются.
- `tariff-products.json` связывает M12 с новым boundary adapter. Количество продуктов24, денежные строки матрицы не менялись.

## Источники и границы доказанного

Использованы существующие сохранённые калибровки/тарифные snapshots и directed operator matrix из пользовательского PDF order302. Новых PDF, веб-тарифов, координат Шали, source dates или денежных значений не добавлено. Сентябрьские recorded projections воспроизведены как regression input; они не runtime route DB и не новые живые наблюдения.

Пример отдельной проверки: калиброванные anchors184/281 образуют корректные внешние границы, хотя их прямолинейная тестовая геометрия не проходит старую official-distance continuity. Новый адаптер получает готовую пару Владимир→Меленки/обратно =687. Это проверка модели на синтетической геометрии с сохранёнными anchors, не заявление, что реальная дорога является прямой линией. Recorded Москва↔Казань контролы сохраняют supported pair Владимир↔P241 =3513; весь городской маршрут не переименован в full-M12 fare5847.

## Проверки и исправления

Фактически выполнено:

- Первый focused адаптеры/контракты/coverage/road evidence:29/29 PASS.
- Новые `scripts/v3-m12-product-boundaries.test.ts`:8/8 PASS. Проверены оба направления recorded fixtures с/без внутренних markers, отказ старой continuity при доказанной внешней boundary, unknown span/projections, actual calibrated anchor pair, geometry/date/duration guards, недоказанные single-RVP и новая Шали, верхний V3 priced/unknown и смена версии внутри окна.
- После cleanup первый focused:28/29. Темрюкский test требовал явную unverified пометку; при удалении obsolete bypass части формулировка случайно потеряла её. В code reason возвращена точная пометка `exit binding unverified`; alias не объявлен проверенным.
- Добавлена регрессия strict A289 date; итоговый focused:
`node --import ./scripts/register-ts-paths.mjs --test scripts/v3-m12-product-boundaries.test.ts scripts/v3-toll-audit.test.mjs scripts/a289-short-route.test.mjs scripts/v3-m4-a289-composition.test.mjs scripts/v3-southern-products.test.ts` —30/30 PASS.
- Первый `npm run build -- --webpack`:606/606 тестов, quote/API PASS; TypeScript FAIL из-за отсутствующего narrowing необязательной строки departureAt после JS validInstant. Добавлена явная typeof строка; денежная логика не менялась.
- Финальный `npm run build -- --webpack`:606/606 PASS, quote/API contracts PASS, TypeScript и Next.js16.3.4 PASS,16 app routes,exit0. Лог `/workspace/scratch/ff2fa3168299/v3-m12-boundaries-cleanup-build-final.log`.
- `git diff --check` PASS; поиск активного lib/v3-calculation больше не находит crimeaM4Total/includeBypass/calculateProductionM12.

Рост общего числа тестов601→606: добавлены8 М12 +1 А289date, убраны4 теста удалённого legacy композитора. Это не удаление неизвестности ради зелёного gate: актуальные независимые композиции и partial/unknown гарантии продолжают проходить.

Новые live/Yandex/browser/hostedAPI проверки, CI, push, PR, Preview, merge/main и Production не выполнялись. Raw matrix5076 и10 строк без доказанной даты не менялись.

## Итог, ограничения и следующий шаг

DONE: активный V3 М12 не требует старой денежной суммы/промежуточной continuity; ready pair используется по outer boundary proof. Неиспользуемый старый композитор и скрытая bypass добавка А289 удалены. Неподтверждённые суммы сохраняют видимую пометку, unknown не становится нулём/полным итогом.

OPEN: новые physical bindings (октябрьская Шали, неоткалиброванные РВП33/65/81/118/174/722/769/782/806 и single-RVP направление); текущая М12 калибровка частична. Adapter может читать210/380 source pairs, но наличие ячейки не доказывает её реальные края. Другие восточные продукты М12 из приложений не включаются автоматически в основной продукт.

Этап3 ещё не завершён: ЦКАД conditional context/SmallVyazemy, самостоятельные региональные product bindings и broad regional aggregate, М11 ПВП21/локальные endpoints/p147/tail scope остаются открытыми. Отсутствующие даты/физика не придумываются.

Следующий блок: ревизия ЦКАД и региональных product ID/контекста, затем сверка всего активного V3 с ALGORITHM_SPEC и release критериями. После этого этап4 (реальные маршруты/UI/API) и проверяемая Preview на точном SHA. Main/Production только по отдельному прямому запросу.
