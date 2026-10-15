# Текущее состояние калькулятора «Из А в Б»

2026-10-15T21:16:52.624666+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft/open. Последний проверенный remote `846fb8b98e03832aed96349ac190a49c2b16401c`; текущий checkpoint необходимо сохранить и read-back до следующего case.

## DONE

Этап1: **2/155** complete. Последний `zaporizhzhia-гуляйполе-moscow-center`: audited, parity=True, traceComplete=True. [Checkpoint](checkpoints/2026-10-15-211652-route-case.md). Всего сохранённых audited=33; rawOD=34.

[План двух этапов](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.md), [точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json):155+154 случая, этап2 ещё не начат.

## NEXT

`zaporizhzhia-гуляйполе-saint-petersburg-center`, один --case --limit1 после remote сохранения. По [CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md): STARTED→live/raw/summary→same-date/weekend→inventory/report→checkpoint/commit/remote read-back. Каждая дорожная группа должна иметь доказанное прохождение. Не засчитывать failed/missing evidence.

## Ограничения

Unknown не бесплатный; complete replay не означает правильный тариф. М4/time,А289/exits,ЦКАДscope остаются открытыми. Ранее build656/656+quote/API/Next/types/static16PASS; сейчас source не менялся, build не повторялся. Consent routing Valhalla/OSRM/BRouter и publicGitHub подтверждён21:09МСК [здесь](checkpoints/2026-10-15-211109-consent-two-stages.md); не спрашивать повторно. Не merge/Production/Android без запроса.

[Прежняя история](WORK_STATE_HISTORY_2026-10-15_2109.md). [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md). [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md).
