# Пробелы и отложенные проблемы

Обновлять датированными записями; рабочая часть алгоритма продолжается независимо. Unknown не free, неподтверждённая цена не0. Закрытие требует фактического evidence.

| ID | Статус 24.10.2026 | Наблюдение / влияние | Следующий независимый шаг |
| --- | --- | --- | --- |
| KM-001 | BLOCKED_BY_DATA | У graph pair4443232947→358467208 нет проверенных официальных километров/координат output shape; нельзя назначить соседний км | Добавить reviewed anchor/section с источником в локальный реестр, модуль не блокировать |
| KM-002 | BLOCKED_BY_DATA | Полной калиброванной геометрии обходов/шкал км нет | Пополнять только нужные sections; свою дорожную сеть не строить |
| PERF-001 | DIAGNOSTICS_DONE / browser E2E UNVERIFIED | Два real-network handler случая: Анапа2.225с,Донецк7.318с; общего SLA нет | Не расширять однотипный корпус без нового медленного случая; сохранять обязательные проверки |
| ADDRESS-001 | LOCAL_FIX_VERIFIED / AVAILABILITY_BLOCKED_BY_SOURCE | Pool/cancel/cooldown исправлены и проверены; cold query при полном Photon503 всё ещё502, B-only не доказан | GeoNames geometry+language intake DONE; ru city92/93, base admins77/93 (2 Latin), extra ADM3/4 ru0/44,19 label collisions. Runtime blocked by labels/independent accuracy/reviewed snapshot; no repeat of completed GeoNames joins |
| TARIFF-001 | BLOCKED_BY_DATA | Scope/цены graph pair pending unknown, активных новых строк0 | Заполнить проверенный scope/источник/даты отдельно |
| DOC-001 | DEFERRED |24.10 web open OSM milestone timeout, новых данных не извлечено | При сборе реальных anchors проверить первичный источник; для локального ядра не блокер |

Исходные статусы/логи: docs/checkpoints/2026-10-24-road-ref-recovery-DONE.md и checks/2026-10-24-recovery/ci-status.json. Новые runtime стопы возвращать структурированно в диагностике расчёта; не писать синхронные сетевые/file logs в критическом пути.

## 24.10.2026 — результаты реализации

KM-001/KM-002 остаются BLOCKED_BY_DATA: локальное ядро/индекс/проекция готовы, но real pending pair по-прежнему без км.14 named groups/81 nodes добавлены из прежнего runtime inventory только как номинальные позиционные anchors; новых live данных0. Projection проверена synthetic; reviewed реальных sections0. PERF-001 остаётся UNVERIFIED для E2E10с; локальные CPU замеры — checks/2026-10-24-kilometrage/performance.json. ADDRESS-001/TARIFF-001 не переделывались этим этапом. Попытка прочитать ещё работающий job120797900591 вернула GitHub logs404 BlobNotFound; трактуется как недоступность незавершённого лога, без повтора маршрутов/отмены CI. Правки обязательных source проверок не пропускались.

## 24.10.2026 — ADDRESS-001 mitigated, availability UNVERIFIED

Избыточный7–13parallelfanout заменён boundedprocesspool/singleflight/cache/cooldown и20собщимbudget. Contractsgate54/863/buildPASS; следующийendpointregression отдельно. Реальнаядоступностьсервиса/исходныйmobileсбой/B-only причинность не подтверждены. Успешныйкэш толькоуже полученныхURL, холодныйновыйадрес приoutageпо-прежнему502. Никаких выдуманныхкоординат/новыхAPI. ДлинныйCIплан: промежуточныйcodecommit skipci приполномlocalgate, обычныйCI послеendpointблока; CIограниченияwriterсохраняются.

## 24.10.2026 — ADDRESS endpoint proof / ограничения

ADDRESS-FANOUTfixed-and-verified:poolcontracts+настоящийNextendpoint/rсdeterministicPhotonmocks,864fullgate/buildPASS. ADDRESS-AVAILABILITY/mobileB-onlyUNVERIFIED:live0,приoutageновыйадрес502. Sharedcancel/cache/sequentialreplacementPASS;40mockrequestspeak2. TEST-FIXTURE-001закрыт:mockнеузнавалlowercasebboxварианты,исходныйлогсохранён,поправлентолькоfixtureбезослабленияassertions. Очередь/параллельностьпроверенывпроцессе,междуreplicasнетглобальнойкоординации.

## 24.10.2026 — ADDR-CIRCUIT-001 OPEN / live regression

Preview849102c/3GET:Ростов200,Красн200,Донецк502. Runtime7source_cooldownпоследнему,1http503впредыдущемpartialresponse. Нельзяглобальноблокироватьследующийадреспослеединственного503придругихsuccess. Приоритетthreshold3безsuccess/15с,+resetуспешнымответом;testpartial→newcoldquery.Несчитатьисправленнымдоgates. Старыйendpointtestзакреплял502послеpartial;поправитьтребование,добавитьполныйoutageотдельно. Evidence:checks/2026-10-24-address-live.

