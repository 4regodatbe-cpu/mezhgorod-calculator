# Ограниченный резерв сохранённых городов

Статус: реализован отдельным модулем, **addressCitySnapshot=false**. Общий поиск при полном Photon outage пока не объявлен исправленным. Географический каталог GeoNames и его19групп неразличимых русских подписей не подключены.

## Состав и происхождение

Ровно4Suggestion,уже полученные настоящимPreview/api/suggest24.10.2026:Донецк—ДНР,ДонецквРостовскойобласти,Краснодар,Ростов-на-Дону. Source captures: checks/2026-10-24-address-live-fixed. Координаты/ID/labels скопированы точно,не изroutebenchmark и не изGeoNames. SourceSHA/date/sourcecommit/sourceid и JSONrecordsSHA в data/address-city-snapshot.json; review: checks/2026-10-24-positive-city-subset. Это не независимая геодезическая проверка: источник данных остаётсяPhoton/OSM,локальный файл даёт независимость отliveavailability для этих четырёх записей.

## Где подключено

- Код: lib/address-city-snapshot.ts. Нет сети/файловогоI/O вlookup;валидация<=16KiB/4records,hash/schema/finiteWGS84/uniqueIDs/sourcefields/date/license;structuredstatus.
- Данные: data/address-city-snapshot.json. Новыйснимоктребуетcapture/source/date/SHA/exactitemreviewиtests;непросторучногообновленияexpiry.
- Переключатель: data/toll-feature-switches.json → addressCitySnapshot:false.
- Единственная серверная интеграция: app/api/suggest/route.ts только при collector.unavailable===true. /r делегирует сюдабезотдельногоpath. Partial и успешный emptyPhoton ответ остаютсяпрежними.
- UI: sharedAddressField получаетmetadatafallback.source=reviewed_city_snapshot;показываетограничениепокрытияи©OpenStreetMap/ODbLссылку. ПриselectedPlaceметкаaddressSourceсохраняетсясPlace,втомчислеприреверсеA↔B;clear/newqueryеёсбрасывает. BrowserLRUнепишетэтистрокибезsource/expirymetadata. Обычныеподсказкиcacheпо-прежнему.

## Правила результата

LookupтолькоCyrillic reviewed city-name/qualifier prefixот3символов,безstreet/house/numericquery. Неизвестныйгородилиулица не заменяетсяцентромизснимка. ДваДонецка возвращаютсяраздельносразнымиподписями/ID;нетавтовыборапервого. Itemsвозвращаютсякопиями. Ответ200сfallbackmetadataозначаеттолькоограниченныйлокальныйответ,ненормальнуюдоступностьPhoton;upstreamfailurecounts/sourceCount/budgetиsnapshotIDзаписываютсявstructuredlogбезquery/coords.

Снимокистекает31.10.2026 08:24:54UTC (11:24:54МСК),непозже7сутокотсамогораннегосохранённогоответа. Неиспользуетсяпослеexpiry/приfuture-review/hashinvalid/missingprovenance/отмене. Послеистечениятребуетсяновыйsourcecapture/review,непростоизменениедаты. Старыеуспешныеcapturesневыдаютсязасвежие.

Остающийсяbudgetвходитвсуществующие20секобщегозапроса;послетаймаутаPhotonещё20секнедобавляется. Приисчерпанномbudget/cancel/unknown/expired/disabledповедениеостаётся502;не200снепровереннойпозицией. Никакихизмененийвыборадороги/тарифов/unknown/partialguards/Android/Production.

## Проверки и допуск

Обновление24.10.2026: LINT-001исправленотдельнымблоком,full895/895/quoteAPI/build16/16/whole-repoESLint0errors5warningsPASS. См. checks/2026-10-24-eslint-baseline/README.md. ИсторическийFAILнижеоставленкакрезультатпервогомодульногогейта,неактуальныйблокер. ОсталосьUIreview/freshness;flagfalse.

7focusedtests(core+realNextGET/rсmockPhoton),полныйtest:audit+quote/APIadapter,изменённыефайлыESLint,webpack/TypeScriptиартефактысборкипроверяютсявchecks/2026-10-24-city-snapshot-module. UIобработкакэш/отмена/selectedметкапрочитана/скомпилирована;живойтелефонный/браузерныйE2Eнепроводился.

ПолныйрепозиторныйESLintдал19ошибок/5предупрежденийвнеизменённыхфайлах. Blobсравнение/checkconfigсохранено;этоFAIL,неPASS. Модульвыключен;этапнеявляетсяразрешениемактивации/релиза. Передвключениемпроверитьfreshness/revieweddata,учестьзакрытыйLINT-001иактуальные0errors/5warnings,подтвердитьUIограничение/атрибуциюнаPreview;Production/main/mergeтребуютпрямогоотдельногопоручения.

