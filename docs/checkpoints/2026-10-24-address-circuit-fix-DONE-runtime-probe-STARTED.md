# DONE circuit fix / STARTED actual-runtime CI probe — 24.10.2026 МСК

Parent b54f7d8ee9b41ea6f9bf3c1d7dd40a7e290d4b97/treec5e753c13a53e1e3340d8b8186c4b7c00298c520, remotePR14head/tree совпали до исправления. Рабочая ветка прежняя, draft. [Live evidence](2026-10-24-address-preview-DONE-circuit-fix-STARTED.md) выявило ошибочную глобальную паузу после одного частичного503. Это уточнение заменяет прежнее утверждение о достаточности исходногоcooldown.

## Реализация и проверка

lib/photon-request-pool.ts: по умолчанию cooldown15с только после3 HTTP503/429 подряд без успешногоответа; весь streak должен укладываться в15сотпервогоотказа, не просто иметьсоседниепромежутки<15с. Любой успешный неотменённый upstreamresponse сбрасывает streak и уже открытуюпаузу, в том числе поздний параллельныйsuccess. Чтение собственногоpoolcache не является новым upstreamhealthproof. Concurrency2/queue64/LRU/singleflight/subscriberabort/budget20ссохранены. ОтдельныйfailureThresholdoption вlibraryдляконтрактов;productiondefault3.

scripts/photon-request-pool.test.ts:3 новых regressioncases (partial503→следующийcoldcity, позднийsuccessснимаетоткрытуюпаузу, полное15сокнострика). Старыйfull503/429тест теперьдоказываетthreshold3, cachecircuitcaseexplicitthreshold1дляизоляцииcachecontract. scripts/address-search-endpoint.test.ts:больше не ожидаетблокировкиновогоадресапослеpartial503. Сочиpartial200→новыйЛуганск200/ЛНР, затемотдельныйПолныйОтказтрисерийных503→502/cooldown,<=4networkfetchприconcurrency2. Retryвcooldown0extra/cacheDonetsk200сохранены. СценарийA/B/очисткииприоритеты неослаблены.

Финальные focused16/16,full867/867,0fail/skip,quote/APIcontractsPASS;ESLint3filesexit0;Nextwebpack+TypeScript/static16/16exit0. Логи/sequence/sourceSHA256в checks/2026-10-24-address-circuit-fix/verification.json. После уточненияwindowlogic focused/full/buildповторены; финальныефайлысоответствуютфинальномукоду. LiveповторисправленногоPreviewвэтомблоке0, sourceфиксвыводделаетсяпоконтрактам; исходныйlivebadPreviewостаетсяисторическимevidence.

ADDR-CIRCUIT-001:fixed-and-verifiedlocalcontracts,live-after-fixUNVERIFIED. Fullsourceoutageсохраняет502,не«адреснесуществует». External503cause/B-onlyисходнаяпричина/10сE2Eнеподтверждены. Существующиецены/границы/routeengineнеизменены. Документациямодуля,blockers,state/logобновлены. Промежуточныйcodecommit skipciприобязательномlocalgate; обычныйCIнаследующемитоговомprobecommit.

## Следующий блок STARTED — исправление живого CI пути

Добавить scripts/address-search-runtime-probe.mjs, использующий настоящий collectAddressFeatures/pool и тотже rankPhotonFeatures; максимум3queries(Ростов,Красн,Донецк), perquery20с,total≤60с, atomicprogressпослекаждойquery, rawcollectorfeatures+API-likeitems/summaryиошибки. Приполномsourcefailureпрекратитьоставшиесяqueries; неотправлятьретраи/необходитьcooldown. Missing/неправильныйрезультатнеPASS. CLIexit1дляsource/budget/checkfailure. Dependencyinjectionлишьдляofflinecontracts, defaultlivepathбезmock.

Legacy address-search-live-probe.mjs неудалять,оннужендляисторическихконтрактов. В .github/workflows/special-territory-policy.yml заменитьтолькоPhotonstepновымruntimeprobeи добавитьдваartifactpaths. Число/маршрутыдругихlivecorpusнеувеличиватьине запускатьихвручную. Тестывремени/timeout/progress/sourcefailure/проверкигородовобязательны,затемfullgate/build,checkpoint/readback. Этоработающийharnessприexternaloutage,необещаниепрошедшегоliveprobe. ПослеготовогоautomaticPreviewновогокодадальнейшийliveпроверятьотдельно,невыдаватьстарые200заисправленныйcode.

Продолжитьэтотблоквтомжесеансепослеdurablereadback. Production/main/merge/Android/backupнетронуты. Припотересеансапродолжатьсготовыхлогов/новогомодуля,неповторятьстарыйsmokeбезматериальногоотличия.
