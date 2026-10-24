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

7focusedtests(core+realNextGET/rсmockPhoton),полныйtest:audit+quote/APIadapter,изменённыефайлыESLint,webpack/TypeScriptиартефактысборкипроверяютсявchecks/2026-10-24-city-snapshot-module. UIобработкакэш/отмена/selectedметкапрочитана/скомпилирована;живойтелефонный/браузерныйE2Eнепроводился.

ПолныйрепозиторныйESLintдал19ошибок/5предупрежденийвнеизменённыхфайлах. Blobсравнение/checkconfigсохранено;этоFAIL,неPASS. Модульвыключен;этапнеявляетсяразрешениемактивации/релиза. Передвключениемпроверитьfreshness/revieweddata,закрытьилиотдельноразобратьобщийlintgate,подтвердитьUIограничение/атрибуциюнаPreview;Production/main/mergeтребуютпрямогоотдельногопоручения.

Отключение:addressCitySnapshot:falseнемедленнооставляетпрежнийPhotonpath/502. Удаление:одинimport+unavailablebranchв/api/suggest,этотфлаг,двафайлаlib/data+тесты;UImetadataветкиможноудалитьотдельно. ОстальныеaddressRequestPool/calculationTiming/roadKilometrageнепереписываются.
