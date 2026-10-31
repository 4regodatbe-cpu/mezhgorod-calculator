# Stage I — локальные исправления, 31.10.2026 МСК

## I1 результат — первый capture, 17:50 МСК

Source 5600384e; exit 2. Донецк HTTP 200 / оба требуемых ID, 1848 мс. «Красн» HTTP 200, но Краснодар отсутствует, 814 мс; 5×503 и один cooldown. Третий запрос не выполнялся. Raw JSON и SHA сохранены. Snapshot/expiry/CI/флаги не изменены; B03 пока BLOCKED. Отдельный bounded follow-up использует **точные** названия двух недостающих городов, максимум два запроса, с остановкой и запретом повторного запуска. Это проверка новых входных данных после неполной prefix-выдачи, не повтор общего аудита. Далее — review либо BLOCKED и независимый offline-разбор 503. См. отдельный checkpoint и NEXT_STEPS.

ИсходныйHEAD223f72e6dc0083ea9fd7dbf087043f992a36ae70/clean. Pushзапрещён; remoteосталсяc0e76ecc, предыдущиепубликационныеошибки/исходникисохранены. AGENTS/WORK_STATE/правилапрочитаны. Одинwriter, без Production/main/Android/backup/тарифов/новыхширокихаудитов.

## I1 STARTED — допустимое обновление B03 snapshot

B03обаmockrunnerчитают4realreviewedrecords изdata/address-city-snapshot; workflowиrunnerблокируютexpiresAt31Oct08:24:54UTC. Runtimeguard7суток/future/hashпроверкисохраняются. Неубираемgate/непереносимexpiry/неиспользуемистёкшиеitemsкакfreshfixture. ПросмотренныепоздниеPhotoncaptures29Octотносятсякдругимstreetqueries/часть503,онинеподменяют4исходныхгорода. НовыйboundedcaptureтемжеGETcollector(Photononly,GeoNames/snapshotOFF) максимум3query×20s, прекращениепослепервогонеуспеха. Directlocalhandler,неPreview;используетсяштатныйNODE_USE_ENV_PROXY=1+existingproxy/networkgrant,безTLS/securityизменений. Это новаянеобходимаяданнаядляfreshness,немассовыйаудит/повтордиагностикисети.

Сначалаcapture/sourceSHA/status/body иexact4IDreview. Толькоесливсе4прошли—новыйsnapshotсновойprovenance/7daymax,старыеcapturesнетронуты;runtimeflagнеактивировать. Еслиsourceнедоступен—сохранитьBLOCKED,ничегонеосвежать,перейтикнезависимомуPhoton503/cooldownразбору/воспроизводимымtests. Браузер/sandboxвнеизменныхусловийнеповторять. Всеисправлениямаленькимилокальнымикоммитами/readback,новыеActionsне запускать.