## 24.10.2026 — ADDR-CIRCUIT-001 fixed/contracts, liveafterfix UNVERIFIED

Threshold3серийных503429за15ссначалаstreak+successreset.16focused/867full/buildPASS. Частичныйответнеподавляетследующийcoldaddress;fulloutageпродолжаетохлаждаться. Endpointtestисправлен,новые3contractsдобавлены. ЖивойстарыйPreviewс502сохраняетсяevidenceошибки;новыйliveрезультатнезаявляется. СледомисправитьCIharnessbypass,independentexternal503causeостаётся.

## 24.10.2026 — finalfixPreview3/3PASS / sourcehealthчастичный

ADDR-CIRCUIT-001fixedcontracts+новыйPreview5d7043aпоказалРостов/Красн/Донецк200;sourcepartial503вRostovlogсохраняется. КонкретныйисходныйphoneB-onlyUNVERIFIED,нетsameprocess<15сliveisolation. CI-HARNESS-001fixed:legacybypassзаменёнproductioncollectorprobe;SPARSE-PERSIST-001fixed:workflowпотерянприgitadd,восстановлен--sparse/readbackblobecb7469,sourceгейтынеповторялисьрадипередачи. Runtimefileпослеswitchскрывалсяsparse,Gitobjectreadbackподтверждён. СледомactualnewCI;overallsuccessнеравноlivePASS.

## 24.10.2026 — actualruntimeCI40078223671

ADDRESS-AVAILABILITYBLOCKED_BY_SOURCEвэтомrun:Донецк4actualhttp503+3cooldown,0features;Ростов/КраснPASS,2225мстotal. Harnessпроверяетновыйpool,ошибкаsourceявнаянеPASS. Verify/geometryPASS;50/YandexSKIPPED. СледомнезависимыйKMsourceintake2nodes,sourceoutageнеповоддляновогоширокогоroute/retryаудита.

## 24.10.2026 — KM-001 boundedsourceintakeзакрыткакBLOCKED_BY_DATA

2OSMAPIopensинструментомнедоступны;4primarysearchqueriesнепривязаликмкexactnodes.1038кмАвтодораотносятсякНовочеркасскойразвязке,неприсваиватьПлатову.PDFРосавтодораtimeout.Сохранённыйtraceнеимеетoutputshape/latlon/km.Ограниченныйintakeсохранёнвchecks/2026-10-24-km-intake/result.json;runtimeanchors/sections0новых. ПовтортехжеAPI/searchбезсменыисточника/доступаненужен. Следующийsource—точныйOSMobject/linkedmilestoneилиоператорскаясхемасbranch/scale/km. ПерешликнезависимомуPERFreview.


## 24.10.2026 — PERF-001 diagnostics DONE / E2E UNVERIFIED

Отсутствие стадийных замеров устранено отдельным calculationTiming. Local880 tests/build PASS. Это не ускорение и не доказательство10с. Нет измерения браузера/cold start/передачи; special_options пока общий span. Следом actual CI и bounded Preview POST при доступном транспорте. Новая сеть0; KM/source blockers сохранены.


# Preview BLOCKED / STARTED special timing — 24.10.2026 МСК

Parent d4ca027fca819291c8913cdb63d3376253058eff/tree2639d883c3af11ab784260083042e4ce841ad1cf прочитан обратно. Exact Preview5d8e904 READY, browser GET перенаправлен на Login–Vercel. POST расчётов0, autocomplete0, измеренного E2E нет. Vercel web_fetch — GET-only; локальный vercel CLI отсутствует, linked project отсутствует. Защита/credentials не менялись, share secret не извлекался/не создавался. Это BLOCKED_BY_ENVIRONMENT_AUTH, не ошибка приложения и не bot block. Тесты/сборка не повторялись ради наблюдения. Одного неавторизованного GET достаточно; не повторять login попытки.

Следующий независимый малый блок STARTED: существующий optional calculationTiming передать последним необязательным аргументом calculateSpecialOptions, измерить provider_valhalla/provider_osrm/routing и обязательные toll_matching/toll_pricing внутри special_options. Fastest-only ветка: та же последовательность/Promise.allSettled, те же планы, критерии выбора, число fetch, тарифы. V2 без аргумента неизменён; обходные probes V2 не расширять. Метрики агрегированы по фиксированным labels без адресов/коридорных координат; не складывать пересекающиеся стадии. Проверить существующий special-options/API replay и добавить утверждения timing без новой внешней сети. Focused+fullgate+build, checkpoint/remote/readback. Это диагностика, не достигнутые10с и не устранение внешнего outage. Production/main/merge/backup не трогать.


## 24.10.2026 — special timing gap FIXED

Ранее общий special_options теперь содержит provider/routing/matching/pricing spans.16focused/880full/build PASS. Preview POST auth и10с E2E остаются UNVERIFIED; сбор диагностик не устраняет external503 и pending km.


## 24.10 — bounded outage/fallback review DONE

