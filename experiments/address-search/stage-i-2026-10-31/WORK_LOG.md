# Stage I — локальные исправления, 31.10.2026 МСК

## I3 — финальные локальные проверки завершены

Проверенные исходники be932d99. Один полный offline gate: 1061 PASS / 0 FAIL / 1 SKIP, quote/API contracts PASS, exit 0. ESLint exit 0 / 7 прежних warnings. Прямой Next 16.3.4 webpack production build exit 0, затем TypeScript --noEmit exit 0; Node 24.19.0. Deprecated preferredRegion warning сохранён. Полные логи и реальные exit codes — checks/, сводка checks/RESULTS.json. Новых live-аудитов, Actions и браузерных запусков нет.

Старый snapshot в текущем времени expired, новый ready; exact suggestions 4/4 сохранены, default disabled. I1 pre-browser блокировка исправлена локально. I2 upstream503 не устранён и не объявлен исправленным; нужна внешняя диагностика, текущие данные не устанавливают причину самого HTTP 503. Все доступные части Stage I сохранены локально, без второго push. Итоговый checkpoint, файловый readback и incremental bundle обязательны; publication/Preview acceptance требуют отдельного разрешения. Старые STARTED/BLOCKED ниже отражают последовательность, а не новый итог.

## I2 — 31.10.2026: сохранённый Photon 503 разобран offline

Источник — реальные query rows run 41198667966, не unit-test stdout внутри полного CI log. Донецк: 4 HTTP 503, 3 локальных cooldown, 0 features, 274 мс, без исчерпания 20-секундного бюджета. Код создаёт семь вариантов одного origin, не независимые резервы. Четыре новые регрессии воспроизводят счётчики и восстановление, exit 0 / 4 PASS. Runtime/порог/budget/retry/CI не менялись; разбор и точные ограничения — PHOTON_503.md. Первопричина удалённого 503 по имеющимся данным не установлена; BLOCKED_EXTERNAL_SOURCE. Не выдаём один новый успешный Донецк или mocks за устранение периодического отказа.

Далее финальный offline gate, lint, build и TypeScript; затем локальное сохранение/readback/bundle. Внешних запросов в I2 не выполнялось, второй push/Production запрещены.

## I1 review — 17:54 МСК: новый snapshot допущен локально

Exact follow-up source da0e545c: «Краснодар» HTTP 200 / 1864 мс, «Ростов-на-Дону» HTTP 200 / 916 мс, exit 0. Вместе с ранее сохранённым новым Донецком получены все четыре исходных ID. Машинное сравнение с прежними suggestion objects: **4/4 exact equality**, включая русские подписи, раздельность Донецков, регионы и координаты. Неполная выдача/503 в raw не скрыты; не подтверждается полнота общего поиска.

Snapshot заменён новым reviewed-набором и source SHA, не продлён вслепую. Новая expiry 07.11.2026 17:50:17.541 МСК — семь суток от самого раннего capture. Флаг OFF, CI и runtime guard не изменены. 9 target PASS / exit 0, точная workflow freshness-команда exit 0. Добавлен timestamp provenance assertion; финальный gate ещё предстоит. Браузер/CI не повторялись; локально устранена причина pre-browser блокировки, не объявлены новые 18 PASS. Исторические блокеры ниже отражают предшествующие состояния.

## I1 результат — первый capture, 17:50 МСК

Source 5600384e; exit 2. Донецк HTTP 200 / оба требуемых ID, 1848 мс. «Красн» HTTP 200, но Краснодар отсутствует, 814 мс; 5×503 и один cooldown. Третий запрос не выполнялся. Raw JSON и SHA сохранены. Snapshot/expiry/CI/флаги не изменены; B03 пока BLOCKED. Отдельный bounded follow-up использует **точные** названия двух недостающих городов, максимум два запроса, с остановкой и запретом повторного запуска. Это проверка новых входных данных после неполной prefix-выдачи, не повтор общего аудита. Далее — review либо BLOCKED и независимый offline-разбор 503. См. отдельный checkpoint и NEXT_STEPS.

