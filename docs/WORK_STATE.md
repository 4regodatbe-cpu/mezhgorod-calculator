# Калькулятор «Из А в Б»: автоматическая последовательная проверка

16.10.2026. Ветка fix/v3-missing-route-prices-2026-10-15, PR14 draft/open. Parent428a9bde605f2fb7efb61275d471b6ec6f18a3a4/tree57622c62 проверен. Части1–18 DONE (155/155+154/154), часть19 IN PROGRESS, часть20 ещё не начата.

**Automatic policy queue READY, фактический новый run пока не подтверждён.** Push workflow запускает оставшиеся20/25 historicalM4profile cases, начиная Пришиб→СПб. Старый liveworkflow38824450386 завершёнSUCCESS и повторно не запускается. [Точный checkpoint/recovery](checkpoints/2026-10-16-part19-policy-queue-ready.md), [AUTO_QUEUE_STATE](../experiments/nationwide-tolls/AUTO_QUEUE_STATE.json).

## Сначала проверить GitHub, не начинать второго writer

Если workflowRun ещё null: получить актуальный список pushruns рабочейветки по workflowRunsUrl изAUTO_QUEUE_STATE, найти новыйhead/workflow и проверить jobs. При queued/in_progress — **не писать вветку**, ждать результатов. Runner послеfullbuild сохраняет actual GITHUB_RUN_ID вSTARTED и далее каждыйcase. Не путать запланированнуюактивацию с наблюдаемымзапуском.

ПриFAILED/buildfailure: точныеlogs/checkpoint, однаустановленнаяпричина, focused/fullgate, durablefix, затемвозобновитьтотжеworkflow/latestbranch послеотсутствияwriter. TIME_LIMIT — сохранённаяграница. ПриCLASS_DONE — перейти к другимнаходкамчасти19, не объявлятьчасти19/20закрытыми.

## Проверено перед активацией

**684/684 tests**, quote/API/Next/TypeScript/static16/16 PASS; focused8/8, scopedlint3/diffPASS. [Gate](checkpoints/2026-10-16-part19-policy-queue-build-pass.md), [integration](checkpoints/2026-10-16-part19-policy-runner-integration-pass.md). Послеgateизмененытолькоworkflow/records; егоselector/YAML провереныотдельно. Workflowповторяетfullbuild передwriter.

19A/19B A289 bindingfixes сохранены:57helper-only+2whole-engine cases, не59полныхтарифов. Москва↔Тамань4725/5625₽offline15/17окт09:00МСК; тарифнеподтверждён. [19B](checkpoints/2026-10-16-part19b-taman-moscow-replay.md).
HistoricalM4policy проверено5/25: первые3Москваполностьюpricedoffline,2СПбunknownЗСДприpricedM4. [Очередь/evaluations](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json).

## Постоянный порядок

Прямоеуточнениепользователя16.10.2026 10:27МСК: **послекаждогоdurablesave сразуследующийcase без«дальше»**. Одинмаршрутнамикрошаг/одинwriter, STARTED→outputs→DONE/FAILED→commit/push/head/exacttree readback до следующего. [Решение](checkpoints/2026-10-16-1030-auto-sequential-microsteps.md). Исходную309livequeue иbaselineнепереписывать.

Unknown≠0, subtotal≠полныйитог, всяпоездкапотарифуотправления; междорожныевекторыотложены. Offlinecorrectedreplay — неfreshlive, неparityсbuggylive, неоператорскоеподтверждениецен. Raw/history сохранять. GitHub/routingconsentужеесть. No main/merge/Production/Android/messages.

[Протокол](CHECKPOINT_PROTOCOL.md) · [Журнал](../experiments/nationwide-tolls/WORK_LOG.md) · [Next](../experiments/nationwide-tolls/NEXT_STEPS.md) · [План](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Автопродолжениевсех20частей остаётсявключённымдоихфактическогозавершения.