Донецк7URL/1origin,нетнезависимогоfallbackдляcoldqueryприfull503.Positivecacheprocess/browser5миннеполныйкаталог.RuWiki2110имёнбезкоординат;benchmarkнеактивировать.ADDRESS-AVAILABILITYblockedsource/architecture,неисправлено.Следомboundedprimarysourceintakecoordinatecitycatalog,неполнаяroadnetwork. Подробности:docs/checkpoints/2026-10-24-address-outage-fallback-review-DONE.md.


## 24.10.2026 — ADDRESS source intake: GeoNames candidate, activation BLOCKED_BY_DATA

После4поисковыхзапросов/3первичныхдокументовGeoNamesпризнанCANDIDATE_FOR_LIMITED_OFFLINE_PILOT: countryRU/UA, WGS84, geonameid/admin1…4, alternateNamesV2(ru), CC BY4.0/атрибуция. Этоещёнерезервныйактивныйпоиск: нетизмеренныхразмеров, actual coverage приоритетных полигонов/Крыма/малых поселений, проверки алиасов/гомонимов/точности, импортированногоснапшота и product gate. Имена-only RuWiki/benchmark неактивировать. OSM РФ~3.9GB/ODbL дляэтогоузкогошагаотложен. Источники/точныйnext: docs/checkpoints/2026-10-24-address-coordinate-source-intake-DONE.md. Runtime/tariffs/live0. Следом отдельный STARTED до длительного download/ETL.


## 24.10.2026 — GeoNames delivery pilot A BLOCKED_BY_ENVIRONMENT_DNS

3HEAD`RU.zip`/`UA.zip`/`alternateNamesV2.zip` → curl6, HTTP000, DNSresolve failure `download.geonames.org`; ZIP0, Content-Length unknown, B/C NOT_STARTED. Не утверждатьнедоступностьсервераисточника. Следомread-only optional module design; повторять3HEAD только при изменении сети. [Full evidence](../../docs/checkpoints/2026-10-24-address-geonames-head-DNS-BLOCKED.md). ADDRESS-AVAILABILITY не исправлено.


## 24.10.2026 — GeoNames A/B/C structural review DONE, activation BLOCKED

CIсетьустранилаdeliveryblocker;RU/UA17.7MB/SHA/CRCподтверждены.C:237006P/0invalid/duplicate,93selectedrows/7ambiguousqueries. ДНР1803/ЛНР1376/Запорожская1266/Херсонская985точек, completenessUNKNOWN;КрымполигонUNKNOWN. Pвключаетabandoned/historical;ru aliases/V2/adminlabels/independentaccuracyUNVERIFIED. Полныйкаталогнеактивирован. Evidence: checks/2026-10-24-geonames-review/README.md; nextreview93records,недownload/replay.


## 24.10.2026 — actual ru/admin data intake DONE / labelgap BLOCKED_BY_DATA

Countryaliases14.95MBполучены/10fields,1,427,089rows,invalidduplicate0;92/93cityru,77/93baseadminru(2Latin).190rurows/rawhashсохранены. Remainder52→44exactADM3/4bindings,rualiases0;новыхlabels0. ConservativeRussianscriptguardоставил19collisiongroups(2ДНРТарасовки/2Ялтывтомчисле). Runtimeничегонеактивировано. НЕповторятьтежеZIP/joins. Нужендругойпроверенныйисточникlabelsилиограниченныйreviewedsubset;coords/Crimea/coverageотдельноUNVERIFIED. Checkpoints2026-10-24-geonames-label-refinement-DATA-BLOCKED-DONE.


## 24.10.2026 — optional4citysnapshot IMPLEMENTED/DISABLED

ADDRESS-001полнаяavailabilityещёUNVERIFIED:новыйaddressCitySnapshot:falseможетподставитьтолько4reviewedlivecitySuggestionприfullfailureдо20сdeadline/expiry7дней,необщийGeoNamescatalog. Localfocused7/full894/quoteAPI/buildPASS;changedESLintPASS. LINT-001BLOCKED:whole-repo19errors/5warningsвнеизменённыхHEADblobs,configunchanged;отдельныйreviewнеподменятьPASS. PreviewUI/E2EновогомодуляNOT_RUN;автоматическинеактивировать. Evidence/checkpoint2026-10-24-city-snapshot-module-DONE-DISABLED. НетновыхPhoton/routequeries/Production.


## 24.10.2026 — LINT-001 FIXED/VERIFIED

ScopedsourceTypecommonjs+requirepolicyтолькодляexperiment.cjs,TS/ESM/out-of-scoperestrictionsпровереныnegativecases. Mixedlet/constPromiseallисправленбезмаршрутнойлогики. ПолныйESLint0errors5warnings/full895/quoteAPI/build16PASS,10CJSruntimebodiesunchanged. HistoricalFAIL19осталсявеvidence,большенетекущийблокер. AddressCitySnapshotfalse,UIreviewещёнеPASS. Checkpoint2026-10-24-eslint-baseline-DONE.
