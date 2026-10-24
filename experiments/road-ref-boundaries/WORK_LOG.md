# Журнал: привязка тарифных границ к дорожным переходам

## 23.10.2026 — резервная копия DONE; реализация DEFERRED

Исходная версия `c7048e0a7c0fc6b471c333292f01bcfa213abad4`, ветка `fix/v3-missing-route-prices-2026-10-15`, PR14open/draft. Пользователь поручил сохранить текущий алгоритм и прямо запретил начинать доработку. Резервная ветка `backup/algorithm-before-road-ref-2026-10-23` создана и прочитана обратно на том же SHA. [Датированный подробный checkpoint](../../docs/checkpoints/2026-10-23-algorithm-backup-road-ref-DEFERRED.md) содержит решения, транспорт, доказательства, ограничения и восстановление. Результат шага — сохранение версии и решения, не исправление runtime.

Будущая цель — выбирать существующие тарифные векторы по конкретной направленной развязке и последовательности пройденных дорог; первыми проверять проблемные М4-маршруты новых территорий. Одна пара номеров не считается уникальной развязкой. Код, тарифы, аудит и Production не изменены. Unit/live/build не запускались. Следующий шаг — дождаться тарифов и нового поручения на реализацию.


## 23.10.2026 — уточнение зависимости от цен

Пользователь прямо снял необходимость ждать тарифы для доработки. Исправлены актуальные условия NEXT_STEPS и handoff: выбор направленной границы/вектора можно проверить при неизвестной стоимости. Исторические записи сохранены. [Подробный checkpoint](../../docs/checkpoints/2026-10-23-tariff-data-not-implementation-blocker.md). Код и матрица без изменений, алгоритм пока не разрабатывался. Следующий шаг — отдельное поручение начать, независимо от готовности цен.


## 23.10.2026 — реализация STARTED

Пользователь дал прямую команду начать. Исходный head7d1196a7d299e2c28690d814a8eadc472443a2ba, PR14open/draft, CI39988935029completed/success проверен перед записью. Подготовлен свежий изолированный worktree от этого SHA; грязные старые checkout сохранены. Включено ранее подготовленное уточнение об отсутствии зависимости от цен. [План и восстановление](../../docs/checkpoints/2026-10-23-road-ref-boundaries-STARTED.md).


## 23.10.2026 — слой переходов DONE, полная интеграция впереди

[Подробная запись](../../docs/checkpoints/2026-10-23-road-ref-boundaries-layer-DONE.md).12новыхпроверок+16существующихM4adapter:28/28PASS; ESLint/tscPASSпослеподтягиванияотсутствовавшихsparsedata. Новыхцен0; фактическиеentry/exitГранитное→Казаньвыбраны,ценаunknown. Parent71d4b20163f14435b820c2723519b30c446eb6db/CI39990302513success;следующийшагofflinerealprovider+fullcomposerreplay,затемgate/build.


## 23.10.2026 — полный replay и gate DONE

[Подробная запись](../../docs/checkpoints/2026-10-23-road-ref-boundaries-integration-DONE.md). Сохранённый provider response Гранитное→Казань прошёл полный composer в двух профилях; переходы и вектор определены, ценаunknown/API amount=null. Добавлена поддержка региональных номеров и отдельный replay regression. Полный test:audit833/833, quote/API, ESLint, Next webpack build/static16/16 PASS. Начальные ENOENT/missing vendor в sparse checkout устранены восстановлением tracked data; source workarounds не применялись. Parent1e445b7/CI39992042216success. Полный аудит всех направлений/live не проводился; цены и операторский scope не выдуманы. Точный следующий шаг — remote readback/CI, затем отдельное заполнение проверенных тарифов.


## 23.10.2026 — точные graph nodes DONE, прежняя maneuver-точка диагностическая

[Подробный checkpoint](../../docs/checkpoints/2026-10-23-road-ref-exact-graph-DONE.md). Начало инструкции не совпадало с фактическим въездом. Реализован разбор уже имеющихся graph edges, связывание chunks по directed overlap и идентификаторы OSM node+way pair. Это работает с выбранной геометрией любого provider при полном matching. Шесть retained случаев/12 профилей дают один общий вектор, ценыunknown. Полный replay14 responses/0misses/0live;840tests, quote/API, ESLint и build/static16/16 PASS. Добавлен graph endpoint register:0 активных строк,1pending. Не повторялся тарифный аудит и не менялись цены. Следующий шаг — exact remote readback/CI, затем проверенные цены/scope.


## 24.10.2026 — recovery / точный CI readback

[Checkpoint](../../docs/checkpoints/2026-10-24-road-ref-recovery-DONE.md). PR14head f2abc85/draft подтверждён. Run39997833752 success, verify/live geometry success; live_probe failure: Photon503/timeouts, BUDGET_EXHAUSTED90s,12/13 queries,94 source failures; последующие route audits skipped. Workflow continue-on-error объясняет общий success. Реализация и старые840checks не повторялись; причина внешнего поиска остаётся IN_PROGRESS, связь с A/B не доказана. Следующий шаг — offline fan-out/fallback review после remote readback.


## 24.10.2026 — STARTED локального километража

Пользователь разрешил этап и модульную неблокирующую разработку. Source5c61b6a/CI40067156518 завершён (verifyPASS, PhotonFAIL). План/лимиты: docs/checkpoints/2026-10-24-road-kilometrage-STARTED.md. Пробелы вынесены в BLOCKERS.md; runtime тарифы пока не менялись. Следом отдельный локальный resolver с переключателем и проверки.


## 24.10.2026 09:14 МСК — DONE module локального километража

[Отдельный подробный checkpoint](../../docs/checkpoints/2026-10-24-road-kilometrage-DONE.md), source50d36ae/CI40068908259completed (verifyPASS,PhotonFAIL). Новый чистый resolver+registry/switch+одна preview integration, без изменения цены/маршрута и без новых запросов.14namedgroups/81nodeanchors; дополнительныхsections0, pending2unknownкм. Финальный gate851/851+quote/API,ESLint,webpack/TypeScript/static16/16PASS; initialfocused18PASS. PNPM fallback один раз не дал итог тестов — повторены прямые команды, это отражено в checkpoint; full log содержит851PASS. Benchmark21000calls:p95 named0.0041мс,4096segment projection0.6595мс; E2E10снепроверен. Новые stops/известные блокеры в BLOCKERS.md. Следующий шаг после durable readback — offlineADDRESS-001,без ожидания тарифов/км.


## 24.10.2026 — DONE уточнения исполнения блоков

[Checkpoint](../../docs/checkpoints/2026-10-24-sequential-blocks-one-response-DONE.md). Source9ffada1/PR14draft, CI40069527041overall success (job статусы этим шагом не оценивались). Ранее small-step/recovery правила существовали; теперь явно указаны предварительная разбивка и несколько последовательных сохранённых блоков в одном ответе, без ожидания «дальше». Docs-only, diff/link/content checks; tests/build не повторялись. Следующий development блок прежний: offline ADDRESS-001.


## 24.10.2026 — block1 DONE address fan-out diagnosis; block2 STARTED