ИсходныйHEAD223f72e6dc0083ea9fd7dbf087043f992a36ae70/clean. Pushзапрещён; remoteосталсяc0e76ecc, предыдущиепубликационныеошибки/исходникисохранены. AGENTS/WORK_STATE/правилапрочитаны. Одинwriter, без Production/main/Android/backup/тарифов/новыхширокихаудитов.

## I1 STARTED — допустимое обновление B03 snapshot

B03обаmockrunnerчитают4realreviewedrecords изdata/address-city-snapshot; workflowиrunnerблокируютexpiresAt31Oct08:24:54UTC. Runtimeguard7суток/future/hashпроверкисохраняются. Неубираемgate/непереносимexpiry/неиспользуемистёкшиеitemsкакfreshfixture. ПросмотренныепоздниеPhotoncaptures29Octотносятсякдругимstreetqueries/часть503,онинеподменяют4исходныхгорода. НовыйboundedcaptureтемжеGETcollector(Photononly,GeoNames/snapshotOFF) максимум3query×20s, прекращениепослепервогонеуспеха. Directlocalhandler,неPreview;используетсяштатныйNODE_USE_ENV_PROXY=1+existingproxy/networkgrant,безTLS/securityизменений. Это новаянеобходимаяданнаядляfreshness,немассовыйаудит/повтордиагностикисети.

Сначалаcapture/sourceSHA/status/body иexact4IDreview. Толькоесливсе4прошли—новыйsnapshotсновойprovenance/7daymax,старыеcapturesнетронуты;runtimeflagнеактивировать. Еслиsourceнедоступен—сохранитьBLOCKED,ничегонеосвежать,перейтикнезависимомуPhoton503/cooldownразбору/воспроизводимымtests. Браузер/sandboxвнеизменныхусловийнеповторять. Всеисправлениямаленькимилокальнымикоммитами/readback,новыеActionsне запускать.

## 31.10.2026, 18:20 МСК — I3: закрыт пропуск snapshot в B03 triggers

Новый запрос владельца выполнен отдельным узким блоком от 7d100728 без изменения прежней истории. Фактически snapshot не отслеживался в push/PR filters. Добавлены два независимых regression: direct CI-команда до правки 3 PASS / 2 FAIL / exit 1; после двух новых path-строк — 5 PASS / exit 0. Event parser теста ограничен каждым событием, не допускает ложного успеха за счёт соседнего PR block. Исправление и STARTED checkpoint сохранены в 2750861c. Побайтовая проверка workflow вне двух строк PASS: guards/jobs/browser suites/verify/build/permissions неизменны. App/lib/data/матрица не менялись.

Обязательные AGENTS gates на 2750861c: offline 1063 PASS / 0 FAIL / 1 SKIP, quote/API PASS, exit 0; ESLint exit 0 / семь прежних warnings; Next16.3.4 production build exit 0, затем TypeScript --noEmit exit 0 / Node24.19.0. Full gate повторён по требованию после изменения test code, не ради аудита Photon. Initial node --test в base sandbox дал только file-level failure; сохранён отдельно, причина не угадывалась. Содержательный RED получен штатной direct-командой workflow, общий gate прошёл со штатными дополнительными разрешениями. Все исходные логи/exit codes — checks/i3-snapshot-trigger, прежние checks/RESULTS.json и bundle Stage I не заменены.

WORK_STATE/NEXT_STEPS/DONE checkpoint обновлены; следом локальный commit/readback и новый incremental bundle. Push/новых Actions/Preview/браузерных/Photon-запросов нет. Готовность локальная; публикация только после отдельного разрешения и fresh remote preflight. Photon503 остаётся прежним внешним ограничением. Production/main/Android/backup/PR14 не менялись.
