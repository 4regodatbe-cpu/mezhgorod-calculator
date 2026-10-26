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

26.10.2026 17:26 МСК: first full-suite workflow attempt 40339480704 failed in setup-node because pnpm was not yet on PATH (`cache: pnpm` was resolved before `pnpm/action-setup`); browser and all eight scenarios were NOT_RUN, with no artifact. Reordering the setup steps is the only correction. See [bootstrap failure](../../docs/checkpoints/2026-10-26-1726-b03-ui-runner-bootstrap-FAILED.md) and [retry STARTED](../../docs/checkpoints/2026-10-26-1727-b03-address-ui-retry-STARTED.md).

26.10.2026 17:39 МСК: Chrome UI run 40340623345 executed all cases; case 01 passed. Cases 02–07 are invalidated by specific harness callback/heading mistakes and will be repeated only after correction. Case08 passed narrow-screen and keyboard assertions but observed no A↔B control. Evidence and artifact digest: [run record](checks/2026-10-26-b03-address-ui-run-40340623345/README.md); root causes and limits: [checkpoint](../../docs/checkpoints/2026-10-26-1739-b03-ui-harness-run-FAILED.md). New harness-correction block: [STARTED](../../docs/checkpoints/2026-10-26-1740-b03-ui-harness-correction-STARTED.md).

26.10.2026 17:48 МСК: corrected run 40342429468 produced five valid PASS (01,02,04,05,07). Case03 confirmed the V2 swap control is absent after result; case06 counted the retry button as a suggestion (test defect); case08 had no `/r` before timeout and remains inconclusive, likely hydration timing. [Evidence/results](checks/2026-10-26-b03-address-ui-run-40342429468/README.md), [partial checkpoint](../../docs/checkpoints/2026-10-26-1748-b03-ui-run2-PARTIAL.md). Focused swap callback implementation and complete hosted rerun STARTED: [checkpoint](../../docs/checkpoints/2026-10-26-1748-b03-v2-swap-fix-STARTED.md).

26.10.2026 17:55 МСК: hosted Chrome run 40343852094 passed all eight mocked UI cases after wiring the V2 swap callback; per-case outputs and artifact hash: [run evidence](checks/2026-10-26-b03-address-ui-run-40343852094/README.md), [DONE](../../docs/checkpoints/2026-10-26-1755-b03-v2-swap-fix-DONE.md). This validates controlled UI behavior only. `addressCitySnapshot` remains false and the real external B-only incident is not declared fixed. Hosted artifact retained through 2026-11-25T14:54:08Z. Do not use underlying snapshot data beyond 31.10.2026 11:24:54 МСК without a new capture/review.

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