Source deed213/PR14draft подтверждён. [Checkpoint/план](../../docs/checkpoints/2026-10-24-address-diagnosis-DONE-pool-STARTED.md).7–13URLs на один autocomplete, один Photonorigin, нет server concurrency/singleflight/circuit. ExistingUI debounce/abort/cache и общий компонент A/B сохранены; B-only причина не доказана. Counts10queries/offline/live0. Официальный PhotonREADME проверен web: demoavailability не гарантируется. Следом bounded optionalpool с cancel/cache/circuit, затем endpoint regression; никаких новых маршрутов/геокодеров/цен. Docs-only сохранение помечается skipci после завершения текущегоCI, codecommit с обычнымCI.


## 24.10.2026 — block2 DONE addresspool / block3 endpoint STARTED

Source43d4813 с exactremote readback. [Checkpoint](../../docs/checkpoints/2026-10-24-address-pool-DONE-endpoint-STARTED.md).pool2/queue64/cache128URL5мин/singleflight/cooldown15с и querybudget20с; preabortedfetchguard, partial/unavailableprivacylogs. Focused54,full863,quote/API,ESLint,webpack/TypeScript/static16/16PASS; live0. После partiallog/slow11.3s regression gates повторены и финальный output сохранён. Промежуточныйcodecommit skipci после full localgate (причина: один liveCI на финальныйблок3, пользователь уведомлён); workflowнеизменён. Далее без команды«дальше» endpointsequence/abort/cache regression. Externalavailability/mobile/B-only не доказаны; тарифы/км не менялись.


## 24.10.2026 10:27 МСК — block3 DONE, серия ADDRESS mitigation завершена

Source479f9dc/treeb8d38e9 exactremote/PR14draft подтверждён доendpointблока; workflows[]напромежуточномskipci. [Подробныйитог](../../docs/checkpoints/2026-10-24-address-endpoint-series-DONE.md). Nextendpoint/r deterministicsequencepassed:40mockfetch,peak2,cache0extra,sharedcancelAнепортитB,partial503positiveсохранён,cooldownretry0extra. Initialfixturefailure34vs30calls сохранён:lowercasebboxqueries mockнеузнавал; исправленmock,prodнеизменён/assertionsнеослаблены. Финальныйfocused48/full864/quote/API/ESLint/buildTypeScript/static16/16PASS,live0. ФинальныйcommitобычныйCIбезskip. Externalavailability/mobileB-only/10сE2Eнепроверены; tariffs/kmбезизменений. СледомCIreadbackитоговогоhead, безстарыхrouteаудитов.


## 24.10.2026 — CIreadbackDONE / PreviewsmokeSTARTED

Source849102c/tree7ed6f91/PR14draft проверен. CI40074351547verifyPASS/geometryPASS/legacyPhotonFAIL;legacyprobeнапрямуюfanoutбезновогоpool,summary10/13queries76failures. ExactPreviewREADYdpl_3oCZcqnjbj8BKWtbzDN7YvcT9VXx. [План](../../docs/checkpoints/2026-10-24-address-live-STARTED.md):≤3PreviewGETs,stopприошибке,затемнезависимыйruntimeprobe/CIpathfix. NovyliveдоSTARTED0. Документыskipci, обычныйCIитоговогокода;Productionнет.


## 24.10.2026 — boundedPreviewDONE, poolcooldownregressionFOUND

[Checkpoint](../../docs/checkpoints/2026-10-24-address-preview-DONE-circuit-fix-STARTED.md).ExactPreview849102c,dpl_3oCZcqnjbj8BKWtbzDN7YvcT9VXx:3GETРостов200/Красн200/Донецк502. RawAPI/logsсохранены;server578/159/16мс,connector7498/2449/2884мс. Logsдоказали1http503причастичномsuccess→origincooldown7следующемугороду. Этонашаnewpoolregression,неисходныйB-onlyproof. STOPADDR-CIRCUIT-001открыт;приоритетисправитьthreshold3+successreset/regressionиfullgate. ProbeCIpathотложеннаследующийблок,Productionнет.


## 24.10.2026 — ADDR-CIRCUIT-001 codefixDONE / runtimeprobeSTARTED

Sourceb54f7d8/treec5e753c exactremotechecked. [Checkpoint](../../docs/checkpoints/2026-10-24-address-circuit-fix-DONE-runtime-probe-STARTED.md).Threshold3/полное15сstreakwindow/successreset,new3contracts. Endpointpartial200→newcity200,отдельныйполныйoutage<=4fetch/502иcacheсохранён. Послеуточненияwindowиprovenancemetadataфинальныеfocused16/full867/quote/API/ESLint/webpackTypeScript/static16/16PASS;нельзясчитатьповторныеgateотдельнымиrouteпроверками. Liverequest0вэтомблоке,новыйPreviewнепроверен. СледомactualruntimeCIprobeбезlegacyfanout,progress/≤3queries60с. Intermediatecode skipci,обычныйCIфинальногоprobecommit.


## 24.10.2026 — actualruntimeCIprobeDONE / finalfixsmokeSTARTED

Parent5d7043a/tree2f1c640 exactreadbackпроверен. [Checkpoint](../../docs/checkpoints/2026-10-24-runtime-address-probe-DONE-livefix-STARTED.md). Новыйproductioncollectorprobe3queries/≤60сnetworkbudget/atomicprogress/sourcechecks,legacyнеизменён. CIзаменёнтолькоPhotonstep/artifacts.31focused/875full/quote/API/ESLint/webpackTypeScript/static16/16PASS;rawcap500flag,live0. ExactfixPreview5d7043aREADYdpl_4R2Lqb1f6C9WPHYoheU2mjDU9zss;app/lib/dataбезdiff. Следом3GETlivefixsmoke→отдельноесохранениеобычнымCI;этотcodecommitintermediateskipci,обязательныелокальныеgatesпрошли.


## 24.10.2026 — workflowtransferrecovery

Remote5203f3a/tree682346b содержалscript/tests/docs,workflowнепопалвindexиз-заsparsegitaddwarning. [Checkpoint](../../docs/checkpoints/2026-10-24-runtime-probe-workflow-transfer-DONE.md). Ошибказамеченадопереходакlive. Готовыйworkflowсохраняется--sparse/exactremotepathreadback,неповторяявычисления. Live0вэтомrecovery,обязательнаяпроверка875/buildужеготова.


## 24.10.2026 11:26 МСК — fixPreviewsmokeDONE / сериязавершена

Parent16644a3/tree5542454remotechecked,workflowblobecb7469runtimeprobe/artifactsreadbackPASS;filesystemhashпослеsparseSwitchENOENTисправленчтениемGitobjectбезповторатестов. ExactfixPreview5d7043a/dpl_4R2Lqb1f6C9WPHYoheU2mjDU9zss/app-lib-dataidentical:3GETРостов200/Красн200/Донецк200,ДНРпервым/Ростоввторым,connector7425/4187/2426мс. Rostovruntimepartial1http503/236мс;sourceoutsвсёещёбывают. Междуqueries19–29с,невыдаватьзаsameprocess<15сproof(этотконтрактвтестах). [Подробныйитог](../../docs/checkpoints/2026-10-24-address-live-fixed-series-DONE.md). Локальныйcodegate875/buildPASS,этотdocs-only/liveшаггейтынерепитил. ФинальныйобычныйCIбезskip,далеечитатьегоactualстатусы. Productionнет.


