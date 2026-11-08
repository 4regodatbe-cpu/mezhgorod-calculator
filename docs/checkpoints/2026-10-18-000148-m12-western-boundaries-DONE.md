# DONE физической проверки / BLOCKED тарифной привязки М-12

Запрос:18.10.2026 00:01МСК. Source d497df67738696dbe9c11e4dc14e617717ea1a2a. Durable STARTED1a8df19a22af70b8ebccda0160f805ab6e677cdc, tree fdf85b9d670d7572b5fc4ffa48da7a114d84c150. Единственная ветка fix/v3-missing-route-prices-2026-10-15; PR14draft. CI39068966825: verify и live_probe завершились успешно.

STARTED: семь pathSHA и head/PR совпали после повторного чтения PR, который сначала ещё показывал прежний head. Повторной записи ref не было. Docs-only STARTED использовал skipCI; новых runs для него нет.

## Что выполнено

Получены9primaryOSMGET, всеHTTP200, за8.684с при лимитах15с/120с. Сохранены rawXML, metadata, SHA и progress. Подтверждены три физические рамки и две разные связные цепочки съездов. У рамок нет операторских ref/km. Выход к Арзамасу имеет ref22Н-0239, к Чебоксарам — М-7. Не хватает операторского соответствия оплачиваемым границам; координаты уже подтверждены.

Два запроса к поиску и четыре запланированных чтения страниц не установили привязку. Неправильный домен avto-dor.ru и нерелевантные numeric12 результаты исключены. В сохранённом официальном HTML обнаружен exact gettrack86127. Обоснованное ограниченное дополнение: один GET, перенаправленный на общую HTML-страницу, и один исправленный AJAX-headerGET того же URL, каждый≤15с. Оба ответа учитываются отдельно и сохранены; новых поисков/маршрутов не было. AJAX200 дал информационный фрагмент М-12 без нужных идентификаторов.

Новая найденная ссылка https://russianhighways.ru/for_drivers/m-12-vostok/ ещё НЕ открывалась. Это следующий конкретный источник, а не повод повторять старые запросы.

Итог причины: blocked_by_missing_reliable_data. Завершена именно ограниченная физическая проверка. Ставки2952/1239 не применены; app/lib, матрица и тарифы не менялись. Исторический subtotal5475 каждого случая не является полной ценой. Новых маршрутов/trace/полных pricing replay, рассчитанных компонентов и подтверждённых полных тарифов нет.

[Отчёт](../../experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/README.md), [summary](../../experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/summary.json), [physical proof](../../experiments/nationwide-tolls/checks/2026-10-18-m12-western-boundaries/physical-proof.json).

## Проверки и ошибки

Проверены8frozenSHA,9rawSHA/URL/status200,3координаты,2связные цепочки. Offline capture reuse: exit0/0fetch; guard без STARTED: ожидаемый exit1/0fetch. Initial offline exit1 выявил смешение operator/OSMmetadata в каталоге; файлы оператора вынесены в подкаталог, guard не изменён. Первоначальный лог сохранён. CaptureJS syntax и Python compile — PASS.

После добавления вспомогательных utilities выполнены npm run test:audit(744/744+quote/API), node node_modules/typescript/bin/tsc --noEmit, targeted ESLint capture-скрипта, node node_modules/next/dist/bin/next build(16/16). Все exit0; limits30/60/90с. Exact arguments/time/logs — required-checks.json. Это обязательная проверка кода, не повтор live-аудита74/76/309.

Queue: обновлён M12 followup и его reference в основной причине. Baseline, прежние casecounts, остальные findings и история M11/CKAD fixes сохранены и проверены на равенство.

## Сохранение и продолжение

Перед final non-force записью проверить parent1a8df19a…/PRdraft и отсутствие activeCI. Code commit без skipCI; обязательны exact tree/path/head readback. Новый CI считать отдельно. Main/merge/Production/Android не менять.

NEXT: фактический codeCI, затем один отдельный ограниченный проход по новому observed URLm-12-vostok и одной явно связанной схеме. Не повторять9OSM объектов, прежние два поиска, ЦКАД/74/76/309. При отсутствии надёжного crosswalk оставить BLOCKED и перейти к другим уже оценённым причинам.

Сбой сохранения: первая передача объектов остановилась до загрузки первого blob, потому что exec-server потерял соединение. Read-only pwd затем успешно подтвердил доступ к тому же checkout; GitHub head не изменился. Исходные файлы доступны, codeSHA совпали. Передача продолжена последовательно с per-file progress. Тесты и сетевые прогоны из-за этого сбоя не повторялись. Точное событие — checks/2026-10-18-m12-western-boundaries/transport-events.json.
