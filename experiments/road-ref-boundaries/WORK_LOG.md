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