## 24.10.2026 — runtimeCIreadbackDONE / KM-001intakeSTARTED

Sourcee0295e4/PR14draft exactheadпроверен. Run40078223671verify/geometryPASS,newaddressruntimeprobeFAIL(2225мс,Ростов/КраснPASS,Донецк4http503+3cooldown/0features);50/YandexSKIPPED. [Checkpoint/лимиты](../../docs/checkpoints/2026-10-24-runtime-ci-DONE-km-intake-STARTED.md), JSONлогвыборкасохранён. Externaloutageлогирован,перешликинезависимомуKM-001:2pendingnodes/≤2API+≤4websourcequeries. Быстрыйofflinecaptureinspectподтвердилотсутствиеmatchedoutputshape,новыйroutingне запускать. Неповторять875testsрадиretrieval.


24.10: первая попытка передачи завершилась TypeError до GitHub write: JS helper предыдущего сеанса отсутствовал в памяти инструмента. Это восстановление транспорта, не Git permission failure. Восстановить helper, передать готовое дерево и проверить remote head/tree; расчёты/CI/retrieval не повторять.


## 24.10.2026 — KM boundedintakeDONE/dataBLOCKED / PERF reviewSTARTED

Parent4af5b44/tree95bfbc8remotechecked. [Checkpoint](../../docs/checkpoints/2026-10-24-km-intake-DATA-BLOCKED-performance-STARTED.md).2OSMAPIurlsнедоступны/4webqueries/2primaryopens:точныекмнеполучены. Отклонён1038км—officialarticleописываетНовочеркасск,аПлатовдругойобъезд. РосавтодорPDFtimeout. Captureend_nodeнетlatlon/km/outputshape. ResultJSONсhash/edgefieldsсохранён,anchors/sections0новых/runtimeнеизменён. СледомнезависимыйPERF-001existingtimingsreview,неподмена10сE2Eмоками;docschecksбезповторныхfulltests.


# DONE — PERF-001: отключаемая диагностика времени, 24.10.2026 МСК

Родитель: 7cfebc004c75ed70ccc7d62e897edcb7572a2f2a. Работа по сохранённому STARTED: 2026-10-24-km-intake-DATA-BLOCKED-performance-STARTED.md. Существующих замеров полного обработчика V3 и его стадий не было; maxDuration120 и deadline matching18с не заменяют измерение.

Добавлен lib/calculation-timing.ts, переключатель calculationTiming в data/toll-feature-switches.json. POST V3 измеряет обработчик, чтение body, geocoding, special_options, обычный route_leg и response_pricing. В обычном route_leg отдельно измеряются параллельные Valhalla/OSRM/BRouter, routing, toll_matching, toll_pricing. Ответ получает Server-Timing; сервер — structured calculation_timing с фиксированными названиями, статусом, длительностями, количеством ошибок, targetMs10000/overTarget и stops. Адресов, координат, URL, текста исключений в диагностике нет. Ошибки clock/logger не ломают расчёт. Повторный finish идемпотентен; поздние spans не меняют итог.

Это наблюдение, не оптимизация или новый deadline. Не меняются выбор маршрута, тарифные данные, неизвестные суммы и fail-closed guards. Новых сетевых запросов0. Параллельные и вложенные стадии пересекаются: суммы стадий нельзя считать общей длительностью. handlerElapsedMs начинается при входе в POST и заканчивается перед установкой заголовка/отправкой ответа; не включает cold import, очередь до обработчика, браузер и передачу. Специальные коридоры измерены общим special_options без детализации внутренних провайдеров. Полные10сE2E UNVERIFIED; не сокращать обязательную проверку цены ради этой цели.

Проверки: 5 новых unit contracts (значения/ошибки/отключение/сломанный clock/logger/параллельность/порог/идемпотентность), существующие V3 API contracts дополнены заголовками на успешном и раннем ошибочном пути. Focused9/9, full880/880, quote/API contracts PASS, ESLint PASS, Next webpack build/TypeScript/static16/16 PASS. Raw logs и SHA256: experiments/road-ref-boundaries/checks/2026-10-24-calculation-timing/verification.json. Полный набор запущен после runtime-правок; дополненные только assertions API отдельно прошли focused. Родительский head PR14 подтверждён, workflow_runs пуст (docs skipci). Этот code commit запускает обычный CI; его завершение не заявлено заранее.

Сохранить отдельным commit/nonforce remote/readback, затем прочитать фактический CI. Следующая задача: на доступном Preview собрать ограниченный POST timing одного уже известного контрольного маршрута, только если есть поддержанный POST-транспорт; сохранить Server-Timing и статус цены, не повторять полный route corpus. Если транспорта нет — записать ограничение, не подменять E2E офлайн replay. KM-001/002 и внешняя Photon availability остаются BLOCKED_BY_DATA/SOURCE. Main/Production/merge/backup/Android не изменялись, PR14 draft.


# DONE timing CI / STARTED bounded Preview check — 24.10.2026 МСК

Проверен remote PR14 head5d8e9041d5de5cf0240e3316d91bb1f88ed97f13, draft. CI40081150517 завершён: verify tests/TypeScript/build PASS; live geometry PASS; production address collector FAIL. Ростов1070мс/PASS/1http503; Красн528мс/PASS/2http503+4cooldown; Донецк191мс/SOURCE_UNAVAILABLE/4http503+3cooldown/0features. Общая address серия1798мс. 50/Yandex SKIPPED. Overall success вследствие continue-on-error, не все проверки PASS. Evidence: experiments/road-ref-boundaries/checks/2026-10-24-timing-ci/result.json. Известный внешний отказ повторно не исследуется без новых данных.

Следующий малый блок после durable: одна попытка расчёта Анапа→Краснодар на exact Preview source5d8e904, dpl_74Q9JjFXE9J78DvuEWBABTt7f8d2, https://mezhgorod-calculator-rnobeszbq-4regodatbe-5310.vercel.app. Получить статус/Server-Timing/цену и внешний elapsed при поддержанном транспорте либо сохранить ограничение. Не более одного POST расчёта; UI autocomplete только для этих двух городов; stop при недоступности защиты/источника, без broad audit/retries. Vercel connector web_fetch поддерживает только GET; браузер допустим для UI workflow, защита не отключается. Не извлекать секреты коннектора. Неподдержанный POST не заменять GET или офлайн измерением. 10с E2E остаётся UNVERIFIED до фактического результата. При blocked транспорта перейти к независимой локальной доработке детализации special_options только после отдельного плана/STARTED, без смены цен. Production/main/merge/backup не менять. Docs-only skipci, full880/build не повторять.


# Preview BLOCKED / STARTED special timing — 24.10.2026 МСК

