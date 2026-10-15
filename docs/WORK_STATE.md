## CURRENT — восстановление среды, install STARTED

Remote97386e0проверен; последняялокальнаяправка/59PASSнеуспеласохраниться. [Checkpoint](checkpoints/2026-10-15-222912-environment-recovery-started.md). Установитьзависимости, восстановитьassert1265/marker, rerunfocused/fullgate. ИсторияWORK_LOG/NEXT_STEPSперенесенабезизмененияв*_HISTORY,текущиеиндексысокращены.

---

# Текущее состояние калькулятора «Из А в Б»

2026-10-15T21:25:40.813785+03:00. Ветка `fix/v3-missing-route-prices-2026-10-15`, PR14 draft/open. Последний проверенный remote `bd73f38ffe7fb53d4483c010fbd4249bf94ca435`; текущий checkpoint необходимо сохранить и read-back до следующего case.

## DONE

Этап1: **8/155** complete. Последний `zaporizhzhia-пришиб-kerch-center`: audited, parity=True, traceComplete=True. [Checkpoint](checkpoints/2026-10-15-212540-route-case.md). Всего сохранённых audited=39; rawOD=40.

[План двух этапов](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.md), [точная очередь](../experiments/nationwide-tolls/TWO_STAGE_AUDIT_PLAN.json):155+154 случая, этап2 ещё не начат.

## Проверка и перенос

IO/report **7/7 PASS**, integrity8captures/155+154PASS. Все40старыхOD имеют raw;39полныхкомплектов. Остаток — original live summary Лисичанск→Москва, offline reconstruction не подменяет его. [Handoff для нового чата](HANDOFF_TWO_STAGE_AUDIT.md). [Checkpoint проверки](checkpoints/2026-10-15-212718-recovery-integrity-pass.md).

## Проектный вопрос пользователя

15.10.2026: выполнен [анализ междорожных векторов](../experiments/nationwide-tolls/CROSS_ROAD_VECTOR_ANALYSIS_2026-10-15.md). Междорожные векторы полностью отложены пользователем21:48МСК; не реализовывать в текущей работе. [Checkpoint](checkpoints/2026-10-15-213737-cross-road-vector-analysis.md). Аудит остаётся8/155.

## IN PROGRESS — правило тарифа отправления

Прямое решение15.10.2026 21:48МСК: всяпоездка поначальнойдате/времени, без смены тарифа впути. [STARTED checkpoint](checkpoints/2026-10-15-215032-departure-policy-started.md). Реализована общаяполитика иМ11/ЗСД overrides, focused39/39PASS. [Checkpoint](checkpoints/2026-10-15-215247-departure-policy-focused-pass.md). Первый fullgate FAILED:653/656PASS,3старых ожидания перехода дня. ESLintPASS. [Ошибка](checkpoints/2026-10-15-215419-departure-fullgate-initial-failed.md). Overflowguard восстановлен; expandedfocused58/59, ещёодностароеожидание составной1265 вместоnull. [Checkpoint](checkpoints/2026-10-15-215541-departure-expanded-58-of-59.md). Затемповторитьfocused/fullgate.

## NEXT

`dnr-бахмут-kazan-center`, один --case --limit1 после remote сохранения. По [CHECKPOINT_PROTOCOL](CHECKPOINT_PROTOCOL.md): STARTED→live/raw/summary→same-date/weekend→inventory/report→checkpoint/commit/remote read-back. Каждая дорожная группа должна иметь доказанное прохождение. Не засчитывать failed/missing evidence.

## Ограничения

Unknown не бесплатный; complete replay не означает правильный тариф. М4/time,А289/exits,ЦКАДscope остаются открытыми. Ранее build656/656+quote/API/Next/types/static16PASS; сейчас source не менялся, build не повторялся. Consent routing Valhalla/OSRM/BRouter и publicGitHub подтверждён21:09МСК [здесь](checkpoints/2026-10-15-211109-consent-two-stages.md); не спрашивать повторно. Не merge/Production/Android без запроса.

[Прежняя история](WORK_STATE_HISTORY_2026-10-15_2109.md). [WORK_LOG](../experiments/nationwide-tolls/WORK_LOG.md). [DECISIONS](../experiments/nationwide-tolls/DECISIONS.md). [NEXT_STEPS](../experiments/nationwide-tolls/NEXT_STEPS.md).
