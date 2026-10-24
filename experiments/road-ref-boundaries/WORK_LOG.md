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
