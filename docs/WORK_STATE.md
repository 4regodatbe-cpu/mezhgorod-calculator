# Калькулятор: повторный запуск автоматической очереди

16.10.2026. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft. Parent0314a335; новыйheadподтверждаетсяreadback. Текущийaudit **27/155** и **0/154**. Части1–3DONE; часть4INPROGRESS, следующий **kherson-геническ-kazan-center**.

ПервыйGitHubrun38824450386 прошёлgate666, но остановилсянапробелевахжурнала доcase. Причинаисправлена, focused15PASS; новыйfullbuild **667/667** + quote/API/Next/TypeScript/static16/16PASS; lint2/diffPASS. [Ready checkpoint](checkpoints/2026-10-16-automatic-queue-log-fix-ready.md), [полныйjoblog](checkpoints/evidence/2026-10-16-auto-queue-first-job.json).

**STARTED rerun job116728494584**,actualstatusещёпроверить. [.github/workflows/nationwide-audit-queue.yml](../.github/workflows/nationwide-audit-queue.yml), [runner](../experiments/nationwide-tolls/scripts/automatic-audit-queue.mjs). Послестарта актуальный AUTO_QUEUE_STATE/этотhandoffобновляетworker. Не писатьпараллельно, покаjobactive; каждоеcase STARTED→live/replay→report/inventory→DONE/FAILED→commitpush→headreadback.

[План20частей](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json), [продолжение](../experiments/nationwide-tolls/AUTOMATIC_CONTINUATION.md). Задачаавтопродолжениясуществует,temporarilypausedпокаrepair; послеverifiedactive/DONEвозобновить. ПослеAUDIT_QUEUE_DONEчасти19(исправления) и20(финальныепроверки) выполнитьотдельно. Auditedневнешнееподтверждениецены;unknownне0,subtotalнеполныйитог. Правилотарифаотправления;междорожныевекторыотложены. No main/merge/Production/Android. GitHub/routingразрешениядействуют.

[Protocol](CHECKPOINT_PROTOCOL.md),[WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md),[DECISIONS](../experiments/nationwide-tolls/DECISIONS.md).
