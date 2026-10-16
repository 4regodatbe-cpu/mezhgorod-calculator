# Калькулятор «Из А в Б»: часть19, исправления

16.10.2026. Только fix/v3-missing-route-prices-2026-10-15, PR14 draft. Verified remote parent b90d630fb57c93e043aa754546773364b05bc191/tree1f5465e3. **Workflow38869309675/job116869376746 SUCCESS, активного writer нет.**

## DONE

Части1–18:155/155+154/154, frozenREPORT340/340. 19A/19B A289 binding fixes сохранены (57helper-only+2whole-routecases, не59полныхтарифов).
**19C M4profile policy25/25 DONE**, автоматический переход между всеми оставшимися20cases доказан фактическими STARTED/DONE commits и exacthead/tree readback. Root дополнительно перепроверил20rawSHA+40outputSHA, integrity/basis/M4. Полныеofflinequotes20/25;5СПб остаютсяunknownЗСД. Не25подтверждённыхцен.
[Итог/источники/NEXT](checkpoints/2026-10-16-part19-policy-25-done-m4-unpriced-started.md), [queue](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json), [run](https://github.com/4regodatbe-cpu/mezhgorod-calculator/actions/runs/38869309675).

Последний fullgate **684/684 + quote/API/Next/TypeScript/static16/16 PASS**, focused8/lint3/diffPASS; GitHubbuild такжеSUCCESS. Runtimefarelogic после79df66d8 не менялся. [Gate](checkpoints/2026-10-16-part19-policy-queue-build-pass.md).

## NEXT STARTED — 19D

Fresh session checkout restored from verifiedremote8c3d73ee/tree189a4708, PR14draft/job38869309675SUCCESS. Nootherwriter. [Recovery](checkpoints/2026-10-16-1119-fresh-checkout-recovery.md). Continue samecase two selectedValhalla paidways only; no newtariff/freeclaim.

**Точный diagnosticNEXT:** selectedГранитное→Казань raw содержиттолько2paidM4ways **1182567076/31984600**,0tollbooths; matchedCoreProducts=m4 изpaidnames, но0knownPVP. [Evidence/next](checkpoints/2026-10-16-part19d-granitnoe-kazan-paid-ways.md). Извлечь толькоэти2traceedges/shapeокно и ихtollscope, сравнитьсsavedfacilitymap/primaryOSMtagsприпотребности. Пока это legitimateunknown, не доказанныйbug/freeпроезд; sourceнеисправлятьбезследующегодоказательства.

**Первый case уже воспроизведён:** Гранитное→Казань complete2/2, но currenttotalunknown/m4, candidateCount0/confirmedPvps=[] («нетв1,5кмзонахизвестныхПВП»). Это не доказательствобесплатности/ошибкицены. Следующиймикрошагтолькоэтотcase: actualselectedraw paid-edge/booth/wayIDs/shape scope противизвестныхPVP, затемсохранитьдиагнозпередисправлением. [Checkpoint/SHA](checkpoints/2026-10-16-part19d-granitnoe-kazan-unknown-reproduced.md). Новыхцен/правоккодаещёнет.

**m4:unpriced,22случая**, не те же25policycases. Первый только dnr-гранитное-kazan-center: existing corpus.auditEvidence.capture, currentengine offline15/17окт09:00МСК, проверить actualM4reason/vector/trace. Сохранить case/checkpoint/logs/state/queue и commit/push/head/tree до следующего независимого шага. Затем исправлять одну установленную причину с focused/fullgate. Не повторять309livequeue и не подставлятьцены.
Часть19 IN PROGRESS,20 ещё не начата. Другиенахождения (ЗСД/М11/М12/прочие) ещёнеразобраны.

## Порядок

После каждого durable save сразу следующий микрошаг без«дальше», один writer. Перед записью проверить actualremote/PR и отсутствие active/queued jobs. Если AUTOstate.workflowRunnull, найти ветку в GitHubpushruns; приактивномjob **не писать**. TIME_LIMIT — сохранённаявозобновляемаяграница. Runner current-policy class уже25/25, не перезапускать его без новойпричины.

Unknown≠0, subtotal≠итог; поездкапоотправлению, междорожныевекторыотложены. Audited/replay — воспроизводимость, не свежийlive/операторскоеподтверждение. Raw/baseline/history сохранять. No main/merge/Production/Android/messages.
[Protocol](CHECKPOINT_PROTOCOL.md) · [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md) · [NEXT](../experiments/nationwide-tolls/NEXT_STEPS.md) · [План](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json).