Отключение:addressCitySnapshot:falseнемедленнооставляетпрежнийPhotonpath/502. Удаление:одинimport+unavailablebranchв/api/suggest,этотфлаг,двафайлаlib/data+тесты;UImetadataветкиможноудалитьотдельно. ОстальныеaddressRequestPool/calculationTiming/roadKilometrageнепереписываются.

## Браузерная приёмка — STATUS UPDATE 26.10.2026

GitHub-hosted Chrome preflight passed in run 40336150199 on head 0895948e294b9f17efa00cb8a9a52c14bf9eef27: Chrome 156.0.8078.47 created DOM for `about:blank` (exit0). This is only a runtime smoke; no app/UI scenario ran. The eight `/r` scenarios are separately STARTED; evidence and exact case list: [checkpoint](../../docs/checkpoints/2026-10-26-1711-b03-address-ui-STARTED.md). The local Codex browser restriction remains unchanged.

26.10.2026 17:22 МСК: isolated Node24/Chrome156/Playwright1.56 scenario workflow and harness prepared; not yet run. Current remote snapshot rechecked at 17:22 МСК, record-set hash verified; expires 31.10.2026 11:24:54 МСК. Test result must not be used after expiry. `addressCitySnapshot` remains false; no B-only fix is claimed.

## Браузерная приёмка — ранее NOT_RUN (24.10.2026)

Серверный HTML отдельно проверен: checks/2026-10-24-city-snapshot-render/verification.json, full898 PASS. Перестановка/очистка props в SSR не подтверждает реальные клики, useEffect, отмену или кэш. Локальный UI preflight: BLOCKED_BY_ENVIRONMENT_BROWSER; установленного Chromium нет. Не повторять поиск бинарника без изменения среды.

Перед браузерным запуском сохранить STARTED с exact commit/browser version/сценариями. Использовать локальную копию приложения и перехват `/r` в браузере; возвращать точные `items` из data/address-city-snapshot.json с `fallback.source=reviewed_city_snapshot`. Флаг репозитория/Production не включать. Это проверка UI с mock-ответом, не доказательство реального outage или полного UI→API→Photon E2E. Блокировать внешние запросы браузера; не открывать ссылку OSM, проверить только href/текст. Прямой endpoint-модуль уже проверен отдельными mock-тестами, их не выдавать за браузерный запуск.

| Действие в браузере | Ожидаемое поведение / evidence |
| --- | --- |
| Ввести «Донецк» в A, получить два exact reviewed items | Два разных ID/подписи, ограничение «только сохранённые города», видимый credit и правильный OSM href; автоматического выбора нет |
| Выбрать один результат, затем повторить в B | Выбранная подпись и координаты соответствуют конкретному item; notice/credit остаются у выбранного поля |
| Нажать A↔B | Значения и source-метка перемещаются вместе; notice остаётся у резервного города; старый результат расчёта сброшен |
| Очистить B крестиком, ввести другой город | Старые items/позиция/метка исчезают; приходит новый запрос, поле доступно для выбора |
| Задержать ответ для старого запроса, затем изменить/очистить поле | Старый ответ не возвращает очищенные items/notice и не перезаписывает новое значение; нет необработанной ошибки отмены |
| Вернуть обычные items без fallback, затем успешный empty и 502 | Обычный ответ без notice; empty сообщает об отсутствии результата; 502 показывает ошибку и кнопку повтора; old items не остаются selectable |
| Повторно ввести fallback query в этом браузере | Выполнен новый `/r`, fallback не восстановлен из legacy LRU без source/expiry; отдельный обычный positive-cache сценарий сохраняет прежнее поведение |
| Проверить узкий экран и клавиатуру | Notice/credit читаемы, dropdown не закрывает выбор полностью, clear/swap доступны; сохранить screenshot и размеры viewport |

Для каждого реально выполненного сценария записать результат/ожидание, обезличенный request count, screenshot при необходимости и SHA артефактов. При первом broken boundary сохранить FAILED/BLOCKED и точное воспроизведение; без доказательства не считать B-only phone bug устранённым. После приёмки останется отдельный допуск данных: реальное покрытие ровно4города, источник/лицензия и expiry31.10.2026 11:24:54МСК. Истёкший снимок нельзя «освежить» изменением даты: нужен новый capture/review. Активация и публикация не следуют автоматически из тестов.