Parent d4ca027fca819291c8913cdb63d3376253058eff/tree2639d883c3af11ab784260083042e4ce841ad1cf прочитан обратно. Exact Preview5d8e904 READY, browser GET перенаправлен на Login–Vercel. POST расчётов0, autocomplete0, измеренного E2E нет. Vercel web_fetch — GET-only; локальный vercel CLI отсутствует, linked project отсутствует. Защита/credentials не менялись, share secret не извлекался/не создавался. Это BLOCKED_BY_ENVIRONMENT_AUTH, не ошибка приложения и не bot block. Тесты/сборка не повторялись ради наблюдения. Одного неавторизованного GET достаточно; не повторять login попытки.

Следующий независимый малый блок STARTED: существующий optional calculationTiming передать последним необязательным аргументом calculateSpecialOptions, измерить provider_valhalla/provider_osrm/routing и обязательные toll_matching/toll_pricing внутри special_options. Fastest-only ветка: та же последовательность/Promise.allSettled, те же планы, критерии выбора, число fetch, тарифы. V2 без аргумента неизменён; обходные probes V2 не расширять. Метрики агрегированы по фиксированным labels без адресов/коридорных координат; не складывать пересекающиеся стадии. Проверить существующий special-options/API replay и добавить утверждения timing без новой внешней сети. Focused+fullgate+build, checkpoint/remote/readback. Это диагностика, не достигнутые10с и не устранение внешнего outage. Production/main/merge/backup не трогать.


# DONE — детализация времени special_options, 24.10.2026 МСК

Parent e180173d03a9f93b5955e59faee93b1a88c43895/tree2ae0623e02d48778863e9f3fa3de583e94b68615 проверен remote/tree. Первая PR readback сразу после записи вернула старый head из-за задержки; повторная вернула точный e180173 до разработки. Операции/тесты ради readback не повторялись. Родительский workflow_runs пуст (docs skipci), активного CI перед записью нет.

По STARTED 2026-10-24-preview-BLOCKED-special-timing-STARTED.md существующий CalculationTiming передан последним optional аргументом calculateSpecialOptions. Внутри V3 теперь provider_valhalla/provider_osrm/routing и обязательные toll_matching/toll_pricing измеряются тем же модулем. Все стадии используют фиксированные labels, агрегируются по планам; parallel/nested durations пересекаются. Единственный switch calculationTiming:false отключает весь сбор. Новый optional аргумент не меняет существующих callers, V2 и его обходы не изменены.

Файлы: app/api/v3/calculate/route.ts,lib/v3-calculation/special-options.ts,scripts/v3-route-selection-audit.test.ts. Тест успешного special-zone V3 OSRM при невалидном времени Valhalla дополнен проверкой всех7Server-Timing стадий и отсутствия BRouter/обходных запросов; существующие guards самого быстрого/запрет reentry/unknown продолжают действовать. Применяется полный сохранённый graph replay без внешней сети. Цены, число запросов и критерии выбора не менялись; это диагностика, не оптимизация и не подтверждение10с.

