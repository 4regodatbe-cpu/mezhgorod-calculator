# Калькулятор «Из А в Б»: часть19, исправления

19B **fullgate676/676 + quote/API/Next/TS/static16/16PASS**, scopedlint5/diffPASS. [Gate checkpoint / STARTED Moscow→Taman offline replay](checkpoints/2026-10-16-part19b-a289-build-pass.md). Runtime source79df66d8; no whole-engine result yet.

16.10.2026:19B connector implementation + focused **23/23PASS** saved; RED reproduced before fix. Narrow directed Slavyansk binding, existing dated385 matrix, no partial fallback. **Full gate STARTED, not yet verified; whole-engine replay pending**. [Checkpoint](checkpoints/2026-10-16-part19b-a289-connector-focused.md). Part19 continues,20 not started.

16.10.2026. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft/open. Проверенный parent59ca6ad8; headэтойзаписи проверяетсяпослепубликации. Main/merge/Production/Androidнеизменялись.

## DONE

Части1–18: **155/155 и154/154**, workflow38824450386/job116729992063 SUCCESS. ИсторическийREPORT340/340с31раннимконтролем,0повреждённыхссылок. Это воспроизводимость, не подтверждениевсехцен.

**Часть19A DONE — A289 полныйвнутреннийвектор** на длинныхмаршрутах: трирамки23→82→103/обратно, безповторов, существующаяdatedматрица800. Не нуженлокальныйконечныйгородвсейпоездки. Partial/repeated/date/M4unknownguardsсохранены. Focused20/20, **fullgate673/673** + quote/API/Next/TypeScript/static16/16, lint3/diffPASS. [Итог/checkpoint](checkpoints/2026-10-16-part19-a289-impact-done.md), [build](checkpoints/2026-10-16-part19-a289-build-pass.md).

[Impact](checkpoints/evidence/2026-10-16-part19-a289-impact.json): восстановленA289компоненту57/59затронутыхкейсов;2остаютсяunknown. Не57полныхцен. [Whole-engine replay](checkpoints/evidence/2026-10-16-part19-a289-replay-verified.json): Аскания-Нова→Казань3640/3970(15/17октября09:00МСК), обаcomplete; не новыйlive/внешняяпроверка. OriginalbaselineREPORT/live/replaysнепереписывались.

## NEXT STARTED19B

**pair-m4-a289-moscow-to-taman**, толькоодинcase: frames82→103, восточнаяпривязкаещёнеподтверждена. В обратномcase103→82тожеunknown. Проверитьactualentryнаselectedgeometry/OSRMsteps/localregisterизсуществующегоraw, затемonecausefix+regression+fullgate/replay. Не подставлять385 толькоизотсутствияРВП23. Входы/точныефайлы/recoveryв [checkpoint](checkpoints/2026-10-16-part19-a289-impact-done.md).

[Очередьнаходокчасти19](../experiments/nationwide-tolls/PART19_FINDINGS_QUEUE.json), [20частей](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Остальныекатегорииещёнеразобраны,25m4_crossing_profile_changesизстарыхcapturesневыдаватьзановыеошибки,нуженcurrent-engineofflineповтор. **Часть19INPROGRESS,20неначата**.

Автоматическипродолжатьпоодномусохраняемомуподшагубез«дальше»; STARTEDпереддолгимшагом,DONE/FAILED+commit/GitHub/head/treeпередследующим. Unknownне0,subtotalнеитог; тарификациявсейпоездкипоотправлению;междорожныевекторыотложены. GitHub/routingconsentдействуют. [Protocol](CHECKPOINT_PROTOCOL.md),[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md).

16.10.2026:19Bdiagnosed: selectedValhallaвходитA289с03К252между23и82,рамка23>13.5км; восточныйMaryanskayafallbackневерен. STARTED directedconnectorregression/guardedbindingдо385черезсуществующуюматрицу. checkpoints/2026-10-16-part19b-a289-connector-diagnosed.md.
