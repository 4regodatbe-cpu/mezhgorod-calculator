## Актуально: серия ADDRESS завершена

1. Проверить exactremote и обычныйCI финальногоhead (verify/livePhoton/skipped отдельно). Кодpool сохранёнв479f9dc; endpointproof/итог: docs/checkpoints/2026-10-24-address-endpoint-series-DONE.md.864tests/buildPASSлокально,live0.
2. Если источник доступен, отдельныйкороткийliveaddresssmoke/исходныйmobileсценарий поSTARTED слимитом, безповтораfullrouteкорпуса. Failure503 невыдаватьзавсеадресаисправлены. Приoutageлогировать/двигатьсякнезависимому.
3. Км/scope/цены pendingпары пополнятьотдельноподоказаннымисточникам; неизвестныеданные неугадывать. ПолнаясвоякартаDEFERRED. ПредыдущиеSTARTEDразделынижеисторические.

## Сейчас: block3 ADDRESS endpoint regression

Блок2poolDONE/54focused/863full/buildPASS. После durable readback — scripts/address-search-endpoint.test.ts по сценарию замены адресов и отмены shared/устаревшего запроса через /r; preserve originalranking. См. docs/checkpoints/2026-10-24-address-pool-DONE-endpoint-STARTED.md. ОбычныйCI на финальномcommit, промежуточныйskipci ужепроверенlocalgate. Готовый module не переписывать; externalavailability остаётся отдельнымпробелом.

## Актуальная серия ADDRESS-001

Блок1 diagnosisDONE, блок2 poolSTARTED: docs/checkpoints/2026-10-24-address-diagnosis-DONE-pool-STARTED.md. После exactremote readback реализовать ограниченный отключаемый requestpool/cache/singleflight/cooldown и общий20сbudget, focused/fullgate/build; сохранить. Затем endpoint /r regression по последовательности замен адресов, отдельно сохранить итог, не ждать «дальше». Existingranking/URLcoverage и prices не менять; availability/B-only остаются неподтверждёнными.

## Порядок исполнения24.10

Выполнять несколько небольших разрешённых блоков последовательно в одном ответе, сохраняя/проверяя remote после каждого; не завершать ответ ради ожидания «дальше». При сбое продолжить первый незавершённый. См. docs/WORKFLOW_RULES.md и checkpoint2026-10-24-sequential-blocks-one-response-DONE. Очередь разработки ниже не меняется.

## Актуальный следующий шаг24.10

Километражный модуль DONE: см. KILOMETRAGE.md и docs/checkpoints/2026-10-24-road-kilometrage-DONE.md.851tests/buildPASS; reviewedsections0, pendingkmunknown, E2E10сUNVERIFIED. Сначала exact remote/codeCI readback, затем ограниченный offline ADDRESS-001 fan-out/fallback. Заполнение km/scope/цен независимо при наличии source; не повторять готовые6captures/12профилей и не запускать полный roadgraph. Предыдущий STARTED план ниже исторический.

## Приоритет24.10: локальный километраж

Сначала выполнить разрешённый модуль по docs/checkpoints/2026-10-24-road-kilometrage-STARTED.md: local index/section projection, switch, preview, focused/full gate и performance evidence. ADDRESS-001/цены независимы и остаются в BLOCKERS.md. Новые данные не угадывать; следующим этапом не считать полный дорожный граф.

# Следующие действия

Точная привязка М4 к графовым переходам реализована23.10.2026. Манёвры навигатора — диагностика; активный новый вектор требует node+directed way IDs полного matching выбранной геометрии.840 тестов и сборка PASS.

1. Recovery24.10: source f2abc85/PR14 подтверждён; CI39997833752 завершён, verify success, live_probe failure (Photon503/timeouts; последующие audits skipped). См. docs/checkpoints/2026-10-24-road-ref-recovery-DONE.md. После durable readback выполнить только ограниченный offline анализ Photon fan-out/fallback; перед длительной новой проверкой сохранить STARTED. Не повторять готовые route replays и не считать общий success доказательством доступности поиска.
2. Заполнить недостающие operator scope/цены независимо от определения границ. Активных цен в M4_GRAPH_ENDPOINT_REGISTER.json пока0, pending содержит одну пару для шести случаев. Новые rows требуют точных osm-transition ключей, двух профилей, источника/даты, scopeBindingStatus=reviewed и runtimeEligible=true. Не копировать соседний ПВП и не подставлять0.
3. Ключи, полные capture SHA и результаты6/6 сохранены в checks/2026-10-23-graph; не повторять эти replay без материального отличия кода/данных. Остальные направления не считать проверенными по одной паре.545/operator collection scope остаётся отдельным пробелом.
4. При неполной trace, разрыве внутри М4 или отсутствии точного узла оставитьunknown. Не переносить чужую геометрию или индексы request shape в output shape. Совместимость с источником геометрии обеспечивается общим matching; реальные шесть кейсов — Valhalla, BRouter контракт проверен синтетически.

Backup backup/algorithm-before-road-ref-2026-10-23 @c7048e0 сохранён. PR14 draft; Production/main/merge требуют отдельного поручения. Долгосрочная собственная карта остаётся DEFERRED.