Фактически: focused16/16 PASS; full880/880 PASS; quote/API contracts PASS; ESLint PASS; Next webpack/TypeScript/static16/16 PASS. Команды прямые эквиваленты package test:audit с выводом в checks/2026-10-24-special-timing/*.log. SHA256 и сводка: verification.json. Новых live запросов0, Preview POST0. Следующий обычный CI запускается этим code commit, завершённым заранее не считать.

Первая Preview попытка прошлого блока остаётся BLOCKED_BY_ENVIRONMENT_AUTH: browser Login–Vercel, GET-only connector, CLI не установлен. После появления поддержанного авторизованного POST — один контрольный Анапа→Краснодар и timestamps/Server-Timing/статус цены; не повторять full live corpus вручную. Альтернатива следующего bounded блока — один in-process production POST на CI host с реальными источниками и доступными координатами, отдельно обозначить handler-with-network, а не deployed/browser E2E. Нужен самостоятельный STARTED/лимиты/артефакты, без фоновых обещаний/новых провайдеров. Сейчас NEXT: exactremote/readback и actual CI, затем только проверяемые runtime измерения. Photon availability и километры pending пары остаются source/data blockers. Production/main/merge/backup/Android не менялись, PR14 draft.


# DONE special timing CI / STARTED one runtime POST probe — 24.10.2026 МСК

Source77733f7043c806a5be6b450c4bfcb807f780b5e5/treeae5521f67cb81d80192142245b25c11ceb5e986e, PR14 draft подтверждён. CI40082403690 завершён: verify PASS, live geometry PASS, address collector FAIL;50/Yandex SKIPPED. Точная выборка лога и jobs: experiments/road-ref-boundaries/checks/2026-10-24-special-timing-ci/result.json. Не повторять внешний address outage без новых отличий. Пока CI был active, ветка не менялась.

Следующий ограниченный блок STARTED: отдельный diagnostic script запускает ровно один production POST handler V3 с городскими координатами Анапа37.32/44.90→Краснодар38.98/45.04, departureAt2026-10-13T09:00:00+03:00. Geocoding не требуется; существующие route/matching/pricing вызываются как в приложении, без новых providers/изменений runtime. Запуск в отдельном child process с жёстким общим лимитом60с/SIGKILL, атомарный IN_PROGRESS до работы и terminal artifact после ответа/timeout/error. Полный ответ API сохранить, summary содержит только статус, elapsed, Server-Timing, route totals и toll amount/status. Не назначать неизвестную цену0 и не называть положительную цену подтверждённым тарифом. handler-with-network отдельно от deployed/browser E2E, импорты/parent overhead отдельно, не суммировать stages.

Малые части в одном сеансе: script+offline contracts+fullgate/build → DONE/remote/readback; затем actual CI readback и сохранение одного runtime результата. Новый отдельный CI job (continue-on-error,timeout2min,artifact if always) не зависит от address/live job, чтобы известный Photon отказ его не пропускал. Не добавлять повторов/корпуса/матрицы/новых fetch в runtime; ровно один расчёт на CI, целью10с не обрывать основной калькулятор. По первому ответу/timeout сохранить причины и продолжать по результату, не перезапускать для зелёного статуса. Локально только offline tests; ограниченная сеть среды не подходит для live. Preview auth не обходить. Проверки probe: timeout child, crash/missing result,HTTP error/malformed API/missing timing, overtarget,unknown toll integrity,successful preserved body. Production/main/merge/backup/Android неизменны.


# DONE one-handler runtime probe / NEXT actual CI — 24.10.2026 МСК

Parent292e03b41222ae6318f2ab999e04d011e7d2d739/treee79f6e8943ef6d0b018d0937ad30f6ced04579f1 подтверждён remote/tree. По STARTED2026-10-24-special-timing-ci-DONE-runtime-probe-STARTED.md добавлен scripts/calculation-runtime-probe.mjs: parent записывает atomic IN_PROGRESS, запускает отдельный child с Node native timeout60000/SIGKILL, сохраняет terminal/partial при crash/missing output/timeout. Shellfalse,нет credential/network proxy изменений. Worker динамически импортирует настоящий POST/NextRequest и вызывает ровно один Анапа→Краснодар с фиксированными городскими координатами/датой. Других случаев/retries/геокодинга нет. Внешние запросы производит только существующий handler.

Артефакт calculation-runtime-probe.json содержит полный body и Server-Timing, importedMs, elapsedMs(handler+body parse), handlerElapsedMs, supervisorElapsedMs(import/process overhead), toll amount/status, отдельный overTarget10000 и schema/status. PASS относится к форме ответа и замеру, не подтверждению тарифа: tariffIndependentlyVerified:false; unknown amount:null допустим, unknown0—PRICE_INTEGRITY_ERROR. API_ERROR/INVALID_RESPONSE/TIMING_INVALID/OVER_TARGET/WORKER_ERROR/PROCESS_TIMEOUT не PASS и CLIexit1. Deployed/browser E2E:false. Не суммировать provider/nested spans.

Workflow .github/workflows/special-territory-policy.yml добавляет отдельный calculation_timing job, independent от live_probe/Photon,continue-on-error,2minjob/60sprocess,artifactalways/ifmissingerror. Прежние jobs/corpus не менялись; вручную старый широкий аудит не повторялся. Workflow restored outside sparse и должен stage --sparse с exactblob/tree verification, чтобы не повторить прошлую потерюworkflow.

Тесты scripts/calculation-runtime-probe.test.ts: HTTP/shape/missing/duplicate timing/slow/unknown integrity; ровно один injectedhandler/fullbody/atomicfile; реальный stalledchildkill,nonzeroexit,exit0безoutput;completedchild сохраняетbody.5новыхcontracts;focused10/10,full885/885,quote/API,ESLint,Nextwebpack+TypeScript/static16/16PASS. Logs/SHA256: experiments/road-ref-boundaries/checks/2026-10-24-calculation-runtime-probe/verification.json. Локальных live попыток0,эти offline времена не runtimeproof. Runtime app/lib/data не менялись.

NEXT в том же сеансе послеdurable: прочитать exacthead CI, отдельный calculation_timing job/log/полныйartifact;сохранить фактический статус/длительности/цены/ошибки, не перезапускать до зелёного. Если долгий runtime—выбрать только доказанную причину по stage timings, не урезать обязательный matching/не менять fastestpolicy. Если sourcefailure/timeout—логировать, не объявлять10с. До завершения active CI не писать следующий checkpoint в branch. Main/Production/merge/backup/Androidнетронуты,PR14draft.


# DONE — первый runtime POST с реальной сетью, 24.10.2026 МСК

Source98524ccc89f6be98a676ef6cd4f106b940e752ce/tree92e2ec4d760c946f369c1122cc9fccb0058aa332, PR14draft/remote/tree подтверждены. Workflowblobec088ffa56f78fdc5854ddcc57aa2d6599aa75a5 прочитан отдельно: новый calculation_timing действительно подключён, не потерян sparsecheckout. Run40082993536/job120840187906 success, ровно один production POST handler с реальными Valhalla/OSRM/BRouter/matching источниками. Ручных повторов и Preview POST0.

Анапа→Краснодар:HTTP200/PASS,OSRMсамыйбыстрый,165009м/8657с,А289 AnapaExit→Maryanskaya620₽/priced. Совпало с ранее данным пользователем контрольным620₽; новый независимый операторский тариф не подтверждался. Полный body сохранён в checks/2026-10-24-calculation-runtime-live/calculation-runtime-probe.json, JSONSHA25607395e271860378def367c090145c272ea1c863e5cd2474ecd142e2c143cd3e1. Artifact12555808383/zipSHA2561bc028f18ec9d129dfe206886c640bfb7358cc2c47ab7f98bfe81f56478035a7 сверены при скачивании; временныйdownloadURL не сохраняется.

Handler2225.425мс;вызовhandler+parse2230.925194мс;import325.410093мс;supervisor2621.04327мс. Routing1437.258мс,Valhalla1184.760/OSRM931.007/BRouter1422.401мс выполнялись параллельно;matching659.430мс,tollpricing48.794мс,responsepricing10.387мс. Стадии не суммировать с вложенными/параллельными span. Для этого одного server-with-network расчёта порог10с соблюдён. Это не deployedVercel/browser/networkпередача и не SLA для других маршрутов/новых территорий. Не сокращать проверки/не удалять провайдер по одному быстрому образцу. Техническая оптимизация этого пути без доказанного bottleneck сейчас не требуется.

Кодprobe уже проверен10focused/885full/quote/API/ESLint/webpackTypeScript/static16/16PASS и сохранёндоlive. Этот evidence/doc блок гейты не повторяет; исходныйruntimeapp/lib/data не изменялся. Точный финальныйCIстатус записан рядом вci-result.json после окончания всехjobs;доэтого branchне менялась.

NEXT: для специального маршрута отдельный bounded case/план с существующими данными и теми же hardlimits, чтобы проверить новую special_options детализацию; не повторять Анапа/control и старый широкийкорпус без причины. Километры/цены pendingpair иPhotonavailability остаются блокерами данных/источника, не угадываются. Запланированная своя дорожная сеть по-прежнему DEFERRED. Main/Production/merge/backup/Android не изменены.


ФинальныйCI40082993536:verify/calculation_timing/geometryPASS,addressFAIL,50/YandexSKIPPED. ci-result.json сохранён после завершения всех jobs;дополнительных запусков0.


# STARTED — один runtime special-route, 24.10.2026 МСК

Remote/local24e8343becea324821ca4edc1e41a115221abd22/treeab2143a82efede6cb63dc996d771047f8677bdd5, PR14draft подтверждены; workflow_runs пуст (docs skipci). Анапа→Краснодар уже измерена/сохранена, не повторять.

Следующие малые блоки в этом сеансе: (1) расширить существующий diagnostic probe двумя фиксированными case IDs, default legacy anapa-krasnodar сохранить; новый donetsk-moscow с уже используемыми в scripts/v3-route-selection-audit.test.ts координатами Донецк37.8029/48.0156→Москва37.6174782/55.7505412, та же дата. CI calculation_timing через CALCULATION_PROBE_CASE выбирает только donetsk-moscow: один POST/60с child/2min job, без матрицы/batch/retries. Case ID и фактический request передать worker и записать в progress/result/error; неизвестный ID отклонять до spawn/сети. Для special-case проверить specialEndpoint:true и наличие special_options/provider/routing/matching/pricing timings, иначе явный failure. Не смешивать outcome времени с подтверждённой ценой. (2) Focused/fullgate/build, DONE/remote/readback. (3) Первый фактический CI special POST/log/full artifact с SHA256, точная длительность/статус/ошибка; не перезапускать до зелёного, потом evidence checkpoint после завершения active CI.

Runtime app/lib/data/критерии fastest/тарифы не менять в диагностическом блоке. Только если новый замер докажет отдельный bottleneck — отдельный план/STARTED/минимальное исправление; обязательный matching не урезать ради10с. При timeout/sourcefailure записатьBLOCKED и продолжить независимое. Handler-with-network не deployed/browser E2E. Координаты известные городские контрольные, не личные адреса. Main/Production/merge/backup/Android не трогать. Широкий старый audit вручную не повторять; обычный существующий CI не отменять.


# DONE special probe setup / NEXT first actual CI — 24.10.2026 МСК

Parent4ecc0fbaaa071032ddbc09d78a94e3880bbac28f/tree3c93b534844f8f196dcf33476006ba53509cf509 подтверждён remote/tree. Первая PRhead readback сразу после update была устаревшей, повторная подтвердила нужный head до разработки. Готовые операции не повторялись. STARTED:2026-10-24-special-runtime-STARTED.md.

scripts/calculation-runtime-probe.mjs: явный whitelist anapa-krasnodar(default сохранён) и donetsk-moscow, fixed request copy,caseId в worker/progress/result/error; неизвестный ID отклонён до spawn/write/сети. Parent проверяет совпадение caseId и request, чтобы другойcase не дал ложныйPASS. Для Донецка проверяется specialEndpoint:true и6special/provider/routing/matching/pricing spans; отсутствующаяветка→ROUTE_POLICY_MISMATCH,отсутствующиеметрики→TIMING_INVALID. Actual requestFactory получает выбранный request; responsebody/prices не переписываются. Child60с/SIGKILL/atomicfile/2minjob сохранены.

Workflowcalculation_timing теперь черезenv CALCULATION_PROBE_CASE:donetsk-moscow запускает один специальный POST; Анапа в этом CIнеповторяется. Существующие broadjobs нетронуты. Runtimeapp/lib/data/тарифы/политики не менялись. CLIdefault всёещёАнапа для совместимости.

Добавлены2contracts: выбранный specialrequest/ветка/стадии/default/невалидныйcase безfile;wrongchildcase→WORKER_ERRORсpartial. Focused22/22,full887/887,quote/API/ESLint/webpackTypeScript/static16/16PASS. Локальныхlive0. Rawlogs+SHA256:checks/2026-10-24-special-runtime-probe/verification.json. Workflow stage --sparse и exactblobreadback обязательны. NEXTпослеdurable: первый обычныйCI exacthead, calculation_timingjob/log/fullartifact,сохранитьвремя/ошибку/цену сsha. Не повторять длязелёного. Еслиover10с—только отдельный доказанныйbottleneckfix послеcheckpoint/STARTED;обязательныепроверки/fastestнеослаблять. Main/Production/merge/backup/Androidнетронуты,PR14draft.


# DONE — runtime Донецк→Москва, 24.10.2026 МСК

Sourcea622a79f0a0e9a5cf406187b0139f6effa229886/treea2dd1bd713e18e440c7300f61d4eefbfaf17b4c8,PR14draft remote/tree подтверждены. Workflowblobca1006f603b4f72b87280a225c1ff5276a219fc6 exactpathпрочитан. Run40083903106/job120842817305 success:ровноодинcase donetsk-moscow,без повтора Анапы/перезапуска до зелёного. Полный artifact12556566090 скачан,zipSHA2564830d50de7283e5f6005ff37440cc9c471844c63cda0e05c55cb011c134d11cd проверен. JSONSHA256267eaf452a1ab54d399464a88b604de0e20ee0ac2b4802af819b80de02af66bc. Body/provenance:experiments/road-ref-boundaries/checks/2026-10-24-special-runtime-live/. ВременныйdownloadURL не сохранён.

HTTP200/PASS,specialEndpoint:true,mode:dual,preferredCorridor:mainland,один самый быстрыйOSRM option.1123250м/58336с;М4 m4-636→m4-71,amount3050₽,weekday3050/weekend3370/periodПн–Чт/constraintmatched. Это фактический ответ прежней матрицы,не новая операторская проверка тарифа;tariffIndependentlyVerified:false. Не расширять этот результат на pending короткую пару4443232947→358467208/все новые территории. Там unknown guards и недостающие цены остаются.

Handler7318.419мс;вызов+bodyparse7322.043186мс;import214.445472мс;process7587.324839мс. special_options6696.892мс;routing1115.330мс(providerValhalla985.476/OSRM1104.264parallel);matching3267.508мс;pricing891.989мс;responsepricing590.168мс. Каждыйprovider/routing/matching/pricing вызван один раз. Никаких лишних неиспользуемых corridorplans по этому фактическому случаю не обнаружено. Суммы вложенных/parallelspan не складывать. Порог10с соблюдён в этом одном server-with-network случае;это не Vercel/browser E2E и не гарантия длинных/других случаев. Доказанного превышения,которое требовало бы срочно менять алгоритм,нет;обязательнуюпроверку платных не сокращать.

Setup887tests/22focused/quote/API/ESLint/webpackTypeScript/static16/16PASS до live;новых runtimeправок этим результатом0. Этот evidence/docs шаг не повторяет gates. Финальные jobs/addresslog сохранены рядом вci-result.json после завершения всехjobs;до этого branch не менялась.

PERF-001 диагностическая серия завершена двумя разными путями:обычныйАнапа2.225с иspecialДонецк7.318с. Не продолжать её новыми однотипными маршрутами без конкретной ошибки/различия. Следующая практическая работа — bounded offline review устойчивости поиска при полном sourceoutage (что уже покрывает pool/cache,есть ли допустимый fallback), без новых live/retries/ослабленияranking/выдуманных координат. По короткому read-onlyосмотру data/ruwiki-settlement-index.json содержит2110имён и явно запрещает считать их координатами:координатнет,геометриятолькоlivegeocoder. Использовать этот индекс или benchmarkcenters как готовый резервный геокодер нельзя. Новых источников/координат этим блоком не активировано. Pendingkm/scope/тарифы пополнятьотдельно по надёжнымданным;своюсеть по-прежнемуDEFERRED. Main/Production/merge/backup/Androidнетронуты.


# DONE bounded offline outage/fallback review — 24.10.2026 МСК

Parenta95a7a902a3116c108f6e24b1e2581aac7b03352/treeb705702992ca68bec5ecee2da6a1452975d63a1d проверенremote/tree,PR14draft,workflow_runs пуст. Это короткий read-only review после сохранения specialruntime,не новая реализация/не повтор старого аудита. Новых запросовPhoton/маршрутов/тестовыхкорпусов0.

Проверены текущие lib/photon-request-pool.ts,address-search-service.ts,photon-fetch.ts,address-suggestion-cache.ts,photon-address-search.ts,app/api/suggest/route.ts,app/v2/components/address-field.tsx; поля source/coverage/entries локальногоRuWikiиндекса. Детерминированный вызов photonSearchUrls(Донецк) безсети:7URLвариантов,ровно1origin https://photon.komoot.io. Всеcountry/bbox/aliasварианты—окнаодногосервиса,не7независимыхгеокодеров. Приполномуказанном503кэша/координатдляновогозапросанет,изодногоназванияпозициювычислитьнельзя.

Три существующих слоя повторного использования:browserpositiveLRU128query/5мин;serverpositiveLRU128exactURL/5мин/singleflightвтёпломprocess;PhotonfetchNextrevalidate300. Они помогают только уже полученному успешномуответу и не дают общей гарантии междуcoldreplicas/браузерами. Ошибки/пустыеответывpositivecacheнепишутся. Stale/постоянногообщегоcachedataset/второгонезависимогогеокодера нет. Circuit3failures/15с,successreset,concurrency2process,queue64 и20сquerybudget уже проверены. Дальнейшее простое увеличениеtimeout/threshold или нажатияПовторить не создаёт координат и не является исправлениемполногоoutage.

UIочисткасбрасываетposition/label/items/error/open;cleanupотменяетпредыдущийtimer/controller;350мсdebounce/positivecache. НовыйB-onlyдефектэтимread-onlyосмотромне доказан;старыйреальныйcooldownбаг уже исправлен и отдельно покрыт. Mockcontracts последовательности clear/replace не заменяют исходныйтелефонныйliveproof.

ЛокальнаяRuWikiбаза2110имён явно source:Searchnamesonly;координаты/территорияизlivegeocodergeometry. Это не reservegeocoder. Settlementbenchmark имеетконтрольныекоординаты,но являетсяofflinebenchmark;его нельзяпродвигатьвliveпоиск/выбормаршрута. Старыеtrace/nodeIDs/названиядорогтоже неадресныйкаталог. Никакихданныхилиrankingэтимreviewвruntimeнепереносилось.

Итог:ADDRESS-FANOUT/CIRCUITfixedverifiedсохраняются;ADDRESS-AVAILABILITYBLOCKED_BY_SOURCE/ARCHITECTURE,неисправлено. Для новогохолодногоадресаприфуллoutageнуженлибо независимыйдопустимыйисточникautocomplete,либо отдельныйпроверенныйлокальныйкаталогнаселённыхпунктовскоординатами/источником/лицензией/алиасами/различениемодноимённых. Второйпутькасаетсяпоискагородов,неотложеннойдорожнойкарты,нонепокрываетулицы/дома. Повторныйкэшможноулучшитьотдельно,нооннеустраняетcoldqueryотказ. До sourceintake ничегонеактивировать.

NEXT: отдельный bounded primary-source intake для coordinate-settlement fallback (одиннадёжныйкаталог,coverageRU/UA/prioritypolygons,лицензия/размер/Russianaliases,неполнаяroadnetwork). До4primaryqueries/3docs;припробелеDATA_BLOCKEDбезугадывания,подробныйSTARTEDпереддлиннымdownload/implementation. Недостающиетарифы/км не блокируютэтонезависимоенаправление. Незапускатьновыйperfкорпус/повторитьтотжеPhotonCIвручную. Docs/evidence-only diff/linkchecks,887codegates/buildнеповторяются. Main/Production/merge/backup/Androidнетронуты.


## 24.10.2026 — ADDRESS-001: source intake GeoNames DONE, next pilot pending

По поручению выполнить не более4поисковыхзапросов/3primary docs изучены official GeoNames export/readme и Geofabrik Russia extract. Исходный branch `fix/v3-missing-route-prices-2026-10-15` parent `39465bf1022976153188acfd92a09dc10b4926a0` tree `9108c92551a443e3a5cfe531bcb13bffbf215e89`, PR14 draft. Итог: GeoNames CC BY4.0 WGS84 country dumps/aliases/admin — предварительный кандидат для отдельного opt-in offline settlement fallback, **не** подтверждённая конкретная геобаза; Geofabrik OSM РФ ~3.9GB/ODbL непрактичен для текущего пилота. Из-за неизвестных размеров, полигона приоритетных территорий, русских алиасов/одноимённых поселений координаты не допущены к runtime. [Полные критерии, URL и checks](../../docs/checkpoints/2026-10-24-address-coordinate-source-intake-DONE.md). Сеть: поисковых запросов4, прочитанных primary docs3; скачиваний0, Photon/live/route/test/build0. Docs-only, история сохраняется; следующий шаг — STARTED перед импортом, отдельные bounded gates. Не утверждать, что 887 тестов повторно запускались.


## 24.10.2026 — bounded GeoNames delivery pilot STARTED

После прочитанного обратно исходного source intake commit `868bb9738d158a35b325d3e97456eb98a580c7e1` оформлен [план pilot A/B/C](../../docs/checkpoints/2026-10-24-address-geonames-pilot-STARTED.md). Первый мини-блок не скачивает ZIP: ≤3 HEAD country RU/UA+V2 для HTTP+размера. B импортировать только после отдельного STARTED, лимита50MiB и checksums; C на проверенных кейсах, до runtime module ещё отдельное approval-gate. В STARTED нет новой успешной проверки. Source fallback пока не реализован, Photon outage открыт.


## 24.10.2026 — GeoNames HEAD pilot A BLOCKED_BY_ENVIRONMENT_DNS

После durable STARTED (`1e38e0b6544f107a8299ce396474fe78dd340f15`) на текущем контейнере исполнена команда: `curl -sS -I --max-time 10 --connect-timeout 6 -L` на `RU.zip`, `UA.zip`, `alternateNamesV2.zip`; каждый вернул exit6/HTTP000/`Could not resolve host: download.geonames.org`. ZIP/files/headers/bytes0; данные/coverage/import не проверены. [Checkpoint](../../docs/checkpoints/2026-10-24-address-geonames-head-DNS-BLOCKED.md). Это DNS окружающей среды, не оценка работы GeoNames. Повтор без изменения доступа не нужен; независимый шаг — проверка интерфейса для future opt-in settlement fallback, read-only. Текущий calc/routing/price/code untouched; CI не запускали.


## 24.10.2026 — settlementFallback optional interface DESIGN DONE

В рамках следующего независимого маленького шага после DNS блокера прочитаны `lib/address-search-service.ts`, `lib/photon-request-pool.ts`, `lib/photon-address-search.ts`, `app/api/suggest/route.ts`, `app/v2/components/types.ts`, `data/toll-feature-switches.json`, `lib/address-suggestion-cache.ts`. Определён [контракт](SETTLEMENT_FALLBACK_INTEGRATION.md): новый необязательный источник только при total `unavailable` текущего Photon, compatible `Suggestion`, отдельный origin/id geonameid/admin, проверенные WGS84/территориальные полигоны, 502 при пустом/unverified snapshot, no street/house, общий request budget без удвоения. [Датированный checkpoint](../../docs/checkpoints/2026-10-24-settlement-fallback-contract-DONE.md) содержит прочитанные SHA/точные проверки. Это проект документации; code0/tests0/live0/ZIP0. Следующий source step только после network change: pilot A bounded HEAD; B-STARTED перед download и code STARTED перед внедрением. Не трогать PR14 draft/main/Production/backup.


## 24.10.2026 — recovery remote7058f97 / acceptance matrix DONE

Сверены actual PR14 draft/head и последние completed CI. В текущем checkout восстановлены четыре exact blobs из partial clone; исходный tree подтверждён. Готовые source intake/pilot DNS/design не повторялись. Добавлена SETTLEMENT_PILOT_ACCEPTANCE.md с evidence/stop criteria; это не выполненная проверка данных. Подробнее: docs/checkpoints/2026-10-24-fallback-recovery-acceptance-DONE.md. Docs diff/link checks; code/build/live0. NEXT pilot A при изменении доступа; B STARTED до download; guards/Production без изменений.


## 24.10.2026 — GeoNames CI HEAD STARTED

Отдельная сеть GitHub runner для bounded Pilot A: .github/workflows/geonames-delivery-pilot.yml. Только3HEAD, contents:read/no writer, артефакты/headers/progress, ZIP0. План: docs/checkpoints/2026-10-24-geonames-ci-head-STARTED.md. После durable проверить actual run; B только отдельным STARTED. Source prior2d399b3/PR14draft, production untouched.


## 24.10.2026 — Pilot A DONE / B STARTED

Новая сеть runner доступна: run40091487220,3HEAD200, RU+UA17657946bytes; rawheaders artifact12559197312, result постоянно в checks/2026-10-24-geonames-head-ci. Создан отдельный B-workflow2ZIP/exactETag/bytecap/SHA/CRC, без runtime/aliases; YAML compile/limits PASS, local live0. План: docs/checkpoints/2026-10-24-geonames-ci-head-DONE-download-STARTED.md. Дождаться B, сохранить результат, C отдельно.


## 24.10.2026 — country download B DONE / C STARTED

Run40091634576/2ZIP17.7MB, exactSHA/CRC+local artifact digest PASS. Permanent manifest: checks/2026-10-24-geonames-country-download; rawartifact14days. Общий автоматически запущенныйCI40091639551 completed/verify geometry timingPASS,addressFAIL,50/YandexSKIP. Новый маршрутный аудит вручную не запущен. Checkpoint: docs/checkpoints/2026-10-24-geonames-download-DONE-review-STARTED.md; next C offline8names/4polygons/format+identity, no runtime.


## 24.10.2026 — GeoNames offline C DONE

C STARTED e6578e8 прочитанremote;5.789сoffline/458879строк237006P/0invalidduplicate.93selectedrawrows/hash/admin/geometryсохранены.7/8queriesambiguous;2ТарасовкивДНР;labels/ruV2/accuracy/completenessнеподтверждены. Коданализа/commands/results: checks/2026-10-24-geonames-review; checkpoint docs/checkpoints/2026-10-24-geonames-offline-review-DONE.md. Selftest/conservation/rawrow93checksPASS,calculatorruntimeunchanged/network0. NEXT короткийpolicyreview93records + independentvalidation;неактивировать.


## 24.10.2026 — bounded candidate-policy/source review DONE

ПослеCremote08109c5,4queries/3primarydocs(2READ/1timeout). Officialcodepolicyonly,93recordsallcandidate-types/7ambiguousqueries. LuhanskQ134279identity702658corroborated,butP625Wikipediaimport/notindependent/pointdelta723.027m,accuracyUNVERIFIED. Donetskdoc timeout. policy/result/checkpoint docs/checkpoints/2026-10-24-geonames-policy-review-DONE.md;JSON/counts/math/links/diffPASS,runtime/networkroutes0. NEXTnewboundedprimarycentres/adminlabels,noactivefallbackbeforevalidation/STARTED.


## 24.10.2026 — country alias source DONE / delivery STARTED

2searches/2officialdocs: alternatenames/countryRU~12M/UA~2.2M,общийV2ненужендляпроверкивозможности. SchemaещёUNKNOWN;CCBY4.0/specизофициальногоreadme. Созданread-onlyworkflow2HEAD+2GET/50MiB/exactETag/SHA/CRC,передсетьюSTARTED: docs/checkpoints/2026-10-24-geonames-country-alias-source-DONE-pilot-STARTED.md. YAML/compile/constraintsPASS;runtime0. NEXTactualCIresult,completedthenofflinealias/adminjoinSTARTED.


## 24.10.2026 — country aliases delivery DONE / join STARTED

Run40094650834/2HEAD2GET/PASS,RU+UA14.95MB,exactSHA/CRC/outerdigestPASS;manifest checks/2026-10-24-geonames-alias-download. ОбщийавтоматическийCI40094656564completed,последосмотраstepsсохранитьотдельно. Sourcec63e984/tree1ba2fb0,PR14draft;NEXTdurableSTARTEDofflinejoin93ids/admins/ruhistory,неактивироватьcoords. План: docs/checkpoints/2026-10-24-geonames-alias-download-DONE-join-STARTED.md.


## 24.10.2026 — ru/admin join DONE / remainder STARTED

10fields/all1,427,089aliases/0invalidduplicate;93exactadminbindings;92city/77adminru,25labelissues/17collisiongroups/2Latinru-taggedadmins.190rawrurows+SHA+flagsсохраненывchecks/2026-10-24-geonames-alias-join;selftests/dataset3.623с/93ids/190hashPASS. Runtime0/network0. Checkpoint docs/checkpoints/2026-10-24-geonames-alias-join-DONE-refinement-STARTED.md;NEXTboundedADM3/4remainderпослеdurable,неповторC/downloads.


## 24.10.2026 — ADM3/4 label remainder DONE / DATA_BLOCKED

Durable934ff22;52remainder,44exactADM3/4bindings/ru0;57missingcodeentries;addedlabels0. Russian-scriptguard19collisiongroupsvs17baseline,ДНРТарасовкинеразличимы;93idsнепотеряны. Selftest/dataset2.517с/93ids/44bindingrawhashPASS,network0/runtime0. Result/repro checks/2026-10-24-geonames-label-refinement;checkpoint docs/checkpoints/2026-10-24-geonames-label-refinement-DATA-BLOCKED-DONE.md. NEXTинойисточникlabels/coordinatevalidationилиreviewedsubset,неповторGeoNamescycle. CI40094656564stepsсохраненывalias-download/ci-readback.json.


## 24.10.2026 — bounded second-source DONE / next captured-positive subset review

4queries/1officialOSMlicensedoc,нетдопущенныхрусскихadminlabels/coordsдля2ДНРТарасовок. PrimarysourcegapBLOCKED_BY_DATA. Checkpoint docs/checkpoints/2026-10-24-address-secondary-source-review-DONE.md. NEXTкороткийofflineосмотрреальныхPhotonpositivecaptures,неbenchmark/недownload/нетрассы;возможенмалыйverifiedlocalcitysubsetтолькопослеreviewmanifest/STARTED. Runtime0/live0;docslinks/diffchecks.


## 24.10.2026 — positivecitysubset review DONE / default-offmodule STARTED

Exact4SuggestionизуспешныхPreviewcaptures/captureSHA/sourceDate/sourceID/territoryPASS;0newcoords/network/benchmark. Snapshot/review checks/2026-10-24-positive-city-subset. ДанныеPhoton/OSM,availabilitylocal—notindependentgeodesy. План/docs/checkpoints/2026-10-24-positive-city-subset-DONE-module-STARTED.md:addressCitySnapshotfalse/fulloutageonly/expiry7days/remaining20с/cancel/UIlimitedcoverage+ODbLcredit/focused+fullgates. NEXTпослеdurableреализоватьбезактивации,GeoNameslargecatalogremainsblocked.
