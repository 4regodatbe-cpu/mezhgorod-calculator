# Калькулятор «Из А в Б»: текущая передача

2026-10-16T02:27:39.685785+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14draft. Проверенный remote parent `7af4d8eb507ac5cfb8d644dc0642346ff04ac7a8`, следующий head подтверждается readback.

DONE: части1–3; runner limit1/PHASE/WAIT15s, fullbuild661/661+quote/API/Next/TypeScript/static16/16PASS, lint3/diffPASS. [Сборка](checkpoints/2026-10-16-small-parts-02-build-pass.md). Расчётные исходники с тех пор не менялись.

Stage1 **27/155**, stage2 **0/154** по читаемымraw/live/same/weekend+parity+replayIntegrity, а не старому status corpus. Последний case **kherson-аскания-нова-saint-petersburg-center**: audited,batch exit0. [Checkpoint](checkpoints/2026-10-15T23-26-39-527Z-part4.md), [exact evidence](checkpoints/evidence/2026-10-15T23-26-39-527Z-part4-verified.json).

NEXT STARTED: часть4, **kherson-геническ-kazan-center**, один single-case batch --limit1; roadcase добавить --group existingGroup. Даты15/17октября09:00+03. [План JSON](../experiments/nationwide-tolls/SMALL_PARTS_PLAN.json). Следующий case запускать только после durable GitHub commit/head/tree readback этого checkpoint. STARTED входы следующего case — в этом checkpoint и frozen плане; raw/progress сохранять по ходу.

Пользователь16.10 02:12 поручил автоматически пройти все части, без команды «дальше». При failed save остановить расширение; при ошибках процессов фиксировать причину. Три подряд недоступных live — остановка сетевой серии и диагноз. Не засчитывать неизвестную цену как0, частичную какполную. Междорожныевекторы отложены; цена всей поездки по датеотправления. Не main/merge/Production/Android без запроса. GitHub/routing разрешения действуют. [Protocol](CHECKPOINT_PROTOCOL.md), [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md), [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md).

16.10.2026 STARTED: автономное последовательное исполнение через GitHubActions, по1case с durable STARTED/DONE. Входы/ограничения: checkpoints/2026-10-16-automatic-queue-started.md. Сначала tests/build/lint; далее возвращение к части4.
